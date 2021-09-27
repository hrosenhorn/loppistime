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
sales = db.child("ht21/purchases").get(token).val()

# Retrieve the mail queue to process
queue = db.child("mailqueue").get(token).val()

if not queue:
    queue = {}

print ("Fetched %s queue entries" % (len(queue),))
for key, value in queue.items():

    seller = value["content"]
    email = value["email"]
    print ("Processing %s" % (email, ))
    mail_content = filter_sales(sales, seller)

    send_mail(email, mail_content)

    db.child("mailqueue_processed").push(value, token)
    db.child("mailqueue").child(key).remove(token)

    time.sleep(3)

