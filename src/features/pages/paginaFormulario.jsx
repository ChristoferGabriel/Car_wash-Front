import { Header } from "../../shared/componentes/header";
import { Footer } from "../../shared/componentes/footer";
import { ConteudoPaginaFormulario } from "../componentesEspecificos/conteudoPaginaFormulario";
import { ModalLogin } from "../componentesEspecificos/modalLogin";
import { useState } from "react";

export default function PaginaFormulario() {
  const [loginAberto, setLoginAberto] = useState(false)

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

      <section className="flex-grow-1" >
        <ConteudoPaginaFormulario />
      </section>

      <Footer logo="logo.webp" />
      {loginAberto && <ModalLogin onClose={() => setLoginAberto(false)} />}
    </main>
  )
}