import nodemailer from "nodemailer";

// Create transporter
const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "sandbox.smtp.mailtrap.io",
  port: process.env.MAIL_PORT || 2525,
  auth: {
    user: process.env.MAIL_USER || "b83ef40af21a2e",
    pass: process.env.MAIL_PASS || "af85497f3a3a8f",
  },
});

// Function to send email
export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transport.sendMail({
      from: '"Hotel Admin" <admin@hotel.com>',
      to,
      subject,
      html,
    });
    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
