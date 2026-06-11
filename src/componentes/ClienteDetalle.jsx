import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/Clientedetalle.css";

const fmt = (val) => {
  const n = String(val).replace(/\./g, "").replace(/\D/g, "");
  return n === "" ? "" : Number(n).toLocaleString("es-CO");
};
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

function ClienteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cliente, setCliente] = useState(null);
  const [productos, setProductos] = useState([]);
  const [modal, setModal] = useState(null);

  const [productoSel, setProductoSel] = useState(null);
  const [concepto, setConcepto] = useState("");
  const [valorFiado, setValorFiado] = useState("");
  const [valorPago, setValorPago] = useState("");

  useEffect(() => {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    const encontrado = clientes.find((c) => c.id === Number(id));
    setCliente(encontrado || null);
    setProductos(JSON.parse(localStorage.getItem("productos")) || []);
  }, [id]);

  const actualizarStorage = (nuevoCliente) => {
    const clientes = JSON.parse(localStorage.getItem("clientes")) || [];
    localStorage.setItem("clientes", JSON.stringify(clientes.map((c) => c.id === nuevoCliente.id ? nuevoCliente : c)));
    setCliente(nuevoCliente);
  };

  const seleccionarProducto = (p) => {
    if (productoSel && productoSel.id === p.id) {
      setProductoSel(null); setConcepto(""); setValorFiado("");
    } else {
      setProductoSel(p);
      setConcepto(p.nombre);
      setValorFiado(p.precio.toLocaleString("es-CO"));
    }
  };

  const registrarFiado = () => {
    const conceptoFinal = concepto.trim() || (productoSel ? productoSel.nombre : "");
    const monto = toNum(valorFiado);
    if (!monto || !conceptoFinal) return;
    actualizarStorage({
      ...cliente,
      saldo: cliente.saldo + monto,
      historial: [...cliente.historial, {
        tipo: "fiado", concepto: conceptoFinal, valor: monto,
        fecha: new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
      }],
    });
    setConcepto(""); setValorFiado(""); setProductoSel(null); setModal(null);
  };

  const registrarPago = () => {
    const monto = toNum(valorPago);
    if (!monto) return;
    actualizarStorage({
      ...cliente,
      saldo: cliente.saldo - monto,
      historial: [...cliente.historial, {
        tipo: "pago", concepto: "Pago", valor: monto,
        fecha: new Date().toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }),
      }],
    });
    setValorPago(""); setModal(null);
  };

  const abrirModalFiado = () => { setProductoSel(null); setConcepto(""); setValorFiado(""); setModal("fiado"); };

  if (!cliente) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <p style={{ color: "var(--texto-suave)" }}>Cargando...</p>
    </div>
  );

  const estaAlDia = cliente.saldo <= 0;
  const historialInverso = [...(cliente.historial || [])].reverse();
  const conceptoFinal = concepto.trim() || (productoSel ? productoSel.nombre : "");

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate("/")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        Volver
      </button>

      <div className="header">
        <div className="header-icon" style={{ background: "var(--cafe)", fontFamily: "Fraunces, serif", fontSize: "1.2rem" }}>
          {cliente.nombre.trim()[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: "1.5rem", color: "var(--cafe)" }}>{cliente.nombre}</h1>
          <p>{cliente.historial.length} movimiento{cliente.historial.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className={`saldo-badge ${estaAlDia ? "pagado" : ""}`}>
        <div className="info">
          <div className="label">Saldo pendiente</div>
          <div className="monto">${cliente.saldo.toLocaleString("es-CO")}</div>
          {estaAlDia && <div className="pagado-tag">✓ Al día</div>}
        </div>
        <div className="icono-grande">{estaAlDia ? "✅" : "💰"}</div>
      </div>

      <div className="acciones-grid">
        <button className="btn-accion fiado" onClick={abrirModalFiado}>
          <span className="icono-btn">🧾</span>Nuevo fiado
        </button>
        <button className="btn-accion pago" onClick={() => setModal("pago")}>
          <span className="icono-btn">✅</span>Registrar pago
        </button>
      </div>

      <div className="seccion-titulo">Historial</div>

      {historialInverso.length === 0 ? (
        <div className="historial-vacio">Sin movimientos aún</div>
      ) : (
        <div className="historial-lista">
          {historialInverso.map((item, index) => (
            <div key={index} className="historial-item">
              <div className={`historial-dot ${item.tipo}`}>
                {item.tipo === "fiado" ? "📦" : item.tipo === "venta" ? "🛒" : "💵"}
              </div>
              <div className="historial-texto">
                <div className="historial-concepto">{item.concepto || "Pago"}</div>
                <div className="historial-fecha">{item.fecha}</div>
              </div>
              <div className={`historial-valor ${item.tipo}`}>
                {item.tipo === "pago" ? "−" : "+"}${item.valor.toLocaleString("es-CO")}
              </div>
            </div>
          ))}
        </div>
      )}

      {modal === "fiado" && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-handle" />
            <h2>🧾 Nuevo fiado</h2>
            {productos.length > 0 && (
              <>
                <div className="campo">
                  <label>Selecciona un producto</label>
                  <div className="productos-selector">
                    {productos.map((p) => (
                      <button key={p.id} className={`producto-opcion ${productoSel?.id === p.id ? "seleccionado" : ""}`} onClick={() => seleccionarProducto(p)}>
                        <span className="producto-opcion-emoji">{p.emoji}</span>
                        <div className="producto-opcion-info">
                          <div className="producto-opcion-nombre">{p.nombre}</div>
                          <div className="producto-opcion-precio">${p.precio.toLocaleString("es-CO")}</div>
                        </div>
                        {productoSel?.id === p.id && (
                          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--cafe)" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="divider-o">o escribe manualmente</div>
              </>
            )}
            <div className="campo">
              <label>¿Qué llevó?</label>
              <input
                type="text"
                placeholder="Ej: Arroz, aceite, gaseosa..."
                value={concepto}
                onChange={(e) => { setConcepto(e.target.value); setProductoSel(null); }}
                autoFocus={productos.length === 0}
              />
            </div>
            <div className="campo">
              <label>Valor ($)</label>
              <PrecioInput value={valorFiado} onChange={setValorFiado} />
            </div>
            <button className="btn-confirmar-fiado" onClick={registrarFiado} disabled={!conceptoFinal || !toNum(valorFiado)}>
              Guardar fiado
            </button>
            <button className="btn-cancelar" onClick={() => setModal(null)}>Cancelar</button>
          </div>
        </div>
      )}

      {modal === "pago" && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal">
            <div className="modal-handle" />
            <h2>✅ Registrar pago</h2>
            <div className="pago-info-saldo">
              Saldo actual: <strong>${cliente.saldo.toLocaleString("es-CO")}</strong>
            </div>
            <div className="campo">
              <label>¿Cuánto pagó? ($)</label>
              <PrecioInput value={valorPago} onChange={setValorPago} autoFocus />
            </div>
            <button className="btn-confirmar-pago" onClick={registrarPago} disabled={!toNum(valorPago)}>
              Confirmar pago
            </button>
            <button className="btn-cancelar" onClick={() => setModal(null)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClienteDetalle;
