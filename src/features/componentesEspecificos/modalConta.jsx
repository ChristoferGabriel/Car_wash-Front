import { useState } from "react"
import { Botao } from "../../shared/componentes/botao"
import { atualizarUsuarioMock, encerrarSessao } from "../../shared/auth/authMock.service"

const estiloCampo = {
  backgroundColor: 'var(--bs-light)',
  borderColor: 'var(--bs-primary)'
}

export const ModalConta = ({ usuario, onClose }) => {
  const [editando, setEditando] = useState(false)
  const [dados, setDados] = useState({
    nome: usuario?.nome || '',
    email: usuario?.email || '',
    telefone: usuario?.telefone || '',
    senha: ''
  })
  const [erro, setErro] = useState('')

  const atualizarCampo = (campo) => (evento) => {
    setDados((dadosAtuais) => ({ ...dadosAtuais, [campo]: evento.target.value }))
    setErro('')
  }

  const salvar = (evento) => {
    evento.preventDefault()
    if (!dados.nome.trim() || !dados.email.trim() || !dados.telefone.trim()) {
      setErro('Preencha todos os campos para salvar.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
      setErro('Informe um email válido.')
      return
    }
    if (dados.senha && dados.senha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    const dadosParaSalvar = { ...dados }
    if (!dadosParaSalvar.senha) {
      delete dadosParaSalvar.senha
    }
    atualizarUsuarioMock(dadosParaSalvar)
    setEditando(false)
  }

  const sair = () => {
    encerrarSessao()
    onClose()
  }

  return (
    <>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" onClick={(evento) => evento.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Minha conta</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar" />
            </div>
            <div className="modal-body">
              {editando ? (
                <form onSubmit={salvar} noValidate>
                  {erro && <div className="alert alert-danger py-2" role="alert">{erro}</div>}
                  {['nome', 'email', 'telefone', 'senha'].map((campo) => (
                    <div className="mb-3" key={campo}>
                      <label htmlFor={`conta-${campo}`} className="form-label">
                        {campo[0].toUpperCase() + campo.slice(1)}
                      </label>
                      <input
                        id={`conta-${campo}`}
                        type={campo === 'email' ? 'email' : campo === 'senha' ? 'password' : 'text'}
                        placeholder={campo === 'senha' ? 'Deixe vazio para manter a senha atual' : undefined}
                        className="form-control rounded-3 border-1"
                        style={estiloCampo}
                        value={dados[campo]}
                        onChange={atualizarCampo(campo)}
                      />
                    </div>
                  ))}
                  <Botao tamanho="w-100" texto="Salvar alterações" />
                </form>
              ) : (
                <>
                  <p><strong>Nome:</strong> {usuario?.nome}</p>
                  <p><strong>Email:</strong> {usuario?.email}</p>
                  <p><strong>Telefone:</strong> {usuario?.telefone}</p>
                  <p><strong>Perfil:</strong> {usuario?.perfil}</p>
                  <div className="d-flex gap-2">
                    <Botao tamanho="w-100" texto="Editar dados" onClick={() => setEditando(true)} type="button" />
                    <button type="button" className="btn btn-outline-danger w-100" onClick={sair}>
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
