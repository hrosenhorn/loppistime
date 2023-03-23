const SELLER_PREFIX = "V";

const DB_INSTANCE = "vt23";

Date.prototype.getFullMinutes = function () {
   if (this.getMinutes() < 10) {
       return '0' + this.getMinutes();
   }
   return this.getMinutes();
};

function formatDate() {
    var now = new Date();

    var lookup = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];

    var monthIndex = now.getMonth();
    var day = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();

    return lookup[monthIndex] + " " + day + ", " + hour + ":" + minute;
}

function fbUpdateOrInsertSale(saleId, items) {
    console.log("Setting data using ", saleId);
    var refKey = null;

    if (saleId === null) {
        newEntryRef = firebase.database().ref().child(DB_INSTANCE + '/purchases').push();
        refKey = newEntryRef.key;
    } else {
        refKey = saleId;
    }

    var updates = {};

    // Generate the purchase order
    updates[DB_INSTANCE + '/purchases/' + refKey] = items;

    console.log("Doing batch update with", updates);
    firebase.database().ref().update(updates);
    return newEntryRef.key;
}


function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		var later = function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		var callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
}

function Cart () {
    this.reset();
}

Cart.prototype.setPaymentOption = function(swish) {
    this.items.forEach(function(entry) {
        entry.swish = swish;
    });
};

/**
    Adds items to the internal cart
    - Manages default state
    - Updates HTML with elements
    - Appends element to second last in TR list (last elem is the complete purchase button)
*/
Cart.prototype.addEntry = function(seller, amount, swish) {
    var user = firebase.auth().currentUser;

    var entry = {
        id: this.counter++,
        seller: seller,
        amount: amount,
        swish: swish,
        dateString: formatDate(),
        register: user.email.replace("@rosenhorn.se", "")
    };

    this.items.push(entry);

    // If this is the first element clear default state
    if (this.defaultState) {
        $('#shoppingCart tr').first().hide();
        this.defaultState = false;
    }

    // Create a new element to be added to the table
    var elem = $.parseHTML('<tr>' +
        '<td><i class="fa fa-user" aria-hidden="true" data-counter="' + entry.id  + '"></i> ' + entry.seller + '</td>' +
        '<td data-counter="' + entry.id  + '">' + entry.amount + ' kr</td><td><i class="fa fa-trash shopping-trash" aria-hidden="true" data-counter="' + entry.id  + '"></i></td>' +
        '</tr>');

    // Bind an event to handle clicking the trash icon
    $(elem).bind('click', this.onTrashcanClicked.bind(this));

    // The last element is the complete purchase button
    $('#shoppingCart')
        .find('tr')
        .last()
        .prev()
        .after(elem);
};

    /*
        Removes the element in the cart and removes the corresponding HTML element
    */
Cart.prototype.onTrashcanClicked = function(event) {
    var id = parseInt(event.target.dataset["counter"]);
    this.removeEntry(id);
    $(event.currentTarget).remove();
    updateButtonCompletePurchaseAmount(this);
    updateCurrentPurchaseHeader(this.items);
};

Cart.prototype.removeEntry = function(id) {
    function finder(entry) {
        return entry["id"] === id;
    }

    var index = this.items.findIndex(finder);
    if (index > -1) {
        //this.items.splice(index, 1);
        // Instead of removing the entry zero it, allows for a write only db model
        this.items[index].amount = 0;
        //this.items.splice(index, 1);
    } else {
        console.log("WE DID NOT FIND ENTRY ", id);
    }
};

    /*
        Resets the card by removing all items and resetting to default state
    */
Cart.prototype.reset = function() {
    this.items = [];
    this.counter = 0;
    this.saleId = null;
    this.defaultState = true;
    $('#shoppingCart tr').first().show();
    $('#shoppingCart tr').not(':first').not(':last').remove();
};

    /*
        Load items from history, resets internal cart state
    */
Cart.prototype.loadItems = function(saleId, items) {
    this.reset();
    this.saleId = saleId;
    var self = this;
    items.forEach(function(entry) {
        self.addEntry(entry.seller, entry.amount, entry.swish);
    });
};


