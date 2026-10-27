import { useEffect, useState } from 'react'
import { listarServicos } from '../rotas_api/rotas-api.service'
import { ServicosContext } from './servicos.context'

export const ServicosProvider = ({ children }) => {
  const [servicos, setServicos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let componenteMontado = true

    const carregarServicos = async () => {
      try {
        const resposta = await listarServicos()
        const lista = Array.isArray(resposta) ? resposta : resposta?.items

        if (!Array.isArray(lista)) {
          throw new Error('A API retornou um formato inválido para os serviços.')
        }

        if (componenteMontado) {
          setServicos(lista)
          setErro('')
        }
      } catch (error) {
        console.error('Erro ao carregar serviços:', error)
        if (componenteMontado) {
          setErro('Não foi possível carregar os serviços.')
        }
      } finally {
        if (componenteMontado) {
          setCarregando(false)
        }
      }
    }

    carregarServicos()

    return () => {
      componenteMontado = false
    }
  }, [])

  return (
    <ServicosContext.Provider value={{ servicos, carregando, erro }}>
      {children}
    </ServicosContext.Provider>
  )
}
