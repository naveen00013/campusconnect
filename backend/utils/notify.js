const nodemailer = require('nodemailer');

const maskMobile = (m) => String(m).replace(/\d(?=\d{4})/g, '•');
const maskEmail = (e) => String(e).replace(/^(.).*(@.*)$/, '$1•••$2');

const subject = (code) => `${code} is your CampusConnect OTP`;
const text = (code) =>
  `Your CampusConnect OTP is ${code}. It is valid for 5 minutes. Do not share it with anyone.`;
const html = (code) =>
  `<div style="font-family:Segoe UI,Arial,sans-serif;max-width:420px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px"><h2 style="color:#4f46e5;margin:0 0 12px">🎓 CampusConnect</h2><p>Your one-time password is</p><p style="font-size:32px;font-weight:700;letter-spacing:6px;margin:12px 0">${code}</p><p style="color:#64748b;font-size:13px">Valid for 5 minutes. Never share this code with anyone.</p></div>`;

const viaBrevo = async (to, code) => {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': process.env.BREVO_API_KEY,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: 'CampusConnect', email: process.env.BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject: subject(code),
      htmlContent: html(code),
      textContent: text(code),
    }),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${await res.text()}`);
};

let transporter;
const viaSmtp = (to, code) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  transporter =
    transporter ||
    nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  return transporter.sendMail({
    from: process.env.MAIL_FROM || `CampusConnect <${SMTP_USER}>`,
    to,
    subject: subject(code),
    text: text(code),
    html: html(code),
  });
};

const emailMethod = () => {
  if (process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL) return viaBrevo;
  const { SMTP_HOST, SMTP_USER, SMTP_PASS } = process.env;
  return SMTP_HOST && SMTP_USER && SMTP_PASS ? viaSmtp : null;
};

const sendSms = async (mobile, code) => {
  const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
    method: 'POST',
    headers: { authorization: process.env.FAST2SMS_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      route: 'otp',
      variables_values: code,
      numbers: mobile.replace('+91', ''),
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || j.return === false) throw new Error(j.message || 'SMS request failed');
};

exports.deliverOtp = async (user, code) => {
  const done = [];
  const sendMail = emailMethod();
  const smsOn = !!process.env.FAST2SMS_KEY;

  if (sendMail) {
    try {
      await sendMail(user.email, code);
      done.push(`email ${maskEmail(user.email)}`);
    } catch (e) {
      console.error('Email failed:', e.message);
    }
  }
  if (smsOn && user.mobile && user.mobile.startsWith('+91')) {
    try {
      await sendSms(user.mobile, code);
      done.push(`mobile ${maskMobile(user.mobile)}`);
    } catch (e) {
      console.error('SMS failed:', e.message);
    }
  }
  if (!sendMail && !smsOn) {
    console.log(`\n[DEV OTP] ${user.email}: ${code}\n`);
    done.push('the server console (dev mode)');
  }
  return done;
};