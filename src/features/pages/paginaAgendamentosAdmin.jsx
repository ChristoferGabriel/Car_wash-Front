import { Footer } from '../../shared/componentes/footer'
import { Header } from '../../shared/componentes/header'
import { ListaAgendamentosMock } from '../componentesEspecificos/listaAgendamentosMock'
import { Link, useNavigate } from 'react-router-dom'
import { administradorPodeVisualizar, usuarioAutenticado } from '../../shared/auth/auth.service'
import { useEffect, useState } from 'react'
import { ModalLogin } from '../componentesEspecificos/modalLogin'
import { ModalDetalhesAgendamento } from '../componentesEspecificos/modalDetalhesAgendamento'
import { useServicos } from '../../shared/servicos/use-servicos'
import {
  listarAgendamentosAdmin,
  confirmarAgendamentoAdmin,
  recusarAgendamentoAdmin,
  concluirAgendamentoAdmin
} from '../../shared/rotas_api/rotas-api.service'

export default function PaginaAgendamentosAdmin() {
  const navigate = useNavigate()
  const [loginAberto, setLoginAberto] = useState(() => !administradorPodeVisualizar())
  const [autorizado, setAutorizado] = useState(administradorPodeVisualizar)
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [agendamentoDetalhado, setAgendamentoDetalhado] = useState(null)
  const { servicos } = useServicos()

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

  const obterNomeServico = (agendamento) => {
    const servico = agendamento.servico
      || agendamento.servico_nome
      || agendamento.servicos?.[0]?.servico
      || agendamento.servicos?.[0]
    if (typeof servico === 'string') return servico
    if (servico?.nome) return servico.nome
    const servicoId = agendamento.servico_id
      || servico?.servico_id
      || servico?.pivot?.servico_id
      || servico?.id
      || agendamento.servicos?.[0]?.pivot?.servico_id
      || agendamento.servicos?.[0]?.servico_id
      || agendamento.servicos?.[0]?.id
    return servicos.find((item) => String(item.id) === String(servicoId))?.nome || 'Serviço'
  }

  const atualizarStatus = async (id, status) => {
    try {
      const acoes = {
        confirmado: confirmarAgendamentoAdmin,
        recusado: recusarAgendamentoAdmin,
        concluido: concluirAgendamentoAdmin
      }
      const statusApi = status === 'recusado' ? 'cancelado' : status
      const resposta = await acoes[status](id)
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
                onDetalhes={setAgendamentoDetalhado}
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
      {agendamentoDetalhado && (
        <ModalDetalhesAgendamento
          agendamento={agendamentoDetalhado}
          servico={obterNomeServico(agendamentoDetalhado)}
          onClose={() => setAgendamentoDetalhado(null)}
        />
      )}
    </main>
  )
}
