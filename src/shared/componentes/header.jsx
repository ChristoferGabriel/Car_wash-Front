import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { ModalConta } from "../../features/componentesEspecificos/modalConta"
import { usuarioAtual, usuarioAutenticado } from "../auth/authMock.service"

export const Header = ({ logo, navegacao1, tituloNavegacao1, navegacao2, tituloNavegacao2, onLoginClick }) => {
  const [contaAberta, setContaAberta] = useState(false)
  const [usuario, setUsuario] = useState(usuarioAtual)
  const [autenticado, setAutenticado] = useState(usuarioAutenticado)

  const titulosDeNavegacao = [
    { titulo: tituloNavegacao1, navegacao: navegacao1 },
    { titulo: tituloNavegacao2, navegacao: navegacao2 },
  ]

  useEffect(() => {
    const atualizarConta = () => {
      setUsuario(usuarioAtual())
      setAutenticado(usuarioAutenticado())
    }

    window.addEventListener('auth-change', atualizarConta)
    return () => window.removeEventListener('auth-change', atualizarConta)
  }, [])

  return (
    <header className="site-header container-fluid bg-dark px-4 py-3">
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
          <Link to={tituloNavegacao1} aria-label="Car Wash - Página inicial">
              <img className="site-logo d-block" src={logo} alt="Car Wash" height="106" />
          </Link>
          <nav className="site-nav d-flex align-items-center justify-content-center gap-4" aria-label="Navegação principal">
            {titulosDeNavegacao.filter((item) => item.titulo && item.navegacao).map((item, index) => (
                <Link key={index} className="fs-5 fw-semibold text-decoration-none" to={item.titulo}>
                    {item.navegacao}
                </Link>
            ))}
            <button
              type="button"
              className="btn btn-link fs-5 fw-semibold text-decoration-none p-0"
              onClick={() => autenticado ? setContaAberta(true) : onLoginClick()}
            >
              {autenticado ? 'Conta' : 'Login'}
            </button>
          </nav>
        </div>
        {contaAberta && (
          <ModalConta usuario={usuario} onClose={() => setContaAberta(false)} />
        )}
  </header>
  )
}
