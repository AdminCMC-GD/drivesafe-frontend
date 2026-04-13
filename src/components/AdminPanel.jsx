import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../constants.js';
import '../styles/admin.css';

// ─── Constantes ───────────────────────────────────────────────────────────────
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
const REC_CONFIG = {
  EVALUARSE:  { label: 'Listo para evaluarse', color: '#065f46', bg: '#ecfdf5', dot: '✅' },
  ASESORARSE: { label: 'Requiere asesoría',     color: '#92400e', bg: '#fef3e2', dot: '📚' },
};
const PER_PAGE = 15;
const fmtDate  = (d) => new Date(d).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
const fmtDate2 = (d) => new Date(d).toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });

// ─── Preguntas EC embebidas (para cruzar con answers guardados en BD) ─────────
// Estructura: { elementoId: [ { id, texto, tipo } ] }
const EC0217_ELEMS = {
  1: { nombre: 'Preparar la sesión / curso de capacitación / formación',   total: 67 },
  2: { nombre: 'Conducir la sesión / curso de capacitación / formación',   total: 82 },
  3: { nombre: 'Evaluar la sesión / curso de capacitación / formación',    total: 36 },
};
const EC0301_ELEMS = {
  1: { nombre: 'Diseñar cursos de formación del capital humano',           total: 52 },
  2: { nombre: 'Diseñar instrumentos para la evaluación de cursos',        total: 33 },
  3: { nombre: 'Diseñar manuales del curso de formación',                  total: 60 },
};

