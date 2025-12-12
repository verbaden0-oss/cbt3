import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Journal from './pages/Journal';
import CBTExercises from './pages/CBTExercises';
import SobrietyLog from './pages/SobrietyLog';
import Triggers from './pages/Triggers';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Breathing from './pages/Breathing';
import Grounding from './pages/Grounding';
import CopingCards from './pages/CopingCards';
import Achievements from './pages/Achievements';
import SOSMode from './pages/SOSMode';
import CognitiveDistortions from './pages/CognitiveDistortions';
import ABCAnalysis from './pages/ABCAnalysis';
import UrgeSurfing from './pages/UrgeSurfing';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

function App() {

  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="journal" element={<Journal />} />
            <Route path="cbt" element={<CBTExercises />} />
            <Route path="sobriety" element={<SobrietyLog />} />
            <Route path="triggers" element={<Triggers />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="breathing" element={<Breathing />} />
            <Route path="grounding" element={<Grounding />} />
            <Route path="coping-cards" element={<CopingCards />} />
            <Route path="achievements" element={<Achievements />} />
            <Route path="sos" element={<SOSMode />} />
            <Route path="distortions" element={<CognitiveDistortions />} />
            <Route path="abc" element={<ABCAnalysis />} />
            <Route path="urge-surfing" element={<UrgeSurfing />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;

