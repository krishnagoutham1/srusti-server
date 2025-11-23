module.exports = (data) => {
  const { name, subject, userEmail, otp } = data;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>OTP to ${subject} - Sree Srusti</title>
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
        .otp-box {
          text-align: center;
          background: #fff7e6;
          border: 2px dashed #f59e0b;
          border-radius: 10px;
          padding: 20px;
          margin: 25px 0;
        }
        .otp {
          font-size: 26px;
          font-weight: 700;
          color: #b45309;
          letter-spacing: 4px;
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
          <h2>🔐 OTP to ${subject} for ${userEmail}</h2>
        </div>
        <div class="content">
          <p>Hello <strong>Admin</strong>,</p>
          <p>You’ve initiated to <span class="highlight">${subject}</span> for the following user:</p>

          <div class="info-box">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${userEmail}</p>
          </div>

          <p>Please use the following OTP to ${subject} for ${name}:</p>

          <div class="otp-box">
            <div class="otp">${otp}</div>
            <p>This OTP will expire in <strong>10 minutes</strong>.</p>
          </div>

          <p>If this request wasn’t made by you, please ignore this email or contact support immediately.</p>

          <p>Regards,<br/>
          <strong>The Sree Srusti Team</strong></p>
        </div>
        <div class="footer">
          © ${new Date().getFullYear()} Sree Srusti Services. All rights reserved.
        </div>
      </div>
    </body>
  </html>`;
};
