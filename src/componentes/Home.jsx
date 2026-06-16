import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Home.css";

export function TabBar({ activo }) {
  const navigate = useNavigate();
  return (
    <nav className="tab-bar">
      <button
        className={`tab-item ${activo === "inicio" ? "activo" : ""}`}
        onClick={() => navigate("/")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Inicio
      </button>
      <button
        className={`tab-item ${activo === "venta" ? "activo" : ""}`}
        onClick={() => navigate("/venta/seleccionar")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        Venta
      </button>
      <button
        className={`tab-item ${activo === "productos" ? "activo" : ""}`}
        onClick={() => navigate("/productos")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
        Productos
      </button>
    </nav>
  );
}

function Home() {
  const [clientes, setClientes] = useState([]);
  const navigate = useNavigate();

useEffect(() => {
  const cargarClientes = async () => {
    try {
      const res = await axios.get(
        "https://tienda-back-ten.vercel.app/api/clientes"
      );

      setClientes(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  cargarClientes();
}, []);

  const totalCartera = clientes.reduce((acc, cli) => acc + cli.saldo, 0);
  const clientesConDeuda = clientes.filter((c) => c.saldo > 0).length;

  const iniciales = (nombre) => {
    const partes = nombre.trim().split(" ");
    return partes.length >= 2
      ? partes[0][0] + partes[1][0]
      : partes[0].substring(0, 2);
  };

  const ultimaFecha = (cliente) => {
    if (!cliente.historial || cliente.historial.length === 0)
      return "Sin movimientos";
    return cliente.historial[cliente.historial.length - 1].fecha;
  };

  return (
    <div className="page">
      <div className="header">
        <div className="header-icon">🏪</div>
        <div>
          <h1>Tienda - Doña Vivi</h1>
          <p>Control</p>
        </div>
      </div>

      <div className="card-resumen">
        <div className="label">Total en cartera</div>
        <div className="monto">${totalCartera.toLocaleString("es-CO")}</div>
        <div className="sub">
          {clientesConDeuda === 0
            ? "Sin deudas pendientes ✓"
            : `${clientesConDeuda} cliente${clientesConDeuda !== 1 ? "s" : ""} con saldo`}
        </div>
      </div>

      <button className="btn-primary" onClick={() => navigate("/nuevo")}>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
        Agregar cliente
      </button>

      <div className="seccion-titulo">Clientes ({clientes.length})</div>

      {clientes.length === 0 ? (
        <div className="vacio">
          <div className="icono">👥</div>
          <p>Todavía no hay clientes.<br />Agrega el primero.</p>
        </div>
      ) : (
        <div className="clientes-lista">
          {clientes
            .slice()
            .sort((a, b) => b.saldo - a.saldo)
            .map((cliente) => (
              <button
                key={cliente.id}
                className="cliente-card"
                onClick={() => navigate(`/cliente/${cliente._id}`)}
              >
                <div className="cliente-avatar">
                  {iniciales(cliente.nombre).toUpperCase()}
                </div>
                <div className="cliente-info">
                  <div className="cliente-nombre">{cliente.nombre}</div>
                  <div className="cliente-fecha">{ultimaFecha(cliente)}</div>
                </div>
                <div className={`cliente-saldo ${cliente.saldo <= 0 ? "pagado" : ""}`}>
                  ${cliente.saldo.toLocaleString("es-CO")}
                </div>
                <svg className="flecha" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            ))}
        </div>
      )}

      <TabBar activo="inicio" />
    </div>
  );
}

export default Home;
