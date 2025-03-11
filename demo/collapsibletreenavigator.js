function render(o) {
    return absol._(o).addTo(document.body);
}

var items = [
    {
        text: 'Tất cả',
        value: 'all',
        icon: 'span.mdi.folder-multiple',
        testRaw: 123
    },
    {
        text: 'Đã nhận',
        count: 5,
        value: 'received'
    },
    {
        text: 'Đã gởi',
        value: 'sent'
    },
    {
        text: 'Lưu tạm',
        count: 4,
        value: 'draft'

    },
    {
        text: "No Select",
        value: 'no_click',
        noSelect: true
    },
    {
        text: 'Nhóm',
        actions: [
            { name: "option", icon: 'span.mdi.mdi-cog-outline' },
        ],
        // initOpened: true,
        items: [
            {
                text: 'Nhãn mẹ',
                value: 'parent_stamp',
                items: [
                    {
                        text: 'Nhãn con',
                        count: 1,
                        value: 'child_stamp'
                    }
                ]
            },
            {
                text: 'Marketing',
                value: 'marketing',
                items: [
                    {
                        text: 'Nhãn con',
                        count: 1,
                        value: 'child_stamp'
                    }
                ]
            }

        ]
    },
    {
        text: 'Nhãn',
        value: 'stamp',
        initOpened: true,//nếu muốn khởi tạo tự mở
        items: [
            { text: 'item 1' },
            { text: 'item 2' },
            { text: 'item 3' },
            { text: 'item 4' },
        ]
    },
    {
        text: 'Nhãn 2',
        value: 'stamp_2',
        items: [
            { text: 'item 1' },
            { text: 'item 2' },
            { text: 'item 3' },
            { text: 'item 4' },
        ]
    }
];

render('<h3>block(default)</h3>')
window.navigator1 = render({
    tag: 'CollapsibleTreeNavigator'.toLowerCase(),
    style: {},
    props: {
        value: 'child_stamp',// tự động mở nếu con của group được chọn
        items: items

    },
    on: {
        change: function (event) {
            console.log('change')
            absol.require('snackbar').show(`this.value=${this.value}`);
            console.log(event.data, event.value);
        },
        action: function (event) {
            console.log('action', event.action, event.data);
        }
    }
})

render('<h3>inline-block</h3>')

window.navigator2 = render({
    tag: 'CollapsibleTreeNavigator'.toLowerCase(),
    style: {
        display: 'inline-block',
    },
    props: {
        value: 'child_stamp',// tự động mở nếu con của group được chọn
        items: items

    },
    on: {
        change: function (event) {
            console.log('change')
            absol.require('snackbar').show(`this.value=${this.value}`);
            console.log(event.data, event.value);
        }
    }
});