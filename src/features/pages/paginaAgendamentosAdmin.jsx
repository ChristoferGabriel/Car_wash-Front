import { Footer } from '../../shared/componentes/footer'
import { Header } from '../../shared/componentes/header'
import { ListaAgendamentosMock } from '../componentesEspecificos/listaAgendamentosMock'
import { Link, useNavigate } from 'react-router-dom'
import { administradorPodeVisualizar, usuarioAutenticado } from '../../shared/auth/auth.service'
import { useEffect, useState } from 'react'
import { ModalLogin } from '../componentesEspecificos/modalLogin'
import { listarAgendamentosAdmin, atualizarAgendamentoAdmin } from '../../shared/rotas_api/rotas-api.service'

export default function PaginaAgendamentosAdmin() {
  const navigate = useNavigate()
  const [loginAberto, setLoginAberto] = useState(() => !administradorPodeVisualizar())
  const [autorizado, setAutorizado] = useState(administradorPodeVisualizar)
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const atualizarAutorizacao = () => {
      const admin = administradorPodeVisualizar()
      setAutorizado(admin)
      if (!import.meta.env.DEV && usuarioAutenticado() && !admin) {
        navigate('/', { replace: true })
      }
    }

    atualizarAutorizacao()
    window.addEventListener('auth-change', atualizarAutorizacao)
    const redirecionarAposFecharAlerta = () => {
      navigate('/', { replace: true })
    }

    window.addEventListener('logout-alert-closed', redirecionarAposFecharAlerta)
    return () => {
      window.removeEventListener('auth-change', atualizarAutorizacao)
      window.removeEventListener('logout-alert-closed', redirecionarAposFecharAlerta)
    }
  }, [navigate])

  useEffect(() => {
    if (!autorizado) return
    Promise.resolve()
      .then(() => {
        setCarregando(true)
        setErro('')
        return listarAgendamentosAdmin()
      })
      .then((resposta) => setAgendamentos(resposta.data || resposta || []))
      .catch((error) => {
        console.error('Erro ao carregar pedidos:', error)
        setErro('Não foi possível carregar os agendamentos dos clientes.')
      })
      .finally(() => setCarregando(false))
  }, [autorizado])

  const atualizarStatus = async (id, status) => {
    try {
      const statusApi = status === 'recusado' ? 'cancelado' : status
      const resposta = await atualizarAgendamentoAdmin(id, { status: statusApi })
      const atualizado = resposta.data || resposta
      setAgendamentos((atuais) => statusApi === 'cancelado'
        ? atuais.filter((item) => item.id !== id)
        : atuais.map((item) =>
          item.id === id ? { ...item, ...atualizado, status: statusApi } : item
        ))
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error)
      setErro(error.response?.data?.message || 'Não foi possível atualizar o agendamento.')
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
      <section className="flex-grow-1">
        {autorizado && (
          <section className="appointments-page">
            <div className="admin-appointments-action">
              <Link className="btn btn-outline-primary" to="/admin/janelas">
                Gerenciar janelas
              </Link>
            </div>
            <div className="appointments-heading">
              <h1>Agendamentos clientes</h1>
              <p>Gerencie os pedidos recebidos dos clientes.</p>
            </div>
            {erro ? (
              <div className="alert alert-danger" role="alert">{erro}</div>
            ) : carregando ? (
              <div className="alert alert-info" role="status">Carregando agendamentos...</div>
            ) : (
              <ListaAgendamentosMock
                key={agendamentos.map(({ id, status }) => `${id}-${status}`).join('|')}
                modo="admin"
                agendamentosIniciais={agendamentos}
                onStatusChange={atualizarStatus}
                exibirCabecalho={false}
              />
            )}
          </section>
        )}
      </section>
      <Footer logo="/logo.webp" />
      {loginAberto && (
        <ModalLogin
          modoAdmin
          onClose={() => {
            setLoginAberto(false)
            if (!administradorPodeVisualizar()) {
              navigate('/', { replace: true })
            }
          }}
        />
      )}
    </main>
  )
}
