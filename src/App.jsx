import { RouterProvider } from "react-router-dom";
import { rotas } from "./routes/routes";
import { ServicosProvider } from "./shared/servicos/servicos.context.jsx";

export default function App() {
  return (
    <ServicosProvider>
      <RouterProvider router={rotas} />
    </ServicosProvider>
  )
}
