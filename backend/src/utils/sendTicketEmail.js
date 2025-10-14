import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: parseInt(process.env.EMAIL_SMTP_PORT),
  secure: false, // use TLS
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP connection successful");
  }
});

export async function sendTicketEmail(to, booking, showtime, pdfPath) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: `Your Ticket for ${showtime.movie.title}`,
      html: `
        <h3>Booking Confirmed!</h3>
        <p><b>Movie:</b> ${showtime.movie.title}</p>
        <p><b>Theater:</b> ${showtime.theater.name}</p>
        <p><b>Showtime:</b> ${new Date(showtime.startTime).toLocaleString()}</p>
        <p><b>Seats:</b> ${booking.seats
          .map((s) => s.seatId || s.label)
          .join(", ")}</p>
        <p>Enjoy the movie 🍿</p>
      `,
      attachments: [
        {
          filename: `ticket_${booking._id}.pdf`,
          path: pdfPath,
        },
      ],
    });

    console.log(`✅ Ticket email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send ticket email:", err);
  }
}
