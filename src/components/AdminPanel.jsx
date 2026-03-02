import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../constants.js';
import '../styles/admin.css';

// ─── Constants ───────────────────────────────────────────────────────────────
const QUESTIONS_TEXT = [
  "Excedo el límite de velocidad.",
  "Manejo o viajo en un vehículo sin usar cinturón de seguridad.",
  "Manejo aunque mis pasajeros no utilicen el cinturón de seguridad.",
  "Manejo muy pegado a otros conductores.",
  "Hablo por teléfono mientras manejo.",
  "Envío mensajes de texto mientras manejo.",
  "Le grito o le hago señas negativas a otros conductores.",
  "Realizo giros o cambios de carril sin usar la luz de giro.",
  "Cruzo las señales de alto sin detenerme.",
  "Le hago señas de luces a los vehículos que circulan a menor velocidad.",
  "Manejo cuando estoy cansado.",
  "Manejo aunque haya bebido alcohol.",
  "Manejo aunque haya consumido drogas recreativas.",
  "Manejo aunque haya consumido medicamentos recetados.",
  "Manejo aunque haya consumido medicamentos de venta libre.",
  "Freno de golpe cuando otros conductores conducen muy pegado a mí.",
  "Mantengo la velocidad regular independientemente de las condiciones.",
  "Programo el GPS mientras estoy manejando.",
  "Cambio la música o los controles mientras estoy manejando.",
  "Puedo controlar lo que otros conductores hacen alrededor mío.",
];

const FREQ_LABELS = ['Nunca', 'Rara vez', 'A veces', 'Frecuentemente', 'Siempre'];

const RISK_CONFIG = {
  SEGURO:      { label: 'Conductor Seguro',    color: '#1b7f3e', bg: '#e8f5ee', dot: '🟢' },
  PRECAUCION:  { label: 'Precaución Moderada', color: '#c67c00', bg: '#fff3e0', dot: '🟡' },
  RIESGO:      { label: 'Perfil de Riesgo',    color: '#c84200', bg: '#fdecea', dot: '🟠' },
  ALTO_RIESGO: { label: 'Alto Riesgo',         color: '#a81010', bg: '#fce4e4', dot: '🔴' },
};

// ─── Login Screen ─────────────────────────────────────────────────────────────


