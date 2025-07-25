var _ = absol._;
var $ = absol.$;

function render(o) {
    return _(o).addTo(document.body);
}

render("<h2>Paging - Search - Sort</h2>");
//without optimize: 4040ms
var now = new Date().getTime();

function makeRowData(i, id) {
    var name = '[' + i + ']' + absol.string.randomPhrase(160).replace(/(^|\s)[a-z]/g, function (all) {
        return all.toUpperCase();
    });
    var sid = 'M' + absol.$.zeroPadding(Math.random() * 1e7 >> 0, 7);
    var clss = 'A' + (Math.floor(Math.random() * 7) + 1);
    var editBtn;
    var okBtn;
    var nameInput;
    var nameText;
    var checkbox;
    var removeBtn;
    var goodAt = ['Toán', 'Lý', 'Hoá', 'Văn', 'Sử', 'Địa', 'Anh Văn'].reduce(function (ac, x) {
        if (Math.random() < 0.2) ac.push(x);
        return ac;
    }, []);
    var score = 5 + Math.random() * 5;
    score = Math.floor(score * 100) / 100;

    var rowData = {
        id: id,
        attr: {},
        keys: {//for filter
            class: clss,
            goodAt: goodAt,
            score: score
        },
        on:{
          click: function () {
              console.log(arguments)
          }
        },
        cells: [
            {
                style: {
                    textAlign: 'center'
                },
                //for child: [checkbox]
                render: function (tdElt) {
                    checkbox = _({ tag: 'checkbox' });
                    tdElt.addChild(checkbox);
                }
            },
            {
                innerText: '',
                style: {
                    textAlign: 'center',
                    'vertical-align': 'middle',
                    width: '50px'
                },
                child: 'span.as-dt-row-index'
            },
            {
                innerText: sid,
                child: { text: sid }
            },
            {
                //for child: [nameInput, nameText]//data is itself
                innerText: name,
                someThingForRender: {},
                // style:{whiteSpace: 'nowrap'},
                render: function (tdElt, data, controller) {
                    nameInput = _({
                        tag: 'input',
                        attr: { type: 'text' },
                        style: {
                            display: 'none',
                            width: '300px'
                        },
                        on: {
                            change: function () {
                                data.innerText = this.value;//for quick search
                                name = this.value;
                                nameText.clearChild().addChild(_({ text: name }));
                            }
                        },
                        props: {
                            value: name
                        }
                    });
                    nameText = _({ tag: 'span', child: [{ text: name }] });
                    tdElt.addChild(nameInput);
                    tdElt.addChild(nameText);
                }
            },
            {
                innerText: clss,
                child: { text: clss }
            },
            {
                innerText: goodAt.join(', '),
                // style:{whiteSpace: 'nowrap'},

                child: { text: goodAt.join(', ') }
            },
            {
                innerText: score,
                child: { text: score.toFixed(2) + '' }
            },
            {
                innerText: '',
                style: { width: '90px' },
                //for child: [editBtn, okBtn],
                render: function (tdElt, data, cellController) {
                    editBtn = _({
                        tag: 'flexiconbutton',
                        style: { height: '25px' },
                        props: {
                            icon: 'span.mdi.mdi-account-edit-outline'
                        },
                        on: {
                            click: function () {
                                editBtn.addStyle('display', 'none');
                                nameText.addStyle('display', 'none');
                                okBtn.removeStyle('display');
                                var bound = nameInput.parentElement.getBoundingClientRect();
                                nameInput.removeStyle('display')
                                    .addStyle('max-width', bound.width - 30 + 'px');
                            }
                        }
                    });
                    okBtn = _({
                        tag: 'flexiconbutton',
                        style: { height: '25px', display: 'none' },
                        props: {
                            icon: 'span.mdi.mdi-check-all'
                        },
                        on: {
                            click: function () {
                                nameInput.addStyle('display', 'none');
                                okBtn.addStyle('display', 'none');
                                editBtn.removeStyle('display');
                                nameText.removeStyle('display');
                            }
                        }
                    });
                    tdElt.addChild(editBtn);
                    removeBtn = _({
                        tag: 'flexiconbutton',
                        style: { marginLeft: '5px', height: '25px' },
                        class: 'warning',
                        props: {
                            variant: 'delete',
                            icon: 'span.mdi.mdi-delete'
                        },
                        on: {
                            click: function () {
                                var row = table0.rowOf(rowData);
                                row.remove();
                            }
                        }
                    });
                    tdElt.addChild(removeBtn);
                    var qBtn = _({
                        tag: 'button',
                        child: 'span.mdi.mdi-menu'
                    });
                    tdElt.addChild(qBtn);

                    absol.QuickMenu.toggleWhenClick(qBtn, {
                        menuProps: {
                            items: [
                                { text: 'item 1' },
                                { text: 'item 1' },
                                { text: 'item 1' },
                                { text: 'item 1' }
                            ]
                        }
                    })


                }
            }

        ]
    };


    return rowData;
}

