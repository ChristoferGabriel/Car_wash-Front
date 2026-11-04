import { formatarDataHoraLocal } from '../../shared/datas/date-time'

const formatarEndereco = (endereco) => {
  if (!endereco || typeof endereco === 'string') return endereco || 'Não informado'
  const principal = [endereco.rua, endereco.numero].filter(Boolean).join(', ')
  const localidade = [endereco.bairro, endereco.cidade].filter(Boolean).join(', ')
  const cep = endereco.cep ? `CEP ${endereco.cep}` : ''
  return [principal, localidade, endereco.complemento, cep].filter(Boolean).join(' - ') || 'Não informado'
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

const obterAnexos = (agendamento) => {
  const anexos = agendamento.anexos || agendamento.anexos_url || agendamento.arquivos || []
  return Array.isArray(anexos) ? anexos : [anexos]
}

export const ModalDetalhesAgendamento = ({ agendamento, servico, onClose }) => {
  const cliente = obterCliente(agendamento)
  const { data, horario } = obterDataHora(agendamento)
  const nome = agendamento.nome || agendamento.cliente_nome || cliente.nome
  const telefone = agendamento.telefone || agendamento.cliente_telefone || cliente.telefone
  const email = agendamento.email || agendamento.cliente_email || cliente.email
  const anexos = obterAnexos(agendamento)

  return (
    <>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className="modal show d-block" tabIndex="-1" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(evento) => evento.stopPropagation()}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Detalhes do agendamento</h5>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Fechar" />
            </div>
            <div className="modal-body">
              <dl className="row mb-0">
                <dt className="col-sm-4">Serviço</dt>
                <dd className="col-sm-8">{servico}</dd>
                <dt className="col-sm-4">Data</dt>
                <dd className="col-sm-8">{data}</dd>
                <dt className="col-sm-4">Horário</dt>
                <dd className="col-sm-8">{horario}</dd>
                <dt className="col-sm-4">Nome</dt>
                <dd className="col-sm-8">{nome || 'Não informado'}</dd>
                <dt className="col-sm-4">Endereço</dt>
                <dd className="col-sm-8">{formatarEndereco(agendamento.endereco)}</dd>
                <dt className="col-sm-4">Telefone</dt>
                <dd className="col-sm-8">{telefone || 'Não informado'}</dd>
                <dt className="col-sm-4">E-mail</dt>
                <dd className="col-sm-8">{email || 'Não informado'}</dd>
                <dt className="col-sm-4">Anexos</dt>
                <dd className="col-sm-8">
                  {anexos.length === 0 ? 'Nenhum anexo' : (
                    <ul className="mb-0 ps-3">
                      {anexos.map((anexo, indice) => {
                        const url = typeof anexo === 'string' ? anexo : anexo.url || anexo.path
                        const nomeAnexo = typeof anexo === 'string'
                          ? anexo.split('/').pop()
                          : anexo.nome || anexo.name || `Anexo ${indice + 1}`
                        return (
                          <li key={`${url || nomeAnexo}-${indice}`}>
                            {url ? <a href={url} target="_blank" rel="noreferrer">{nomeAnexo}</a> : nomeAnexo}
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
