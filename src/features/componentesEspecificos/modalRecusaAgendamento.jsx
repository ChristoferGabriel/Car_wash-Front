import { useState } from 'react'
import { obterErrosDeCampo } from '../../shared/api/api-errors'

export const ModalRecusaAgendamento = ({ onClose, onConfirmar }) => {
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  const confirmar = async (evento) => {
    evento.preventDefault()
    if (!motivo.trim()) {
      setErro('O motivo é obrigatório.')
      return
    }

    setSalvando(true)
    setErro('')
    try {
      await onConfirmar(motivo.trim())
      onClose()
    } catch (error) {
      const errosDeCampo = obterErrosDeCampo(error)
      setErro(errosDeCampo.motivo || error.response?.data?.message || 'Não foi possível recusar o agendamento.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Recusar agendamento</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar" />
            </div>
            <form onSubmit={confirmar} noValidate>
              <div className="modal-body">
                <label htmlFor="motivo-recusa" className="form-label">Motivo da recusa</label>
                <textarea
                  id="motivo-recusa"
                  className={`form-control ${erro ? 'is-invalid' : ''}`}
                  rows="4"
                  maxLength="255"
                  value={motivo}
                  onChange={(evento) => {
                    setMotivo(evento.target.value)
                    setErro('')
                  }}
                  placeholder="Informe o motivo para o cliente"
                  disabled={salvando}
                  required
                />
                {erro && <div className="invalid-feedback">{erro}</div>}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline-secondary" onClick={onClose} disabled={salvando}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-danger" disabled={salvando}>
                  {salvando ? 'Recusando...' : 'Confirmar recusa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