var addBtn1 = render({
    tag: 'flexiconbutton',
    style: { 'margin': '10px' },
    props: {
        text: 'addRowBefore(data, null)',
        icon: 'span.mdi.mdi-table-row-plus-before'
    },
    on: {
        click: function () {
            var i = table0.adapter.data.body.rows.length;
            var id = 'row_' + i;
            var newRowData = makeRowData(i, id);
            var newRow = table0.addRowBefore(newRowData, null);
            newRow.viewInto();
            //or
            // table0.viewIntoRow(id);
            // table0.viewIntoRow(newRowData);
            // table0.viewIntoRow(newRow);
            //
            //
        }
    }
});

var addBtn2 = render({
    tag: 'flexiconbutton',
    style: { 'margin': '10px' },
    props: {
        text: 'addRowBefore(data, id)',
        icon: 'span.mdi.mdi-table-row-plus-before'
    },
    on: {
        click: function () {
            var i = table0.adapter.data.body.rows.length;
            var id = 'row_' + i;
            var newRowData = makeRowData(i, id);
            var newRow = table0.addRowBefore(newRowData, 'row_5');
            newRow.viewInto();
        }
    }
});

var addBtn3 = render({
    tag: 'flexiconbutton',
    style: { 'margin': '10px' },
    props: {
        text: 'addRowBefore(data, rowData)',
        icon: 'span.mdi.mdi-table-row-plus-before'
    },
    on: {
        click: function () {
            var i = table0.adapter.data.body.rows.length;
            var id = 'row_' + i;
            var newRowData = makeRowData(i, id);
            var newRow = table0.addRowBefore(newRowData, table0.adapter.data.body.rows[5]);
            newRow.viewInto();
        }
    }
});

var addBtn4 = render({
    tag: 'flexiconbutton',
    style: { 'margin': '10px' },
    props: {
        text: 'addRowBefore(data, rowObject)',
        icon: 'span.mdi.mdi-table-row-plus-before'
    },
    on: {
        click: function () {
            var i = table0.adapter.data.body.rows.length;
            var id = 'row_' + i;
            var newRowData = makeRowData(i, id);
            var newRow = table0.addRowBefore(newRowData, table0.rowAt(5));//table0.table.body.rows[5] is a DTBodyRow class
            newRow.viewInto();
        }
    }
});

var addBtn5 = render({
    tag: 'flexiconbutton',
    style: { 'margin': '10px' },
    props: {
        text: 'addRow(data)',
        icon: 'span.mdi.mdi-table-row-plus-after'
    },
    on: {
        click: function () {
            var i = table0.adapter.data.body.rows.length;
            var id = 'row_' + i;
            var newRowData = makeRowData(i, id);
            var newRow = table0.addRow(newRowData);
            newRow.viewInto();
        }
    }
});
var addBtn6 = render({
    tag: 'flexiconbutton',
    style: { 'margin': '10px' },
    props: {
        text: 'addRow(data, idx)',
        icon: 'span.mdi.mdi-table-row-plus-after'
    },
    on: {
        click: function () {
            var i = table0.adapter.data.body.rows.length;
            var id = 'row_' + i;
            var newRowData = makeRowData(i, id);
            var newRow = table0.addRow(newRowData, 20);
            newRow.viewInto();
        }
    }
});

var removeBtn0 = render({
    tag: 'flexiconbutton',
    style: { 'margin': '10px' },
    props: {
        text: 'row.remove()',
        icon: 'span.mdi.mdi-table-row-remove'
    },
    on: {
        click: function () {
            var row = table0.rowAt(2);
            row.remove();//
            //or table0.remove(row);
        }
    }
});

var removeBtn1 = render({
    tag: 'flexiconbutton',
    style: { 'margin': '10px' },
    props: {
        text: 'remove last row',
        icon: 'span.mdi.mdi-table-row-remove'
    },
    on: {
        click: function () {
            var rows = table0.getRows();//get row array without render
            var row = table0.requireRows(rows.length - 1)[0];//safety to get last row
            if (row)
                row.remove();
            //
            //or table0.remove(row);
        }
    }
});


