
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const DB_INSTANCE = "vt20";

admin.initializeApp(functions.config().firebase);

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

const THANKS = 'Tack för att du sålt på S:t Pers barnloppis, denna gång går 30% av pengarna till Svenska kyrkans internationella arbete för ”Barn som lever på gatan i Filippinerna får mat, husrum och utbildning”. Mer information finns att läsa på https://www.svenskakyrkan.se/act/p135 <br><br> Vid frågor kontakta oss på loppis.stper@gmail.com för allmänna frågor,<br>saljnummer.stper@gmail.com för säljrelaterade ärenden,<br>volontar.stper@gmail.com för volontärrelaterade ärenden.<br>Facebook: Barnloppis i S:t Pers kyrka';

const CONTENT =
    '<!doctype html>' +
    '<html>' +
    '<head>' +
    '    <meta charset="utf-8">' +
    '    <title>Kvitto på dina sålda varor</title>' +
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
    '                            <td class="title"><img src="https://loppis-time.firebaseapp.com/img/loppis.png" style="width:400px; max-width:300px;"></td>' +
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
    '                            <td>' + THANKS + '</td>' +
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
    .onCreate((snapshot, context) => {
        const payload = snapshot.val();
        console.log("Triggered with", payload);

        const email = payload.email;
        const content = payload.content;


  return sendReceipt(email, content);
});

function filterItemsZeroAmount(items) {
    var filtered = [];
    items.forEach(function(entry) {
        if (entry.amount > 0) {
            filtered.push(entry);
        }
    });
    return filtered;
}

// Sends a welcome email to the given user.
function sendReceipt(email, seller) {
      const mailOptions = {
        from: "St Pers barnloppis <loppistime@gmail.com>",
        to: email
      };

    admin.database().ref(DB_INSTANCE + '/purchases').once('value').then(function(snapshot) {
        let summary = snapshot.val();


        var items = '';
        var totalAmount = 0;
        for(var purchaseId in summary){
            let purchase = summary[purchaseId];

            purchase.forEach(function(row) {
                if (row.seller === seller) {

                    // Nopped entries are marked with zero amount
                    if (row.amount !== 0) {

                        var itemName = "Vara";
                        if (row.amount < 0) {
                            itemName = "Återköp";
                        }

                        items +=
                            '            <tr class="item">' +
                            '                <td>' + itemName + '</td>' +
                            '                <td>' + row.amount + ' kr</td>' +
                            '            </tr>';

                        totalAmount += row.amount;
                    }
                }

            });
        }

        let commision = totalAmount * 0.3;
        items +=
        '            <tr class="item">' +
        '                <td>Välgörande ändamål (-30%)</td>' +
        '                <td>-' + commision.toFixed(2) + ' kr</td>' +
        '            </tr>';

        totalAmount = totalAmount * 0.7;
        let total =
            '            <tr class="total">' +
            '                <td></td>' +
            '                <td>Total: ' + totalAmount.toFixed(2) + ' kr (70%)</td>' +
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
    });
}
