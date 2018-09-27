
var purchases = {};
var registers = {};

function calculateRegisters() {
    for(var propt in purchases){
        var purchase = purchases[propt];
        var counter = 0;
        purchase.forEach(function(row) {
            if (counter === 0) {
                if (registers[row.register] === undefined) {
                    registers[row.register] = 0;
                }

                registers[row.register] += 1;

            }

            counter++;
        });
    }

    var entries = '<option value="">Ingen kassa vald</option>';
    for(var register in registers){
        var sales = registers[register];
        entries += '<option value="' + register + '">' + register + ' - ' + sales  + ' köp</option>';
    }

    var html = '<select class="form-control" id="auditRegisterSelection">' + entries + '</select>';

    $("#auditHeader").html("Välj kassa");
    $("#auditBody").html(html);

    $("#auditRegisterSelection").change(function(entry) {
        var elem = entry.target;
        var register = elem.options[elem.selectedIndex].value;
        renderPurchases(register);
    });
}

function removeItem(e) {

    var register = e.dataset.register;
    var purchaseId = e.dataset.purchaseid;
    var index = parseInt(e.dataset.index);

    // Make sure the element is there
    var foundElement = purchases[purchaseId].find(function(element) {
        return (element && element.id === index);
    });

    if (foundElement != null) {
        var result = purchases[purchaseId].indexOf(foundElement);
        if (result > -1) {
            purchases[purchaseId].splice(result, 1);

            var key = DB_INSTANCE + '/purchases/' + purchaseId + '/' + index;
            console.log("About to remove", key);
            firebase.database().ref(key).remove().then(function() {
                renderPurchases(register);
            });
        }
    }
}

function renderPurchases(register) {

    var counter = 0;

    $('#auditContentRow').empty();
    for(var purchaseId in purchases){
        counter++;

        var purchase = purchases[purchaseId];

        var htmlRows = "";
        var dateString = "";
        var totalAmount = 0;
        purchase.forEach(function(row) {
            var seller = row.seller;
            if (row.register === register) {

                dateString = row.dateString;
                totalAmount += row.amount;

                // Only append the rows for selected register
                htmlRows += '  <tr>' +
                    '    <td><i class="fa fa-clock-o" aria-hidden="true"></i> ' + row.dateString + '</td>' +
                    '    <td></td><td>' + row.amount + 'kr</td>' +
                    '    <td><i class="fa fa-trash shopping-trash" aria-hidden="true" id="sumTrashEntry-' + purchaseId + '-' + row.id + '" data-purchaseid="' + purchaseId + '" data-index="' + row.id + '" data-register="' + row.register + '" onClick="removeItem(this);"></i></td>' +
                    '  </tr>';
            }
        });

        if (htmlRows != "") {
            var table = '<table class="table table-striped" id="summaryTable">' + htmlRows + '</table>';

            var entry =
                '<div class="col-3">'+
                '<div class="card mt-3">'+
                '<div class="card-header collapsed" data-toggle="collapse" data-parent="#accordion" href="#collapse'+counter+'">'+
                '<div class="float-left"><a class="card-title ">' + dateString + '</a></div><div id="summary-a" class="float-right">' + totalAmount + ' kr</div>'+
                '</div>'+
                '<div id="collapse'+ counter + '" class="card-block collapse">'+
                table +
                '</div>'+
                '</div>'+
                '</div>';

            var cardElem = $.parseHTML(entry);
            $('#auditContentRow').prepend(cardElem);
        }
    }
}

/*

 */
$(document).ready(function(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            console.log("User is not logged in, redirecting");
            window.location = "/";
        } else {

            var purchaseRef = firebase.database().ref(DB_INSTANCE + '/purchases');
            purchaseRef.on('child_added', function(data) {
                purchases[data.key] = data.val();
            });
        }
    });

    setTimeout(function () {
        console.log("Forcing summary re rendering");
        calculateRegisters();
        // TODO/FIXME
    }, 2000);

});