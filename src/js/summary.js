
let purchases = {};
let sellerSales = {};


function formatAmount(input) {
    return new Intl.NumberFormat('se-SE', { }).format(input)
}

let calculateSellerSales = debounce(
    function calculateSellerSales(seller) {
        var itemSales = 0;
        var totalItems = 0;
        var cafeSales = 0;
        var cafeSwish = 0;
        var cafeCash = 0;

        console.log("Calculating seller sales");

        for(var propt in purchases){
            let purchase = purchases[propt];
            purchase.forEach(function(row) {
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
                    totalItems += 1;
                }
            });
        }

        $("#sumTotalSaleHeader").text("Total försäljning " + formatAmount(itemSales + cafeSales) + "kr");
        $("#sumTotalSaleBody").text("Kläder " + formatAmount(itemSales) + " kr - Cafe " + formatAmount(cafeSales) + " kr");


        let itemProfit = itemSales * 0.3;
        $("#sumTotalProfitHeader").text("Totala intäckter " + formatAmount(itemProfit + cafeSales) + "kr");
        $("#sumTotalProfitBody").text("Kläder " + formatAmount(itemProfit) + " kr - Cafe swish " + formatAmount(cafeSwish) + " kr - Cafe kontant " + formatAmount(cafeCash) + " kr");
    },
    250,
    true
);

let renderSellerSales = debounce(
    function renderSellerSales() {
        console.log("Rendering seller sales");

        for(var seller in sellerSales){
            let key = "#summary-" + seller;

            let major = sellerSales[seller] * 0.7;

            $(key).hide();
            $(key).text(major.toFixed(2) + " kr (70%)");
            $(key).fadeIn( "slow" );
        }
    },
    250,
    true
);

function renderSellerSummary(element, seller) {

    var rawState = $(element).find(".card-header").attr("aria-expanded");
    let isExpanding = !(rawState === 'true');

    let elem = $("#collapse" + seller);

    if (!isExpanding) {
        return;
    }

    var htmlRows = "";
    var totalAmount = 0;
    var swish = 0;
    var cash = 0;

    console.log("Fetching sale summary for seller " + seller);
    for(var propt in purchases){
        let purchase = purchases[propt];
        purchase.forEach(function(row) {
            if (row.seller === seller) {
                totalAmount += row.amount;

                if (row.swish === true) {
                    swish += row.amount;
                } else {
                    cash += row.amount;
                }

                // Only append the rows for regular sellers
                if (seller !== "CAFE") {
                    htmlRows += '  <tr><td><i class="fa fa-clock-o" aria-hidden="true"></i> ' + row.dateString + '</td><td></td><td>' + row.amount + 'kr</td></tr>';
                }
            }
        });
    }

    let major = totalAmount * 0.7;

    var summaryRow = "";
    if (seller === "CAFE") {
        summaryRow = "Swish: " + swish + " kr, kontant " + cash + " kr";
    } else {
        summaryRow = "<b>" + major.toFixed(2) + " kr</b> (70%)";
    }

    let table =
    '<table class="table table-striped" id="summaryTable">' +
    htmlRows +
    '  <tr><td>Totalt <b>' + totalAmount + ' kr</b></td><td colspan="2">' + summaryRow + '</td></tr>' +
    '  <tr><td colspan="2"><button type="button" class="btn btn-primary btn-lg btn-block" id="receiptButton' + seller + '" data-seller="' + seller + '" onClick="toggleReceiptButton(this);">Skicka kvitto</button></td></tr>' +
    '</table>';

    $(elem).html(table);

    console.log("Element clicked with ", isExpanding, seller);
}


// Invoked when clicking the "receipt button", triggers modal and sets seller input field
function toggleReceiptButton(e) {
    let seller = e.dataset.seller;
    $("#modalReceiptSeller").val(seller);
    $('#receiptModal').modal('show');
}

// Invoked when the send button is clicked in the receipt modal
function modalConfirmSendMail(e) {

    let email = $("#modalReceiptEmail").val();
    let seller = $("#modalReceiptSeller").val();

    console.log("Modal clicked, sending email" + email, seller);

    $('#receiptModal').modal('hide');

    let newRef = firebase.database().ref('mailqueue').push();


    newRef.set({
        email: email,
        content: "Test content"
    });
}


function initTable() {
    let index = 1;

    var cards = [];

    // Generate all seller cards
    for(i = 0; i < 101; i++) {
        var key = SELLER_PREFIX + (i+1);

        if (i === 100) {
            key = "CAFE";
        }

        let card =
            '<div class="card mt-3">' +
            '  <div class="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapse' + key + '">' +

            '    <div class="float-left"><a class="card-title ">' + key + '</a></div><div id="summary-' + key + '" class="float-right"></div>' +
            '  </div>' +
            '  <div id="collapse' + key + '" class="card-block collapse">' +
            '  <table class="table table-striped" id="summaryTable"><tr><td>Laddar...</td></tr></table>' +
            '</div>' +
            '</div>';

        let cardElem = $.parseHTML(card)

        $(cardElem).bind('click', renderSellerSummary.bind(null, cardElem, key));
        cards.push(cardElem);
    }

    // Generate all rows and insert cards with listeners on each element
    for(i = 0; i < 34; i++) {

        let row =
        '<div class="row">' +
        '  <div class="col"></div>' +
        '  <div class="col"></div>' +
        '  <div class="col"></div>' +
        '</div>';
        let rowElem = $.parseHTML(row);

        for(j = 0; j < 3; j++) {
            let card = cards.shift();
            if (card) {
                $(rowElem).find(".col:eq(" + j + ")").append(card);
            }
        }

        $('.container').find(".row").last().after(rowElem);
    }
}

function updateEntry(key, amount, effect = false) {
    let divKey = '#X' + key;
    let contentKey = '#Y' + key;

    if (effect) {
      $(divKey).hide();
    }
    $(contentKey).html(SELLER_PREFIX + '' + key  + ' - ' + amount + ' kr');

    if (effect) {
      $(divKey).fadeIn("slow");
    }
}

$(document).ready(function(){
    initTable();

    let purchaseRef = firebase.database().ref(DB_INSTANCE + '/purchases');
    purchaseRef.on('child_added', function(data) {
        purchases[data.key] = data.val();
        calculateSellerSales();
        renderSellerSales();

    });

    purchaseRef.on('child_changed', function(data) {
        console.log("Child changed", data.val());
        purchases[data.key] = data.val();
        calculateSellerSales();
        renderSellerSales();
    });

    setTimeout(function () {
        console.log("Forcing summary re rendering");
        calculateSellerSales();
        renderSellerSales();
    }, 3000);

});