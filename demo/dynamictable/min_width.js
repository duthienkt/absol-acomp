var _ = absol._;
var $ = absol.$;


var data = {
    //no header
    head: {
        rows: [
            {
                cells: [
                    { child: { text: "col1" } },
                    { child: { text: "col2" } },
                    { child: { text: "col3" } },
                    { child: { text: "col4" } },
                ]
            }
        ]
    },
    body: {
        rows: Array(200).fill(null).map((u, i) => {
            return {
                id: i + '',
                cells: [
                    {
                        child: { tag: 'span', child: { text: 'Cell 0 row ' + (i + 1) } }
                    },
                    {
                        child: { tag: 'span', child: { text: 'Cell 2 row ' + (i + 1) } }
                    },
                    {
                        child: { tag: 'span', child: { text: 'Cell 3 row ' + (i + 1) } }
                    },
                    {
                        child: { tag: 'span', child: { text: 'Cell 4 row ' + (i + 1) } }
                    }
                ]
            }
        })
    }
};

var tb = _({
    tag: 'dynamictable',
    style: {
        height: 'auto',
        minWidth: '800px'
    },
    props: {
        adapter: {
            data: data
        }
    }
}).addTo(document.body);

tb.viewIntoRow('100')
