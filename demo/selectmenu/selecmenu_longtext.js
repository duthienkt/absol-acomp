var $ = absol.$;
var _ = absol._;

var items = Array(500).fill(null).map((u, i)=>{
    return {
        text: absol.string.randomPhrase(500),
        value: i
    }
});


var sm = _({
    tag:'selectmenu',
    props:{
        items: items,
    }
}).addTo(document.body);


var sm2 = _({
    tag: 'selectmenu',
    props:{
        items: require('./selecmenu_longtext_items.js'),
        enableSearch: true
    }
}).addTo(document.body);
