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
#print(NUMBER)
#print(RECIPIENT)

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
SUBJECT = "Säljnummer till höstens barnloppis i S:t Pers kyrka"

# The full path to the file that will be attached to the email.
ATTACHMENT1 = "data/HT24/Kontrakt.pdf"
ATTACHMENT2 = "data/HT24/Instruktioner.pdf"
ATTACHMENT3 = "data/HT24/Affisch.pdf"


with open("data/number-template-volontar.txt", "r") as fp:
    body = fp.read()

# The email body for recipients with non-HTML email clients.
BODY_TEXT = body.replace("[[NUMBER]]", NUMBER)

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
textpart = MIMEText(BODY_TEXT.encode(CHARSET), 'plain', CHARSET)

msg_body.attach(textpart)

# Define the attachment part and encode it using MIMEApplication.
att1 = MIMEApplication(open(ATTACHMENT1, 'rb').read())
att2 = MIMEApplication(open(ATTACHMENT2, 'rb').read())
att3 = MIMEApplication(open(ATTACHMENT3, 'rb').read())

# Add a header to tell the email client to treat this part as an attachment,
# and to give the attachment a name.
att1.add_header('Content-Disposition','attachment',filename="Kontrakt.pdf")
att2.add_header('Content-Disposition','attachment',filename="Instruktioner.pdf")
att3.add_header('Content-Disposition','attachment',filename="Affisch.pdf")

# Attach the multipart/alternative child container to the multipart/mixed
# parent container.
msg.attach(msg_body)

# Add the attachment to the parent container.
msg.attach(att1)
msg.attach(att2)
msg.attach(att3)
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
    print("FAILED TO SEND to %s " % (RECIPIENT))
    print(e.response['Error']['Message'])
else:
    print("Email sent to %s " % (RECIPIENT))
    #print(response['MessageId'])
