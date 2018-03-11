
// Custom for Sale
// Add entry to current purchase button
$("#buttonAddEntry").click(function() {

    if (!validateAddEntrySeller() || !validateAddEntryAmount()) {
        return false;
    }

    let sellerElem = $("#addEntrySeller");
    let amountElem = $("#addEntryAmount");

    cart.addEntry(sellerElem.val(), Number(amountElem.val()), true);
    updateCurrentPurchaseHeader(cart.items.length);

    sellerElem.val("CAFE");
    amountElem.val("");
    sellerElem.focus();
});


$(document).ready(function(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            console.log("User is not logged in, redirecting");
            window.location = "/";
        } else {
            let email = user.email;
            // yeye
            if (email === "admin@rosenhorn.se") {
                $("#navSaleSummary").show();
            }
        }
    });
});