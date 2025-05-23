
var purchases = {};
var sellerInfo = {};
var sellerSales = {};

function formatAmount(input) {
    return new Intl.NumberFormat('se-SE', { }).format(input)
}

var calculateSellerSales = debounce(
    function calculateSellerSales(seller) {
        sellerSales = {};
        var itemSales = 0;
        var itemSwish = 0;
        var itemCash = 0;
        var totalItems = 0;
        var totalPurchases = 0;
        var cafeSales = 0;
        var cafeSwish = 0;
        var cafeCash = 0;

        console.log("Calculating seller sales");

        for(var propt in purchases){
            totalPurchases += 1;
            var purchase = purchases[propt];
                Array.from(purchase).forEach(function(row) {
                if (row === undefined) {
                    return;
                }
                if (sellerSales[row.seller] === undefined) {
                    sellerSales[row.seller] = 0;
                }
                sellerSales[row.seller] += row.amount;

                if (row.seller === "CAFE") {
                    cafeSales += row.amount;

                    if (row.swish === true) {
                        cafeSwish += row.amount;
                    } else {
                        cafeCash += row.amount;
                    }
                } else {
                    itemSales += row.amount;

                    if (row.swish === true) {
                        itemSwish += row.amount;
                    } else {
                        itemCash += row.amount;
                    }

                    totalItems += 1;
                }
            });
        }

        console.log("TOTAL PURCHASES", totalPurchases);
        console.log("TOTAL ITEMS", totalItems);

        $("#sumTotalSaleHeader").text("Total försäljning " + formatAmount(itemSales + cafeSales) + "kr");
        $("#sumTotalSaleBody").html("Kläder " + formatAmount(itemSales) + " kr - Cafe " + formatAmount(cafeSales) + " kr<br>Antal köp: " + totalPurchases + " - Sålda varor: " + totalItems + " st");

        var itemProfit = itemSales * 0.3;
        var itemSwishProfit = itemSwish * 0.3;
        var itemCashProfit = itemCash * 0.3;

        $("#sumTotalProfitHeader").text("Totala intäkter " + formatAmount(itemProfit + cafeSales) + "kr");
        $("#sumTotalProfitBody").html("Kläder swish " + formatAmount(itemSwishProfit) + " kr - Kläder kontant " + formatAmount(itemCashProfit) + " kr <br> Cafe swish " + formatAmount(cafeSwish) + " kr - Cafe kontant " + formatAmount(cafeCash) + " kr");
    },
    250,
    true
);

var renderSellerSales = debounce(
    function renderSellerSales() {
        //console.log("Rendering seller sales");

        for(var seller in sellerSales){
            var key = "#summary-" + seller;

            var major = sellerSales[seller] * 0.7;

            $(key).hide();
            $(key).text(major.toFixed(2) + " kr (70%)");
            $(key).fadeIn( "slow" );
        }
    },
    250,
    true
);

function removeItem(e) {

    var card = $(e).closest(".card");
    var seller = e.dataset.seller;
    var purchaseId = e.dataset.purchaseid;
    var index = parseInt(e.dataset.index);

    // Make sure the element is there
    var foundElement = purchases[purchaseId].find(function(element) {
        return (element && element.id === index);
    });

    if (foundElement != null) {
        var result = purchases[purchaseId].indexOf(foundElement)
        if (result > -1) {
            purchases[purchaseId].splice(result, 1);

            var key = DB_INSTANCE + '/purchases/' + purchaseId + '/' + index;
            firebase.database().ref(key).remove().then(function() {
                calculateSellerSales();
                renderSellerSales();
                renderSellerSummary(card, seller);
            });
        }
    }
}

