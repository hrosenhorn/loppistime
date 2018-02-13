
function initTable() {
    let index = 1;
    for(i = 0; i < 20; i++) {

        let data =
            '<tr>' +
            '   <td><div id="X' + (index) + '"><div class="float-left"><i class="fa fa-user" aria-hidden="true">&nbsp;</i></div><div class="float-left" id="Y' + (index) + '"> ' + SELLER_PREFIX + index + ' - 0 kr</div></div></td>' +
            '   <td><div id="X' + (index + 1) + '"><div class="float-left"><i class="fa fa-user" aria-hidden="true">&nbsp;</i></div><div class="float-left" id="Y' + (index + 1) + '"> ' + SELLER_PREFIX + (index + 1) + ' - 0 kr</div></div></td>' +
            '   <td><div id="X' + (index + 2) + '"><div class="float-left"><i class="fa fa-user" aria-hidden="true">&nbsp;</i></div><div class="float-left" id="Y' + (index + 2) + '"> ' + SELLER_PREFIX + (index + 2) + ' - 0 kr</div></div></td>' +
            '   <td><div id="X' + (index + 3) + '"><div class="float-left"><i class="fa fa-user" aria-hidden="true">&nbsp;</i></div><div class="float-left" id="Y' + (index + 3) + '"> ' + SELLER_PREFIX + (index + 3) + ' - 0 kr</div></div></td>' +
            '   <td><div id="X' + (index + 4) + '"><div class="float-left"><i class="fa fa-user" aria-hidden="true">&nbsp;</i></div><div class="float-left" id="Y' + (index + 4) + '"> ' + SELLER_PREFIX + (index + 4) + ' - 0 kr</div></div></td>' +
            '</tr>';

        index += 5;

        let elem = $.parseHTML(data);
        $('#summaryTable').find('tr').last().after(elem);
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

    firebase.database().ref(DB_INSTANCE + '/summary').once('value').then(function(snapshot) {
        let summary = snapshot.val();

        for(i = 1; i <= 100; i++) {

            let index = SELLER_PREFIX + i;
            let entry = summary[index];
            if (entry) {
            console.log("Setting ", i, entry.amount);
                updateEntry(i, entry.amount);
            }
        }
    });


    firebase.database().ref().child(DB_INSTANCE + '/purchases')
    .orderByChild("seller").equalTo("A1")
    .once('value').then(function(snapshot) {
        console.log("GOT", snapshot);
    });


    let summaryRef = firebase.database().ref(DB_INSTANCE + '/summary');
//    summaryRef.on('child_added', function(data) {
//        let key = data.key.slice(1);
//        console.log("Im added", key, data.val().amount);
//        updateEntry(key, data.val().amount, true);
//    });
    summaryRef.on('child_changed', function(data) {
        let key = data.key.slice(1);
        console.log("Im changed", key, data.val().amount);
        updateEntry(key, data.val().amount, true);
    });

});