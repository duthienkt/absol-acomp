var _ = absol._;
var $ = absol.$;

var dataSync = fetch('https://raw.githubusercontent.com/duthienkt/absol-geography/main/CityList.js').then(function (res) {
    return res.text();
}).then(function (text) {
    var js = text.replace('export default', 'return');
    var data = (new Function(js))();
    var res = data.countries.map(function (c) {
        var item = {};
        item.text = c[0];
        item.value = c[0];
        if (c.t) {
            item.items = c.t.map(function (city) {
                return {
                    text: city[0],
                    value: city[0]
                }
            });

            item.items.sort(function (a, b) {
                return a.text < b.text ? -1 : 1;
            });
        }
        else {
            item.items = [{ text: 'none', value: 'none' }]
        }
        return item;
    });
    res.sort(function (a, b) {
        return a.text < b.text ? -1 : 1;
    });
    return res;
});

function render(o) {
    return _(o).addTo(document.body);
}


render({ style: { height: '70vh' } });
render('<h2>DualSelectMenu</h2>');
render({
    style: { display: 'grid', gridTemplateColumns: 'auto 1fr', alignItems: 'center', gap: '10px', padding: '5px' },
    child: [
        { tag: 'span', child: { text: 'size' } },
        {
            tag: 'selectmenu',
            props: {
           
                items: ['v0', 'regular', 'large', 'small'].map(x => ({ text: x, value: x })),
            },
            on: {
                change: function () {
                    dsm.addStyle('size', this.value);
                }
            }
        }
    ]
})

var dsm = render({
    tag: 'dualselectmenu',
    props: {
        //  value: ['Vietnam', 'Kon Tum'],
        enableSearch: true,
        //default format: "$0, $1"
        format: 'City: $1, Country: $0',
        strictValue: true
    },
    on: {
        change: function () {
            absol.require('snackbar').show(this.value.join(' - '));
            dsm1.value = this.value;
        }
    }
});
render({ style: { height: '30px' } });
var dsm1 = render({
    tag: 'dualselectmenu',
    props: {
        //  strictValue: false,
        //  value: ['Vietnam', 'Kon Tum'],
        // enableSearch: true,
        //default format: "$0, $1"
        format: 'City: $1, Country: $0'
    },
    on: {
        change: function () {
            absol.require('snackbar').show(this.value.join(' - '));
            dsm.value = this.value;
        }
    }
});

render({ style: { height: '30vh' } });

dataSync.then(function (items) {

    var itemJS = 'module.exports = ' + absol.generateJSVariable(items);
    var downloadBtn = _({
        tag: 'flexiconbutton',
        style: {
            marginLeft: '20px',
            height: '30px'
        },

        props: {
            text: 'Tải xuống items mẫu',
            icon: 'span.mdi.mdi-download'
        },
        on: {
            click: function () {
                absol.FileSaver.saveTextAs(itemJS, 'example_items.js');
            }
        }
    });
    $(document.body).addChildAfter(downloadBtn, dsm);
    dsm.items = items;
    dsm1.items = items;
    var l = new absol.ListDictionary(items);
    console.log(l);
});
