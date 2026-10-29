import { useEffect, useState } from 'react'
import { Botao } from '../../shared/componentes/botao'
import '../../shared/styles/conteudoPaginaFormulario.css'
import { FaCheck } from 'react-icons/fa'
import { Alerta } from '../../shared/componentes/alerta'
import {
  criarAgenda,
  criarEndereco,
  listarDiasDisponiveis,
  listarEnderecos,
  listarHorariosDisponiveis
} from '../../shared/rotas_api/rotas-api.service'
import { usuarioAutenticado } from '../../shared/auth/auth.service'
import { useAlerta } from '../../shared/hooks/useAlerta'
import { obterErrosDeCampo, obterMensagemDaApi, possuiErrosDeCampo } from '../../shared/api/api-errors'
import { useServicos } from '../../shared/servicos/use-servicos'

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
  cidade: '',
  cep: '',
  endereco_id: '',
  servico_id: '',
  anexos: null
}

const formatarTelefone = (valor) => {
  return valor .replace(/\D/g, '') .substring(0, 11) .replace(/^(\d{2})(\d)/, '$1 $2') .replace(/(\d{5})(\d)/, '$1-$2')
}

export const ConteudoPaginaFormulario = () => {
  const [estaAutenticado, setEstaAutenticado] = useState(usuarioAutenticado)
  const { servicos: servicosDisponiveis, erro: erroServicos } = useServicos()
  const [dadosAgendamento, setDadosAgendamento] = useState({ ...dadosAgendamentoInicial })
  const [erros, setErros] = useState({})
  const [enderecos, setEnderecos] = useState([])
  const [diasDisponiveis, setDiasDisponiveis] = useState([])
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([])
  const [carregandoDisponibilidade, setCarregandoDisponibilidade] = useState(false)
  const { alerta, mostrarAlerta, fecharAlerta } = useAlerta()

  useEffect(() => {
    const atualizarAutenticacao = () => {
      setEstaAutenticado(usuarioAutenticado())
    }

    window.addEventListener('auth-change', atualizarAutenticacao)
    return () => window.removeEventListener('auth-change', atualizarAutenticacao)
  }, [])

  useEffect(() => {
    if (!estaAutenticado) return
    listarEnderecos()
      .then((resposta) => setEnderecos(resposta.data || resposta || []))
      .catch((error) => console.error('Erro ao carregar endereços:', error))
  }, [estaAutenticado])

  useEffect(() => {
    if (!dadosAgendamento.servico_id || !dadosAgendamento.data) {
      return
    }

    Promise.resolve()
      .then(() => {
        setCarregandoDisponibilidade(true)
        return listarHorariosDisponiveis(
          dadosAgendamento.data,
          dadosAgendamento.servico_id
        )
      })
      .then((resposta) => setHorariosDisponiveis(resposta.data || resposta || []))
      .catch((error) => {
        console.error('Erro ao carregar horários:', error)
        setHorariosDisponiveis([])
      })
      .finally(() => setCarregandoDisponibilidade(false))
  }, [dadosAgendamento.data, dadosAgendamento.servico_id])

  useEffect(() => {
    if (!dadosAgendamento.servico_id) return
    const agora = new Date()
    const mes = `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}`
    Promise.resolve()
      .then(() => {
        setDiasDisponiveis([])
        setHorariosDisponiveis([])
        return listarDiasDisponiveis(mes, dadosAgendamento.servico_id)
      })
      .then((resposta) => setDiasDisponiveis(resposta.data || resposta || []))
      .catch((error) => console.error('Erro ao carregar dias disponíveis:', error))
  }, [dadosAgendamento.servico_id])

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
      cidade: 'Cidade',
      cep: 'CEP',
      servico_id: 'Serviço'
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
      let enderecoId = dadosAgendamento.endereco_id
      if (!enderecoId) {
        const endereco = await criarEndereco({
          rua: dadosAgendamento.rua,
          numero: dadosAgendamento.numero,
          bairro: dadosAgendamento.bairro,
          cidade: dadosAgendamento.cidade,
          cep: dadosAgendamento.cep
        })
        enderecoId = endereco.id || endereco.data?.id
      }

      const horarioSelecionado = horariosDisponiveis.find((horario) =>
        horario.inicio === dadosAgendamento.horario
      )
      await criarAgenda({
        endereco_id: enderecoId,
        data_hora: horarioSelecionado?.inicio || `${dadosAgendamento.data}T${dadosAgendamento.horario}:00`,
        servicos: [{ servico_id: Number(dadosAgendamento.servico_id), quantidade: 1 }]
      })
      mostrarAlerta("Agendamento enviado com sucesso! Aguarde a confirmação da empresa, que entrará em contato.")
      setDadosAgendamento({ ...dadosAgendamentoInicial })
      setErros({})
    } catch (error) {
      console.error('Erro ao enviar dados:', error)
      const errosDaApi = obterErrosDeCampo(error)
      setErros((atuais) => ({ ...atuais, ...errosDaApi }))
      if (!possuiErrosDeCampo(errosDaApi)) {
        mostrarAlerta(obterMensagemDaApi(error, "Ocorreu um erro ao enviar o agendamento. Por favor, tente novamente."))
      }
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
      <div className="appointments-heading">
        <h1>Agendamento</h1>
      </div>

      {!estaAutenticado && (
        <div className="alert alert-warning text-center" role="alert">
          Para preencher e enviar a agenda, faça login no site.
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
          <div className="col-12">
            <label htmlFor="endereco_id" className="form-label">Endereço salvo</label>
            <select
              id="endereco_id"
              className="form-select form-select-lg rounded-3 border-1"
              style={estiloCampo}
              value={dadosAgendamento.endereco_id}
              onChange={(evento) => {
                const endereco = enderecos.find((item) => String(item.id) === evento.target.value)
                setDadosAgendamento((atual) => ({
                  ...atual,
                  endereco_id: evento.target.value,
                  rua: endereco?.rua || atual.rua,
                  numero: endereco?.numero || atual.numero,
                  bairro: endereco?.bairro || atual.bairro,
                  cidade: endereco?.cidade || atual.cidade,
                  cep: endereco?.cep || atual.cep
                }))
              }}
            >
              <option value="">Usar um novo endereço</option>
              {enderecos.map((endereco) => (
                <option key={endereco.id} value={endereco.id}>
                  {endereco.endereco_completo || `${endereco.rua}, ${endereco.numero} - ${endereco.cidade}`}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="servico_id" className="form-label">Serviço*</label>
            {erroServicos && (
              <div className="alert alert-danger text-center py-2" role="alert">
                {erroServicos}
              </div>
            )}
            <select
              id="servico_id"
              className={`form-select form-select-lg rounded-3 border-1 ${erros.servico_id ? 'is-invalid' : ''}`}
              style={estiloCampo}
              value={dadosAgendamento.servico_id}
              onChange={(evento) => {
                atualizarCampoObrigatorio('servico_id', 'Serviço')(evento)
                setDadosAgendamento((atual) => ({
                  ...atual,
                  data: '',
                  horario: ''
                }))
                setDiasDisponiveis([])
                setHorariosDisponiveis([])
              }}
              required
            >
              <option value="" disabled>Selecione...</option>
              {servicosDisponiveis.map((servico) => (
                <option key={servico.id} value={servico.id}>{servico.nome}</option>
              ))}
            </select>
            {erros.servico_id && <div className="invalid-feedback">{erros.servico_id}</div>}
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="data" className="form-label">Data*</label>
            <select
              id="data"
              className={`form-control form-control-lg rounded-3 border-1 ${erros.data ? 'is-invalid' : ''}`}
              style={estiloCampo}
              value={dadosAgendamento.data}
              onChange={atualizarCampoObrigatorio('data', 'Data')}
              required
              disabled={!dadosAgendamento.servico_id}
            >
              <option value="" disabled>Selecione um dia com vaga...</option>
              {diasDisponiveis.map((dia) => (
                <option key={dia.data} value={dia.data}>
                  {new Date(`${dia.data}T12:00:00`).toLocaleDateString('pt-BR')} ({dia.livres} vagas)
                </option>
              ))}
            </select>
            {erros.data && <div className="invalid-feedback">{erros.data}</div>}
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="horario" className="form-label">Horário*</label>
            <select
              id="horario"
              className={`form-control form-control-lg rounded-3 border-1 ${erros.horario ? 'is-invalid' : ''}`}
              style={estiloCampo}
              value={dadosAgendamento.horario}
              onChange={atualizarCampoObrigatorio('horario', 'Horário')}
              required
              disabled={!dadosAgendamento.data}
            >
              <option value="" disabled>
                {carregandoDisponibilidade ? 'Carregando horários...' : 'Selecione um horário...'}
              </option>
              {horariosDisponiveis.map((horario) => (
                <option key={horario.inicio} value={horario.inicio}>
                  {new Date(horario.inicio).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </option>
              ))}
            </select>
            {erros.horario && <div className="invalid-feedback">{erros.horario}</div>}
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

          {[
            ['cidade', 'Cidade', 'Ex: Curitiba'],
            ['cep', 'CEP', 'Ex: 80000-000']
          ].map(([campo, rotulo, placeholder]) => (
            <div className="col-12 col-sm-6 col-lg-4" key={campo}>
              <label htmlFor={campo} className="form-label">{rotulo}*</label>
              <input
                id={campo}
                type="text"
                inputMode={campo === 'cep' ? 'numeric' : undefined}
                maxLength={campo === 'cep' ? 8 : undefined}
                className={`form-control form-control-lg rounded-3 border-1 ${erros[campo] ? 'is-invalid' : ''}`}
                style={estiloCampo}
                placeholder={placeholder}
                value={dadosAgendamento[campo]}
                onChange={atualizarCampoObrigatorio(campo, rotulo)}
                required
              />
              {erros[campo] && <div className="invalid-feedback">{erros[campo]}</div>}
            </div>
          ))}

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