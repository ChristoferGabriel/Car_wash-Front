import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Footer } from '../../shared/componentes/footer'
import { Header } from '../../shared/componentes/header'
import { ModalLogin } from '../componentesEspecificos/modalLogin'
import {
  atualizarJanelaAdmin,
  criarJanelaAdmin,
  listarJanelasAdmin,
  removerJanelaAdmin
} from '../../shared/rotas_api/rotas-api.service'
import { administradorAutenticado, usuarioAutenticado } from '../../shared/auth/auth.service'

const janelaInicial = {
  data: '',
  hora_inicio: '',
  hora_fim: '',
  capacidade: 1,
  observacao: ''
}

export default function PaginaJanelasAdmin() {
  const navigate = useNavigate()
  const [autorizado, setAutorizado] = useState(administradorAutenticado)
  const [loginAberto, setLoginAberto] = useState(() => !usuarioAutenticado())
  const [janelas, setJanelas] = useState([])
  const [janela, setJanela] = useState(janelaInicial)
  const [erro, setErro] = useState('')
  const [editando, setEditando] = useState(null)

  const carregar = () => listarJanelasAdmin()
    .then((resposta) => setJanelas(resposta.data || resposta || []))
    .catch((error) => setErro(error.response?.data?.message || 'Não foi possível carregar as janelas.'))

  useEffect(() => {
    const atualizar = () => {
      const admin = administradorAutenticado()
      setAutorizado(admin)
      if (usuarioAutenticado() && !admin) navigate('/', { replace: true })
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

  const salvar = async (evento) => {
    evento.preventDefault()
    try {
      if (editando) {
        await atualizarJanelaAdmin(editando, {
          hora_inicio: janela.hora_inicio,
          hora_fim: janela.hora_fim,
          capacidade: Number(janela.capacidade),
          observacao: janela.observacao
        })
      } else {
        await criarJanelaAdmin({ ...janela, capacidade: Number(janela.capacidade) })
      }
      setJanela(janelaInicial)
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
        tituloNavegacao2="/admin/agendamentos"
        navegacao2="Pedidos"
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
          <form onSubmit={salvar} className="row g-2 mb-4">
            <div className="col-md-2"><input className="form-control" type="date" value={janela.data} onChange={atualizarCampo('data')} disabled={Boolean(editando)} required={!editando} /></div>
            <div className="col-md-2"><input className="form-control" type="time" value={janela.hora_inicio} onChange={atualizarCampo('hora_inicio')} required /></div>
            <div className="col-md-2"><input className="form-control" type="time" value={janela.hora_fim} onChange={atualizarCampo('hora_fim')} required /></div>
            <div className="col-md-2"><input className="form-control" type="number" min="1" value={janela.capacidade} onChange={atualizarCampo('capacidade')} /></div>
            <div className="col-md-3"><input className="form-control" placeholder="Observação" value={janela.observacao} onChange={atualizarCampo('observacao')} /></div>
            <div className="col-md-1"><button className="btn btn-primary w-100">{editando ? 'Salvar' : 'Criar'}</button></div>
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
          if (!administradorAutenticado()) navigate('/', { replace: true })
        }} />
      )}
    </main>
  )
}
