import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Footer } from '../../shared/componentes/footer'
import { Header } from '../../shared/componentes/header'
import { ModalLogin } from '../componentesEspecificos/modalLogin'
import {
  atualizarJanelaAdmin,
  criarJanelaAdmin,
  criarJanelasEmLoteAdmin,
  listarJanelasAdmin,
  removerJanelaAdmin
} from '../../shared/rotas_api/rotas-api.service'
import { administradorPodeVisualizar, usuarioAutenticado } from '../../shared/auth/auth.service'

const janelaInicial = {
  data: '',
  hora_inicio: '',
  hora_fim: '',
  capacidade: 1,
  observacao: ''
}

const loteInicial = {
  data_inicio: '',
  data_fim: '',
  dias_semana: [],
  hora_inicio: '',
  hora_fim: '',
  intervalo_minutos: 60,
  capacidade: 1,
  observacao: ''
}

const diasDaSemana = [
  ['1', 'Segunda'], ['2', 'Terça'], ['3', 'Quarta'], ['4', 'Quinta'],
  ['5', 'Sexta'], ['6', 'Sábado'], ['0', 'Domingo']
]

export default function PaginaJanelasAdmin() {
  const navigate = useNavigate()
  const [autorizado, setAutorizado] = useState(administradorPodeVisualizar)
  const [loginAberto, setLoginAberto] = useState(() => !administradorPodeVisualizar())
  const [janelas, setJanelas] = useState([])
  const [janela, setJanela] = useState(janelaInicial)
  const [erro, setErro] = useState('')
  const [editando, setEditando] = useState(null)
  const [criarEmLote, setCriarEmLote] = useState(false)
  const [lote, setLote] = useState(loteInicial)

  const carregar = () => listarJanelasAdmin()
    .then((resposta) => setJanelas(resposta.data || resposta || []))
    .catch((error) => setErro(error.response?.data?.message || 'Não foi possível carregar as janelas.'))

  useEffect(() => {
    const atualizar = () => {
      const admin = administradorPodeVisualizar()
      setAutorizado(admin)
      if (!import.meta.env.DEV && usuarioAutenticado() && !admin) navigate('/', { replace: true })
    }
    atualizar()
    window.addEventListener('auth-change', atualizar)
    return () => window.removeEventListener('auth-change', atualizar)
  }, [navigate])

  useEffect(() => {
    if (autorizado) carregar()
  }, [autorizado])

  const atualizarCampo = (campo) => (evento) =>
    setJanela((atual) => ({ ...atual, [campo]: evento.target.value }))

  const atualizarCampoLote = (campo) => (evento) =>
    setLote((atual) => ({ ...atual, [campo]: evento.target.value }))

  const alternarDia = (dia) => {
    setLote((atual) => ({
      ...atual,
      dias_semana: atual.dias_semana.includes(dia)
        ? atual.dias_semana.filter((item) => item !== dia)
        : [...atual.dias_semana, dia]
    }))
  }

  const salvar = async (evento) => {
    evento.preventDefault()
    try {
      if (criarEmLote) {
        await criarJanelasEmLoteAdmin({
          ...lote,
          dias_semana: lote.dias_semana.map(Number),
          intervalo_minutos: Number(lote.intervalo_minutos),
          capacidade: Number(lote.capacidade)
        })
      } else if (editando) {
        await atualizarJanelaAdmin(editando, {
          hora_inicio: janela.hora_inicio,
          hora_fim: janela.hora_fim,
          capacidade: Number(janela.capacidade),
          observacao: janela.observacao
        })
      } else {
        await criarJanelaAdmin({ ...janela, capacidade: Number(janela.capacidade) })
      }
      setJanela({ ...janelaInicial })
      setLote({ ...loteInicial })
      setEditando(null)
      setErro('')
      await carregar()
    } catch (error) {
      setErro(error.response?.data?.message || 'Não foi possível salvar a janela.')
    }
  }

  const excluir = async (id) => {
    try {
      await removerJanelaAdmin(id)
      setJanelas((atuais) => atuais.filter((item) => item.id !== id))
    } catch (error) {
      const agendamentos = error.response?.data?.agendamentos
      setErro(agendamentos?.length
        ? `A janela possui agendamentos: ${agendamentos.join(', ')}.`
        : error.response?.data?.message || 'Não foi possível excluir a janela.')
    }
  }

  return (
    <main className="min-vh-100 d-flex flex-column">
      <Header
        logo="logo.webp"
        tituloNavegacao1="/"
        navegacao1="Página Principal"
        tituloNavegacao2="/agendar"
        navegacao2="Agendar"
        onLoginClick={() => setLoginAberto(true)}
      />
      {autorizado && (
        <section className="container py-4 flex-grow-1">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h1>Janelas de atendimento</h1>
              <p>Crie e gerencie os horários disponíveis para os clientes.</p>
            </div>
            <Link className="btn btn-outline-primary" to="/admin/agendamentos">Pedidos</Link>
          </div>
          {erro && <div className="alert alert-danger">{erro}</div>}
          <div className="form-check mb-3">
            <input
              id="criar-em-lote"
              className="form-check-input"
              type="checkbox"
              checked={criarEmLote}
              disabled={Boolean(editando)}
              onChange={(evento) => setCriarEmLote(evento.target.checked)}
            />
            <label className="form-check-label" htmlFor="criar-em-lote">Criar em lote</label>
          </div>
          <form onSubmit={salvar} className="row g-2 mb-4">
            {criarEmLote ? (
              <>
                <div className="col-md-2"><label className="form-label">Data inicial</label><input className="form-control" type="date" value={lote.data_inicio} onChange={atualizarCampoLote('data_inicio')} required /></div>
                <div className="col-md-2"><label className="form-label">Data final</label><input className="form-control" type="date" value={lote.data_fim} onChange={atualizarCampoLote('data_fim')} required /></div>
                <div className="col-12">
                  <span className="form-label d-block">Dias da semana</span>
                  {diasDaSemana.map(([valor, nome]) => (
                    <div className="form-check form-check-inline" key={valor}>
                      <input id={`dia-${valor}`} className="form-check-input" type="checkbox" checked={lote.dias_semana.includes(valor)} onChange={() => alternarDia(valor)} />
                      <label className="form-check-label" htmlFor={`dia-${valor}`}>{nome}</label>
                    </div>
                  ))}
                </div>
                <div className="col-md-2"><label className="form-label">Hora inicial</label><input className="form-control" type="time" value={lote.hora_inicio} onChange={atualizarCampoLote('hora_inicio')} required /></div>
                <div className="col-md-2"><label className="form-label">Hora final</label><input className="form-control" type="time" value={lote.hora_fim} onChange={atualizarCampoLote('hora_fim')} required /></div>
                <div className="col-md-2"><label className="form-label">Intervalo (min.)</label><input className="form-control" type="number" min="1" value={lote.intervalo_minutos} onChange={atualizarCampoLote('intervalo_minutos')} required /></div>
                <div className="col-md-2"><label className="form-label">Capacidade</label><input className="form-control" type="number" min="1" value={lote.capacidade} onChange={atualizarCampoLote('capacidade')} required /></div>
                <div className="col-md-3"><label className="form-label">Observação</label><input className="form-control" value={lote.observacao} onChange={atualizarCampoLote('observacao')} /></div>
                <div className="col-md-1 d-flex align-items-end"><button className="btn btn-primary w-100">Criar</button></div>
              </>
            ) : (
              <>
                <div className="col-md-2"><input className="form-control" type="date" value={janela.data} onChange={atualizarCampo('data')} disabled={Boolean(editando)} required={!editando} /></div>
                <div className="col-md-2"><input className="form-control" type="time" value={janela.hora_inicio} onChange={atualizarCampo('hora_inicio')} required /></div>
                <div className="col-md-2"><input className="form-control" type="time" value={janela.hora_fim} onChange={atualizarCampo('hora_fim')} required /></div>
                <div className="col-md-2"><input className="form-control" type="number" min="1" value={janela.capacidade} onChange={atualizarCampo('capacidade')} /></div>
                <div className="col-md-3"><input className="form-control" placeholder="Observação" value={janela.observacao} onChange={atualizarCampo('observacao')} /></div>
                <div className="col-md-1"><button className="btn btn-primary w-100">{editando ? 'Salvar' : 'Criar'}</button></div>
              </>
            )}
          </form>
          <div className="list-group">
            {janelas.map((item) => (
              <div className="list-group-item d-flex justify-content-between align-items-center" key={item.id}>
                <span><strong>{item.data}</strong> {item.hora_inicio}–{item.hora_fim} · capacidade {item.capacidade}</span>
                <span className="d-flex gap-2">
                  <button className="btn btn-sm btn-outline-primary" onClick={() => { setEditando(item.id); setJanela(item) }}>Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(item.id)}>Apagar</button>
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
      <Footer logo="/logo.webp" />
      {loginAberto && (
        <ModalLogin modoAdmin onClose={() => {
          setLoginAberto(false)
          if (!administradorPodeVisualizar()) navigate('/', { replace: true })
        }} />
      )}
    </main>
  )
}
