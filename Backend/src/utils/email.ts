import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  message: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // If SMTP missing, strictly fallback to generic console mapping ensuring app doesn't crash during DEV
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log(`\n================================`);
      console.log(`[Mock Email] Sent to ${options.to}`);
      console.log(`Subject: ${options.subject}`);
      console.log(`Message:\n${options.message}`);
      console.log(`================================\n`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
        from: `Complaint Management Team <${process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    // Re-throw safely so the top-level generic try/catch natively catches and evaluates failure without blocking thread
    throw error;
  }
};
