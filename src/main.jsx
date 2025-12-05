import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import LoginPage from './LoginPage'
import MapPage from './MapPage'
import './index.css'
import 'leaflet/dist/leaflet.css'

const root = createRoot(document.getElementById('root'))
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="*" element={<Navigate to={localStorage.getItem('sessionId') ? '/map' : '/login'} />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)