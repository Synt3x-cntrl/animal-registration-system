const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../config/config.env') });

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/callback/google' // Frontend-ийн callback URL
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

/**
 * Google Calendar-ийн busy slots-ийг авна
 */
const getBusySlots = async (refreshToken, startTime, endTime) => {
    oauth2Client.setCredentials({ refresh_token: refreshToken });
    
    const response = await calendar.freebusy.query({
        requestBody: {
            timeMin: startTime,
            timeMax: endTime,
            items: [{ id: 'primary' }],
        },
    });

    return response.data.calendars.primary.busy;
};

/**
 * Шинэ Event үүсгэнэ
 */
const createCalendarEvent = async (refreshToken, eventDetails) => {
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const event = {
        summary: eventDetails.summary,
        description: eventDetails.description,
        start: {
            dateTime: eventDetails.startTime,
            timeZone: 'Asia/Ulaanbaatar',
        },
        end: {
            dateTime: eventDetails.endTime,
            timeZone: 'Asia/Ulaanbaatar',
        },
        attendees: eventDetails.attendees || [],
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 30 },
            ],
        },
    };

    const response = await calendar.events.insert({
        calendarId: 'primary',
        resource: event,
        sendUpdates: 'all',
    });

    return response.data;
};

module.exports = {
    getBusySlots,
    createCalendarEvent,
    oauth2Client
};
