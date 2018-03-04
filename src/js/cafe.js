
// Custom for Sale
// Add entry to current purchase button
$("#buttonAddEntry").click(function() {

    if (!validateAddEntrySeller() || !validateAddEntryAmount()) {
        return false;
    }

    let sellerElem = $("#addEntrySeller");
    let amountElem = $("#addEntryAmount");

    cart.addEntry(sellerElem.val(), Number(amountElem.val()), true);
    updateCurrentPurchaseHeader(cart.items.length);

    sellerElem.val("CAFE");
    amountElem.val("");
    sellerElem.focus();
});