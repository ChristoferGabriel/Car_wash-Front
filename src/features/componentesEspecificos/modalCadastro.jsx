import { Botao } from "../../shared/componentes/botao"
import { useState } from "react"

const estiloCampo = {
  backgroundColor: 'var(--bs-light)',
  borderColor: 'var(--bs-primary)'
}

export const ModalCadastro = ({ onClose }) => {
  const [dadosCadastro, setDadosCadastro] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  })
  const [erros, setErros] = useState({})

  const atualizarCampo = (campo) => (evento) => {
    setDadosCadastro((dadosAtuais) => ({
      ...dadosAtuais,
      [campo]: evento.target.value
    }))
    setErros((errosAtuais) => ({ ...errosAtuais, [campo]: '' }))
  }

  const cadastrarUsuario = (evento) => {
    evento.preventDefault()

    const novosErros = {
      nome: dadosCadastro.nome.trim() ? '' : 'Informe o nome.',
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dadosCadastro.email)
        ? ''
        : 'Informe um email válido.',
      telefone: dadosCadastro.telefone.trim() ? '' : 'Informe o telefone.',
      senha: dadosCadastro.senha.length >= 6
        ? ''
        : 'A senha deve ter pelo menos 6 caracteres.'
    }

    setErros(novosErros)
  }

  return (
    <>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" onClick={(evento) => evento.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cadastro de usuário</h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Fechar"
              />
            </div>
            <div className="modal-body">
              <form onSubmit={cadastrarUsuario} noValidate>
                <div className="mb-3">
                  <label htmlFor="cadastro-nome" className="form-label">Nome</label>
                  <input
                    id="cadastro-nome"
                    name="nome"
                    type="text"
                    className={`form-control rounded-3 border-1 ${erros.nome ? 'is-invalid' : ''}`}
                    style={estiloCampo}
                    value={dadosCadastro.nome}
                    onChange={atualizarCampo('nome')}
                    placeholder="Digite seu nome"
                    autoComplete="name"
                  />
                  {erros.nome && <div className="invalid-feedback">{erros.nome}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="cadastro-email" className="form-label">Email</label>
                  <input
                    id="cadastro-email"
                    name="email"
                    type="email"
                    className={`form-control rounded-3 border-1 ${erros.email ? 'is-invalid' : ''}`}
                    style={estiloCampo}
                    value={dadosCadastro.email}
                    onChange={atualizarCampo('email')}
                    placeholder="Digite seu email"
                    autoComplete="email"
                  />
                  {erros.email && <div className="invalid-feedback">{erros.email}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="cadastro-telefone" className="form-label">Telefone</label>
                  <input
                    id="cadastro-telefone"
                    name="telefone"
                    type="tel"
                    className={`form-control rounded-3 border-1 ${erros.telefone ? 'is-invalid' : ''}`}
                    style={estiloCampo}
                    value={dadosCadastro.telefone}
                    onChange={atualizarCampo('telefone')}
                    placeholder="Digite seu telefone"
                    autoComplete="tel"
                  />
                  {erros.telefone && <div className="invalid-feedback">{erros.telefone}</div>}
                </div>
                <div className="mb-3">
                  <label htmlFor="cadastro-senha" className="form-label">Senha</label>
                  <input
                    id="cadastro-senha"
                    name="senha"
                    type="password"
                    className={`form-control rounded-3 border-1 ${erros.senha ? 'is-invalid' : ''}`}
                    style={estiloCampo}
                    value={dadosCadastro.senha}
                    onChange={atualizarCampo('senha')}
                    placeholder="Digite sua senha"
                    autoComplete="new-password"
                  />
                  {erros.senha && <div className="invalid-feedback">{erros.senha}</div>}
                </div>
                  <div style={{ margin: '10px 0' }}>
                    <Botao tamanho="w-100" texto="Cadastrar" />
                  </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