function renderSellerSummary(element, seller) {

    var rawState = $(element).find(".card-header").attr("aria-expanded");
    var isExpanding = !(rawState === 'true');

    var elem = $("#collapse" + seller);

    var htmlRows = "";
    var totalAmount = 0;
    var swish = 0;
    var cash = 0;

    console.log("Fetching sale summary for seller " + seller);
    for(var purchaseId in purchases){
        var purchase = purchases[purchaseId];
        Array.from(purchase).forEach(function(row) {

            // Temp fix until entry removal is fixes
            if (row == null) {
                return;
            }
            if (row.seller === seller) {
                totalAmount += row.amount;

                if (row.swish === true) {
                    swish += row.amount;
                } else {
                    cash += row.amount;
                }

                // Only append the rows for regular sellers
                if (seller !== "CAFE") {
                    htmlRows += '  <tr id="sumEntry-' + purchaseId + '-' + row.id + '">' +
                    '    <td><i class="fa fa-clock-o" aria-hidden="true"></i> ' + row.dateString + '</td>' +
                    '    <td></td><td>' + row.amount + 'kr</td>' +
                    '    <td><i class="fa fa-trash shopping-trash" aria-hidden="true" id="sumTrashEntry-' + purchaseId + '-' + row.id + '" data-purchaseid="' + purchaseId + '" data-index="' + row.id + '" data-seller="' + seller + '" onClick="removeItem(this);"></i></td>' +
                    '  </tr>';
                }
            }
        });
    }

    var major = totalAmount * 0.7;

    var summaryRow = "";
    if (seller === "CAFE") {
        summaryRow = "Swish: " + swish + " kr, kontant " + cash + " kr";
    } else {
        summaryRow = "<b>" + major.toFixed(2) + " kr</b> (70%)";
    }

    var table =
    '<table class="table table-striped" id="summaryTable">' +
    htmlRows +
    '  <tr><td>Totalt <b>' + totalAmount + ' kr</b></td><td colspan="3">' + summaryRow + '</td></tr>' +
    '</table>';

    $(elem).html(table);

    console.log("Element clicked with ", isExpanding, seller);
}

function initTable() {
    let index = 1;

    var cards = [];

    var numbers = 181;
    // Generate all seller cards
    for(i = 0; i <= numbers; i++) {
        var key = SELLER_PREFIX + (i+1);

        if (i === numbers -1) {
            key = SELLER_PREFIX + "808";
        }

        if (i === numbers) {
            key = "CAFE";
        }

        var card =
            '<div class="card mt-3">' +
            '  <div class="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapse' + key + '">' +

            '    <div class="float-left"><a class="card-title ">' + key + '</a></div><div id="summary-' + key + '" class="float-right">0 kr</div>' +
            '  </div>' +
            '  <div id="collapse' + key + '" class="card-block collapse">' +
            '  <table class="table table-striped" id="summaryTable"><tr><td>Laddar...</td></tr></table>' +
            '</div>' +
            '</div>';

        var cardElem = $.parseHTML(card);

        $(cardElem).bind('click', renderSellerSummary.bind(null, cardElem, key));
        cards.push(cardElem);
    }

    // Generate all rows and insert cards with listeners on each element
    for(i = 0; i < 71; i++) {

        var row =
        '<div class="row">' +
        '  <div class="col"></div>' +
        '  <div class="col"></div>' +
        '  <div class="col"></div>' +
        '</div>';
        var rowElem = $.parseHTML(row);

        for(j = 0; j < 3; j++) {
            var card = cards.shift();
            if (card) {
                $(rowElem).find(".col:eq(" + j + ")").append(card);
            }
        }

        $('.container').find(".row").last().after(rowElem);
    }
}

function updateEntry(key, amount, effect) {
    var divKey = '#X' + key;
    var contentKey = '#Y' + key;

    if (effect) {
      $(divKey).hide();
    }
    $(contentKey).html(SELLER_PREFIX + '' + key  + ' - ' + amount + ' kr');

    if (effect) {
      $(divKey).fadeIn("slow");
    }
}

var initialDelayed = false;
setTimeout(function () {
    initialDelayed = true;
}, 2000);


$(document).ready(function(){
    initTable();

    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            console.log("User is not logged in, redirecting");
            window.location = "/";
        } else {

            var purchaseRef = firebase.database().ref(DB_INSTANCE + '/purchases');
            purchaseRef.on('child_added', function(data) {
                //console.log("Child added", data.val());
                purchases[data.key] = data.val();
                calculateSellerSales();
                renderSellerSales();
            });


            var sellersRef = firebase.database().ref(DB_INSTANCE + '/sellers');
            sellersRef.on('child_added', function(data) {
                //console.log("Child added", data.val());
                sellerInfo[data.key] = data.val();
            });
        }
    });

    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function(snap) {

        if (initialDelayed) {
            if (snap.val() === true) {
                $("#connectionNoInternet").hide();
            } else {
                //$("#connectionNoInternet").show();
                // We won't recover from this one since we might have missed childs during being disconnected
            }
        }
    });


    setTimeout(function () {
        console.log("Forcing summary re rendering");
        calculateSellerSales();
        renderSellerSales();
    }, 3000);

});