// ─── Login ────────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    const target = { mx:.5, my:.5, rx:0, ry:0, tx:0, ty:0 };
    const curr   = { ...target };
    let rafId;
    const lerp = (a,b,t) => a + (b-a)*t;
    function tick() {
      curr.mx=lerp(curr.mx,target.mx,.12); curr.my=lerp(curr.my,target.my,.12);
      curr.rx=lerp(curr.rx,target.rx,.10); curr.ry=lerp(curr.ry,target.ry,.10);
      curr.tx=lerp(curr.tx,target.tx,.10); curr.ty=lerp(curr.ty,target.ty,.10);
      const r=document.documentElement;
      r.style.setProperty('--mx',(curr.mx*100).toFixed(2)+'%');
      r.style.setProperty('--my',(curr.my*100).toFixed(2)+'%');
      r.style.setProperty('--rx',curr.rx.toFixed(2)+'deg');
      r.style.setProperty('--ry',curr.ry.toFixed(2)+'deg');
      r.style.setProperty('--tx',curr.tx.toFixed(1)+'px');
      r.style.setProperty('--ty',curr.ty.toFixed(1)+'px');
      rafId=requestAnimationFrame(tick);
    }
    rafId=requestAnimationFrame(tick);
    const onMove=(e)=>{
      const w=wrapRef.current; if(!w) return;
      const rc=w.getBoundingClientRect();
      const x=(e.clientX-rc.left)/rc.width, y=(e.clientY-rc.top)/rc.height;
      target.mx=e.clientX/window.innerWidth; target.my=e.clientY/window.innerHeight;
      target.ry=(x-.5)*10; target.rx=-(y-.5)*10;
      target.tx=(x-.5)*10; target.ty=(y-.5)*10;
    };
    const onLeave=()=>{target.mx=.5;target.my=.5;target.rx=0;target.ry=0;target.tx=0;target.ty=0;};
    window.addEventListener('pointermove',onMove);
    wrapRef.current?.addEventListener('pointerleave',onLeave);
    return ()=>{cancelAnimationFrame(rafId);window.removeEventListener('pointermove',onMove);};
  },[]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/login`,{ method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({password}) });
      if (!res.ok) throw new Error('Contraseña incorrecta');
      const { token } = await res.json();
      onLogin(token);
    } catch(err) { setError(err.message); }
    finally { setLoading(false); }
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
            <p className="login-subtitle">Consultores CMC · Centro de Diagnósticos</p>
          </div>
          <form onSubmit={handleSubmit} className="login-form">
            <div>
              <label className="login-label">Contraseña de acceso</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                className="login-input" placeholder="••••••••••••" autoFocus required />
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

// ─── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ token, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const authH = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/admin/stats`,       { headers: authH }).then(r=>r.json()),
      fetch(`${API_URL}/api/admin/stats/global`, { headers: authH }).then(r=>r.json()),
    ]).then(([ds, global]) => { setStats({ ds, global }); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-loading">Cargando estadísticas...</div>;
  if (!stats)  return <div className="admin-loading">Error al cargar.</div>;

  const { ds, global } = stats;
  const totalGlobal = (global?.drivesafe?.total||0) + (global?.ec0217?.total||0) + (global?.ec0301?.total||0);

  const cards = [
    { icon:'🚗', label:'DriveSafe IQ',        color:'#1a2e4a', bg:'#e8f0fe', total:global?.drivesafe?.total||0, extra:`Puntaje promedio: ${global?.drivesafe?.avgScore||0}/80`, tab:'drivesafe' },
    { icon:'📋', label:'EC0217 · Impartición', color:'#065f46', bg:'#ecfdf5', total:global?.ec0217?.total||0,   extra:`Aptos: ${global?.ec0217?.aptos||0} · Promedio: ${global?.ec0217?.avgPct||0}%`, tab:'ec0217' },
    { icon:'📐', label:'EC0301 · Diseño',      color:'#7c3aed', bg:'#f5f3ff', total:global?.ec0301?.total||0,   extra:`Aptos: ${global?.ec0301?.aptos||0} · Promedio: ${global?.ec0301?.avgPct||0}%`, tab:'ec0301' },
  ];

  return (
    <div className="dash-root">
      <div className="dash-hero">
        <div className="dash-hero-num">{totalGlobal}</div>
        <div className="dash-hero-label">diagnósticos totales registrados</div>
      </div>
      <div className="dash-cards">
        {cards.map(c => (
          <div key={c.tab} className="dash-card" style={{'--dc':c.color,'--dbg':c.bg}} onClick={()=>onNavigate(c.tab)}>
            <div className="dash-card-icon">{c.icon}</div>
            <div className="dash-card-num">{c.total}</div>
            <div className="dash-card-label">{c.label}</div>
            <div className="dash-card-extra">{c.extra}</div>
            <div className="dash-card-link">Ver registros →</div>
          </div>
        ))}
      </div>
      {ds?.recent?.length > 0 && (
        <div className="dash-recent">
          <h3 className="dash-recent-title">🕐 Últimas evaluaciones DriveSafe</h3>
          <div className="dash-recent-list">
            {ds.recent.map((r,i) => {
              const risk = RISK_CONFIG[r.risk_level] || RISK_CONFIG.PRECAUCION;
              return (
                <div key={i} className="dash-recent-row">
                  <span className="dash-recent-name">{r.nombre}</span>
                  <span className="dash-recent-date">{fmtDate(r.fecha)}</span>
                  <span className="dash-recent-badge" style={{background:risk.bg,color:risk.color}}>{risk.dot} {risk.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tabla DriveSafe ──────────────────────────────────────────────────────────
function TablaDriveSafe({ token, onLogout }) {
  const [rows,setRows]=useState([]); const [stats,setStats]=useState({});
  const [loading,setLoading]=useState(true); const [search,setSearch]=useState('');
  const [filterRisk,setFilterRisk]=useState('ALL'); const [sortBy,setSortBy]=useState('fecha');
  const [sortDir,setSortDir]=useState('desc'); const [page,setPage]=useState(1);
  const [selectedId,setSelectedId]=useState(null);
  const authH={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};

  const fetchAll=useCallback(async()=>{
    setLoading(true);
    try {
      const [evRes,stRes]=await Promise.all([
        fetch(`${API_URL}/api/admin/evaluaciones`,{headers:authH}),
        fetch(`${API_URL}/api/admin/stats`,{headers:authH}),
      ]);
      if(evRes.status===401){onLogout();return;}
      setRows(await evRes.json()); setStats(await stRes.json());
    }catch(e){console.error(e);}
    finally{setLoading(false);}
  },[token]);

  useEffect(()=>{fetchAll();},[fetchAll]);

  const handleDelete=async(id,name)=>{
    if(!window.confirm(`¿Eliminar la evaluación de "${name}"?`))return;
    await fetch(`${API_URL}/api/admin/evaluaciones/${id}`,{method:'DELETE',headers:authH});
    fetchAll();
  };
  const handleExport=()=>{
    fetch(`${API_URL}/api/admin/export/csv`,{headers:authH}).then(r=>r.blob()).then(blob=>{
      const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='drivesafe.csv'; a.click();
    });
  };

  let filtered=rows.filter(e=>{
    const ms=!search||e.nombre.toLowerCase().includes(search.toLowerCase());
    const mr=filterRisk==='ALL'||e.risk_level===filterRisk;
    return ms&&mr;
  }).sort((a,b)=>{
    let va=a[sortBy],vb=b[sortBy];
    if(sortBy==='fecha'){va=new Date(va);vb=new Date(vb);}
    return sortDir==='asc'?(va>vb?1:-1):(va<vb?1:-1);
  });
  const totalPages=Math.ceil(filtered.length/PER_PAGE);
  const paginated=filtered.slice((page-1)*PER_PAGE,page*PER_PAGE);
  const toggleSort=(col)=>{if(sortBy===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortBy(col);setSortDir('desc');}};
  const SortIcon=({col})=>sortBy===col?<span className="sort-icon-active">{sortDir==='asc'?'↑':'↓'}</span>:<span className="sort-icon-neutral">↕</span>;
  const byRiskMap={};(stats.byRisk||[]).forEach(r=>{byRiskMap[r.risk_level]=parseInt(r.count);});

  return (
    <div className="tab-content">
      <div className="stats-row">
        <div className="stat-card stat-total"><div className="stat-icon">📋</div><div className="stat-value">{stats.total??'—'}</div><div className="stat-label">Total evaluaciones</div></div>
        <div className="stat-card stat-avg"><div className="stat-icon">📊</div><div className="stat-value">{stats.avgScore??'—'}<span className="stat-unit">/80</span></div><div className="stat-label">Puntuación promedio</div></div>
        {['SEGURO','PRECAUCION','RIESGO','ALTO_RIESGO'].map(key=>{
          const cfg=RISK_CONFIG[key]; const count=byRiskMap[key]||0; const pct=stats.total?Math.round((count/stats.total)*100):0;
          return(<div className="stat-card" key={key} style={{'--stat-color':cfg.color,'--stat-bg':cfg.bg}}><div className="stat-icon">{cfg.dot}</div><div className="stat-value" style={{color:cfg.color}}>{count}</div><div className="stat-label">{cfg.label}</div><div className="stat-pct">{pct}%</div></div>);
        })}
      </div>
      <div className="admin-filters">
        <input type="text" placeholder="🔍 Buscar por nombre..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="filter-search"/>
        <select value={filterRisk} onChange={e=>{setFilterRisk(e.target.value);setPage(1);}} className="filter-select">
          <option value="ALL">Todos los niveles</option>
          {Object.entries(RISK_CONFIG).map(([k,v])=><option key={k} value={k}>{v.dot} {v.label}</option>)}
        </select>
        <button className="admin-btn-csv" onClick={handleExport}>📥 CSV</button>
        <button className="admin-btn-outline" onClick={fetchAll} disabled={loading}>⟳ Actualizar</button>
        <span className="filter-count">{filtered.length} resultados</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr>
            <th onClick={()=>toggleSort('id')}># <SortIcon col="id"/></th>
            <th onClick={()=>toggleSort('nombre')}>Nombre <SortIcon col="nombre"/></th>
            <th onClick={()=>toggleSort('fecha')}>Fecha <SortIcon col="fecha"/></th>
            <th onClick={()=>toggleSort('total_score')}>Puntuación <SortIcon col="total_score"/></th>
            <th onClick={()=>toggleSort('risk_level')}>Nivel <SortIcon col="risk_level"/></th>
            <th>Acciones</th>
          </tr></thead>
          <tbody>
            {paginated.length===0&&<tr><td colSpan="6" className="td-empty">{loading?'Cargando...':'Sin resultados'}</td></tr>}
            {paginated.map(ev=>{
              const risk=RISK_CONFIG[ev.risk_level]||RISK_CONFIG.PRECAUCION;
              const pct=Math.round((ev.total_score/ev.max_score)*100);
              return(<tr key={ev.id} className="admin-row">
                <td className="td-id">{ev.id}</td>
                <td className="td-name">{ev.nombre}</td>
                <td className="td-date">{fmtDate(ev.fecha)}</td>
                <td className="td-score"><div className="score-pill"><span className="score-pill-num">{ev.total_score}<span className="score-pill-max">/80</span></span><div className="score-mini-bar"><div className="score-mini-fill" style={{width:`${pct}%`,background:risk.color}}/></div></div></td>
                <td><span className="risk-badge" style={{background:risk.bg,color:risk.color,borderColor:risk.color}}>{risk.dot} {risk.label}</span></td>
                <td className="td-actions">
                  <button className="action-btn action-view" onClick={()=>setSelectedId(ev.id)}>👁 Ver</button>
                  <button className="action-btn action-delete" onClick={()=>handleDelete(ev.id,ev.nombre)}>🗑</button>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
      {totalPages>1&&(<div className="admin-pagination">
        <button className="page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>← Anterior</button>
        <span className="page-info">Página {page} de {totalPages}</span>
        <button className="page-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Siguiente →</button>
      </div>)}
      {selectedId&&<DetailModalDS evalId={selectedId} token={token} onClose={()=>setSelectedId(null)}/>}
    </div>
  );
}

// ─── Tabla EC ─────────────────────────────────────────────────────────────────
function TablaEC({ token, tipo, onLogout }) {
  const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState(''); const [filterRec,setFilterRec]=useState('ALL');
  const [sortBy,setSortBy]=useState('fecha'); const [sortDir,setSortDir]=useState('desc');
  const [page,setPage]=useState(1); const [selectedId,setSelectedId]=useState(null);
  const authH={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
  const ep=tipo==='ec0217'?'ec0217':'ec0301';

  const fetchAll=useCallback(async()=>{
    setLoading(true);
    try{const res=await fetch(`${API_URL}/api/admin/${ep}`,{headers:authH});
      if(res.status===401){onLogout();return;} setRows(await res.json());
    }catch(e){console.error(e);}finally{setLoading(false);}
  },[token,tipo]);

  useEffect(()=>{fetchAll();setPage(1);setSearch('');setFilterRec('ALL');},[tipo]);

  const handleDelete=async(id,name)=>{
    if(!window.confirm(`¿Eliminar el diagnóstico de "${name}"?`))return;
    await fetch(`${API_URL}/api/admin/${ep}/${id}`,{method:'DELETE',headers:authH}); fetchAll();
  };
  const handleExport=()=>{
    fetch(`${API_URL}/api/admin/${ep}/export/csv`,{headers:authH}).then(r=>r.blob()).then(blob=>{
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${ep}.csv`;a.click();
    });
  };

  const total=rows.length, aptos=rows.filter(r=>r.recomendacion==='EVALUARSE').length;
  const avgPct=total?(rows.reduce((s,r)=>s+parseFloat(r.porcentaje),0)/total).toFixed(1):0;

  let filtered=rows.filter(r=>{
    const ms=!search||r.nombre.toLowerCase().includes(search.toLowerCase())||(r.empresa||'').toLowerCase().includes(search.toLowerCase());
    const mr=filterRec==='ALL'||r.recomendacion===filterRec;
    return ms&&mr;
  }).sort((a,b)=>{
    let va=a[sortBy],vb=b[sortBy];
    if(sortBy==='fecha'){va=new Date(va);vb=new Date(vb);}
    if(sortBy==='porcentaje'){va=parseFloat(va);vb=parseFloat(vb);}
    return sortDir==='asc'?(va>vb?1:-1):(va<vb?1:-1);
  });
  const totalPages=Math.ceil(filtered.length/PER_PAGE);
  const paginated=filtered.slice((page-1)*PER_PAGE,page*PER_PAGE);
  const toggleSort=(col)=>{if(sortBy===col)setSortDir(d=>d==='asc'?'desc':'asc');else{setSortBy(col);setSortDir('desc');}};
  const SortIcon=({col})=>sortBy===col?<span className="sort-icon-active">{sortDir==='asc'?'↑':'↓'}</span>:<span className="sort-icon-neutral">↕</span>;

  return (
    <div className="tab-content">
      <div className="stats-row">
        <div className="stat-card stat-total"><div className="stat-icon">📋</div><div className="stat-value">{total}</div><div className="stat-label">Total diagnósticos</div></div>
        <div className="stat-card" style={{'--stat-color':'#065f46','--stat-bg':'#ecfdf5'}}><div className="stat-icon">✅</div><div className="stat-value" style={{color:'#065f46'}}>{aptos}</div><div className="stat-label">Listos para evaluarse</div><div className="stat-pct">{total?Math.round((aptos/total)*100):0}%</div></div>
        <div className="stat-card" style={{'--stat-color':'#92400e','--stat-bg':'#fef3e2'}}><div className="stat-icon">📚</div><div className="stat-value" style={{color:'#92400e'}}>{total-aptos}</div><div className="stat-label">Requieren asesoría</div><div className="stat-pct">{total?Math.round(((total-aptos)/total)*100):0}%</div></div>
        <div className="stat-card stat-avg"><div className="stat-icon">📊</div><div className="stat-value">{avgPct}<span className="stat-unit">%</span></div><div className="stat-label">Porcentaje promedio</div></div>
      </div>
      <div className="admin-filters">
        <input type="text" placeholder="🔍 Buscar por nombre o empresa..." value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} className="filter-search"/>
        <select value={filterRec} onChange={e=>{setFilterRec(e.target.value);setPage(1);}} className="filter-select">
          <option value="ALL">Todas las recomendaciones</option>
          <option value="EVALUARSE">✅ Listos para evaluarse</option>
          <option value="ASESORARSE">📚 Requieren asesoría</option>
        </select>
        <button className="admin-btn-csv" onClick={handleExport}>📥 CSV</button>
        <button className="admin-btn-outline" onClick={fetchAll} disabled={loading}>⟳ Actualizar</button>
        <span className="filter-count">{filtered.length} resultados</span>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr>
            <th onClick={()=>toggleSort('id')}># <SortIcon col="id"/></th>
            <th onClick={()=>toggleSort('nombre')}>Nombre <SortIcon col="nombre"/></th>
            <th>Empresa / Sector</th>
            <th>Ubicación</th>
            <th onClick={()=>toggleSort('fecha')}>Fecha <SortIcon col="fecha"/></th>
            <th onClick={()=>toggleSort('porcentaje')}>% <SortIcon col="porcentaje"/></th>
            <th onClick={()=>toggleSort('recomendacion')}>Recomendación <SortIcon col="recomendacion"/></th>
            <th>Acciones</th>
          </tr></thead>
          <tbody>
            {paginated.length===0&&<tr><td colSpan="8" className="td-empty">{loading?'Cargando...':'Sin resultados'}</td></tr>}
            {paginated.map(ev=>{
              const rec=REC_CONFIG[ev.recomendacion]||REC_CONFIG.ASESORARSE;
              const pct=parseFloat(ev.porcentaje);
              return(<tr key={ev.id} className="admin-row">
                <td className="td-id">{ev.id}</td>
                <td className="td-name"><div>{ev.nombre}</div><div style={{fontSize:'12px',color:'#94a3b8'}}>{ev.correo}</div></td>
                <td className="td-date"><div>{ev.empresa||<span style={{color:'#94a3b8'}}>Independiente</span>}</div>{ev.sector&&<div style={{fontSize:'12px',color:'#94a3b8'}}>{ev.sector}</div>}</td>
                <td className="td-date">{ev.ciudad}, {ev.estado}</td>
                <td className="td-date">{fmtDate(ev.fecha)}</td>
                <td className="td-score"><div className="score-pill"><span className="score-pill-num">{pct}<span className="score-pill-max">%</span></span><div className="score-mini-bar"><div className="score-mini-fill" style={{width:`${pct}%`,background:pct>=90?'#059669':pct>=70?'#d97706':'#dc2626'}}/></div></div></td>
                <td><span className="risk-badge" style={{background:rec.bg,color:rec.color,borderColor:rec.color}}>{rec.dot} {rec.label}</span></td>
                <td className="td-actions">
                  <button className="action-btn action-view" onClick={()=>setSelectedId(ev.id)}>👁 Ver</button>
                  <button className="action-btn action-delete" onClick={()=>handleDelete(ev.id,ev.nombre)}>🗑</button>
                </td>
              </tr>);
            })}
          </tbody>
        </table>
      </div>
      {totalPages>1&&(<div className="admin-pagination">
        <button className="page-btn" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1}>← Anterior</button>
        <span className="page-info">Página {page} de {totalPages}</span>
        <button className="page-btn" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages}>Siguiente →</button>
      </div>)}
      {selectedId&&<DetailModalEC evalId={selectedId} token={token} tipo={tipo} onClose={()=>setSelectedId(null)}/>}
    </div>
  );
}

// ─── Modal DriveSafe ──────────────────────────────────────────────────────────
function DetailModalDS({ evalId, token, onClose }) {
  const [data,setData]=useState(null);
  const authH={Authorization:`Bearer ${token}`};
  useEffect(()=>{ fetch(`${API_URL}/api/admin/evaluaciones/${evalId}`,{headers:authH}).then(r=>r.json()).then(setData); },[evalId]);

  if(!data) return <div className="modal-overlay" onClick={onClose}><div className="modal-card"><div className="modal-loading">Cargando...</div></div></div>;

  const risk=RISK_CONFIG[data.risk_level]||RISK_CONFIG.PRECAUCION;
  const answers=Array.isArray(data.answers)?data.answers:[];
  const pct=Math.round((data.total_score/data.max_score)*100);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div><h2 className="modal-title">{data.nombre}</h2><p className="modal-subtitle">DriveSafe IQ · {fmtDate2(data.fecha)}</p></div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-hero" style={{background:risk.bg,borderColor:risk.color}}>
          <div className="modal-score" style={{background:risk.color}}><span>{data.total_score}</span><small>/{data.max_score}</small></div>
          <div><div className="modal-risk-label" style={{color:risk.color}}>{risk.dot} {risk.label}</div><div className="modal-risk-pct">{pct}% de la puntuación máxima</div></div>
        </div>
        <div className="modal-answers">
          <h3 className="modal-section-title">📋 Respuestas detalladas</h3>
          {answers.map((ans,i)=>{
            const val=ans.value??0; const color=val>=3?'#c01515':val===2?'#c67c00':'#1b7f3e';
            return(<div key={i} className="modal-answer-row">
              <span className="modal-q-num">{i+1}.</span>
              <span className="modal-q-text">{QUESTIONS_TEXT[i]||`Pregunta ${i+1}`}</span>
              <span className="modal-q-ans" style={{color}}>{FREQ_LABELS[val]}</span>
              <span className="modal-q-val" style={{color}}>{val}/4</span>
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Modal EC con respuestas colapsables por elemento ─────────────────────────
function ElementoRespuestas({ elementoId, elemInfo, answers, tipo }) {
  const [abierto, setAbierto] = useState(false);

  // Filtrar respuestas de este elemento
  const answersElem = answers.filter(a => a.elementoId === elementoId);
  const si  = answersElem.filter(a => a.value === true).length;
  const no  = answersElem.filter(a => a.value === false).length;
  const pct = answersElem.length ? Math.round((si / answersElem.length) * 100) : 0;
  const color = pct >= 90 ? '#059669' : pct >= 70 ? '#d97706' : '#dc2626';

  // Construir mapa id->texto usando constants importados dinámicamente
  // Como no podemos importar en runtime fácilmente, usamos los datos del answer
  // que ya tienen el questionId — necesitamos cruzar con los textos

  return (
    <div className="elem-resp-block">
      <button className="elem-resp-header" onClick={() => setAbierto(a => !a)} type="button">
        <div className="elem-resp-left">
          <span className="elem-resp-num">Elemento {elementoId}</span>
          <span className="elem-resp-nombre">{elemInfo.nombre}</span>
        </div>
        <div className="elem-resp-right">
          <div className="elem-resp-bar-wrap">
            <div className="elem-resp-bar-fill" style={{ width: `${pct}%`, background: color }} />
          </div>
          <span className="elem-resp-pct" style={{ color }}>
            {si}/{answersElem.length} · {pct}%
          </span>
          <span className="elem-resp-toggle">{abierto ? '▲' : '▼'}</span>
        </div>
      </button>

      {abierto && (
        <div className="elem-resp-body">
          <div className="elem-resp-legend">
            <span className="legend-si">✓ SÍ ({si})</span>
            <span className="legend-no">✗ NO ({no})</span>
          </div>
          {answersElem.map((ans, i) => (
            <div key={ans.questionId} className={`resp-row ${ans.value ? 'resp-row--si' : 'resp-row--no'}`}>
              <span className={`resp-icon ${ans.value ? 'resp-icon--si' : 'resp-icon--no'}`}>
                {ans.value ? '✓' : '✗'}
              </span>
              <span className="resp-texto">{ans.questionText || ans.questionId}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailModalEC({ evalId, token, tipo, onClose }) {
  const [data, setData] = useState(null);
  const authH = { Authorization: `Bearer ${token}` };
  const ep = tipo === 'ec0217' ? 'ec0217' : 'ec0301';
  const elemsInfo = tipo === 'ec0217' ? EC0217_ELEMS : EC0301_ELEMS;
  const codigo = tipo === 'ec0217' ? 'EC0217.01' : 'EC0301';

  // Importar preguntas dinámicamente según tipo
  const [preguntasMap, setPreguntasMap] = useState({});

  useEffect(() => {
    // Cargar el constants correspondiente para obtener textos
    const mod = tipo === 'ec0217'
      ? import('/src/constants_ec0217.js')
      : import('/src/constants_ec0301.js');

    mod.then(m => {
      const map = {};
      m.getAllPreguntas().forEach(p => { map[p.id] = p.texto; });
      setPreguntasMap(map);
    }).catch(() => {});

    fetch(`${API_URL}/api/admin/${ep}/${evalId}`, { headers: authH })
      .then(r => r.json()).then(setData);
  }, [evalId]);

  if (!data) return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-loading">Cargando...</div>
      </div>
    </div>
  );

  const rec = REC_CONFIG[data.recomendacion] || REC_CONFIG.ASESORARSE;
  const pct = parseFloat(data.porcentaje);

  // Enriquecer answers con texto de pregunta y elementoId
  const answers = (Array.isArray(data.answers) ? data.answers : []).map(a => ({
    ...a,
    questionText: preguntasMap[a.questionId] || a.questionId,
  }));

  const desglose = [
    { si: data.elem1_si, total: data.elem1_total },
    { si: data.elem2_si, total: data.elem2_total },
    { si: data.elem3_si, total: data.elem3_total },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{data.nombre}</h2>
            <p className="modal-subtitle">{codigo} · {fmtDate2(data.fecha)}</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Info candidato */}
        <div className="modal-info-grid">
          <div><label>Correo</label><span>{data.correo}</span></div>
          {data.empresa && <div><label>Empresa</label><span>{data.empresa}</span></div>}
          {data.sector  && <div><label>Sector</label><span>{data.sector}</span></div>}
          <div><label>Ubicación</label><span>{data.ciudad}, {data.estado}</span></div>
        </div>

        {/* Hero */}
        <div className="modal-hero" style={{ background: rec.bg, borderColor: rec.color }}>
          <div className="modal-score" style={{ background: rec.color }}>
            <span>{pct}%</span><small>{data.total_si}/{data.total_reactivos}</small>
          </div>
          <div>
            <div className="modal-risk-label" style={{ color: rec.color }}>{rec.dot} Se recomienda: {data.recomendacion}</div>
            <div className="modal-risk-pct">Umbral de aprobación: 90%</div>
          </div>
        </div>

        {/* Respuestas por elemento colapsables */}
        <div className="modal-answers">
          <h3 className="modal-section-title">📋 Respuestas por elemento</h3>
          <p className="modal-section-hint">Haz clic en cada elemento para ver las respuestas individuales</p>
          {[1, 2, 3].map(elemId => (
            <ElementoRespuestas
              key={elemId}
              elementoId={elemId}
              elemInfo={elemsInfo[elemId]}
              answers={answers}
              tipo={tipo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Admin Panel Principal ────────────────────────────────────────────────────
export default function AdminPanel() {
  const [token, setToken] = useState(() => sessionStorage.getItem('admin_token') || '');
  const [tab, setTab]     = useState('dashboard');

  const handleLogin  = (t) => { sessionStorage.setItem('admin_token', t); setToken(t); };
  const handleLogout = ()  => { sessionStorage.removeItem('admin_token'); setToken(''); };

  if (!token) return <LoginScreen onLogin={handleLogin} />;

  const TABS = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'drivesafe', icon: '🚗', label: 'DriveSafe IQ' },
    { id: 'ec0217',    icon: '📋', label: 'EC0217' },
    { id: 'ec0301',    icon: '📐', label: 'EC0301' },
  ];

  return (
    <div className="admin-wrapper">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <img src="/logo2.png" alt="CMC" className="admin-logo" />
            <div>
              <h1 className="admin-title">Panel Administrativo</h1>
              <p className="admin-subtitle">Consultores CMC · Centro de Diagnósticos</p>
            </div>
          </div>
          <button className="admin-btn-logout" onClick={handleLogout}>Salir →</button>
        </div>
        <nav className="admin-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`admin-tab ${tab===t.id?'admin-tab--active':''}`} onClick={()=>setTab(t.id)}>
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="admin-content">
        {tab==='dashboard' && <Dashboard token={token} onNavigate={setTab} />}
        {tab==='drivesafe' && <TablaDriveSafe token={token} onLogout={handleLogout} />}
        {tab==='ec0217'    && <TablaEC token={token} tipo="ec0217" onLogout={handleLogout} />}
        {tab==='ec0301'    && <TablaEC token={token} tipo="ec0301" onLogout={handleLogout} />}
      </div>
    </div>
  );
}