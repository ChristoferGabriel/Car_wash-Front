import { useState } from "react"
import { Botao } from "../../shared/componentes/botao"
import { cadastrarUsuario } from "../../shared/auth/auth.service"
import { useAlerta } from "../../shared/hooks/useAlerta"
import { Alerta } from "../../shared/componentes/alerta"
import { obterErrosDeCampo, obterMensagemDaApi, possuiErrosDeCampo } from "../../shared/api/api-errors"
import { termoConsentimento } from "../../shared/auth/termo-consentimento"

const estiloCampo = {
  backgroundColor: 'var(--bs-light)',
  borderColor: 'var(--bs-primary)'
}

export const ModalCadastro = ({ onClose, onCadastroSucesso }) => {
  const { mostrarAlerta, fecharAlerta, alerta } = useAlerta()
  const [dados, setDados] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: ''
  })
  const [aceiteTermos, setAceiteTermos] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [erros, setErros] = useState({})

  const atualizarCampo = (campo) => (evento) => {
    const valor = campo === 'telefone'
      ? evento.target.value.replace(/\D/g, '').slice(0, 11)
      : evento.target.value
    setDados((dadosAtuais) => ({ ...dadosAtuais, [campo]: valor }))
    setErro('')
    setErros((atuais) => ({ ...atuais, [campo]: '' }))
  }

  const cadastrar = async (evento) => {
    evento.preventDefault()

    if (Object.values(dados).some((valor) => !valor.trim())) {
      setErro('Preencha todos os campos.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email.trim())) {
      setErro('Informe um email válido.')
      return
    }

    if (dados.telefone.length !== 11) {
      setErro('Informe um telefone com exatamente 11 dígitos.')
      return
    }

    if (dados.senha.length < 8) {
      setErro('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (!aceiteTermos) {
      setErro('É necessário aceitar os termos de uso.')
      return
    }

    setCarregando(true)
    try {
      const { senha, ...dadosSemSenha } = dados
      await cadastrarUsuario({
        ...dadosSemSenha,
        password: senha,
        aceite_termos: true
      })
      mostrarAlerta('Cadastro realizado com sucesso!', 'success')
    } catch (error) {
      const errosDaApi = obterErrosDeCampo(error)
      setErros(errosDaApi)
      setErro(
        possuiErrosDeCampo(errosDaApi)
          ? ''
          : obterMensagemDaApi(error, 'Não foi possível realizar o cadastro.')
      )
    } finally {
      setCarregando(false)
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
                      inputMode={campo === 'telefone' ? 'numeric' : undefined}
                      maxLength={campo === 'telefone' ? 11 : undefined}
                      className={`form-control rounded-3 border-1 ${erros[campo] ? 'is-invalid' : ''}`}
                      style={estiloCampo}
                      value={dados[campo]}
                      onChange={atualizarCampo(campo)}
                      autoComplete={campo === 'senha' ? 'new-password' : campo}
                    />
                    {erros[campo] && <div className="invalid-feedback">{erros[campo]}</div>}
                  </div>
                ))}
                <details className="mb-3">
                  <summary className="text-primary" role="button">
                    Ler termo de consentimento completo
                  </summary>
                  <div
                    className="border rounded-3 bg-light mt-2 p-3 small"
                    style={{ maxHeight: '180px', overflowY: 'auto', whiteSpace: 'pre-line' }}
                  >
                    {termoConsentimento}
                  </div>
                </details>
                <div className="form-check mb-3">
                  <input
                    id="aceite-termos"
                    type="checkbox"
                    className={`form-check-input ${erros.aceite_termos ? 'is-invalid' : ''}`}
                    checked={aceiteTermos}
                    onChange={(evento) => {
                      setAceiteTermos(evento.target.checked)
                      setErro('')
                    }}
                  />
                  <label htmlFor="aceite-termos" className="form-check-label">
                    Li e concordo com o termo de consentimento para tratamento de dados pessoais.
                  </label>
                  {erros.aceite_termos && <div className="invalid-feedback d-block">{erros.aceite_termos}</div>}
                </div>
                <Botao
                  tamanho="w-100"
                  texto={carregando ? "Cadastrando..." : "Confirmar cadastro"}
                  disabled={carregando}
                />
              </form>
            </div>
             {alerta.visivel && (
                <Alerta
                  mensagem={alerta.mensagem}
                  onFechar={() => {
                    fecharAlerta()
                    onCadastroSucesso(dados.email.trim().toLowerCase())
                  }}
                />
              )}
          </div>
        </div>
      </div>
    </>
  )
}
