import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'

// Цвета по типу задачи
const typeColors = {
    TRANSFER_FOR_PASTING: 'red',
    ANOTHER_TYPE: 'blue',
    DEFAULT: 'green'
}

const getColorByType = (task) => typeColors[task.taskType?.code] || typeColors.DEFAULT

// Создание цветного кружка для маркера
function createColoredIcon(color) {
    return L.divIcon({
        html: `<div style="
        background-color:${color};
        width:20px;
        height:20px;
        border-radius:50%;
        border:2px solid white;
      "></div>`,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    })
}

// Компонент для перемещения карты к позиции пользователя
function Recenter({ lat, lng }) {
    const map = useMap()
    useEffect(() => {
        if (lat && lng) map.setView([lat, lng], map.getZoom())
    }, [lat, lng, map])
    return null
}

export default function MapView({ tasks }) {
    const [userPos, setUserPos] = useState(null)

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
                (err) => console.warn('Geolocation error:', err)
            )
        }
    }, [])

    // Находим координаты задачи
    function findCoordinatesInTask(task) {
        if (!task) return null
        const candidates = [
            ['lat', 'lon'],
            ['lat', 'lng'],
            ['latitude', 'longitude'],
            ['location_lat', 'location_lng'],
            ['car', 'coordinates']
        ]
        for (const [a, b] of candidates) {
            if (task[a] != null && task[b] != null) {
                const la = parseFloat(task[a])
                const lo = parseFloat(task[b])
                if (!Number.isNaN(la) && !Number.isNaN(lo)) return [la, lo]
            }
            // Проверка внутри car.coordinates
            if (task.car?.coordinates?.lat && task.car?.coordinates?.lon) {
                return [task.car.coordinates.lat, task.car.coordinates.lon]
            }
        }
        return null
    }

    const markers = tasks
        .map((t, idx) => ({ task: t, coords: findCoordinatesInTask(t), idx }))
        .filter(m => m.coords)

    const center = markers.length ? markers[0].coords : [55.751244, 37.618423]

    return (
        <div className="h-screen w-screen relative">
            <MapContainer center={center} zoom={11} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Маркеры задач */}
                {markers.map(m => (
                    <Marker
                        key={m.idx}
                        position={m.coords}
                        icon={createColoredIcon(getColorByType(m.task))}
                    >
                        <Popup>
                            <div>
                                <strong>{m.task.car?.number || 'Задача #' + (m.idx + 1)}</strong>
                                <div>Статус: {m.task.status?.displayName}</div>
                                <div>Тип: {m.task.taskType?.displayName}</div>
                                <button
                                    className="mt-1 px-2 py-1 bg-green-600 text-white rounded"
                                    onClick={() => {
                                        if (!userPos) {
                                            alert('Не удалось определить вашу позицию. Разрешите доступ к геолокации.')
                                            return
                                        }
                                        const [userLat, userLon] = userPos
                                        const [destLat, destLon] = m.coords
                                        const url = `https://yandex.ru/maps/?mode=routes&rtt=auto&rtext=${userLat},${userLon}~${destLat},${destLon}`
                                        window.open(url, '_blank')
                                    }}
                                >
                                    Построить маршрут
                                </button>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Позиция пользователя */}
                {userPos && (
                    <>
                        <CircleMarker center={userPos} radius={10} color="blue">
                        </CircleMarker>
                        <Recenter lat={userPos[0]} lng={userPos[1]} />
                    </>
                )}
            </MapContainer>

            {/* Кнопка обновления задач */}
            <div className="absolute top-4 right-4 z-[1000] pointer-events-auto">
                <button
                    className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
                    onClick={() => window.dispatchEvent(new Event('updateTasks'))}
                >
                    Обновить задачи
                </button>
            </div>

            {/* Фильтр задач (можно добавить по статусу/типу) */}
            {/* <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded shadow pointer-events-auto space-x-2">
        <label>Фильтр:</label>
      </div> */}
        </div>
    )
}
