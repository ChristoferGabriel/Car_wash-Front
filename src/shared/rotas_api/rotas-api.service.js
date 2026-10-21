import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json'
  }
})

export const listarServicos = async () => {
  const { data } = await api.get('/api/servicos')
  return data
}

export const criarAgendamento = async (dadosAgendamento) => {
  const { data } = await api.post('/api/agendamentos', dadosAgendamento)
  return data
}
