$.get( "http://olx.pl/nieruchomosci/mieszkania/wynajem/wroclaw/?search%5Bfilter_float_price%3Ato%5D=1500", function( data ) {

        chrome.storage.local.get('olxOffers', function(offers) {
            $.each($(data).find('#offers_table').find('.offer'), function(index, row) {
                offers.push($(row).find('a.detailsLink').attr('href'));
            });
            chrome.storage.local.set({'olxOffers': offers});
            chrome.browserAction.setBadgeText({text: offers.length}, function(){
                console.log('set');
            });
        });
});