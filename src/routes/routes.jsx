import { createBrowserRouter } from "react-router-dom";
import PaginaPrincipal from "../features/pages/paginaPrincipal";
import PaginaFormulario from "../features/pages/paginaFormulario";
import PaginaAgendamentos from "../features/pages/paginaAgendamentos";
import PaginaAgendamentosAdmin from "../features/pages/paginaAgendamentosAdmin";
import PaginaJanelasAdmin from "../features/pages/paginaJanelasAdmin";

export const rotas = createBrowserRouter([
  {
    path: '/',
    element: <PaginaPrincipal />,
  },
  {
    path: '/agendar',
    element: <PaginaFormulario />,
  },
  {
    path: '/meus-agendamentos',
    element: <PaginaAgendamentos />,
  },
  {
    path: '/admin/agendamentos',
    element: <PaginaAgendamentosAdmin />,
  },
  {
    path: '/admin/janelas',
    element: <PaginaJanelasAdmin />,
  },
]);