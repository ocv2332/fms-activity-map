import React, { useEffect, useState } from 'react'
import { fetchActiveTasks, sendPhone, sendCode } from './api'
import MapView from './MapView'


export default function App() {
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || '')
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(sessionId ? 'done' : 'phone')
    const [error, setError] = useState(null)

    useEffect(() => {
        if (sessionId) localStorage.setItem('sessionId', sessionId)
    }, [sessionId])

    const onSendPhone = async () => {
        setError(null)
        try {
            await sendPhone(phone)
            setStep('sms')
        } catch (e) {
            console.error(e)
            setError('Не удалось отправить телефон. Проверь формат и сеть.')
        }
    }

    const onSendCode = async () => {
        setError(null)
        try {
            const data = await sendCode(phone, code)
            if (data.session_id) {
                setSessionId(data.session_id)
                setStep('done')
            } else if (data.hash && data.user && data.user.user_id) {
                setError('Сервер вернул hash/user, но не session_id — требуется дополнительный обмен.')
            } else {
                setError('Сервер не вернул session_id')
            }
        } catch (e) {
            console.error(e)
            setError('Не удалось подтвердить код. Проверьте код и повторите.')
        }
    }

    const loadTasks = async () => {
        if (!sessionId) return
        setLoading(true)
        setError(null)
        try {
            const data = await fetchActiveTasks(sessionId, 1, 100)
            setTasks(data.tasks || [])
        } catch (e) {
            console.error(e)
            setError('Ошибка при загрузке задач (проверь SessionId / CORS).')
        }
        setLoading(false)
    }

    const logout = () => {
        localStorage.removeItem('sessionId')
        setSessionId('')
        setTasks([])
        setStep('phone')
    }

    useEffect(() => {
        if (step === 'done') loadTasks()
    }, [step, sessionId])

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Active Tasks Map</h1>

            {!sessionId && (
                <div className="mb-4 p-4 border rounded-lg">
                    {step === 'phone' && (
                        <div className="space-y-2">
                            <label className="block text-sm">Номер телефона (пример: 79199956660)</label>
                            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-2 border rounded" />
                            <button onClick={onSendPhone} className="mt-2 px-4 py-2 rounded bg-black text-white">Получить СМС</button>
                        </div>
                    )}

                    {step === 'sms' && (
                        <div className="space-y-2">
                            <label className="block text-sm">Код из СМС</label>
                            <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full p-2 border rounded" />
                            <button onClick={onSendCode} className="mt-2 px-4 py-2 rounded bg-black text-white">Войти</button>
                        </div>
                    )}

                    {error && <div className="mt-2 text-red-600">{error}</div>}
                </div>
            )}

            {sessionId && (
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <div className="text-sm">SessionId: <span className="font-mono break-all">{sessionId}</span></div>
                        <div className="text-xs text-gray-500">Сохранён в localStorage</div>
                    </div>
                    <div className="space-x-2">
                        <button onClick={loadTasks} className="px-3 py-1 rounded bg-slate-700 text-white">Обновить задачи</button>
                        <button onClick={logout} className="px-3 py-1 rounded border">Выйти</button>
                    </div>
                </div>
            )}

            {loading && <div className="mb-4">Загрузка задач...</div>}

            <div className="mb-6">
                <MapView tasks={tasks} />
            </div>

            <div>
                <h2 className="text-lg font-semibold mb-2">Список задач</h2>
                {tasks.length === 0 && <div className="text-sm text-gray-500">Пусто</div>}
                <div className="space-y-3">
                    {tasks.map((t, i) => (
                        <div key={i} className="p-3 border rounded">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium">Задача #{i + 1}</div>
                                    <div className="text-xs text-gray-500">id: {t.id || t.task_id || t._id || '—'}</div>
                                </div>
                            </div>
                            <pre className="mt-2 text-sm whitespace-pre-wrap">{JSON.stringify(t, null, 2)}</pre>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}