require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"email-services" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
async function userRegistrationEmail(userEmail, name){
   const subject = 'welcome to backend ledger';
 
   const text = `hello ${name} thank you for registration at backend ledger. we excited to have you on a board best regards form backend ledger team!`
   const html = `<p>hello ${name}</p><p>thank you ofr registration at backend ledger</p>`;
   await sendEmail(userEmail, subject, text, html);
}
async function transactionEmail(userEmail, name, amount, toAccount){
   const subject = 'Transaction successfull';
   const text = `hello ${name} your transaction of ${amount} to account ${toAccount}for registration at backend ledger. we excited to have you on a board best regards form backend ledger team!`
   const html = `<p>hello ${name}</p><p>your transaction of ${amount}  to account ${toAccount} </p>`;
   await sendEmail(userEmail, subject, text, html);
}
async function transactionFailedEmail(userEmail, name, amount, toAccount) {
   const subject = 'Transaction Unsuccessful';
   const text = `Hello ${name},\n\nYour transaction of ${amount} to account ${toAccount} could not be processed.\nReason: ${reason}.\n\nIf any funds were deducted, they will be automatically reversed to your account. If you need help, please contact support.\n\nBest regards,\nBackend Ledger Team`;
   
   const html = `
      <p>Hello <strong>${name}</strong>,</p>
      <p>We were unable to process your transaction of <strong>${amount}</strong> to account <strong>${toAccount}</strong>.</p>

      <p>If any balance was temporarily deducted, it will be automatically refunded to your account.</p>
      <br/>
      <p>Best regards,<br/><strong>Backend Ledger Team</strong></p>
   `;

   await sendEmail(userEmail, subject, text, html);
}
module.exports = {
    userRegistrationEmail,
    transactionEmail,
    transactionFailedEmail
};