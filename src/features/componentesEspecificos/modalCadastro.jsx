import { useState } from "react"
import { Botao } from "../../shared/componentes/botao"
import { cadastrarUsuarioMock } from "../../shared/auth/auth.service"

const estiloCampo = {
  backgroundColor: 'var(--bs-light)',
  borderColor: 'var(--bs-primary)'
}

export const ModalCadastro = ({ onClose, onCadastroSucesso }) => {
  const [dados, setDados] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  })
  const [erro, setErro] = useState('')

  const atualizarCampo = (campo) => (evento) => {
    setDados((dadosAtuais) => ({ ...dadosAtuais, [campo]: evento.target.value }))
    setErro('')
  }

  const cadastrar = (evento) => {
    evento.preventDefault()

    if (Object.values(dados).some((valor) => !valor.trim())) {
      setErro('Preencha todos os campos.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      setErro('Informe um email válido.')
      return
    }

    if (dados.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    try {
      cadastrarUsuarioMock({
        ...dados,
        email: dados.email.trim().toLowerCase()
      })
      onCadastroSucesso(dados.email.trim().toLowerCase())
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" onClick={(evento) => evento.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cadastro de usuário</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar" />
            </div>
            <div className="modal-body">
              <form onSubmit={cadastrar} noValidate>
                {erro && <div className="alert alert-danger py-2" role="alert">{erro}</div>}
                {[
                  ['nome', 'Nome', 'text'],
                  ['email', 'Email', 'email'],
                  ['telefone', 'Telefone', 'tel'],
                  ['senha', 'Senha', 'password']
                ].map(([campo, rotulo, tipo]) => (
                  <div className="mb-3" key={campo}>
                    <label htmlFor={`cadastro-${campo}`} className="form-label">{rotulo}</label>
                    <input
                      id={`cadastro-${campo}`}
                      type={tipo}
                      className="form-control rounded-3 border-1"
                      style={estiloCampo}
                      value={dados[campo]}
                      onChange={atualizarCampo(campo)}
                      autoComplete={campo === 'senha' ? 'new-password' : campo}
                    />
                  </div>
                ))}
                <Botao tamanho="w-100" texto="Confirmar cadastro" />
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
