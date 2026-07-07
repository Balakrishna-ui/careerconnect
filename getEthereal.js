const nodemailer = require("nodemailer");

async function main() {
  const account = await nodemailer.createTestAccount();
  console.log("SMTP_HOST=" + account.smtp.host);
  console.log("SMTP_PORT=" + account.smtp.port);
  console.log("SMTP_USER=" + account.user);
  console.log("SMTP_PASS=" + account.pass);
}

main().catch(console.error);
