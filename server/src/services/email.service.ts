import nodemailer from 'nodemailer';
import AppError from '../lib/app-error';
import User from '../models/user.model';

const replacePlaceholders = (content: string, user: any): string => {
  const name = user.name || '';
  const email = user.email || '';
  const title = user.title || '';
  const company = user.company || '';
  const phone = user.phone || '';

  return content
    // Name variations
    .replace(/\[Your Name\]/gi, name)
    .replace(/\[Name\]/gi, name)
    // Title variations
    .replace(/\[Your Title\]/gi, title)
    .replace(/\[Title\]/gi, title)
    .replace(/\[Your Position\]/gi, title)
    .replace(/\[Position\]/gi, title)
    .replace(/\[Your Role\]/gi, title)
    // Company variations
    .replace(/\[Your Company\]/gi, company)
    .replace(/\[Company\]/gi, company)
    .replace(/\[Company Name\]/gi, company)
    // Email variations
    .replace(/\[Your Contact Information\]/gi, [name, title, company, email, phone].filter(Boolean).join('\n'))
    .replace(/\[Your Email\]/gi, email)
    .replace(/\[Email Address\]/gi, email)
    .replace(/\[Email\]/gi, email)
    // Phone variations
    .replace(/\[Your Phone\]/gi, phone)
    .replace(/\[Phone Number\]/gi, phone)
    .replace(/\[Phone\]/gi, phone)
    .replace(/\[Mobile\]/gi, phone)
    // Social / website
    .replace(/\[Your LinkedIn\]/gi, '')
    .replace(/\[LinkedIn\]/gi, '')
    .replace(/\[Your Website\]/gi, '')
    .replace(/\[Website\]/gi, '')
    // Clean up any remaining empty brackets like "[  ]"
    .replace(/\[\s*\]/g, '');
};

export const sendEmail = async (userId: string, to: string, subject: string, content: string) => {
  const user = await User.findById(userId);

  if (!user || !user.preferences.smtp || !user.preferences.smtp.host) {
    throw new AppError('SMTP settings not configured. Please go to Settings to configure your email.', 400, 'SMTP_NOT_CONFIGURED');
  }

  const { host, port, user: smtpUser, pass, fromName, fromEmail } = user.preferences.smtp;

  // Replace AI-generated placeholder text with real sender details
  const processedContent = replacePlaceholders(content, user);
  const processedSubject = replacePlaceholders(subject, user);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user: smtpUser,
      pass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject: processedSubject,
      text: processedContent,
    });
    return info;
  } catch (error: any) {
    throw new AppError(`Failed to send email: ${error.message}`, 500, 'EMAIL_SEND_FAILED');
  }
};
