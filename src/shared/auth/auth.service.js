import {
  cadastrarUsuario as cadastrarUsuarioApi,
  fazerLogin,
  fazerLoginAdmin,
  fazerLogout,
  fazerLogoutAdmin,
  obterClienteAutenticado,
  obterAdministradorAutenticado
} from '../rotas_api/rotas-api.service'

const CHAVE_TOKEN = 'car-wash-token'
const CHAVE_USUARIO = 'car-wash-usuario-atual'
const CHAVE_USUARIOS_CADASTRADOS = 'car-wash-usuarios-cadastrados'
const CHAVE_MODO_ADMINISTRADOR = 'car-wash-modo-administrador'

const limparSessao = () => {
  sessionStorage.removeItem(CHAVE_TOKEN)
  sessionStorage.removeItem(CHAVE_USUARIO)
  sessionStorage.removeItem(CHAVE_MODO_ADMINISTRADOR)
}

export const usuarioAutenticado = () => {
  return Boolean(sessionStorage.getItem(CHAVE_TOKEN))
}

export const autenticarUsuario = async (email, senha) => {
  let resposta

  try {
    resposta = await fazerLogin(email, senha)
  } catch (erroCliente) {
    try {
      resposta = await fazerLoginAdmin(email, senha)
    } catch {
      throw erroCliente
    }

    if (!resposta?.token || !resposta?.usuario || resposta.usuario.perfil !== 'admin') {
      throw erroCliente
    }

    const administrador = {
      nome: resposta.usuario.nome || '',
      email: resposta.usuario.email || email,
      telefone: resposta.usuario.telefone || '',
      perfil: resposta.usuario.perfil
    }

    sessionStorage.setItem(CHAVE_TOKEN, resposta.token)
    sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(administrador))
    sessionStorage.setItem(CHAVE_MODO_ADMINISTRADOR, 'true')
    window.dispatchEvent(new Event('auth-change'))
    return administrador
  }

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
  if (usuario.perfil === 'admin') {
    sessionStorage.setItem(CHAVE_MODO_ADMINISTRADOR, 'true')
  } else {
    sessionStorage.removeItem(CHAVE_MODO_ADMINISTRADOR)
  }
  window.dispatchEvent(new Event('auth-change'))
  return usuario
}

export const autenticarAdministrador = async (email, senha) => {
  const resposta = await fazerLoginAdmin(email, senha)

  if (!resposta?.token || !resposta?.usuario || resposta.usuario.perfil !== 'admin') {
    throw new Error('A resposta de login administrativo não contém os dados esperados.')
  }

  const usuario = {
    nome: resposta.usuario.nome || '',
    email: resposta.usuario.email || email,
    telefone: resposta.usuario.telefone || '',
    perfil: resposta.usuario.perfil
  }

  sessionStorage.setItem(CHAVE_TOKEN, resposta.token)
  sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario))
  sessionStorage.setItem(CHAVE_MODO_ADMINISTRADOR, 'true')
  window.dispatchEvent(new Event('auth-change'))
  return usuario
}

export const usuarioAtual = () => {
  const usuario = sessionStorage.getItem(CHAVE_USUARIO)
  return usuario ? JSON.parse(usuario) : null
}

export const restaurarSessao = async () => {
  if (!usuarioAutenticado()) {
    return null
  }

  const admin = modoAdministradorAtivo() || usuarioAtual()?.perfil === 'admin'
  const resposta = admin
    ? await obterAdministradorAutenticado()
    : await obterClienteAutenticado()
  const usuario = admin
    ? {
        nome: resposta.nome || '',
        email: resposta.email || '',
        telefone: resposta.telefone || '',
        perfil: resposta.perfil
      }
    : {
        nome: resposta.nome || '',
        email: resposta.email || '',
        telefone: resposta.telefone || '',
        perfil: resposta.perfil || ''
      }

  if (admin && usuario.perfil !== 'admin') {
    throw new Error('A API não confirmou o perfil administrativo.')
  }

  sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario))
  if (admin) {
    sessionStorage.setItem(CHAVE_MODO_ADMINISTRADOR, 'true')
  } else {
    sessionStorage.removeItem(CHAVE_MODO_ADMINISTRADOR)
  }
  window.dispatchEvent(new Event('auth-change'))
  return usuario
}

export const cadastrarUsuario = async (dadosUsuario) => {
  const resposta = await cadastrarUsuarioApi(dadosUsuario)

  if (!resposta?.token || !resposta?.cliente) {
    throw new Error('A resposta de cadastro não contém os dados esperados.')
  }

  sessionStorage.removeItem(CHAVE_MODO_ADMINISTRADOR)

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

export const modoAdministradorAtivo = () => {
  return sessionStorage.getItem(CHAVE_MODO_ADMINISTRADOR) === 'true'
}

export const encerrarSessao = async () => {
  try {
    if (usuarioAutenticado()) {
      if (modoAdministradorAtivo()) {
        await fazerLogoutAdmin()
      } else {
        await fazerLogout()
      }
    }
  } finally {
    limparSessao()
    window.dispatchEvent(new Event('auth-change'))
  }
}
