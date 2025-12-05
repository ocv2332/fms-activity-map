import axios from 'axios'

const API = axios.create({
    baseURL: '/fms/api/v1',
    timeout: 10000,
})

export const fetchActiveTasks = async (sessionId, page = 1, count = 100) => {
    const headers = { SessionId: sessionId }
    const res = await API.get(`/contractors/my-tasks/active?page=${page}&count=${count}`, { headers })
    return res.data
}

export const sendPhone = async (phone) => {
    const res = await axios.post('/api/signup?version=22', {
        phone,
        os: 'ios',
        vendor_id: 'iOS',
        phone_code: '7'
    }, { headers: { 'Content-Type': 'application/json' }})

    const data = res.data

    if (data.step === 'push' && data.req_url) {
        window.open(data.req_url, '_blank')
        return { ...data, step: 'sms' }
    }

    return data
}
export const sendCode = async (phone, code) => {
    return axios.post('/api/signup/code?version=22', {
        phone,
        code,
        phone_code: '7',
    }, { headers: { 'Content-Type': 'application/json' }})
        .then(r => r.data)
}