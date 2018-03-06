
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


function formatDate() {
    let now = new Date();

    let lookup = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];

    let monthIndex = now.getMonth();
    let day = now.getDate();
    let hour = now.getHours();
    let minute = now.getMinutes();

    return lookup[monthIndex] + " " + day + ", " + hour + ":" + minute;
}


const APP_NAME = 'S:t Pers barnloppis';


const CONTENT =
    '<!doctype html>' +
    '<html>' +
    '<head>' +
    '    <meta charset="utf-8">' +
    '    <title>Kvitto från ditt klädköp</title>' +
    '    ' +
    '    <style>' +
    '    .invoice-box {' +
    '        max-width: 800px;' +
    '        margin: auto;' +
    '        padding: 30px;' +
    '        border: 1px solid #eee;' +
    '        box-shadow: 0 0 10px rgba(0, 0, 0, .15);' +
    '        font-size: 16px;' +
    '        line-height: 24px;' +
    '        font-family: \'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sans-serif;' +
    '        color: #555;' +
    '    }' +
    '    .invoice-box table {' +
    '        width: 100%;' +
    '        line-height: inherit;' +
    '        text-align: left;' +
    '    }' +
    '    .invoice-box table td {' +
    '        padding: 5px;' +
    '        vertical-align: top;' +
    '    }' +
    '    .invoice-box table tr td:nth-child(2) {' +
    '        text-align: right;' +
    '    }' +
    '    .invoice-box table tr.top table td {' +
    '        padding-bottom: 20px;' +
    '    }' +
    '    .invoice-box table tr.top table td.title {' +
    '        font-size: 45px;' +
    '        line-height: 45px;' +
    '        color: #333;' +
    '    }' +
    '    .invoice-box table tr.information table td {' +
    '        padding-bottom: 40px;' +
    '    }' +
    '    .invoice-box table tr.heading td {' +
    '        background: #eee;' +
    '        border-bottom: 1px solid #ddd;' +
    '        font-weight: bold;' +
    '    }' +
    '    .invoice-box table tr.details td {' +
    '        padding-bottom: 20px;' +
    '    }' +
    '    .invoice-box table tr.item td{' +
    '        border-bottom: 1px solid #eee;' +
    '    }' +
    '    .invoice-box table tr.item.last td {' +
    '        border-bottom: none;' +
    '    }' +
    '    .invoice-box table tr.total td:nth-child(2) {' +
    '        border-top: 2px solid #eee;' +
    '        font-weight: bold;' +
    '    }' +
    '    @media only screen and (max-width: 600px) {' +
    '        .invoice-box table tr.top table td {' +
    '            width: 100%;' +
    '            display: block;' +
    '            text-align: center;' +
    '        }' +
    '        .invoice-box table tr.information table td {' +
    '            width: 100%;' +
    '            display: block;' +
    '            text-align: center;' +
    '        }' +
    '    }' +
    '    /** RTL **/' +
    '    .rtl {' +
    '        direction: rtl;' +
    '        font-family: Tahoma, \'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sans-serif;' +
    '    }' +
    '    .rtl table {' +
    '        text-align: right;' +
    '    }' +
    '    .rtl table tr td:nth-child(2) {' +
    '        text-align: left;' +
    '    }' +
    '    </style>' +
    '</head>' +
    '<body>' +
    '    <div class="invoice-box">' +
    '        <table cellpadding="0" cellspacing="0">' +
    '            <tr class="top">' +
    '                <td colspan="2">' +
    '                    <table>' +
    '                        <tr>' +
    '                            <td class="title"><img src="https://scontent-arn2-1.xx.fbcdn.net/v/t1.0-9/294524_263943307058918_265926684_n.jpg?oh=cf060ef1cfbfdd5226347a4918aa751e&oe=5B0B7B40" style="width:400px; max-width:300px;"></td>' +
    '                            <td>' +
    '                                Utskriven: [[RECEIPT_DATE]]<br>' +
    '                            </td>' +
    '                        </tr>' +
    '                    </table>' +
    '                </td>' +
    '            </tr>' +
    '            <tr class="information">' +
    '                <td colspan="2">' +
    '                    <table>' +
    '                        <tr>' +
    '                            <td>' +
    '                                S.t Per barnloppis<br>' +
    '                                Kvarntorget 3<br>' +
    '                                75421 Uppsala' +
    '                            </td>' +
    '                            ' +
    '                            <td>' +
    '                            </td>' +
    '                        </tr>' +
    '                    </table>' +
    '                </td>' +
    '            </tr>' +
    '            <tr class="heading">' +
    '                <td>Vara</td>' +
    '                <td>Pris</td>' +
    '            </tr>' +
    '            [[RECEIPT_ITEMS]]' +
    '            [[RECEIPT_TOTAL]]' +
    '        </table>' +
    '    </div>' +
    '</body>' +
    '</html>';

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
    from: "St Pers barnloppis <loppistime@gmail.com>",
    to: email
  };

    let tmp = [1,2,3];
    var items = '';
    tmp.forEach(function(entry) {
        items +=
            '            <tr class="item">' +
            '                <td>Kläder</td>' +
            '                <td>' + (entry * 10) + ' kr</td>' +
            '            </tr>';
    });

    let totalAmount = "130";
    let total =
        '            <tr class="total">' +
        '                <td></td>' +
        '                <td>Total: ' + totalAmount + ' kr</td>' +
        '            </tr>';

    var content = CONTENT
        .replace("[[RECEIPT_DATE]]", formatDate())
        .replace("[[RECEIPT_ITEMS]]", items)
        .replace("[[RECEIPT_TOTAL]]", total);


  // The user subscribed to the newsletter.
  mailOptions.subject = `Kvitto på ditt köp från ${APP_NAME}`;
  mailOptions.html = content;
  return mailTransport.sendMail(mailOptions).then(() => {
    return console.log('New welcome email sent to:', email);
  });
}
