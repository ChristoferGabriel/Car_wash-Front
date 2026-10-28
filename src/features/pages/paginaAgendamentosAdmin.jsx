import { Footer } from '../../shared/componentes/footer'
import { Header } from '../../shared/componentes/header'
import { ListaAgendamentosMock } from '../componentesEspecificos/listaAgendamentosMock'
import { useNavigate } from 'react-router-dom'
import { administradorAutenticado, usuarioAutenticado } from '../../shared/auth/auth.service'
import { useEffect, useState } from 'react'
import { ModalLogin } from '../componentesEspecificos/modalLogin'

export default function PaginaAgendamentosAdmin() {
  const navigate = useNavigate()
  const [loginAberto, setLoginAberto] = useState(() => !usuarioAutenticado())
  const [autorizado, setAutorizado] = useState(administradorAutenticado)

  useEffect(() => {
    const atualizarAutorizacao = () => {
      const admin = administradorAutenticado()
      setAutorizado(admin)
      if (usuarioAutenticado() && !admin) {
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
        {autorizado && <ListaAgendamentosMock modo="admin" />}
      </section>
      <Footer logo="/logo.webp" />
      {loginAberto && (
        <ModalLogin
          modoAdmin
          onClose={() => {
            setLoginAberto(false)
            if (!administradorAutenticado()) {
              navigate('/', { replace: true })
            }
          }}
        />
      )}
    </main>
  )
}