function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const wrapRef = React.useRef(null);

  // ── Efecto cursor ────────────────────────────────────────────
  React.useEffect(() => {
    const target  = { mx: 0.5, my: 0.5, rx: 0, ry: 0, tx: 0, ty: 0 };
    const current = { ...target };
    let rafId;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      current.mx = lerp(current.mx, target.mx, 0.12);
      current.my = lerp(current.my, target.my, 0.12);
      current.rx = lerp(current.rx, target.rx, 0.10);
      current.ry = lerp(current.ry, target.ry, 0.10);
      current.tx = lerp(current.tx, target.tx, 0.10);
      current.ty = lerp(current.ty, target.ty, 0.10);

      const root = document.documentElement;
      root.style.setProperty('--mx', (current.mx * 100).toFixed(2) + '%');
      root.style.setProperty('--my', (current.my * 100).toFixed(2) + '%');
      root.style.setProperty('--rx', current.rx.toFixed(2) + 'deg');
      root.style.setProperty('--ry', current.ry.toFixed(2) + 'deg');
      root.style.setProperty('--tx', current.tx.toFixed(1) + 'px');
      root.style.setProperty('--ty', current.ty.toFixed(1) + 'px');

      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    function onMove(e) {
      const wrap = wrapRef.current;
      if (!wrap) return;
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top)  / r.height;

      target.mx = e.clientX / window.innerWidth;
      target.my = e.clientY / window.innerHeight;

      const tilt  = 10;
      const shift = 10;
      target.ry =  (x - 0.5) * tilt;
      target.rx = -(y - 0.5) * tilt;
      target.tx =  (x - 0.5) * shift;
      target.ty =  (y - 0.5) * shift;
    }

    function onLeave() {
      target.mx = 0.5; target.my = 0.5;
      target.rx = 0;   target.ry = 0;
      target.tx = 0;   target.ty = 0;
    }

    window.addEventListener('pointermove', onMove);
    wrapRef.current?.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  // ── Submit ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) throw new Error('Contraseña incorrecta');
      const { token } = await res.json();
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="login-bg" />

      <div className="login-wrap" ref={wrapRef}>
        <div className="admin-login-card">

          <div className="login-header">
            <img src="/logo2.png" alt="Consultores CMC" className="login-logo" />
            <div className="login-divider" />
            <h1 className="login-title">Panel Administrativo</h1>
            <p className="login-subtitle">Evaluación de Seguridad Vial</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="login-label">Contraseña de acceso</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="login-input"
                placeholder="••••••••••••"
                autoFocus
                required
              />
            </div>
            {error && <p className="login-error">⚠ {error}</p>}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar al Panel →'}
            </button>
          </form>

          <p className="login-footer">© {new Date().getFullYear()} Consultores CMC · Seguridad e Higiene</p>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Cards ──────────────────────────────────────────────────────────────
function StatsRow({ stats }) {
  const riskOrder = ['SEGURO', 'PRECAUCION', 'RIESGO', 'ALTO_RIESGO'];
  const byRiskMap = {};
  (stats.byRisk || []).forEach(r => { byRiskMap[r.risk_level] = parseInt(r.count); });

  return (
    <div className="stats-row">
      <div className="stat-card stat-total">
        <div className="stat-icon">📋</div>
        <div className="stat-value">{stats.total ?? '—'}</div>
        <div className="stat-label">Total evaluaciones</div>
      </div>
      <div className="stat-card stat-avg">
        <div className="stat-icon">📊</div>
        <div className="stat-value">{stats.avgScore ?? '—'}<span className="stat-unit">/80</span></div>
        <div className="stat-label">Puntuación promedio</div>
      </div>
      {riskOrder.map(key => {
        const cfg   = RISK_CONFIG[key];
        const count = byRiskMap[key] || 0;
        const pct   = stats.total ? Math.round((count / stats.total) * 100) : 0;
        return (
          <div className="stat-card" key={key} style={{ '--stat-color': cfg.color, '--stat-bg': cfg.bg }}>
            <div className="stat-icon">{cfg.dot}</div>
            <div className="stat-value" style={{ color: cfg.color }}>{count}</div>
            <div className="stat-label">{cfg.label}</div>
            <div className="stat-bar-wrap">
              <div className="stat-bar-fill" style={{ width: `${pct}%`, background: cfg.color }} />
            </div>
            <div className="stat-pct">{pct}%</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({ evalId, token, onClose }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/admin/evaluaciones/${evalId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [evalId, token]);

  if (loading) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card">
        <div className="modal-loading">Cargando detalle...</div>
      </div>
    </div>
  );

  if (!data) return null;

  const risk    = RISK_CONFIG[data.risk_level] || RISK_CONFIG.PRECAUCION;
  const answers = data.answers || [];
  const date    = new Date(data.fecha).toLocaleString('es-MX', { dateStyle: 'long', timeStyle: 'short' });

  const handlePrint = () => {
    const answersRows = answers.map((ans, i) => {
      const val   = ans.value ?? 0;
      const label = FREQ_LABELS[val] || '-';
      const color = val >= 3 ? '#c01515' : val === 2 ? '#c67c00' : '#1b7f3e';
      return `<tr>
        <td style="padding:6px 10px;font-size:12px;border-bottom:1px solid #eef0f4;">${QUESTIONS_TEXT[i] || ''}</td>
        <td style="padding:6px 10px;text-align:center;font-size:12px;font-weight:600;color:${color};border-bottom:1px solid #eef0f4;">${label}</td>
        <td style="padding:6px 10px;text-align:center;font-size:12px;font-weight:700;color:${color};border-bottom:1px solid #eef0f4;">${val}/4</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Evaluación – ${data.nombre}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Barlow,sans-serif;background:#f4f6fa;color:#1a2e4a;-webkit-print-color-adjust:exact}
  .page{max-width:800px;margin:0 auto;background:#fff}
  .pdf-header{background:linear-gradient(135deg,#1a2e4a,#0f4c75);padding:28px 36px;display:flex;justify-content:space-between;align-items:center}
  .pdf-header h1{font-size:16px;color:rgba(255,255,255,.7);font-weight:400}
  .pdf-header p{font-size:11px;color:rgba(255,255,255,.5);margin-top:3px}
  .pdf-logo{height:44px}
  .hero{background:${risk.bg};border-left:6px solid ${risk.color};padding:24px 36px;display:flex;align-items:center;gap:20px}
  .circle{width:80px;height:80px;border-radius:50%;background:${risk.color};display:flex;flex-direction:column;align-items:center;justify-content:center;flex-shrink:0}
  .circle-num{font-size:26px;font-weight:800;color:#fff;line-height:1}
  .circle-max{font-size:11px;color:rgba(255,255,255,.75)}
  .risk-label{font-size:22px;font-weight:800;color:${risk.color};text-transform:uppercase}
  .risk-sub{font-size:13px;color:#666;margin-top:4px}
  .section{padding:20px 36px;border-bottom:1px solid #eef0f4}
  .section-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#888;margin-bottom:10px}
  .summary{font-size:14px;line-height:1.7;color:#2d3748}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:20px 36px}
  .box{border:1px solid #eef0f4;border-radius:10px;padding:16px}
  .box-title{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:10px}
  .rt{color:#c01515}.gt{color:#1b7f3e}
  .box ul{list-style:none}.box li{font-size:12px;color:#2d3748;padding:5px 0;border-bottom:1px solid #f5f5f5;display:flex;gap:6px;line-height:1.4}
  table{width:100%;border-collapse:collapse}
  th{background:#1a2e4a;color:#fff;padding:8px 10px;font-size:11px;text-align:left}
  th:nth-child(2),th:nth-child(3){text-align:center}
  tr:nth-child(even) td{background:#f8f9fc}
  .footer{background:#1a2e4a;padding:14px 36px;display:flex;justify-content:space-between}
  .footer span{font-size:11px;color:rgba(255,255,255,.6)}
</style>
</head>
<body>
<div class="page">
  <div class="pdf-header">
    <img src="${window.location.origin}/logo2.png" class="pdf-logo" alt="CMC">
    <div><h1>Evaluación de Seguridad Vial</h1><p>${date}</p></div>
  </div>
  <div class="hero">
    <div class="circle"><div class="circle-num">${data.total_score}</div><div class="circle-max">/${data.max_score}</div></div>
    <div>
      <div style="font-size:28px;margin-bottom:4px">${risk.dot}</div>
      <div class="risk-label">${risk.label}</div>
      <div class="risk-sub">Evaluado a: <strong>${data.nombre}</strong> · ${data.pct}% de la puntuación máxima</div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">🧠 Análisis personalizado</div>
    <p class="summary">${data.summary || ''}</p>
  </div>
  <div class="grid">
    <div class="box">
      <div class="box-title rt">⚠ Riesgos críticos</div>
      <ul>${(data.top_risks || []).map(r => `<li><span style="color:#c01515;font-weight:700">▶</span>${r}</li>`).join('')}</ul>
    </div>
    <div class="box">
      <div class="box-title gt">✅ Recomendaciones</div>
      <ul>${(data.recommendations || []).map(r => `<li><span style="color:#1b7f3e;font-weight:700">▶</span>${r}</li>`).join('')}</ul>
    </div>
  </div>
  <div class="section">
    <div class="section-title">📋 Detalle de respuestas</div>
    <table>
      <thead><tr><th>Conducta evaluada</th><th>Frecuencia</th><th>Puntos</th></tr></thead>
      <tbody>${answersRows}</tbody>
    </table>
  </div>
  <div class="footer">
    <span>Consultores CMC · consultorescmc.com</span>
    <span>Esta evaluación es una herramienta educativa</span>
  </div>
</div>
<script>window.onload=()=>window.print()</script>
</body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ borderColor: risk.color }}>
          <div>
            <h2 className="modal-name">{data.nombre}</h2>
            <p className="modal-date">{date}</p>
          </div>
          <div className="modal-score-badge" style={{ background: risk.bg, color: risk.color, borderColor: risk.color }}>
            <span className="modal-score-num">{data.total_score}/{data.max_score}</span>
            <span className="modal-risk-label">{risk.label}</span>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-summary-box">
            <h4 className="modal-section-title">🧠 Análisis</h4>
            <p className="modal-summary">{data.summary}</p>
          </div>

          <div className="modal-grid-2">
            <div className="modal-box">
              <h4 className="modal-box-title" style={{ color: '#c01515' }}>⚠ Riesgos</h4>
              {(data.top_risks || []).map((r, i) => (
                <div key={i} className="modal-list-item modal-risk-item">
                  <span className="modal-bullet" style={{ color: '#c01515' }}>▶</span>{r}
                </div>
              ))}
            </div>
            <div className="modal-box">
              <h4 className="modal-box-title" style={{ color: '#1b7f3e' }}>✅ Recomendaciones</h4>
              {(data.recommendations || []).map((r, i) => (
                <div key={i} className="modal-list-item modal-rec-item">
                  <span className="modal-bullet" style={{ color: '#1b7f3e' }}>▶</span>{r}
                </div>
              ))}
            </div>
          </div>

          <div className="modal-answers-section">
            <h4 className="modal-section-title">📋 Respuestas detalladas</h4>
            <div className="modal-answers-table">
              <div className="answers-table-header">
                <span>Pregunta</span>
                <span>Respuesta</span>
                <span>Pts</span>
              </div>
              {answers.map((ans, i) => {
                const val   = ans.value ?? 0;
                const color = val >= 3 ? '#c01515' : val === 2 ? '#c67c00' : '#1b7f3e';
                return (
                  <div key={i} className="answers-table-row">
                    <span className="answer-question">{QUESTIONS_TEXT[i] || `Pregunta ${i+1}`}</span>
                    <span className="answer-freq" style={{ color }}>{FREQ_LABELS[val]}</span>
                    <span className="answer-pts" style={{ color }}>{val}/4</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-btn-close" onClick={onClose}>✕ Cerrar</button>
          <button className="modal-btn-print" onClick={handlePrint}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2"/>
              <path d="M6 14h12v8H6z"/>
            </svg>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Panel ─────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [token, setToken]             = useState(() => sessionStorage.getItem('admin_token') || '');
  const [evaluaciones, setEvaluaciones] = useState([]);
  const [stats, setStats]             = useState({});
  const [loading, setLoading]         = useState(false);
  const [selectedId, setSelectedId]   = useState(null);
  const [search, setSearch]           = useState('');
  const [filterRisk, setFilterRisk]   = useState('ALL');
  const [sortBy, setSortBy]           = useState('fecha');
  const [sortDir, setSortDir]         = useState('desc');
  const [page, setPage]               = useState(1);
  const PER_PAGE = 15;

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [evRes, stRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/evaluaciones`, { headers: authHeaders }),
        fetch(`${API_URL}/api/admin/stats`,         { headers: authHeaders }),
      ]);
      if (evRes.status === 401) { handleLogout(); return; }
      setEvaluaciones(await evRes.json());
      setStats(await stRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleLogin = (t) => { sessionStorage.setItem('admin_token', t); setToken(t); };
  const handleLogout = () => { sessionStorage.removeItem('admin_token'); setToken(''); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar la evaluación de "${name}"?`)) return;
    await fetch(`${API_URL}/api/admin/evaluaciones/${id}`, { method: 'DELETE', headers: authHeaders });
    fetchAll();
  };

const handleExport = () => {
  fetch(`${API_URL}/api/admin/export/csv`, { headers: authHeaders })
    .then(r => r.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a   = document.createElement('a');
      a.href = url; a.download = 'evaluaciones-cmc.csv'; a.click();
      URL.revokeObjectURL(url);
    });
};

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  // Filtrar y ordenar
  let filtered = evaluaciones.filter(e => {
    const matchSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase());
    const matchRisk   = filterRisk === 'ALL' || e.risk_level === filterRisk;
    return matchSearch && matchRisk;
  });

  filtered.sort((a, b) => {
    let va = a[sortBy], vb = b[sortBy];
    if (sortBy === 'fecha') { va = new Date(va); vb = new Date(vb); }
    return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span className="sort-icon-neutral">↕</span>;
    return <span className="sort-icon-active">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="admin-wrapper">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <img src="/logo2.png" alt="CMC" className="admin-logo" />
            <div>
              <h1 className="admin-title">Panel Administrativo</h1>
              <p className="admin-subtitle">Evaluación de Seguridad Vial</p>
            </div>
          </div>
          <div className="admin-header-right">
            <button className="admin-btn-outline" onClick={fetchAll} disabled={loading}>
              {loading ? '⟳ Cargando...' : '⟳ Actualizar'}
            </button>
            <button className="admin-btn-csv" onClick={handleExport}>
              📥 Exportar CSV
            </button>
            <button className="admin-btn-logout" onClick={handleLogout}>Salir →</button>
          </div>
        </div>
      </header>

      <div className="admin-content">
        {/* Stats */}
        {Object.keys(stats).length > 0 && <StatsRow stats={stats} />}

        {/* Filters */}
        <div className="admin-filters">
          <input
            type="text"
            placeholder="🔍 Buscar por nombre..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="filter-search"
          />
          <select
            value={filterRisk}
            onChange={e => { setFilterRisk(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="ALL">Todos los niveles</option>
            {Object.entries(RISK_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.dot} {v.label}</option>
            ))}
          </select>
          <span className="filter-count">
            {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'}
          </span>
        </div>

        {/* Table */}
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="th-sortable" onClick={() => toggleSort('id')}># <SortIcon col="id" /></th>
                <th className="th-sortable" onClick={() => toggleSort('nombre')}>Nombre <SortIcon col="nombre" /></th>
                <th className="th-sortable" onClick={() => toggleSort('fecha')}>Fecha <SortIcon col="fecha" /></th>
                <th className="th-sortable" onClick={() => toggleSort('total_score')}>Puntuación <SortIcon col="total_score" /></th>
                <th className="th-sortable" onClick={() => toggleSort('risk_level')}>Nivel de riesgo <SortIcon col="risk_level" /></th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 && (
                <tr><td colSpan="6" className="td-empty">
                  {loading ? 'Cargando evaluaciones...' : 'No se encontraron evaluaciones'}
                </td></tr>
              )}
              {paginated.map(ev => {
                const risk = RISK_CONFIG[ev.risk_level] || RISK_CONFIG.PRECAUCION;
                const date = new Date(ev.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
                const pct  = Math.round((ev.total_score / ev.max_score) * 100);
                return (
                  <tr key={ev.id} className="admin-row">
                    <td className="td-id">{ev.id}</td>
                    <td className="td-name">{ev.nombre}</td>
                    <td className="td-date">{date}</td>
                    <td className="td-score">
                      <div className="score-pill">
                        <span className="score-pill-num">{ev.total_score}<span className="score-pill-max">/80</span></span>
                        <div className="score-mini-bar">
                          <div className="score-mini-fill" style={{ width: `${pct}%`, background: risk.color }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="risk-badge" style={{ background: risk.bg, color: risk.color, borderColor: risk.color }}>
                        {risk.dot} {risk.label}
                      </span>
                    </td>
                    <td className="td-actions">
                      <button className="action-btn action-view" onClick={() => setSelectedId(ev.id)} title="Ver detalle">
                        👁 Ver
                      </button>
                      <button className="action-btn action-delete" onClick={() => handleDelete(ev.id, ev.nombre)} title="Eliminar">
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="admin-pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>← Anterior</button>
            <span className="page-info">Página {page} de {totalPages}</span>
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page === totalPages}>Siguiente →</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedId && (
        <DetailModal evalId={selectedId} token={token} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
}
