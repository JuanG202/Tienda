import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { TabBar } from "./Home";
import "../styles/Nuevaventa.css";

// ── Helpers de formato ──
const toNum = (str) => Number(String(str).replace(/\./g, "")) || 0;
const fmt   = (val) => {
  const n = String(val).replace(/\./g, "").replace(/\D/g, "");
  return n === "" ? "" : Number(n).toLocaleString("es-CO");
};

function PrecioInput({ value, onChange, placeholder = "0", autoFocus = false }) {
  const handleChange = (e) => {
    const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
    onChange(raw === "" ? "" : Number(raw).toLocaleString("es-CO"));
  };
  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      autoFocus={autoFocus}
    />
  );
}

function NuevaVenta() {
  const { clienteId } = useParams();
  const navigate = useNavigate();

  const [paso, setPaso] = useState(clienteId === "seleccionar" ? 1 : 2);
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [cantidades, setCantidades] = useState({});
  const [tipo, setTipo] = useState("fiado");
  const [confirmado, setConfirmado] = useState(false);

useEffect(() => {
  const cargarDatos = async () => {
    try {
      const clientesRes = await axios.get(
        "https://tienda-back-ten.vercel.app/api/clientes"
      );

      const productosRes = await axios.get(
        "https://tienda-back-ten.vercel.app/api/productos"
      );

      setClientes(clientesRes.data);
      setProductos(productosRes.data);

      if (clienteId !== "seleccionar") {
        const encontrado = clientesRes.data.find(
          (c) => c._id === clienteId
        );

        if (encontrado) {
          setClienteSeleccionado(encontrado);
          setPaso(2);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  cargarDatos();
}, [clienteId]);

  const iniciales = (nombre) => {
    const p = nombre.trim().split(" ");
    return (p.length >= 2 ? p[0][0] + p[1][0] : p[0].substring(0, 2)).toUpperCase();
  };

  const cambiarCantidad = (id, delta) => {
    setCantidades((prev) => {
      const nueva = Math.max(0, (prev[id] || 0) + delta);
      return { ...prev, [id]: nueva };
    });
  };

  const itemsSeleccionados = productos.filter((p) => (cantidades[p._id] || 0) > 0);
  const total = itemsSeleccionados.reduce((acc, p) => acc + p.precio * (cantidades[p._id] || 0), 0);

  const confirmarVenta = async () => {
  if (!clienteSeleccionado || total === 0) return;

  try {
    const fecha = new Date().toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const resumenItems = itemsSeleccionados
      .map(
        (p) =>
          `${p.nombre} x${cantidades[p._id]}`
      )
      .join(", ");

    const clienteActualizado = {
      ...clienteSeleccionado,
      saldo:
        tipo === "fiado"
          ? clienteSeleccionado.saldo + total
          : clienteSeleccionado.saldo,

      historial: [
        ...clienteSeleccionado.historial,
        {
          tipo:
            tipo === "fiado"
              ? "fiado"
              : "venta",

          concepto: resumenItems,

          valor: total,

          fecha,

          items: itemsSeleccionados.map((p) => ({
            nombre: p.nombre,
            cantidad: cantidades[p._id],
            precio: p.precio,
          })),
        },
      ],
    };

    await axios.put(
      `https://tienda-back-ten.vercel.app/api/clientes/${clienteSeleccionado._id}`,
      clienteActualizado
    );

    setConfirmado(true);

  } catch (error) {
    console.error(error);
  }
};

  if (confirmado) {
    return (
      <div className="page">
        <div className="exito-page">
          <div className="exito-icon">✅</div>
          <h2 className="exito-titulo">{tipo === "fiado" ? "¡Fiado registrado!" : "¡Venta registrada!"}</h2>
          <p className="exito-cliente"><strong>{clienteSeleccionado.nombre}</strong></p>
          <p className="exito-monto">${total.toLocaleString("es-CO")}</p>
          <div className="exito-botones">
            <button className="btn-verde" onClick={() => navigate("/")}>Volver al inicio</button>
            <button className="btn-primary" onClick={() => {
              setCantidades({}); setConfirmado(false); setPaso(1);
              setClienteSeleccionado(null); navigate("/venta/seleccionar");
            }}>Nueva venta</button>
          </div>
        </div>
      </div>
    );
  }

  if (paso === 1) {
    return (
      <div className="page">
        <button className="back-btn" onClick={() => navigate("/")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Volver
        </button>
        <div className="header">
          <div className="header-icon" style={{ background: "var(--cafe)" }}>🛒</div>
          <div><h1 style={{ color: "var(--cafe)" }}>Nueva venta</h1><p>¿A quién le vas a vender?</p></div>
        </div>
        {clientes.length === 0 ? (
          <div className="vacio"><div className="icono">👥</div><p>No hay clientes aún.<br />Agrega uno primero.</p></div>
        ) : (
          <div className="clientes-lista">
            {clientes.map((cliente) => (
              <button key={cliente._id} className="cliente-card" onClick={() => { setClienteSeleccionado(cliente); setPaso(2); }}>
                <div className="cliente-avatar">{iniciales(cliente.nombre)}</div>
                <div className="cliente-info">
                  <div className="cliente-nombre">{cliente.nombre}</div>
                  <div className="cliente-fecha">Saldo: ${cliente.saldo.toLocaleString("es-CO")}</div>
                </div>
                <svg className="flecha" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            ))}
          </div>
        )}
        <TabBar activo="venta" />
      </div>
    );
  }

  return (
    <div className="page">
      <button className="back-btn" onClick={() => { setPaso(1); setCantidades({}); navigate("/venta/seleccionar"); }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Cambiar cliente
      </button>

      {clienteSeleccionado && (
        <div className="cliente-seleccionado-badge">
          <svg className="badge-check" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: "1rem" }}>{clienteSeleccionado.nombre}</div>
            <div style={{ fontSize: "0.8rem", color: "var(--texto-suave)" }}>Saldo actual: ${clienteSeleccionado.saldo.toLocaleString("es-CO")}</div>
          </div>
        </div>
      )}

      <div className="seccion-titulo">¿Qué llevó?</div>

      {productos.length === 0 ? (
        <div className="sin-productos">
          <p style={{ marginBottom: 12 }}>No tienes productos aún.</p>
          <button className="btn-primary" style={{ maxWidth: 220, margin: "0 auto" }} onClick={() => navigate("/productos")}>Ir a agregar productos</button>
        </div>
      ) : (
        <div className="productos-venta">
          {productos.map((p) => {
            const cant = cantidades[p._id] || 0;
            return (
              <div key={p._id} className="producto-venta-card">
                <div style={{ fontSize: "1.8rem", flexShrink: 0 }}>{p.emoji}</div>
                <div className="producto-venta-info">
                  <div className="producto-venta-nombre">{p.nombre}</div>
                  <div className="producto-venta-precio">
                    <strong>${p.precio.toLocaleString("es-CO")}</strong>
                    {cant > 0 && <span style={{ marginLeft: 8, color: "var(--cafe)" }}>= ${(p.precio * cant).toLocaleString("es-CO")}</span>}
                  </div>
                </div>
                <div className="contador">
                  <button className="contador-btn" onClick={() => cambiarCantidad(p._id, -1)} disabled={cant === 0}>−</button>
                  <span className="contador-num">{cant}</span>
                  <button className="contador-btn" onClick={() => cambiarCantidad(p._id, 1)}>+</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {total > 0 && (
        <>
          <div className="resumen-venta">
            <div className="titulo">Resumen</div>
            <div className="resumen-items">
              {itemsSeleccionados.map((p) => (
                <div key={p._id}>{p.emoji} {p.nombre} ×{cantidades[p._id]} — ${(p.precio * cantidades[p._id]).toLocaleString("es-CO")}</div>
              ))}
            </div>
            <div className="resumen-total">${total.toLocaleString("es-CO")}</div>
          </div>
          <div className="seccion-titulo">¿Cómo paga?</div>
          <div className="tipo-venta-tabs">
            <button className={`tipo-tab ${tipo === "fiado" ? "activo fiado" : ""}`} onClick={() => setTipo("fiado")}>🧾 Fiar</button>
            <button className={`tipo-tab ${tipo === "contado" ? "activo contado" : ""}`} onClick={() => setTipo("contado")}>💵 Contado</button>
          </div>
          <button className="btn-primary" onClick={confirmarVenta}>
            {tipo === "fiado" ? "Registrar fiado" : "Registrar venta"}
          </button>
        </>
      )}

      <TabBar activo="venta" />
    </div>
  );
}

export default NuevaVenta;
