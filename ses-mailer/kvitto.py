# -*- coding: utf-8 -*-

import os
import sys
import boto3
from botocore.exceptions import ClientError
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from email.utils import formataddr
from email.header import Header

arguments = sys.argv


if len(arguments) < 3:
    print("Missing arguments")
    sys.exit()

NUMBER = arguments[1]
RECIPIENT = arguments[2]
print(NUMBER)
print(RECIPIENT)

#sys.exit()


# The character encoding for the email.
CHARSET = "utf-8"
# Replace sender@example.com with your "From" address.
# This address must be verified with Amazon SES.
#https://code.activestate.com/recipes/578150-sending-non-ascii-emails-from-python-3/
sender_name = "St pers Barnklädesloppis"
sender_addr = "saljnummer.stper@gmail.com"



# Specify a configuration set. If you do not want to use a configuration
# set, comment the following variable, and the
# ConfigurationSetName=CONFIGURATION_SET argument below.
CONFIGURATION_SET = "ConfigSet"

# If necessary, replace us-west-2 with the AWS Region you're using for Amazon SES.
AWS_REGION = "eu-west-1"

# The subject line for the email.
SUBJECT = "Kvitto på din försäljning"


with open("../mailer/emails-vt25/V%s.html" % (NUMBER), "r") as fp:
    body = fp.read()

# The email body for recipients with non-HTML email clients.
BODY_HTML = body

# Create a new SES resource and specify a region.
client = boto3.client('ses',region_name=AWS_REGION)

# Create a multipart/mixed parent container.
msg = MIMEMultipart('mixed')
# Add subject, from and to lines.
msg['Subject'] = Header(SUBJECT, CHARSET)
msg['From'] = formataddr((sender_name, sender_addr))
msg['To'] = RECIPIENT

# Create a multipart/alternative child container.
msg_body = MIMEMultipart('alternative')

# Encode the text and HTML content and set the character encoding. This step is
# necessary if you're sending a message with characters outside the ASCII range.
htmlpart = MIMEText(BODY_HTML.encode(CHARSET), 'html', CHARSET)

msg_body.attach(htmlpart)


# Attach the multipart/alternative child container to the multipart/mixed
# parent container.
msg.attach(msg_body)

#print(msg)
try:
    #Provide the contents of the email.
    response = client.send_raw_email(
        Source=sender_addr,
        Destinations=[
            RECIPIENT
        ],
        RawMessage={
            'Data':msg.as_string(),
        },
        #ConfigurationSetName=CONFIGURATION_SET
    )
# Display an error if something goes wrong.
except ClientError as e:
    print(e.response['Error']['Message'])
else:
    print("Email sent! Message ID:"),
    print(response['MessageId'])
