
function renderSellerSummary(element, seller) {

    var rawState = $(element).find(".card-header").attr("aria-expanded");
    let isExpanding = !(rawState === 'true');

    let elem = $("#collapse" + seller);

    if (!isExpanding) {
        return;
    }

    console.log("Fetching sale summary for seller " + seller);
    firebase.database().ref(DB_INSTANCE + '/summaries/' + seller).once('value').then(function(snapshot) {
        let summary = snapshot.val();

        var htmlRows = "";
        var totalAmount = 0;
        var swish = 0;
        var cash = 0;
        for(var propt in summary){
            let saleRow = summary[propt];
            saleRow.forEach(function(row) {
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
            });
        }


        let major = totalAmount * 0.7;

        var summaryRow = "";
        if (seller === "CAFE") {
            summaryRow = "Swish: " + swish + "kr, kontant " + cash + "kr";
        } else {
            summaryRow = "<b>" + major.toFixed(2) + " kr</b> (70%)";
        }


        let table =
        '<table class="table table-striped" id="summaryTable">' +
        htmlRows +
        '  <tr><td>Totalt <b>' + totalAmount + ' kr</b></td><td colspan="2">' + summaryRow + '</td></tr>' +
        '</table>';

        $(elem).html(table);
    });



    console.log("Element clicked with ", isExpanding, seller);
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
            '    <a class="card-title ">' + key + '</a>' +
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
      $(divKey).fadeIn( "slow" );
    }
}

$(document).ready(function(){
    initTable();

//    firebase.database().ref(DB_INSTANCE + '/summary').once('value').then(function(snapshot) {
//        let summary = snapshot.val();
//
//        for(i = 1; i <= 100; i++) {
//
//            let index = SELLER_PREFIX + i;
//            let entry = summary[index];
//            if (entry) {
//            console.log("Setting ", i, entry.amount);
//                //updateEntry(i, entry.amount);
//            }
//        }
//    });
//
//
//    firebase.database().ref().child(DB_INSTANCE + '/purchases')
//    .orderByChild("seller").equalTo("A1")
//    .once('value').then(function(snapshot) {
//        console.log("GOT", snapshot);
//    });


    let summaryRef = firebase.database().ref(DB_INSTANCE + '/summary');
//    summaryRef.on('child_added', function(data) {
//        let key = data.key.slice(1);
//        console.log("Im added", key, data.val().amount);
//        updateEntry(key, data.val().amount, true);
//    });
//    summaryRef.on('child_changed', function(data) {
//        let key = data.key.slice(1);
//        console.log("Im changed", key, data.val().amount);
//        updateEntry(key, data.val().amount, true);
//    });

});