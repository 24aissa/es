const cron = require('node-cron');
const User = require('../models/User');
const Child = require('../models/Child');

// Send size alerts every day at 9 AM
const scheduleSizeAlerts = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('🔔 Running daily size alert check...');
      
      // Skip if no database connection
      if (process.env.SKIP_DB === 'true') {
        console.log('📦 Skipping size alerts - database disabled');
        return;
      }
      
      // Find all children who need size alerts (every 6 months)
      const childrenNeedingAlerts = await Child.find({
        isActive: true,
        $or: [
          { lastSizeAlert: null },
          { lastSizeAlert: { $lte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) } }
        ]
      }).populate('parent');
      
      console.log(`📊 Found ${childrenNeedingAlerts.length} children needing size alerts`);
      
      for (const child of childrenNeedingAlerts) {
        try {
          // Check if parent wants size alerts
          if (child.parent.notificationSettings.sizeAlerts) {
            await sendSizeAlert(child);
            
            // Update last alert date
            child.lastSizeAlert = new Date();
            await child.save();
          }
        } catch (error) {
          console.error(`❌ Error sending size alert for child ${child._id}:`, error);
        }
      }
      
      console.log('✅ Size alert check completed');
    } catch (error) {
      console.error('❌ Error in size alert scheduler:', error);
    }
  });
  
  console.log('⏰ Size alert scheduler initialized - will run daily at 9 AM');
};

// Send product recommendations based on age
const scheduleProductRecommendations = () => {
  // Run every week on Monday at 10 AM
  cron.schedule('0 10 * * 1', async () => {
    try {
      console.log('🛍️ Running weekly product recommendations...');
      
      // Skip if no database connection
      if (process.env.SKIP_DB === 'true') {
        console.log('📦 Skipping product recommendations - database disabled');
        return;
      }
      
      // Find all active children
      const children = await Child.find({ isActive: true }).populate('parent');
      
      for (const child of children) {
        try {
          // Check if parent wants product recommendations
          if (child.parent.notificationSettings.productRecommendations) {
            await sendProductRecommendations(child);
          }
        } catch (error) {
          console.error(`❌ Error sending recommendations for child ${child._id}:`, error);
        }
      }
      
      console.log('✅ Product recommendations completed');
    } catch (error) {
      console.error('❌ Error in product recommendation scheduler:', error);
    }
  });
  
  console.log('⏰ Product recommendation scheduler initialized - will run weekly on Mondays at 10 AM');
};

// Send size alert notification
const sendSizeAlert = async (child) => {
  const ageInMonths = child.ageInMonths;
  const recommendedSize = child.getRecommendedClothingSize();
  
  // Create notification message based on parent's language
  const language = child.parent.preferredLanguage;
  let message;
  
  switch (language) {
    case 'fr':
      message = `Il est temps de vérifier la taille de ${child.name}! Taille recommandée: ${recommendedSize}`;
      break;
    case 'dz':
      message = `وقت تشوف قياس ${child.name}! القياس الموصى بيه: ${recommendedSize}`;
      break;
    default: // Arabic
      message = `حان الوقت لفحص مقاس ${child.name}! المقاس الموصى به: ${recommendedSize}`;
  }
  
  console.log(`📧 Size alert for ${child.name} (${ageInMonths} months): ${message}`);
  
  // TODO: Implement actual notification sending (email, SMS, push)
  // For now, just log the notification
  return {
    type: 'size_alert',
    childId: child._id,
    parentId: child.parent._id,
    message,
    recommendedSize,
    ageInMonths
  };
};

// Send product recommendations
const sendProductRecommendations = async (child) => {
  const categories = child.getAgeAppropriateCategories();
  const language = child.parent.preferredLanguage;
  
  let message;
  switch (language) {
    case 'fr':
      message = `Nouvelles recommandations pour ${child.name}: ${categories.join(', ')}`;
      break;
    case 'dz':
      message = `توصيات جديدة لـ ${child.name}: ${categories.join(', ')}`;
      break;
    default: // Arabic
      message = `توصيات جديدة لـ ${child.name}: ${categories.join(', ')}`;
  }
  
  console.log(`🛍️ Product recommendations for ${child.name}: ${message}`);
  
  // TODO: Implement actual recommendation sending
  return {
    type: 'product_recommendations',
    childId: child._id,
    parentId: child.parent._id,
    message,
    categories
  };
};

// Initialize all schedulers
const initializeSchedulers = () => {
  scheduleSizeAlerts();
  scheduleProductRecommendations();
  scheduleCustomerServiceTasks();
  
  console.log('🚀 All notification schedulers initialized');
};

// Schedule customer service automated tasks
const scheduleCustomerServiceTasks = () => {
  const { customerServiceService } = require('./customerServiceService');
  const { smsService } = require('./smsService');
  
  // Auto-assign orders every 15 minutes during business hours
  cron.schedule('*/15 8-18 * * 1-6', async () => {
    try {
      console.log('🔄 Running auto-assignment task...');
      const result = await customerServiceService.autoAssignOrders();
      console.log(`✅ Auto-assigned ${result.assignedCount} orders`);
    } catch (error) {
      console.error('❌ Error in auto-assignment task:', error);
    }
  });

  // Detect duplicate orders every hour
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('🔍 Running duplicate detection...');
      const result = await customerServiceService.detectDuplicateOrders();
      console.log(`✅ Detected ${result.duplicatesFound} potential duplicates`);
    } catch (error) {
      console.error('❌ Error in duplicate detection:', error);
    }
  });

  // Update customer classifications daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('📊 Updating customer classifications...');
      const result = await customerServiceService.updateAllCustomerClassifications();
      console.log(`✅ Updated ${result.updated}/${result.total} customer classifications`);
    } catch (error) {
      console.error('❌ Error updating customer classifications:', error);
    }
  });

  // Send confirmation reminders every 30 minutes during business hours
  cron.schedule('*/30 8-18 * * 1-6', async () => {
    try {
      console.log('📱 Sending confirmation reminders...');
      const result = await smsService.sendConfirmationReminders();
      console.log(`✅ Sent ${result.remindersSent} confirmation reminders`);
    } catch (error) {
      console.error('❌ Error sending confirmation reminders:', error);
    }
  });

  console.log('⏰ Customer service schedulers initialized');
  console.log('   - Auto-assignment: Every 15 minutes (8-18h, Mon-Sat)');
  console.log('   - Duplicate detection: Every hour');
  console.log('   - Customer classification: Daily at 2 AM');
  console.log('   - Confirmation reminders: Every 30 minutes (8-18h, Mon-Sat)');
};

module.exports = {
  initializeSchedulers,
  sendSizeAlert,
  sendProductRecommendations,
  scheduleCustomerServiceTasks
};