const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendBookingEmail = async (data) => {
  const { name, date, time, amount, phone, bookingId, transactionId } = data;

  const htmlContent = `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Appointment Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
      <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <tr>
          <td style="padding: 20px; text-align: center; background: #4caf50; color: white; border-radius: 8px 8px 0 0;">
            <h2>Appointment Confirmed</h2>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; color: #333;">
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for booking with us. Your appointment and payment details are as follows:</p>
            
            <table width="100%" cellpadding="8" cellspacing="0" style="margin-top: 10px; border-collapse: collapse;">
              <tr style="background: #f1f1f1;">
                <td><strong>Date</strong></td>
                <td>${date}</td>
              </tr>
              <tr>
                <td><strong>Time</strong></td>
                <td>${time}</td>
              </tr>
              <tr style="background: #f1f1f1;">
                <td><strong>Amount Paid</strong></td>
                <td>₹${amount}</td>
              </tr>
              <tr>
                <td><strong>Phone Number</strong></td>
                <td>${phone}</td>
              </tr>
              <tr style="background: #f1f1f1;">
                <td><strong>Booking ID</strong></td>
                <td>${bookingId}</td>
              </tr>
              <tr>
                <td><strong>Transaction ID</strong></td>
                <td>${transactionId}</td>
              </tr>
            </table>

            <p style="margin-top: 20px;">We look forward to seeing you at your appointment.</p>
            <p style="margin-top: 10px;">Best regards,<br/>The Appointment Team</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 15px; text-align: center; font-size: 12px; color: #777; background: #f8f9fa; border-radius: 0 0 8px 8px;">
            © ${new Date().getFullYear()} Appointment Services. All rights reserved.
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  const msg = {
    to: "jktechminds@gmail.com", // receiver email
    from: "venkatanaveen3377@gmail.com", // must be verified in SendGrid
    subject: "Your Appointment Confirmation",
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email", error.response?.body || error);
  }
};

// Example usage
// sendBookingEmail({
//   name: "John Doe",
//   date: "2025-10-05",
//   time: "10:00 AM - 11:00 AM",
//   amount: "1500",
//   phone: "+91-9876543210",
//   bookingId: "BK123456",
//   transactionId: "TX987654",
// });

module.exports = { sendBookingEmail };
