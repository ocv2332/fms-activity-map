import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'

// Leaflet иконки
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

// Компонент для смены центра карты на позицию пользователя
function Recenter({ lat, lng }) {
    const map = useMap()
    useEffect(() => {
        map.setView([lat, lng], map.getZoom())
    }, [lat, lng])
    return null
}

// Генерация цвета маркера по типу задачи
function colorByTaskType(taskTypeCode) {
    const colors = {
        TRANSFER_FOR_PASTING: 'orange',
        INSPECTION: 'green',
        DEFAULT: 'red'
    }
    return colors[taskTypeCode] || colors.DEFAULT
}

// Получаем координаты из объекта задачи
function getTaskCoords(task) {
    if (task.car?.coordinates) {
        return [task.car.coordinates.lat, task.car.coordinates.lon]
    }
    return null
}

export default function MapView({ tasks }) {
    const [userPos, setUserPos] = useState(null)

    // Геолокация пользователя
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserPos([pos.coords.latitude, pos.coords.longitude])
                },
                (err) => {
                    console.warn('Ошибка геолокации', err)
                },
                { enableHighAccuracy: true }
            )
        }
    }, [])

    const markers = tasks
        .map((t, idx) => ({ task: t, coords: getTaskCoords(t), idx }))
        .filter(m => m.coords)

    const center = markers.length ? markers[0].coords : userPos || [55.751244, 37.618423]

    return (
        <MapContainer center={center} zoom={11} className="leaflet-container">
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {userPos && (
                <>
                    <CircleMarker center={userPos} radius={10} color="blue">
                        <Popup>Вы находитесь здесь</Popup>
                    </CircleMarker>
                    <Recenter lat={userPos[0]} lng={userPos[1]} />
                </>
            )}

            {markers.map(m => (
                <Marker
                    key={m.idx}
                    position={m.coords}
                    icon={L.icon({
                        iconUrl,
                        iconRetinaUrl,
                        shadowUrl,
                        iconSize: [30, 30],
                        iconAnchor: [15, 15],
                        popupAnchor: [0, -15],
                        className: `marker-${m.task.taskType?.code || 'DEFAULT'}`
                    })}
                >
                    <Popup>
                        <strong>{m.task.taskType?.displayName || 'Задача'}</strong><br />
                        Машина: {m.task.car?.number || '—'} ({m.task.car?.modelName || '—'})<br />
                        Статус: {m.task.status?.displayName || '—'}<br />
                        Адрес: {m.task.destinationAddress || '—'}<br />
                        <button
                            className="mt-2 px-2 py-1 bg-blue-600 text-white rounded"
                            onClick={() => {
                                const [lat, lon] = m.coords
                                window.open(`https://yandex.ru/maps/?rtext=~${lat},${lon}`, '_blank')
                            }}
                        >
                            Построить маршрут в Яндекс.Картах
                        </button>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    )
}
