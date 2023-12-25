var tree = require('../demo_tree_list.js');
var count = 0;

function render(o) {
    return absol._(o).addTo(document.body);
}

render('<h2>apdater.type = "default" | Ø</h2>')

var makeNodeData = (node, more) => {
    var _ = absol._;
    var res = {
        id: (count++) + ''
    };
    res.cells = [
        {
            render: function (elt, cellData, controller) {
                if ((!node.items || !node.items.length) && more) {
                    elt.addClass('as-drag-zone');
                    elt.addChild(_('span.mdi.mdi-drag'))
                }
            }
        },
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
    if (node.items) res.subRows = node.items.map(it=> makeNodeData(it, node.items.length> 1));
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
                                {},
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
    tag: 'tablevscroller',

    style: {
        height: '50vh',
    },
    child: table
});


