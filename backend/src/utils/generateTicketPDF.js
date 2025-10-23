import PDFDocument from "pdfkit";
import fs from "fs";
import QRCode from "qrcode";

export async function generateTicketPDF(booking) {
  const filePath = `./tickets/ticket_${booking._id}.pdf`;
  fs.mkdirSync("./tickets", { recursive: true });

  const doc = new PDFDocument({ size: "A5", margin: 30 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);

  const movieTitle = booking.showtime?.movie?.title || "Unknown Movie";
  const theaterName = booking.showtime?.theater?.name || "Unknown Theater";
  const showTime = booking.showtime?.startTime
    ? new Date(booking.showtime.startTime).toLocaleString()
    : "Unknown Time";
  const seats = booking.seats?.map((s) => s.label || s.seatId).join(", ") || "N/A";
  const amount = booking.amount || booking.totalPrice || 0;

  // ===== DARK BACKGROUND =====
  doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0E0E0E");

  // ===== HEADER BAR =====
  doc
    .fillColor("#D4AF37")
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("ZIMSON CINEMAS", 0, 35, { align: "center" });

  doc
    .moveTo(30, 65)
    .lineTo(doc.page.width - 30, 65)
    .strokeColor("#D4AF37")
    .lineWidth(1.2)
    .stroke();

  // ===== BOOKING DETAILS (Left Side) =====
  doc
    .fillColor("#FFFFFF")
    .font("Helvetica")
    .fontSize(10)
    .text(`Booking ID: ${booking._id}`, 40, 85);

  doc
    .moveDown(0.5)
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#FFD700")
    .text(movieTitle, 40)
    .moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(11)
    .fillColor("#DDDDDD")
    .text(`Theater: ${theaterName}`, 40)
    .text(`Date: ${showTime}`, 40)
    .text(`Seats: ${seats}`, 40)
    // ✅ FIXED RUPEE SYMBOL
    .text(`Amount Paid: ₹${amount}`, 40);

  // ===== QR CODE (Right Side Box) =====
  const qrData = `Booking:${booking._id}|Movie:${movieTitle}|Seats:${seats}`;
  const qrImage = await QRCode.toDataURL(qrData);
  const qrBuffer = Buffer.from(
    qrImage.replace(/^data:image\/png;base64,/, ""),
    "base64"
  );

  const qrX = doc.page.width - 150;
  const qrY = 120;
  const qrSize = 100;

  // Gold border box for QR
  doc
    .rect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10)
    .strokeColor("#D4AF37")
    .lineWidth(1.5)
    .stroke();

  doc.image(qrBuffer, qrX, qrY, { fit: [qrSize, qrSize] });

  // ===== FOOTER =====
  doc
    .moveTo(30, doc.page.height - 70)
    .lineTo(doc.page.width - 30, doc.page.height - 70)
    .strokeColor("#333333")
    .stroke();

  doc
    .font("Helvetica-Oblique")
    .fontSize(10)
    .fillColor("#AAAAAA")
    .text(
      "Please arrive 15 mins early. Show this ticket or QR at entry.",
      0,
      doc.page.height - 60,
      { align: "center" }
    )
    .moveDown(0.3)
    .font("Helvetica-BoldOblique")
    .fillColor("#D4AF37")
    .text("Enjoy your movie!", { align: "center" });

  doc.end();

  return new Promise((resolve) => {
    stream.on("finish", () => resolve(filePath));
  });
}
