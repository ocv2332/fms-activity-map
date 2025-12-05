import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sendPhone, sendCode } from './api'

export default function LoginPage() {
    const [phone, setPhone] = useState('')
    const [code, setCode] = useState('')
    const [step, setStep] = useState('phone')
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const onSendPhone = async () => {
        setError(null)
        try {
            const data = await sendPhone(phone)
            setStep(data.step) // теперь step станет 'sms' после открытия CAPTCHA
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
                localStorage.setItem('sessionId', data.session_id)
                navigate('/map')
            } else {
                setError('Не удалось получить sessionId')
            }
        } catch (e) {
            console.error(e)
            setError('Не удалось подтвердить код.')
        }
    }

    return (
        <div className="flex items-center justify-center h-screen bg-gradient-to-r from-indigo-500 to-purple-600">
            <div className="bg-white p-8 rounded-xl shadow-xl w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-indigo-700">CityDrive Login</h1>

                {step === 'phone' && (
                    <div className="space-y-4">
                        <input type="text" placeholder="Номер телефона" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        <button onClick={onSendPhone} className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700">Получить SMS</button>
                    </div>
                )}

                {step === 'sms' && (
                    <div className="space-y-4">
                        <input type="text" placeholder="Код из SMS" value={code} onChange={e => setCode(e.target.value)} className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        <button onClick={onSendCode} className="w-full bg-indigo-600 text-white p-3 rounded hover:bg-indigo-700">Войти</button>
                    </div>
                )}

                {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
            </div>
        </div>
    )
}