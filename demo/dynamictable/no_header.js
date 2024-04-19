var _ = absol._;
var $ = absol.$;


var data = {
    //no header
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
    style:{
      height:'80vh'
    },
    props: {
        adapter: {
            data: data
        }
    }
}).addTo(document.body);

tb.viewIntoRow('100')
