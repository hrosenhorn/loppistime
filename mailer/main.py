# coding=utf-8

import time
import pyrebase
import config
from query import filter_sales, send_mail

firebase = pyrebase.initialize_app(config.FIREBASE_CONFIG)

auth = firebase.auth()

# Log the user in
user = auth.sign_in_with_email_and_password("admin@rosenhorn.se", config.FIREBASE_PASS)
token = user['idToken']

# Get a reference to the database service
db = firebase.database()

# Fetch all sales done
sales = db.child("ht23/purchases").get(token).val()

# Retrieve the mail queue to process
#queue = db.child("mailqueue").get(token).val()
from sellers import SELLERS



print ("Fetched %s queue entries" % (len(SELLERS),))
for value in SELLERS:

    seller = value["content"]
    email = value["email"]
    print ("Processing %s" % (email, ))
    mail_content = filter_sales(sales, seller)

    #print (mail_content)
    if len(seller) == 2:
        letter = seller[0]
        last = seller[1]
        seller = letter + "0" + last
    file_name = seller + ".html"
    with open("emails/" + file_name, "w", encoding='utf-8') as fp:
        fp.write(mail_content)



    #send_mail(email, mail_content)

    #db.child("mailqueue_processed").push(value, token)
    #db.child("mailqueue").child(key).remove(token)

    time.sleep(0)

