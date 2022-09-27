# coding=utf-8

import smtplib
from datetime import date
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import config
from template import TEMPLATE

def filter_sales(sales, seller):
  mail_items = ""
  total_amount = 0

  for key, items in sales.items(): # Purchases
    for row in items: # Each purchase has multiple items
      if not row:  # Deleted rows show up as None
        continue

      if row["seller"] != seller:
        continue

      amount = row["amount"]
      item_name = "Vara"
      if amount < 0:
        item_name = "Återköp"

      if amount == 0:
        continue

      content = """
        <tr class="item">
            <td>%s</td>
            <td>%s kr</td>
        </tr          
      """ % (item_name, amount)

      mail_items += content
      total_amount += amount

  commision = round(total_amount * 0.3, 2)
  mail_items += """
            <tr class="item">
                <td>Välgörande ändamål (-30%%)</td>
                <td>-%s kr</td>
            </tr>  
  """ % (commision,)

  seller_amount = round(total_amount * 0.7, 2)
  mail_summary = """
            <tr class="total">
                <td></td>
                <td>Total: %s kr (70%%)</td>
            </tr>
  """ % (seller_amount,)

  today = date.today()
  date_string = today.strftime("%b %d, %Y") # Sep 21, 14:2
  date_string += "<br> Säljare: %s" % (seller,)
  main_rendering = TEMPLATE.replace("[[RECEIPT_DATE]]", date_string).replace("[[RECEIPT_ITEMS]]", mail_items).replace("[[RECEIPT_TOTAL]]", mail_summary)

  return main_rendering

def send_mail(receiver_address, mail_content):

  # The mail addresses and password
  sender_address = config.GMAIL_USER
  sender_pass = config.GMAIL_PASS
  receiver_address = receiver_address

  # Setup the MIME
  message = MIMEMultipart()
  message['From'] = "St Pers barnloppis <%s>" % (sender_address,)
  message['To'] = receiver_address
  message['Subject'] = 'Kvitto på ditt köp från S:t Pers barnloppis'

  # The body and the attachments for the mail
  message.attach(MIMEText(mail_content, 'html'))
  # Create SMTP session for sending the mail
  session = smtplib.SMTP('smtp.gmail.com', 587)  # use gmail with port
  session.starttls()  # enable security
  session.login(sender_address, sender_pass)  # login with mail_id and password
  text = message.as_string()
  session.sendmail(sender_address, receiver_address, text)
  session.quit()
  print("Mail sent to %s" % (receiver_address))