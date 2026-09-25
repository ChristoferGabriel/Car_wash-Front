import { Footer } from "../../shared/componentes/footer";
import { Header } from "../../shared/componentes/header";

export default function PaginaPrincipal () {
  return (
    <main className="min-vh-100 d-flex flex-column">
      <Header 
        logo="logo.webp"
        tituloNavegacao1="/" 
        navegacao1="Página Principal" 
        tituloNavegacao2="/agendamentos" 
        navegacao2="Agendamentos" 
        />

      <section className="flex-grow-1">
        <h1>Pagina Principal</h1>
      </section>

      <Footer logo={"logo.webp"}/>
    </main>
  )
}
  