function History () {
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
History.prototype.addEntry = function (saleId, cartItems) {

    console.log("Removing ", saleId);
    $("#" + saleId).remove();

    var itemCount = 0;
    var total = 0;
    cartItems.forEach(function(entry) {
        itemCount++;
        total += entry["amount"];
    });

    var entry = {
        items: itemCount,
        amount: total
    };

    this.items[saleId] = cartItems;

    // If this is the first element clear default state
    if (this.defaultState) {
        $('#purchaseHistory tr').first().hide();
        this.defaultState = false;
    }

    $('#purchaseHistory tr').removeClass("font-weight-bold table-info");

    // Create a new element to be added to the table
    var elem = $.parseHTML('<tr id="' + saleId + '" class="font-weight-bold table-info">' +
        '<td><i class="fa fa-shopping-bag" aria-hidden="true"></i> ' + entry.items + '</td>' +
        '<td>' + entry.amount + ' kr</td>' +
        '</tr>');

    // Bind an event to handle editing history and loading into cart
    $(elem).bind('click', loadCart.bind(null, saleId));

    // The last element is the complete purchase button
    $('#purchaseHistory tr').first().after(elem);

    // Only keep 15 items in the UI
    $( "#purchaseHistory tr" ).slice(15).remove();
};


var cart = new Cart();
var purchaseHistory = new History();

/*
    Load a history item into current cart
    - Reset cart state
    - Load entries
*/
function loadCart(saleId) {
    console.log("Wanted to reload cart with", saleId);
    var items = purchaseHistory.items[saleId];
    if (items !== null) {
        cart.loadItems(saleId, items);
    }
    updateButtonCompletePurchaseAmount(cart);
}

// Handlers

function updateCurrentPurchaseHeader (items) {
    var elem = $("#currentPurchaseHeader");

    var numItems = 0;
    items.forEach(function(entry) {
        if (entry.amount !== 0) {
            numItems++;
        }
    });

    if (numItems === 0) {
        elem.text("Pågående köp");
    } else {
        if (numItems === 1) {
            elem.text("Pågående köp - " + numItems + " vara");
        } else {
            elem.text("Pågående köp - " + numItems + " varor");
        }

    }
}

$("#addEntryAmount").on('keypress', function (e) {
    if(e.which === 13){
        $('#buttonAddEntry').focus();
    }
});


//https://stackoverflow.com/questions/43929230/query-nested-data-from-firebase-real-time-database-android?rq=1

function validateAddEntryAmount() {
    var amountElem = $("#addEntryAmount");
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

    if (sellerValue === "CAFE") {
        return true;
    }

    var first = sellerValue[0];

    // Just the seller number should always validate
    if (sellerValue.length === 1 && first === SELLER_PREFIX) {
        return true;
    }

    // Validate and inject first letter
    if (first !== SELLER_PREFIX) {
        if (parseInt(first)) {

            sellerValue = SELLER_PREFIX + sellerValue;
            sellerElem.val(sellerValue);
        } else {
            sellerElem.val("");
        }

    }

    // Check that the rest is a number
    var rest = sellerValue.slice(1);
    if (!Number(rest)) {
        return false;
    }

    if (rest[0] === "0") {
        sellerElem.val(SELLER_PREFIX + Number(rest));
    }

    return true;
}

function updateButtonCompletePurchaseAmount (cart) {
    var total = 0;
    cart.items.forEach(function(entry) {
        total += entry.amount;
    });

    var message = "Slutför köp - Totalt: " + total + " kr";

    $("#buttonCompletePurchase").html(message);
}

$('#addEntryAmount').on('input', function() {
    var amountElem = $("#addEntryAmount");

    if (validateAddEntryAmount()) {
        $(amountElem).css('color', '#000000');
    } else {
        $(amountElem).css('color', '#c82333');
    }
});

// Complete purchase button
$("#buttonCompletePurchase").click(function() {
    console.log("Handler for buttonCompletePurchase called.");
    if (cart.items.length <= 0) {
        console.log("Complete purchase with empty cart pressed, ignoring.");
        return
    }

    var paymentOption = $('input[name=paymentOption]:checked').val();
    cart.setPaymentOption(paymentOption === "swish");

    var saleId = fbUpdateOrInsertSale(cart.saleId, cart.items);
    purchaseHistory.addEntry(saleId, cart.items);

    cart.reset();
    updateCurrentPurchaseHeader(cart.items);
    updateButtonCompletePurchaseAmount(cart);

    // The Cafe only has one element to focus
    $('#addEntryAmount').focus();

    // The regular flow also has the seller field
    $('#addEntrySeller').focus();
});

function signOut() {
    firebase.auth().signOut().then(function() {
        window.location = "/";
    });
}
