import React, { useState } from 'react';
import '../styles/welcome.css';

export default function WelcomeScreen({ onStart }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length >= 3) {
      onStart(name.trim());
    }
  };

  return (
    <div className="welcome-screen">
      <header className="welcome-header">
        <img 
          src="/logo2.png" 
          alt="Consultores CMC" 
          className="welcome-logo"
        />
      </header>

      <main className="welcome-main">
        <div className="welcome-card">
          <div className="welcome-icon">
            <img 
              src="/LOGO4.png" 
              alt="CMC" 
              className="welcome-icon-img"
            />
          </div>
          
          <h1 className="welcome-title">
            Evaluación de Seguridad Vial
          </h1>
          
          <p className="welcome-subtitle">
            Evalúa tus conductas al volante y obtén un análisis personalizado sobre tu perfil de riesgo en la conducción.
          </p>

          <div className="welcome-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>20 preguntas sobre conductas de manejo</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Análisis detallado de tu perfil de riesgo</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Recomendaciones personalizadas para mejorar</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Descarga tu resultado en PDF</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="welcome-form">
            <label htmlFor="userName" className="form-label">
              Para comenzar, ingresa tu nombre completo:
            </label>
            <input
              type="text"
              id="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Juan Pérez López"
              className="form-input"
              autoFocus
              minLength={3}
              required
            />
            <button 
              type="submit" 
              className="btn-start"
              disabled={name.trim().length < 3}
            >
              Comenzar Evaluación
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="20" height="20">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </form>

          <p className="welcome-disclaimer">
            Esta evaluación es confidencial y tiene fines educativos. Los resultados te ayudarán a identificar áreas de mejora en tu conducción.
          </p>
        </div>
      </main>

      <footer className="welcome-footer">
        <span>© {new Date().getFullYear()} Consultores CMC · Seguridad e Higiene</span>
      </footer>
    </div>
  );
}