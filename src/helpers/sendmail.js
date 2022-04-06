const dotenv = require('dotenv');
dotenv.config({ path: 'config.env' });

const sendForgotPassMail = function (to, pass) {
    const sgMail = require('@sendgrid/mail')
    sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
        to,
        from: 'nik.theappideas@gmail.com',
        subject: 'Forgot Password',
        // text: 'and easy to do anywhere, even with Node.js',
        html: `Dear user you have requested forgot password in Halalo.<br>
        <strong>Credentials:</strong><br>
        Email:  ${to}<br>
        Password: ${pass}<br>`,
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent & pass :' + pass)
        })
        .catch((error) => {
            console.error(error)
        })
}

module.exports = {
    sendForgotPassMail,
}