export const obterErrosDeCampo = (error) => {
  const errors = error?.response?.data?.errors

  if (!errors || typeof errors !== 'object') {
    return {}
  }

  const erros = Object.fromEntries(
    Object.entries(errors).map(([campo, mensagens]) => [
      campo,
      Array.isArray(mensagens) ? mensagens.join(' ') : String(mensagens)
    ])
  )

  if (erros.servico && !erros.servico_id) {
    erros.servico_id = erros.servico
    delete erros.servico
  }

  return erros
}

export const obterMensagemDaApi = (error, mensagemPadrao) => {
  return error?.response?.data?.message || error?.message || mensagemPadrao
}

export const possuiErrosDeCampo = (erros) => Object.keys(erros).length > 0
