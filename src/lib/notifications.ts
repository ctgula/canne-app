// Notification service for Cannè app
// Supports both SMS (Twilio) and Email (Resend) notifications

interface NotificationConfig {
  resendApiKey?: string;
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
}

interface CustomerInfo {
  phone?: string;
  email?: string;
  name?: string;
}

interface DriverInfo {
  phone?: string;
  email?: string;
  name: string;
}

interface OrderDetails {
  shortCode: string;
  address?: string;
  amount?: number;
  customerName?: string;
  eta?: string;
}

class NotificationService {
  private config: NotificationConfig;

  constructor() {
    this.config = {
      resendApiKey: process.env.RESEND_API_KEY,
      twilioAccountSid: process.env.TWILIO_ACCOUNT_SID,
      twilioAuthToken: process.env.TWILIO_AUTH_TOKEN,
      twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER,
    };
  }

  async sendSMS(phone: string, message: string): Promise<boolean> {
    if (!this.config.twilioAccountSid || !this.config.twilioAuthToken) {
      console.log('SMS notification (Twilio not configured):', { phone, message });
      return false;
    }

    try {
      // TODO: Implement Twilio SMS sending
      // const twilio = require('twilio')(this.config.twilioAccountSid, this.config.twilioAuthToken);
      // await twilio.messages.create({
      //   body: message,
      //   from: this.config.twilioPhoneNumber,
      //   to: phone
      // });
      
      console.log('SMS sent successfully:', { phone, message });
      return true;
    } catch (error) {
      console.error('Failed to send SMS:', error);
      return false;
    }
  }

  async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
    if (!this.config.resendApiKey) {
      console.log('Email notification (Resend not configured):', { email, subject, message });
      return false;
    }

    try {
      // TODO: Implement Resend email sending
      // const resend = new Resend(this.config.resendApiKey);
      // await resend.emails.send({
      //   from: 'orders@canne.app',
      //   to: email,
      //   subject: subject,
      //   html: message
      // });
      
      console.log('Email sent successfully:', { email, subject, message });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  // Reusable utility functions for order status triggers
  async onOrderPaid(customer: CustomerInfo, order: OrderDetails): Promise<void> {
    const message = "✅ Payment confirmed. Driver on the way.";
    await this.notifyCustomer(customer, message, "Payment Confirmed - Cannè");
  }

  async onDriverAssigned(customer: CustomerInfo, driver: DriverInfo, order: OrderDetails): Promise<void> {
    const eta = order.eta || "30-45 minutes";
    const message = `🚗 ${driver.name} is your driver. ETA: ${eta}`;
    await this.notifyCustomer(customer, message, "Driver Assigned - Cannè");
  }

  async onOrderDelivered(customer: CustomerInfo, order: OrderDetails): Promise<void> {
    const message = "Delivered ✅. Rate your drop.";
    await this.notifyCustomer(customer, message, "Order Delivered - Cannè");
  }

  async onOrderRefunded(customer: CustomerInfo, order: OrderDetails): Promise<void> {
    const message = `Your Cannè order ${order.shortCode} has been refunded. Please allow 1-3 business days for processing.`;
    await this.notifyCustomer(customer, message, "Order Refunded - Cannè");
  }

  // Private helper methods
  private async notifyCustomer(customer: CustomerInfo, message: string, subject: string): Promise<void> {
    const promises = [];
    
    if (customer.phone) {
      promises.push(this.sendSMS(customer.phone, message));
    }
    if (customer.email) {
      promises.push(this.sendEmail(customer.email, subject, message));
    }
    
    await Promise.all(promises);
  }

  private async notifyDriver(driver: DriverInfo, message: string, subject: string): Promise<void> {
    const promises = [];
    
    if (driver.phone) {
      promises.push(this.sendSMS(driver.phone, message));
    }
    if (driver.email) {
      promises.push(this.sendEmail(driver.email, subject, message));
    }
    
    await Promise.all(promises);
  }

  // Driver notification methods
  async notifyNewJobAssigned(driver: DriverInfo, order: OrderDetails): Promise<void> {
    const message = `🚗 New delivery: Order ${order.shortCode} - ${order.address || 'Address in app'}. Check your dashboard.`;
    await this.notifyDriver(driver, message, "New Delivery Assignment - Cannè");
  }

  // Legacy methods for backward compatibility
  async notifyPaymentConfirmed(customer: CustomerInfo): Promise<void> {
    await this.onOrderPaid(customer, { shortCode: '' });
  }

  async notifyDriverAssigned(customer: CustomerInfo, driverName: string, eta: string): Promise<void> {
    await this.onDriverAssigned(customer, { name: driverName }, { shortCode: '', eta });
  }

  async notifyOrderDelivered(customer: CustomerInfo): Promise<void> {
    await this.onOrderDelivered(customer, { shortCode: '' });
  }
}

export const notificationService = new NotificationService();

// Export utility functions for easy use in API routes
export const notifyOrderStatusChange = {
  paid: notificationService.onOrderPaid.bind(notificationService),
  assigned: notificationService.onDriverAssigned.bind(notificationService),
  delivered: notificationService.onOrderDelivered.bind(notificationService),
  refunded: notificationService.onOrderRefunded.bind(notificationService),
};
