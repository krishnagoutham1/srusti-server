// emailTemplates/bookingConfirmation.js
module.exports = (data) => {
  const { name, date, time, amount, phone, email, bookingId, meeting_link } =
    data;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Booking Confirmation - Sree Srusti</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #fff8e1;
          margin: 0;
          padding: 30px 0;
          color: #4a3c06;
        }
        .container {
          max-width: 600px;
          margin: auto;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #fff;
          text-align: center;
          padding: 25px;
        }
        .header h2 {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
        }
        .content {
          padding: 30px 25px;
          line-height: 1.6;
          font-size: 15px;
          color: #444;
        }
        .info-box {
          background: #fff7e6;
          border-left: 5px solid #f59e0b;
          padding: 15px 20px;
          margin: 20px 0;
          border-radius: 8px;
        }
        .info-box p {
          margin: 5px 0;
        }
        .meeting-btn {
          display: inline-block;
          background: #f59e0b;
          color: #fff;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: bold;
          margin-top: 10px;
          transition: background 0.3s ease;
        }
        .meeting-btn:hover {
          background: #d97706;
        }
        .footer {
          background: #fff8e1;
          text-align: center;
          padding: 15px;
          font-size: 12px;
          color: #866a09;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 Booking Confirmed!</h2>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for booking with <strong>Sree Srusti</strong>. Your appointment has been successfully confirmed.</p>
          <p>Below are your booking and payment details:</p>

          <div class="info-box">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mobile:</strong> ${phone}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time Slot:</strong> ${time}</p>
            <p><strong>Amount Paid:</strong> ₹${(amount / 100).toFixed(2)}</p>
            <p><strong>Booking ID:</strong> ${bookingId}</p>
          </div>
    
          <p style="margin-top:20px;">Your meeting has been scheduled via <strong>Google Meet</strong>.</p>
          <a href="${meeting_link}" target="_blank" class="meeting-btn">Join Meeting</a>
          <p style="font-size:13px;color:#6b4f0a;margin-top:8px;">(Click the button above to join your session at the scheduled time)</p>
         
          <p>We look forward to seeing you at your appointment.</p>
          <p>If you have any questions or need to make changes, please contact our support team.</p>

          <p>Warm regards,<br/>
          <strong>The Sree Srusti Team</strong></p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Sree Srusti Services. All rights reserved.
        </div>
      </div>
    </body>
  </html>`;
};
