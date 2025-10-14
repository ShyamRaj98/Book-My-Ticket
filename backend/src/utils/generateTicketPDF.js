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

  // Header
  doc.fontSize(18).fillColor("#2E3A59").text("🎬 ZIMSON CINEMAS", { align: "center" }).moveDown(0.5);
  doc.fontSize(12).fillColor("#000").text(`Booking ID: ${booking._id}`).moveDown(0.5);

  // Movie details
  doc.fontSize(14).fillColor("#333").text(`Movie: ${movieTitle}`)
    .text(`Theater: ${theaterName}`)
    .text(`Date: ${showTime}`)
    .text(`Seats: ${seats}`)
    .text(`Amount Paid: ₹${booking.totalPrice || 0}`)
    .moveDown(1);

  // QR code
  const qrData = `Booking:${booking._id}|Movie:${movieTitle}|Seats:${seats}`;
  const qrImage = await QRCode.toDataURL(qrData);
  const qrBuffer = Buffer.from(qrImage.replace(/^data:image\/png;base64,/, ""), "base64");
  doc.image(qrBuffer, { fit: [100, 100], align: "center" }).moveDown(1);

  // Footer
  doc.fontSize(10).fillColor("#555")
    .text("Please arrive 15 mins early. Show this ticket or QR at entry.", { align: "center" });

  doc.end();

  return new Promise((resolve) => {
    stream.on("finish", () => resolve(filePath));
  });
}
