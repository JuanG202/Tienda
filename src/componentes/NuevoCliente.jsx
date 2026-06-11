import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NuevoCliente.css";

function NuevoCliente() {
  const [nombre, setNombre] = useState("");
  const navigate = useNavigate();

  const guardarCliente = () => {
    if (!nombre.trim()) return;
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const nuevoCliente = {
      id: Date.now(),
      nombre: nombre.trim(),
      saldo: 0,
      historial: [],
    };
    clientes.push(nuevoCliente);
    localStorage.setItem("clientes", JSON.stringify(clientes));
    navigate("/");
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate("/")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>

      <div className="header">
        <div className="header-icon">👤</div>
        <div>
          <h1>Nuevo cliente</h1>
          <p>Agregar a la lista de fiados</p>
        </div>
      </div>

      <div className="card-form">
        <div className="campo">
          <label>Nombre del cliente</label>
          <input
            type="text"
            placeholder="Ej: María González"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guardarCliente()}
            autoFocus
          />
        </div>
      </div>

      <button
        className="btn-primary"
        onClick={guardarCliente}
        disabled={!nombre.trim()}
      >
        Guardar cliente
      </button>
    </div>
  );
}

export default NuevoCliente;
