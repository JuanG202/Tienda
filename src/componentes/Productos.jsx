import { useState, useEffect } from "react";
import { TabBar } from "./Home";
import "../styles/Productos.css";

const toNum = (str) => Number(String(str).replace(/\./g, "")) || 0;

function PrecioInput({ value, onChange, placeholder = "0", autoFocus = false }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={value}
      autoFocus={autoFocus}
      onChange={(e) => {
        const raw = e.target.value.replace(/\./g, "").replace(/\D/g, "");
        onChange(raw === "" ? "" : Number(raw).toLocaleString("es-CO"));
      }}
    />
  );
}

const EMOJIS = ["🍰","🍗","🥐","🍕","🥩","🍱","🥗","🧆","🫔","🥘","🍜","🧁","🥤","🍺","🍹","🧃","🫙","🍞","🥪","🌮","🍔","🧀","🥚","🧇","🥞","🫕","🍲","🥫","🍿","🍩","🍪","🎂","🍫","🍬","🍭","🧋","☕","🍵"];

function Productos() {
  const [productos, setProductos] = useState([]);
  const [modal, setModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [emoji, setEmoji] = useState("🍰");

  useEffect(() => {
    setProductos(JSON.parse(localStorage.getItem("productos")) || []);
  }, []);

  const guardar = () => {
    const monto = toNum(precio);
    if (!nombre.trim() || !monto) return;
    const nuevo = { id: Date.now(), nombre: nombre.trim(), precio: monto, emoji };
    const actualizados = [...productos, nuevo];
    setProductos(actualizados);
    localStorage.setItem("productos", JSON.stringify(actualizados));
    setNombre(""); setPrecio(""); setEmoji("🍰"); setModal(false);
  };

  const eliminar = (id) => {
    const actualizados = productos.filter((p) => p.id !== id);
    setProductos(actualizados);
    localStorage.setItem("productos", JSON.stringify(actualizados));
  };

  return (
    <div className="page">
      <div className="header">
        <div className="header-icon" style={{ background: "var(--cafe)" }}>📦</div>
        <div>
          <h1 style={{ color: "var(--cafe)" }}>Productos</h1>
          <p>Lo que vendes en tu tienda</p>
        </div>
      </div>

      {productos.length === 0 ? (
        <div className="vacio" style={{ marginBottom: 20 }}>
          <div className="icono">📦</div>
          <p>Aún no tienes productos.<br />Agrega lo que vendes.</p>
        </div>
      ) : (
        <div className="producto-lista">
          {productos.map((p) => (
            <div key={p.id} className="producto-item">
              <div className="producto-emoji">{p.emoji}</div>
              <div className="producto-info">
                <div className="producto-nombre">{p.nombre}</div>
                <div className="producto-precio"><span>${p.precio.toLocaleString("es-CO")}</span></div>
              </div>
              <button className="btn-eliminar" onClick={() => eliminar(p.id)} title="Eliminar">✕</button>
            </div>
          ))}
        </div>
      )}

      <button className="btn-primary" onClick={() => setModal(true)}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Agregar producto
      </button>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-handle" />
            <h2>📦 Nuevo producto</h2>
            <div className="campo">
              <label>Ícono</label>
              <div className="emoji-picker">
                {EMOJIS.map((e) => (
                  <button key={e} className={`emoji-btn ${emoji === e ? "selected" : ""}`} onClick={() => setEmoji(e)}>{e}</button>
                ))}
              </div>
            </div>
            <div className="campo">
              <label>Nombre del producto</label>
              <input
                type="text"
                placeholder="Ej: Pastel de pollo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoFocus
              />
            </div>
            <div className="campo">
              <label>Precio ($)</label>
              <PrecioInput value={precio} onChange={setPrecio} />
            </div>
            <button className="btn-confirmar-fiado" onClick={guardar} disabled={!nombre.trim() || !toNum(precio)}>
              Guardar producto
            </button>
            <button className="btn-cancelar" onClick={() => setModal(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <TabBar activo="productos" />
    </div>
  );
}

export default Productos;
