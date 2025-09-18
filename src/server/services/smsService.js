const moment = require('moment');

class SMSService {
  constructor() {
    this.provider = process.env.SMS_PROVIDER || 'mock';
    this.apiKey = process.env.SMS_API_KEY;
    this.senderId = process.env.SMS_SENDER_ID || 'EcoManager';
  }

  // Send confirmation SMS based on step
  async sendConfirmationSMS(order, step) {
    const customer = order.user || await order.populate('user');
    const phone = order.shippingAddress.phone || customer.phone;
    
    if (!phone) {
      throw new Error('No phone number available for SMS');
    }

    let message = '';
    let type = 'confirmation';

    switch (step) {
      case 'assigned':
        message = this.getAssignmentMessage(order, customer);
        break;
      case 'confirmed':
        message = this.getConfirmationMessage(order, customer);
        type = 'confirmation';
        break;
      case 'reschedule':
        message = this.getRescheduleMessage(order, customer);
        type = 'reminder';
        break;
      case 'cancelled':
        message = this.getCancellationMessage(order, customer);
        type = 'status_update';
        break;
      case 'shipped':
        message = this.getShippingMessage(order, customer);
        type = 'delivery_notification';
        break;
      case 'delivered':
        message = this.getDeliveryMessage(order, customer);
        type = 'delivery_notification';
        break;
      default:
        throw new Error(`Unknown SMS step: ${step}`);
    }

    const result = await this.sendSMS(phone, message);
    
    // Log SMS in order history
    await order.sendSMS(type, message, this.provider);

    return result;
  }

  // Generate assignment message
  getAssignmentMessage(order, customer) {
    const language = customer.preferredLanguage || 'ar';
    
    const messages = {
      ar: `مرحبا ${customer.firstName}، تم استلام طلبكم رقم ${order.orderNumber}. سيتم التواصل معكم قريباً لتأكيد الطلب. شكراً لثقتكم في إيكومانجر.`,
      fr: `Bonjour ${customer.firstName}, nous avons reçu votre commande ${order.orderNumber}. Nous vous contactons bientôt pour confirmation. Merci de votre confiance en EcoManager.`,
      dz: `أهلا ${customer.firstName}، وصلنا طلبك رقم ${order.orderNumber}. غادي نكلموك باش نأكدو معاك. شكرا على ثقتك فينا.`
    };

    return messages[language] || messages.ar;
  }

  // Generate confirmation message
  getConfirmationMessage(order, customer) {
    const language = customer.preferredLanguage || 'ar';
    const deliveryDate = order.delivery.estimatedDelivery 
      ? moment(order.delivery.estimatedDelivery).format('DD/MM/YYYY')
      : 'قريباً';

    const messages = {
      ar: `شكراً ${customer.firstName}! تم تأكيد طلبكم ${order.orderNumber} بقيمة ${order.totals.total} دج. التوصيل المتوقع: ${deliveryDate}. إيكومانجر`,
      fr: `Merci ${customer.firstName}! Votre commande ${order.orderNumber} de ${order.totals.total} DA est confirmée. Livraison prévue: ${deliveryDate}. EcoManager`,
      dz: `بارك الله فيك ${customer.firstName}! طلبك ${order.orderNumber} بـ ${order.totals.total} دج تأكد. التوصيل: ${deliveryDate}. إيكومانجر`
    };

    return messages[language] || messages.ar;
  }

  // Generate reschedule message
  getRescheduleMessage(order, customer) {
    const language = customer.preferredLanguage || 'ar';
    const nextAttempt = order.confirmation.attempts[order.confirmation.attempts.length - 1]?.nextAttemptAt;
    const rescheduleTime = nextAttempt 
      ? moment(nextAttempt).format('DD/MM/YYYY HH:mm')
      : 'قريباً';

    const messages = {
      ar: `${customer.firstName}، سنعاود الاتصال بكم ${rescheduleTime} لتأكيد طلبكم ${order.orderNumber}. إيكومانجر`,
      fr: `${customer.firstName}, nous vous rappellerons le ${rescheduleTime} pour confirmer votre commande ${order.orderNumber}. EcoManager`,
      dz: `${customer.firstName}، غادي نعاودو نكلموك ${rescheduleTime} باش نأكدو طلبك ${order.orderNumber}. إيكومانجر`
    };

    return messages[language] || messages.ar;
  }

  // Generate cancellation message
  getCancellationMessage(order, customer) {
    const language = customer.preferredLanguage || 'ar';

    const messages = {
      ar: `${customer.firstName}، تم إلغاء طلبكم ${order.orderNumber} حسب طلبكم. نأسف لعدم إتمام الخدمة. إيكومانجر`,
      fr: `${customer.firstName}, votre commande ${order.orderNumber} a été annulée selon votre demande. Désolé pour le désagrément. EcoManager`,
      dz: `${customer.firstName}، طلبك ${order.orderNumber} تلغا كيما طلبت. متأسفين ما قدرناش نكملو معاك. إيكومانجر`
    };

    return messages[language] || messages.ar;
  }