var classFilter = _({
    tag: 'selectmenu',
    props: {
        items: ['all', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'].map(function (value) {
            return { text: value === 'all' ? 'Tất cả' : value, value: value }
        }),
        value: 'all',

    }
});


classFilter.exportFilter = function (filter) {
    if (this.value !== 'all') filter.class = this.value;
    //else don't filter by this
};

var goodAtFilter = _({
    tag: 'selectmenu',
    props: {
        items: ['none', 'Toán', 'Lý', 'Hoá', 'Văn', 'Sử', 'Địa', 'Anh Văn'].map(function (value) {
            return { text: value === 'none' ? 'Không xét' : value, value: value }
        }),
        value: 'none'

    }
});

goodAtFilter.exportFilter = function (filter) {
    if (this.value !== 'none') filter.goodAt = this.value;
    //else don't filter by this
};

var rankFilter = _({
    tag: 'selectmenu',
    props: {
        items: [['Tất cả', 0, 10], ['Trung Bình', 5, 7], ['Khá', 7, 8], ['Giỏi', 8, 9], ['Suất sắc', 9, 10]].map(function (value) {
            return {
                text: value[0],
                value: JSON.stringify({ min: value[1], max: value[2] - 1e-7 })
            }
        })
    }
});

rankFilter.exportFilter = function (filter) {
    filter.score = JSON.parse(this.value);
    if (filter.score.min === 0) {
        delete filter.score;
    }
}

render({
    style: { margin: '5px' },
    child: ['<label>Lớp: </label>', classFilter]
});
render({
    child: ['<label>Giỏi môn: </label>', goodAtFilter]
});

render({
    child: ['<label>Xếp loại: </label>', rankFilter]
});

var searchInput = render('searchtextinput')
    .addStyle('margin', '10px');

var stime = Date.now();
var table0 = render({
    tag: 'dynamictable',
    // id:'dt_000',
    style: {
        variant:'secondary',
        height: '500px',
        'min-width': '800px'
    },
    // class:'as-no-graphic',
    props: {
        filterInputs: [classFilter, goodAtFilter, rankFilter],
        adapter: {
            // rowsPerPage: 15,//default: 20
            fixedCol: 2,
            data: {
                head: {
                    rows: [
                        {
                            cells: [
                                { id: 'cb' },
                                { child: absol._({ text: "STT" }), idx: 'cb_1' },
                                {
                                    child: absol._({ text: "MSSV" }), id: 'cb_2',
                                    sortKey: ['class', 'score'],// hoặc "class;score" hoặc "class score", key không chứa dấu space
                                    sortMenu: {
                                        'class': ["Xếp lớp tăng dần", "Xếp lớp giảm dần"],
                                        'score': ["Xếp điểm tăng dần", "Xếp điểm giảm dần"]
                                    }
                                },
                                { child: { text: 'Tên' }, id: 'cb_3' },
                                {
                                    id: 'cb_4',
                                    child: { text: 'Lớp' },
                                    on: {
                                        someEvent: function (event) {

                                        }
                                    },
                                    sortKey: 'class'
                                },
                                {
                                    id: 'cb_5',
                                    child: { text: 'Giỏi', style: { width: '200px' } }
                                },
                                {
                                    id: 'cb_6',
                                    child: { text: 'Điểm TB' },
                                    sortKey: 'score'
                                },
                                {
                                    idx: 'cb_7',
                                }
                            ]
                        }
                    ]
                },
                body: {
                    rows: Array(0).fill(0).map(function (u, i) {
                        var id = 'row_' + i;
                        return makeRowData(i, id);
                    })
                }
            }
        }
    }
});
var rowCount = 300;

// var rowLoadingTK = table0.waitingCtl.begin();//to show loading in search input
function addRows() {
    var rowsData = Array(1000).fill(0).map(function (u, i) {
        rowCount++;
        return makeRowData(rowCount, 'row_' + rowCount);
    });
    table0.addRows(rowsData);
    if (rowCount < 100000) {
        setTimeout(addRows, 150);
    }
    else {
        document.body.classList.remove('loading');
        table0.waitingCtl.end(rowLoadingTK);
    }
}

// setTimeout(addRows, 800);
table0.attachSearchInput(searchInput)
console.log('render time', Date.now() - stime);


return;
render("<h2>Draggable</h2>");

