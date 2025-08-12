var data = require('./test_data');
var _ = absol._;
var $ = absol.$;


var table = _({
    tag: 'dynamictable',
    style:{
        height:'90vh'
    },
    props: {
        adapter: {
            data: data
        }
    }
}).addTo(document.body);


function crawData(data) {
    var res = {};

    function copyCell(cell) {
        var r1 = Object.assign({}, cell);
        if (r1.render) {
            delete r1.render;
            r1.child = {
                text: cell.innerText || ''
            };
            return r1;
        }
        if (r1.child && r1.child.nodeType === Node.TEXT_NODE) {
            r1.child = {
                text: r1.child.data
            };
        }
        else if (r1.child && r1.child.outerHTML) {
            r1.child = r1.child.outerHTML;
        }
        return r1;
    }

    res.head = {
        rows: data.head.rows.map(function (row) {
            return {
                cells: row.cells.map(function (cell) {
                    return copyCell(cell);
                })
            }
        })
    };
    res.body = {
        rows: data.body.rows.map(function (row) {
            return {
                id: row.id,
                cells: row.cells.map(function (cell) {
                    return copyCell(cell);
                })
            }
        })
    };


    var text = 'module.exports = ' + absol.generateJSVariable(res);
    absol.FileSaver.saveTextAs(text, 'data.js');
}