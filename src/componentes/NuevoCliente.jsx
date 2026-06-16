import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/NuevoCliente.css";

function NuevoCliente() {
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const navigate = useNavigate();

  const guardarCliente = async () => {
    if (!nombre.trim()) return;

    try {
      await axios.post(
        "https://tienda-back-ten.vercel.app/api/clientes",
        {
          nombre: nombre.trim(),
          telefono: telefono.trim(),
        }
      );

      navigate("/");
    } catch (error) {
      console.error(error);
    }
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

        <div className="campo">
          <label>Numero de Teléfono <span className="opcional"></span></label>
          <input
            type="tel"
            placeholder="Ej: 300 123 4567"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && guardarCliente()}
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