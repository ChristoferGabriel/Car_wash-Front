import { useEffect, useState } from 'react'
import { Botao } from '../../shared/componentes/botao'
import './ConteudoPaginaFormulario.css'
import { FaCheck } from 'react-icons/fa'
import { Alerta } from '../../shared/componentes/alerta'
import { criarAgendamento, listarServicos } from '../../shared/rotas_api/rotas-api.service'
import { usuarioAutenticado } from '../../shared/auth/auth.service'

const estiloCampo = {
  backgroundColor: 'var(--bs-light)',
  borderColor: 'var(--bs-primary)'
}

const dadosAgendamentoInicial = {
  nome: '',
  telefone: '',
  horario: '',
  data: '',
  endereco: '',
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
  const [alertaVisivel, setAlertaVisivel] = useState({ visivel: false, mensagem: "" })

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
    return valor.trim() === '' ? `${nomeCampo} é obrigatório` : ''
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
      setAlertaVisivel({
        visivel: true,
        mensagem: 'Para enviar um agendamento, faça login no site.'
      })
      return
    }

    const camposObrigatorios = {
      nome: 'Nome',
      telefone: 'Telefone',
      horario: 'Horário',
      data: 'Data',
      endereco: 'Endereço',
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
      await criarAgendamento(dadosAgendamento)
      setAlertaVisivel({ visivel: true, mensagem: "Agendamento confirmado com sucesso!" })
      setDadosAgendamento(dadosAgendamentoInicial)
    } catch (error) {
      console.error('Erro ao enviar dados:', error)
      setAlertaVisivel({ visivel: true, mensagem: "Ocorreu um erro ao confirmar o agendamento. Por favor, tente novamente." })
    }
  }

  return (
    <div className="px-3 px-sm-4 px-md-5 py-4 py-lg-5 mx-auto" style={{ maxWidth: '1320px' }}>
      {alertaVisivel.visivel && (
        <Alerta
          mensagem={ alertaVisivel.mensagem }
          onFechar={() => setAlertaVisivel({ visivel: false, mensagem: "" })}
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
            <label htmlFor="nome" className="form-label">Nome*</label>
            <input
              id="nome"
              type="text"
              className={`form-control form-control-lg rounded-3 border-1 ${erros.nome ? 'is-invalid' : ''}`}
              style={estiloCampo}
              placeholder="Nome..."
              value={dadosAgendamento.nome}
              onChange={atualizarCampoObrigatorio('nome', 'Nome')}
              required
            />
            {erros.nome && <div className="invalid-feedback">{erros.nome}</div>}
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="telefone" className="form-label">Telefone*</label>
            <input
              id="telefone"
              type="tel"
              className={`form-control form-control-lg rounded-3 border-1 ${erros.telefone ? 'is-invalid' : ''}`}
              style={estiloCampo}
              placeholder="00 00000-0000"
              value={dadosAgendamento.telefone}
              onChange={atualizarCampoObrigatorio('telefone', 'Telefone')}
              required
            />
            {erros.telefone && <div className="invalid-feedback">{erros.telefone}</div>}
          </div>

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
            <label htmlFor="endereco" className="form-label">Endereço*</label>
            <input
              id="endereco"
              type="text"
              className={`form-control form-control-lg rounded-3 border-1 ${erros.endereco ? 'is-invalid' : ''}`}
              style={estiloCampo}
              placeholder="Ex: Rua Bororos, 230"
              value={dadosAgendamento.endereco}
              onChange={atualizarCampoObrigatorio('endereco', 'Endereço')}
              required
            />
            {erros.endereco && <div className="invalid-feedback">{erros.endereco}</div>}
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