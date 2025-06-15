var __ = o => absol._(o).addTo(document.body);
var _ = absol._;
var $ = absol.$;

var tool = __({
    tag: 'listcomparetool',
    style: {
        maxHeight: '90vh',
    },
    props: {
        beforeItems: [
            {
                text: 'A',
                value: 'a',
                icon: 'span.mdi.mdi-account'
            },
            {
                text: 'B',
                value: 'b',
                icon: 'span.mdi.mdi-account'
            },
            {
                text: 'C',
                value: 'c',
                icon: 'span.mdi.mdi-account'
            },
            ...Array(100).fill(0).map((_, i) => ({
                text: 'item_' + i,
                value: 'item' + i,
                icon: 'span.mdi.mdi-account'
            }))
        ],
        afterItems: [
            {
                text: 'C',
                value: 'c',
                icon: 'span.mdi.mdi-account'
            },
            {
                text: 'A',
                value: 'a',
                icon: 'span.mdi.mdi-account'
            },
            {
                text: 'B',
                value: 'b',
                icon: 'span.mdi.mdi-account'
            },
            {
                text: 'D',
                value: 'd',
                icon: 'span.mdi.mdi-account'
            },
            {
                text: 'E',
                value: 'e',
                icon: 'span.mdi.mdi-account'
            },
            ...Array(100).fill(0).map((_, i) => ({
                text: 'item_' + (i + 5),
                value: 'item' + (i + 5),
                icon: 'span.mdi.mdi-account'
            }))


        ],
        mapOperators: [{ u: 'a', v: 'b' }]
    },
    on: {
        change: function () {
            console.log('change', this.mapOperators);
        }
    }
});



