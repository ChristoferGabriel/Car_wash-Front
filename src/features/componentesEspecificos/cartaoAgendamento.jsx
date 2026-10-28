import { FaCalendarAlt, FaCheck, FaTimes } from 'react-icons/fa'
import { Botao } from '../../shared/componentes/botao'

const status = {
  pendente: { texto: 'Pendente', classe: 'status-pendente' },
  confirmado: { texto: 'Aceito', classe: 'status-confirmado' },
  recusado: { texto: 'Recusado', classe: 'status-recusado' },
  cancelado: { texto: 'Cancelado', classe: 'status-cancelado' }
}

export const CartaoAgendamento = ({
  agendamento,
  modo = 'cliente',
  onCancelar,
  onAceitar,
  onRecusar
}) => {
  const statusAtual = status[agendamento.status] || status.pendente

  return (
    <article className="appointment-card">
      <div className="appointment-icon" aria-hidden="true">
        <FaCalendarAlt size={24} />
      </div>
      <div className="appointment-content">
        <div className="appointment-main">
          <div className="appointment-fields">
            <p><strong>Serviço:</strong> {agendamento.servico}</p>
            <p><strong>Data:</strong> {agendamento.data}</p>
            <p><strong>Horário:</strong> {agendamento.horario}</p>
            {modo === 'admin' && (
              <>
                <p><strong>Nome:</strong> {agendamento.nome}</p>
                <p><strong>Telefone:</strong> {agendamento.telefone}</p>
                <p><strong>Endereço:</strong> {agendamento.endereco}</p>
              </>
            )}
          </div>
          <span className={`appointment-status ${statusAtual.classe}`}>
            {statusAtual.texto}
          </span>
        </div>

        {modo === 'admin' ? (
          <div className="appointment-actions">
            <Botao
              texto="Aceitar"
              icone={<FaCheck />}
              type="button"
              onClick={() => onAceitar(agendamento.id)}
              disabled={agendamento.status !== 'pendente'}
              className="btn-sm"
            />
            <button
              type="button"
              className="btn btn-outline-danger btn-sm rounded-3"
              onClick={() => onRecusar(agendamento.id)}
              disabled={agendamento.status !== 'pendente'}
            >
              <span className="d-flex align-items-center gap-2">
                <FaTimes />
                Recusar
              </span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-outline-danger btn-sm rounded-3 align-self-start"
            onClick={() => onCancelar(agendamento.id)}
            disabled={['cancelado', 'recusado'].includes(agendamento.status)}
          >
            Cancelar agendamento
          </button>
        )}
      </div>
    </article>
  )
}
