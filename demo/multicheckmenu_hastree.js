var _ = absol._;
var $ = absol.$;

/********************************************/

_('<h3>CheckListBox</h3>').addTo(document.body);
var bt1 = _({
    style: {
        border: '1px solid #ddd',
        minHeight: '30px',
        minWidth: '60px',
        marginBottom: '350px',
        width: '100px'
    }
}).addTo(document.body);

var items = Array(16000).fill(null).map(function (u, i) {
    return { text: `[${i}] ${absol.string.randomPhrase(30)}`, value: i, desc: absol.string.randomPhrase(20) };
});
var now = new Date().getTime();
var clb1 = _({
    tag: 'multicheckmenu',
    style: {
        '--max-height': '300px',
        width: '500px'
    },
    props: {
        enableSearch: true,
        values: [28, 29, 30]
    },
    on: {
        change: function (event) {
            console.log(this.values);
        },
        // submit: function () {
        //     bt1.innerHTML = this.values.join(', ');
        //     this.updatePosition();
        // }
    }
}).addTo(document.body);
absol.remoteNodeRequireAsync('demo_check_tree_menu_list.js').then(function (result) {
    clb1.items = result;
    setTimeout(() => {
        // clb1.values = [];
    }, 5000);
    setTimeout(() => {
        // clb1.values = result.reduce(function visit(ac, cr){
        //     ac.push(cr.value);
        //     if (cr.items) cr.items.reduce(visit, ac);
        //     return ac;
        // }, [])
    }, 4000);
});


clb1.followTarget = bt1;

var items2 = [
    {
        value: 9,
        text: "Đi muộn về sớmwww",
        noSelect: true,
        items: []
    },
    {
        value: 5,
        text: "Khác",
        noSelect: false,
        items: []
    },
    {
        value: -100,
        text: "Loại đề xuất",
        noSelect: false,
        items: [
            {
                value: -6,
                text: "Bảng kê",
                noSelect: false,
                items: []
            },
            {
                value: -3,
                text: "Đi muộn về sớm",
                noSelect: false,
                items: []
            },
            {
                value: -5,
                text: "Khác",
                noSelect: false,
                items: []
            },
            {
                value: -1,
                text: "Làm thêm",
                noSelect: false,
                items: []
            },
            {
                value: -2,
                text: "Nghỉ ngày",
                noSelect: false,
                items: []
            },
            {
                value: -7,
                text: "Nghỉ việc",
                noSelect: false,
                items: []
            },
            {
                value: -4,
                text: "Tạm ứng lương",
                noSelect: false,
                items: []
            }
        ]
    },
    {
        value: 3,
        text: "Nghỉ ngày111",
        noSelect: true,
        items: [
            {
                value: 7,
                text: "Nghỉ không lương",
                noSelect: false,
                items: []
            },
            {
                value: 6,
                text: "Nghỉ phép",
                noSelect: false,
                items: []
            }
        ]
    },
    {
        value: 11,
        text: "rrrrree",
        noSelect: false,
        items: []
    },
    {
        value: 10,
        text: "Tạm ứng",
        noSelect: false,
        items: []
    },
    {
        value: 8,
        text: "Tăng ca",
        noSelect: false,
        items: []
    }
];

absol._({
    tag: 'multicheckmenu',
    props: {
        items: items2,
        values: [-6]
    }
}).addTo(document.body);