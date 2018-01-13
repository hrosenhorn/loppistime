
const SELLER_PREFIX = "E";

class Cart {
    constructor() {
        this.reset();
    }

    addEntry(seller, amount) {
        var entry = {
            id: this.counter++,
            seller: seller,
            amount: amount
        };

        this.items.push(entry);

        // If this is the first element clear default state
        if (this.defaultState) {
            $('#shoppingCart tr').first().hide();
            this.defaultState = false;
        }

        // Create a new element to be added to the table
        var elem = $.parseHTML('<tr>' +
            '<td><i class="fa fa-user" aria-hidden="true"></i> ' + entry.seller + '</td>' +
            '<td>' + entry.amount + ' kr</td><td><i class="fa fa-trash shopping-trash" aria-hidden="true" data-counter="' + entry.id + '"></i></td>' +
            '</tr>');

        // Bind an event to handle clicking the trash icon
        $(elem).bind('click', this.onTrashcanClicked.bind(this));

        // The last element is the complete purchase button
        $('#shoppingCart')
            .find('tr')
            .last()
            .prev()
            .after(elem);
    }

    onTrashcanClicked(event) {
        var id = parseInt(event.target.dataset["counter"]);
        this.removeEntry(id);
        $(event.currentTarget).remove();

    }
    removeEntry(id) {
        function finder(entry) {
            return entry["id"] === id;
        }

        var index = this.items.findIndex(finder);
        if (index > -1) {
            this.items.splice(index, 1);
        }
    }

    reset() {
        this.items = [];
        this.counter = 0;
        this.defaultState = true;
        $('#shoppingCart tr').first().show();
        $('#shoppingCart tr').not(':first').not(':last').remove();
    }
}

class History {
    constructor() {
        this.defaultState = true;
        this.items = [];

    }

    addEntry(cartItems) {

        let itemCount = 0;
        let total = 0;
        cartItems.forEach(function(entry) {
            itemCount++;
            total += entry["amount"];
        });

        let entry = {
            items: itemCount,
            amount: total
        };

        this.items.push(entry);

        // If this is the first element clear default state
        if (this.defaultState) {
            $('#purchaseHistory tr').first().hide();
            this.defaultState = false;
        }

        // Create a new element to be added to the table
        var elem = $.parseHTML('<tr>' +
            '<td><i class="fa fa-shopping-bag" aria-hidden="true"></i> ' + entry.items + '</td>' +
            '<td>' + entry.amount + ' kr</td>' +
            '</tr>');

        // The last element is the complete purchase button
        $('#purchaseHistory tr')
            .after(elem);
    }
}

let cart = new Cart();
let purchaseHistory = new History();

// Handlers

// Complete purchase button
$("#buttonCompletePurchase").click(function() {
    console.log("Handler for buttonCompletePurchase called.");
    if (cart.items.length <= 0) {
        console.log("Complete purchase with empty cart pressed, ignoring.");
        return
    }

    purchaseHistory.addEntry(cart.items);

    let dbData = [];
    cart.items.forEach(function(entry) {
        dbData.push({
            "seller": entry.seller,
            "amount": entry.amount
        });
    });

    let newEntryRef = firebase.database().ref().child('purchases').push();
    newEntryRef.set(dbData);

    cart.reset();
});

// Add entry to current purchase button
$("#buttonAddEntry").click(function() {
    console.log("Handler for buttonAddEntry called.");

    if (!validateAddEntrySeller() || !validateAddEntryAmount()) {
        return false;
    }

    let sellerElem = $("#addEntrySeller");
    let amountElem = $("#addEntryAmount");

    cart.addEntry(sellerElem.val(), Number(amountElem.val()));

    sellerElem.val(SELLER_PREFIX);
    amountElem.val("");
    sellerElem.focus();
});

function validateAddEntryAmount() {
    let amountElem = $("#addEntryAmount");
    if (!Number(amountElem.val())) {
        return false;
    }

    return true;
}

function validateAddEntrySeller() {
    var sellerElem = $("#addEntrySeller");
    var sellerValue = sellerElem.val();
    if (sellerValue.length <= 0) {
        return false;
    }

    if (sellerValue[0] !== SELLER_PREFIX) {
        return false;
    }

    var rest = sellerValue.slice(1);
    if (!Number(rest)) {
        return false;
    }

    return true;
}

// Validators for input fields
$('#addEntrySeller').on('input', function() {

    var sellerElem = $("#addEntrySeller");
    if (validateAddEntrySeller()) {
        $(sellerElem).css('color', '#000000');
    } else {
        $(sellerElem).css('color', '#c82333');
    }
});

$('#addEntryAmount').on('input', function() {
    var amountElem = $("#addEntryAmount");

    if (validateAddEntryAmount()) {
        $(amountElem).css('color', '#000000');
    } else {
        $(amountElem).css('color', '#c82333');
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

$(document).ready(function(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            console.log("User is logged in");
            $('#exampleModal').modal('hide');
        } else {
            console.log("User is not logged in");
            $('#exampleModal').modal('show');
        }
    });
});