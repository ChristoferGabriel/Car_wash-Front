import {
  cadastrarUsuario as cadastrarUsuarioApi,
  fazerLogin,
  fazerLogout
} from '../rotas_api/rotas-api.service'

const CHAVE_TOKEN = 'car-wash-token'
const CHAVE_USUARIO = 'car-wash-usuario-atual'
const CHAVE_USUARIOS_CADASTRADOS = 'car-wash-usuarios-cadastrados'

export const usuarioAutenticado = () => {
  return Boolean(sessionStorage.getItem(CHAVE_TOKEN))
}

export const autenticarUsuario = async (email, senha) => {
  const resposta = await fazerLogin(email, senha)

  if (!resposta?.token) {
    throw new Error('A resposta de login não contém um token.')
  }

  const usuario = {
    nome: resposta.cliente?.nome || '',
    email: resposta.cliente?.email || email,
    telefone: resposta.cliente?.telefone || '',
    perfil: resposta.cliente?.perfil || ''
  }

  sessionStorage.setItem(CHAVE_TOKEN, resposta.token)
  sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario))
  window.dispatchEvent(new Event('auth-change'))
  return usuario
}

export const usuarioAtual = () => {
  const usuario = sessionStorage.getItem(CHAVE_USUARIO)
  return usuario ? JSON.parse(usuario) : null
}

export const cadastrarUsuario = async (dadosUsuario) => {
  const resposta = await cadastrarUsuarioApi(dadosUsuario)

  if (!resposta?.token || !resposta?.cliente) {
    throw new Error('A resposta de cadastro não contém os dados esperados.')
  }

  return {
    nome: resposta.cliente.nome,
    email: resposta.cliente.email,
    telefone: resposta.cliente.telefone,
    perfil: 'usuario'
  }
}

export const atualizarUsuarioMock = (dadosUsuario) => {
  const usuarioAnterior = usuarioAtual()
  const usuarioAtualizado = {
    ...usuarioAnterior,
    ...dadosUsuario,
    perfil: usuarioAnterior?.perfil || 'admin'
  }

  sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuarioAtualizado))

  const usuarios = JSON.parse(
    localStorage.getItem(CHAVE_USUARIOS_CADASTRADOS) || '[]'
  )
  const usuariosAtualizados = usuarios.map((usuario) =>
    usuario.email === usuarioAnterior?.email
      ? { ...usuario, ...dadosUsuario }
      : usuario
  )
  localStorage.setItem(
    CHAVE_USUARIOS_CADASTRADOS,
    JSON.stringify(usuariosAtualizados)
  )
  window.dispatchEvent(new Event('auth-change'))
  return usuarioAtualizado
}

export const administradorAutenticado = () => {
  return usuarioAutenticado() && usuarioAtual()?.perfil === 'admin'
}

export const encerrarSessao = async () => {
  try {
    if (usuarioAutenticado()) {
      await fazerLogout()
    }
  } finally {
    sessionStorage.removeItem(CHAVE_TOKEN)
    sessionStorage.removeItem(CHAVE_USUARIO)
    window.dispatchEvent(new Event('auth-change'))
  }
}
