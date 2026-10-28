import { Footer } from '../../shared/componentes/footer'
import { Header } from '../../shared/componentes/header'
import { ListaAgendamentosMock } from '../componentesEspecificos/listaAgendamentosMock'
import { usuarioAutenticado } from '../../shared/auth/auth.service'
import { useEffect, useState } from 'react'
import { ModalLogin } from '../componentesEspecificos/modalLogin'

export default function PaginaAgendamentos() {
  const [autenticado, setAutenticado] = useState(usuarioAutenticado)
  const [loginAberto, setLoginAberto] = useState(false)

  useEffect(() => {
    const atualizarAutenticacao = () => {
      setAutenticado(usuarioAutenticado())
    }

    window.addEventListener('auth-change', atualizarAutenticacao)
    return () => window.removeEventListener('auth-change', atualizarAutenticacao)
  }, [])

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
          <ListaAgendamentosMock modo="cliente" />
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
