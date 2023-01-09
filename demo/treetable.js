var tree = require('./demo_tree_list.js');
console.log(tree)
var count = 0;

var searchInput = absol._({
    tag: 'searchtextinput',
    style: {
        margin: '5px'
    }
}).addTo(document.body);

var table = absol._({
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

absol._({
    tag: 'tablevscroller',

    style: {
        height: '50vh',
    },
    child: table
}).addTo(document.body);