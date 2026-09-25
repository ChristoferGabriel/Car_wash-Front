import { createBrowserRouter } from "react-router-dom";
import PaginaPrincipal from "../features/pages/paginaPrincipal";
import PaginaFormulario from "../features/pages/paginaFormulario";

export const rotas = createBrowserRouter([
  {
    path: '/',
    element: <PaginaPrincipal />,
  },
  {
    path: '/agendamentos',
    element: <PaginaFormulario />,
  }
]);