import { useEffect, useState } from 'react'
import { formatarDataHoraLocal } from '../../shared/datas/date-time'
import { baixarAnexoAdmin } from '../../shared/rotas_api/rotas-api.service'

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

const dadosDoAnexo = (anexo, indice) => ({
  id: anexo.id,
  nome: anexo.nome || anexo.nome_original || anexo.name || `Anexo ${indice + 1}`,
  mimeType: anexo.mime_type || anexo.mimeType || anexo.type || ''
})

const baixarPeloNavegador = (url, nome) => {
  const link = document.createElement('a')
  link.href = url
  link.download = nome
  document.body.appendChild(link)
  link.click()
  link.remove()
}

const AnexoAgendamento = ({ anexo, indice }) => {
  const { id, nome, mimeType } = dadosDoAnexo(anexo, indice)
  const ehImagem = mimeType.startsWith('image/')
  const [previa, setPrevia] = useState('')
  const [abrindo, setAbrindo] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!ehImagem || id === undefined || id === null) return undefined

    let cancelado = false
    let urlBlob = ''

    baixarAnexoAdmin(id)
      .then((arquivo) => {
        if (cancelado) return
        urlBlob = URL.createObjectURL(arquivo)
        setPrevia(urlBlob)
      })
      .catch((error) => console.error('Erro ao carregar prévia do anexo:', error))

    return () => {
      cancelado = true
      if (urlBlob) URL.revokeObjectURL(urlBlob)
    }
  }, [id, ehImagem])

  const abrir = async () => {
    if (previa) {
      window.open(previa, '_blank')
      return
    }

    const aba = window.open('', '_blank')
    if (aba) aba.opener = null
    setAbrindo(true)
    setErro('')
    try {
      const arquivo = await baixarAnexoAdmin(id)
      const urlBlob = URL.createObjectURL(arquivo)
      if (aba) {
        aba.location.href = urlBlob
      } else {
        baixarPeloNavegador(urlBlob, nome)
      }
      setTimeout(() => URL.revokeObjectURL(urlBlob), 5 * 60 * 1000)
    } catch (error) {
      console.error('Erro ao abrir anexo:', error)
      if (aba) aba.close()
      setErro('Não foi possível abrir o anexo. Tente novamente.')
    } finally {
      setAbrindo(false)
    }
  }

  return (
    <div>
      <div className="d-flex align-items-center gap-2">
        {ehImagem && (
          <button
            type="button"
            className="p-0 border-0 bg-transparent"
            onClick={abrir}
            aria-label={`Abrir ${nome}`}
          >
            {previa ? (
              <img
                src={previa}
                alt={`Prévia de ${nome}`}
                className="rounded border"
                style={{ width: '72px', height: '72px', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="rounded border bg-light"
                style={{ width: '72px', height: '72px' }}
                aria-hidden="true"
              />
            )}
          </button>
        )}
        <button
          type="button"
          className="btn btn-link p-0 align-baseline text-start"
          onClick={abrir}
          disabled={abrindo}
        >
          {abrindo ? 'Abrindo...' : nome}
        </button>
      </div>
      {erro && <div className="text-danger small mt-1" role="alert">{erro}</div>}
    </div>
  )
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
                      {anexos.map((anexo, indice) => (
                        <AnexoAgendamento key={anexo.id ?? indice} anexo={anexo} indice={indice} />
                      ))}
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