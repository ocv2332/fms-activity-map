import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MapView from './MapView'
import { fetchActiveTasks } from './api'

export default function MapPage() {
    const navigate = useNavigate()
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || '')
    const [tasks, setTasks] = useState([])
    const [filteredTasks, setFilteredTasks] = useState([])
    const [filterStatus, setFilterStatus] = useState('all')

    useEffect(() => { if (sessionId) localStorage.setItem('sessionId', sessionId) }, [sessionId])
    useEffect(() => { if (!sessionId) navigate('/login') }, [sessionId, navigate])


    const loadTasks = async () => {
        if (!sessionId) return
        try {
            const data = await fetchActiveTasks(sessionId)
            const optimizedTasks = optimizeTaskOrder(data.tasks || [], null)
            setTasks(optimizedTasks)
            setFilteredTasks(optimizedTasks)
        } catch (e) {
            if (e.response && (e.response.status === 401 || e.response.status === 403)) {
                localStorage.removeItem('sessionId')
                setSessionId('')
                navigate('/login')
            } else {
                console.error('Ошибка загрузки задач, но sessionId оставляем:', e)
            }
        }
    }
    useEffect(() => { loadTasks(); const i = setInterval(() => loadTasks(), 60000); return () => clearInterval(i) }, [sessionId])
    useEffect(() => { setFilteredTasks(filterStatus==='all'?tasks:tasks.filter(t=>t.status?.code===filterStatus)) }, [filterStatus,tasks])

    return (
        <div className="h-screen w-screen relative">
            {/* Карта на весь экран */}
            <MapView tasks={filteredTasks} fullScreen />

            {/* Кнопка обновления задач, всегда поверх карты */}
            <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
                <button
                    onClick={loadTasks}
                    className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
                >
                    Обновить задачи
                </button>
            </div>

            {/* Фильтр по статусу задач, всегда поверх карты */}
            <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded shadow pointer-events-auto space-x-2">
                <label>Фильтр по статусу: </label>
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="border p-1 rounded"
                >
                    <option value="all">Все</option>
                    <option value="assigned">Назначена</option>
                    <option value="completed">Выполнена</option>
                    <option value="cancelled">Отменена</option>
                </select>
            </div>
        </div>
    )


    function optimizeTaskOrder(tasks, userPos) {
        if (!tasks.length) return []
        const remaining = [...tasks], ordered = []
        let currentPos = userPos || [55.751244, 37.618423]
        while(remaining.length){
            remaining.sort((a,b)=>{
                const prio=(b.priority==='High'?2:b.priority==='Medium'?1:0)-(a.priority==='High'?2:a.priority==='Medium'?1:0)
                const da=a.car?.coordinates?distance(currentPos,[a.car.coordinates.lat,a.car.coordinates.lon]):Infinity
                const db=b.car?.coordinates?distance(currentPos,[b.car.coordinates.lat,b.car.coordinates.lon]):Infinity
                return prio||da-db
            })
            const next=remaining.shift()
            ordered.push(next)
            currentPos=next.car?.coordinates?[next.car.coordinates.lat,next.car.coordinates.lon]:currentPos
        }
        return ordered
    }function distance([lat1,lon1],[lat2,lon2]){const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180,a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2,c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));return R*c}}