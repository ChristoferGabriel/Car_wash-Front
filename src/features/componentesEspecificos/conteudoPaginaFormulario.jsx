import { useEffect, useState } from 'react'
import { Botao } from '../../shared/componentes/botao'
import '../../shared/styles/conteudoPaginaFormulario.css'
import { FaCheck } from 'react-icons/fa'
import { Alerta } from '../../shared/componentes/alerta'
import { criarAgenda, listarServicos } from '../../shared/rotas_api/rotas-api.service'
import { usuarioAtual, usuarioAutenticado } from '../../shared/auth/auth.service'
import { useAlerta } from '../../shared/hooks/useAlerta'

const estiloCampo = {
  backgroundColor: 'var(--bs-light)',
  borderColor: 'var(--bs-primary)'
}

const dadosAgendamentoInicial = {
  horario: '',
  data: '',
  rua: '',
  numero: '',
  bairro: '',
  servico: '',
  anexos: null
}

const formatarTelefone = (valor) => {
  return valor .replace(/\D/g, '') .substring(0, 11) .replace(/^(\d{2})(\d)/, '$1 $2') .replace(/(\d{5})(\d)/, '$1-$2')
}

export const ConteudoPaginaFormulario = () => {
  const [estaAutenticado, setEstaAutenticado] = useState(usuarioAutenticado)
  const [servicosDisponiveis, setServicosDisponiveis] = useState([])
  const [dadosAgendamento, setDadosAgendamento] = useState(dadosAgendamentoInicial)
  const [erros, setErros] = useState({})
  const [erroServicos, setErroServicos] = useState('')
  const { alerta, mostrarAlerta, fecharAlerta } = useAlerta()

  useEffect(() => {
    let componenteMontado = true

    const carregarServicos = async () => {
      try {
        const resposta = await listarServicos()
        const servicos = Array.isArray(resposta) ? resposta : resposta?.items

        if (!Array.isArray(servicos)) {
          throw new Error('A API retornou um formato inválido para os serviços.')
        }

        if (componenteMontado) {
          setErroServicos('')
          setServicosDisponiveis(servicos)
        }
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
        if (componenteMontado) {
          setErroServicos('Não foi possível carregar os serviços.')
        }
      }
    }

    carregarServicos()

    return () => {
      componenteMontado = false
    }
  }, [])

  useEffect(() => {
    const atualizarAutenticacao = () => {
      setEstaAutenticado(usuarioAutenticado())
    }

    window.addEventListener('auth-change', atualizarAutenticacao)
    return () => window.removeEventListener('auth-change', atualizarAutenticacao)
  }, [])

 const atualizarCampo = (campo) => (evento) => {
    let valor = campo === 'anexos' ? evento.target.files : evento.target.value
    if (campo === 'telefone') {
      valor = formatarTelefone(valor)
    }

    setDadosAgendamento((atual) => ({ ...atual, [campo]: valor }))
  }

  const validarValorObrigatorio = (valor, nomeCampo) => {
    return !valor?.trim() ? `${nomeCampo} é obrigatório` : ''
  }

  const atualizarCampoObrigatorio = (campo, nomeCampo) => (evento) => {
    const valor = evento.target.value
    atualizarCampo(campo)(evento)
    setErros((atuais) => ({
      ...atuais,
      [campo]: validarValorObrigatorio(valor, nomeCampo)
    }))
  }

  const confirmarAgendamento = async (evento) => {
    evento.preventDefault()
    if (!estaAutenticado) {
      mostrarAlerta('Para enviar um agendamento, faça login no site.')
      return
    }

    const camposObrigatorios = {
      horario: 'Horário',
      data: 'Data',
      rua: 'Rua',
      numero: 'Número',
      bairro: 'Bairro',
      servico: 'Serviço'
    }
    const novosErros = Object.fromEntries(
      Object.entries(camposObrigatorios).map(([campo, nomeCampo]) => [
        campo,
        validarValorObrigatorio(dadosAgendamento[campo], nomeCampo)
      ])
    )

    setErros(novosErros)
    if (Object.values(novosErros).some(Boolean)) return

    try {
      await criarAgenda({
        ...dadosAgendamento,
        nome: usuarioAtual.nome,
        telefone: usuarioAtual.telefone
      })
      mostrarAlerta("Agendamento enviado com sucesso! Aguarde a confirmação da empresa, que entrará em contato.")
      setDadosAgendamento(dadosAgendamentoInicial)
    } catch (error) {
      console.error('Erro ao enviar dados:', error)
      mostrarAlerta("Ocorreu um erro ao enviar o agendamento. Por favor, tente novamente.")
    }
  }

  return (
    <div className="px-3 px-sm-4 px-md-5 py-4 py-lg-5 mx-auto" style={{ maxWidth: '1320px' }}>
      {alerta.visivel && (
        <Alerta
          mensagem={alerta.mensagem}
          onFechar={fecharAlerta}
        />
      )}
      <h1 className="fw-bold text-center mb-4 fs-4 fs-sm-3 fs-md-2 fs-lg-1">
        Agendamento
      </h1>

      {!estaAutenticado && (
        <div className="alert alert-warning text-center" role="alert">
          Para preencher e enviar o agendamento, faça login no site.
        </div>
      )}

      <form
        onSubmit={confirmarAgendamento}
        noValidate
        className="rounded-4 p-3 p-sm-4 p-lg-5"
        style={{ backgroundColor: '#d4d4d4' }}
      >
        <fieldset disabled={!estaAutenticado} className="border-0 p-0 m-0">
          <div className="row g-3 g-sm-4 g-lg-5">
          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="horario" className="form-label">Horário*</label>
            <input
              id="horario"
              type="time"
              className={`form-control form-control-lg rounded-3 border-1 ${erros.horario ? 'is-invalid' : ''}`}
              style={estiloCampo}
              value={dadosAgendamento.horario}
              onChange={atualizarCampoObrigatorio('horario', 'Horário')}
              required
            />
            {erros.horario && <div className="invalid-feedback">{erros.horario}</div>}
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="data" className="form-label">Data*</label>
            <input
              id="data"
              type="date"
              className={`form-control form-control-lg rounded-3 border-1 ${erros.data ? 'is-invalid' : ''}`}
              style={estiloCampo}
              value={dadosAgendamento.data}
              onChange={atualizarCampoObrigatorio('data', 'Data')}
              required
            />
            {erros.data && <div className="invalid-feedback">{erros.data}</div>}
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="servico" className="form-label">Serviço*</label>
            {erroServicos && (
              <div className="alert alert-danger text-center py-2" role="alert">
                {erroServicos}
              </div>
            )}
            <select
              id="servico"
              className={`form-select form-select-lg rounded-3 border-1 ${erros.servico ? 'is-invalid' : ''}`}
              style={estiloCampo}
              value={dadosAgendamento.servico}
              onChange={atualizarCampoObrigatorio('servico', 'Serviço')}
              required
            >
              <option value="" disabled>Selecione...</option>
              {servicosDisponiveis.map((servico) => (
                <option key={servico.id} value={servico.id}>{servico.nome}</option>
              ))}
            </select>
            {erros.servico && <div className="invalid-feedback">{erros.servico}</div>}
          </div>

           <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="rua" className="form-label">Rua*</label>
            <input
              id="rua"
              type="text"
              className={`form-control form-control-lg rounded-3 border-1 ${erros.rua ? 'is-invalid' : ''}`}
              style={estiloCampo}
              placeholder="Ex: Rua Eduardo Sprada"
              value={dadosAgendamento.rua}
              onChange={atualizarCampoObrigatorio('rua', 'Rua')}
              required
            />
            {erros.rua && <div className="invalid-feedback">{erros.rua}</div>}
          </div>

           <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="numero" className="form-label">Número*</label>
            <input
              id="numero"
              type="text"
              className={`form-control form-control-lg rounded-3 border-1 ${erros.numero ? 'is-invalid' : ''}`}
              style={estiloCampo}
              placeholder="Ex: 230"
              value={dadosAgendamento.numero}
              onChange={atualizarCampoObrigatorio('numero', 'Número')}
              required
            />
            {erros.numero && <div className="invalid-feedback">{erros.numero}</div>}
          </div>

           <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="bairro" className="form-label">Bairro*</label>
            <input
              id="bairro"
              type="text"
              className={`form-control form-control-lg rounded-3 border-1 ${erros.bairro ? 'is-invalid' : ''}`}
              style={estiloCampo}
              placeholder="Ex: Ecoville"
              value={dadosAgendamento.bairro}
              onChange={atualizarCampoObrigatorio('bairro', 'Bairro')}
              required
            />
            {erros.bairro && <div className="invalid-feedback">{erros.bairro}</div>}
          </div>

          </div>

          <div className="d-flex flex-column align-items-center mt-4">
          <label className="form-label mb-1">Anexos (fotos)</label>
          
          <label
            htmlFor="anexos"
            className="campo-anexos-custom rounded-2 border border-1"
            style={estiloCampo}
          >
            <div className="botao-texto">
              <span className="d-sm-none" style={{ fontSize: '0.8rem' }}>selecionar...</span>
              <span className="d-none d-sm-inline">Escolher arquivos</span>
            </div>
            
            <div className="arquivo-texto d-none d-sm-flex">
              {dadosAgendamento.anexos && dadosAgendamento.anexos.length > 0
                ? (dadosAgendamento.anexos.length === 1 ? dadosAgendamento.anexos[0].name : `${dadosAgendamento.anexos.length} arquivos selecionados`)
                : 'Nenhum arquivo escolhido'}
            </div>
          </label>

            <input
              id="anexos"
              type="file"
              accept="image/*"
              multiple
              className="d-none"
              onChange={atualizarCampo('anexos')}
            />
          </div>

          <div className="d-grid d-sm-flex justify-content-sm-center mt-4">
            <Botao icone={<FaCheck />} texto="Confirmar Agendamento" />
          </div>
        </fieldset>
      </form>
    </div>
  )
}