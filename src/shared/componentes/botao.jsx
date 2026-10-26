export const Botao = ({ texto, onClick, icone, tamanho, type = 'submit', className = '', disabled = false }) => {
  return (
    <button
        type={type}
        className={`btn btn-primary rounded-3 shadow-xl ${tamanho || ''} ${className}`}
        onClick={onClick}
        disabled={disabled}
    >
        <div className="d-flex align-items-center justify-content-center gap-2">
            {icone}
            {texto}
        </div>
    </button>
  )
}