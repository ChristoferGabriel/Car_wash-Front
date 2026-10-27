import { useContext } from 'react'
import { ServicosContext } from './servicos.context.js'

export const useServicos = () => {
  const contexto = useContext(ServicosContext)

  if (!contexto) {
    throw new Error('useServicos deve ser usado dentro de ServicosProvider.')
  }

  return contexto
}
