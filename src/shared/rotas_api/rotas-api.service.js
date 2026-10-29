import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Accept': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const ehRotaAdministrativa = config.url?.startsWith('/api/admin/')
  const chaveToken = ehRotaAdministrativa
    ? 'car-wash-token-admin'
    : 'car-wash-token-cliente'
  const token = sessionStorage.getItem(chaveToken) ||
    sessionStorage.getItem('car-wash-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const fazerLogin = async (email, password) => {
  const { data } = await api.post('/api/auth/login', { email, password })
  return data
}

export const fazerLoginAdmin = async (email, password) => {
  const { data } = await api.post('/api/admin/login', { email, password })
  return data
}

export const fazerLogout = async () => {
  const { data } = await api.post('/api/auth/logout')
  return data
}

export const fazerLogoutAdmin = async () => {
  const { data } = await api.post('/api/admin/logout')
  return data
}

export const obterClienteAutenticado = async () => {
  const { data } = await api.get('/api/auth/me')
  return data
}

export const obterAdministradorAutenticado = async () => {
  const { data } = await api.get('/api/admin/me')
  return data
}

export const listarEnderecos = async () => {
  const { data } = await api.get('/api/enderecos')
  return data
}

export const criarEndereco = async (dadosEndereco) => {
  const { data } = await api.post('/api/enderecos', dadosEndereco)
  return data
}

export const obterEndereco = async (id) => {
  const { data } = await api.get(`/api/enderecos/${id}`)
  return data
}

export const atualizarEndereco = async (id, dadosEndereco) => {
  const { data } = await api.put(`/api/enderecos/${id}`, dadosEndereco)
  return data
}

export const removerEndereco = async (id) => {
  await api.delete(`/api/enderecos/${id}`)
}

export const cadastrarUsuario = async (dadosUsuario) => {
  const { data } = await api.post('/api/auth/register', dadosUsuario)
  return data
}

export const listarServicos = async () => {
  const { data } = await api.get('/api/servicos')
  return data
}

export const criarAgenda = async (dadosAgendamento) => {
  const { data } = await api.post('/api/agendamentos', dadosAgendamento)
  return data
}

export const listarAgendamentosCliente = async () => {
  const { data } = await api.get('/api/agendamentos')
  return data
}

export const obterAgendamentoCliente = async (id) => {
  const { data } = await api.get(`/api/agendamentos/${id}`)
  return data
}

export const cancelarAgendamentoCliente = async (id) => {
  const { data } = await api.patch(`/api/agendamentos/${id}/cancelar`)
  return data
}

export const listarDiasDisponiveis = async (mes, servicoId) => {
  const { data } = await api.get('/api/disponibilidade/dias', {
    params: { mes, servico_id: servicoId }
  })
  return data
}

export const listarHorariosDisponiveis = async (data, servicoId) => {
  const resposta = await api.get('/api/disponibilidade', {
    params: { data, servico_id: servicoId }
  })
  return resposta.data
}

export const listarJanelasAdmin = async (filtros = {}) => {
  const { data } = await api.get('/api/admin/disponibilidades', { params: filtros })
  return data
}

export const criarJanelaAdmin = async (dados) => {
  const { data } = await api.post('/api/admin/disponibilidades', dados)
  return data
}

export const obterJanelaAdmin = async (id) => {
  const { data } = await api.get(`/api/admin/disponibilidades/${id}`)
  return data
}

export const atualizarJanelaAdmin = async (id, dados) => {
  const { data } = await api.put(`/api/admin/disponibilidades/${id}`, dados)
  return data
}

export const removerJanelaAdmin = async (id) => {
  await api.delete(`/api/admin/disponibilidades/${id}`)
}

export const criarJanelasEmLoteAdmin = async (dados) => {
  const { data } = await api.post('/api/admin/disponibilidades/lote', dados)
  return data
}

export const listarAgendamentosAdmin = async (filtros = {}) => {
  const { data } = await api.get('/api/admin/agendamentos', { params: filtros })
  return data
}

export const obterAgendamentoAdmin = async (id) => {
  const { data } = await api.get(`/api/admin/agendamentos/${id}`)
  return data
}

export const atualizarAgendamentoAdmin = async (id, dados) => {
  const { data } = await api.patch(`/api/admin/agendamentos/${id}`, dados)
  return data
}

export const baixarAnexo = async (url) => {
  const { data } = await axios.get(url, { responseType: 'blob' })
  return data
}
