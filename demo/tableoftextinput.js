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
                cellWidthData: [
                    {
                        value: "40px"
                    },
                    {
                        value: "200px"
                    },
                    {
                        value: "200px"
                    },
                    {
                        value: "200px"
                    },
                    {
                        value: "200px"
                    }
                ],
                data: [
                    {
                        row: 3,
                        col: 0,
                        value: "Stt",
                        bold: true,
                        backgroundcolor: "FFE2EFDA",
                        horizontal: "center",
                        vertical: "middle"
                    },
                    {
                        row: 3,
                        col: 1,
                        value: "Tên",
                        bold: true,
                        backgroundcolor: "FFE2EFDA",
                        horizontal: "center",
                        vertical: "middle"
                    },
                    {
                        row: 3,
                        col: 2,
                        value: "Bộ phận",
                        bold: true,
                        backgroundcolor: "FFE2EFDA",
                        horizontal: "center",
                        vertical: "middle"
                    },
                    {
                        row: 3,
                        col: 3,
                        value: "Chức danh",
                        bold: true,
                        backgroundcolor: "FFE2EFDA",
                        horizontal: "center",
                        vertical: "middle"
                    },
                    {
                        row: 3,
                        col: 4,
                        value: "Giới tính",
                        bold: true,
                        backgroundcolor: "FFE2EFDA",
                        horizontal: "center",
                        vertical: "middle"
                    },
                    {
                        row: 4,
                        col: 0,
                        rowSpan: 1,
                        value: 1,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 4,
                        col: 1,
                        value: "admin",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 4,
                        col: 2,
                        value: "Bộ phận Test",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 4,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 4,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 5,
                        col: 0,
                        rowSpan: 1,
                        value: 2,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 5,
                        col: 1,
                        value: "Bàn Phúc Chu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 5,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 5,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 5,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 6,
                        col: 0,
                        rowSpan: 1,
                        value: 3,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 6,
                        col: 1,
                        value: "Bành Thị Hạnh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 6,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 6,
                        col: 3,
                        value: "Nhân viên xử lý đơn hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 6,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 7,
                        col: 0,
                        rowSpan: 1,
                        value: 4,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 7,
                        col: 1,
                        value: "bbbbbb",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 7,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 7,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 7,
                        col: 4,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        row: 8,
                        col: 0,
                        rowSpan: 1,
                        value: 5,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 8,
                        col: 1,
                        value: "Biện Tấn Bình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 8,
                        col: 2,
                        value: "Phân xưởng 3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 8,
                        col: 3,
                        value: "Đốc công",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 8,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 9,
                        col: 0,
                        rowSpan: 1,
                        value: 6,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 9,
                        col: 1,
                        value: "Bùi Hải Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 9,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 9,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 9,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 10,
                        col: 0,
                        rowSpan: 1,
                        value: 7,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 10,
                        col: 1,
                        value: "Bùi Hữu Đại",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 10,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 10,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 10,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 11,
                        col: 0,
                        rowSpan: 1,
                        value: 8,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 11,
                        col: 1,
                        value: "Bùi Kim Tuyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 11,
                        col: 2,
                        value: "Kho nguyên liệu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 11,
                        col: 3,
                        value: "Nhân viên lái xe nâng XSX",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 11,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 12,
                        col: 0,
                        rowSpan: 1,
                        value: 9,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 12,
                        col: 1,
                        value: "Bùi Ngọc Nhân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 12,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 12,
                        col: 3,
                        value: "Phó Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 12,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 13,
                        col: 0,
                        rowSpan: 1,
                        value: 10,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 13,
                        col: 1,
                        value: "Bùi Quang Bảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 13,
                        col: 2,
                        value: "DVKH Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 13,
                        col: 3,
                        value: "Nhân viên thống kê dịch vụ khách hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 13,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 14,
                        col: 0,
                        rowSpan: 1,
                        value: 11,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 14,
                        col: 1,
                        value: "Bùi Thanh Bình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 14,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 14,
                        col: 3,
                        value: "Nhân viên vận hành máy trộn PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 14,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 15,
                        col: 0,
                        rowSpan: 1,
                        value: 12,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 15,
                        col: 1,
                        value: "Bùi Thanh Chung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 15,
                        col: 2,
                        value: "Miền Trung 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 15,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 15,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 16,
                        col: 0,
                        rowSpan: 1,
                        value: 13,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 16,
                        col: 1,
                        value: "Bùi Thanh Tùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 16,
                        col: 2,
                        value: "Tổ QLCL Ca 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 16,
                        col: 3,
                        value: "Nhân viên QLCL Ca",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 16,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 17,
                        col: 0,
                        rowSpan: 1,
                        value: 14,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 17,
                        col: 1,
                        value: "Bùi Thị Ngọc Tín",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 17,
                        col: 2,
                        value: "Lâm Đồng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 17,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 17,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 18,
                        col: 0,
                        rowSpan: 1,
                        value: 15,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 18,
                        col: 1,
                        value: "Bùi Thị Phương Kiều",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 18,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 18,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 18,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 19,
                        col: 0,
                        rowSpan: 1,
                        value: 16,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 19,
                        col: 1,
                        value: "Bùi Trọng Thắng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 19,
                        col: 2,
                        value: "Gia Lai",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 19,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 19,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 20,
                        col: 0,
                        rowSpan: 1,
                        value: 17,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 20,
                        col: 1,
                        value: "Bùi Văn Cường",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 20,
                        col: 2,
                        value: "HCM3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 20,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 20,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 21,
                        col: 0,
                        rowSpan: 1,
                        value: 18,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 21,
                        col: 1,
                        value: "Bùi Văn Cường 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 21,
                        col: 2,
                        value: "HCM4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 21,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 21,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 22,
                        col: 0,
                        rowSpan: 1,
                        value: 19,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 22,
                        col: 1,
                        value: "Bùi Văn Huấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 22,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 22,
                        col: 3,
                        value: "Giám sát kho",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 22,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 23,
                        col: 0,
                        rowSpan: 1,
                        value: 20,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 23,
                        col: 1,
                        value: "Bùi Văn Thừa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 23,
                        col: 2,
                        value: "Kho nguyên liệu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 23,
                        col: 3,
                        value: "Nhân viên lái xe nâng XSX",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 23,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 24,
                        col: 0,
                        rowSpan: 1,
                        value: 21,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 24,
                        col: 1,
                        value: "Cấn Nguyễn Thảo Nguyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 24,
                        col: 2,
                        value: "Bộ phận QA",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 24,
                        col: 3,
                        value: "Nhân viên QLCL hành chính 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 24,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 25,
                        col: 0,
                        rowSpan: 1,
                        value: 22,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 25,
                        col: 1,
                        value: "Cao Văn Tình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 25,
                        col: 2,
                        value: "Bộ phận QA",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 25,
                        col: 3,
                        value: "Nhân viên QLCL hành chính 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 25,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 26,
                        col: 0,
                        rowSpan: 1,
                        value: 23,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 26,
                        col: 1,
                        value: "ccccc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 26,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 26,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 26,
                        col: 4,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        row: 27,
                        col: 0,
                        rowSpan: 1,
                        value: 24,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 27,
                        col: 1,
                        value: "Châu Minh Tính",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 27,
                        col: 2,
                        value: "Tổ nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 27,
                        col: 3,
                        value: "Nhân viên nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 27,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 28,
                        col: 0,
                        rowSpan: 1,
                        value: 25,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 28,
                        col: 1,
                        value: "Châu Minh Trung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 28,
                        col: 2,
                        value: "Tổ nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 28,
                        col: 3,
                        value: "Nhân viên nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 28,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 29,
                        col: 0,
                        rowSpan: 1,
                        value: 26,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 29,
                        col: 1,
                        value: "Chế Quốc Bảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 29,
                        col: 2,
                        value: "Khối kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 29,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 29,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 30,
                        col: 0,
                        rowSpan: 1,
                        value: 27,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 30,
                        col: 1,
                        value: "Đặng Công Minh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 30,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 30,
                        col: 3,
                        value: "Phó Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 30,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 31,
                        col: 0,
                        rowSpan: 1,
                        value: 28,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 31,
                        col: 1,
                        value: "Đặng Ngọc Tươi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 31,
                        col: 2,
                        value: "BP Nhân sự Tiền lương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 31,
                        col: 3,
                        value: "Nhân viên nhân sự",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 31,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 32,
                        col: 0,
                        rowSpan: 1,
                        value: 29,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 32,
                        col: 1,
                        value: "Đặng Sỹ Trường",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 32,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 32,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 32,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 33,
                        col: 0,
                        rowSpan: 1,
                        value: 30,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 33,
                        col: 1,
                        value: "Đặng Tấn Truyền",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 33,
                        col: 2,
                        value: "Phòng thử nghiệm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 33,
                        col: 3,
                        value: "Nhân viên thử nghiệm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 33,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 34,
                        col: 0,
                        rowSpan: 1,
                        value: 31,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 34,
                        col: 1,
                        value: "Đặng Thế Nguyễn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 34,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 34,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 34,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 35,
                        col: 0,
                        rowSpan: 1,
                        value: 32,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 35,
                        col: 1,
                        value: "Đặng Thị Hồng Phương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 35,
                        col: 2,
                        value: "Phòng Kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 35,
                        col: 3,
                        value: "Thư ký kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 35,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 36,
                        col: 0,
                        rowSpan: 1,
                        value: 33,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 36,
                        col: 1,
                        value: "Đặng Thị Thương Hiền",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 36,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 36,
                        col: 3,
                        value: "Nhân viên xử lý đơn hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 36,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 37,
                        col: 0,
                        rowSpan: 1,
                        value: 34,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 37,
                        col: 1,
                        value: "Đặng Trần Hoàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 37,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 37,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 37,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 38,
                        col: 0,
                        rowSpan: 1,
                        value: 35,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 38,
                        col: 1,
                        value: "Đặng Văn Trung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 38,
                        col: 2,
                        value: "Huế",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 38,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 38,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 39,
                        col: 0,
                        rowSpan: 1,
                        value: 36,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 39,
                        col: 1,
                        value: "Danh Bạc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 39,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 39,
                        col: 3,
                        value: "Nhân viên xử lý phế PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 39,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 40,
                        col: 0,
                        rowSpan: 1,
                        value: 37,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 40,
                        col: 1,
                        value: "Danh Bảnh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 40,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 40,
                        col: 3,
                        value: "Nhân viên vận hành máy trộn PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 40,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 41,
                        col: 0,
                        rowSpan: 1,
                        value: 38,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 41,
                        col: 1,
                        value: "Danh Dịch",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 41,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 41,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 41,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 42,
                        col: 0,
                        rowSpan: 1,
                        value: 39,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 42,
                        col: 1,
                        value: "Danh Đời",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 42,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 42,
                        col: 3,
                        value: "Nhân viên xử lý phế PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 42,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 43,
                        col: 0,
                        rowSpan: 1,
                        value: 40,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 43,
                        col: 1,
                        value: "Danh Minh Trí",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 43,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 43,
                        col: 3,
                        value: "Nhân viên vận hành máy trộn PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 43,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 44,
                        col: 0,
                        rowSpan: 1,
                        value: 41,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 44,
                        col: 1,
                        value: "Danh Nhơn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 44,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 44,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 44,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 45,
                        col: 0,
                        rowSpan: 1,
                        value: 42,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 45,
                        col: 1,
                        value: "Danh Nhựa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 45,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 45,
                        col: 3,
                        value: "Nhân viên vận hành máy trộn PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 45,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 46,
                        col: 0,
                        rowSpan: 1,
                        value: 43,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 46,
                        col: 1,
                        value: "Danh Sóc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 46,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 46,
                        col: 3,
                        value: "Nhân viên vận hành máy trộn PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 46,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 47,
                        col: 0,
                        rowSpan: 1,
                        value: 44,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 47,
                        col: 1,
                        value: "Danh Tín",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 47,
                        col: 2,
                        value: "Vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 47,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 47,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 48,
                        col: 0,
                        rowSpan: 1,
                        value: 45,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 48,
                        col: 1,
                        value: "Danh Tô Na",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 48,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 48,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 48,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 49,
                        col: 0,
                        rowSpan: 1,
                        value: 46,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 49,
                        col: 1,
                        value: "Danh Tươi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 49,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 49,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 49,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 50,
                        col: 0,
                        rowSpan: 1,
                        value: 47,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 50,
                        col: 1,
                        value: "Danh Văn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 50,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 50,
                        col: 3,
                        value: "Nhân viên xử lý phế PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 50,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 51,
                        col: 0,
                        rowSpan: 1,
                        value: 48,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 51,
                        col: 1,
                        value: "Danh Vũ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 51,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 51,
                        col: 3,
                        value: "Nhân viên xử lý phế PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 51,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 52,
                        col: 0,
                        rowSpan: 1,
                        value: 49,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 52,
                        col: 1,
                        value: "Đào Ngọc Khang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 52,
                        col: 2,
                        value: "HCM2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 52,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 52,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 53,
                        col: 0,
                        rowSpan: 1,
                        value: 50,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 53,
                        col: 1,
                        value: "Đào Văn Tốt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 53,
                        col: 2,
                        value: "Ca sản xuất PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 53,
                        col: 3,
                        value: "Trưởng ca sản xuất PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 53,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 54,
                        col: 0,
                        rowSpan: 1,
                        value: 51,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 54,
                        col: 1,
                        value: "Điểu Líp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 54,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 54,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 54,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 55,
                        col: 0,
                        rowSpan: 1,
                        value: 52,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 55,
                        col: 1,
                        value: "Đinh Bạt Sơn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 55,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 55,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 55,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 56,
                        col: 0,
                        rowSpan: 1,
                        value: 53,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 56,
                        col: 1,
                        value: "Đinh Hữu Phúc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 56,
                        col: 2,
                        value: "Phòng thử nghiệm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 56,
                        col: 3,
                        value: "Nhân viên thử nghiệm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 56,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 57,
                        col: 0,
                        rowSpan: 1,
                        value: 54,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 57,
                        col: 1,
                        value: "Đinh Hữu Quang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 57,
                        col: 2,
                        value: "Tổ khuôn máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 57,
                        col: 3,
                        value: "Nhân viên khuôn máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 57,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 58,
                        col: 0,
                        rowSpan: 1,
                        value: 55,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 58,
                        col: 1,
                        value: "Đinh Quang Đăng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 58,
                        col: 2,
                        value: "DVKH Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 58,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 58,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 59,
                        col: 0,
                        rowSpan: 1,
                        value: 56,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 59,
                        col: 1,
                        value: "Đinh Quang Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 59,
                        col: 2,
                        value: "Phòng kinh doanh 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 59,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 59,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 60,
                        col: 0,
                        rowSpan: 1,
                        value: 57,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 60,
                        col: 1,
                        value: "Đinh Quang Việt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 60,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 60,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 60,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 61,
                        col: 0,
                        rowSpan: 1,
                        value: 58,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 61,
                        col: 1,
                        value: "Đinh Trung Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 61,
                        col: 2,
                        value: "Phòng kinh doanh 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 61,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 61,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 62,
                        col: 0,
                        rowSpan: 1,
                        value: 59,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 62,
                        col: 1,
                        value: "Đinh Trung Hiếu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 62,
                        col: 2,
                        value: "Vĩnh Long",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 62,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 62,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 63,
                        col: 0,
                        rowSpan: 1,
                        value: 60,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 63,
                        col: 1,
                        value: "Đinh Tuấn Duy",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 63,
                        col: 2,
                        value: "Bình Phước",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 63,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 63,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 64,
                        col: 0,
                        rowSpan: 1,
                        value: 61,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 64,
                        col: 1,
                        value: "Đinh Văn Tuấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 64,
                        col: 2,
                        value: "Đắk Nông",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 64,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 64,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 65,
                        col: 0,
                        rowSpan: 1,
                        value: 62,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 65,
                        col: 1,
                        value: "Đỗ Đức Đạt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 65,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 65,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 65,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 66,
                        col: 0,
                        rowSpan: 1,
                        value: 63,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 66,
                        col: 1,
                        value: "Đỗ Đức Thành",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 66,
                        col: 2,
                        value: "Kho nguyên liệu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 66,
                        col: 3,
                        value: "Thủ kho nguyên liệu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 66,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 67,
                        col: 0,
                        rowSpan: 1,
                        value: 64,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 67,
                        col: 1,
                        value: "Đỗ Hoài Nam",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 67,
                        col: 2,
                        value: "Tổ công nghệ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 67,
                        col: 3,
                        value: "Nhân viên công nghệ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 67,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 68,
                        col: 0,
                        rowSpan: 1,
                        value: 65,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 68,
                        col: 1,
                        value: "Đỗ Minh Nhựt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 68,
                        col: 2,
                        value: "Phòng kinh doanh 3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 68,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 68,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 69,
                        col: 0,
                        rowSpan: 1,
                        value: 66,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 69,
                        col: 1,
                        value: "Đỗ Tấn Đại",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 69,
                        col: 2,
                        value: "Giám sát",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 69,
                        col: 3,
                        value: "Nhân viên giám sát ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 69,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 70,
                        col: 0,
                        rowSpan: 1,
                        value: 67,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 70,
                        col: 1,
                        value: "Đỗ Tấn Lộc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 70,
                        col: 2,
                        value: "Cần Thơ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 70,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 70,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 71,
                        col: 0,
                        rowSpan: 1,
                        value: 68,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 71,
                        col: 1,
                        value: "Đỗ Tất Việt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 71,
                        col: 2,
                        value: "BP Dịch vụ kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 71,
                        col: 3,
                        value: "Nhân viên kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 71,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 72,
                        col: 0,
                        rowSpan: 1,
                        value: 69,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 72,
                        col: 1,
                        value: "Đỗ Xuân Hanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 72,
                        col: 2,
                        value: "Đồng Nai",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 72,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 72,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 73,
                        col: 0,
                        rowSpan: 1,
                        value: 70,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 73,
                        col: 1,
                        value: "Đoàn Lê Anh Bảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 73,
                        col: 2,
                        value: "Phòng Kinh doanh 4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 73,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 73,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 74,
                        col: 0,
                        rowSpan: 1,
                        value: 71,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 74,
                        col: 1,
                        value: "Đồng Văn Tiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 74,
                        col: 2,
                        value: "Tổ QLCL Ca 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 74,
                        col: 3,
                        value: "Nhân viên QLCL Ca",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 74,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 75,
                        col: 0,
                        rowSpan: 1,
                        value: 72,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 75,
                        col: 1,
                        value: "Dư Thanh Hồng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 75,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 75,
                        col: 3,
                        value: "Nhân viên xử lý phế PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 75,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 76,
                        col: 0,
                        rowSpan: 1,
                        value: 73,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 76,
                        col: 1,
                        value: "Dương Đình Bình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 76,
                        col: 2,
                        value: "Phòng kinh doanh 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 76,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 76,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 77,
                        col: 0,
                        rowSpan: 1,
                        value: 74,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 77,
                        col: 1,
                        value: "Dương Đức Minh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 77,
                        col: 2,
                        value: "Tổ QLCL Hành chính",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 77,
                        col: 3,
                        value: "Nhân viên QLCL hành chính 4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 77,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 78,
                        col: 0,
                        rowSpan: 1,
                        value: 75,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 78,
                        col: 1,
                        value: "Dương Minh Tiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 78,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 78,
                        col: 3,
                        value: "Công nhân tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 78,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 79,
                        col: 0,
                        rowSpan: 1,
                        value: 76,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 79,
                        col: 1,
                        value: "Dương Văn Đông",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 79,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 79,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 79,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 80,
                        col: 0,
                        rowSpan: 1,
                        value: 77,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 80,
                        col: 1,
                        value: "ggg",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 80,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 80,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 80,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 81,
                        col: 0,
                        rowSpan: 1,
                        value: 78,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 81,
                        col: 1,
                        value: "Giáp Văn Lợi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 81,
                        col: 2,
                        value: "Miền Đông 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 81,
                        col: 3,
                        value: "Quản lý vùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 81,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 82,
                        col: 0,
                        rowSpan: 1,
                        value: 79,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 82,
                        col: 1,
                        value: "h",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 82,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 82,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 82,
                        col: 4,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        row: 83,
                        col: 0,
                        rowSpan: 1,
                        value: 80,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 83,
                        col: 1,
                        value: "Hà Hoàng Phol",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 83,
                        col: 2,
                        value: "Tổ QLCL Ca 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 83,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 83,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 84,
                        col: 0,
                        rowSpan: 1,
                        value: 81,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 84,
                        col: 1,
                        value: "Hà Ngọc Viễn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 84,
                        col: 2,
                        value: "HCM2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 84,
                        col: 3,
                        value: "Quản lý vùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 84,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 85,
                        col: 0,
                        rowSpan: 1,
                        value: 82,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 85,
                        col: 1,
                        value: "Hà Văn Minh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 85,
                        col: 2,
                        value: "Vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 85,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 85,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 86,
                        col: 0,
                        rowSpan: 1,
                        value: 83,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 86,
                        col: 1,
                        value: "Hàn Quốc Thặng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 86,
                        col: 2,
                        value: "Tổ công nghệ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 86,
                        col: 3,
                        value: "Nhân viên công nghệ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 86,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 87,
                        col: 0,
                        rowSpan: 1,
                        value: 84,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 87,
                        col: 1,
                        value: "Hầu Gia Thành",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 87,
                        col: 2,
                        value: "Ninh Thuận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 87,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 87,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 88,
                        col: 0,
                        rowSpan: 1,
                        value: 85,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 88,
                        col: 1,
                        value: "hhh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 88,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 88,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 88,
                        col: 4,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        row: 89,
                        col: 0,
                        rowSpan: 1,
                        value: 86,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 89,
                        col: 1,
                        value: "Hieu Tester",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 89,
                        col: 2,
                        value: "Bộ phận Test",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 89,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 89,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 90,
                        col: 0,
                        rowSpan: 1,
                        value: 87,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 90,
                        col: 1,
                        value: "Hồ Anh Quốc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 90,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 90,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 90,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 91,
                        col: 0,
                        rowSpan: 1,
                        value: 88,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 91,
                        col: 1,
                        value: "Hồ Bảo Chánh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 91,
                        col: 2,
                        value: "Khánh Hòa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 91,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 91,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 92,
                        col: 0,
                        rowSpan: 1,
                        value: 89,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 92,
                        col: 1,
                        value: "Hồ Chí Linh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 92,
                        col: 2,
                        value: "Phòng kinh doanh 5",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 92,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 92,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 93,
                        col: 0,
                        rowSpan: 1,
                        value: 90,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 93,
                        col: 1,
                        value: "Hồ Hùng Việt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 93,
                        col: 2,
                        value: "HCM4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 93,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 93,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 94,
                        col: 0,
                        rowSpan: 1,
                        value: 91,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 94,
                        col: 1,
                        value: "Hồ Minh Quan",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 94,
                        col: 2,
                        value: "Miền Trung - Cao Nguyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 94,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 94,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 95,
                        col: 0,
                        rowSpan: 1,
                        value: 92,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 95,
                        col: 1,
                        value: "Hồ Nguyên Lâm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 95,
                        col: 2,
                        value: "Phòng thử nghiệm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 95,
                        col: 3,
                        value: "Nhân viên thử nghiệm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 95,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 96,
                        col: 0,
                        rowSpan: 1,
                        value: 93,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 96,
                        col: 1,
                        value: "Hồ Phi Hải",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 96,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 96,
                        col: 3,
                        value: "Tổng giám đốc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 96,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 97,
                        col: 0,
                        rowSpan: 1,
                        value: 94,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 97,
                        col: 1,
                        value: "Hồ Quốc Việt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 97,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 97,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 97,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 98,
                        col: 0,
                        rowSpan: 1,
                        value: 95,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 98,
                        col: 1,
                        value: "Hồ Sĩ Nhân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 98,
                        col: 2,
                        value: "Phòng Kế toán",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 98,
                        col: 3,
                        value: "Phó phòng Kế toán ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 98,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 99,
                        col: 0,
                        rowSpan: 1,
                        value: 96,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 99,
                        col: 1,
                        value: "Hồ Sỹ Toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 99,
                        col: 2,
                        value: "Tổ gia công lắp ráp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 99,
                        col: 3,
                        value: "Nhân viên gia công & lắp ráp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 99,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 100,
                        col: 0,
                        rowSpan: 1,
                        value: 97,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 100,
                        col: 1,
                        value: "Hồ Tấn Phúc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 100,
                        col: 2,
                        value: "Phòng kinh doanh 5",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 100,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 100,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 101,
                        col: 0,
                        rowSpan: 1,
                        value: 98,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 101,
                        col: 1,
                        value: "Hồ Thắng Lợi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 101,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 101,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 101,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 102,
                        col: 0,
                        rowSpan: 1,
                        value: 99,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 102,
                        col: 1,
                        value: "Hồ Tiến Dũng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 102,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 102,
                        col: 3,
                        value: "Công nhân tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 102,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 103,
                        col: 0,
                        rowSpan: 1,
                        value: 100,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 103,
                        col: 1,
                        value: "Hồ Văn Bình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 103,
                        col: 2,
                        value: "Cao Nguyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 103,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 103,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 104,
                        col: 0,
                        rowSpan: 1,
                        value: 101,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 104,
                        col: 1,
                        value: "Hồ Văn Hải",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 104,
                        col: 2,
                        value: "Ca sản xuất PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 104,
                        col: 3,
                        value: "Trưởng ca sản xuất PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 104,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 105,
                        col: 0,
                        rowSpan: 1,
                        value: 102,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 105,
                        col: 1,
                        value: "Hồ Văn Phương Bình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 105,
                        col: 2,
                        value: "Ca sản xuất PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 105,
                        col: 3,
                        value: "Trưởng ca sản xuất PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 105,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 106,
                        col: 0,
                        rowSpan: 1,
                        value: 103,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 106,
                        col: 1,
                        value: "Hoàng Mạnh Cường",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 106,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 106,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 106,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 107,
                        col: 0,
                        rowSpan: 1,
                        value: 104,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 107,
                        col: 1,
                        value: "Hoàng Minh Khang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 107,
                        col: 2,
                        value: "HCM2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 107,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 107,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 108,
                        col: 0,
                        rowSpan: 1,
                        value: 105,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 108,
                        col: 1,
                        value: "Hoàng Thế Yên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 108,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 108,
                        col: 3,
                        value: "Nhân viên lái xe",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 108,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 109,
                        col: 0,
                        rowSpan: 1,
                        value: 106,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 109,
                        col: 1,
                        value: "Hoàng Trọng Kim",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 109,
                        col: 2,
                        value: "Nhà máy sản xuất",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 109,
                        col: 3,
                        value: "Giám đốc sản xuất",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 109,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 110,
                        col: 0,
                        rowSpan: 1,
                        value: 107,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 110,
                        col: 1,
                        value: "Hoàng Văn Chức",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 110,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 110,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 110,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 111,
                        col: 0,
                        rowSpan: 1,
                        value: 108,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 111,
                        col: 1,
                        value: "Hoàng Văn Mạnh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 111,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 111,
                        col: 3,
                        value: "Tài xế xe nâng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 111,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 112,
                        col: 0,
                        rowSpan: 1,
                        value: 109,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 112,
                        col: 1,
                        value: "Hoàng Văn Ngọc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 112,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 112,
                        col: 3,
                        value: "Công nhân tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 112,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 113,
                        col: 0,
                        rowSpan: 1,
                        value: 110,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 113,
                        col: 1,
                        value: "Hoàng Văn Tuân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 113,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 113,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 113,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 114,
                        col: 0,
                        rowSpan: 1,
                        value: 111,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 114,
                        col: 1,
                        value: "Hoàng Việt Hà",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 114,
                        col: 2,
                        value: "Tổ nhập kho PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 114,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 114,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 115,
                        col: 0,
                        rowSpan: 1,
                        value: 112,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 115,
                        col: 1,
                        value: "Hứa Thái Trung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 115,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 115,
                        col: 3,
                        value: "Nhân viên thiết kế đồ họa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 115,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 116,
                        col: 0,
                        rowSpan: 1,
                        value: 113,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 116,
                        col: 1,
                        value: "Hướng Đăng Thông",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 116,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 116,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 116,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 117,
                        col: 0,
                        rowSpan: 1,
                        value: 114,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 117,
                        col: 1,
                        value: "Huỳnh Anh Dũng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 117,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 117,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 117,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 118,
                        col: 0,
                        rowSpan: 1,
                        value: 115,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 118,
                        col: 1,
                        value: "Huỳnh Châu Long",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 118,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 118,
                        col: 3,
                        value: "Nhân viên lái xe",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 118,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 119,
                        col: 0,
                        rowSpan: 1,
                        value: 116,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 119,
                        col: 1,
                        value: "Huỳnh Hoàng Lam",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 119,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 119,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 119,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 120,
                        col: 0,
                        rowSpan: 1,
                        value: 117,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 120,
                        col: 1,
                        value: "Huỳnh Minh Hiếu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 120,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 120,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 120,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 121,
                        col: 0,
                        rowSpan: 1,
                        value: 118,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 121,
                        col: 1,
                        value: "Huỳnh Minh Tiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 121,
                        col: 2,
                        value: "Phòng Kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 121,
                        col: 3,
                        value: "Chuyên viên khuôn mẫu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 121,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 122,
                        col: 0,
                        rowSpan: 1,
                        value: 119,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 122,
                        col: 1,
                        value: "Huỳnh Tấn Hiệp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 122,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 122,
                        col: 3,
                        value: "Công nhân tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 122,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 123,
                        col: 0,
                        rowSpan: 1,
                        value: 120,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 123,
                        col: 1,
                        value: "Huỳnh Thanh Hùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 123,
                        col: 2,
                        value: "Vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 123,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 123,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 124,
                        col: 0,
                        rowSpan: 1,
                        value: 121,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 124,
                        col: 1,
                        value: "Huỳnh Thanh Luân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 124,
                        col: 2,
                        value: "Tổ QLCL Hành chính",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 124,
                        col: 3,
                        value: "Tổ trưởng QLCL hành chính",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 124,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 125,
                        col: 0,
                        rowSpan: 1,
                        value: 122,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 125,
                        col: 1,
                        value: "Huỳnh Thị Thanh Trang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 125,
                        col: 2,
                        value: "Thống kê PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 125,
                        col: 3,
                        value: "Nhân viên thống kê PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 125,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 126,
                        col: 0,
                        rowSpan: 1,
                        value: 123,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 126,
                        col: 1,
                        value: "Huỳnh Thị Thương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 126,
                        col: 2,
                        value: "Ban ISO",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 126,
                        col: 3,
                        value: "Thư ký ISO",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 126,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 127,
                        col: 0,
                        rowSpan: 1,
                        value: 124,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 127,
                        col: 1,
                        value: "Huỳnh Trần Quốc Hưng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 127,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 127,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 127,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 128,
                        col: 0,
                        rowSpan: 1,
                        value: 125,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 128,
                        col: 1,
                        value: "Huỳnh Trương Gia Trí",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 128,
                        col: 2,
                        value: "Phú Yên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 128,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 128,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 129,
                        col: 0,
                        rowSpan: 1,
                        value: 126,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 129,
                        col: 1,
                        value: "Huỳnh Văn Đang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 129,
                        col: 2,
                        value: "Kho nguyên liệu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 129,
                        col: 3,
                        value: "Nhân viên lái xe nâng XSX",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 129,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 130,
                        col: 0,
                        rowSpan: 1,
                        value: 127,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 130,
                        col: 1,
                        value: "Huỳnh Văn Đồng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 130,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 130,
                        col: 3,
                        value: "Tổ trưởng tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 130,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 131,
                        col: 0,
                        rowSpan: 1,
                        value: 128,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 131,
                        col: 1,
                        value: "Huỳnh Văn Phú",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 131,
                        col: 2,
                        value: "Đồng Nai",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 131,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 131,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 132,
                        col: 0,
                        rowSpan: 1,
                        value: 129,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 132,
                        col: 1,
                        value: "Huỳnh Vũ Phương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 132,
                        col: 2,
                        value: "Tổ nhập kho PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 132,
                        col: 3,
                        value: "Tổ trưởng nhập kho PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 132,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 133,
                        col: 0,
                        rowSpan: 1,
                        value: 130,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 133,
                        col: 1,
                        value: "Kha Văn Thải Lý",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 133,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 133,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 133,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 134,
                        col: 0,
                        rowSpan: 1,
                        value: 131,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 134,
                        col: 1,
                        value: "Khưu Kiến Long",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 134,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 134,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 134,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 135,
                        col: 0,
                        rowSpan: 1,
                        value: 132,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 135,
                        col: 1,
                        value: "Kiên Văn Lọt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 135,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 135,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 135,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 136,
                        col: 0,
                        rowSpan: 1,
                        value: 133,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 136,
                        col: 1,
                        value: "Kim Hoàng Anh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 136,
                        col: 2,
                        value: "DVKH Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 136,
                        col: 3,
                        value: "Nhân viên thống kê dịch vụ khách hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 136,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 137,
                        col: 0,
                        rowSpan: 1,
                        value: 134,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 137,
                        col: 1,
                        value: "Kim Sơn Sầm Báte",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 137,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 137,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 137,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 138,
                        col: 0,
                        rowSpan: 1,
                        value: 135,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 138,
                        col: 1,
                        value: "Lâm Bội Châu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 138,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 138,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 138,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 139,
                        col: 0,
                        rowSpan: 1,
                        value: 136,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 139,
                        col: 1,
                        value: "Lâm Đức Hoàn Hải",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 139,
                        col: 2,
                        value: "Gia Lai",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 139,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 139,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 140,
                        col: 0,
                        rowSpan: 1,
                        value: 137,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 140,
                        col: 1,
                        value: "Lâm Quốc Long",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 140,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 140,
                        col: 3,
                        value: "Tổ trưởng tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 140,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 141,
                        col: 0,
                        rowSpan: 1,
                        value: 138,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 141,
                        col: 1,
                        value: "Lâm Văn Rở",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 141,
                        col: 2,
                        value: "Tổ khuôn máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 141,
                        col: 3,
                        value: "Nhân viên khuôn máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 141,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 142,
                        col: 0,
                        rowSpan: 1,
                        value: 139,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 142,
                        col: 1,
                        value: "Lăng Thành Tuân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 142,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 142,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 142,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 143,
                        col: 0,
                        rowSpan: 1,
                        value: 140,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 143,
                        col: 1,
                        value: "Lê Chí Bảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 143,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 143,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 143,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 144,
                        col: 0,
                        rowSpan: 1,
                        value: 141,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 144,
                        col: 1,
                        value: "Lê Đinh Thuận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 144,
                        col: 2,
                        value: "Quảng Nam",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 144,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 144,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 145,
                        col: 0,
                        rowSpan: 1,
                        value: 142,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 145,
                        col: 1,
                        value: "Lê Đức Chiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 145,
                        col: 2,
                        value: "Tổ khuôn máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 145,
                        col: 3,
                        value: "Tổ trưởng khuôn máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 145,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 146,
                        col: 0,
                        rowSpan: 1,
                        value: 143,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 146,
                        col: 1,
                        value: "Lê Đức Hiệp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 146,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 146,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 146,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 147,
                        col: 0,
                        rowSpan: 1,
                        value: 144,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 147,
                        col: 1,
                        value: "Lê Hoài Nam",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 147,
                        col: 2,
                        value: "BP CNTT - Tạp vụ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 147,
                        col: 3,
                        value: "Nhân viên it",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 147,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 148,
                        col: 0,
                        rowSpan: 1,
                        value: 145,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 148,
                        col: 1,
                        value: "Lê Hoài Tú",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 148,
                        col: 2,
                        value: "Cao Nguyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 148,
                        col: 3,
                        value: "Quản lý vùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 148,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 149,
                        col: 0,
                        rowSpan: 1,
                        value: 146,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 149,
                        col: 1,
                        value: "Lê Hoàng Phú",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 149,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 149,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 149,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 150,
                        col: 0,
                        rowSpan: 1,
                        value: 147,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 150,
                        col: 1,
                        value: "Lê Hoàng Phúc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 150,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 150,
                        col: 3,
                        value: "Nhân viên xử lý đơn hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 150,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 151,
                        col: 0,
                        rowSpan: 1,
                        value: 148,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 151,
                        col: 1,
                        value: "Lê Hoàng Thảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 151,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 151,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 151,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 152,
                        col: 0,
                        rowSpan: 1,
                        value: 149,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 152,
                        col: 1,
                        value: "Lê Hồng Đương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 152,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 152,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 152,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 153,
                        col: 0,
                        rowSpan: 1,
                        value: 150,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 153,
                        col: 1,
                        value: "Lê Huy Lân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 153,
                        col: 2,
                        value: "Phòng kinh doanh 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 153,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 153,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 154,
                        col: 0,
                        rowSpan: 1,
                        value: 151,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 154,
                        col: 1,
                        value: "Lê Huỳnh Đức",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 154,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 154,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 154,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 155,
                        col: 0,
                        rowSpan: 1,
                        value: 152,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 155,
                        col: 1,
                        value: "Lê Kha",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 155,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 155,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 155,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 156,
                        col: 0,
                        rowSpan: 1,
                        value: 153,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 156,
                        col: 1,
                        value: "Lê Minh Nhật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 156,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 156,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 156,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 157,
                        col: 0,
                        rowSpan: 1,
                        value: 154,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 157,
                        col: 1,
                        value: "Lê Minh Quân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 157,
                        col: 2,
                        value: "Ca sản xuất PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 157,
                        col: 3,
                        value: "Trưởng ca sản xuất PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 157,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 158,
                        col: 0,
                        rowSpan: 1,
                        value: 155,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 158,
                        col: 1,
                        value: "Lê Minh Thông",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 158,
                        col: 2,
                        value: "Tây Ninh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 158,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 158,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 159,
                        col: 0,
                        rowSpan: 1,
                        value: 156,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 159,
                        col: 1,
                        value: "Lê Minh Vương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 159,
                        col: 2,
                        value: "Phân xưởng 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 159,
                        col: 3,
                        value: "Đốc công",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 159,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 160,
                        col: 0,
                        rowSpan: 1,
                        value: 157,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 160,
                        col: 1,
                        value: "Lê Quang Trung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 160,
                        col: 2,
                        value: "Tổ nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 160,
                        col: 3,
                        value: "Tổ trưởng nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 160,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 161,
                        col: 0,
                        rowSpan: 1,
                        value: 158,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 161,
                        col: 1,
                        value: "Lê Quốc Bảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 161,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 161,
                        col: 3,
                        value: "Nhân viên giám sát hàng hóa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 161,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 162,
                        col: 0,
                        rowSpan: 1,
                        value: 159,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 162,
                        col: 1,
                        value: "Lê Tấn Lộc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 162,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 162,
                        col: 3,
                        value: "Nhân viên lái xe",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 162,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 163,
                        col: 0,
                        rowSpan: 1,
                        value: 160,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 163,
                        col: 1,
                        value: "Lê Thành An",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 163,
                        col: 2,
                        value: "Tổ QLCL Hành chính",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 163,
                        col: 3,
                        value: "Nhân viên QLCL hành chính 4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 163,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 164,
                        col: 0,
                        rowSpan: 1,
                        value: 161,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 164,
                        col: 1,
                        value: "Lê Thanh Liêm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 164,
                        col: 2,
                        value: "BP Dịch vụ kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 164,
                        col: 3,
                        value: "Nhân viên kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 164,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 165,
                        col: 0,
                        rowSpan: 1,
                        value: 162,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 165,
                        col: 1,
                        value: "Lê Thanh Lộc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 165,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 165,
                        col: 3,
                        value: "Nhân viên vận hành máy trộn PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 165,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 166,
                        col: 0,
                        rowSpan: 1,
                        value: 163,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 166,
                        col: 1,
                        value: "Lê Thành Nam",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 166,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 166,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 166,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 167,
                        col: 0,
                        rowSpan: 1,
                        value: 164,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 167,
                        col: 1,
                        value: "Lê Thành Phát",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 167,
                        col: 2,
                        value: "Tổ QLCL Ca 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 167,
                        col: 3,
                        value: "Nhân viên QLCL Ca",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 167,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 168,
                        col: 0,
                        rowSpan: 1,
                        value: 165,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 168,
                        col: 1,
                        value: "Lê Thế Nhân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 168,
                        col: 2,
                        value: "Phòng kinh doanh 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 168,
                        col: 3,
                        value: "Trưởng phòng kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 168,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 169,
                        col: 0,
                        rowSpan: 1,
                        value: 166,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 169,
                        col: 1,
                        value: "Lê Thị Hoài Phương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 169,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 169,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 169,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 170,
                        col: 0,
                        rowSpan: 1,
                        value: 167,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 170,
                        col: 1,
                        value: "Lê Thị Vân Anh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 170,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 170,
                        col: 3,
                        value: "Thư ký kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 170,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 171,
                        col: 0,
                        rowSpan: 1,
                        value: 168,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 171,
                        col: 1,
                        value: "Lê Trọng Hùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 171,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn HDPE/PPR",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 171,
                        col: 3,
                        value: "Tổ phó tổ sửa chữa máy đùn HDPE/PPR",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 171,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 172,
                        col: 0,
                        rowSpan: 1,
                        value: 169,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 172,
                        col: 1,
                        value: "Lê Trọng Hữu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 172,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 172,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 172,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 173,
                        col: 0,
                        rowSpan: 1,
                        value: 170,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 173,
                        col: 1,
                        value: "Lê Trọng Nhân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 173,
                        col: 2,
                        value: "Bình Phước",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 173,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 173,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 174,
                        col: 0,
                        rowSpan: 1,
                        value: 171,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 174,
                        col: 1,
                        value: "Lê Trung Chánh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 174,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 174,
                        col: 3,
                        value: "Nhân viên lái xe",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 174,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 175,
                        col: 0,
                        rowSpan: 1,
                        value: 172,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 175,
                        col: 1,
                        value: "Lê Tú Anh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 175,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 175,
                        col: 3,
                        value: "Nhân viên xử lý đơn hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 175,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 176,
                        col: 0,
                        rowSpan: 1,
                        value: 173,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 176,
                        col: 1,
                        value: "Lê Tự Hùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 176,
                        col: 2,
                        value: "Miền Trung 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 176,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 176,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 177,
                        col: 0,
                        rowSpan: 1,
                        value: 174,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 177,
                        col: 1,
                        value: "Lê Văn Đồi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 177,
                        col: 2,
                        value: "Mekong 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 177,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 177,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 178,
                        col: 0,
                        rowSpan: 1,
                        value: 175,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 178,
                        col: 1,
                        value: "Lê Văn Minh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 178,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 178,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 178,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 179,
                        col: 0,
                        rowSpan: 1,
                        value: 176,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 179,
                        col: 1,
                        value: "Lê Văn Minh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 179,
                        col: 2,
                        value: "Phòng Kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 179,
                        col: 3,
                        value: "Nhân viên kho",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 179,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 180,
                        col: 0,
                        rowSpan: 1,
                        value: 177,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 180,
                        col: 1,
                        value: "Lê Văn Tấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 180,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 180,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 180,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 181,
                        col: 0,
                        rowSpan: 1,
                        value: 178,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 181,
                        col: 1,
                        value: "Lê Văn Thảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 181,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 181,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 181,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 182,
                        col: 0,
                        rowSpan: 1,
                        value: 179,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 182,
                        col: 1,
                        value: "Lê Văn Thiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 182,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 182,
                        col: 3,
                        value: "Nhân viên lái xe",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 182,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 183,
                        col: 0,
                        rowSpan: 1,
                        value: 180,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 183,
                        col: 1,
                        value: "Lê Văn Thu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 183,
                        col: 2,
                        value: "Khối kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 183,
                        col: 3,
                        value: "Giám đốc kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 183,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 184,
                        col: 0,
                        rowSpan: 1,
                        value: 181,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 184,
                        col: 1,
                        value: "Lê Văn Tình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 184,
                        col: 2,
                        value: "Phòng Kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 184,
                        col: 3,
                        value: "Chuyên viên điện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 184,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 185,
                        col: 0,
                        rowSpan: 1,
                        value: 182,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 185,
                        col: 1,
                        value: "Lê Văn Toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 185,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 185,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 185,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 186,
                        col: 0,
                        rowSpan: 1,
                        value: 183,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 186,
                        col: 1,
                        value: "Lê Văn Tuân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 186,
                        col: 2,
                        value: "Tổ sửa chữa hàn dán máy ép phun",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 186,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 186,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 187,
                        col: 0,
                        rowSpan: 1,
                        value: 184,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 187,
                        col: 1,
                        value: "Lê Văn Tuyền",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 187,
                        col: 2,
                        value: "Kon Tum",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 187,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 187,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 188,
                        col: 0,
                        rowSpan: 1,
                        value: 185,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 188,
                        col: 1,
                        value: "Lê Văn Vũ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 188,
                        col: 2,
                        value: "Tổ QLCL ca 3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 188,
                        col: 3,
                        value: "Nhân viên QLCL Ca",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 188,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 189,
                        col: 0,
                        rowSpan: 1,
                        value: 186,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 189,
                        col: 1,
                        value: "Lê Xuân Trường",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 189,
                        col: 2,
                        value: "Đắk Lắk",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 189,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 189,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 190,
                        col: 0,
                        rowSpan: 1,
                        value: 187,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 190,
                        col: 1,
                        value: "Liêu Minh Tuấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 190,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 190,
                        col: 3,
                        value: "Kế toán Trưởng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 190,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 191,
                        col: 0,
                        rowSpan: 1,
                        value: 188,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 191,
                        col: 1,
                        value: "Lò Văn Toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 191,
                        col: 2,
                        value: "Ca sản xuất PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 191,
                        col: 3,
                        value: "Trưởng ca sản xuất PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 191,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 192,
                        col: 0,
                        rowSpan: 1,
                        value: 189,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 192,
                        col: 1,
                        value: "Lương Văn Hùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 192,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 192,
                        col: 3,
                        value: "Công nhân tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 192,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 193,
                        col: 0,
                        rowSpan: 1,
                        value: 190,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 193,
                        col: 1,
                        value: "Lường Viết Tuấn ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 193,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 193,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 193,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 194,
                        col: 0,
                        rowSpan: 1,
                        value: 191,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 194,
                        col: 1,
                        value: "Lưu Bền",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 194,
                        col: 2,
                        value: "Kho nguyên liệu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 194,
                        col: 3,
                        value: "Nhân viên lái xe nâng XSX",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 194,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 195,
                        col: 0,
                        rowSpan: 1,
                        value: 192,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 195,
                        col: 1,
                        value: "Lưu Hoàn Nhân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 195,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 195,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 195,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 196,
                        col: 0,
                        rowSpan: 1,
                        value: 193,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 196,
                        col: 1,
                        value: "Lưu Thanh Giàu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 196,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 196,
                        col: 3,
                        value: "Tổ phó tổ nguyên liệu  PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 196,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 197,
                        col: 0,
                        rowSpan: 1,
                        value: 194,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 197,
                        col: 1,
                        value: "Lưu Văn Hiếu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 197,
                        col: 2,
                        value: "Đồng Nai",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 197,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 197,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 198,
                        col: 0,
                        rowSpan: 1,
                        value: 195,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 198,
                        col: 1,
                        value: "Lý Cọp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 198,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 198,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 198,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 199,
                        col: 0,
                        rowSpan: 1,
                        value: 196,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 199,
                        col: 1,
                        value: "Lý Hoàng Quốc Tuấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 199,
                        col: 2,
                        value: "HCM4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 199,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 199,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 200,
                        col: 0,
                        rowSpan: 1,
                        value: 197,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 200,
                        col: 1,
                        value: "Lý Khải Nghiêm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 200,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 200,
                        col: 3,
                        value: "Công nhân tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 200,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 201,
                        col: 0,
                        rowSpan: 1,
                        value: 198,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 201,
                        col: 1,
                        value: "Lý Thanh Long",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 201,
                        col: 2,
                        value: "Mekong 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 201,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 201,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 202,
                        col: 0,
                        rowSpan: 1,
                        value: 199,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 202,
                        col: 1,
                        value: "Lý Văn An",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 202,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 202,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 202,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 203,
                        col: 0,
                        rowSpan: 1,
                        value: 200,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 203,
                        col: 1,
                        value: "Lý Vĩ Khang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 203,
                        col: 2,
                        value: "Tổ xử lý phế PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 203,
                        col: 3,
                        value: "Nhân viên xử lý phế PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 203,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 204,
                        col: 0,
                        rowSpan: 1,
                        value: 201,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 204,
                        col: 1,
                        value: "Mạch Nam Dũng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 204,
                        col: 2,
                        value: "Phòng kinh doanh 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 204,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 204,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 205,
                        col: 0,
                        rowSpan: 1,
                        value: 202,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 205,
                        col: 1,
                        value: "Mai Đức Linh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 205,
                        col: 2,
                        value: "Khánh Hòa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 205,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 205,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 206,
                        col: 0,
                        rowSpan: 1,
                        value: 203,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 206,
                        col: 1,
                        value: "Mai Đức Lộc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 206,
                        col: 2,
                        value: "Thống kê PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 206,
                        col: 3,
                        value: "Nhân viên thống kê PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 206,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 207,
                        col: 0,
                        rowSpan: 1,
                        value: 204,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 207,
                        col: 1,
                        value: "Mai Sơn Tùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 207,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 207,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 207,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 208,
                        col: 0,
                        rowSpan: 1,
                        value: 205,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 208,
                        col: 1,
                        value: "Mai Thị Thanh Mai",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 208,
                        col: 2,
                        value: "Phòng CSKH",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 208,
                        col: 3,
                        value: "Trưởng phòng CSKH",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 208,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 209,
                        col: 0,
                        rowSpan: 1,
                        value: 206,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 209,
                        col: 1,
                        value: "Mai Văn Ty",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 209,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 209,
                        col: 3,
                        value: "Nhân viên giám sát hàng hóa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 209,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 210,
                        col: 0,
                        rowSpan: 1,
                        value: 207,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 210,
                        col: 1,
                        value: "Mông Đình Khánh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 210,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 210,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 210,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 211,
                        col: 0,
                        rowSpan: 1,
                        value: 208,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 211,
                        col: 1,
                        value: "Ngân Bá Thượng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 211,
                        col: 2,
                        value: "Tổ xử lý phế PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 211,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 211,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 212,
                        col: 0,
                        rowSpan: 1,
                        value: 209,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 212,
                        col: 1,
                        value: "Ngô Hữu Ly",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 212,
                        col: 2,
                        value: "Phòng Kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 212,
                        col: 3,
                        value: "Chuyên viên cơ khí",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 212,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 213,
                        col: 0,
                        rowSpan: 1,
                        value: 210,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 213,
                        col: 1,
                        value: "Ngô Huy Vũ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 213,
                        col: 2,
                        value: "Cần Thơ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 213,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 213,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 214,
                        col: 0,
                        rowSpan: 1,
                        value: 211,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 214,
                        col: 1,
                        value: "Ngô Kim Giáo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 214,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 214,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 214,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 215,
                        col: 0,
                        rowSpan: 1,
                        value: 212,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 215,
                        col: 1,
                        value: "Ngô Thành Lưu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 215,
                        col: 2,
                        value: "Bình Thuận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 215,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 215,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 216,
                        col: 0,
                        rowSpan: 1,
                        value: 213,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 216,
                        col: 1,
                        value: "Ngô Thị Hồng Ngọc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 216,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 216,
                        col: 3,
                        value: "Nhân viên marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 216,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 217,
                        col: 0,
                        rowSpan: 1,
                        value: 214,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 217,
                        col: 1,
                        value: "Ngô Thị Thu Sương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 217,
                        col: 2,
                        value: "BP CNTT - Tạp vụ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 217,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 217,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 218,
                        col: 0,
                        rowSpan: 1,
                        value: 215,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 218,
                        col: 1,
                        value: "Ngô Trí Thọ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 218,
                        col: 2,
                        value: "Miền Trung 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 218,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 218,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 219,
                        col: 0,
                        rowSpan: 1,
                        value: 216,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 219,
                        col: 1,
                        value: "Nguyễn  Thị Ngọc Yến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 219,
                        col: 2,
                        value: "Thống kê PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 219,
                        col: 3,
                        value: "Nhân viên thống kê PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 219,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 220,
                        col: 0,
                        rowSpan: 1,
                        value: 217,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 220,
                        col: 1,
                        value: "Nguyễn Anh Điệp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 220,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 220,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 220,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 221,
                        col: 0,
                        rowSpan: 1,
                        value: 218,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 221,
                        col: 1,
                        value: "Nguyễn Anh Thắng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 221,
                        col: 2,
                        value: "Bộ phận QLCL ca",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 221,
                        col: 3,
                        value: "Phó Phòng QLCL",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 221,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 222,
                        col: 0,
                        rowSpan: 1,
                        value: 219,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 222,
                        col: 1,
                        value: "Nguyễn Anh Tuấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 222,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 222,
                        col: 3,
                        value: "Nhân viên giám sát hàng hóa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 222,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 223,
                        col: 0,
                        rowSpan: 1,
                        value: 220,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 223,
                        col: 1,
                        value: "Nguyễn Bá Quang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 223,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 223,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 223,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 224,
                        col: 0,
                        rowSpan: 1,
                        value: 221,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 224,
                        col: 1,
                        value: "Nguyễn Cảnh Phượng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 224,
                        col: 2,
                        value: "Tổ gia công lắp ráp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 224,
                        col: 3,
                        value: "Nhân viên gia công & lắp ráp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 224,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 225,
                        col: 0,
                        rowSpan: 1,
                        value: 222,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 225,
                        col: 1,
                        value: "Nguyễn Cao Điềm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 225,
                        col: 2,
                        value: "Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 225,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 225,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 226,
                        col: 0,
                        rowSpan: 1,
                        value: 223,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 226,
                        col: 1,
                        value: "Nguyễn Chí Cường",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 226,
                        col: 2,
                        value: "HCM2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 226,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 226,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 227,
                        col: 0,
                        rowSpan: 1,
                        value: 224,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 227,
                        col: 1,
                        value: "Nguyễn Chí Thái",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 227,
                        col: 2,
                        value: "Phân xưởng 3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 227,
                        col: 3,
                        value: "Phó giám đốc sản xuất PVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 227,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 228,
                        col: 0,
                        rowSpan: 1,
                        value: 225,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 228,
                        col: 1,
                        value: "Nguyễn Chí Tín",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 228,
                        col: 2,
                        value: "Sóc Trăng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 228,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 228,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 229,
                        col: 0,
                        rowSpan: 1,
                        value: 226,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 229,
                        col: 1,
                        value: "Nguyễn Chí Vững",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 229,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 229,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 229,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 230,
                        col: 0,
                        rowSpan: 1,
                        value: 227,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 230,
                        col: 1,
                        value: "Nguyễn Chiến Thắng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 230,
                        col: 2,
                        value: "Kho nguyên liệu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 230,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 230,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 231,
                        col: 0,
                        rowSpan: 1,
                        value: 228,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 231,
                        col: 1,
                        value: "Nguyễn Chiến Thắng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 231,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 231,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 231,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 232,
                        col: 0,
                        rowSpan: 1,
                        value: 229,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 232,
                        col: 1,
                        value: "Nguyễn Chúc Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 232,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 232,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 232,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 233,
                        col: 0,
                        rowSpan: 1,
                        value: 230,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 233,
                        col: 1,
                        value: "Nguyễn Công Danh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 233,
                        col: 2,
                        value: "Kiên Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 233,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 233,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 234,
                        col: 0,
                        rowSpan: 1,
                        value: 231,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 234,
                        col: 1,
                        value: "Nguyễn Công Tuyến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 234,
                        col: 2,
                        value: "Tổ nhập kho PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 234,
                        col: 3,
                        value: "Tổ trưởng nhập kho PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 234,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 235,
                        col: 0,
                        rowSpan: 1,
                        value: 232,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 235,
                        col: 1,
                        value: "Nguyễn Đại Đồng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 235,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 235,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 235,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 236,
                        col: 0,
                        rowSpan: 1,
                        value: 233,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 236,
                        col: 1,
                        value: "Nguyễn Đình Quang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 236,
                        col: 2,
                        value: "Bình Định",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 236,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 236,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 237,
                        col: 0,
                        rowSpan: 1,
                        value: 234,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 237,
                        col: 1,
                        value: "Nguyễn Đình Thành",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 237,
                        col: 2,
                        value: "Lâm Đồng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 237,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 237,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 238,
                        col: 0,
                        rowSpan: 1,
                        value: 235,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 238,
                        col: 1,
                        value: "Nguyễn Đức Thuận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 238,
                        col: 2,
                        value: "Giám sát",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 238,
                        col: 3,
                        value: "Phụ trách nhân sự",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 238,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 239,
                        col: 0,
                        rowSpan: 1,
                        value: 236,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 239,
                        col: 1,
                        value: "Nguyễn Duy Bình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 239,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 239,
                        col: 3,
                        value: "Phó Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 239,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 240,
                        col: 0,
                        rowSpan: 1,
                        value: 237,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 240,
                        col: 1,
                        value: "Nguyễn Duy Công",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 240,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 240,
                        col: 3,
                        value: "Phó phòng an ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 240,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 241,
                        col: 0,
                        rowSpan: 1,
                        value: 238,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 241,
                        col: 1,
                        value: "Nguyễn Duy Khánh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 241,
                        col: 2,
                        value: "Tổ nhập kho PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 241,
                        col: 3,
                        value: "Nhân viên nhập kho PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 241,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 242,
                        col: 0,
                        rowSpan: 1,
                        value: 239,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 242,
                        col: 1,
                        value: "Nguyễn Duy Minh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 242,
                        col: 2,
                        value: "Kiên Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 242,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 242,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 243,
                        col: 0,
                        rowSpan: 1,
                        value: 240,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 243,
                        col: 1,
                        value: "Nguyễn Duy Tân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 243,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 243,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 243,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 244,
                        col: 0,
                        rowSpan: 1,
                        value: 241,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 244,
                        col: 1,
                        value: "Nguyễn Hà Ngân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 244,
                        col: 2,
                        value: "Phòng Kế toán",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 244,
                        col: 3,
                        value: "Kế toán kho",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 244,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 245,
                        col: 0,
                        rowSpan: 1,
                        value: 242,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 245,
                        col: 1,
                        value: "Nguyễn Hàn Quốc Chung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 245,
                        col: 2,
                        value: "Kon Tum",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 245,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 245,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 246,
                        col: 0,
                        rowSpan: 1,
                        value: 243,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 246,
                        col: 1,
                        value: "Nguyễn Hồ Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 246,
                        col: 2,
                        value: "Tổ nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 246,
                        col: 3,
                        value: "Tổ phó nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 246,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 247,
                        col: 0,
                        rowSpan: 1,
                        value: 244,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 247,
                        col: 1,
                        value: "Nguyễn Hoài Phúc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 247,
                        col: 2,
                        value: "Đồng Tháp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 247,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 247,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 248,
                        col: 0,
                        rowSpan: 1,
                        value: 245,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 248,
                        col: 1,
                        value: "Nguyễn Hoài Thương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 248,
                        col: 2,
                        value: "Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 248,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 248,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 249,
                        col: 0,
                        rowSpan: 1,
                        value: 246,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 249,
                        col: 1,
                        value: "Nguyễn Hoài Vũ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 249,
                        col: 2,
                        value: "Kho thành phẩm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 249,
                        col: 3,
                        value: "Thủ kho",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 249,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 250,
                        col: 0,
                        rowSpan: 1,
                        value: 247,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 250,
                        col: 1,
                        value: "Nguyễn Hoàng Bảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 250,
                        col: 2,
                        value: "Bến Tre",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 250,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 250,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 251,
                        col: 0,
                        rowSpan: 1,
                        value: 248,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 251,
                        col: 1,
                        value: "Nguyễn Hoàng Duy",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 251,
                        col: 2,
                        value: "HCM4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 251,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 251,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 252,
                        col: 0,
                        rowSpan: 1,
                        value: 249,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 252,
                        col: 1,
                        value: "Nguyễn Hoàng Khôi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 252,
                        col: 2,
                        value: "Tổ QLCL Ca 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 252,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 252,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 253,
                        col: 0,
                        rowSpan: 1,
                        value: 250,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 253,
                        col: 1,
                        value: "Nguyễn Hoàng Long",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 253,
                        col: 2,
                        value: "Tổ công nghệ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 253,
                        col: 3,
                        value: "Tổ trưởng công nghệ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 253,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 254,
                        col: 0,
                        rowSpan: 1,
                        value: 251,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 254,
                        col: 1,
                        value: "Nguyễn Hương Huyền",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 254,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 254,
                        col: 3,
                        value: "Nhân viên marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 254,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 255,
                        col: 0,
                        rowSpan: 1,
                        value: 252,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 255,
                        col: 1,
                        value: "Nguyễn Hữu Khanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 255,
                        col: 2,
                        value: "DVKH Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 255,
                        col: 3,
                        value: "Nhân viên điều vận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 255,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 256,
                        col: 0,
                        rowSpan: 1,
                        value: 253,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 256,
                        col: 1,
                        value: "Nguyễn Huy Hảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 256,
                        col: 2,
                        value: "Miền Đông 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 256,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 256,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 257,
                        col: 0,
                        rowSpan: 1,
                        value: 254,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 257,
                        col: 1,
                        value: "Nguyễn Khánh Vi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 257,
                        col: 2,
                        value: "Vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 257,
                        col: 3,
                        value: "Công nhân vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 257,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 258,
                        col: 0,
                        rowSpan: 1,
                        value: 255,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 258,
                        col: 1,
                        value: "Nguyễn Khoa Nam",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 258,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 258,
                        col: 3,
                        value: "Nhân viên marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 258,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 259,
                        col: 0,
                        rowSpan: 1,
                        value: 256,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 259,
                        col: 1,
                        value: "Nguyễn Khoa Nam",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 259,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 259,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 259,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 260,
                        col: 0,
                        rowSpan: 1,
                        value: 257,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 260,
                        col: 1,
                        value: "Nguyễn Minh Khải",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 260,
                        col: 2,
                        value: "Kon Tum",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 260,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 260,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 261,
                        col: 0,
                        rowSpan: 1,
                        value: 258,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 261,
                        col: 1,
                        value: "Nguyễn Minh Tâm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 261,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 261,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 261,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 262,
                        col: 0,
                        rowSpan: 1,
                        value: 259,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 262,
                        col: 1,
                        value: "Nguyễn Minh Thuận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 262,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 262,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 262,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 263,
                        col: 0,
                        rowSpan: 1,
                        value: 260,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 263,
                        col: 1,
                        value: "Nguyễn Minh Tuấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 263,
                        col: 2,
                        value: "Phòng kinh doanh 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 263,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 263,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 264,
                        col: 0,
                        rowSpan: 1,
                        value: 261,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 264,
                        col: 1,
                        value: "Nguyễn Minh Vũ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 264,
                        col: 2,
                        value: "Phòng mua hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 264,
                        col: 3,
                        value: "Nhân viên mua hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 264,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 265,
                        col: 0,
                        rowSpan: 1,
                        value: 262,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 265,
                        col: 1,
                        value: "Nguyễn Ngọc Dũng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 265,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 265,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 265,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 266,
                        col: 0,
                        rowSpan: 1,
                        value: 263,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 266,
                        col: 1,
                        value: "Nguyễn Ngọc Hải",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 266,
                        col: 2,
                        value: "Ninh Thuận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 266,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 266,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 267,
                        col: 0,
                        rowSpan: 1,
                        value: 264,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 267,
                        col: 1,
                        value: "Nguyễn Ngọc Phú",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 267,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 267,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 267,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 268,
                        col: 0,
                        rowSpan: 1,
                        value: 265,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 268,
                        col: 1,
                        value: "Nguyễn Ngọc Tâm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 268,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 268,
                        col: 3,
                        value: "PTGD nội chính",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 268,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 269,
                        col: 0,
                        rowSpan: 1,
                        value: 266,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 269,
                        col: 1,
                        value: "Nguyễn Nhựt Năng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 269,
                        col: 2,
                        value: "Mekong 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 269,
                        col: 3,
                        value: "Quản lý vùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 269,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 270,
                        col: 0,
                        rowSpan: 1,
                        value: 267,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 270,
                        col: 1,
                        value: "Nguyễn Oanh Hùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 270,
                        col: 2,
                        value: "Phòng Kinh doanh 4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 270,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 270,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 271,
                        col: 0,
                        rowSpan: 1,
                        value: 268,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 271,
                        col: 1,
                        value: "Nguyễn Phạm Quốc Huy",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 271,
                        col: 2,
                        value: "Miền Đông 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 271,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 271,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 272,
                        col: 0,
                        rowSpan: 1,
                        value: 269,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 272,
                        col: 1,
                        value: "Nguyễn Phan Minh Đức",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 272,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 272,
                        col: 3,
                        value: "Nhân viên marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 272,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 273,
                        col: 0,
                        rowSpan: 1,
                        value: 270,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 273,
                        col: 1,
                        value: "Nguyễn Phước Hậu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 273,
                        col: 2,
                        value: "Mekong 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 273,
                        col: 3,
                        value: "Quản lý vùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 273,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 274,
                        col: 0,
                        rowSpan: 1,
                        value: 271,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 274,
                        col: 1,
                        value: "Nguyễn Phương Linh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 274,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 274,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 274,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 275,
                        col: 0,
                        rowSpan: 1,
                        value: 272,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 275,
                        col: 1,
                        value: "Nguyễn Quang Hảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 275,
                        col: 2,
                        value: "Phòng kinh doanh 3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 275,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 275,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 276,
                        col: 0,
                        rowSpan: 1,
                        value: 273,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 276,
                        col: 1,
                        value: "Nguyễn Quang Trung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 276,
                        col: 2,
                        value: "Miền Trung 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 276,
                        col: 3,
                        value: "Quản lý vùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 276,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 277,
                        col: 0,
                        rowSpan: 1,
                        value: 274,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 277,
                        col: 1,
                        value: "Nguyễn Quốc Đạt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 277,
                        col: 2,
                        value: "HCM4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 277,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 277,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 278,
                        col: 0,
                        rowSpan: 1,
                        value: 275,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 278,
                        col: 1,
                        value: "Nguyễn Quốc Huy",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 278,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 278,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 278,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 279,
                        col: 0,
                        rowSpan: 1,
                        value: 276,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 279,
                        col: 1,
                        value: "Nguyễn Quốc Luân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 279,
                        col: 2,
                        value: "Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 279,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 279,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 280,
                        col: 0,
                        rowSpan: 1,
                        value: 277,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 280,
                        col: 1,
                        value: "Nguyễn Quyết Thắng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 280,
                        col: 2,
                        value: "HCM4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 280,
                        col: 3,
                        value: "Quản lý vùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 280,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 281,
                        col: 0,
                        rowSpan: 1,
                        value: 278,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 281,
                        col: 1,
                        value: "Nguyễn Tấn Lực",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 281,
                        col: 2,
                        value: "Tổ khuôn máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 281,
                        col: 3,
                        value: "Nhân viên khuôn máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 281,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 282,
                        col: 0,
                        rowSpan: 1,
                        value: 279,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 282,
                        col: 1,
                        value: "Nguyễn Tấn Phát",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 282,
                        col: 2,
                        value: "Tổ xử lý phế PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 282,
                        col: 3,
                        value: "Nhân viên xử lý phế PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 282,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 283,
                        col: 0,
                        rowSpan: 1,
                        value: 280,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 283,
                        col: 1,
                        value: "Nguyễn Tấn Phát",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 283,
                        col: 2,
                        value: "HCM4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 283,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 283,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 284,
                        col: 0,
                        rowSpan: 1,
                        value: 281,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 284,
                        col: 1,
                        value: "Nguyễn Thái Dũng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 284,
                        col: 2,
                        value: "Tổ nhập kho PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 284,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 284,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 285,
                        col: 0,
                        rowSpan: 1,
                        value: 282,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 285,
                        col: 1,
                        value: "Nguyễn Thái Hoàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 285,
                        col: 2,
                        value: "Phòng Kinh doanh 4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 285,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 285,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 286,
                        col: 0,
                        rowSpan: 1,
                        value: 283,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 286,
                        col: 1,
                        value: "Nguyễn Thành Chiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 286,
                        col: 2,
                        value: "Khối kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 286,
                        col: 3,
                        value: "Phó giám đốc kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 286,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 287,
                        col: 0,
                        rowSpan: 1,
                        value: 284,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 287,
                        col: 1,
                        value: "Nguyễn Thanh Duy",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 287,
                        col: 2,
                        value: "Tổ khuôn máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 287,
                        col: 3,
                        value: "Tổ trưởng khuôn máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 287,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 288,
                        col: 0,
                        rowSpan: 1,
                        value: 285,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 288,
                        col: 1,
                        value: "Nguyễn Thanh Hải",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 288,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 288,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 288,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 289,
                        col: 0,
                        rowSpan: 1,
                        value: 286,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 289,
                        col: 1,
                        value: "Nguyễn Thanh Hải",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 289,
                        col: 2,
                        value: "Phòng Kinh doanh 4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 289,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 289,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 290,
                        col: 0,
                        rowSpan: 1,
                        value: 287,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 290,
                        col: 1,
                        value: "Nguyễn Thanh Hào",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 290,
                        col: 2,
                        value: "Tổ QLCL Ca 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 290,
                        col: 3,
                        value: "Tổ trưởng QLCL Ca",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 290,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 291,
                        col: 0,
                        rowSpan: 1,
                        value: 288,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 291,
                        col: 1,
                        value: "Nguyễn Thành Lâm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 291,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 291,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 291,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 292,
                        col: 0,
                        rowSpan: 1,
                        value: 289,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 292,
                        col: 1,
                        value: "Nguyễn Thành Long",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 292,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 292,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 292,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 293,
                        col: 0,
                        rowSpan: 1,
                        value: 290,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 293,
                        col: 1,
                        value: "Nguyễn Thanh Sang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 293,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 293,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 293,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 294,
                        col: 0,
                        rowSpan: 1,
                        value: 291,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 294,
                        col: 1,
                        value: "Nguyễn Thanh Tâm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 294,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 294,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 294,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 295,
                        col: 0,
                        rowSpan: 1,
                        value: 292,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 295,
                        col: 1,
                        value: "Nguyễn Thanh Thiên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 295,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 295,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 295,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 296,
                        col: 0,
                        rowSpan: 1,
                        value: 293,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 296,
                        col: 1,
                        value: "Nguyễn Thanh Tùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 296,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 296,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 296,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 297,
                        col: 0,
                        rowSpan: 1,
                        value: 294,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 297,
                        col: 1,
                        value: "Nguyễn Thanh Vũ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 297,
                        col: 2,
                        value: "Bà Rịa - Vũng Tàu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 297,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 297,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 298,
                        col: 0,
                        rowSpan: 1,
                        value: 295,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 298,
                        col: 1,
                        value: "Nguyễn Thanh Xuân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 298,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn HDPE/PPR",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 298,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy đùn HDPE/PPR",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 298,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 299,
                        col: 0,
                        rowSpan: 1,
                        value: 296,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 299,
                        col: 1,
                        value: "Nguyễn Thế Anh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 299,
                        col: 2,
                        value: "Bình Định",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 299,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 299,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 300,
                        col: 0,
                        rowSpan: 1,
                        value: 297,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 300,
                        col: 1,
                        value: "Nguyễn Thế Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 300,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 300,
                        col: 3,
                        value: "Công nhân tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 300,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 301,
                        col: 0,
                        rowSpan: 1,
                        value: 298,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 301,
                        col: 1,
                        value: "Nguyễn Thị Bình Nguyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 301,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 301,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 301,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 302,
                        col: 0,
                        rowSpan: 1,
                        value: 299,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 302,
                        col: 1,
                        value: "Nguyễn Thị Cẩm Tú",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 302,
                        col: 2,
                        value: "Miền Trung - Cao Nguyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 302,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 302,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 303,
                        col: 0,
                        rowSpan: 1,
                        value: 300,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 303,
                        col: 1,
                        value: "Nguyễn Thị Diệp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 303,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 303,
                        col: 3,
                        value: "Nhân viên xử lý đơn hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 303,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 304,
                        col: 0,
                        rowSpan: 1,
                        value: 301,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 304,
                        col: 1,
                        value: "Nguyễn Thị Lựu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 304,
                        col: 2,
                        value: "Thống kê PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 304,
                        col: 3,
                        value: "Nhân viên thống kê PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 304,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 305,
                        col: 0,
                        rowSpan: 1,
                        value: 302,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 305,
                        col: 1,
                        value: "Nguyễn Thị Phương Thảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 305,
                        col: 2,
                        value: "Phòng mua hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 305,
                        col: 3,
                        value: "Nhân viên mua hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 305,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 306,
                        col: 0,
                        rowSpan: 1,
                        value: 303,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 306,
                        col: 1,
                        value: "Nguyễn Thị Tâm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 306,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 306,
                        col: 3,
                        value: "Trưởng bộ phận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 306,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 307,
                        col: 0,
                        rowSpan: 1,
                        value: 304,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 307,
                        col: 1,
                        value: "Nguyễn Thị Thái Thanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 307,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 307,
                        col: 3,
                        value: "Trưởng bộ phận DVKH",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 307,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 308,
                        col: 0,
                        rowSpan: 1,
                        value: 305,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 308,
                        col: 1,
                        value: "Nguyễn Thị Thu Phượng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 308,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 308,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 308,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 309,
                        col: 0,
                        rowSpan: 1,
                        value: 306,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 309,
                        col: 1,
                        value: "Nguyễn Thị Thủy",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 309,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 309,
                        col: 3,
                        value: "Nhân viên xử lý đơn hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 309,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 310,
                        col: 0,
                        rowSpan: 1,
                        value: 307,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 310,
                        col: 1,
                        value: "Nguyễn Thị Thùy Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 310,
                        col: 2,
                        value: "DVKH Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 310,
                        col: 3,
                        value: "Nhân viên hóa đơn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 310,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 311,
                        col: 0,
                        rowSpan: 1,
                        value: 308,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 311,
                        col: 1,
                        value: "Nguyễn Thị Tuyết Sương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 311,
                        col: 2,
                        value: "Phòng Kế toán",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 311,
                        col: 3,
                        value: "Kế toán thanh toán",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 311,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 312,
                        col: 0,
                        rowSpan: 1,
                        value: 309,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 312,
                        col: 1,
                        value: "Nguyễn Tiến Dũng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 312,
                        col: 2,
                        value: "HCM2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 312,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 312,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 313,
                        col: 0,
                        rowSpan: 1,
                        value: 310,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 313,
                        col: 1,
                        value: "Nguyễn Triều",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 313,
                        col: 2,
                        value: "Đắk Nông",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 313,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 313,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 314,
                        col: 0,
                        rowSpan: 1,
                        value: 311,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 314,
                        col: 1,
                        value: "Nguyễn Trọng Tình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 314,
                        col: 2,
                        value: "Tổ khuôn máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 314,
                        col: 3,
                        value: "Tổ trưởng khuôn máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 314,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 315,
                        col: 0,
                        rowSpan: 1,
                        value: 312,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 315,
                        col: 1,
                        value: "Nguyễn Trường Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 315,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 315,
                        col: 3,
                        value: "Công nhân tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 315,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 316,
                        col: 0,
                        rowSpan: 1,
                        value: 313,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 316,
                        col: 1,
                        value: "Nguyễn Trường Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 316,
                        col: 2,
                        value: "Tổ QLCL ca 3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 316,
                        col: 3,
                        value: "Nhân viên QLCL Ca",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 316,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 317,
                        col: 0,
                        rowSpan: 1,
                        value: 314,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 317,
                        col: 1,
                        value: "Nguyễn Trường Hải",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 317,
                        col: 2,
                        value: "Kho nguyên liệu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 317,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 317,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 318,
                        col: 0,
                        rowSpan: 1,
                        value: 315,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 318,
                        col: 1,
                        value: "Nguyễn Tuấn Hào",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 318,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 318,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 318,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 319,
                        col: 0,
                        rowSpan: 1,
                        value: 316,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 319,
                        col: 1,
                        value: "Nguyễn Tuấn Hùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 319,
                        col: 2,
                        value: "HCM2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 319,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 319,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 320,
                        col: 0,
                        rowSpan: 1,
                        value: 317,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 320,
                        col: 1,
                        value: "Nguyễn Tuấn Kiệt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 320,
                        col: 2,
                        value: "Mekong 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 320,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 320,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 321,
                        col: 0,
                        rowSpan: 1,
                        value: 318,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 321,
                        col: 1,
                        value: "Nguyễn Văn Bảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 321,
                        col: 2,
                        value: "HCM2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 321,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 321,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 322,
                        col: 0,
                        rowSpan: 1,
                        value: 319,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 322,
                        col: 1,
                        value: "Nguyễn Văn Dinh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 322,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 322,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 322,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 323,
                        col: 0,
                        rowSpan: 1,
                        value: 320,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 323,
                        col: 1,
                        value: "Nguyễn Văn Dũng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 323,
                        col: 2,
                        value: "Tổ gia công lắp ráp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 323,
                        col: 3,
                        value: "Nhân viên gia công & lắp ráp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 323,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 324,
                        col: 0,
                        rowSpan: 1,
                        value: 321,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 324,
                        col: 1,
                        value: "Nguyễn Văn Hiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 324,
                        col: 2,
                        value: "HCM2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 324,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 324,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 325,
                        col: 0,
                        rowSpan: 1,
                        value: 322,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 325,
                        col: 1,
                        value: "Nguyễn Văn Kỳ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 325,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 325,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 325,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 326,
                        col: 0,
                        rowSpan: 1,
                        value: 323,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 326,
                        col: 1,
                        value: "Nguyễn Văn Lan",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 326,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 326,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 326,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 327,
                        col: 0,
                        rowSpan: 1,
                        value: 324,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 327,
                        col: 1,
                        value: "Nguyễn Văn Mãi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 327,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 327,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 327,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 328,
                        col: 0,
                        rowSpan: 1,
                        value: 325,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 328,
                        col: 1,
                        value: "Nguyễn Văn Mẫn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 328,
                        col: 2,
                        value: "Trà Vinh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 328,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 328,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 329,
                        col: 0,
                        rowSpan: 1,
                        value: 326,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 329,
                        col: 1,
                        value: "Nguyễn Văn Nang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 329,
                        col: 2,
                        value: "Mekong 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 329,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 329,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 330,
                        col: 0,
                        rowSpan: 1,
                        value: 327,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 330,
                        col: 1,
                        value: "Nguyễn Văn Phép",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 330,
                        col: 2,
                        value: "Vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 330,
                        col: 3,
                        value: "Công nhân vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 330,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 331,
                        col: 0,
                        rowSpan: 1,
                        value: 328,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 331,
                        col: 1,
                        value: "Nguyễn Văn Phong",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 331,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 331,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 331,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 332,
                        col: 0,
                        rowSpan: 1,
                        value: 329,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 332,
                        col: 1,
                        value: "Nguyễn Văn Quốc Thái",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 332,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 332,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 332,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 333,
                        col: 0,
                        rowSpan: 1,
                        value: 330,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 333,
                        col: 1,
                        value: "Nguyễn Văn Sáng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 333,
                        col: 2,
                        value: "Tổ gia công lắp ráp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 333,
                        col: 3,
                        value: "Tổ trưởng gia công & lắp ráp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 333,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 334,
                        col: 0,
                        rowSpan: 1,
                        value: 331,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 334,
                        col: 1,
                        value: "Nguyễn Văn Tâm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 334,
                        col: 2,
                        value: "Đồng Nai",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 334,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 334,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 335,
                        col: 0,
                        rowSpan: 1,
                        value: 332,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 335,
                        col: 1,
                        value: "Nguyễn Văn test",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 335,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 335,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 335,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 336,
                        col: 0,
                        rowSpan: 1,
                        value: 333,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 336,
                        col: 1,
                        value: "Nguyễn Văn test",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 336,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 336,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 336,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 337,
                        col: 0,
                        rowSpan: 1,
                        value: 334,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 337,
                        col: 1,
                        value: "Nguyễn Văn test",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 337,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 337,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 337,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 338,
                        col: 0,
                        rowSpan: 1,
                        value: 335,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 338,
                        col: 1,
                        value: "Nguyễn Văn Thạch",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 338,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 338,
                        col: 3,
                        value: "Tổ phó tổ nguyên liệu  PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 338,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 339,
                        col: 0,
                        rowSpan: 1,
                        value: 336,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 339,
                        col: 1,
                        value: "Nguyễn Văn Thịnh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 339,
                        col: 2,
                        value: "Bình Định",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 339,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 339,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 340,
                        col: 0,
                        rowSpan: 1,
                        value: 337,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 340,
                        col: 1,
                        value: "Nguyễn Văn Thương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 340,
                        col: 2,
                        value: "Tổ QLCL ca 3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 340,
                        col: 3,
                        value: "Tổ trưởng QLCL Ca",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 340,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 341,
                        col: 0,
                        rowSpan: 1,
                        value: 338,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 341,
                        col: 1,
                        value: "Nguyễn Văn Tiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 341,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 341,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 341,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 342,
                        col: 0,
                        rowSpan: 1,
                        value: 339,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 342,
                        col: 1,
                        value: "Nguyễn Văn Toại",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 342,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 342,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 342,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 343,
                        col: 0,
                        rowSpan: 1,
                        value: 340,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 343,
                        col: 1,
                        value: "Nguyễn Văn Toán",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 343,
                        col: 2,
                        value: "Tổ nhập kho PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 343,
                        col: 3,
                        value: "Nhân viên nhập kho PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 343,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 344,
                        col: 0,
                        rowSpan: 1,
                        value: 341,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 344,
                        col: 1,
                        value: "Nguyễn Văn Toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 344,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn HDPE/PPR",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 344,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy đùn HDPE/PPR",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 344,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 345,
                        col: 0,
                        rowSpan: 1,
                        value: 342,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 345,
                        col: 1,
                        value: "Nguyễn Xuân Vui",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 345,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 345,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 345,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 346,
                        col: 0,
                        rowSpan: 1,
                        value: 343,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 346,
                        col: 1,
                        value: "Nìm Kim Bảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 346,
                        col: 2,
                        value: "Tổ nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 346,
                        col: 3,
                        value: "Nhân viên nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 346,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 347,
                        col: 0,
                        rowSpan: 1,
                        value: 344,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 347,
                        col: 1,
                        value: "Nông Văn Trình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 347,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 347,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 347,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 348,
                        col: 0,
                        rowSpan: 1,
                        value: 345,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 348,
                        col: 1,
                        value: "NPP An Quang Minh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 348,
                        col: 2,
                        value: "Bộ phận Test",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 348,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 348,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 349,
                        col: 0,
                        rowSpan: 1,
                        value: 346,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 349,
                        col: 1,
                        value: "NPP HIGG Tây Nguyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 349,
                        col: 2,
                        value: "NPP HIGG Tây Nguyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 349,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 349,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 350,
                        col: 0,
                        rowSpan: 1,
                        value: 347,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 350,
                        col: 1,
                        value: "NPP Nguyên Hải - Gia Lai",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 350,
                        col: 2,
                        value: "TTPP Nguyên Hải - Gia Lai",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 350,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 350,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 351,
                        col: 0,
                        rowSpan: 1,
                        value: 348,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 351,
                        col: 1,
                        value: "NPP Phượng Hoàng - Bình Định",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 351,
                        col: 2,
                        value: "NPP Phượng Hoàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 351,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 351,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 352,
                        col: 0,
                        rowSpan: 1,
                        value: 349,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 352,
                        col: 1,
                        value: "Phạm Cường",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 352,
                        col: 2,
                        value: "Miền Trung 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 352,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 352,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 353,
                        col: 0,
                        rowSpan: 1,
                        value: 350,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 353,
                        col: 1,
                        value: "Phạm Đại Huynh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 353,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 353,
                        col: 3,
                        value: "Tài xế xe nâng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 353,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 354,
                        col: 0,
                        rowSpan: 1,
                        value: 351,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 354,
                        col: 1,
                        value: "Phạm Đức Đạt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 354,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 354,
                        col: 3,
                        value: "PTGD kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 354,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 355,
                        col: 0,
                        rowSpan: 1,
                        value: 352,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 355,
                        col: 1,
                        value: "Phạm Đức Nhật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 355,
                        col: 2,
                        value: "Phòng kinh doanh 3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 355,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 355,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 356,
                        col: 0,
                        rowSpan: 1,
                        value: 353,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 356,
                        col: 1,
                        value: "Phạm Đức Thuận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 356,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 356,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 356,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 357,
                        col: 0,
                        rowSpan: 1,
                        value: 354,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 357,
                        col: 1,
                        value: "Phạm Hàng Vĩnh Phương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 357,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 357,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 357,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 358,
                        col: 0,
                        rowSpan: 1,
                        value: 355,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 358,
                        col: 1,
                        value: "Phạm Hoài Chung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 358,
                        col: 2,
                        value: "Bình Thuận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 358,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 358,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 359,
                        col: 0,
                        rowSpan: 1,
                        value: 356,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 359,
                        col: 1,
                        value: "Phạm Hoàng Bảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 359,
                        col: 2,
                        value: "Ban ISO",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 359,
                        col: 3,
                        value: "Trưởng Ban ISO",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 359,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 360,
                        col: 0,
                        rowSpan: 1,
                        value: 357,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 360,
                        col: 1,
                        value: "Phạm Hoàng Tiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 360,
                        col: 2,
                        value: "Tiền Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 360,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 360,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 361,
                        col: 0,
                        rowSpan: 1,
                        value: 358,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 361,
                        col: 1,
                        value: "Phạm Hồng Thạch",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 361,
                        col: 2,
                        value: "BP Dịch vụ kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 361,
                        col: 3,
                        value: "Trưởng nhóm Kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 361,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 362,
                        col: 0,
                        rowSpan: 1,
                        value: 359,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 362,
                        col: 1,
                        value: "Phạm Hồng Tuấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 362,
                        col: 2,
                        value: "Phòng CSKH",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 362,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 362,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 363,
                        col: 0,
                        rowSpan: 1,
                        value: 360,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 363,
                        col: 1,
                        value: "Phạm Hữu Phước",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 363,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 363,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 363,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 364,
                        col: 0,
                        rowSpan: 1,
                        value: 361,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 364,
                        col: 1,
                        value: "Phạm Lương Anh Minh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 364,
                        col: 2,
                        value: "Phòng CSKH",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 364,
                        col: 3,
                        value: "Phó phòng CSKH",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 364,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 365,
                        col: 0,
                        rowSpan: 1,
                        value: 362,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 365,
                        col: 1,
                        value: "Phạm Minh Chí",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 365,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 365,
                        col: 3,
                        value: "Nhân viên lái xe",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 365,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 366,
                        col: 0,
                        rowSpan: 1,
                        value: 363,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 366,
                        col: 1,
                        value: "Phạm Minh Phương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 366,
                        col: 2,
                        value: "Tổ xử lý phế PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 366,
                        col: 3,
                        value: "Tổ trưởng xử lý phế PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 366,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 367,
                        col: 0,
                        rowSpan: 1,
                        value: 364,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 367,
                        col: 1,
                        value: "Phạm Minh Phương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 367,
                        col: 2,
                        value: "Tổ nhập kho PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 367,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 367,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 368,
                        col: 0,
                        rowSpan: 1,
                        value: 365,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 368,
                        col: 1,
                        value: "Phạm Minh Thư",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 368,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 368,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 368,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 369,
                        col: 0,
                        rowSpan: 1,
                        value: 366,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 369,
                        col: 1,
                        value: "Phạm Ngọc Nhã",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 369,
                        col: 2,
                        value: "Bình Thuận",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 369,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 369,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 370,
                        col: 0,
                        rowSpan: 1,
                        value: 367,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 370,
                        col: 1,
                        value: "Phạm Nguyễn Duy Hải",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 370,
                        col: 2,
                        value: "Phòng Kinh doanh 4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 370,
                        col: 3,
                        value: "Trưởng phòng kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 370,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 371,
                        col: 0,
                        rowSpan: 1,
                        value: 368,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 371,
                        col: 1,
                        value: "Phạm Quốc Thông",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 371,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 371,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 371,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 372,
                        col: 0,
                        rowSpan: 1,
                        value: 369,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 372,
                        col: 1,
                        value: "Phạm Thanh Liêm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 372,
                        col: 2,
                        value: "Tổ công nghệ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 372,
                        col: 3,
                        value: "Nhân viên công nghệ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 372,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 373,
                        col: 0,
                        rowSpan: 1,
                        value: 370,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 373,
                        col: 1,
                        value: "Phạm Thanh Vi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 373,
                        col: 2,
                        value: "Tổ QLCL Ca 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 373,
                        col: 3,
                        value: "Tổ trưởng QLCL Ca",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 373,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 374,
                        col: 0,
                        rowSpan: 1,
                        value: 371,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 374,
                        col: 1,
                        value: "Phạm Văn Sơn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 374,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 374,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 374,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 375,
                        col: 0,
                        rowSpan: 1,
                        value: 372,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 375,
                        col: 1,
                        value: "Phạm Văn Trí",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 375,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 375,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 375,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 376,
                        col: 0,
                        rowSpan: 1,
                        value: 373,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 376,
                        col: 1,
                        value: "Phạm Văn Tường",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 376,
                        col: 2,
                        value: "Tổ sửa chữa hàn dán máy ép phun",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 376,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy hàn dán",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 376,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 377,
                        col: 0,
                        rowSpan: 1,
                        value: 374,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 377,
                        col: 1,
                        value: "Phạm Văn Uyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 377,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 377,
                        col: 3,
                        value: "Trưởng phòng kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 377,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 378,
                        col: 0,
                        rowSpan: 1,
                        value: 375,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 378,
                        col: 1,
                        value: "Phạm Viết Sang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 378,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 378,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 378,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 379,
                        col: 0,
                        rowSpan: 1,
                        value: 376,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 379,
                        col: 1,
                        value: "Phạm Viết Sang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 379,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 379,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 379,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 380,
                        col: 0,
                        rowSpan: 1,
                        value: 377,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 380,
                        col: 1,
                        value: "Phan Anh Trí",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 380,
                        col: 2,
                        value: "Đắk Lắk",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 380,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 380,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 381,
                        col: 0,
                        rowSpan: 1,
                        value: 378,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 381,
                        col: 1,
                        value: "Phan Chí Hậu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 381,
                        col: 2,
                        value: "Bà Rịa - Vũng Tàu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 381,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 381,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 382,
                        col: 0,
                        rowSpan: 1,
                        value: 379,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 382,
                        col: 1,
                        value: "Phan Đăng Sơn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 382,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 382,
                        col: 3,
                        value: "Công nhân tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 382,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 383,
                        col: 0,
                        rowSpan: 1,
                        value: 380,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 383,
                        col: 1,
                        value: "Phan Lê Sơn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 383,
                        col: 2,
                        value: "Phòng Kinh doanh 4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 383,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 383,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 384,
                        col: 0,
                        rowSpan: 1,
                        value: 381,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 384,
                        col: 1,
                        value: "Phan Quốc Phú",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 384,
                        col: 2,
                        value: "Bộ phận Bảo trì",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 384,
                        col: 3,
                        value: "Trưởng bộ phận bảo trì",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 384,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 385,
                        col: 0,
                        rowSpan: 1,
                        value: 382,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 385,
                        col: 1,
                        value: "Phan Thanh Minh Vương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 385,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 385,
                        col: 3,
                        value: "Tổ phó tổ nguyên liệu  PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 385,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 386,
                        col: 0,
                        rowSpan: 1,
                        value: 383,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 386,
                        col: 1,
                        value: "Phan Thành Tài",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 386,
                        col: 2,
                        value: "BP Dịch vụ kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 386,
                        col: 3,
                        value: "Nhân viên kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 386,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 387,
                        col: 0,
                        rowSpan: 1,
                        value: 384,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 387,
                        col: 1,
                        value: "Phan Văn Châu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 387,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 387,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 387,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 388,
                        col: 0,
                        rowSpan: 1,
                        value: 385,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 388,
                        col: 1,
                        value: "Phan Văn Thắng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 388,
                        col: 2,
                        value: "Phòng kinh doanh 3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 388,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 388,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 389,
                        col: 0,
                        rowSpan: 1,
                        value: 386,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 389,
                        col: 1,
                        value: "Phan Vủ Linh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 389,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 389,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 389,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 390,
                        col: 0,
                        rowSpan: 1,
                        value: 387,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 390,
                        col: 1,
                        value: "Phí Văn Huân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 390,
                        col: 2,
                        value: "HCM3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 390,
                        col: 3,
                        value: "Quản lý vùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 390,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 391,
                        col: 0,
                        rowSpan: 1,
                        value: 388,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 391,
                        col: 1,
                        value: "Quách Bình Triệu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 391,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 391,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 391,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 392,
                        col: 0,
                        rowSpan: 1,
                        value: 389,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 392,
                        col: 1,
                        value: "Sơn Hoàng Danh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 392,
                        col: 2,
                        value: "Long An",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 392,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 392,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 393,
                        col: 0,
                        rowSpan: 1,
                        value: 390,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 393,
                        col: 1,
                        value: "Test Thôi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 393,
                        col: 2,
                        value: "Bộ phận Test",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 393,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 393,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 394,
                        col: 0,
                        rowSpan: 1,
                        value: 391,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 394,
                        col: 1,
                        value: "Thái Minh Đức",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 394,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 394,
                        col: 3,
                        value: "Nhân viên giám sát hàng hóa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 394,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 395,
                        col: 0,
                        rowSpan: 1,
                        value: 392,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 395,
                        col: 1,
                        value: "Thái Minh Phương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 395,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 395,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 395,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 396,
                        col: 0,
                        rowSpan: 1,
                        value: 393,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 396,
                        col: 1,
                        value: "Thái Minh Trọng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 396,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 396,
                        col: 3,
                        value: "Nhân viên giám sát hàng hóa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 396,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 397,
                        col: 0,
                        rowSpan: 1,
                        value: 394,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 397,
                        col: 1,
                        value: "Thái Quốc Hoàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 397,
                        col: 2,
                        value: "Vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 397,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 397,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 398,
                        col: 0,
                        rowSpan: 1,
                        value: 395,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 398,
                        col: 1,
                        value: "Thái Tấn Huyện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 398,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 398,
                        col: 3,
                        value: "Tổ trưởng tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 398,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 399,
                        col: 0,
                        rowSpan: 1,
                        value: 396,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 399,
                        col: 1,
                        value: "Thái Văn Tiếp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 399,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 399,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 399,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 400,
                        col: 0,
                        rowSpan: 1,
                        value: 397,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 400,
                        col: 1,
                        value: "Thân Văn Quang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 400,
                        col: 2,
                        value: "Phòng kinh doanh 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 400,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 400,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 401,
                        col: 0,
                        rowSpan: 1,
                        value: 398,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 401,
                        col: 1,
                        value: "Thanh Yên Test",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 401,
                        col: 2,
                        value: "Bộ phận Test",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 401,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 401,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 402,
                        col: 0,
                        rowSpan: 1,
                        value: 399,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 402,
                        col: 1,
                        value: "Tô Bá Thạch",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 402,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 402,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 402,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 403,
                        col: 0,
                        rowSpan: 1,
                        value: 400,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 403,
                        col: 1,
                        value: "Tô Văn Thắng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 403,
                        col: 2,
                        value: "Tổ nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 403,
                        col: 3,
                        value: "Nhân viên nhập kho PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 403,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 404,
                        col: 0,
                        rowSpan: 1,
                        value: 401,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 404,
                        col: 1,
                        value: "Tôn Gia Linh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 404,
                        col: 2,
                        value: "HCM4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 404,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 404,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 405,
                        col: 0,
                        rowSpan: 1,
                        value: 402,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 405,
                        col: 1,
                        value: "Trà Văn Mãi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 405,
                        col: 2,
                        value: "Tổ nguyên liệu PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 405,
                        col: 3,
                        value: "Nhân viên xử lý phế PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 405,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 406,
                        col: 0,
                        rowSpan: 1,
                        value: 403,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 406,
                        col: 1,
                        value: "Trầm Quốc Bảo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 406,
                        col: 2,
                        value: "Ca sản xuất PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 406,
                        col: 3,
                        value: "Trưởng ca sản xuất PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 406,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 407,
                        col: 0,
                        rowSpan: 1,
                        value: 404,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 407,
                        col: 1,
                        value: "Trầm Thị Ngọc Bình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 407,
                        col: 2,
                        value: "DVKH Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 407,
                        col: 3,
                        value: "Trưởng bộ phận DVKH",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 407,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 408,
                        col: 0,
                        rowSpan: 1,
                        value: 405,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 408,
                        col: 1,
                        value: "Trần Anh Tuấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 408,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn HDPE/PPR",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 408,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy đùn HDPE/PPR",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 408,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 409,
                        col: 0,
                        rowSpan: 1,
                        value: 406,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 409,
                        col: 1,
                        value: "Trần Châu Tuấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 409,
                        col: 2,
                        value: "Tổ phụ kiện PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 409,
                        col: 3,
                        value: "Tổ trưởng phụ kiện PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 409,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 410,
                        col: 0,
                        rowSpan: 1,
                        value: 407,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 410,
                        col: 1,
                        value: "Trần Công Thành",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 410,
                        col: 2,
                        value: "Khánh Hòa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 410,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 410,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 411,
                        col: 0,
                        rowSpan: 1,
                        value: 408,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 411,
                        col: 1,
                        value: "Trần Danh Linh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 411,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 411,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 411,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 412,
                        col: 0,
                        rowSpan: 1,
                        value: 409,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 412,
                        col: 1,
                        value: "Trần Danh Nhật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 412,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 412,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 412,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 413,
                        col: 0,
                        rowSpan: 1,
                        value: 410,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 413,
                        col: 1,
                        value: "Trần Diễm Trang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 413,
                        col: 2,
                        value: "Bình Phước",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 413,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 413,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 414,
                        col: 0,
                        rowSpan: 1,
                        value: 411,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 414,
                        col: 1,
                        value: "Trần Đình Duy",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 414,
                        col: 2,
                        value: "Quảng Ngãi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 414,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 414,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 415,
                        col: 0,
                        rowSpan: 1,
                        value: 412,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 415,
                        col: 1,
                        value: "Trần Đình Tuấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 415,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 415,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 415,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 416,
                        col: 0,
                        rowSpan: 1,
                        value: 413,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 416,
                        col: 1,
                        value: "Trần Đỗ Khoa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 416,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 416,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 416,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 417,
                        col: 0,
                        rowSpan: 1,
                        value: 414,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 417,
                        col: 1,
                        value: "Trần Duy Khánh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 417,
                        col: 2,
                        value: "Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 417,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 417,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 418,
                        col: 0,
                        rowSpan: 1,
                        value: 415,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 418,
                        col: 1,
                        value: "Trần Hạnh Nguyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 418,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 418,
                        col: 3,
                        value: "Nhân viên xử lý đơn hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 418,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 419,
                        col: 0,
                        rowSpan: 1,
                        value: 416,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 419,
                        col: 1,
                        value: "Trần Hoàng Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 419,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 419,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 419,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 420,
                        col: 0,
                        rowSpan: 1,
                        value: 417,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 420,
                        col: 1,
                        value: "Trần Hoàng Hiếu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 420,
                        col: 2,
                        value: "Vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 420,
                        col: 3,
                        value: "Trưởng nhóm vận hành máy ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 420,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 421,
                        col: 0,
                        rowSpan: 1,
                        value: 418,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 421,
                        col: 1,
                        value: "Trần Hoàng Phúc",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 421,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 421,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 421,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 422,
                        col: 0,
                        rowSpan: 1,
                        value: 419,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 422,
                        col: 1,
                        value: "Trần Hoàng Vĩ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 422,
                        col: 2,
                        value: "Tổ khuôn máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 422,
                        col: 3,
                        value: "Nhân viên khuôn máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 422,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 423,
                        col: 0,
                        rowSpan: 1,
                        value: 420,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 423,
                        col: 1,
                        value: "Trần Hồng Loan",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 423,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 423,
                        col: 3,
                        value: "Nhân viên xử lý đơn hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 423,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 424,
                        col: 0,
                        rowSpan: 1,
                        value: 421,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 424,
                        col: 1,
                        value: "Trần Lĩnh Trường",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 424,
                        col: 2,
                        value: "Phòng Kinh doanh 4",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 424,
                        col: 3,
                        value: "Quản lý vùng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 424,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 425,
                        col: 0,
                        rowSpan: 1,
                        value: 422,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 425,
                        col: 1,
                        value: "Trần Mậu Trung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 425,
                        col: 2,
                        value: "Vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 425,
                        col: 3,
                        value: "Công nhân vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 425,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 426,
                        col: 0,
                        rowSpan: 1,
                        value: 423,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 426,
                        col: 1,
                        value: "Trần Ngọc Lan Trinh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 426,
                        col: 2,
                        value: "Kho thành phẩm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 426,
                        col: 3,
                        value: "Nhân viên thống kê kho thành phẩm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 426,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 427,
                        col: 0,
                        rowSpan: 1,
                        value: 424,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 427,
                        col: 1,
                        value: "Trần Ngọc Minh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 427,
                        col: 2,
                        value: "Phòng kinh doanh 3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 427,
                        col: 3,
                        value: "Trưởng phòng kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 427,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 428,
                        col: 0,
                        rowSpan: 1,
                        value: 425,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 428,
                        col: 1,
                        value: "Trần Phú Tính",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 428,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 428,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 428,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 429,
                        col: 0,
                        rowSpan: 1,
                        value: 426,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 429,
                        col: 1,
                        value: "Trần Quang Tuân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 429,
                        col: 2,
                        value: "BP Dịch vụ kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 429,
                        col: 3,
                        value: "Nhân viên kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 429,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 430,
                        col: 0,
                        rowSpan: 1,
                        value: 427,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 430,
                        col: 1,
                        value: "Trần Quốc Đạt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 430,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 430,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 430,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 431,
                        col: 0,
                        rowSpan: 1,
                        value: 428,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 431,
                        col: 1,
                        value: "Trần Quốc Dũng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 431,
                        col: 2,
                        value: "An Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 431,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 431,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 432,
                        col: 0,
                        rowSpan: 1,
                        value: 429,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 432,
                        col: 1,
                        value: "Trần Thanh Đức",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 432,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 432,
                        col: 3,
                        value: "Nhân viên lái xe",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 432,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 433,
                        col: 0,
                        rowSpan: 1,
                        value: 430,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 433,
                        col: 1,
                        value: "Trần Thanh Tình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 433,
                        col: 2,
                        value: "Miền Đông 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 433,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 433,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 434,
                        col: 0,
                        rowSpan: 1,
                        value: 431,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 434,
                        col: 1,
                        value: "Trần Thanh Tình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 434,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 434,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 434,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 435,
                        col: 0,
                        rowSpan: 1,
                        value: 432,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 435,
                        col: 1,
                        value: "Trần Thanh Toại",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 435,
                        col: 2,
                        value: "Tổ khuôn máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 435,
                        col: 3,
                        value: "Nhân viên khuôn máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 435,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 436,
                        col: 0,
                        rowSpan: 1,
                        value: 433,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 436,
                        col: 1,
                        value: "Trần Thanh Tú",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 436,
                        col: 2,
                        value: "Phân xưởng 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 436,
                        col: 3,
                        value: "Phó giám đốc sản xuất PE",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 436,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 437,
                        col: 0,
                        rowSpan: 1,
                        value: 434,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 437,
                        col: 1,
                        value: "Trần Thanh Văn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 437,
                        col: 2,
                        value: "Cà Mau",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 437,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 437,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 438,
                        col: 0,
                        rowSpan: 1,
                        value: 435,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 438,
                        col: 1,
                        value: "Trần Thế Anh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 438,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 438,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 438,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 439,
                        col: 0,
                        rowSpan: 1,
                        value: 436,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 439,
                        col: 1,
                        value: "Trần Thị Ngọc Điểm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 439,
                        col: 2,
                        value: "BP Nhân sự Tiền lương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 439,
                        col: 3,
                        value: "Nhân viên nhân sự",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 439,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 440,
                        col: 0,
                        rowSpan: 1,
                        value: 437,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 440,
                        col: 1,
                        value: "Trần Thị Ngọc Loan",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 440,
                        col: 2,
                        value: "Bộ phận Marketing",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 440,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 440,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 441,
                        col: 0,
                        rowSpan: 1,
                        value: 438,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 441,
                        col: 1,
                        value: "Trần Thị Thu Ngân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 441,
                        col: 2,
                        value: "Lâm Đồng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 441,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 441,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 442,
                        col: 0,
                        rowSpan: 1,
                        value: 439,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 442,
                        col: 1,
                        value: "Trần Thiện Thanh Lý",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 442,
                        col: 2,
                        value: "Phân xưởng 1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 442,
                        col: 3,
                        value: "Điều phối sản xuất PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 442,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 443,
                        col: 0,
                        rowSpan: 1,
                        value: 440,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 443,
                        col: 1,
                        value: "Trần Trọng Bình",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 443,
                        col: 2,
                        value: "Phòng thử nghiệm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 443,
                        col: 3,
                        value: "Quản lý chất lượng phòng thử nghiệm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 443,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 444,
                        col: 0,
                        rowSpan: 1,
                        value: 441,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 444,
                        col: 1,
                        value: "Trần Trung Hậu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 444,
                        col: 2,
                        value: "Mekong 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 444,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 444,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 445,
                        col: 0,
                        rowSpan: 1,
                        value: 442,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 445,
                        col: 1,
                        value: "Trần Tuấn Vũ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 445,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 445,
                        col: 3,
                        value: "Tổ trưởng tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 445,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 446,
                        col: 0,
                        rowSpan: 1,
                        value: 443,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 446,
                        col: 1,
                        value: "Trần Tường",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 446,
                        col: 2,
                        value: "HCM3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 446,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 446,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 447,
                        col: 0,
                        rowSpan: 1,
                        value: 444,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 447,
                        col: 1,
                        value: "Trần Văn Đại",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 447,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 447,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 447,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 448,
                        col: 0,
                        rowSpan: 1,
                        value: 445,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 448,
                        col: 1,
                        value: "Trần Văn Đông",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 448,
                        col: 2,
                        value: "Bộ phận Test",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 448,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 448,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 449,
                        col: 0,
                        rowSpan: 1,
                        value: 446,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 449,
                        col: 1,
                        value: "Trần Văn Hài Nhi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 449,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 449,
                        col: 3,
                        value: "Tài xế xe nâng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 449,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 450,
                        col: 0,
                        rowSpan: 1,
                        value: 447,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 450,
                        col: 1,
                        value: "Trần Văn Huyện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 450,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 450,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 450,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 451,
                        col: 0,
                        rowSpan: 1,
                        value: 448,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 451,
                        col: 1,
                        value: "Trần Văn Nhựt",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 451,
                        col: 2,
                        value: "Quảng Nam",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 451,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 451,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 452,
                        col: 0,
                        rowSpan: 1,
                        value: 449,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 452,
                        col: 1,
                        value: "Trần Văn Quý",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 452,
                        col: 2,
                        value: "Đà Nẵng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 452,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 452,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 453,
                        col: 0,
                        rowSpan: 1,
                        value: 450,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 453,
                        col: 1,
                        value: "Trần Văn Tính",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 453,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 453,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 453,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 454,
                        col: 0,
                        rowSpan: 1,
                        value: 451,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 454,
                        col: 1,
                        value: "Trần Y Khoa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 454,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 454,
                        col: 3,
                        value: "Nhân viên giám sát hàng hóa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 454,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 455,
                        col: 0,
                        rowSpan: 1,
                        value: 452,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 455,
                        col: 1,
                        value: "Trịnh Anh Tuấn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 455,
                        col: 2,
                        value: "Tổ sửa chữa hàn dán máy ép phun",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 455,
                        col: 3,
                        value: "Tổ trưởng tổ sửa chữa máy hàn dán",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 455,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 456,
                        col: 0,
                        rowSpan: 1,
                        value: 453,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 456,
                        col: 1,
                        value: "Trịnh Công Chiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 456,
                        col: 2,
                        value: "BP An ninh an toàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 456,
                        col: 3,
                        value: "Nhân viên giám sát hàng hóa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 456,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 457,
                        col: 0,
                        rowSpan: 1,
                        value: 454,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 457,
                        col: 1,
                        value: "Trịnh Công Chiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 457,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 457,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 457,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 458,
                        col: 0,
                        rowSpan: 1,
                        value: 455,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 458,
                        col: 1,
                        value: "Trịnh Công Thắng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 458,
                        col: 2,
                        value: "Tổ công nghệ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 458,
                        col: 3,
                        value: "Nhân viên công nghệ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 458,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 459,
                        col: 0,
                        rowSpan: 1,
                        value: 456,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 459,
                        col: 1,
                        value: "Trịnh Minh Lợi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 459,
                        col: 2,
                        value: "Tổ khuôn máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 459,
                        col: 3,
                        value: "Tổ phó khuôn máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 459,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 460,
                        col: 0,
                        rowSpan: 1,
                        value: 457,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 460,
                        col: 1,
                        value: "Trịnh Thị Thùy Dung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 460,
                        col: 2,
                        value: "BP Nhân sự Tiền lương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 460,
                        col: 3,
                        value: "Nhân viên hành chính",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 460,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 461,
                        col: 0,
                        rowSpan: 1,
                        value: 458,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 461,
                        col: 1,
                        value: "Trương Duy Khánh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 461,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 461,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 461,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 462,
                        col: 0,
                        rowSpan: 1,
                        value: 459,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 462,
                        col: 1,
                        value: "Trương Gia Phú",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 462,
                        col: 2,
                        value: "Vận hành máy PX3",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 462,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 462,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 463,
                        col: 0,
                        rowSpan: 1,
                        value: 460,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 463,
                        col: 1,
                        value: "Trương Hoàng Long",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 463,
                        col: 2,
                        value: "Cao Nguyên",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 463,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 463,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 464,
                        col: 0,
                        rowSpan: 1,
                        value: 461,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 464,
                        col: 1,
                        value: "Trương Ngọc Hoàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 464,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 464,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy đùn UPVC",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 464,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 465,
                        col: 0,
                        rowSpan: 1,
                        value: 462,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 465,
                        col: 1,
                        value: "Trương Quỳnh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 465,
                        col: 2,
                        value: "Phòng QLCL",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 465,
                        col: 3,
                        value: "Trưởng phòng QLCL",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 465,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 466,
                        col: 0,
                        rowSpan: 1,
                        value: 463,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 466,
                        col: 1,
                        value: "Trương Thanh Minh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 466,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 466,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 466,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 467,
                        col: 0,
                        rowSpan: 1,
                        value: 464,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 467,
                        col: 1,
                        value: "Trương Thành Tựu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 467,
                        col: 2,
                        value: "Hậu Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 467,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 467,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 468,
                        col: 0,
                        rowSpan: 1,
                        value: 465,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 468,
                        col: 1,
                        value: "Trương Trọng Nghĩa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 468,
                        col: 2,
                        value: "Phòng kinh doanh 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 468,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 468,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 469,
                        col: 0,
                        rowSpan: 1,
                        value: 466,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 469,
                        col: 1,
                        value: "Trương Văn Chứng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 469,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 469,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 469,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 470,
                        col: 0,
                        rowSpan: 1,
                        value: 467,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 470,
                        col: 1,
                        value: "Trương Văn Hiễn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 470,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 470,
                        col: 3,
                        value: "Công nhân vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 470,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 471,
                        col: 0,
                        rowSpan: 1,
                        value: 468,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 471,
                        col: 1,
                        value: "Trương Văn Phương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 471,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 471,
                        col: 3,
                        value: "Giám sát kho",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 471,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 472,
                        col: 0,
                        rowSpan: 1,
                        value: 469,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 472,
                        col: 1,
                        value: "TTPP Nhất Tâm Đại Tín",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 472,
                        col: 2,
                        value: "TTPP Nhất Tâm Đại Tín",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 472,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 472,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 473,
                        col: 0,
                        rowSpan: 1,
                        value: 470,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 473,
                        col: 1,
                        value: "Từ Văn Phát",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 473,
                        col: 2,
                        value: "Tổ khuôn máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 473,
                        col: 3,
                        value: "Nhân viên khuôn máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 473,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 474,
                        col: 0,
                        rowSpan: 1,
                        value: 471,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 474,
                        col: 1,
                        value: "uuuuu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 474,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 474,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 474,
                        col: 4,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        row: 475,
                        col: 0,
                        rowSpan: 1,
                        value: 472,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 475,
                        col: 1,
                        value: "Văn Anh Hoàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 475,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 475,
                        col: 3,
                        value: "Tài xế xe nâng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 475,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 476,
                        col: 0,
                        rowSpan: 1,
                        value: 473,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 476,
                        col: 1,
                        value: "Văn Kim Hoàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 476,
                        col: 2,
                        value: "Tổ khuôn máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 476,
                        col: 3,
                        value: "Nhân viên khuôn máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 476,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 477,
                        col: 0,
                        rowSpan: 1,
                        value: 474,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 477,
                        col: 1,
                        value: "Văn Kim Thanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 477,
                        col: 2,
                        value: "Phòng HCNS",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 477,
                        col: 3,
                        value: "Trưởng phòng Hành chính Nhân sự",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 477,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 478,
                        col: 0,
                        rowSpan: 1,
                        value: 475,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 478,
                        col: 1,
                        value: "Võ Đức Thông",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 478,
                        col: 2,
                        value: "Kiên Giang",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 478,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 478,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 479,
                        col: 0,
                        rowSpan: 1,
                        value: 476,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 479,
                        col: 1,
                        value: "Võ Duy Thuần",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 479,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 479,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 479,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 480,
                        col: 0,
                        rowSpan: 1,
                        value: 477,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 480,
                        col: 1,
                        value: "Võ Hồ Ngọc Nhung",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 480,
                        col: 2,
                        value: "Phòng CSKH",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 480,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 480,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 481,
                        col: 0,
                        rowSpan: 1,
                        value: 478,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 481,
                        col: 1,
                        value: "Võ Hoàng Vũ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 481,
                        col: 2,
                        value: "Bà Rịa - Vũng Tàu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 481,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 481,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 482,
                        col: 0,
                        rowSpan: 1,
                        value: 479,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 482,
                        col: 1,
                        value: "Võ Huỳnh Công Hiếu",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 482,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 482,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 482,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 483,
                        col: 0,
                        rowSpan: 1,
                        value: 480,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 483,
                        col: 1,
                        value: "Võ Kim Hoàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 483,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 483,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 483,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 484,
                        col: 0,
                        rowSpan: 1,
                        value: 481,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 484,
                        col: 1,
                        value: "Võ Lê Khánh Vân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 484,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 484,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 484,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 485,
                        col: 0,
                        rowSpan: 1,
                        value: 482,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 485,
                        col: 1,
                        value: "Võ Minh Luân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 485,
                        col: 2,
                        value: "HCM2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 485,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 485,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 486,
                        col: 0,
                        rowSpan: 1,
                        value: 483,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 486,
                        col: 1,
                        value: "Võ Minh Quân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 486,
                        col: 2,
                        value: "Kho ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 486,
                        col: 3,
                        value: "Công nhân tổ ống",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 486,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 487,
                        col: 0,
                        rowSpan: 1,
                        value: 484,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 487,
                        col: 1,
                        value: "Võ Minh Tiến",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 487,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 487,
                        col: 3,
                        value: "Công nhân vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 487,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 488,
                        col: 0,
                        rowSpan: 1,
                        value: 485,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 488,
                        col: 1,
                        value: "Võ Ngọc Ánh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 488,
                        col: 2,
                        value: "Miền Trung 2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 488,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 488,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 489,
                        col: 0,
                        rowSpan: 1,
                        value: 486,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 489,
                        col: 1,
                        value: "Võ Ngọc Khánh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 489,
                        col: 2,
                        value: "Đắk Lắk",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 489,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 489,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 490,
                        col: 0,
                        rowSpan: 1,
                        value: 487,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 490,
                        col: 1,
                        value: "Võ Thị Ánh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 490,
                        col: 2,
                        value: "DVKH Bình Dương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 490,
                        col: 3,
                        value: "Nhân viên hóa đơn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 490,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 491,
                        col: 0,
                        rowSpan: 1,
                        value: 488,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 491,
                        col: 1,
                        value: "Võ Thị Kiều Trâm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 491,
                        col: 2,
                        value: "Phòng Kế toán",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 491,
                        col: 3,
                        value: "Kế toán công nợ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 491,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 492,
                        col: 0,
                        rowSpan: 1,
                        value: 489,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 492,
                        col: 1,
                        value: "Võ Thị Mai Trân",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 492,
                        col: 2,
                        value: "Phòng Kế toán",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 492,
                        col: 3,
                        value: "Thủ quỹ",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 492,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 493,
                        col: 0,
                        rowSpan: 1,
                        value: 490,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 493,
                        col: 1,
                        value: "Võ Thị Minh Khôi",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 493,
                        col: 2,
                        value: "Phòng mua hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 493,
                        col: 3,
                        value: "Nhân viên mua hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 493,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 494,
                        col: 0,
                        rowSpan: 1,
                        value: 491,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 494,
                        col: 1,
                        value: "Võ Thị Thanh Nhã",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 494,
                        col: 2,
                        value: "Phòng HCNS",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 494,
                        col: 3,
                        value: "Trưởng phòng Hành chính Nhân sự",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 494,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 495,
                        col: 0,
                        rowSpan: 1,
                        value: 492,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 495,
                        col: 1,
                        value: "Vũ Bá Hoàn",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 495,
                        col: 2,
                        value: "Phòng Kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 495,
                        col: 3,
                        value: "Phó Phòng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 495,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 496,
                        col: 0,
                        rowSpan: 1,
                        value: 493,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 496,
                        col: 1,
                        value: "Vũ Duy Phương",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 496,
                        col: 2,
                        value: "Tây Ninh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 496,
                        col: 3,
                        value: "Đại diện kinh doanh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 496,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 497,
                        col: 0,
                        rowSpan: 1,
                        value: 494,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 497,
                        col: 1,
                        value: "Vũ Thành Vinh",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 497,
                        col: 2,
                        value: "Ban lãnh đạo",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 497,
                        col: 3,
                        value: "PTGD kỹ thuật",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 497,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 498,
                        col: 0,
                        rowSpan: 1,
                        value: 495,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 498,
                        col: 1,
                        value: "Vũ Thị Phượng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 498,
                        col: 2,
                        value: "Phòng thử nghiệm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 498,
                        col: 3,
                        value: "Nhân viên thử nghiệm",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 498,
                        col: 4,
                        value: "Nữ",
                        vertical: "middle"
                    },
                    {
                        row: 499,
                        col: 0,
                        rowSpan: 1,
                        value: 496,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 499,
                        col: 1,
                        value: "Vũ Thuận Hoàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 499,
                        col: 2,
                        value: "HCM2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 499,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 499,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 500,
                        col: 0,
                        rowSpan: 1,
                        value: 497,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 500,
                        col: 1,
                        value: "Vũ Văn Hòa",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 500,
                        col: 2,
                        value: "Vận hành máy PX1",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 500,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 500,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 501,
                        col: 0,
                        rowSpan: 1,
                        value: 498,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 501,
                        col: 1,
                        value: "Vũ Văn Hợp",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 501,
                        col: 2,
                        value: "Kho phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 501,
                        col: 3,
                        value: "Công nhân tổ phụ kiện",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 501,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 502,
                        col: 0,
                        rowSpan: 1,
                        value: 499,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 502,
                        col: 1,
                        value: "Vũ Việt Đức",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 502,
                        col: 2,
                        value: "DVKH HCM",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 502,
                        col: 3,
                        value: "Nhân viên xử lý đơn hàng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 502,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 503,
                        col: 0,
                        rowSpan: 1,
                        value: 500,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 503,
                        col: 1,
                        value: "Vương Quyết Thắng",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 503,
                        col: 2,
                        value: "Tổ sửa chữa máy đùn HDPE/PPR",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 503,
                        col: 3,
                        value: "Nhân viên tổ sửa chữa máy đùn HDPE/PPR",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 503,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 504,
                        col: 0,
                        rowSpan: 1,
                        value: 501,
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 504,
                        col: 1,
                        value: "Y IN",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 504,
                        col: 2,
                        value: "Vận hành máy PX2",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 504,
                        col: 3,
                        value: "",
                        vertical: "middle"
                    },
                    {
                        rowSpan: 1,
                        row: 504,
                        col: 4,
                        value: "Nam",
                        vertical: "middle"
                    },
                    {
                        row: 0,
                        col: 0,
                        value: {
                            richText: [
                                {
                                    text: "                                                                   ",
                                    font: {
                                        name: "Calibri"
                                    }
                                },
                                {
                                    text: "BÁO CÁO NHÂN SỰ ",
                                    font: {
                                        name: "Calibri",
                                        color: {
                                            argb: "ff2196f3"
                                        },
                                        bold: true,
                                        size: 14
                                    }
                                }
                            ]
                        }
                    },
                    {
                        row: 508,
                        col: 0,
                        value: {
                            richText: [
                                {
                                    text: "Xác nhận",
                                    font: {
                                        name: "Calibri"
                                    }
                                },
                                {
                                    text: "                                                                                         ",
                                    font: {
                                        name: "Calibri"
                                    }
                                },
                                {
                                    text: "Kí tên",
                                    font: {
                                        name: "Calibri"
                                    }
                                }
                            ]
                        }
                    },
                    {
                        row: 509,
                        col: 0,
                        value: {
                            richText: []
                        }
                    },
                    {
                        row: 510,
                        col: 0,
                        value: {
                            richText: []
                        }
                    },
                    {
                        row: 511,
                        col: 0,
                        value: {
                            richText: []
                        }
                    },
                    {
                        row: 512,
                        col: 0,
                        value: {
                            richText: []
                        }
                    },
                    {
                        row: 513,
                        col: 0,
                        value: {
                            richText: [
                                {
                                    text: "                                                                                                          ",
                                    font: {
                                        name: "Calibri"
                                    }
                                },
                                {
                                    text: "Nguyễn Văn A",
                                    font: {
                                        name: "Calibri"
                                    }
                                }
                            ]
                        }
                    }
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