const FUSO_HORARIO = 'America/Sao_Paulo'

export const formatarDataLocal = (valor) => {
  if (!valor) return ''

  const data = valor.length === 10
    ? new Date(`${valor}T12:00:00-03:00`)
    : new Date(valor)

  if (Number.isNaN(data.getTime())) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeZone: FUSO_HORARIO
  }).format(data)
}

export const formatarDataHoraLocal = (valor) => {
  if (!valor) return ''

  const data = new Date(valor)
  if (Number.isNaN(data.getTime())) return ''

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: FUSO_HORARIO
  }).format(data)
}
