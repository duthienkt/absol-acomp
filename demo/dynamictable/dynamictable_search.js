var _ = absol._;
var $ = absol.$;

function render(o) {
    return _(o).addTo(document.body);
}

absol.remoteNodeRequireAsync('./table_sample_data.js').then((items) => {
    var bodyBound = document.body.getBoundingClientRect();
    document.body.style.setProperty('--view-height', bodyBound.height+'px');
    var searchInput = render('searchtextinput');
    var table = render({
        tag: 'dynamictable',
        style:{
            height: 'calc(90vh - 30px)',
            width: '100%'
        },
        props: {
            adapter: {
                data: {
                    head: {
                        rows:[
                            {
                                cells: [
                                    {
                                        child: { text: 'Tên' }
                                    },
                                    {
                                        child: { text: 'Địa chỉ' }
                                    }
                                ]
                            }
                        ]

                    },
                    body:{
                        rows: items.slice(0, 23).map(item=> ({
                            cells: item.map(text=>({
                                child:{text: text},
                                innerText: text
                            }))
                        }))
                    }
                }
            }
        }
    })
    table.attachSearchInput(searchInput);

    var div = render({
        style: {paddingLeft: '30px', paddingRight: '30px', width: '80%'},
        child: table
    });

});