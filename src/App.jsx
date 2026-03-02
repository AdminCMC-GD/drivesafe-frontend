import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header.jsx';
import WelcomeScreen from './components/WelcomeScreen.jsx';
import SurveyCard from './components/SurveyCard.jsx';
import ResultsCard from './components/ResultsCard.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import { QUESTIONS, API_URL } from './constants.js';
import './styles/main.css';

// Detectar ruta admin: /admin en la URL
const isAdminRoute = () =>
  window.location.pathname === '/admin' ||
  window.location.hash === '#/admin';

export default function App() {
  // Si la URL es /admin, mostrar directamente el panel
  if (isAdminRoute()) {
    return <AdminPanel />;
  }

  return <MainApp />;
}

function MainApp() {
  const [userName, setUserName]       = useState('');
  const [hasStarted, setHasStarted]   = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers]         = useState([]);
  const [isLoading, setIsLoading]     = useState(false);
  const [result, setResult]           = useState(null);
  const [error, setError]             = useState('');

  const progress = Math.round((answers.length / QUESTIONS.length) * 100);

  const handleStart = (name) => { setUserName(name); setHasStarted(true); };

  const handleAnswer = useCallback((questionId, value) => {
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== questionId);
      return [...filtered, { questionId, value }];
    });
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep(s => s + 1), 280);
    }
  }, [currentStep]);

  const handleSubmit = async () => {
    if (answers.length < QUESTIONS.length) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, userName })
      });
      if (!res.ok) throw new Error('Error del servidor');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError('No pudimos conectar con el servidor. Verifica que el backend esté corriendo en puerto 3001.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSurvey = () => {
    setUserName(''); setHasStarted(false); setAnswers([]);
    setCurrentStep(0); setResult(null); setError(''); setIsLoading(false);
  };

  const currentAnswer = answers.find(a => a.questionId === QUESTIONS[currentStep]?.id);
  const allAnswered   = answers.length >= QUESTIONS.length;

  if (isLoading) return <LoadingScreen />;

  if (result) {
    return (
      <>
        <Header showProgress={false} />
        <ResultsCard
          result={result}
          answers={answers}
          questions={QUESTIONS}
          userName={userName}
          onReset={resetSurvey}
        />
      </>
    );
  }

  if (!hasStarted) return <WelcomeScreen onStart={handleStart} />;

  return (
    <div className="app-wrapper">
      <Header progress={progress} answeredCount={answers.length} total={QUESTIONS.length} showProgress={!result} />
      <main className="main-content">
        <SurveyCard
          question={QUESTIONS[currentStep]}
          questionIndex={currentStep}
          totalQuestions={QUESTIONS.length}
          selectedValue={currentAnswer?.value}
          onAnswer={handleAnswer}
          onPrev={() => setCurrentStep(s => s - 1)}
          onNext={() => setCurrentStep(s => s + 1)}
          onSubmit={handleSubmit}
          canGoPrev={currentStep > 0}
          canGoNext={!!currentAnswer && currentStep < QUESTIONS.length - 1}
          isLastQuestion={currentStep === QUESTIONS.length - 1}
          allAnswered={allAnswered}
        />
        {error && <p className="error-message">{error}</p>}
      </main>
      <footer className="app-footer">
        <span>© {new Date().getFullYear()} Consultores CMC</span>
      </footer>
    </div>
  );
}
