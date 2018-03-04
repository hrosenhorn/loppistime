
const functions = require('firebase-functions');
const nodemailer = require('nodemailer');
// Configure the email transport using the default SMTP transport and a GMail account.
// For Gmail, enable these:
// 1. https://www.google.com/settings/security/lesssecureapps
// 2. https://accounts.google.com/DisplayUnlockCaptcha
// For other types of transports such as Sendgrid see https://nodemailer.com/transports/
// TODO: Configure the `gmail.email` and `gmail.password` Google Cloud environment variables.
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

const APP_NAME = 'S:t Pers barnloppis';

exports.sendReceipt = functions.database.ref('/mailqueue/{id}')
    .onWrite(event => {
        const payload = event.data.val();
        console.log("Triggered with", payload);

        const email = payload.email;
        const content = payload.content;


  return sendReceipt(email, content);
});

// Sends a welcome email to the given user.
function sendReceipt(email, content) {
  const mailOptions = {
    from: `${APP_NAME} <loppistime@gmail.com>`,
    to: email,
  };

  // The user subscribed to the newsletter.
  mailOptions.subject = `Kvitto på ditt köp från ${APP_NAME}!`;
  mailOptions.text = `Hej! Welcome to ${APP_NAME}. Här har du en blob ${content}`;
  return mailTransport.sendMail(mailOptions).then(() => {
    return console.log('New welcome email sent to:', email);
  });
}
