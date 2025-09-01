# coding=utf-8
import json
import uuid
import hashlib
from Crypto.Hash import SHA256
from Crypto.Signature import PKCS1_v1_5
from Crypto.PublicKey import RSA

endpoint = "https://mss.cpc.getswish.net/swish-cpcapi/api/v1/payouts"

rootCert = "Swish_TLS_RootCA.pem"

"Swish_Merchant_TestCertificate_1234679304.p12"
"Swish_TechnicalSupplier_TestCertificate_9871065216.p12"

asd = uuid.uuid4()
asd.get_hex()

payoutInstructionUUID = uuid.uuid4().get_hex().upper()
seller = 8

payload = {}
payload["amount"] = "1.00",
payload["currency"] = "SEK",
payload["instructionDate"] = "FIXME",
payload["message"] = "Utbetalning från StPer barnloppis",
payload["payeeAlias"] = "0707600967",
payload["payeeSSN"] = "198306081434",
payload["payerAlias"] = "1230463893",
payload["payerPaymentReference"] = "Säljare L" + str(seller),
payload["payoutInstructionUUID"] = payoutInstructionUUID,
payload["payoutType"] = "PAYOUT",
payload["signingCertificateSerialNumber"] = "5E24D8820F5B62C7E5CAC75D20D6E754"

result = json.dumps(payload)


digest = hashlib.sha512(result.encode("utf-8"))
digest = digest.digest()

"""
tring payload = "JSON_PAYLOAD_GOES_HERE";
byte[] msg_bytes = payload.getBytes("UTF-8");
MessageDigest md = MessageDigest.getInstance("SHA-512");
byte[] hash_value = md.digest(msg_bytes);
"""

"""
curl -s -S -i --cert <path-to-certificate-file>:<password> --cert-type p12 --
cacert <path-to-rootCA-pem-file> --tlsv1.2 --header "Content-Type:
application/json" <endpoint-url> --data '<json-formatted-data>'
"""

"""

{
 "payload": {
     "amount": "100.00",
     "currency": "SEK",
     "instructionDate": "2019-12-02T12:41:20",
     "message": "example message",
     "payeeAlias": "0728648607",
     "payeeSSN": "196702234292",
     "payerAlias": "1234679304",
     "payerPaymentReference": "mockedPayerPaymentReference",
     "payoutInstructionUUID": "822735C159A944DBB2B3546717BC919F",
     "payoutType": "PAYOUT",
     "signingCertificateSerialNumber": "7D70445EC8EF4D1E3A713427E973D097"
    },
    "callbackUrl": “https://myfavoritesite.dummy.domain”,
    "callbackIdentifier": “D0194DE14DFC448D9A2F701567547600”,
    "signature": "IUybofWGga+uS2+APequDO5kh..."
}

"""

"""
{
 "payload": {
   "payoutInstructionUUID": "E4D773858AF5459B96ABCA4B9DBFF94D",
   "payerPaymentReference": "payerRef",
   "payerAlias": "1231388446",
   "payeeAlias": "46711111132",
   "payeeSSN": "197709306828",
   "amount": "100.00",
   "currency": "SEK",
   "payoutType": "PAYOUT",
   "message": "Message to the recipient.",
   "instructionDate": "2019-05-05T12:23:23Z",
   "signingCertificateSerialNumber": "7BE0DA9DE336EDCE5FE9AAFEF39248AE"
 },
 "callbackUrl": "https://not.a.real.caller.com/callback",
 "callbackIdentifier": "11A86BE70EA346E4B1C39C874173F478",
 "signature": "a89xIJY8TBwWzKuTh4Qvx6hrUoMDI3/2RooINGmPUNAM0fzfvUFn9RFcvm4z2WsLuY8xO0F9aioK0MvG2FiYIeDEZjpgAlWyFxJl3R9dvN2lDFo8MMaseQfOK6IuDyIgrRVyTSrdyKKBGXRcoihX5CN7xQY7zBgl8AtIz9lOQ0o="
}"""