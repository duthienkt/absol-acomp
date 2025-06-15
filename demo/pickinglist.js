var __ = o => absol._(o).addTo(document.body);
var _ = absol._;

__({
    tag: 'a',
    attr: {
        href: "./pickinglist.js",
    },
    child: {
        text: "Source code"
    }
})

var list = __({
    tag: 'pickinglist',
    props: {
        items: [
            { value: '1', text: 'Item 1' },
            { value: '2', text: 'Item 2' },
            { value: '3', text: 'Item 3' },
            { value: '4', text: 'Item 4' },
            { value: '5', text: 'Item 5' },
            { value: '6', text: 'Item 6' },
            { value: '7', text: 'Item 7' },
            { value: '8', text: 'Item 8' }
        ],
        values: [
            '1', '3', '5', '7'
        ]
    },
    on: {
        change: function () {
            console.log('Selected values:', list.values);
        }
    }
});

