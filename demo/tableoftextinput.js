var _ = absol._;
var localKey = 'tableoftextinput_saved_001';

function getDefault() {
    var headData = {
        rows: [{
            cells: [
                {
                    value: "CTTNHH ABC\nChi nhánh 1s\n----------------",
                    style: {
                        fontStyle: "italic"
                    }
                },
                {
                    value: "\nBÁO CÁO SỐ LIỆU",
                    style: {
                        fontWeight: "bold",
                        fontSize: 14,
                        textAlign: "center",
                        color: "#e64a19"
                    }
                },
                {
                    value: "  Kon Tum, 29/2/2024",
                    style: {
                        textAlign: "right"
                    }
                }
            ]
        }]
    };
    var footerData = {
        rows: [
            {
                cells: [
                    {
                        value: "Xác nhận\n\n\n\nNguyễn Văn B",
                        style: {
                            textAlign: "center"
                        }
                    },
                    {
                        value: "                               ",
                        style: {}
                    },
                    {
                        value: "Người lập báo cáo\n\n\n\nNguyễn Văn A",
                        style: {
                            textAlign: "center"
                        }
                    }
                ]
            }
        ]
    };
    return {
        head: headData,
        footer: footerData
    }
}

var data = JSON.parse(localStorage.getItem(localKey) || 'null') || getDefault();
_({
    tag: 'style',
    props: {
        innerHTML: ` .sclang-Program {
    font-family: Consolas, serif;
    white-space: pre-wrap;
    line-height: 1.5;
}
.sclang-keyword {
    color: #2C82FF;
}
.sclang-node {
    display: inline;
}
 .sclang-error {
    animation: 1s linear infinite condemned_blink_effect;
 }
 


@keyframes condemned_blink_effect {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: transparent;
  }
  51% {
     background-color: #f76868;
  }
  100% {
      background-color: #f76868;
  }
}
.sclang-CallExpression > .sclang-MemberExpression:first-child > .sclang-Identifier:last-child,
.sclang-CallExpression > .sclang-Identifier:first-child{
    color: #41a01b;
}

.sclang-StringLiteral {
color:#aadd00;
}

.sclang-NumericLiteral {
color:#00dddd;
}
`
    }
}).addTo(document.body)
_('<h3>header</h3>').addTo(document.body)
var headerInput = _({
    tag: 'tableoftextinput',
    class: 'as-size-a4',
    props: {
        data: data.head,
        maxCol: 3,
        minCol: 3
    },
    on: {
        change: function () {
            console.log(this.excelRichTextRows)
            save();
            view();
        }
    }
}).addTo(document.body);

_('<h3>footer</h3>').addTo(document.body);

var footerInput = _({
    tag: 'tableoftextinput',
    class: 'as-size-a4',
    props: {
        data: data.footer,
        maxCol: 5,
        minCol: 2
    },
    on: {
        change: function () {
            save();
            view();
        }
    }
}).addTo(document.body);

function save() {
    localStorage.setItem(localKey, JSON.stringify({
        footer: footerInput.data,
        head: headerInput.data
    }));
}

function view() {
    previewData.innerHTML = previewCode('headerInput.data = ' + absol.generateJSVariable(headerInput.data) + ';'
        + 'footerInput.data = ' + absol.generateJSVariable(footerInput.data) + ';');
}

function download() {
    var headerRows = headerInput.excelRichTextRows;
    var footerRows = footerInput.excelRichTextRows;

    var excelData = {
        sheets: [
            {
                name: "report",
                data: [
                    {
                        row: 1,
                        col: 0,
                        value: "Đầu kỳ"
                    },
                    {
                        row: 2,
                        col: 0,
                        value: "Tăng trong kỳ"
                    },
                    {
                        row: 3,
                        col: 0,
                        value: "Giảm trong kỳ"
                    },
                    {
                        row: 4,
                        col: 0,
                        value: "Cuối kỳ"
                    },
                    {
                        row: 1,
                        col: 1,
                        value: 394
                    },
                    {
                        row: 1,
                        col: 2,
                        value: 394
                    },
                    {
                        row: 2,
                        col: 1,
                        value: 0
                    },
                    {
                        row: 2,
                        col: 2,
                        value: 0
                    },
                    {
                        row: 3,
                        col: 1,
                        value: 0
                    },
                    {
                        row: 3,
                        col: 2,
                        value: 0
                    },
                    {
                        row: 4,
                        col: 1,
                        value: 394
                    },
                    {
                        row: 4,
                        col: 2,
                        value: 394
                    },
                    {
                        row: 0,
                        col: 0,
                        value: "",
                        bold: true,
                        backgroundcolor: "FFE2EFDA",
                        horizontal: "center",
                        vertical: "middle"
                    },
                    {
                        row: 0,
                        col: 1,
                        value: "Tháng 10",
                        bold: true,
                        backgroundcolor: "FFE2EFDA",
                        horizontal: "center",
                        vertical: "middle"
                    },
                    {
                        row: 0,
                        col: 2,
                        value: "Tổng",
                        bold: true,
                        backgroundcolor: "FFE2EFDA",
                        horizontal: "center",
                        vertical: "middle"
                    },

                ]
            }
        ]
    };

    excelData.sheets[0].data.forEach(cell => cell.row += headerRows.length + 2);//spacing: 2 rows

    headerRows.forEach((row, i) => {
        excelData.sheets[0].data.push(({
            row: i,
            col: 0,
            value: {
                richText: row
            }
        }))
    })
    var footerRowIdxOffset = excelData.sheets[0].data.reduce((ac, cr) => Math.max(ac, cr.row), 0) + 1;
    footerRows.forEach((row, i) => {
        excelData.sheets[0].data.push(({
            row: footerRowIdxOffset + i + 3, //spacing: 3 rows
            col: 0,
            value: {
                richText: row
            }
        }))
    })
    excel_module.writerWorkbook(excelData, 'abc.xlsx');

}


var resetBtn = _({
    tag: 'flexiconbutton',
    props: {
        text: 'Reset',
        icon: 'span.mdi.mdi-reload'
    },
    on: {
        click: function () {
            var data = getDefault();
            headerInput.data = data.head;
            footerInput.data = data.footer;
            view();
            save();
        }
    }
}).addTo(document.body);


var generateBtn = _({
    tag: 'flexiconbutton',
    props: {
        text: 'Export',
        icon: 'span.mdi.mdi-download'
    },
    on: {
        click: download
    }
}).addTo(document.body);


function previewCode(code) {
    var ist = absol.sclang.SCParser.parse(code, 'program');
    if (!ist.ast) return '';
    return absol.sclang.generateSCHighlightPreviewCode(ist.ast);
}

var previewData = _({
    tag: 'pre',
    style: {
        whiteSpace: 'pre-wrap'
    },

}).addTo(document.body);

view();