function generateItemsWidthFallbackValues() {
    var i = 0;
    var make = (depth) => {
        i++;
        if (depth === 2) {
            return {
                text: 'item ' + i,
                isLeaf: true,
                value: i,
                fallbackValues: [i * 1000, i * 10000, i * 100000]
            }
        }
        var item = {
            text: 'item ' + i,
            value: i,
            fallbackValues: [i * 1000, i * 10000, i * 100000]
        }
        item.items = Array(5).fill(null).map(() => make(depth + 1));

        return item;

    }

    return Array(5).fill(null).map(() => make(0));
}

function __(o) {
    return absol._(o).addTo(document.body);
}


__('<h3>Width fallbackValues</h3>');

m1 = __({
    tag: 'multichecktreeleafmenu',
    props: {
        items: generateItemsWidthFallbackValues(),
        enableSearch: true,
        values: [6000, 7, 12, 17, 22]
    },
    on: {
        change: function () {
            absol.require('snackbar').show('change : ' + this.values.join(', '));
        }
    }
});

console.log(m1.values);

__('<h3>With icon</h3>');

var listDataAsync = fetch('./demo_tree_list_with_icon.js').then(function (res) {
    return res.text();
}).then(function (text) {
    var module = { exports: {} };
    var factor = new Function('module', 'exports', text + '\nreturn module.exports;');
    return factor(module, module.exports);
});

listDataAsync.then(function (items) {
    var _ = absol._;
    var $ = absol.$;
    var items2 = JSON.parse(JSON.stringify(items));
    items2.forEach(function visit(item) {
        item.isLeaf = item.icon.class.indexOf('mdi-account') >= 0;
        if (item.items) {
            item.items.forEach(visit);
        }
    });

    var menu = _({
        tag: 'multichecktreeleafmenu',
        props: {
            items: items2,
            enableSearch: true,
            values: [-17, -18]
        },
        on: {
            change: function () {
                absol.require('snackbar').show('change : ' + this.values.join(', '));
            }
        }
    }).addTo(document.body);

    var menu1 = _({
        tag: 'multichecktreeleafmenu',
        props: {
            items: items2,
            enableSearch: true,
            values: [-17, -18],
            disabled: true
        },
        on: {
            change: function () {
                absol.require('snackbar').show('change : ' + this.values.join(', '));
            }
        }
    }).addTo(document.body);

    _({
        tag: 'pre',
        style: { background: '#eef' },
        child: {
            tag: 'code',
            child: { text: 'items = ' + absol.generateJSVariable(items) }
        }
    }).addTo(document.body);

});
