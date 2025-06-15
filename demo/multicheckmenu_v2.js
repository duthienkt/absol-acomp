var __ = o=> absol._(o).addTo(document.body);
var items = Array(22).fill(null).map(function (u, i) {
    return {
        icon: 'span.mdi.mdi-account',
        text: `[${i}] item  ${i}`,
        value: i,
        desc: absol.string.randomPhrase(20),
        lastInGroup: i % 8 == 2,
        noSelect: i % 8 == 3,
    };
});

__('<h3>MultiCheckMenu</h3>').addTo(document.body);
setTimeout(()=>{
    var now = Date.now();

    var menu6 = __({
        tag: 'multicheckmenu',
        style: {
            width: '300px',
        },
        props: {
            enableSearch: true,
            items: items,
            itemFocusable: true,
            values: [1, 4, 5, 6]
        },
        on: {
            change: function (event) {
                menu7.values = menu6.values;
                console.trace(event.type, this.values);
            }
        }
    }).addTo(document.body);
    var menu7 = __({
        tag: 'multicheckmenu',
        style: {
            width: '300px',
            marginTop: '20px'
        },
        props: {
            enableSearch: true,
            items: items,
            itemFocusable: true,
            values: [1, 4, 5, 6]
        },
        on: {
            change: function (event) {
                console.trace(event.type, this.values);
            }
        }
    }).addTo(document.body);


    console.log(Date.now() - now);
}, 200);