  // Generate shipping message
  getShippingMessage(order, customer) {
    const language = customer.preferredLanguage || 'ar';
    const trackingNumber = order.delivery.trackingNumber || 'غير متوفر';

    const messages = {
      ar: `${customer.firstName}، طلبكم ${order.orderNumber} في طريقه إليكم. رقم التتبع: ${trackingNumber}. إيكومانجر`,
      fr: `${customer.firstName}, votre commande ${order.orderNumber} est en route. Numéro de suivi: ${trackingNumber}. EcoManager`,
      dz: `${customer.firstName}، طلبك ${order.orderNumber} راه جاي ليك. رقم التتبع: ${trackingNumber}. إيكومانجر`
    };

    return messages[language] || messages.ar;
  }

  // Generate delivery message
  getDeliveryMessage(order, customer) {
    const language = customer.preferredLanguage || 'ar';

    const messages = {
      ar: `${customer.firstName}، تم توصيل طلبكم ${order.orderNumber} بنجاح! نشكركم لاختياركم إيكومانجر. نرجو تقييم خدمتنا.`,
      fr: `${customer.firstName}, votre commande ${order.orderNumber} a été livrée avec succès! Merci d'avoir choisi EcoManager. Veuillez évaluer notre service.`,
      dz: `${customer.firstName}، طلبك ${order.orderNumber} وصل بالسلامة! شكرا اخترت إيكومانجر. عطينا تقييم إذا عجبك الخدمة.`
    };

    return messages[language] || messages.ar;
  }

  // Send SMS using configured provider
  async sendSMS(phone, message) {
    try {
      // Clean phone number
      const cleanPhone = this.cleanPhoneNumber(phone);
      
      if (this.provider === 'mock') {
        // Mock SMS for development
        console.log(`📱 SMS to ${cleanPhone}: ${message}`);
        return {
          success: true,
          messageId: `mock_${Date.now()}`,
          status: 'sent',
          cost: 5 // Mock cost in DZD
        };
      }

      // Here you would integrate with actual SMS providers like:
      // - Algeria Telecom SMS API
      // - Nexmo/Vonage
      // - Twilio
      // - Local Algerian SMS providers

      // Example implementation for a generic SMS API:
      const response = await this.callSMSAPI(cleanPhone, message);
      
      return {
        success: true,
        messageId: response.messageId,
        status: response.status,
        cost: response.cost || 5
      };

    } catch (error) {
      console.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  // Clean and format phone number for Algeria
  cleanPhoneNumber(phone) {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Handle Algerian phone numbers
    if (cleaned.startsWith('213')) {
      // Already has country code
      return '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      // Local format, add country code
      return '+213' + cleaned.substring(1);
    } else if (cleaned.length === 9) {
      // 9 digits, assume local mobile
      return '+213' + cleaned;
    }
    
    return '+213' + cleaned;
  }

  // Mock SMS API call (replace with actual provider implementation)
  async callSMSAPI(phone, message) {
    // This is where you'd implement the actual SMS provider API call
    // For example, with a local Algerian SMS provider:
    
    /*
    const response = await fetch('https://sms-provider.dz/api/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: this.senderId,
        to: phone,
        message: message
      })
    });

    const result = await response.json();
    return result;
    */

    // Mock implementation
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          status: 'sent',
          cost: 5
        });
      }, 100);
    });
  }

  // Send bulk SMS to multiple customers
  async sendBulkSMS(phoneNumbers, message) {
    const results = [];
    
    for (const phone of phoneNumbers) {
      const result = await this.sendSMS(phone, message);
      results.push({
        phone,
        ...result
      });
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return results;
  }

  // Send reminder SMS for pending confirmations
  async sendConfirmationReminders() {
    const pendingOrders = await require('../models/Order').find({
      'confirmation.status': 'attempting',
      'confirmation.attempts.0': { $exists: true },
      createdAt: { $gte: moment().subtract(2, 'hours').toDate() }
    }).populate('user');

    let remindersSent = 0;

    for (const order of pendingOrders) {
      const lastAttempt = order.confirmation.attempts[order.confirmation.attempts.length - 1];
      
      // Send reminder if last attempt was more than 1 hour ago
      if (moment().diff(moment(lastAttempt.timestamp), 'hours') >= 1) {
        try {
          await this.sendConfirmationSMS(order, 'reschedule');
          remindersSent++;
        } catch (error) {
          console.error(`Failed to send reminder for order ${order.orderNumber}:`, error);
        }
      }
    }

    return { remindersSent };
  }
}

module.exports = {
  smsService: new SMSService()
};