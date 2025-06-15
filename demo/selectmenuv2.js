var __ = o=>absol._(o).addTo(document.body);
var items = Array(1e4).fill(0).map(function(u, i){
    return {
        value: i,
        text:`[${i}] ${absol.string.randomSentence(100)}`,
        desc: absol.string.randomSentence(20),
    }
});

var select = __({
    tag: 'selectmenu',
    class: 'demo-selectmenu',
    props:{
        value: 0,
        items: items,
        enableSearch: true
    },
    on: {
        pressitem: function (event) {
            console.log(event);
        }
    }
});
