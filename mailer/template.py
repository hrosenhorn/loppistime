# coding=utf-8

THANKS = "Tack för att du sålt på S:t Pers barnloppis, 30% av intäkterna skänks till välgörande ändamål genom Svenska kyrkan och diakonin i Uppsalas arbete med utsatta barnfamiljer. <br><br> Vid frågor kontakta oss på loppis.stper@gmail.com för allmänna frågor,<br>saljnummer.stper@gmail.com för säljrelaterade ärenden,<br>volontar.stper@gmail.com för volontärrelaterade ärenden.<br>Facebook: Barnloppis i S:t Pers kyrka"
TEMPLATE = """
<!doctype html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Kvitto på dina sålda varor</title>
    
    <style>
    .invoice-box {
        max-width: 800px;
        margin: auto;
        padding: 30px;
        border: 1px solid #eee;
        box-shadow: 0 0 10px rgba(0, 0, 0, .15);
        font-size: 16px;
        line-height: 24px;
        font-family: \'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sans-serif;
        color: #555;
    }
    .invoice-box table {
        width: 100%;
        line-height: inherit;
        text-align: left;
    }
    .invoice-box table td {
        padding: 5px;
        vertical-align: top;
    }
    .invoice-box table tr td:nth-child(2) {
        text-align: right;
    }
    .invoice-box table tr.top table td {
        padding-bottom: 20px;
    }
    .invoice-box table tr.top table td.title {
        font-size: 45px;
        line-height: 45px;
        color: #333;
    }
    .invoice-box table tr.information table td {
        padding-bottom: 40px;
    }
    .invoice-box table tr.heading td {
        background: #eee;
        border-bottom: 1px solid #ddd;
        font-weight: bold;
    }
    .invoice-box table tr.details td {
        padding-bottom: 20px;
    }
    .invoice-box table tr.item td{
        border-bottom: 1px solid #eee;
    }
    .invoice-box table tr.item.last td {
        border-bottom: none;
    }
    .invoice-box table tr.total td:nth-child(2) {
        border-top: 2px solid #eee;
        font-weight: bold;
    }
    @media only screen and (max-width: 600px) {
        .invoice-box table tr.top table td {
            width: 100%;
            display: block;
            text-align: center;
        }
        .invoice-box table tr.information table td {
            width: 100%;
            display: block;
            text-align: center;
        }
    }
    /** RTL **/
    .rtl {
        direction: rtl;
        font-family: Tahoma, \'Helvetica Neue\', \'Helvetica\', Helvetica, Arial, sans-serif;
    }
    .rtl table {
        text-align: right;
    }
    .rtl table tr td:nth-child(2) {
        text-align: left;
    }
    </style>
</head>
<body>
    <div class="invoice-box">
        <table cellpadding="0" cellspacing="0">
            <tr class="top">
                <td colspan="2">
                    <table>
                        <tr>
                            <td class="title"><img src="https://loppis-time.firebaseapp.com/img/loppis.png" style="width:400px; max-width:300px;"></td>
                            <td>
                                Utskriven: [[RECEIPT_DATE]]<br>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr class="information">
                <td colspan="2">
                    <table>
                        <tr>
                            <td> [[THANKS]] </td>
                        </tr>
                    </table>
                </td>
            </tr>
            <tr class="heading">
                <td>Vara</td>
                <td>Pris</td>
            </tr>
            [[RECEIPT_ITEMS]]
            [[RECEIPT_TOTAL]]
        </table>
    </div>
</body>
</html>
""".replace("[[THANKS]]", THANKS)