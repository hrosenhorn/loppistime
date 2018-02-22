const SELLER_PREFIX = "A";

const DB_INSTANCE = "vt18"

function formatDate() {
    let now = new Date();

    let lookup = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];

    let monthIndex = now.getMonth();
    let day = now.getDate();
    let hour = now.getHours();
    let minute = now.getMinutes();

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

    var summaries = {};
    items.forEach(function(entry) {
        let sumKey = DB_INSTANCE + '/summaries/' + entry.seller  + '/' + refKey;
        if (updates[sumKey] === undefined) {
            updates[sumKey] = [];
        }

        updates[sumKey].push({
            "amount": entry.amount,
            "dateString": entry.dateString,
            "swish": entry.swish
        })
    });



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
};

//https://stackoverflow.com/questions/43929230/query-nested-data-from-firebase-real-time-database-android?rq=1