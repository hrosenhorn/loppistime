# Generera kvitton

Generering av kvitton görs från mappen "mailer"
 
* Se till att config.py innehåller rätt config 
* Uppdatera sellers.py med aktuella säljare 
* Skapa mappen "emails-vt25" under mappen mailer 
* Kör main.py

Du borde nu ha en mapp mailer/emails-v25 med ett gäng html-filer. 
Körningen spottar även ut kommandot för att skicka ut kvitton.

## Skicka ut kvitton

* Stå i mappen ses-mailer
* Installera och aktivera din virtualenv
* Se till att ha dina AWS-nycklar laddade
* Kör kvitto.py enligt output från tidigare kommando