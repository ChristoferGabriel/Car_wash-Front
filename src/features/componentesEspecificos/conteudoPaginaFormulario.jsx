import { useState } from 'react'
import { Botao } from '../../shared/componentes/botao'
import './ConteudoPaginaFormulario.css'

const servicosDisponiveis = [
  'Lavagem de Muros e Paredes Externas',
  'Lavagem de Portões e Grades',
  'Lavagem de Fachadas e Revestimentos',
  'Lavagem de Calçadas e Pisos Externos',
  'Lavagem de Pedras e Revestimentos',
  'Lavagem de Garagens e Áreas de Circulação',
  'Lavagem de Áreas de Lazer',
  'Lavagem de Áreas PET e Espaços Externos'
]

const estiloCampo = {
  backgroundColor: 'var(--bs-light)',
  borderColor: 'var(--bs-primary)'
}

const formatarTelefone = (valor) => {
  return valor .replace(/\D/g, '') .substring(0, 11) .replace(/^(\d{2})(\d)/, '$1 $2') .replace(/(\d{5})(\d)/, '$1-$2')
}

export const ConteudoPaginaFormulario = () => {
  const [dadosAgendamento, setDadosAgendamento] = useState({
    nome: '',
    telefone: '',
    horario: '',
    data: '',
    endereco: '',
    servico: '',
    anexos: null
  })

 const atualizarCampo = (campo) => (evento) => {
    let valor = campo === 'anexos' ? evento.target.files : evento.target.value
    if (campo === 'telefone') {
      valor = formatarTelefone(valor)
    }

    setDadosAgendamento((atual) => ({ ...atual, [campo]: valor }))
  }

  const confirmarAgendamento = (evento) => {
    evento.preventDefault()
    //integrar com o backend de agendamentos
    console.log('Agendamento a confirmar:', dadosAgendamento)
  }

  return (
    <div className="px-3 px-sm-4 px-md-5 py-4 py-lg-5 mx-auto" style={{ maxWidth: '1320px' }}>
      <h1 className="fw-bold text-center mb-4 fs-4 fs-sm-3 fs-md-2 fs-lg-1">
        Agendamento
      </h1>

      <form
        onSubmit={confirmarAgendamento}
        className="rounded-4 p-3 p-sm-4 p-lg-5"
        style={{ backgroundColor: '#d4d4d4' }}
      >
        <div className="row g-3 g-sm-4 g-lg-5">
          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="nome" className="form-label">Nome*</label>
            <input
              id="nome"
              type="text"
              className="form-control form-control-lg rounded-3 border-1"
              style={estiloCampo}
              placeholder="Nome..."
              value={dadosAgendamento.nome}
              onChange={atualizarCampo('nome')}
              required
            />
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="telefone" className="form-label">Telefone*</label>
            <input
              id="telefone"
              type="tel"
              className="form-control form-control-lg rounded-3 border-1"
              style={estiloCampo}
              placeholder="00 00000-0000"
              value={dadosAgendamento.telefone}
              onChange={atualizarCampo('telefone')}
              required
            />
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="horario" className="form-label">Horário*</label>
            <input
              id="horario"
              type="time"
              className="form-control form-control-lg rounded-3 border-1"
              style={estiloCampo}
              value={dadosAgendamento.horario}
              onChange={atualizarCampo('horario')}
              required
            />
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="data" className="form-label">Data*</label>
            <input
              id="data"
              type="date"
              className="form-control form-control-lg rounded-3 border-1"
              style={estiloCampo}
              value={dadosAgendamento.data}
              onChange={atualizarCampo('data')}
              required
            />
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="endereco" className="form-label">Endereço*</label>
            <input
              id="endereco"
              type="text"
              className="form-control form-control-lg rounded-3 border-1"
              style={estiloCampo}
              placeholder="Ex: Rua Bororos, 230"
              value={dadosAgendamento.endereco}
              onChange={atualizarCampo('endereco')}
              required
            />
          </div>

          <div className="col-12 col-sm-6 col-lg-4">
            <label htmlFor="servico" className="form-label">Serviço*</label>
            <select
              id="servico"
              className="form-select form-select-lg rounded-3 border-1"
              style={estiloCampo}
              value={dadosAgendamento.servico}
              onChange={atualizarCampo('servico')}
              required
            >
              <option value="" disabled>Selecione...</option>
              {servicosDisponiveis.map((servico) => (
                <option key={servico} value={servico}>{servico}</option>
              ))}
            </select>
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
          <Botao texto="Confirmar Agendamento" />
        </div>
      </form>
    </div>
  )
}