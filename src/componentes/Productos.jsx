import { useState, useEffect } from "react";
import { TabBar } from "./Home";
import axios from "axios";
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
  const [editando, setEditando] = useState(null); // producto que se está editando
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [emoji, setEmoji] = useState("🍰");

 useEffect(() => {
  const cargarProductos = async () => {
    try {
      const res = await axios.get(
        "https://tienda-back-ten.vercel.app/api/productos"
      );

      setProductos(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  cargarProductos();
}, []);

  const abrirNuevo = () => {
    setEditando(null);
    setNombre(""); setPrecio(""); setEmoji("🍰");
    setModal(true);
  };

  const abrirEditar = (p) => {
    setEditando(p);
    setNombre(p.nombre);
    setPrecio(p.precio.toLocaleString("es-CO"));
    setEmoji(p.emoji);
    setModal(true);
  };

  const guardar = async () => {
  const monto = toNum(precio);

  if (!nombre.trim() || !monto) return;

  try {
    if (editando) {
      await axios.put(
        `https://tienda-back-ten.vercel.app/api/productos/${editando._id}`,
        {
          nombre: nombre.trim(),
          precio: monto,
          emoji,
        }
      );
    } else {
      await axios.post(
        "https://tienda-back-ten.vercel.app/api/productos",
        {
          nombre: nombre.trim(),
          precio: monto,
          emoji,
        }
      );
    }

    const res = await axios.get(
      "https://tienda-back-ten.vercel.app/api/productos"
    );

    setProductos(res.data);

    setNombre("");
    setPrecio("");
    setEmoji("🍰");
    setEditando(null);
    setModal(false);

  } catch (error) {
    console.error(error);
  }
};

  const eliminar = async (id) => {
  try {
    await axios.delete(
      `https://tienda-back-ten.vercel.app/api/productos/${id}`
    );

    setProductos(
      productos.filter((p) => p._id !== id)
    );

  } catch (error) {
    console.error(error);
  }
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
            <div key={p._id} className="producto-item">
              <div className="producto-emoji">{p.emoji}</div>
              <div className="producto-info">
                <div className="producto-nombre">{p.nombre}</div>
                <div className="producto-precio"><span>${p.precio.toLocaleString("es-CO")}</span></div>
              </div>
              <div className="producto-acciones">
                <button className="btn-editar" onClick={() => abrirEditar(p)} title="Editar">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button className="btn-eliminar" onClick={() => eliminar(p._id)} title="Eliminar">✕</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn-primary" onClick={abrirNuevo}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Agregar producto
      </button>

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-handle" />
            <h2>{editando ? "✏️ Editar producto" : "📦 Nuevo producto"}</h2>
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
              {editando ? "Guardar cambios" : "Guardar producto"}
            </button>
            <button className="btn-cancelar" onClick={() => { setModal(false); setEditando(null); }}>Cancelar</button>
          </div>
        </div>
      )}

      <TabBar activo="productos" />
    </div>
  );
}

export default Productos;
