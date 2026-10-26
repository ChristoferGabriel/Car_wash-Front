import { Botao } from "../../shared/componentes/botao"
import { useState } from "react"
import { autenticarUsuario } from "../../shared/auth/auth.service"
import { ModalCadastro } from "./modalCadastro"
import { Alerta } from "../../shared/componentes/alerta"
import { useAlerta } from "../../shared/hooks/useAlerta"
import { FaEye, FaEyeSlash } from "react-icons/fa"

const estiloCampo = {
  backgroundColor: 'var(--bs-light)',
  borderColor: 'var(--bs-primary)'
}

export const ModalLogin = ({ onClose }) => {
  const [dadosLogin, setDadosLogin] = useState({ email: '', senha: '' })
  const [erroLogin, setErroLogin] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [cadastroAberto, setCadastroAberto] = useState(false)
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  const { alerta, mostrarAlerta, fecharAlerta } = useAlerta()

  const atualizarCampo = (campo) => (evento) => {
    setDadosLogin((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: evento.target.value
    }))
    setErroLogin('')
  }

  const validarLogin = async (evento) => {
    evento.preventDefault()

    if (!dadosLogin.email.trim() || !dadosLogin.senha) {
      setErroLogin('Informe o email e a senha para entrar.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dadosLogin.email)) {
      setErroLogin('Informe um email válido.')
      return
    }

    setCarregando(true)
    try {
      await autenticarUsuario(dadosLogin.email.trim(), dadosLogin.senha.trim())
      mostrarAlerta('Login realizado com sucesso!')
      setErroLogin('')
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      setErroLogin(error.response?.data?.message || 'Email ou senha inválidos.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <>
      {!cadastroAberto && <div className="modal-backdrop show" onClick={onClose} />}
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
                    <div className="input-group">
                      <input
                        type={senhaVisivel ? "text" : "password"}
                        className="form-control rounded-start-3 border-1"
                        style={estiloCampo}
                        id="senha"
                        value={dadosLogin.senha}
                        onChange={atualizarCampo('senha')}
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setSenhaVisivel((visivel) => !visivel)}
                        aria-label={senhaVisivel ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {senhaVisivel ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                </div>
                <Botao tamanho="w-100" texto={carregando ? "Entrando..." : "Entrar"} disabled={carregando} />
                <button
                  type="button"
                  className="btn btn-link w-100 mt-2"
                  onClick={() => setCadastroAberto(true)}
                >
                  Criar cadastro
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      {alerta.visivel && (
        <Alerta
          mensagem={alerta.mensagem}
          onFechar={() => {
            fecharAlerta()
            onClose()
          }}
        />
      )}
      {cadastroAberto && (
        <ModalCadastro
          onClose={() => setCadastroAberto(false)}
          onCadastroSucesso={(email) => {
            setDadosLogin((dadosAtuais) => ({ ...dadosAtuais, email }))
            setCadastroAberto(false)
            setErroLogin('Cadastro realizado localmente. Entre com as credenciais do backend.')
          }}
        />
      )}
    </>
  )
}
