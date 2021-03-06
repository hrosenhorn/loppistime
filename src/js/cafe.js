
// Custom for Sale
// Add entry to current purchase button
$("#buttonAddEntry").click(function() {

    if (!validateAddEntrySeller() || !validateAddEntryAmount()) {
        return false;
    }

    var sellerElem = $("#addEntrySeller");
    var amountElem = $("#addEntryAmount");

    cart.addEntry(sellerElem.val(), Number(amountElem.val()), true);
    updateCurrentPurchaseHeader(cart.items);

    sellerElem.val("CAFE");
    amountElem.val("");
    amountElem.focus();
});


$(document).ready(function(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            console.log("User is not logged in, redirecting");
            window.location = "/";
        } else {
            var email = user.email;
            // yeye
            if (email === "admin@rosenhorn.se") {
                $("#navSaleSummary").show();
                $("#navSaleAudit").show();
            }
        }
    });

    $('#addEntryAmount').focus();
});