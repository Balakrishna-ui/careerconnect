import nodemailer from "nodemailer";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"CareerConnect" <noreply@careerconnect.com>',
    to,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string,
  userName: string = "User"
) => {
  const subject = "Reset Your CareerConnect Password";
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
      <p style="color: #555; font-size: 16px;">Hi ${userName},</p>
      <p style="color: #555; font-size: 16px;">
        We received a request to reset your password for your CareerConnect account.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #555; font-size: 16px;">
        This link will expire in 1 hour.
      </p>
      <p style="color: #555; font-size: 14px; margin-top: 30px;">
        If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
      </p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} CareerConnect. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};

export const sendNotificationEmail = async (
  email: string,
  userName: string,
  notificationType: string,
  message: string,
  actionUrl?: string
) => {
  const subject = `CareerConnect: New Notification`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">New Activity on CareerConnect</h2>
      <p style="color: #555; font-size: 16px;">Hi ${userName},</p>
      <p style="color: #555; font-size: 16px;">
        ${message}
      </p>
      ${actionUrl ? `
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.APP_URL || 'http://localhost:3000'}${actionUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
          View Details
        </a>
      </div>
      ` : ''}
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="color: #888; font-size: 12px; text-align: center;">
        &copy; ${new Date().getFullYear()} CareerConnect. All rights reserved.
      </p>
    </div>
  `;

  return sendEmail({ to: email, subject, html });
};
