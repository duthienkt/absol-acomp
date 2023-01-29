var tree = require('./demo_tree_list.js');
var count = 0;

function render(o) {
    return absol._(o).addTo(document.body);
}

render('<h2>apdater.type = "default" | Ø</h2>')

var searchInput = render({
    tag: 'searchtextinput',
    style: {
        margin: '5px'
    }
});

var table = render({
    tag: 'treetable',
    props: {
        searchInput: searchInput,
        adapter: {
            data: {
                initOpened: true,
                head: {
                    fixed: true,
                    rows: [
                        {
                            cells: [
                                {
                                    child: { text: 'Bộ phận/Nhân viên' }
                                },
                                {
                                    child: { text: "Giá trị" }
                                }
                            ]
                        }
                    ]
                },
                body: {
                    rows: tree.map(function visit(node) {
                        var _ = absol._;
                        var res = {
                            id: (count++) + ''
                        };
                        res.cells = [
                            {
                                innerText: node.text,
                                render: function (elt, cellData, controller) {
                                    _({
                                        elt: elt,
                                        child: [
                                            '.as-tree-table-toggle',
                                            { tag: 'span', child: { text: node.text } }
                                        ]
                                    })
                                }
                            },
                            {
                                innerText: node.value,
                                render: function (elt, cellData, controller) {
                                    _({
                                        elt: elt,
                                        child: [
                                            { tag: 'span', child: { text: node.value + '' } }
                                        ]
                                    });
                                }
                            }
                        ];
                        if (node.items) res.subRows = node.items.map(visit);
                        return res;
                    })

                }
            }
        }
    }
});

render({
    tag: 'tablevscroller',

    style: {
        height: '50vh',
    },
    child: table
});

render('<h2>adapter.type = "struct"</h2>');
var adapterData = {
    type: 'struct',
    propertyNames: ['text', 'value', 'starttime', 'endtime'],
    treeBy: 'text',
    propertyDescriptors: {
        text: {
            text: 'Tên',
            type: 'text'
        },
        value: {
            text: 'Định danh',
            type: 'number'
        },
        starttime: {
            text: 'Bắt đầu',
            type: 'Date'
        },
        endtime: {
            text: 'Kết thúc',
            type: 'Date'
        }
    },
    records: tree.map(function visit(it){
        var res = {
            text: it.text,
            value: it.value
        };
        var desc = (it.desc || '').split(/\s*-\s*/);
        if (desc.length > 0) {
            res.starttime = absol.datetime.parseDateTime(desc[0], 'dd/MM/yyyy');
            if (desc.length > 1) {
                res.endtime = absol.datetime.parseDateTime(desc[1], 'dd/MM/yyyy');
            }
        }
        if (it.items && it.items.length > 0) {
            res.__children__ = it.items.map(visit);
        }
        return res;
    })
};

render({
    tag: 'treetable',
    props: {
        adapter: adapterData
    }
});

console.log(tree)

