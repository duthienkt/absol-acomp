var _ = absol._;
var $ = absol.$;


var data = {
    //no header
    head: {
        rows: [
            {
                cells: [
                    { child: { text: "" } },
                    { child: { text: "Tên" } },
                    { child: { text: "Kiểu dữ liệu" } },
                    { child: { text: "Loại" } },
                    { child: { text: "Hoạt động" } },
                ]
            }
        ]
    },
    body: {
        rows: Array(64).fill().map((u, i) => {
            return {
                on:{
                  click: function (event, rowCtrl) {
                      console.log(rowCtrl.elt)
                  }
                },
                cells: [
                    {
                        child: { tag: 'span', child: { text: i + '' } }
                    },
                    { child: { text: absol.string.randomPhrase(30)} },
                    { child: { text: absol.string.randomPhrase(30) } },
                    { child: { text: absol.string.randomIdent(10) } },
                    { child: { tag:'switch', props:{checked: Math.random()>0.5} } },
                ]
            };

        })

    }
};

var tb = _({
    tag: 'dynamictable',
    style: {
        height: 'auto',
        minWidth: '800px'
    },
    props: {
        adapter: {
            data: data
        }
    }
}).addTo(document.body);

tb.viewIntoRow('100')
