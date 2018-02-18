

class Cart {
    constructor() {
        this.reset();
    }

    /**
        Adds items to the internal cart
        - Manages default state
        - Updates HTML with elements
        - Appends element to second last in TR list (last elem is the complete purchase button)
    */
    addEntry(seller, amount, swish) {
        var entry = {
            id: this.counter++,
            seller: seller,
            amount: amount,
            swish: swish,
            dateString: formatDate()
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

    /*
        Removes the element in the cart and removes the corresponding HTML element
    */
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
            //this.items.splice(index, 1);
            // Instead of removing the entry zero it, allows for a write only db model
            this.items[index].amount = 0;
        }
    }

    /*
        Resets the card by removing all items and resetting to default state
    */
    reset() {
        this.items = [];
        this.counter = 0;
        this.saleId = null;
        this.defaultState = true;
        $('#shoppingCart tr').first().show();
        $('#shoppingCart tr').not(':first').not(':last').remove();
    }

    /*
        Load iems from history, resets internal cart state
    */
    loadItems(saleId, items) {
        this.reset();
        this.saleId = saleId;
        let self = this;
        items.forEach(function(entry) {
            self.addEntry(entry.seller, entry.amount, entry.swish);
        });

    }
}



class History {
    constructor() {
        this.defaultState = true;
        this.items = {};
    }

    /*
        Add a completed purchase to the history.
        - Save entire cart state
        - If this is an update remove previous HTML entry
          - Purchases are stored by saleId to entry will be overwritten
        - Compute summary element
        - Update HTMl listing with element
        - Manage default state
    */
    addEntry(saleId, cartItems) {

        console.log("Removing ", saleId);
        $("#" + saleId).remove();

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

        this.items[saleId] = cartItems;

        // If this is the first element clear default state
        if (this.defaultState) {
            $('#purchaseHistory tr').first().hide();
            this.defaultState = false;
        }

        // Create a new element to be added to the table
        var elem = $.parseHTML('<tr id="' + saleId + '">' +
            '<td><i class="fa fa-shopping-bag" aria-hidden="true"></i> ' + entry.items + '</td>' +
            '<td>' + entry.amount + ' kr</td>' +
            '</tr>');

        // Bind an event to handle editing histoy and loading into cart
        $(elem).bind('click', loadCart.bind(null, saleId));

        // The last element is the complete purchase button
        $('#purchaseHistory tr').first().after(elem);

        // Only keep 15 items in the UI
        $( "#purchaseHistory tr" ).slice(15).remove();
    }
}

let cart = new Cart();
let purchaseHistory = new History();


/*
    Load a history item into current cart
    - Reset cart state
    - Load entries
*/
function loadCart(saleId) {
    console.log("Wanted to reload cart with", saleId);
    let items = purchaseHistory.items[saleId];
    if (items !== null) {
        cart.loadItems(saleId, items);
    }
}

// Handlers

// Complete purchase button
$("#buttonCompletePurchase").click(function() {
    console.log("Handler for buttonCompletePurchase called.");
    if (cart.items.length <= 0) {
        console.log("Complete purchase with empty cart pressed, ignoring.");
        return
    }

    let saleId = fbUpdateOrInsertSale(cart.saleId, cart.items)
    purchaseHistory.addEntry(saleId, cart.items);

    cart.reset();
    updateCurrentPurchaseHeader(cart.items.length);
});

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

function validateAddEntryAmount() {
    let amountElem = $("#addEntryAmount");
    if (!Number(amountElem.val())) {
        return false;
    }

    return true;
}

function updateCurrentPurchaseHeader (items) {
    let elem = $("#currentPurchaseHeader");
    if (items === 0) {
        elem.text("Pågående köp");
    } else {
        if (items === 1) {
            elem.text("Pågående köp - " + items + " vara");
        } else {
            elem.text("Pågående köp - " + items + " varor");
        }

    }
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

//    for(i = 1; i <= 100; i++) {
//
//        var items = [
//        {"seller": "A1", "amount": 5 * i}
//        ];
//
//        purchaseHistory.addEntry(i, items);
//    }
});