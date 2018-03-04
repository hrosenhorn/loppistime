


// Focus forwarders
$("#addEntrySeller").on('keypress', function (e) {
    if(e.which === 13){
        $('#addEntryAmount').focus();
    }
});



// Validators for input fields
$('#addEntrySeller').on('input', function() {


    var sellerElem = $("#addEntrySeller");
    if (validateAddEntrySeller()) {
        $(sellerElem).css('color', '#000000');
    } else {
        $(sellerElem).css('color', '#c82333');
    }
});




$('#exampleModal').on('hidden.bs.modal', function (e) {
   console.log("Modal dismissed");

    var user = firebase.auth().currentUser;
    if (!user) {
        $('#exampleModal').modal('toggle');
    }
});

function performLogin() {
    var password = $("#modalPassword").val();
    var email = "loppis@rosenhorn.se";
    firebase.auth().signInAndRetrieveDataWithEmailAndPassword(email, password).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        console.log("Login failed with ", error);
    });

}
//
// Add entry to current purchase button
$("#modalButtonLogin").click(function() {
    performLogin();
});

$("#modalPassword").on('keypress', function (e) {
    if(e.which === 13){
        performLogin();
    }
});


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

    sellerElem.val(SELLER_PREFIX);
    amountElem.val("");
    sellerElem.focus();
});

$(document).ready(function(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log("User is logged in");
            $('#exampleModal').modal('hide');
        } else {
            console.log("User is not logged in");
            $('#exampleModal').modal('show');
        }
        $('#addEntrySeller').focus();
    });

//    for(i = 1; i <= 100; i++) {
//
//        var items = [
//        {"seller": "A1", "amount": 5 * i}
//        ];
//
//        purchaseHistory.addEntry(i, items);
//    }
});