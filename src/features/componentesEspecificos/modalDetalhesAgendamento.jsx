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
  return (Array.isArray(anexos) ? anexos : [anexos]).filter(Boolean)
}

const obterUrlAnexo = (anexo) => {
  if (typeof anexo === 'string') return anexo
  if (anexo.url || anexo.path) return anexo.url || anexo.path
  if (anexo.id === undefined || anexo.id === null) return ''

  const baseUrl = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
  return `${baseUrl}/api/anexos/${encodeURIComponent(anexo.id)}`
}

const dadosDoAnexo = (anexo, indice) => {
  if (typeof anexo === 'string') {
    return {
      nome: anexo.split('/').pop() || `Anexo ${indice + 1}`,
      url: anexo,
      mimeType: ''
    }
  }

  return {
    nome: anexo.nome || anexo.nome_original || anexo.name || `Anexo ${indice + 1}`,
    url: obterUrlAnexo(anexo),
    mimeType: anexo.mime_type || anexo.mimeType || anexo.type || ''
  }
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
                    <div className="d-flex flex-column gap-3">
                      {anexos.map((anexo, indice) => {
                        const { nome, url, mimeType } = dadosDoAnexo(anexo, indice)
                        const imagem = mimeType.startsWith('image/')
                        return (
                          <div key={`${url || nome}-${indice}`} className="d-flex align-items-center gap-2">
                            {imagem && url && (
                              <img
                                src={url}
                                alt={`Prévia de ${nome}`}
                                className="rounded border"
                                style={{ width: '72px', height: '72px', objectFit: 'cover' }}
                              />
                            )}
                            {url ? (
                              <a href={url} target="_blank" rel="noreferrer">
                                {nome}
                              </a>
                            ) : (
                              <span>{nome}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
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
