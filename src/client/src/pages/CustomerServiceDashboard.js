import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 15px;
  margin-bottom: 30px;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0 0 10px 0;
  font-size: 2.5rem;
  font-weight: bold;
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 15px;
  padding: 25px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border-left: 5px solid ${props => props.color || '#667eea'};
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: ${props => props.color || '#667eea'};
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 1rem;
  font-weight: 500;
`;

const TabContainer = styled.div`
  background: white;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TabHeader = styled.div`
  display: flex;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const Tab = styled.button`
  padding: 15px 25px;
  border: none;
  background: ${props => props.active ? '#667eea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: ${props => props.active ? '#667eea' : '#e9ecef'};
  }
`;

const TabContent = styled.div`
  padding: 25px;
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const OrderCard = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 10px;
  padding: 20px;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
  }
`;

const OrderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const OrderNumber = styled.span`
  font-weight: bold;
  color: #667eea;
  font-size: 1.1rem;
`;

const PriorityBadge = styled.span`
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  color: white;
  background: ${props => {
    switch (props.priority) {
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'normal': return '#28a745';
      case 'low': return '#6c757d';
      default: return '#6c757d';
    }
  }};
`;

const CustomerInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
`;

const InfoItem = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' && `
    background: #667eea;
    color: white;
    &:hover { background: #5a67d8; }
  `}
  
  ${props => props.variant === 'success' && `
    background: #28a745;
    color: white;
    &:hover { background: #218838; }
  `}
  
  ${props => props.variant === 'danger' && `
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; }
  `}
  
  ${props => props.variant === 'outline' && `
    background: transparent;
    color: #667eea;
    border: 1px solid #667eea;
    &:hover { background: #667eea; color: white; }
  `}
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-size: 1.1rem;
  color: #666;
`;

const CustomerServiceDashboard = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pending');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab) {
      fetchOrdersByTab(activeTab);
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      // Mock data for demonstration
      setStats({
        pendingConfirmations: 23,
        confirmations: {
          today: 45,
          week: 234,
          month: 892
        },
        duplicateOrders: 5,
        customers: {
          bad: 12,
          loyal: 156
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const fetchOrdersByTab = async (tab) => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockOrders = [
        {
          _id: '1',
          orderNumber: 'BV20241201001',
          user: {
            firstName: 'أحمد',
            lastName: 'بن علي',
            phone: '+213555123456',
            customerClassification: { type: 'loyal' }
          },
          totals: { total: 4500 },
          confirmation: {
            status: 'pending',
            priority: 'high',
            attempts: []
          },
          createdAt: new Date(),
          shippingAddress: {
            city: 'الجزائر',
            province: 'الجزائر'
          }
        },
        {
          _id: '2',
          orderNumber: 'BV20241201002',
          user: {
            firstName: 'فاطمة',
            lastName: 'محمدي',
            phone: '+213666789012',
            customerClassification: { type: 'new' }
          },
          totals: { total: 2300 },
          confirmation: {
            status: 'attempting',
            priority: 'normal',
            attempts: [{ attemptNumber: 1, result: 'no_answer' }]
          },
          createdAt: new Date(),
          shippingAddress: {
            city: 'وهران',
            province: 'وهران'
          }
        }
      ];
      
      setOrders(mockOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOrder = (orderId) => {
    console.log('Assigning order:', orderId);
    // Implementation would call API to assign order
  };

  const handleConfirmOrder = (orderId) => {
    console.log('Confirming order:', orderId);
    // Implementation would call API to confirm order
  };

  const handleCallCustomer = (phone) => {
    console.log('Calling customer:', phone);
    // Implementation would initiate call or record attempt
  };

  if (!stats) {
    return <LoadingSpinner>جاري تحميل لوحة خدمة العملاء...</LoadingSpinner>;
  }

  return (
    <Container>
      <Header>
        <Title>إيكومانجر - خدمة العملاء</Title>
        <Subtitle>لوحة تحكم تأكيد الطلبات وإدارة العملاء</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard color="#dc3545">
          <StatNumber color="#dc3545">{stats.pendingConfirmations}</StatNumber>
          <StatLabel>طلبات في انتظار التأكيد</StatLabel>
        </StatCard>
        
        <StatCard color="#28a745">
          <StatNumber color="#28a745">{stats.confirmations.today}</StatNumber>
          <StatLabel>تأكيدات اليوم</StatLabel>
        </StatCard>
        
        <StatCard color="#fd7e14">
          <StatNumber color="#fd7e14">{stats.duplicateOrders}</StatNumber>
          <StatLabel>طلبات مكررة محتملة</StatLabel>
        </StatCard>
        
        <StatCard color="#6f42c1">
          <StatNumber color="#6f42c1">{stats.customers.loyal}</StatNumber>
          <StatLabel>عملاء مخلصون</StatLabel>
        </StatCard>
      </StatsGrid>

      <TabContainer>
        <TabHeader>
          <Tab 
            active={activeTab === 'pending'} 
            onClick={() => setActiveTab('pending')}
          >
            طلبات في الانتظار ({stats.pendingConfirmations})
          </Tab>
          <Tab 
            active={activeTab === 'attempting'} 
            onClick={() => setActiveTab('attempting')}
          >
            جاري المحاولة
          </Tab>
          <Tab 
            active={activeTab === 'confirmed'} 
            onClick={() => setActiveTab('confirmed')}
          >
            مؤكدة
          </Tab>
          <Tab 
            active={activeTab === 'duplicates'} 
            onClick={() => setActiveTab('duplicates')}
          >
            طلبات مكررة
          </Tab>
        </TabHeader>

        <TabContent>
          {loading ? (
            <LoadingSpinner>جاري التحميل...</LoadingSpinner>
          ) : (
            <OrderList>
              {orders.map(order => (
                <OrderCard key={order._id}>
                  <OrderHeader>
                    <OrderNumber>{order.orderNumber}</OrderNumber>
                    <PriorityBadge priority={order.confirmation.priority}>
                      {order.confirmation.priority === 'urgent' && 'عاجل'}
                      {order.confirmation.priority === 'high' && 'مرتفع'}
                      {order.confirmation.priority === 'normal' && 'عادي'}
                      {order.confirmation.priority === 'low' && 'منخفض'}
                    </PriorityBadge>
                  </OrderHeader>

                  <CustomerInfo>
                    <InfoItem>
                      <strong>العميل:</strong> {order.user.firstName} {order.user.lastName}
                    </InfoItem>
                    <InfoItem>
                      <strong>الهاتف:</strong> {order.user.phone}
                    </InfoItem>
                    <InfoItem>
                      <strong>المبلغ:</strong> {order.totals.total} دج
                    </InfoItem>
                    <InfoItem>
                      <strong>المدينة:</strong> {order.shippingAddress.city}
                    </InfoItem>
                    <InfoItem>
                      <strong>نوع العميل:</strong> 
                      {order.user.customerClassification.type === 'loyal' && ' مخلص'}
                      {order.user.customerClassification.type === 'new' && ' جديد'}
                      {order.user.customerClassification.type === 'bad' && ' سيء'}
                      {order.user.customerClassification.type === 'vip' && ' VIP'}
                      {order.user.customerClassification.type === 'regular' && ' عادي'}
                    </InfoItem>
                    <InfoItem>
                      <strong>المحاولات:</strong> {order.confirmation.attempts.length}
                    </InfoItem>
                  </CustomerInfo>

                  <ActionButtons>
                    <Button 
                      variant="primary" 
                      onClick={() => handleCallCustomer(order.user.phone)}
                    >
                      📞 اتصال
                    </Button>
                    <Button 
                      variant="success" 
                      onClick={() => handleConfirmOrder(order._id)}
                    >
                      ✅ تأكيد
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleAssignOrder(order._id)}
                    >
                      👤 تكليف موظف
                    </Button>
                    <Button variant="danger">
                      ❌ إلغاء
                    </Button>
                  </ActionButtons>
                </OrderCard>
              ))}
            </OrderList>
          )}
        </TabContent>
      </TabContainer>
    </Container>
  );
};

export default CustomerServiceDashboard;