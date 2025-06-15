var __ = o=> absol._(o).addTo(document.body);
var items = Array(22).fill(null).map(function (u, i) {
    return {
        icon: 'span.mdi.mdi-account',
        text: `[${i}] item  ${i}`,
        value: i,
        desc: absol.string.randomPhrase(20),
        items:Array(10).fill(0).map(function (u, j) {
            return {
                icon: 'span.mdi.mdi-account',
                text: `[${i}] item  ${i} - ${j}`,
                value: i * 1e3 + j,
                desc: absol.string.randomPhrase(20),
            };
        })
    };
});


__('<h3>MultiCheckTreeMenu</h3>');

__({
    tag: 'multichecktreemenu',
    props:{
        enableSearch: true,
        items: items,
        itemFocusable: true,
        values: [1, 4, 5, 6],
        initOpened: true
    }
});

var items2= Array(22).fill(null).map(function (u, i) {
    return {
        icon: 'span.mdi.mdi-account',
        text: `[${i}] item  ${i}`,
        value: i,
        desc: absol.string.randomPhrase(20),
        items:Array(10).fill(0).map(function (u, j) {
            return {
                icon: 'span.mdi.mdi-account',
                text: `[${i}] item  ${i} - ${j}`,
                value: i * 1e3 + j,
                desc: absol.string.randomPhrase(20),
                isLeaf: true
            };
        })
    };
});

__({
    tag: 'multichecktreemenu',
    props:{
        leafOnly: true,
        enableSearch: true,
        items: items2,
        itemFocusable: true,
        values: [1, 4, 5, 6],
        initOpened: true
    }
});
