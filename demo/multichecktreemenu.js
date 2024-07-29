function render(o) {
    return absol._(o).addTo(document.body);
}

(function () {
    // return;
    render('<h2>Basic (auto: desktop/mobile)</h2>');
    var menu = render({
        tag: 'multichecktreemenu',
        style: { maxWidth: '150px' },
        props: {
            values: [-100037, -100034, -100000],
            enableSearch: true
        },
        on: {
            change: function () {
                absol.require('snackbar').show(JSON.stringify(this.values))
            }
        }
    });
    render('br');
    var menu1 = render({
        tag: 'multicheckmenu',
        props: {
            values: [-100037, -100034, -100000],
            enableSearch: true
        },
        on: {
            change: function () {
                absol.require('snackbar').show(JSON.stringify(this.values))
            }
        }
    });
    render('br');
    var testBtn = render({
        tag: 'flexiconbutton',
        props: {
            text: 'Test change value'
        },
        on: {
            click: function () {
                menu.values = [-100072, -100073, -100074];
            }
        }
    });
    absol.remoteNodeRequireAsync('./sampledata/com_tree.js').then((items) => {
        menu.items = items;
        menu1.items = items;
    });

    render({
        tag: 'a',
        props: { href: './sampledata/com_tree.js', target: '__blank' },
        child: { text: 'view items' }
    });
    render('.break-page');
})();

(function () {
    // return;
    render('<h2>leafOnly = true</h2>');
    var menu = render({
        tag: 'multichecktreemenu',
        props: {
            values: ['duthien1', -100010],
            leafOnly: true,
            initOpened: 3
        },
        on: {
            change: function () {
                absol.require('snackbar').show(JSON.stringify(this.values))
            }
        }
    });
    var testBtn = render({
        tag: 'flexiconbutton',
        props: {
            text: 'Test change value'
        },
        on: {
            click: function () {
                menu.values = [-100072, -100073, -100074];
            }
        }
    });
    absol.remoteNodeRequireAsync('./sampledata/com_tree.js').then((items) => {
        items.forEach(function visit(item) {
            if (item.icon.class.indexOf("mdi-account") >= 0) {
                item.isLeaf = true;
            }
            if (item.items) item.items.forEach(visit);
        });
        items.push({
            icon: 'span.mdi.mdi-folder',
            text: 'Bộ phận kế toán',
            value: 'bpkt',
            items: [
                {
                    icon: 'span.mdi.mdi-folder',
                    text: 'Phòng kế toán 1',
                    value: 'pkt1'
                },
                {
                    icon: 'span.mdi.mdi-folder',
                    text: 'Phòng kế toán 2',
                    value: 'pkt2',
                    items: [{
                        text: 'admin',
                        value: 'adm',
                        isLeaf: true,
                        noSelect: true
                    }]
                },
                {
                    icon: 'span.mdi.mdi-folder',
                    text: 'Phòng kế toán 3',
                    value: 'pkt3',
                    items: [{
                        text: 'Nguyễn Văn B',
                        value: 'nvb',
                        isLeaf: true
                    },
                        {
                            text: 'admin1',
                            value: 'adm1',
                            isLeaf: true,
                            noSelect: true
                        }]
                }
            ]
        });
        menu.items = items;


        items_url.href = URL.createObjectURL(new Blob(['var items = ' + absol.generateJSVariable(items)], { type: 'text/plain;charset=utf-8;' }))
    });

    var items_url = render({
        tag: 'a',
        props: { target: '__blank' },
        child: { text: 'view items' }
    });
    render('.break-page');

})();

(function () {
    // return;
    render('<h2>noSelect</h2>');
    var menu = render({
        tag: 'multichecktreemenu',
        props: {
            values: [-100037, -100034, -100000],
            enableSearch: true
        },
        on: {
            change: function () {
                absol.require('snackbar').show(JSON.stringify(this.values))
            }
        }
    });
    absol.remoteNodeRequireAsync('./sampledata/com_tree_no_select.js').then((items) => {
        menu.items = items;
    });

    render({
        tag: 'a',
        props: { href: './sampledata/com_tree_no_select.js', target: '__blank' },
        child: { text: 'view items' }
    });
    render('.break-page');
})();

(function () {
    // return;
    render('<h2>leafOnly = true, noSelect</h2>');
    var menu = render({
        tag: 'multichecktreemenu',
        props: {
            values: ['duthien1', -100010],
            leafOnly: true
        },
        on: {
            change: function () {
                absol.require('snackbar').show(JSON.stringify(this.values))
            }
        }
    });
    absol.remoteNodeRequireAsync('./sampledata/com_tree_no_select.js').then((items) => {
        items.forEach(function visit(item) {
            if (item.icon.class.indexOf("mdi-account") >= 0) {
                item.isLeaf = true;
            }
            if (item.items) item.items.forEach(visit);
            if (item.value === 29) item.noSelect = true;
        });
        menu.items = items;

        items_url.href = URL.createObjectURL(new Blob(['var items = ' + absol.generateJSVariable(items)], { type: 'text/plain;charset=utf-8;' }))
    });

    var items_url = render({
        tag: 'a',
        props: { target: '__blank' },
        child: { text: 'view items' }
    });
    render('.break-page');

})();