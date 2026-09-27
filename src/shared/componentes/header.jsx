import { Link } from "react-router-dom"

export const Header = ({logo, navegacao1, tituloNavegacao1, navegacao2, tituloNavegacao2}) => {

  const titulosDeNavegacao = [
    { titulo: tituloNavegacao1, navegacao: navegacao1 },
    { titulo: tituloNavegacao2, navegacao: navegacao2 },
  ]

  return (
    <header className="site-header container-fluid bg-dark px-4 py-3">
      <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
          <Link to={tituloNavegacao1} aria-label="Car Wash - Página inicial">
              <img className="site-logo d-block" src={logo} alt="Car Wash" height="106" />
          </Link>
          <nav className="site-nav d-flex align-items-center justify-content-center gap-4" aria-label="Navegação principal">
            {titulosDeNavegacao.map((item, index) => (
                <Link key={index} className="fs-5 fw-semibold text-decoration-none" to={item.titulo}>
                    {item.navegacao}
                </Link>
            ))}
          </nav>
        </div>
  </header>
  )
}
