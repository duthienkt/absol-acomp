var _ = absol._;
var $ = absol.$;

function render(o) {
    return _(o).addTo(document.body);
}

absol.remoteNodeRequireAsync('./table_sample_data.js').then((items) => {
    var bodyBound = document.body.getBoundingClientRect();
    document.body.style.setProperty('--view-height', bodyBound.height + 'px');
    var searchInput = render('searchtextinput');
    var table = render({
        tag: 'dynamictable',
        style: {
            height: 'calc(90vh - 30px)',
            width: '100%'
        },
        props: {
            placeholder: true,
            adapter: {
                fixedCol: 2,
                data: {
                    head: {
                        rows: [
                            {
                                cells: [
                                    {
                                        id: 'i1',
                                        child: { text: 'Tên' }
                                    },
                                    {
                                        id: 'i2',
                                        child: { text: 'Địa chỉ' }
                                    },
                                    {
                                        id: 'i3',
                                        child: { text: 'col 1' }
                                    },
                                    {
                                        id: 'i4',
                                        child: { text: 'col 2' }
                                    },
                                    {
                                        id: 'i5',
                                        child: { text: 'col 3' }
                                    },
                                    {
                                        id: 'i6',
                                        child: { text: 'col 4' }
                                    }
                                ]
                            }
                        ]

                    },
                    body: {
                        rows: [],
                        rowsx: items.slice(0, 24).map((item, i) => {
                            var res = ({
                                cells: item.map(text => ({
                                    child: { text: text },
                                    innerText: text
                                }))
                            });
                            if (i % 2 == 0) res.cells[0].attr = { rowspan: 2 };
                            else {
                                res.cells.shift();
                            }
                            res.cells.push({
                                child: { text: `R${i}C4` }
                            });
                            res.cells.push({
                                child: { text: `R${i}C5` }
                            });

                            res.cells.push({
                                child: { text: `R${i}C6` }
                            });

                            res.cells.push({
                                child: { text: `R${i}C7` }
                            });

                            return res;
                        })
                    }
                }
            }
        }
    })
    table.attachSearchInput(searchInput);
    setTimeout(() => {
        console.log("tick")
        var width = 100 + Math.floor(Math.random() * 400) + 400;
        table.setColWidth('i1', width);
    }, 3000);

    var div = absol._({
        style: { paddingLeft: '30px', paddingRight: '30px', width: '80%', display: 'none' },
        child: table
    });

    setTimeout(() => {
        div.addTo(document.body);
        var btn = render({
            tag: 'flexiconbutton',
            props: {
                text: 'Hiển thị bảng',
            },
            on: {
                click: function () {
                    div.style.display = 'block';
                }
            }
        });
        document.body.insertBefore(btn, div);
        setTimeout(() => {
            btn.click();
        }, 100);
    }, 1000);



});