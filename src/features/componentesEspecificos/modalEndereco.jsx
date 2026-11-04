import { useEffect, useState } from 'react'
import { atualizarEndereco, obterEndereco, removerEndereco } from '../../shared/rotas_api/rotas-api.service'

const camposEndereco = [
  ['rua', 'Rua'],
  ['numero', 'Número'],
  ['bairro', 'Bairro'],
  ['complemento', 'Complemento'],
  ['cidade', 'Cidade'],
  ['cep', 'CEP']
]

export const ModalEndereco = ({ endereco, onClose, onAtualizado, onRemovido }) => {
  const [dados, setDados] = useState(endereco)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    obterEndereco(endereco.id)
      .then((resposta) => {
        if (ativo) setDados(resposta.data || resposta)
      })
      .catch((error) => {
        if (ativo) setErro(error.response?.data?.message || 'Não foi possível carregar o endereço.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => {
      ativo = false
    }
  }, [endereco.id])

  const atualizarCampo = (campo) => (evento) => {
    setDados((atuais) => ({ ...atuais, [campo]: evento.target.value }))
    setErro('')
  }

  const salvar = async (evento) => {
    evento.preventDefault()
    setSalvando(true)
    setErro('')
    try {
      const resposta = await atualizarEndereco(endereco.id, {
        rua: dados.rua,
        numero: dados.numero,
        bairro: dados.bairro,
        complemento: dados.complemento || '',
        cidade: dados.cidade,
        cep: dados.cep
      })
      onAtualizado(resposta.data || resposta)
      onClose()
    } catch (error) {
      setErro(error.response?.data?.message || 'Não foi possível atualizar o endereço.')
    } finally {
      setSalvando(false)
    }
  }

  const excluir = async () => {
    setSalvando(true)
    setErro('')
    try {
      await removerEndereco(endereco.id)
      onRemovido(endereco.id)
      onClose()
    } catch (error) {
      setErro(error.response?.data?.message || 'Não foi possível excluir o endereço.')
      setSalvando(false)
    }
  }

  return (
    <>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered" onClick={(evento) => evento.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Editar endereço</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar" />
            </div>
            <form onSubmit={salvar}>
              <div className="modal-body">
                {erro && <div className="alert alert-danger py-2" role="alert">{erro}</div>}
                {carregando ? (
                  <div className="alert alert-info mb-0" role="status">Carregando endereço...</div>
                ) : (
                  <div className="row g-3">
                    {camposEndereco.map(([campo, rotulo]) => (
                      <div className={campo === 'complemento' ? 'col-12' : 'col-sm-6'} key={campo}>
                        <label className="form-label" htmlFor={`endereco-${campo}`}>{rotulo}</label>
                        <input
                          id={`endereco-${campo}`}
                          className="form-control"
                          value={dados[campo] || ''}
                          onChange={atualizarCampo(campo)}
                          required={campo !== 'complemento'}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer justify-content-between">
                <button type="button" className="btn btn-outline-danger" onClick={excluir} disabled={carregando || salvando}>
                  Excluir
                </button>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={carregando || salvando}>
                    {salvando ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
