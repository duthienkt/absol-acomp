var _ = absol._;
var $ = absol.$;
var data =  Array(1e5).fill(null).map((u, i) => {
    return {
        cells: Array(7).fill(null).map((uu, j) => ({
            child: {
                text: absol.string.randomPhrase(150)
            },
            // o: o
        }))
    }
});

// setTimeout(function (){
//     data = null;
//     // o = null;
//     // console.log("delete")
// }, 100);

// return;
var table = _({
    tag: 'dynamictable',
    style: {
        tableLayout: 'fixed',
        height: '80vh'
    },
    props: {
        adapter: {
            data: {
                head: {
                    rows: [
                        {
                            cells: Array(7).fill(null).map((u, i) => ({
                                style: {
                                    width: '50px'
                                },
                                child: { text: 'col ' + i }
                            }))
                        }
                    ]
                },
                body: {
                    rows: data
                }
            }
        }
    }
}).addTo(document.body);


absol._({
    tag: 'flexiconbutton',
    props: {
        text: 'Clear'
    },
    on: {
        click: function () {
            table.remove();
            table = null;
            data = null;
        }
    }
}).addTo(document.body)