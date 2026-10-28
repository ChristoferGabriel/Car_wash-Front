import { RouterProvider } from "react-router-dom";
import { useEffect, useState } from "react";
import { rotas } from "./routes/routes";
import { ServicosProvider } from "./shared/servicos/servicos.context.jsx";
import { restaurarSessao, usuarioAutenticado } from "./shared/auth/auth.service";

export default function App() {
  const [sessaoCarregada, setSessaoCarregada] = useState(!usuarioAutenticado())

  useEffect(() => {
    if (!usuarioAutenticado()) {
      return
    }

    restaurarSessao()
      .catch((error) => {
        console.error('Não foi possível restaurar a sessão:', error)
        sessionStorage.removeItem('car-wash-token')
        sessionStorage.removeItem('car-wash-usuario-atual')
        sessionStorage.removeItem('car-wash-modo-administrador')
        window.dispatchEvent(new Event('auth-change'))
      })
      .finally(() => setSessaoCarregada(true))
  }, [])

  return (
    <ServicosProvider>
      {sessaoCarregada && <RouterProvider router={rotas} />}
    </ServicosProvider>
  )
}
