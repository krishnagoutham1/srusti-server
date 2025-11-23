// utils/createMeet.js
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");

async function createGoogleMeetEvent({
  summary,
  description,
  startTime,
  endTime,
  attendees = [],
}) {
  try {
    // Load credentials & token
    const credentials = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../config/credentials.json"))
    );
    const token = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../config/token.json"))
    );

    const { client_secret, client_id } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      "http://localhost" // your redirect URI
    );
    oAuth2Client.setCredentials(token);

    // Init Google Calendar
    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    // Event object
    const event = {
      summary: summary || "Sree Srusti Appointment",
      description:
        description || "Consultation meeting scheduled via Sree Srusti.",
      start: { dateTime: startTime, timeZone: "Asia/Kolkata" },
      end: { dateTime: endTime, timeZone: "Asia/Kolkata" },
      attendees: attendees.map((email) => ({ email })),
      conferenceData: {
        createRequest: {
          requestId: "meet-" + Date.now(),
          conferenceSolutionKey: { type: "hangoutsMeet" },
        },
      },
    };

    // Insert the event
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.hangoutLink;
    console.log("✅ Google Meet link generated:", meetLink);
    return meetLink;
  } catch (err) {
    console.error("❌ Failed to create Google Meet:", err.message);
    return null; // don’t break flow if Meet fails
  }
}

module.exports = { createGoogleMeetEvent };
