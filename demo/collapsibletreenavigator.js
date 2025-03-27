function render(o) {
    return absol._(o).addTo(document.body);
}

var items =[
    {
        value: "over_due",
        text: "Quá hạn",
        color: "#F28B82",
        count: 0,
        items: [
            {
                value: 0,
                text: "Đề xuất đi"
            },
            {
                value: 0,
                text: "Đề xuất đến"
            }
        ]
    },
    {
        value: "waiting_approval",
        color: "#FBCDA4",
        text: "Chờ duyệt",
        count: 0,
        items: [
            {
                value: 0,
                text: "Đề xuất đi"
            },
            {
                value: 0,
                text: "Đề xuất đến"
            }
        ]
    },
    {
        value: "denied",
        color: "#D1C4E9",
        text: "Từ chối",
        count: 0,
        items: [
            {
                value: 0,
                text: "Đề xuất đi"
            },
            {
                value: 0,
                text: "Đề xuất đến"
            }
        ]
    },
    {
        value: "approved",
        color: "#A7E6A5",
        text: "Đã duyệt",
        count: 0,
        items: [
            {
                value: 0,
                text: "Đề xuất đi"
            },
            {
                value: 0,
                text: "Đề xuất đến"
            }
        ]
    },
    {
        value: "total_all",
        text: "Tổng số",
        count: 0,
        items: [
            {
                value: 0,
                text: "Đề xuất đi"
            },
            {
                value: undefined,
                text: "Đề xuất đến"
            },
            {
                value: undefined,
                text: "Người tham khảo"
            }
        ],
        color: "null"
    },
    {
        value: "draft",
        text: "Nháp",
        count: 0,
        color: "null"
    },
    {
        value: "group",
        text: "Nhóm",
        items: [
            {
                value: "group_9",
                text: "Đi muộn về sớm",
                count: 0,
                items: []
            },
            {
                value: "group_5",
                text: "Khác",
                count: 0,
                items: []
            },
            {
                value: "group_3",
                text: "Nghỉ ngày",
                count: 0,
                items: [
                    {
                        value: "group_7",
                        text: "Nghỉ không lương",
                        count: 0,
                        items: []
                    },
                    {
                        value: "group_6",
                        text: "Nghỉ phép",
                        count: 0,
                        items: []
                    }
                ]
            },
            {
                value: "group_10",
                text: "Tạm ứng",
                count: 0,
                items: []
            },
            {
                value: "group_8",
                text: "Tăng ca",
                count: 0,
                items: []
            }
        ],
        initOpened: true,
        noSelect: true,
        color: "null"
    },
    {
        value: "label",
        id: "label",
        text: "Nhãn",
        items: [],
        initOpened: true,
        noSelect: true,
        actions: [
            {
                name: "label_config",
                icon: "span.mdi.mdi-cog-outline"
            }
        ],
        color: "null"
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

