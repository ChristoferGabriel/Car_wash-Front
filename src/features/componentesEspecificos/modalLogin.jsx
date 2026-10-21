import { Botao } from "../../shared/componentes/botao"
import { useState } from "react"
import { ModalCadastro } from "./modalCadastro"
import { autenticarUsuarioMock } from "../../shared/auth/authMock.service"

const estiloCampo = {
  backgroundColor: 'var(--bs-light)',
  borderColor: 'var(--bs-primary)'
}

export const ModalLogin = ({ onClose }) => {
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [dadosLogin, setDadosLogin] = useState({ email: '', senha: '' })
  const [erroLogin, setErroLogin] = useState('')

  const atualizarCampo = (campo) => (evento) => {
    setDadosLogin((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: evento.target.value
    }))
    setErroLogin('')
  }

  const validarLogin = (evento) => {
    evento.preventDefault()

    if (!dadosLogin.email.trim() || !dadosLogin.senha) {
      setErroLogin('Informe o email e a senha para entrar.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dadosLogin.email)) {
      setErroLogin('Informe um email válido.')
      return
    }

    const usuario = autenticarUsuarioMock(dadosLogin.email.trim(), dadosLogin.senha)
    if (!usuario) {
      setErroLogin('Email ou senha inválidos.')
      return
    }

    setErroLogin('')
    onClose()
  }

  if (cadastroAberto) {
    return <ModalCadastro onClose={() => setCadastroAberto(false)} />
  }

  return (
    <>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" onClick={(evento) => evento.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Login</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Fechar"
              />
            </div>
            <div className="modal-body">
              <form onSubmit={validarLogin} noValidate>
                {erroLogin && (
                  <div className="alert alert-danger py-2" role="alert">
                    {erroLogin}
                  </div>
                )}
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control rounded-3 border-1"
                      style={estiloCampo}
                      id="email"
                      value={dadosLogin.email}
                      onChange={atualizarCampo('email')}
                      placeholder="Digite seu email"
                      autoComplete="email"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="senha" className="form-label">Senha</label>
                    <input
                      type="password"
                      className="form-control rounded-3 border-1"
                      style={estiloCampo}
                      id="senha"
                      value={dadosLogin.senha}
                      onChange={atualizarCampo('senha')}
                      placeholder="Digite sua senha"
                      autoComplete="current-password"
                    />
                </div>
                    <Botao tamanho="w-100" texto="Entrar" />
                    <button
                      type="button"
                      className="btn btn-link d-block mx-auto text-center"
                      onClick={() => setCadastroAberto(true)}
                    >
                      Não tem uma conta? Cadastre-se
                    </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
