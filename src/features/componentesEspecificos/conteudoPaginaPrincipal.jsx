import { 
  FaHome,            // Casa
  FaUser,            // Pessoa
  FaCar,             // Carro
  FaLeaf,            // Folhagem
  FaCat,              // Gato
  FaCalendarPlus      // calendario
} from 'react-icons/fa'
import { 
  GiBrickWall,       // Muro / Tijolos (específico)
  GiStoneBlock,      // Pedra (específico)
  GiGate            // Grade / Cerca
} from 'react-icons/gi'
import { Card } from '../../shared/componentes/card'
import { Botao } from '../../shared/componentes/botao'
import { useNavigate } from 'react-router-dom'

export const ConteudoPaginaPrincipal = () => {
    const navigate = useNavigate()

    const navegarParaAgendamento = () => {
        navigate('/agendamentos')
    }

    const servicosDisponiveis = [
        {icone: <GiBrickWall color='#d85a06'/>, titulo: "Lavagem de Muros e Paredes Externas"},
        {icone: <GiGate />, titulo: "Lavagem de Portões e Grades"},
        {icone: <FaHome color='#6d2c00'/>, titulo: "Lavagem de Fachadas e Revestimentos"},
        {icone: <FaUser color='#1c07d4'/>, titulo: "Lavagem de Calçadas e Pisos Externos"},
        {icone: <GiStoneBlock color='#3d3d3d'/>, titulo: "Lavagem de Pedras e Revestimentos"},
        {icone: <FaCar color='#f70b0b'/>, titulo: "Lavagem de Garagens e Áreas de Circulação"},
        {icone: <FaLeaf color='#50d81a'/>, titulo: "Lavagem de Áreas de Lazer"},
        {icone: <FaCat color='#884609'/>, titulo: "Lavagem de Áreas PET e Espaços Externos"}
    ]

    return (
        <div>
            <div className="d-flex flex-column align-items-center justify-content-center gap-3 mt-5">
                <h2>Serviços</h2>
                <p>Realizamos serviços de Limpeza, Revitalização e Conservação, que incluem os seguintes tópicos:</p>
            </div>
            <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
                {servicosDisponiveis.map((servico, index) => (
                    <Card 
                        key={index}
                        icone={servico.icone}
                        titulo={servico.titulo}
                    />
                ))}
            </div>
            <div className="d-flex flex-column align-items-center justify-content-center mb-5">
                <Botao icone={<FaCalendarPlus />} texto="Realizar Agendamento" onClick={navegarParaAgendamento} />
            </div>
        </div>
    )
}