const { google } = require("googleapis");
const path = require("path");

// 🔑 Auth setup
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "../config/service-account.json"),
  scopes: ["https://www.googleapis.com/auth/calendar"],
});

const calendar = google.calendar({ version: "v3", auth });

// 🗓️ Function to create event with Meet link
async function createMeetEvent() {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() + 1); // 1 hr from now
  const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 min later

  const event = {
    summary: "Demo Google Meet Event",
    description: "Testing automatic Meet link creation",
    start: { dateTime: startTime.toISOString(), timeZone: "Asia/Kolkata" },
    end: { dateTime: endTime.toISOString(), timeZone: "Asia/Kolkata" },
    attendees: [{ email: "krishngoutham91@gmail.com" }],
    conferenceData: {
      createRequest: {
        requestId: "demo-" + Date.now(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  try {
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });

    console.log("✅ Event created:");
    console.log("📅 Summary:", response.data.summary);
    console.log("🔗 Meet link:", response.data.hangoutLink);
  } catch (err) {
    console.error("❌ Error creating event:", err.message);
  }
}

module.exports = { createMeetEvent };