function makeRowData1(i, id, draggable) {

    var name = absol.string.randomPhrase(30).replace(/(^|\s)[a-z]/g, function (all) {
        return all.toUpperCase();
    });
    var editBtn = _({
        tag: 'flexiconbutton',
        style: { height: '25px' },
        props: {
            icon: 'span.mdi.mdi-account-edit-outline'
        },
        on: {
            click: function () {
                editBtn.addStyle('display', 'none');
                nameText.addStyle('display', 'none');
                okBtn.removeStyle('display');
                var bound = nameInput.parentElement.getBoundingClientRect();
                nameInput.removeStyle('display')
                    .addStyle('max-width', bound.width - 30 + 'px');
            }
        }
    });
    var okBtn = _({
        tag: 'flexiconbutton',
        style: { height: '25px', display: 'none' },
        props: {
            icon: 'span.mdi.mdi-check-all'
        },
        on: {
            click: function () {
                nameInput.addStyle('display', 'none');
                okBtn.addStyle('display', 'none');
                editBtn.removeStyle('display');
                nameText.removeStyle('display');
            }
        }
    });
    var nameInput = _({
        tag: 'input',
        attr: { type: 'text' },
        style: {
            display: 'none',
            width: '300px'
        },
        on: {
            change: function () {
                name = this.value;
                nameText.clearChild().addChild(_({ text: name }));
            }
        },
        props: {
            value: name
        }
    });
    var nameText = _({ tag: 'span', child: [{ text: name }] });

    return {
        id: id,
        attr: {},
        cells: [
            {
                style: {
                    width: '30px',
                    textAlign: 'center',
                    fontSize: '25px'
                },
                class: draggable ? 'as-drag-zone' : [],
                render: function (cellElt) {
                    if (draggable)
                        cellElt.addChild(_('span.mdi.mdi-drag'))
                }
            },
            {
                style: {
                    textAlign: 'center',
                    width: '50px'
                },
                child: 'span.as-dt-row-index'
            },
            { child: { text: 'M' + absol.$.zeroPadding(Math.random() * 1e7 >> 0, 7) } },
            {
                child: [nameInput, nameText]
            },
            { child: { text: 'A' + Math.ceil(Math.random() * 7) } },
            {
                child: [editBtn, okBtn]
            }
        ],
        on: {
            orderchange: function (event) {//we can listen event in each row
                console.log('row listener', event);
            }
        }
    };
}

var addBtn7 = render({
    tag: 'flexiconbutton',
    style: { 'margin': '10px' },
    props: {
        text: 'addRowBefore(data, row_you_want_to)',
        icon: 'span.mdi.mdi-table-row-plus-before'
    },
    on: {
        click: function () {
            var rows = table1.requireRows();
            var bf = null;
            for (var j = rows.length - 1; j >= 0; --j) {
                if (rows[j].draggable) {
                    break;
                }
                else {
                    bf = rows[j];
                }
            }
            var i = table1.getRows().length;
            var id = 'row_' + i;
            var newRowData = makeRowData1(i, id, true);
            var newRow = table1.addRowBefore(newRowData, bf);
            newRow.viewInto();
            newRow.elt.scrollIntoView();
            //or
            // table0.viewIntoRow(id);
            // table0.viewIntoRow(newRowData);
            // table0.viewIntoRow(newRow);
            //
            //
        }
    }
});

var searchInput1 = render('searchtextinput')
    .addStyle('margin', '10px');
var table1 = render({
    tag: 'dynamictable',
    props: {
        adapter: {
            rowsPerPage: Infinity,//no paging
            data: {
                head: {
                    rows: [
                        {
                            cells: [
                                {},
                                { child: absol._({ text: "STT" }) },
                                { child: absol._({ text: "MSSV" }), id: 'stt' },
                                { child: { text: 'Tên' }, id: 'name' },
                                {
                                    id: 'class',
                                    child: { text: 'Lớp' },
                                    on: {
                                        someEvent: function (event) {

                                        }
                                    }
                                },
                                {}
                            ]
                        }
                    ]
                },
                body: {
                    rows: Array(100).fill(0).map(function (u, i) {
                        return makeRowData1(i + 1, 'row_' + i, i >= 5 && i <= 45);
                    })

                }
            }
        }
    },
    on: {
        orderchange: function (event) {
            console.log('table listener', event);
        }
    }
});
render({
    tag: 'tablevscroller',

    style: {
        height: '50vh',
        marginTop: '10px'
    },
    child: table1
});

