const CHAVE_SESSAO = 'car-wash-usuario-autenticado'
const CHAVE_USUARIO = 'car-wash-usuario-atual'

export const usuariosMock = [
  {
    nome: 'admin',
    email: 'admin@carwash.com',
    senha: 'admin123',
    telefone: '(41) 99999-0000',
    perfil: 'admin'
  },
  {
    nome: 'caue',
    email: 'usuario@carwash.com',
    senha: 'usuario123',
    telefone: '(41) 98888-0000',
    perfil: 'normal'
  }
]

export const usuarioAutenticado = () => {
  return sessionStorage.getItem(CHAVE_SESSAO) === 'true'
}

export const autenticarUsuarioMock = (email, senha) => {
  const usuario = usuariosMock.find(
    (item) => item.email === email && item.senha === senha
  )

  if (!usuario) {
    return null
  }

  sessionStorage.setItem(CHAVE_SESSAO, 'true')
  sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify({
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    perfil: usuario.perfil
  }))
  window.dispatchEvent(new Event('auth-change'))
  return usuario
}

export const usuarioAtual = () => {
  const usuario = sessionStorage.getItem(CHAVE_USUARIO)
  return usuario ? JSON.parse(usuario) : null
}

export const atualizarUsuarioMock = (dadosAtualizados) => {
  const usuarioSessao = usuarioAtual()
  if (!usuarioSessao) return null

  const usuario = usuariosMock.find((item) => item.email === usuarioSessao.email)
  if (!usuario) return null

  Object.assign(usuario, dadosAtualizados)
  sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify({
    nome: usuario.nome,
    email: usuario.email,
    telefone: usuario.telefone,
    perfil: usuario.perfil
  }))
  window.dispatchEvent(new Event('auth-change'))
  return usuarioAtual()
}

export const administradorAutenticado = () => {
  return usuarioAutenticado() && usuarioAtual()?.perfil === 'admin'
}

export const encerrarSessao = () => {
  sessionStorage.removeItem(CHAVE_SESSAO)
  sessionStorage.removeItem(CHAVE_USUARIO)
  window.dispatchEvent(new Event('auth-change'))
}
