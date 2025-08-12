var _ = absol._;
var $ = absol.$;

var cache = [];
var n = 1e5;
var adapter = {
    data: {
        head: {
            rows: [
                {
                    cells: [
                        {
                            style:{maxWidth: '40px'},
                            child: { text: 'STT' }, id: 'STT'
                        },
                        {
                            style: {width: '50px'},
                            child: { text: 'Hoàn thành' }, id: 'done'
                        },
                        {
                            style: {width: '50px'},

                            child: { text: 'Tên' }, id: 'name'
                        },
                        {
                            style: {width: '50px'},
                            child: { text: 'Kết thúc' }, id: 'finish'
                        },
                        {
                            style: {
                                maxWidth: '40px'
                            },
                            id: 'setting',
                            child: 'span.bsc-icon-hover-black.mdi.mdi-table-settings'
                        }
                    ]
                }
            ]
        },
        body: {
            getLength: function () {
                console.log('getLength', n)
                return Promise.resolve(n);
            },
            getRowAt: function (i) {
                cache[i] = cache[i] || Promise.resolve({
                    stt: i,
                    completed: ((i * 3) % 7) || ((i * 17) % 13),
                    name: absol.string.randomPhrase(90)
                });
                return cache[i]
            },
            rowTemplate: {
                on:{
                  click: function (event, controller) {
                      console.log(event, controller);
                  }
                },
                cells: [
                    {
                        child: 'span.as-dt-row-index',
                    },
                    {
                        render: function (elt, data, controller) {//data from getRowAt
                            elt.addChild(absol._(
                                data.completed % 2 ? 'span.mdi.mdi-check' : 'span'
                            ));
                        }
                    },
                    {
                        render: function (elt, data, controller) {
                            elt.addChild(absol._({
                                text: '' + data.name
                            }));
                        }
                    }, {
                        render: function (elt, data, controller) {//data from getRowAt
                            elt.addChild(absol._(
                                (data.completed % 2 && !(data.completed % 3)) ? 'span.mdi.mdi-check' : 'span'
                            ));
                        }
                    },
                    {
                        style: {
                            textAlign: 'center'
                        },
                        render: function (elt, data, controller) {
                            var button = absol._({
                                tag: 'button',
                                class: 'as-transparent-button',
                                child: 'span.mdi.mdi-dots-vertical'
                            });

                            absol.QuickMenu.toggleWhenClick(button, {
                                menuProps: {
                                    items: [
                                        {
                                            text: 'Xóa',
                                            icon: 'span.mdi.mdi-delete-empty-outline',
                                            cmd: 'delete'
                                        },
                                        {
                                            text: 'Sửa',
                                            icon: 'span.mdi.mdi-square-edit-outline',
                                            cmd: 'modify'
                                        },
                                        {
                                            text: 'Thêm phía trươớc',
                                            icon: 'span.mdi.mdi-square-edit-outline',
                                            cmd: 'add_before'
                                        }
                                    ]
                                },
                                onSelect: (item) => {
                                    if (item.cmd === 'delete') {
                                        cache.splice(controller.row.rowIdx, 1);
                                        n--;//remove in your data before remove controller, the datasheet will be reload
                                        controller.row.notifyRemove();//just notify remove this row
                                    }
                                    else if (item.cmd === 'modify') {
                                        cache[controller.row.idx].then(obj => {
                                            obj.name = 'Modified:' + obj.name;
                                            controller.row.notifyModified();//just notify remove this row
                                        })
                                    }
                                    else if (item.cmd === 'add_before') {
                                        cache.splice(controller.row.idx, 0, Promise.resolve({
                                            completed: Math.random() < 0.5,
                                            name: '[new ]' + absol.string.randomPhrase(90)
                                        }));
                                        n++;
                                        table.notifyAddRowAt(controller.row.idx)
                                    }
                                }
                            });
                            elt.addChild(button);
                        }
                    }
                ]
            }
        }
    }
};


var sizeBar = _({
    child: Array(5).fill(0).map((u, i) => {
        var label = _({
            tag: 'label',
            child: { text: 'col ' + (i + 1) + ' ' }
        })
        var input = _({
            tag: 'numberinput',
            style: {
                marginRight: '10px',
                width: '150px'
            },
            on: {
                change: function () {
                    table.setColWidth(i, input.value)
                }
            }
        });

        var checkbox = _({
            tag: 'checkbox',
            props: {
                text: 'auto'
            },
            on: {
                change: function () {
                    if (checkbox.checked) {
                        table.setColWidth(i, 'auto');
                        input.disabled = true;
                    }
                    else {
                        input.value = table.getColWidth(i, 'px');
                        table.setColWidth(i, input.value);
                        input.disabled = false;
                    }
                }
            }
        });


        return {
            style: {
                marginBottom: '10px'
            },
            child: [label, input, checkbox],
            props: {
                update: function () {
                    var value = table.getColWidth(i);
                    if (value === 'auto') {
                        checkbox.checked = true;
                        input.value = table.getColWidth(i, 'px');
                        input.disabled = true;
                    }
                    else {
                        checkbox.checked = false;
                        input.value = value;
                    }
                }
            }
        };
    })
}).addTo(document.body);

var table = absol._({
    tag: 'efficienttable',
    style: {
        width: '100%'
    },
    props: {
        adapter: adapter
    }
}).addTo(document.body);

setTimeout(() => {
    Array.prototype.forEach.call(sizeBar.childNodes, elt => {
        elt.update();
    })
}, 500)




