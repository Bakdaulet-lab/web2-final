const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendBookingConfirmation = async (email, booking) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Flight Booking Confirmation',
        html: `
            <div style="padding: 20px; background-color: #f5f5f5;">
                <h2>Flight Booking Confirmation</h2>
                <p>Dear ${booking.passengerDetails.name},</p>
                <p>Your flight booking has been confirmed!</p>
                <div style="background-color: white; padding: 15px; margin: 20px 0;">
                    <h3>Booking Details:</h3>
                    <p>Flight: ${booking.flightDetails.airline} ${booking.flightDetails.flightNumber}</p>
                    <p>From: ${booking.flightDetails.origin}</p>
                    <p>To: ${booking.flightDetails.destination}</p>
                    <p>Departure: ${new Date(booking.flightDetails.departureTime).toLocaleString()}</p>
                    <p>Booking Reference: ${booking._id}</p>
                </div>
                <p>Thank you for choosing our service!</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

module.exports = { sendBookingConfirmation };