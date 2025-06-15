var tree = require('../demo_tree_list.js');
var count = 0;

function render(o) {
    return absol._(o).addTo(document.body);
}

render('<h2>apdater.type = "default" | Ø</h2>')

var makeNodeData = (node) => {
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
        },
        {
            child: [
                {
                    tag: 'flexiconbutton',
                    props: {
                        icon: 'span.mdi.mdi-delete',
                        text: 'Xóa'
                    },
                    on: {
                        click: () => {
                            table.removeRow(res);
                        }
                    }
                },
                {
                    tag: 'flexiconbutton',
                    style: {
                        marginLeft: '12px'
                    },
                    props: {
                        icon: 'span.mdi.mdi-file-replace-outline',
                        text: 'Thay thế'
                    },
                    on: {
                        click: () => {
                            table.replaceRow(makeNodeData(Object.assign({}, node, { text: node.text + ' xxx ' })), res);
                        }
                    }
                },
                {
                    tag: 'flexiconbutton',
                    style: {
                        marginLeft: '12px'
                    },
                    props: {
                        icon: 'span.mdi.mdi-plus',
                        text: 'Thêm node con'
                    },
                    on: {
                        click: () => {
                            table.addRowIn(makeNodeData(Object.assign({}, node, {
                                text: node.text + ' xxx ',
                                items: null
                            })), res);
                        }
                    }
                },
                {
                    tag: 'flexiconbutton',
                    style: {
                        marginLeft: '12px'
                    },
                    props: {
                        icon: 'span.mdi.mdi-plus',
                        text: 'Thêm node anh'
                    },
                    on: {
                        click: () => {
                            table.addRowBefore(makeNodeData(Object.assign({}, node, {
                                text: node.text + ' xxx ',
                                items: null
                            })), res);
                        }
                    }
                },
                {
                    tag: 'flexiconbutton',
                    style: {
                        marginLeft: '12px'
                    },
                    props: {
                        icon: 'span.mdi.mdi-plus',
                        text: 'Thêm node em'
                    },
                    on: {
                        click: () => {
                            table.addRowAfter(makeNodeData(Object.assign({}, node, {
                                text: node.text + ' yyy ',
                                items: null
                            })), res);
                        }
                    }
                },

            ]
        }
    ];
    if (node.items) res.subRows = node.items.map(makeNodeData);
    return res;
}

var searchInput = render({
    tag: 'searchtextinput',
    style: {
        margin: '5px'
    }
});
var addRowBtn = render({
    tag: 'flexiconbutton',
    props: {
        text: 'Thêm dòng'
    },
    on: {
        click: function () {
            var node = { text: 'Dòng mới', value: Math.random() };
            table.addRowIn(makeNodeData(node), null)
        }
    }
});
var table = render({
    tag: 'treetable',
    style:{
        whiteSpace: 'nowrap',
    },
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
                                },
                                {
                                    child: { text: 'Hành động' }
                                }
                            ]
                        }
                    ]
                },
                body: {
                    rows: tree.map(makeNodeData)
                }
            }
        }
    }
});

render({
    tag: 'tablescroller',
    style: {
        maxHeight: '50vh',
        width: '90vw'
    },
    props:{
        fixedCol: 1
    },
    child: table
});

render('<h2>adapter.type = "struct"</h2>');


var adapterData = {
    type: 'struct',
    propertyNames: ['text', 'value', 'class', 'class2', 'starttime',  'perform'],
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
        },
        class: {
            text: 'Phân loại',
            type: 'enum',
            items: [
                { text: 'Không', value: 0 },
                { text: 'Một', value: 1 },
                { text: 'Hai', value: 2 },
                { text: 'Ba', value: 3 },
            ]
        },
        class2: {
            text: 'Phân loại 2',
            type: '{enum}',
            items: [
                { text: 'Không', value: 0 },
                { text: 'Một', value: 1 },
                { text: 'Hai', value: 2 },
                { text: 'Ba', value: 3 },
            ]
        },
        perform: {
            text: 'Hiệu năng',
            type: 'performance',
            extend: 0.3,// độ dài thanh màu tối đa gấp (1 + 0.3) lần 100%, mặc định là 0.5
            // colorMapping:'performance', mặc định
            //hoặc
            'colorMapping': [
                { value: 0, color: 'red' },//x < 0.5
                { value: 0.5, color: 'orange' },//0.5 <= x < 1
                { value: 1, color: 'green' },// 1 <= x < 1.2
                { value: 1.2, color: 'blue' }// 1.2 <= x
            ],
        }
    },
    records: tree.map(function visit(it) {
        var res = {
            text: it.text,
            value: it.value,
            perform: Math.random() * 2,
            class: Math.random() * 4 << 0,
            class2: [Math.random() * 4 << 0, Math.random() * 4 << 0]
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
    tag:'flexiconbutton',
    props:{
        text:'In pdf',
        icon:'span.mdi.mdi-print'
    },
    on:{
        click: function (){
            absol.printer.downloadAsPDF(table2, 'table.pdf');
        }
    }
});

var table2 = render({
    tag: 'treetable',
    props: {
        adapter: adapterData
    }
});

console.log(tree)

