import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Hero = styled.section`
  text-align: center;
  padding: 60px 0;
  background: white;
  border-radius: 20px;
  margin-bottom: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
`;

const HeroTitle = styled.h1`
  font-size: 3rem;
  color: #333;
  margin-bottom: 20px;
  font-weight: 700;
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 15px 30px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
  }
`;

const Features = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 60px;
`;

const FeatureCard = styled.div`
  background: white;
  padding: 30px;
  border-radius: 15px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 20px;
`;

const FeatureTitle = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 15px;
  font-weight: 600;
`;

const FeatureDescription = styled.p`
  color: #666;
  line-height: 1.6;
`;

const HomePage = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: '👶',
      title: t('children'),
      description: 'تتبع نمو أطفالك واحصل على توصيات مخصصة حسب العمر'
    },
    {
      icon: '👕',
      title: t('clothing'),
      description: 'اكتشف الملابس المناسبة لعمر ومقاس طفلك'
    },
    {
      icon: '🧸',
      title: t('toys'),
      description: 'ألعاب تنموية آمنة ومناسبة لكل مرحلة عمرية'
    },
    {
      icon: '🍼',
      title: t('feeding'),
      description: 'منتجات الرضاعة والتغذية عالية الجودة'
    },
    {
      icon: '🚚',
      title: 'التوصيل السريع',
      description: 'توصيل لجميع ولايات الجزائر خلال 2-5 أيام عمل'
    },
    {
      icon: '📱',
      title: 'تنبيهات ذكية',
      description: 'تنبيهات تلقائية كل 6 أشهر لتحديث المقاسات'
    }
  ];

  return (
    <Container>
      <Hero>
        <HeroTitle>{t('welcome')}</HeroTitle>
        <HeroSubtitle>
          تطبيق متكامل لتتبع نمو الطفل واقتراح المنتجات المناسبة حسب العمر
          مع خدمة توصيل شاملة في الجزائر
        </HeroSubtitle>
        <CTAButton>{t('addChild')}</CTAButton>
      </Hero>

      <Features>
        {features.map((feature, index) => (
          <FeatureCard key={index}>
            <FeatureIcon>{feature.icon}</FeatureIcon>
            <FeatureTitle>{feature.title}</FeatureTitle>
            <FeatureDescription>{feature.description}</FeatureDescription>
          </FeatureCard>
        ))}
      </Features>
    </Container>
  );
};

export default HomePage;