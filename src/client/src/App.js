import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

// Import components (to be created)
import LanguageSelector from './components/LanguageSelector';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerServiceDashboard from './pages/CustomerServiceDashboard';

const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  direction: ${props => props.dir};
`;

const MainContent = styled.main`
  min-height: calc(100vh - 80px);
  padding: 20px;
`;

function App() {
  const { i18n } = useTranslation();
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);

  useEffect(() => {
    // Check if language was previously selected
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      setIsLanguageSelected(true);
      updateDirection(savedLanguage);
    }
  }, [i18n]);

  const updateDirection = (language) => {
    const direction = language === 'ar' || language === 'dz' ? 'rtl' : 'ltr';
    document.documentElement.dir = direction;
    document.body.dir = direction;
  };

  const handleLanguageSelect = (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('selectedLanguage', language);
    setIsLanguageSelected(true);
    updateDirection(language);
  };

  const currentDirection = i18n.language === 'ar' || i18n.language === 'dz' ? 'rtl' : 'ltr';

  if (!isLanguageSelected) {
    return (
      <AppContainer dir={currentDirection}>
        <LanguageSelector onLanguageSelect={handleLanguageSelect} />
      </AppContainer>
    );
  }

  return (
    <AppContainer dir={currentDirection}>
      <Router>
        <Header />
        <MainContent>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/customer-service" element={<CustomerServiceDashboard />} />
          </Routes>
        </MainContent>
      </Router>
    </AppContainer>
  );
}

export default App;