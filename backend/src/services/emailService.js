// server/services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const SMTP_HOST = process.env.EMAIL_SMTP_HOST;
const SMTP_PORT = parseInt(process.env.EMAIL_SMTP_PORT || '587', 10);
const SMTP_USER = process.env.EMAIL_SMTP_USER;
const SMTP_PASS = process.env.EMAIL_SMTP_PASS;
const FROM = process.env.EMAIL_FROM || `MovieBooking <no-reply@example.com>`;

let transporter = null;
if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
} else {
  console.warn('Email service not configured (no SMTP env vars)');
}

export async function sendConfirmationEmail(booking) {
  if (!transporter) {
    console.warn('Skipping email send — transporter not configured');
    return;
  }

  // load user email and showtime details lazily (booking may be populated)
  await booking.populate({ path: 'showtime', populate: [{ path: 'movie' }, { path: 'theater' }] }).execPopulate?.() || null;

  const to = booking.userEmail || booking.user?.email || booking.user; // adjust based on how you store
  // We assume booking.user is an ObjectId — so you may need to populate booking.user with email. For brevity this sample uses a placeholder.
  const subject = `Booking Confirmed — ${booking._id}`;
  const text = `Your booking for ${booking.showtime?.movie?.title || ''} on ${booking.showtime ? new Date(booking.showtime.startTime).toLocaleString() : ''} is confirmed. Seats: ${booking.seats.map(s=>s.seatId).join(', ')}`;

  await transporter.sendMail({
    from: FROM,
    to, // ensure it's a valid email
    subject,
    text
    // attachments: you can attach a PDF ticket here (Day 7)
  });
}
