import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
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
  const [modalEnviar, setModalEnviar] = useState(false);

  const [productoSel, setProductoSel] = useState(null);
  const [concepto, setConcepto] = useState("");
  const [valorFiado, setValorFiado] = useState("");
  const [valorPago, setValorPago] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const resCliente = await axios.get(
          `https://tienda-back-ten.vercel.app/api/clientes/${id}?t=${Date.now()}`,
          {
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );
        const resProductos = await axios.get(
          `https://tienda-back-ten.vercel.app/api/productos?t=${Date.now()}`,
          {
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );
        setCliente(resCliente.data);
        setProductos(resProductos.data);
      } catch (error) {
        console.error(error);
      }
    };
    cargarDatos();
  }, [id]);

  const actualizarCliente = async (nuevoCliente) => {
    try {
      const res = await axios.put(
        `https://tienda-back-ten.vercel.app/api/clientes/${cliente._id}`,
        nuevoCliente
      );
      setCliente(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const seleccionarProducto = (p) => {
    if (productoSel && productoSel._id === p._id) {
      setProductoSel(null); setConcepto(""); setValorFiado("");
    } else {
      setProductoSel(p);
      setConcepto(p.nombre);
      setValorFiado(p.precio.toLocaleString("es-CO"));
    }
  };

  const registrarFiado = async () => {
    const conceptoFinal = concepto.trim() || (productoSel ? productoSel.nombre : "");
    const monto = toNum(valorFiado);
    if (!monto || !conceptoFinal) return;

    const nuevoCliente = {
      ...cliente,
      saldo: cliente.saldo + monto,
      historial: [
        ...cliente.historial,
        {
          tipo: "fiado",
          concepto: conceptoFinal,
          valor: monto,
          fecha: new Date().toLocaleDateString("es-CO", {
            day: "2-digit", month: "short", year: "numeric",
          }),
        },
      ],
    };

    await actualizarCliente(nuevoCliente);
    setConcepto(""); setValorFiado(""); setProductoSel(null); setModal(null);
  };

  const registrarPago = async () => {
    const monto = toNum(valorPago);
    if (!monto) return;

    const nuevoCliente = {
      ...cliente,
      saldo: cliente.saldo - monto,
      historial: [
        ...cliente.historial,
        {
          tipo: "pago",
          concepto: "Pago",
          valor: monto,
          fecha: new Date().toLocaleDateString("es-CO", {
            day: "2-digit", month: "short", year: "numeric",
          }),
        },
      ],
    };

    await actualizarCliente(nuevoCliente);
    setValorPago(""); setModal(null);
  };

  const enviarWhatsApp = (tipo) => {
    if (!cliente?.telefono) return;

    const historial = cliente.historial || [];
    const items = tipo === "fiado"
      ? historial.filter((h) => h.tipo === "fiado")
      : historial;

    if (items.length === 0) return;

    const lineas = items.map((h) => {
      const signo = h.tipo === "pago" ? "✅ Pago" : "📦 Fiado";
      return `${signo} — ${h.concepto}: $${h.valor.toLocaleString("es-CO")} (${h.fecha})`;
    });

    const encabezado = tipo === "fiado"
      ? `Hola ${cliente.nombre}, este es el resumen de lo que tienes fiado en nuestra tienda:`
      : `Hola ${cliente.nombre}, este es tu historial completo en nuestra tienda:`;

    const saldoLinea = `\n💰 *Saldo pendiente: $${cliente.saldo.toLocaleString("es-CO")}*`;

    const mensaje = `${encabezado}\n\n${lineas.join("\n")}${saldoLinea}`;

    const telefono = cliente.telefono.replace(/\D/g, "");
    const url = `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, "_blank");
    setModalEnviar(false);
  };

  const abrirModalFiado = () => {
    setProductoSel(null); setConcepto(""); setValorFiado(""); setModal("fiado");
  };

  if (!cliente) return (
    <div className="page" style={{ textAlign: "center", paddingTop: 80 }}>
      <p style={{ color: "var(--texto-suave)" }}>Cargando...</p>
    </div>
  );

  const estaAlDia = cliente.saldo <= 0;
  const historialInverso = [...(cliente.historial || [])].reverse();
  const conceptoFinal = concepto.trim() || (productoSel ? productoSel.nombre : "");
  const tieneTelefono = !!cliente.telefono;
  const tieneMovimientos = cliente.historial?.length > 0;
  const tieneFiados = cliente.historial?.some((h) => h.tipo === "fiado");

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate("/")}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>

      <div className="header">
        <div className="header-icon" style={{ background: "var(--cafe)", fontFamily: "Fraunces, serif", fontSize: "1.2rem" }}>
          {cliente.nombre.trim()[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: "Fraunces, serif", fontSize: "1.5rem", color: "var(--cafe)" }}>{cliente.nombre}</h1>
          <p>{cliente.historial.length} movimiento{cliente.historial.length !== 1 ? "s" : ""}</p>
          {cliente.telefono && (
            <p style={{ fontSize: "0.8rem", color: "var(--texto-suave)", marginTop: 2 }}>📞 {cliente.telefono}</p>
          )}
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

      {tieneTelefono && tieneMovimientos && (
        <button
          className="btn-whatsapp"
          onClick={() => setModalEnviar(true)}
        >
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.855L0 24l6.335-1.507A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.6a9.6 9.6 0 01-4.9-1.344l-.352-.208-3.656.87.937-3.555-.228-.365A9.6 9.6 0 1112 21.6z"/>
          </svg>
          Enviar resumen por WhatsApp
        </button>
      )}

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

      {/* Modal fiado */}
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
                      <button key={p._id} className={`producto-opcion ${productoSel?._id === p._id ? "seleccionado" : ""}`} onClick={() => seleccionarProducto(p)}>
                        <span className="producto-opcion-emoji">{p.emoji}</span>
                        <div className="producto-opcion-info">
                          <div className="producto-opcion-nombre">{p.nombre}</div>
                          <div className="producto-opcion-precio">${p.precio.toLocaleString("es-CO")}</div>
                        </div>
                        {productoSel?._id === p._id && (
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

      {/* Modal pago */}
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

      {/* Modal elegir qué enviar */}
      {modalEnviar && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModalEnviar(false)}>
          <div className="modal">
            <div className="modal-handle" />
            <h2>📲 Enviar resumen</h2>
            <p style={{ color: "var(--texto-suave)", marginBottom: 16, fontSize: "0.9rem" }}>
              ¿Qué quieres enviarle a <strong>{cliente.nombre}</strong>?
            </p>

            {tieneFiados && (
              <button className="btn-confirmar-fiado" onClick={() => enviarWhatsApp("fiado")} style={{ marginBottom: 10 }}>
                🧾 Solo lo que tiene fiado
              </button>
            )}

            <button className="btn-confirmar-pago" onClick={() => enviarWhatsApp("todo")}>
              📋 Todo el historial
            </button>

            <button className="btn-cancelar" onClick={() => setModalEnviar(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClienteDetalle;