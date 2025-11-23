const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const {
  otpTemplate,
  userCreationTemplate,
  accountApprovedTemplate,
  adminUpcomingAppointments,
  userAppointmentReminder,
  bookingConfirmation,
} = require("../templates");

const sendEmail = async (to, templateId, dynamicTemplateData) => {
  try {
    const msg = {
      to,
      from: {
        email: process.env.SENDGRID_EMAIL_FROM,
        name: process.env.SENDGRID_EMAIL_NAME,
      },
      templateId,
      dynamicTemplateData,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("SendGrid error:", error.response?.body || error.message);
    throw new Error("Email could not be sent");
  }
};

const sendUserCreationEmail = async (data) => {
  const { name, email, mobile, verifyUrl } = data;

  // Optional: quick log for debugging (can remove later)
  console.log("📧 Sending user creation email:", {
    name,
    email,
    mobile,
    verifyUrl,
  });

  // Generate HTML email content
  const htmlContent = userCreationTemplate({ name, email, mobile, verifyUrl });

  const msg = {
    to: process.env.ADMIN_EMAIL, // Admin email for approval
    from: {
      email: process.env.SENDGRID_EMAIL_FROM, // Verified sender in SendGrid
      name: "Sree Srusti", // Optional: readable sender name
    },
    subject: "New User Verification Required",
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log("✅ Admin verification email sent successfully");
  } catch (error) {
    console.error(
      "❌ Error sending admin email:",
      error.response?.body || error
    );
    throw new Error("Failed to send verification email");
  }
};

const sendAccountApprovedEmail = async (data) => {
  const { name, email } = data;

  console.log("📧 Sending account approval email to user:", { name, email });

  const htmlContent = accountApprovedTemplate({ name, email });

  const msg = {
    to: email, // send to the user
    from: {
      email: process.env.SENDGRID_EMAIL_FROM,
      name: "Sree Srusti",
    },
    subject: "Your Account Has Been Approved ✅",
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Account approval email sent to ${email}`);
  } catch (error) {
    console.error(
      "❌ Error sending account approval email:",
      error.response?.body || error
    );
    throw new Error("Failed to send account approval email");
  }
};

const sendOtpEmail = async (data) => {
  const { name, subject, userEmail, otp, toEmail } = data;

  console.log("📧 Sending OTP email to admin:", {
    name,
    subject,
    userEmail,
    otp,
    toEmail,
  });

  const htmlContent = otpTemplate({ name, subject, userEmail, otp });

  const msg = {
    to: toEmail,
    from: {
      email: process.env.SENDGRID_EMAIL_FROM,
      name: "Sree Srusti",
    },
    subject: `OTP to ${subject} - ${name}`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(
      `✅ OTP email sent to admin for ${subject} of user ${name} to ${toEmail}`
    );
  } catch (error) {
    console.error("❌ Error sending OTP email:", error.response?.body || error);
    throw new Error("Failed to send OTP email");
  }
};

const sendAdminReminderEmail = async (appointments) => {
  try {
    const htmlContent = adminUpcomingAppointments({
      adminName: "Admin",
      appointments,
    });

    const msg = {
      to: process.env.ADMIN_EMAIL, // or multiple admins via array
      from: {
        email: process.env.SENDGRID_EMAIL_FROM,
        name: "Sree Srusti",
      },
      subject: `Upcoming Appointments (Next Hour) - ${new Date().toLocaleDateString(
        "en-IN"
      )}`,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log("✅ Admin upcoming appointment reminder sent!");
  } catch (error) {
    console.error(
      "❌ Error sending admin reminder email:",
      error.response?.body || error
    );
  }
};

const sendUserReminderEmail = async (user) => {
  try {
    const htmlContent = userAppointmentReminder({
      name: user.name,
      slot: user.slot,
    });

    const msg = {
      to: user.email,
      from: {
        email: process.env.SENDGRID_EMAIL_FROM,
        name: "Sree Srusti",
      },
      subject: `Reminder: Your Appointment at ${user.slot.start_time}`,
      html: htmlContent,
    };

    await sgMail.send(msg);
    console.log(`✅ Reminder email sent to user: ${user.email}`);
  } catch (error) {
    console.error(
      "❌ Error sending user reminder email:",
      error.response?.body || error
    );
  }
};

const sendBookingConfirmationEmail = async (data) => {
  const { name, date, time, amount, phone, email, bookingId, meeting_link } =
    data;

  console.log("📧 Sending Booking Confirmation email:", {
    name,
    date,
    time,
    amount,
    phone,
    email,
    bookingId,
    meeting_link,
  });

  // Generate HTML from template
  const htmlContent = bookingConfirmation({
    name,
    date,
    time,
    amount,
    phone,
    email,
    bookingId,
    meeting_link,
  });

  const msg = {
    to: email, // recipient (user)
    from: {
      email: process.env.SENDGRID_EMAIL_FROM,
      name: "Sree Srusti",
    },
    subject: `Booking Confirmed – ${time} on ${date}`,
    html: htmlContent,
  };

  try {
    await sgMail.send(msg);
    console.log(`✅ Booking confirmation email sent to ${name} (${email})`);
  } catch (error) {
    console.error(
      "❌ Error sending booking confirmation email:",
      error.response?.body || error
    );
    throw new Error("Failed to send booking confirmation email");
  }
};

module.exports = {
  sendEmail,
  sendUserCreationEmail,
  sendAccountApprovedEmail,
  sendOtpEmail,
  sendAdminReminderEmail,
  sendUserReminderEmail,
  sendBookingConfirmationEmail,
};
