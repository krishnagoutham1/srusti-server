module.exports = (data) => {
  const { name, email, mobile, verifyUrl } = data;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>New User Verification - Sree Srusti</title>
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
          font-size: 24px;
          font-weight: 700;
        }
        .content {
          padding: 30px 25px;
          line-height: 1.6;
          font-size: 15px;
          color: #444;
        }
        .content p {
          margin: 10px 0;
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
        .info-box strong {
          display: inline-block;
          width: 100px;
          color: #333;
        }
        .verify-btn {
          display: inline-block;
          background-color: #f59e0b;
          color: white !important;
          text-decoration: none;
          padding: 12px 25px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          margin: 25px 0 15px 0;
          transition: background 0.3s ease;
        }
        .verify-btn:hover {
          background-color: #d97706;
        }
        .highlight {
          color: #b45309;
          font-weight: bold;
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
          <h2>🆕 New User Verification</h2>
        </div>
        <div class="content">
          <p>Hello <strong>Admin</strong>,</p>
          <p>A new user has requested account creation. Please review the details below and verify their account:</p>

          <div class="info-box">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mobile:</strong> ${mobile}</p>
          </div>

          <p style="text-align: center;">
            <a href="${verifyUrl}" class="verify-btn" target="_blank">Verify User</a>
          </p>

          <p>This verification link will expire in <span class="highlight">1 hour</span> for security reasons.</p>

          <p>Regards,<br/>
          <strong>The Sree Srusti Team</strong></p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Sree Srusti Services. Admin Notification.
        </div>
      </div>
    </body>
  </html>`;
};
