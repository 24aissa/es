const Order = require('../models/Order');
const User = require('../models/User');
const moment = require('moment');

class CustomerServiceService {
  // Get dashboard statistics
  async getDashboardStats() {
    const today = moment().startOf('day');
    const thisWeek = moment().startOf('week');
    const thisMonth = moment().startOf('month');

    const [
      pendingConfirmations,
      todayConfirmations,
      weeklyConfirmations,
      monthlyConfirmations,
      duplicateOrders,
      badCustomers,
      loyalCustomers,
      agentPerformance
    ] = await Promise.all([
      // Pending confirmations
      Order.countDocuments({
        'confirmation.status': { $in: ['pending', 'attempting'] },
        status: 'pending'
      }),
      
      // Today's confirmations
      Order.countDocuments({
        'confirmation.confirmedAt': { $gte: today.toDate() },
        'confirmation.status': 'confirmed'
      }),
      
      // Weekly confirmations
      Order.countDocuments({
        'confirmation.confirmedAt': { $gte: thisWeek.toDate() },
        'confirmation.status': 'confirmed'
      }),
      
      // Monthly confirmations
      Order.countDocuments({
        'confirmation.confirmedAt': { $gte: thisMonth.toDate() },
        'confirmation.status': 'confirmed'
      }),
      
      // Duplicate orders
      Order.countDocuments({
        'duplicateInfo.isDuplicate': true
      }),
      
      // Bad customers
      User.countDocuments({
        'customerClassification.type': 'bad'
      }),
      
      // Loyal customers
      User.countDocuments({
        'customerClassification.type': { $in: ['loyal', 'vip'] }
      }),
      
      // Agent performance (average response time)
      this.getAgentPerformanceStats()
    ]);

    return {
      pendingConfirmations,
      confirmations: {
        today: todayConfirmations,
        week: weeklyConfirmations,
        month: monthlyConfirmations
      },
      duplicateOrders,
      customers: {
        bad: badCustomers,
        loyal: loyalCustomers
      },
      agentPerformance
    };
  }

  // Get agent performance statistics
  async getAgentPerformanceStats() {
    const agents = await User.find({
      'agentInfo.isConfirmationAgent': true,
      isActive: true
    });

    const performance = await Promise.all(
      agents.map(async (agent) => {
        const todayStart = moment().startOf('day').toDate();
        const todayEnd = moment().endOf('day').toDate();

        const todayAttempts = await Order.aggregate([
          {
            $match: {
              'confirmation.attempts.agent': agent._id,
              'confirmation.attempts.timestamp': {
                $gte: todayStart,
                $lte: todayEnd
              }
            }
          },
          {
            $unwind: '$confirmation.attempts'
          },
          {
            $match: {
              'confirmation.attempts.agent': agent._id,
              'confirmation.attempts.timestamp': {
                $gte: todayStart,
                $lte: todayEnd
              }
            }
          },
          {
            $group: {
              _id: null,
              totalAttempts: { $sum: 1 },
              successfulAttempts: {
                $sum: {
                  $cond: [
                    { $eq: ['$confirmation.attempts.result', 'confirmed'] },
                    1,
                    0
                  ]
                }
              },
              avgDuration: { $avg: '$confirmation.attempts.duration' }
            }
          }
        ]);

        const stats = todayAttempts[0] || {
          totalAttempts: 0,
          successfulAttempts: 0,
          avgDuration: 0
        };

        return {
          agent: {
            _id: agent._id,
            name: `${agent.firstName} ${agent.lastName}`
          },
          today: stats
        };
      })
    );

    return performance;
  }

  // Auto-assign orders to agents based on preferences
  async autoAssignOrders() {
    // Get unassigned orders
    const unassignedOrders = await Order.find({
      'confirmation.status': 'pending',
      'confirmation.assignedAgent': { $exists: false },
      status: 'pending'
    }).populate('user');

    // Get available agents
    const availableAgents = await User.find({
      'agentInfo.isConfirmationAgent': true,
      isActive: true
    });

    let assignedCount = 0;
    const assignments = [];

    for (const order of unassignedOrders) {
      const suitableAgent = await this.findBestAgent(order, availableAgents);
      
      if (suitableAgent) {
        // Check if agent hasn't exceeded daily limit
        const todayAssignments = await Order.countDocuments({
          'confirmation.assignedAgent': suitableAgent._id,
          'confirmation.assignedAt': {
            $gte: moment().startOf('day').toDate()
          }
        });

        if (todayAssignments < suitableAgent.agentInfo.preferences.maxOrdersPerDay) {
          await order.assignToAgent(suitableAgent._id, this.calculatePriority(order));
          assignedCount++;
          assignments.push({
            orderId: order._id,
            agentId: suitableAgent._id,
            agentName: `${suitableAgent.firstName} ${suitableAgent.lastName}`
          });
        }
      }
    }

    return {
      assignedCount,
      assignments
    };
  }

