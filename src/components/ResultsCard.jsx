import React, { useRef } from 'react';
import { RISK_LEVELS, FREQUENCY_OPTIONS } from '../constants.js';
import '../styles/results.css';

function downloadResultsAsPDF(result, answers, questions, userName) {
  const { feedback, totalScore, maxScore } = result;
  const riskKey = feedback.riskLevel || 'PRECAUCION';
  const risk = RISK_LEVELS[riskKey] || RISK_LEVELS.PRECAUCION;
  const pct = Math.round((totalScore / maxScore) * 100);
  const date = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

  const freqLabel = (val) => FREQUENCY_OPTIONS.find(o => o.value === val)?.label || '-';

  const answersRows = questions.map(q => {
    const ans = answers.find(a => a.questionId === q.id);
    const val = ans?.value ?? 0;
    const label = freqLabel(val);
    const color = val >= 3 ? '#c01515' : val === 2 ? '#c67c00' : '#1b7f3e';
    return `
      <tr>
        <td style="padding:7px 10px;font-size:12px;color:#1a2e4a;border-bottom:1px solid #eef0f4;">${q.text}</td>
        <td style="padding:7px 10px;text-align:center;font-size:12px;font-weight:600;color:${color};border-bottom:1px solid #eef0f4;">${label}</td>
        <td style="padding:7px 10px;text-align:center;font-size:12px;font-weight:700;color:${color};border-bottom:1px solid #eef0f4;">${val}/4</td>
      </tr>`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Evaluación de Seguridad Vial – ${userName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;800&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Barlow',sans-serif; background:#f4f6fa; color:#1a2e4a; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .page { max-width:800px; margin:0 auto; background:#fff; }
  
  /* HEADER */
  .pdf-header { background:linear-gradient(135deg,#1a2e4a 0%,#0f4c75 100%); padding:32px 40px; display:flex; justify-content:space-between; align-items:center; }
  .pdf-logo { height:50px; }
  .pdf-header-right { text-align:right; }
  .pdf-date { font-size:12px; color:rgba(255,255,255,0.7); margin-bottom:4px; }
  .pdf-eval { font-size:11px; color:rgba(255,255,255,0.5); text-transform:uppercase; letter-spacing:1px; }
  
  /* USER INFO */
  .pdf-user { background:#f8f9fa; padding:20px 40px; border-bottom:1px solid #e0e4e8; }
  .pdf-user-label { font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:4px; }
  .pdf-user-name { font-size:22px; font-weight:700; color:#1a2e4a; }
  
  /* HERO */
  .pdf-hero { background:${risk.bg}; border-left:6px solid ${risk.color}; padding:28px 40px; display:flex; align-items:center; gap:24px; }
  .pdf-score-circle { width:90px; height:90px; border-radius:50%; background:${risk.color}; display:flex; flex-direction:column; align-items:center; justify-content:center; flex-shrink:0; }
  .pdf-score-num { font-size:26px; font-weight:800; color:#fff; line-height:1; }
  .pdf-score-max { font-size:11px; color:rgba(255,255,255,0.8); margin-top:2px; }
  .pdf-risk-info {}
  .pdf-risk-label { font-size:22px; font-weight:800; color:${risk.color}; text-transform:uppercase; letter-spacing:1px; }
  .pdf-risk-icon { font-size:32px; margin-bottom:6px; }
  .pdf-risk-sub { font-size:13px; color:#666; margin-top:4px; }
  .pdf-bar-wrap { margin-top:10px; background:#e0e0e0; border-radius:99px; height:8px; width:250px; }
  .pdf-bar-fill { height:8px; border-radius:99px; background:${risk.bar}; width:${pct}%; }
  
  /* SECTION */
  .pdf-section { padding:24px 40px; border-bottom:1px solid #eef0f4; }
  .pdf-section-title { font-size:11px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:2px; margin-bottom:12px; }
  .pdf-summary { font-size:14px; line-height:1.7; color:#2d3748; }
  
  /* GRID */
  .pdf-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; padding:24px 40px; }
  .pdf-box { border:1px solid #eef0f4; border-radius:12px; padding:18px; }
  .pdf-box-title { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px; }
  .risks-title { color:#c01515; }
  .recs-title { color:#1b7f3e; }
  .pdf-list { list-style:none; }
  .pdf-list li { font-size:13px; color:#2d3748; padding:6px 0; border-bottom:1px solid #f5f5f5; display:flex; gap:8px; line-height:1.4; }
  .pdf-list li:last-child { border-bottom:none; }
  .pdf-bullet-risk { color:#c01515; font-weight:800; flex-shrink:0; }
  .pdf-bullet-rec { color:#1b7f3e; font-weight:800; flex-shrink:0; }
  
  /* TABLE */
  .pdf-table-section { padding:20px 40px 30px; }
  .pdf-table { width:100%; border-collapse:collapse; }
  .pdf-table th { background:#1a2e4a; color:#fff; padding:10px 10px; font-size:11px; text-align:left; font-weight:600; letter-spacing:0.5px; }
  .pdf-table th:last-child { text-align:center; }
  .pdf-table th:nth-child(2) { text-align:center; }
  .pdf-table tr:nth-child(even) td { background:#f8f9fc; }
  
  /* FOOTER */
  .pdf-footer { background:#1a2e4a; padding:16px 40px; display:flex; justify-content:space-between; align-items:center; }
  .pdf-footer-left { font-size:11px; color:rgba(255,255,255,0.6); }
  .pdf-footer-right { font-size:11px; color:rgba(255,255,255,0.6); }
  .pdf-footer a { color:#4db87a; text-decoration:none; }
  
  @media print {
    body { background:#fff; }
    .page { box-shadow:none; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="pdf-header">
    <img src="${window.location.origin}/logo2.png" alt="CMC" class="pdf-logo">
    <div class="pdf-header-right">
      <div class="pdf-date">Evaluado el ${date}</div>
      <div class="pdf-eval">Evaluación de Seguridad Vial</div>
    </div>
  </div>

  <div class="pdf-user">
    <div class="pdf-user-label">Evaluado a:</div>
    <div class="pdf-user-name">${userName}</div>
  </div>

  <div class="pdf-hero">
    <div class="pdf-score-circle">
      <div class="pdf-score-num">${totalScore}</div>
      <div class="pdf-score-max">/ ${maxScore}</div>
    </div>
    <div class="pdf-risk-info">
      <div class="pdf-risk-icon">${risk.icon}</div>
      <div class="pdf-risk-label">${risk.label}</div>
      <div class="pdf-risk-sub">Puntuación: ${totalScore} de ${maxScore} puntos (${pct}%)</div>
      <div class="pdf-bar-wrap"><div class="pdf-bar-fill"></div></div>
    </div>
  </div>

  <div class="pdf-section">
    <div class="pdf-section-title">📊 Análisis Personalizado</div>
    <p class="pdf-summary">${feedback.summary}</p>
  </div>

  <div class="pdf-grid">
    <div class="pdf-box">
      <div class="pdf-box-title risks-title">⚠ Riesgos Críticos</div>
      <ul class="pdf-list">
        ${feedback.topRisks.map(r => `<li><span class="pdf-bullet-risk">▶</span>${r}</li>`).join('')}
      </ul>
    </div>
    <div class="pdf-box">
      <div class="pdf-box-title recs-title">✅ Recomendaciones</div>
      <ul class="pdf-list">
        ${feedback.recommendations.map(r => `<li><span class="pdf-bullet-rec">▶</span>${r}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="pdf-table-section">
    <div class="pdf-section-title" style="margin-bottom:14px;">📋 Detalle de Respuestas</div>
    <table class="pdf-table">
      <thead>
        <tr>
          <th style="width:60%;">Conducta evaluada</th>
          <th>Frecuencia</th>
          <th>Puntos</th>
        </tr>
      </thead>
      <tbody>${answersRows}</tbody>
    </table>
  </div>

  <div class="pdf-footer">
    <div class="pdf-footer-left">Consultores CMC · <a href="https://consultorescmc.com">consultorescmc.com</a></div>
    <div class="pdf-footer-right">Esta evaluación es una herramienta educativa. Maneja con responsabilidad.</div>
  </div>
</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export default function ResultsCard({ result, answers, questions, userName, onReset }) {
  const { feedback, totalScore, maxScore } = result;
  const riskKey = feedback.riskLevel || 'PRECAUCION';
  const risk    = RISK_LEVELS[riskKey] || RISK_LEVELS.PRECAUCION;
  const pct     = Math.round((totalScore / maxScore) * 100);

  return (
    <main className="results-main">
      <div className="results-card">

        {/* Score Hero */}
        <div className="results-hero" style={{ '--risk-color': risk.color, '--risk-bg': risk.bg, '--risk-bar': risk.bar }}>
          <div className="score-circle">
            <span className="score-num">{totalScore}</span>
            <span className="score-denom">/{maxScore}</span>
          </div>
          <div className="risk-info">
            <div className="risk-icon-lg">{risk.icon}</div>
            <h2 className="risk-label">{risk.label}</h2>
            <p className="risk-subtitle">{pct}% de la puntuación máxima</p>
            <div className="score-bar-track">
              <div className="score-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="results-section">
          <h3 className="section-title">
            <span className="section-icon">🧠</span> Análisis de IA
          </h3>
          <p className="summary-text">{feedback.summary}</p>
        </div>

        {/* Risks & Recs */}
        <div className="results-grid">
          <div className="results-box risks-box">
            <h4 className="box-title risks-title">⚠ Riesgos Críticos</h4>
            <ul className="box-list">
              {feedback.topRisks.map((r, i) => (
                <li key={i}><span className="bullet-risk">▶</span>{r}</li>
              ))}
            </ul>
          </div>
          <div className="results-box recs-box">
            <h4 className="box-title recs-title">✅ Recomendaciones</h4>
            <ul className="box-list">
              {feedback.recommendations.map((r, i) => (
                <li key={i}><span className="bullet-rec">▶</span>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="results-actions">
          <button
            className="btn-download"
            onClick={() => downloadResultsAsPDF(result, answers, questions, userName)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="20" height="20">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar Resultado (PDF)
          </button>
          <button className="btn-reset" onClick={onReset}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="18" height="18">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
            </svg>
            Repetir Encuesta
          </button>
        </div>

        <p className="legal-note">
          Esta evaluación es una herramienta educativa y no sustituye el asesoramiento profesional. Maneja con responsabilidad.
        </p>
      </div>
    </main>
  );
}
