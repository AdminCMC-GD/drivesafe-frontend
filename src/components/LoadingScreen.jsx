import React from 'react';
import '../styles/loading.css';

const TIPS = [
  "El 90% de los accidentes se originan por errores humanos.",
  "Usar el cinturón reduce el riesgo de muerte en un 45%.",
  "El teléfono al volante multiplica 4x el riesgo de accidente.",
  "Manejar con sueño equivale a 0.05% de alcohol en sangre.",
  "La distancia de seguridad debe ser mínimo 2 segundos."
];

const randomTip = TIPS[Math.floor(Math.random() * TIPS.length)];

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="spinner-ring">
          <div className="spinner-inner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="32" height="32">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
        </div>
        <h2 className="loading-title">Analizando tu perfil...</h2>
        <p className="loading-subtitle">La IA está procesando tus respuestas</p>
        <div className="loading-tip">
          <span className="tip-icon">💡</span>
          <span>{randomTip}</span>
        </div>
        <div className="loading-dots">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
