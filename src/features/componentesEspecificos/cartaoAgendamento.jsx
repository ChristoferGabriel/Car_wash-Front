import { FaCalendarAlt, FaCheck, FaCheckDouble, FaInfoCircle, FaTimes } from 'react-icons/fa'
import { Botao } from '../../shared/componentes/botao'
import { useServicos } from '../../shared/servicos/use-servicos'
import { formatarDataHoraLocal } from '../../shared/datas/date-time'

const status = {
  pendente: { texto: 'Pendente', classe: 'status-pendente' },
  confirmado: { texto: 'Aceito', classe: 'status-confirmado' },
  concluido: { texto: 'Concluído', classe: 'status-concluido' },
  recusado: { texto: 'Recusado', classe: 'status-recusado' },
  cancelado: { texto: 'Cancelado', classe: 'status-cancelado' }
}

const obterNomeServico = (agendamento, servicosDisponiveis) => {
  const servicos = Array.isArray(agendamento.servicos)
    ? agendamento.servicos
    : agendamento.servicos
      ? [agendamento.servicos]
      : []
  const servico = agendamento.servico
    || agendamento.servico_nome
    || agendamento.servicoNome
    || servicos[0]?.servico
    || servicos[0]?.servico_nome
    || servicos[0]

  if (typeof servico === 'string') {
    return servico
  }

  if (servico?.nome) {
    return servico.nome
  }

  const servicoId = agendamento.servico_id
    || servico?.servico_id
    || servico?.pivot?.servico_id
    || servico?.id
    || servicos[0]?.pivot?.servico_id
    || servicos[0]?.servico_id
    || servicos[0]?.id
  const servicoCadastrado = servicosDisponiveis.find(
    (item) => String(item.id) === String(servicoId)
  )

  return servicoCadastrado?.nome || 'Serviço'
}

const obterCliente = (agendamento) => agendamento.cliente || agendamento.usuario || {}

const obterDataHora = (agendamento) => {
  const dataHora = agendamento.data_hora || agendamento.dataHora || agendamento.inicio
  if (dataHora) {
    const [data, horario] = formatarDataHoraLocal(dataHora).split(', ')
    return { data, horario }
  }

  return {
    data: agendamento.data || agendamento.data_agendamento || 'Não informado',
    horario: agendamento.horario || agendamento.hora || 'Não informado'
  }
}

export const CartaoAgendamento = ({
  agendamento,
  modo = 'cliente',
  onCancelar,
  onAceitar,
  onRecusar,
  onConcluir,
  onDetalhes
}) => {
  const { servicos: servicosDisponiveis } = useServicos()
  const statusAtual = status[agendamento.status] || status.pendente
  const cliente = obterCliente(agendamento)
  const servico = obterNomeServico(agendamento, servicosDisponiveis)
  const nome = agendamento.nome || agendamento.cliente_nome || cliente.nome
  const { data, horario } = obterDataHora(agendamento)

  return (
    <article className="appointment-card">
      <div className="appointment-icon" aria-hidden="true">
        <FaCalendarAlt size={24} />
      </div>
      <div className="appointment-content">
        <div className="appointment-main">
          <div className="appointment-fields">
            <p><strong>Serviço:</strong> {servico || 'Serviço'}</p>
            <p><strong>Data:</strong> {data || 'Não informado'}</p>
            <p><strong>Horário:</strong> {horario || 'Não informado'}</p>
            {modo === 'admin' && (
              <>
                <p><strong>Nome:</strong> {nome || 'Não informado'}</p>
              </>
            )}
          </div>
          <span className={`appointment-status ${statusAtual.classe}`}>
            {statusAtual.texto}
          </span>
        </div>

        {modo === 'admin' ? (
          <div className="appointment-actions">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm rounded-3"
              onClick={() => onDetalhes(agendamento)}
              aria-label="Ver detalhes do agendamento"
              title="Ver detalhes"
            >
              <FaInfoCircle />
            </button>
            <Botao
              texto="Aceitar"
              icone={<FaCheck />}
              type="button"
              onClick={() => onAceitar(agendamento.id)}
              disabled={agendamento.status !== 'pendente'}
              className="btn-sm"
            />
            {agendamento.status === 'confirmado' && (
              <Botao
                texto="Concluir"
                icone={<FaCheckDouble />}
                type="button"
                onClick={() => onConcluir(agendamento.id)}
                className="btn-sm"
              />
            )}
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
