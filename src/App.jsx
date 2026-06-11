import { Routes, Route } from "react-router-dom";
import Home from "./componentes/Home";
import NuevoCliente from "./componentes/NuevoCliente";
import ClienteDetalle from "./componentes/ClienteDetalle";
import Productos from "./componentes/Productos";
import NuevaVenta from "./componentes/NuevaVenta";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/nuevo" element={<NuevoCliente />} />
      <Route path="/cliente/:id" element={<ClienteDetalle />} />
      <Route path="/productos" element={<Productos />} />
      <Route path="/venta/:clienteId" element={<NuevaVenta />} />
    </Routes>
  );
}

export default App;
