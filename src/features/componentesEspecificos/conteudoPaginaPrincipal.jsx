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
import { useServicos } from '../../shared/servicos/use-servicos'

const iconesPorServico = {
    'Lavagem de Muros e Paredes Externas': <GiBrickWall color='#d85a06' />,
    'Lavagem de Portões e Grades': <GiGate />,
    'Lavagem de Fachadas e Revestimentos': <FaHome color='#6d2c00' />,
    'Lavagem de Calçadas e Pisos Externos': <FaUser color='#1c07d4' />,
    'Lavagem de Pedras e Revestimentos': <GiStoneBlock color='#3d3d3d' />,
    'Lavagem de Garagens e Áreas de Circulação': <FaCar color='#f70b0b' />,
    'Lavagem de Áreas de Lazer': <FaLeaf color='#50d81a' />,
    'Lavagem de Áreas PET e Espaços Externos': <FaCat color='#884609' />
}

export const ConteudoPaginaPrincipal = () => {
    const navigate = useNavigate()
    const { servicos: servicosDisponiveis, erro: erroServicos, carregando } = useServicos()

    const navegarParaAgendamento = () => {
        navigate('/agendar')
    }

    return (
        <div className="home-content">
            <div className="home-intro appointments-heading">
                <h1>Serviços</h1>
                <p>Realizamos serviços de Limpeza, Revitalização e Conservação, que incluem os seguintes tópicos:</p>
            </div>
            {erroServicos && (
                <div className="alert alert-danger text-center" role="alert">
                    {erroServicos}
                </div>
            )}
            {carregando && (
                <div className="alert alert-info text-center" role="alert">
                    Carregando serviços...
                </div>
            )}
            <div className="services-grid mb-4">
                {servicosDisponiveis.map((servico) => (
                    <Card 
                        key={servico.id ?? servico.nome}
                        icone={iconesPorServico[servico.nome] ?? <FaHome />}
                        titulo={servico.nome}
                    />
                ))}
            </div>
            <div className="d-flex flex-column align-items-center justify-content-center mb-5">
                <Botao icone={<FaCalendarPlus />} texto="Realizar Agendamento" onClick={navegarParaAgendamento} />
            </div>
        </div>
    )
}