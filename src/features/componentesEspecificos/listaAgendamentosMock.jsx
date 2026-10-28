import { useState } from 'react'
import { CartaoAgendamento } from './cartaoAgendamento'
import '../../shared/styles/agendamentos.css'

const agendamentosClienteIniciais = [
  {
    id: 1,
    servico: 'Lavagem Detalhada',
    data: '20/08/2026',
    horario: '10:00',
    status: 'confirmado'
  },
  {
    id: 2,
    servico: 'Lavagem de Portão',
    data: '30/08/2026',
    horario: '15:30',
    status: 'pendente'
  }
]

const agendamentosAdminIniciais = [
  {
    id: 1,
    servico: 'Lavagem Detalhada',
    data: '20/08/2026',
    horario: '10:00',
    nome: 'Caue Alves',
    telefone: '(41) 99584-3603',
    endereco: 'Rua das Flores, 123, Centro, Curitiba - PR, CEP 80000-000',
    status: 'pendente'
  },
  {
    id: 2,
    servico: 'Lavagem de Portão',
    data: '30/08/2026',
    horario: '15:30',
    nome: 'Maria Souza',
    telefone: '(41) 99999-9999',
    endereco: 'Avenida Brasil, 450, Água Verde, Curitiba - PR, CEP 80240-000',
    status: 'confirmado'
  },
  {
    id: 3,
    servico: 'Lavagem de Muro',
    data: '30/08/2026',
    horario: '16:30',
    nome: 'João Silva',
    telefone: '(41) 98888-8888',
    endereco: 'Rua das Palmeiras, 78, Batel, Curitiba - PR, CEP 80420-000',
    status: 'pendente'
  }
]

export const ListaAgendamentosMock = ({ modo }) => {
  const [agendamentos, setAgendamentos] = useState(
    modo === 'admin' ? agendamentosAdminIniciais : agendamentosClienteIniciais
  )

  const atualizarStatus = (id, status) => {
    setAgendamentos((atuais) => {
      if (status === 'cancelado' || (modo === 'admin' && status === 'recusado')) {
        return atuais.filter((agendamento) => agendamento.id !== id)
      }

      return atuais.map((agendamento) =>
        agendamento.id === id ? { ...agendamento, status } : agendamento
      )
    })
  }

  const titulo = modo === 'admin'
    ? 'Agendamentos dos Clientes'
    : 'Meus Agendamentos'

  return (
    <section className="appointments-page">
      <div className="appointments-heading">
        <h1>{titulo}</h1>
        <p>
          {modo === 'admin'
            ? 'Gerencie os pedidos recebidos dos clientes.'
            : 'Acompanhe o status dos seus pedidos de agendamento.'}
        </p>
      </div>

      <div className="appointments-list">
        {agendamentos.length === 0 ? (
          <div className="alert alert-info text-center" role="status">
            Nenhum agendamento pendente no momento.
          </div>
        ) : agendamentos.map((agendamento) => (
          <CartaoAgendamento
            key={agendamento.id}
            agendamento={agendamento}
            modo={modo}
            onCancelar={(id) => atualizarStatus(id, 'cancelado')}
            onAceitar={(id) => atualizarStatus(id, 'confirmado')}
            onRecusar={(id) => atualizarStatus(id, 'recusado')}
          />
        ))}
      </div>
    </section>
  )
}
