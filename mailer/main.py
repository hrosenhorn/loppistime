# coding=utf-8

import time
import pyrebase
import config
from query import filter_sales

firebase = pyrebase.initialize_app(config.FIREBASE_CONFIG)

auth = firebase.auth()

# Log the user in
user = auth.sign_in_with_email_and_password("admin@rosenhorn.se", config.FIREBASE_PASS)
token = user['idToken']

# Get a reference to the database service
db = firebase.database()

# Fetch all sales done
sales = db.child("vt25/purchases").get(token).val()

# Retrieve the mail queue to process
#queue = db.child("mailqueue").get(token).val()
from sellers import SELLERS



print ("Fetched %s queue entries" % (len(SELLERS),))
for value in SELLERS:

    seller = value["content"]
    email = value["email"]
    patched = seller[1:]
    print ("python3 kvitto.py %s %s" % (patched, email))
    mail_content = filter_sales(sales, seller)

    file_name = seller + ".html"
    with open("emails-vt25/" + file_name, "w", encoding='utf-8') as fp:
        fp.write(mail_content)

