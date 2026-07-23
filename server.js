require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, httpOnly: true }
}));

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth Setup
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_REDIRECT_URI
  },
  (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      accessToken,
      refreshToken
    };
    return done(null, user);
  }
));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Email Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Google Calendar API
function getCalendarClient(accessToken) {
  return google.calendar({
    version: 'v3',
    auth: google.auth.fromJSON({
      type: 'authorized_user',
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: accessToken
    })
  });
}

// Get Available Time Slots
app.post('/api/calendar/available-slots', async (req, res) => {
  try {
    const { date, accessToken } = req.body;
    
    if (!accessToken) {
      return res.status(400).json({ error: 'Access token required' });
    }

    const calendar = getCalendarClient(accessToken);
    const startOfDay = moment(date).tz(process.env.TIMEZONE).startOf('day');
    const endOfDay = moment(date).tz(process.env.TIMEZONE).endOf('day');

    // Buscar eventos do dia
    const events = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: startOfDay.toISOString(),
      timeMax: endOfDay.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    // Gerar slots disponíveis
    const businessStart = parseInt(process.env.BUSINESS_HOURS_START);
    const businessEnd = parseInt(process.env.BUSINESS_HOURS_END);
    const occupiedSlots = events.data.items || [];

    const availableSlots = [];
    for (let hour = businessStart; hour < businessEnd; hour++) {
      const slotStart = moment(date).tz(process.env.TIMEZONE).hour(hour).minute(0);
      const slotEnd = slotStart.clone().add(1, 'hour');

      const isOccupied = occupiedSlots.some(event => {
        const eventStart = moment(event.start.dateTime);
        const eventEnd = moment(event.end.dateTime);
        return slotStart.isBefore(eventEnd) && slotEnd.isAfter(eventStart);
      });

      if (!isOccupied) {
        availableSlots.push({
          startTime: slotStart.format('HH:00'),
          startDateTime: slotStart.toISOString(),
          endDateTime: slotEnd.toISOString()
        });
      }
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({ error: 'Failed to fetch available slots' });
  }
});

// Create Meeting Booking
app.post('/api/booking/create', async (req, res) => {
  try {
    const { 
      clientName, 
      clientEmail, 
      clientPhone,
      serviceType,
      description,
      meetingDateTime,
      accessToken 
    } = req.body;

    if (!accessToken || !meetingDateTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const calendar = getCalendarClient(accessToken);
    const startTime = moment(meetingDateTime);
    const endTime = startTime.clone().add(1, 'hour');

    // Criar evento no Google Calendar
    const event = {
      summary: `Reunião com ${clientName} - ${serviceType}`,
      description: `Serviço: ${serviceType}\n\nDescrição: ${description}\n\nCliente: ${clientName}\nEmail: ${clientEmail}\nTelefone: ${clientPhone}`,
      start: { dateTime: startTime.toISOString(), timeZone: process.env.TIMEZONE },
      end: { dateTime: endTime.toISOString(), timeZone: process.env.TIMEZONE },
      attendees: [
        { email: clientEmail },
        { email: process.env.GOOGLE_CALENDAR_ID }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 4320 }, // 3 dias
          { method: 'email', minutes: 1440 }, // 1 dia
          { method: 'email', minutes: 180 },  // 3 horas
          { method: 'email', minutes: 60 }    // 1 hora
        ]
      },
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' }
        }
      }
    };

    const createdEvent = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all'
    });

    // Enviar email de confirmação
    await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: clientEmail,
      subject: `Confirmação da Reunião - BMM Marketing`,
      html: `
        <h2>Confirmação de Agendamento</h2>
        <p>Olá <strong>${clientName}</strong>,</p>
        <p>A sua reunião foi agendada com sucesso!</p>
        
        <h3>Detalhes da Reunião:</h3>
        <ul>
          <li><strong>Data:</strong> ${startTime.format('DD/MM/YYYY')}</li>
          <li><strong>Hora:</strong> ${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}</li>
          <li><strong>Serviço:</strong> ${serviceType}</li>
          <li><strong>Descrição:</strong> ${description}</li>
        </ul>
        
        <p><strong>Notificações:</strong> Receberá lembretes 3 dias antes, 1 dia antes, 3 horas antes e 1 hora antes da reunião.</p>
        
        <p>Em caso de dúvidas, entre em contacto através de <a href="mailto:${process.env.EMAIL_FROM}">${process.env.EMAIL_FROM}</a></p>
        
        <p>Atenciosamente,<br/>BMM Marketing</p>
      `
    });

    // Enviar email ao proprietário
    await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to: process.env.EMAIL_FROM,
      subject: `Nova Reunião Agendada - ${clientName}`,
      html: `
        <h2>Nova Reunião Agendada</h2>
        
        <h3>Dados do Cliente:</h3>
        <ul>
          <li><strong>Nome:</strong> ${clientName}</li>
          <li><strong>Email:</strong> ${clientEmail}</li>
          <li><strong>Telefone:</strong> ${clientPhone}</li>
        </ul>
        
        <h3>Detalhes da Reunião:</h3>
        <ul>
          <li><strong>Data:</strong> ${startTime.format('DD/MM/YYYY')}</li>
          <li><strong>Hora:</strong> ${startTime.format('HH:mm')} - ${endTime.format('HH:mm')}</li>
          <li><strong>Serviço:</strong> ${serviceType}</li>
          <li><strong>Descrição:</strong> ${description}</li>
        </ul>
        
        <p><a href="https://calendar.google.com/calendar/r/event/${createdEvent.data.id}">Ver no Google Calendar</a></p>
      `
    });

    res.json({ 
      success: true, 
      eventId: createdEvent.data.id,
      message: 'Reunião agendada com sucesso!'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Google Auth Routes
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/booking');
  }
);

app.get('/api/user', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📅 Google Calendar API integrado`);
  console.log(`📧 Email notifications configurado`);
});
