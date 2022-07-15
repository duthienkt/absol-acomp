var _ = absol._;
var $ = absol.$;

function render(o) {
    return _(o).addTo(document.body);
}

render('<h2>Danh sách <strong>tag</strong></h2>');

var creators = absol.coreDom.creator;
var tags = Object.keys(creators);
var renderSpace = render({
    style: { display: 'none' }
})

var data = {
    head: {
        rows: [
            {
                cells: [
                    {
                        child: { text: 'tag' }
                    },
                    {
                        child: { text: 'props' }
                    },
                    {
                        child: { text: 'events' }
                    },
                    {
                        child: { text: 'Ví dụ mẫu' }
                    },
                    {
                        child: { text: 'Chú thích' }
                    },
                ]
            }
        ]
    },
    body: {
        rows: tags.map(tag => {
            var constructor = creators[tag];
            var propNames = Object.keys(constructor.property || {});
            var events = [];
            try {
                var elt = _({ tag: constructor }).addTo(renderSpace);
                events = Object.keys(elt._azar_extendEvents.supported);
                setTimeout(() => {
                    elt.selfRemove();
                }, 1000)
            } catch (e) {
            }

            return {
                cells: [
                    { child: { text: tag }, innerText: tag },
                    {
                        innerText:  propNames.join(' '),
                        child: { text: propNames.join(', ') }
                    },
                    {
                        innerText: events.join(' '),
                        child: { text: events.join(', ') }
                    },
                    {
                        render: function (cellElt) {
                            absol.FileSaver.fileExist('../demo/' + tag + '.html').then(result => {
                                if (result) {
                                    cellElt.addChild(_({
                                        tag: 'a',
                                        props: {
                                            href: '../demo/' + tag + '.html',
                                            target:'__blank'
                                        },
                                        child: {
                                            text: '../demo/' + tag + '.html'
                                        }
                                    }))
                                }
                            })
                        }
                    },
                    { child: { text: '' }, innerText: '' },
                ]
            };
        })
    }
}

var searchTagInput = render('searchtextinput').addStyle('margin', '0.5em');

var tagTable = render({
    tag: 'dynamictable',
    props: {
        adapter: {
            rowsPerPage: 17,
            data: data
        },
    },
});
tagTable.attachSearchInput(searchTagInput)

