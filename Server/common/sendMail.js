module.exports = function (receiverEmail, subject, html, callback) {
    var Nodemailer = require('nodemailer');

    // create reusable transporter object using SMTP transport
    var transporter = Nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'meshdevfeup@gmail.com',
            pass: 'B4nanaB4nana'
        }
    });

    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: transporter.transporter.options.auth.user, // sender address
        to: receiverEmail, // list of receivers
        subject: 'Mesh: ' + subject, // Subject line
        html: html
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, callback);
};
