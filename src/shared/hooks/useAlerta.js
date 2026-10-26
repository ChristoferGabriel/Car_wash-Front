import { useState } from 'react'

export const useAlerta = () => {
  const [alerta, setAlerta] = useState({
    visivel: false,
    mensagem: ''
  })

  const mostrarAlerta = (mensagem) => {
    setAlerta({ visivel: true, mensagem })
  }

  const fecharAlerta = () => {
    setAlerta({ visivel: false, mensagem: '' })
  }

  return {
    alerta,
    mostrarAlerta,
    fecharAlerta
  }
}
