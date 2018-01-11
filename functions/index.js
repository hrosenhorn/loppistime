const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sumSeller = functions.database.ref('/purchases/{purchaseId}/{index}')
    .onWrite(event => {
        // Grab the current value of what was written to the Realtime Database.
        const original = event.data.val();
        var summaryRef = admin.database().ref('/summary/' + original.seller + '/amount');
        return summaryRef.transaction(function(entry) {
            if (entry === null) {
                console.log("Setting amount to " + original.amount + " for seller " + original.seller);
                return original.amount;
            } else {
                var newValue = entry + original.amount;
                console.log("Setting amount to " + newValue + " for seller " + original.seller);
                return newValue;
            }
        });
    });