  // Find the best agent for an order based on preferences
  async findBestAgent(order, agents) {
    let bestAgent = null;
    let bestScore = 0;

    for (const agent of agents) {
      let score = 0;
      
      // Language preference
      if (agent.agentInfo.preferences.preferredLanguages.includes(order.user.preferredLanguage)) {
        score += 30;
      }
      
      // Province preference
      if (agent.agentInfo.preferences.provinces.includes(order.shippingAddress.province)) {
        score += 20;
      }
      
      // Working hours check
      const currentHour = moment().format('HH:mm');
      const startTime = agent.agentInfo.preferences.workingHours.start;
      const endTime = agent.agentInfo.preferences.workingHours.end;
      
      if (currentHour >= startTime && currentHour <= endTime) {
        score += 25;
      }
      
      // Performance rating
      score += agent.agentInfo.performance.rating * 5;
      
      // Current workload (lower is better)
      const currentWorkload = await Order.countDocuments({
        'confirmation.assignedAgent': agent._id,
        'confirmation.status': 'attempting'
      });
      
      score -= currentWorkload * 5;
      
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    }

    return bestAgent;
  }

  // Calculate order priority based on customer and order characteristics
  calculatePriority(order) {
    const customer = order.user;
    
    // VIP customers get urgent priority
    if (customer.customerClassification.type === 'vip') {
      return 'urgent';
    }
    
    // High-value orders get high priority
    if (order.totals.total > 10000) {
      return 'high';
    }
    
    // Bad customers get low priority
    if (customer.customerClassification.type === 'bad') {
      return 'low';
    }
    
    // Loyal customers get high priority
    if (customer.customerClassification.type === 'loyal') {
      return 'high';
    }
    
    return 'normal';
  }

  // Detect duplicate orders
  async detectDuplicateOrders() {
    const recentOrders = await Order.find({
      createdAt: { $gte: moment().subtract(7, 'days').toDate() },
      'duplicateInfo.isDuplicate': { $ne: true }
    }).populate('user');

    let duplicatesFound = 0;
    const duplicatePairs = [];

    for (const order of recentOrders) {
      const duplicateCheck = await order.checkForDuplicates();
      
      if (duplicateCheck.isDuplicate) {
        duplicatesFound++;
        duplicatePairs.push({
          orderId: order._id,
          originalOrderId: duplicateCheck.originalOrder,
          score: duplicateCheck.score
        });
        
        await order.save(); // Save the duplicate info
      }
    }

    return {
      duplicatesFound,
      duplicatePairs,
      totalChecked: recentOrders.length
    };
  }

  // Update customer classifications for all users
  async updateAllCustomerClassifications() {
    const users = await User.find({ role: 'user' });
    let updated = 0;

    for (const user of users) {
      try {
        await user.updateCustomerClassification();
        updated++;
      } catch (error) {
        console.error(`Error updating classification for user ${user._id}:`, error);
      }
    }

    return { updated, total: users.length };
  }

  // Get confirmation statistics for a specific period
  async getConfirmationStats(startDate, endDate) {
    const stats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$confirmation.status',
          count: { $sum: 1 },
          avgAttempts: { $avg: { $size: '$confirmation.attempts' } }
        }
      }
    ]);

    return stats;
  }

  // Get SMS usage statistics
  async getSMSStats(startDate, endDate) {
    const stats = await Order.aggregate([
      {
        $match: {
          'smsHistory.sentAt': { $gte: startDate, $lte: endDate }
        }
      },
      {
        $unwind: '$smsHistory'
      },
      {
        $match: {
          'smsHistory.sentAt': { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            type: '$smsHistory.type',
            status: '$smsHistory.status'
          },
          count: { $sum: 1 },
          totalCost: { $sum: '$smsHistory.cost' }
        }
      }
    ]);

    return stats;
  }
}

module.exports = {
  customerServiceService: new CustomerServiceService()
};