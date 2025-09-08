import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.8rem;
  font-weight: 700;
  color: #667eea;
  text-decoration: none;
`;

const Navigation = styled.nav`
  display: flex;
  gap: 20px;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: #333;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;
  
  &:hover {
    background: #f8f9ff;
    color: #667eea;
  }
`;

const AuthButtons = styled.div`
  display: flex;
  gap: 10px;
`;

const LoginButton = styled(Link)`
  padding: 8px 16px;
  border: 1px solid #667eea;
  color: #667eea;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: #667eea;
    color: white;
  }
`;

const RegisterButton = styled(Link)`
  padding: 8px 16px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: #5a6fd8;
  }
`;

const Header = () => {
  const { t } = useTranslation();

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo to="/">{t('appName')}</Logo>
        
        <Navigation>
          <NavLink to="/">{t('home')}</NavLink>
          <NavLink to="/products">{t('products')}</NavLink>
          <NavLink to="/children">{t('children')}</NavLink>
          <NavLink to="/orders">{t('orders')}</NavLink>
        </Navigation>
        
        <AuthButtons>
          <LoginButton to="/login">{t('login')}</LoginButton>
          <RegisterButton to="/register">{t('register')}</RegisterButton>
        </AuthButtons>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;