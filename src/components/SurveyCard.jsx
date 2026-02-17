import React from 'react';
import { FREQUENCY_OPTIONS } from '../constants.js';
import '../styles/survey.css';

export default function SurveyCard({
  question, questionIndex, totalQuestions,
  selectedValue, onAnswer,
  onPrev, onNext, onSubmit,
  canGoPrev, canGoNext, isLastQuestion, allAnswered
}) {
  if (!question) return null;

  return (
    <div className="survey-card">
      <div className="question-header">
        <div className="question-number-badge">
          <span className="q-num">{questionIndex + 1}</span>
          <span className="q-total">/{totalQuestions}</span>
        </div>
        <div className="question-category">
          <span className="category-icon">🚗</span>
          Evaluación de Seguridad Vial
        </div>
      </div>

      <p className="question-text">{question.text}</p>

      <div className="options-grid">
        {FREQUENCY_OPTIONS.map(opt => (
          <button
            key={opt.value}
            className={`option-btn ${selectedValue === opt.value ? 'option-selected' : ''}`}
            onClick={() => onAnswer(question.id, opt.value)}
            aria-pressed={selectedValue === opt.value}
          >
            <span className="option-dot" />
            <span className="option-label">{opt.label}</span>
            {selectedValue === opt.value && (
              <span className="option-check">✓</span>
            )}
          </button>
        ))}
      </div>

      <div className="survey-nav">
        <button
          className="btn-nav btn-prev"
          onClick={onPrev}
          disabled={!canGoPrev}
          aria-label="Pregunta anterior"
        >
          ← Anterior
        </button>

        {!isLastQuestion ? (
          <button
            className="btn-nav btn-next"
            onClick={onNext}
            disabled={!canGoNext}
            aria-label="Siguiente pregunta"
          >
            Siguiente →
          </button>
        ) : (
          <button
            className="btn-submit"
            onClick={onSubmit}
            disabled={!allAnswered}
          >
            <span>Ver Mi Resultado</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </button>
        )}
      </div>

      {isLastQuestion && !allAnswered && (
        <p className="incomplete-notice">
          ⚠ Completa todas las preguntas para ver tu análisis
        </p>
      )}
    </div>
  );
}