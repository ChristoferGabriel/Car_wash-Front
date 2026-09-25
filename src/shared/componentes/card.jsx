export const Card = ({ titulo, icone }) => {
  return (
    <div 
        className="
          card 
          my-3
          border
          border-primary
          rounded-4
          shadow-xl
          w-25
        "
    >    
        <div className="card-body d-flex flex-column align-items-center justify-content-center gap-3">
            <div className="d-flex justify-content-center gap-3">
                <div>
                    {icone}
                </div>
                <h5 className="card-title">{titulo}</h5>
            </div>
        </div>
    </div>
  )
}