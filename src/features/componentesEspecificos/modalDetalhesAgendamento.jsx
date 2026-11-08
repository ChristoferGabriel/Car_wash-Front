import { useEffect, useMemo, useState } from 'react'
import { formatarDataHoraLocal } from '../../shared/datas/date-time'
import { baixarAnexo } from '../../shared/rotas_api/rotas-api.service'

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

const dadosDoAnexo = (anexo, indice) => {
  if (typeof anexo === 'string') {
    return {
      nome: anexo.split('/').pop() || `Anexo ${indice + 1}`,
      url: anexo,
      id: null,
      mimeType: ''
    }
  }

  return {
    nome: anexo.nome || anexo.nome_original || anexo.name || `Anexo ${indice + 1}`,
    url: anexo.url || anexo.path || '',
    id: anexo.id ?? null,
    mimeType: anexo.mime_type || anexo.mimeType || anexo.type || ''
  }
}

export const ModalDetalhesAgendamento = ({ agendamento, servico, onClose }) => {
  const [urlsAnexos, setUrlsAnexos] = useState({})
  const [errosAnexos, setErrosAnexos] = useState({})
  const [carregandoAnexos, setCarregandoAnexos] = useState({})
  const cliente = obterCliente(agendamento)
  const { data, horario } = obterDataHora(agendamento)
  const nome = agendamento.nome || agendamento.cliente_nome || cliente.nome
  const telefone = agendamento.telefone || agendamento.cliente_telefone || cliente.telefone
  const email = agendamento.email || agendamento.cliente_email || cliente.email
  const anexos = useMemo(() => obterAnexos(agendamento), [agendamento])

  useEffect(() => {
    let ativo = true
    const urlsCriadas = []

    const carregarAnexos = async () => {
      setCarregandoAnexos(Object.fromEntries(anexos.map((anexo, indice) => {
        const dados = dadosDoAnexo(anexo, indice)
        return [`${dados.url || dados.id || dados.nome}-${indice}`, true]
      })))

      const resultados = await Promise.all(anexos.map(async (anexo, indice) => {
        const dados = dadosDoAnexo(anexo, indice)
        if (dados.url || dados.id === null) {
          return { chave: `${dados.url || dados.nome}-${indice}`, url: dados.url }
        }

        try {
          const arquivo = await baixarAnexo(dados.id)
          const url = URL.createObjectURL(arquivo)
          urlsCriadas.push(url)
          return { chave: `${dados.id}-${indice}`, url }
        } catch (error) {
          console.error('Erro ao carregar anexo:', error)
          return { chave: `${dados.id}-${indice}`, url: '', erro: true }
        }
      }))

      if (!ativo) return

      setUrlsAnexos(Object.fromEntries(resultados.map(({ chave, url }) => [chave, url])))
      setErrosAnexos(Object.fromEntries(resultados
        .filter(({ erro }) => erro)
        .map(({ chave }) => [chave, true])))
      setCarregandoAnexos({})
    }

    carregarAnexos()

    return () => {
      ativo = false
      urlsCriadas.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [anexos])

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
                        const dados = dadosDoAnexo(anexo, indice)
                        const chave = `${dados.url || dados.id || dados.nome}-${indice}`
                        const url = urlsAnexos[chave] || dados.url
                        const { nome, mimeType } = dados
                        const imagem = mimeType.startsWith('image/')
                        const carregando = carregandoAnexos[chave]
                        const erro = errosAnexos[chave]
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
                            {carregando ? (
                              <span>{nome} (carregando...)</span>
                            ) : url && !erro ? (
                              <a href={url} target="_blank" rel="noreferrer">
                                {nome}
                              </a>
                            ) : (
                              <span className="text-danger">
                                {nome} (não foi possível carregar o arquivo)
                              </span>
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
