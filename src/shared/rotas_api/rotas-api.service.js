import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('car-wash-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const fazerLogin = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password })
  return data
}

export const fazerLogout = async () => {
  const { data } = await api.post('/api/auth/logout')
  return data
}

export const listarServicos = async () => {
  const { data } = await api.get('/api/servicos')
  return data
}

export const criarAgendamento = async (dadosAgendamento) => {
  const { data } = await api.post('/api/agendamentos', dadosAgendamento)
  return data
}
