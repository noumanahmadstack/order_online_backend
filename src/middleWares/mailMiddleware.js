const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
  auth: {
    user: 'mohtashim.husnain@noorwoodworks.com', // Your email address
    pass: 'chhs emzt szvu zjxv', // Your email password or app-specific password
  },
});


exports.generateOTP =()=>{
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  }

  exports.sendOTPViaEmail= async (email, otp)=> {
    try {
      await transporter.sendMail({
        from: 'mohtashim.husnain@noorwoodworks.com', // Your email address
        to: email, // User's email address
        subject: 'Order Confirmation OTP',
        text: `Your order has been placed at Sultan Yakhni Pulao and your OTP for order confirmation is: ${otp}`,
      });
      console.log('OTP sent via email');
    } catch (error) {
      console.error('Failed to send OTP via email:', error);
    }
  }


  exports.notifyAdmin=async(order) =>{
    try {
      await transporter.sendMail({
        from: 'mohtashim.husnain@noorwoodworks.com', // Your email address
        to: 'mohtashim.husnain@noorwoodworks.com', // Admin's email address
        subject: 'New Order Received',
        text: `A new order has been received. Order ID: ${order.orderNumber}, Total Amount: ${order.totalAmount}`,
      });
      console.log('Admin notified via email');
    } catch (error) {
      console.error('Failed to notify admin:', error);
    }
  }