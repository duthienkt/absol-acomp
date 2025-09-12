
var _ = absol._;
var textInput = _({
    tag:'searchtextinput'
}).addTo(document.body);
var table = _({
    tag: 'table',
    class: 'as-table-new',
    child: {
        tag: 'tbody',
        child: Array(20).fill(0).map((u, i) => {
            var res = {
                tag: 'tr',
                child: Array(10).fill(0).map((u, j) => {
                    return {
                        tag: 'td',
                        child: {
                            text: `R${i}C${j}`
                        }
                    }
                })
            };
            if (i % 2 == 0) {
                res.child[0].attr = { rowspan: 2 };
            }
            else {
                res.child.shift();
            }

            return res;
        })
    }
}).addTo(document.body);

var searcher = new absol.RawTableSearcher(table,{ inputElt: textInput });

