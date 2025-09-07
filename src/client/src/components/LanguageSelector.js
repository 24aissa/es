import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

const Logo = styled.h1`
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 10px;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 1.1rem;
`;

const Title = styled.h2`
  color: #333;
  margin-bottom: 30px;
  font-size: 1.5rem;
`;

const LanguageButton = styled.button`
  display: block;
  width: 100%;
  padding: 15px 20px;
  margin: 10px 0;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  background: white;
  color: #333;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #667eea;
    background: #f8f9ff;
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Flag = styled.span`
  font-size: 1.5rem;
  margin-right: 10px;
`;

const LanguageSelector = ({ onLanguageSelect }) => {
  const languages = [
    { code: 'ar', name: 'العربية', flag: '🇩🇿' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'dz', name: 'الدارجة الجزائرية', flag: '🗣️' }
  ];

  return (
    <Container>
      <Card>
        <Logo>BabyVibe</Logo>
        <Subtitle>بيبي فايب</Subtitle>
        <Title>اختر اللغة / Choisir la langue</Title>
        
        {languages.map((language) => (
          <LanguageButton
            key={language.code}
            onClick={() => onLanguageSelect(language.code)}
          >
            <Flag>{language.flag}</Flag>
            {language.name}
          </LanguageButton>
        ))}
      </Card>
    </Container>
  );
};

export default LanguageSelector;