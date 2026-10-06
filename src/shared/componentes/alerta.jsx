import '../styles/alerta.css'

export const Alerta = ({ mensagem, onFechar }) => {
  return (
    <div id="meu-modal" className="modal-custom" role="alertdialog" aria-modal="true">
        <div className="modal-conteudo">
            <p>{mensagem}</p>
            <button type="button" onClick={onFechar}>OK</button>
        </div>
    </div>
  )
}
