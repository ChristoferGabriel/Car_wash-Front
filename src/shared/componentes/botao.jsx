export const Botao = ({ texto, onClick, icone }) => {
  return (
    <button
        className="btn btn-primary rounded-3 shadow-xl"
        onClick={onClick}
    >
        <div className="d-flex align-items-center justify-content-center gap-2">
            {icone}
            {texto}
        </div>
    </button>
  )
}