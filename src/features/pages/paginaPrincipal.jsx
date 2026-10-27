import { Footer } from "../../shared/componentes/footer";
import { Header } from "../../shared/componentes/header";
import { ConteudoPaginaPrincipal } from "../componentesEspecificos/conteudoPaginaPrincipal";
import { ModalLogin } from "../componentesEspecificos/modalLogin";
import { useState } from "react";

export default function PaginaPrincipal () {
  const [loginAberto, setLoginAberto] = useState(false)

  return (
    <main className="min-vh-100 d-flex flex-column">
      <Header 
        logo="logo.webp"
        tituloNavegacao1="/" 
        navegacao1="Página Principal" 
        titulo        tituloNavegacao2="/agendar"
        navegacao2="Agendar"
        onLoginClick={() => setLoginAberto(true)}
      />

      <section className="flex-grow-1">
        <ConteudoPaginaPrincipal />
      </section>

      <Footer logo={"logo.webp"} />
      {loginAberto && <ModalLogin onClose={() => setLoginAberto(false)} />}
    </main>
  )
}
  