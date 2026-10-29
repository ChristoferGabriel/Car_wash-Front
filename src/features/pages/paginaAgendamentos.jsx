import { Footer } from '../../shared/componentes/footer'
import { Header } from '../../shared/componentes/header'
import { CartaoAgendamento } from '../componentesEspecificos/cartaoAgendamento'
import { cancelarAgendamentoCliente, listarAgendamentosCliente } from '../../shared/rotas_api/rotas-api.service'
import { usuarioAutenticado } from '../../shared/auth/auth.service'
import { useEffect, useState } from 'react'
import { ModalLogin } from '../componentesEspecificos/modalLogin'
import { formatarDataHoraLocal } from '../../shared/datas/date-time'

export default function PaginaAgendamentos() {
  const [autenticado, setAutenticado] = useState(usuarioAutenticado)
  const [loginAberto, setLoginAberto] = useState(false)
  const [agendamentos, setAgendamentos] = useState([])
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const atualizarAutenticacao = () => {
      setAutenticado(usuarioAutenticado())
    }

    window.addEventListener('auth-change', atualizarAutenticacao)
    return () => window.removeEventListener('auth-change', atualizarAutenticacao)
  }, [])

  useEffect(() => {
    if (!autenticado) return
    Promise.resolve()
      .then(() => {
        setCarregando(true)
        setErro('')
        return listarAgendamentosCliente()
      })
      .then((resposta) => setAgendamentos(resposta.data || resposta || []))
      .catch((error) => {
        console.error('Erro ao carregar agendamentos:', error)
        const status = error.response?.status
        setErro(
          status === 405
            ? 'A API atualmente não disponibiliza a listagem de agendamentos para o cliente (GET /api/agendamentos). Atualize o contrato do Prism ou o backend.'
            : 'Não foi possível carregar seus agendamentos.'
        )
      })
      .finally(() => setCarregando(false))
  }, [autenticado])

  const cancelar = async (id) => {
    try {
      await cancelarAgendamentoCliente(id)
      setAgendamentos((atuais) => atuais.filter((item) => item.id !== id))
    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error)
      setErro(error.response?.data?.message || 'Não foi possível cancelar o agendamento.')
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
        {autenticado ? (
          <section className="appointments-page">
            <div className="appointments-heading">
              <h1>Meus Agendamentos</h1>
              <p>Acompanhe o status dos seus pedidos de agendamento.</p>
            </div>
            {erro && <div className="alert alert-danger">{erro}</div>}
            {carregando ? (
              <div className="alert alert-info">Carregando agendamentos...</div>
            ) : agendamentos.length === 0 ? (
              <div className="alert alert-info">Você ainda não possui agendamentos.</div>
            ) : (
              <div className="appointments-list">
                {agendamentos.map((agendamento) => (
                  <CartaoAgendamento
                    key={agendamento.id}
                    agendamento={{
                      ...agendamento,
                      servico: agendamento.servico?.nome || agendamento.servico || 'Serviço',
                      data: agendamento.data_hora
                        ? formatarDataHoraLocal(agendamento.data_hora).split(' ')[0]
                        : agendamento.data,
                      horario: agendamento.data_hora
                        ? formatarDataHoraLocal(agendamento.data_hora).split(' ')[1]
                        : agendamento.horario
                    }}
                    modo="cliente"
                    onCancelar={cancelar}
                  />
                ))}
              </div>
            )}
          </section>
        ) : (
          <div className="appointments-page">
            <div className="alert alert-warning text-center" role="status">
              Para visualizar seus agendamentos, faça login no site.
            </div>
          </div>
        )}
      </section>
      <Footer logo="logo.webp" />
      {loginAberto && <ModalLogin onClose={() => setLoginAberto(false)} />}
    </main>
  )
}
