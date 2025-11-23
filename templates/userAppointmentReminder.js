// emailTemplates/userAppointmentReminder.js
module.exports = (data) => {
  const { name, slot } = data;

  const formattedDate = new Date(slot.ref_date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Your Upcoming Appointment Reminder - Sree Srusti</title>
    </head>
    <body style="font-family:'Segoe UI',Arial,sans-serif;background:#fff8e1;margin:0;padding:30px 0;color:#4a3c06;">
      <div style="max-width:600px;margin:auto;background:#ffffff;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.1);overflow:hidden;">
        <div style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#fff;text-align:center;padding:25px;">
          <h2 style="margin:0;font-size:22px;">📅 Appointment Reminder</h2>
        </div>
        <div style="padding:30px 25px;line-height:1.6;font-size:15px;color:#444;">
          <p>Hello <strong>${name}</strong>,</p>
          <p>This is a friendly reminder about your upcoming appointment with <strong>Sree Srusti</strong>.</p>

          <div style="background:#fff7e6;border-radius:10px;border:2px dashed #f59e0b;padding:20px;margin:20px 0;">
            <p style="margin:0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin:0;"><strong>Time:</strong> ${slot.start_time} – ${
    slot.end_time
  }</p>
            <p style="margin:0;"><strong>Consultation Status:</strong> ${
              slot.consultation
            }</p>
            <p style="margin:0;"><strong>Amount Paid:</strong> ₹${
              slot.price_in_paise / 100
            } ${slot.currency}</p>
          </div>

          <p>Please be ready a few minutes before your appointment time.</p>
          <p>If you need to reschedule, contact our support team.</p>

          <p>Wishing you a pleasant experience,<br/>
          <strong>The Sree Srusti Team</strong></p>
        </div>
        <div style="background:#fff8e1;text-align:center;padding:15px;font-size:12px;color:#866a09;">
          © ${new Date().getFullYear()} Sree Srusti Services. All rights reserved.
        </div>
      </div>
    </body>
  </html>`;
};
