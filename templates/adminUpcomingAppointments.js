// emailTemplates/adminUpcomingAppointments.js
module.exports = (data) => {
  const { adminName = "Admin", appointments = [] } = data;

  const formattedDate = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const slotsHTML =
    appointments.length > 0
      ? appointments
          .map(
            (slot, index) => `
          <tr>
            <td style="padding:8px 12px;">${index + 1}</td>
            <td style="padding:8px 12px;">${slot.user_name || "N/A"}</td>
            <td style="padding:8px 12px;">${slot.user_email || "N/A"}</td>
            <td style="padding:8px 12px;">${slot.ref_date}</td>
            <td style="padding:8px 12px;">${slot.start_time} – ${
              slot.end_time
            }</td>
            <td style="padding:8px 12px;">₹${slot.price_in_paise / 100} ${
              slot.currency
            }</td>
          </tr>`
          )
          .join("")
      : `<tr><td colspan="6" style="padding:12px;">No booked appointments for the next hour.</td></tr>`;

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Upcoming Hourly Appointments - Sree Srusti</title>
    </head>
    <body style="font-family:'Segoe UI',Arial,sans-serif;background:#fff8e1;margin:0;padding:30px 0;color:#4a3c06;">
      <div style="max-width:700px;margin:auto;background:#fff;border-radius:12px;box-shadow:0 4px 15px rgba(0,0,0,0.1);overflow:hidden;">
        <div style="background:linear-gradient(135deg,#fbbf24,#f59e0b);color:#fff;text-align:center;padding:25px;">
          <h2 style="margin:0;font-size:22px;">🕒 Upcoming Appointments (Next Hour)</h2>
        </div>
        <div style="padding:25px 30px;font-size:15px;color:#444;">
          <p>Hello <strong>${adminName}</strong>,</p>
          <p>Here are the appointments scheduled within the <strong>next hour</strong> (${formattedDate}):</p>
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-top:15px;background:#fff7e6;border-radius:8px;overflow:hidden;">
            <thead style="background:#fcd34d;color:#4a3c06;">
              <tr>
                <th style="padding:10px;">#</th>
                <th style="padding:10px;">Name</th>
                <th style="padding:10px;">Email</th>
                <th style="padding:10px;">Date</th>
                <th style="padding:10px;">Time</th>
                <th style="padding:10px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${slotsHTML}
            </tbody>
          </table>
          <p style="margin-top:20px;">Please ensure all arrangements are in place before these sessions begin.</p>
          <p>Regards,<br/><strong>The Sree Srusti System</strong></p>
        </div>
        <div style="background:#fff8e1;text-align:center;padding:12px;font-size:12px;color:#866a09;">
          © ${new Date().getFullYear()} Sree Srusti Services. All rights reserved.
        </div>
      </div>
    </body>
  </html>`;
};
