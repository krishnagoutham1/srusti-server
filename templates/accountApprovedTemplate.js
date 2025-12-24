module.exports = (data) => {
  const { name, email } = data;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Account Approved - Welcome to Sree Srusti</title>
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
        .info-box strong {
          display: inline-block;
          width: 100px;
          color: #333;
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
        .login-btn {
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
        .login-btn:hover {
          background-color: #d97706;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 Account Approved</h2>
        </div>
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          <p>We’re happy to inform you that your account has been <span class="highlight">approved by the admin</span>. You can now log in and start using our platform.</p>

          <div class="info-box">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
          </div>

          <p style="text-align: center;">
            <a href="http://sreesrusti/login" target="_blank" class="login-btn">Login to Your Account</a>
          </p>

          <p>If you didn’t request this account or believe this email was sent in error, please contact our support team immediately.</p>

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
