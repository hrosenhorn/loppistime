
function initTable() {
    let index = 1;
    for(i = 0; i < 20; i++) {

        let data =
            '<tr>' +
            '   <td><div id="X' + (index) + '"><div class="float-left"><i class="fa fa-user" aria-hidden="true">&nbsp;</i></div><div class="float-left" id="Y' + (index) + '"> E' + index + ' - 0 kr</div></div></td>' +
            '   <td><div id="X' + (index + 1) + '"><div class="float-left"><i class="fa fa-user" aria-hidden="true">&nbsp;</i></div><div class="float-left" id="Y' + (index + 1) + '"> E' + (index + 1) + ' - 0 kr</div></div></td>' +
            '   <td><div id="X' + (index + 2) + '"><div class="float-left"><i class="fa fa-user" aria-hidden="true">&nbsp;</i></div><div class="float-left" id="Y' + (index + 2) + '"> E' + (index + 2) + ' - 0 kr</div></div></td>' +
            '   <td><div id="X' + (index + 3) + '"><div class="float-left"><i class="fa fa-user" aria-hidden="true">&nbsp;</i></div><div class="float-left" id="Y' + (index + 3) + '"> E' + (index + 3) + ' - 0 kr</div></div></td>' +
            '   <td><div id="X' + (index + 4) + '"><div class="float-left"><i class="fa fa-user" aria-hidden="true">&nbsp;</i></div><div class="float-left" id="Y' + (index + 4) + '"> E' + (index + 4) + ' - 0 kr</div></div></td>' +
            '</tr>';

        index += 5;

        let elem = $.parseHTML(data);
        $('#summaryTable').find('tr').last().after(elem);
    }
}

const SELLER_PREFIX = "E";

function updateEntry(key, amount, effect = false) {
    let divKey = '#X' + key;
    let contentKey = '#Y' + key;

    if (effect) {
      $(divKey).hide();
    }
    $(contentKey).html(' E' + key  + ' - ' + amount + ' kr');

    if (effect) {
      $(divKey).fadeIn( "slow" );
    }

}

$(document).ready(function(){
    initTable();

    firebase.database().ref('/summary').once('value').then(function(snapshot) {
        let summary = snapshot.val();

        for(i = 1; i <= 100; i++) {
            let index = SELLER_PREFIX + i;
            let entry = summary[index];
            if (entry) {
                updateEntry(i, entry.amount);
            }
        }
    });

    let summaryRef = firebase.database().ref('/summary');
    summaryRef.on('child_added', function(data) {
        let key = data.key.slice(1);
        updateEntry(key, data.val().amount, true);
    });
    summaryRef.on('child_changed', function(data) {
        let key = data.key.slice(1);
        updateEntry(key, data.val().amount, true);
    });

});