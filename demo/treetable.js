var tree = require('./demo_tree_list.js');
console.log(tree)

var table = absol._({
    tag: 'treetable',
    props: {
        adapter: {
            data: {
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
                        var res = {};
                        res.cells = [
                            {
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