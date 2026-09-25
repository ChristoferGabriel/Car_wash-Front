import { FaWhatsapp, FaInstagram } from 'react-icons/fa'

export const Footer = ({logo}) => {

    const opcoesContato = [
        {
            icone: <FaWhatsapp size={25} color="#25D366" />,
            link: ""
        },
        {
            icone: <FaInstagram size={25} color="#E1306C" />,
            link: "https://www.instagram.com/carwash.mobilecwb?stkn=MWtpaTJ4N3ppd3VtbQ=="
        }
    ]

    return (
        <footer className="container-fluid bg-dark px-4 py-3">
            <div className="row">
                <div className="col-12 d-flex flex-row align-items-center gap-2">
                    <div className=" d-flex flex-row align-items-center gap-2">
                        <img className="d-block" src={logo} alt="Car Wash" height="60" />
                        <h5 className="text-primary mb-1">Car Wash</h5>
                    </div>
                    <div className="d-flex justify-content-center flex-grow-1">
                        <p className="text-primary mb-0">© 2026 Car Wash. Todos os direitos reservados.</p>
                    </div>
                    <div className="gap-3 d-flex align-items-center justify-content-end mb-1">
                        {opcoesContato.map((opcao, index) => (
                            <a key={index} href={opcao.link} target="_blank" rel="noreferrer" className="text-light fs-3">
                                {opcao.icone}
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    )
}
