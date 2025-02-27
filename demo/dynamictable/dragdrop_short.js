var source = "VMOqbiBuaMOibiB2acOqbgl2X2VtcGxveWVlX25hbWUJCTIwMAlI4buHIHRo4buRbmcJbW9yZV92ZXJ0Ck3DoyBuaMOibiB2acOqbgl2X2VtcGxveWVlX2NvZGUJCTEwMAlI4buHIHRo4buRbmcJbW9yZV92ZXJ0CkLhu5kgcGjhuq1uCXZfZW1wbG95ZWVfZGVwYXJ0bWVudAkJMjAwCUjhu4cgdGjhu5FuZwltb3JlX3ZlcnQKQ2jhu6ljIGRhbmgJdl9lbXBsb3llZV9wb3NpdGlvbgkJMjUwCUjhu4cgdGjhu5FuZwltb3JlX3ZlcnQKTMawxqFuZyBjxqEgYuG6o24Jdl9iYXNpY19zYWxhcnkJCTEwMAlI4buHIHRo4buRbmcJbW9yZV92ZXJ0CkzGsMahbmcgY2jDrW5oCXZfZ3Jvc3Nfc2FsYXJ5CQkxMDAJSOG7hyB0aOG7kW5nCW1vcmVfdmVydApDw7RuZyBjaHXhuqluCXZfc3RhbmRhcmRfd29ya2RheXMJCTUwCUjhu4cgdGjhu5FuZwltb3JlX3ZlcnQKQ8O0bmcgdGjhu7FjIHThur8Jdl9hY3R1YWxfd29ya2RheXMJCTUwCUjhu4cgdGjhu5FuZwltb3JlX3ZlcnQKTMawxqFuZyBsw6BtIHZp4buHYwlMdW9uZ19sYW1fdmllYwlT4butIGThu6VuZyBjw7RuZyB0aOG7qWMgdMOtbmg6IHZfYWN0dWFsX3dvcmtkYXlzL3Zfc3RhbmRhcmRfd29ya2RheXMqdl9ncm9zc19zYWxhcnkJMTAwCU5nxrDhu51pIGTDuW5nCW1vcmVfdmVydApUaMaw4bufbmcgaGnhu4d1IHN14bqldAlUaHVvbmdfaGlldV9zdWF0CUzhuqV5IHThu6sgY2jDrW5oIHPDoWNoIFRoxrDhu59uZyBoaeG7h3Ugc3XhuqV0CTEwMAlOZ8aw4budaSBkw7luZwltb3JlX3ZlcnQKVGjGsOG7n25nIHRow6ptCVRodW9uZ190aGVtCU5o4bqtcCB0cuG7sWMgdGnhur9wCTEwMAlOZ8aw4budaSBkw7luZwltb3JlX3ZlcnQKVGjGsOG7n25nIGNodXnDqm4gY+G6p24JVGh1b25nX2NodXllbl9jYW4JTOG6pXkgdOG7qyBjaMOtbmggc8OhY2ggVGjGsOG7n25nIGNodXnDqm4gY+G6p24JMTAwCU5nxrDhu51pIGTDuW5nCW1vcmVfdmVydApU4buVbmcgdGjGsOG7n25nCVRvbmdfdGh1b25nCVPhu60gZOG7pW5nIGPDtG5nIHRo4bupYyB0w61uaDogVGh1b25nX2hpZXVfc3VhdCArIFRodW9uZ19jaHV5ZW5fY2FuICsgVGh1b25nX3RoZW0JMTAwCU5nxrDhu51pIGTDuW5nCW1vcmVfdmVydApQaOG6oXQgxJFpIHRy4buFCVBoYXRfZGlfdHJlCUzhuqV5IHThu6sgY2jDrW5oIHPDoWNoIFBo4bqhdCDEkWkgdHLhu4UJMTAwCU5nxrDhu51pIGTDuW5nCW1vcmVfdmVydApYxINuZyB4ZQlYYW5nX3hlCUzhuqV5IHThu6sgY2jDrW5oIHPDoWNoIFjEg25nIHhlCTEwMAlOZ8aw4budaSBkw7luZwltb3JlX3ZlcnQKTmjDoCDhu58JTmhhX28JTOG6pXkgdOG7qyBjaMOtbmggc8OhY2ggTmjDoCDhu58JMTAwCU5nxrDhu51pIGTDuW5nCW1vcmVfdmVydArEkGnhu4duIHRob+G6oWkJRGllbl90aG9haQlM4bqleSB04burIGNow61uaCBzw6FjaCDEkGnhu4duIHRob+G6oWkJMTAwCU5nxrDhu51pIGTDuW5nCW1vcmVfdmVydApEdSBs4buLY2gJRHVfbGljaAlM4bqleSB04burIGNow61uaCBzw6FjaCBEdSBs4buLY2gJMTAwCU5nxrDhu51pIGTDuW5nCW1vcmVfdmVydApU4buVbmcgdGh1IG5o4bqtcAl2X3RvdGFsX2luY29tZQlT4butIGThu6VuZyBjw7RuZyB0aOG7qWMgdMOtbmg6IEx1b25nX2xhbV92aWVjICsgVG9uZ190aHVvbmcJMTAwCUjhu4cgdGjhu5FuZwltb3JlX3ZlcnQKVGh1IG5o4bqtcCBwaOG6o2kgxJHDs25nIHRodeG6vwl2X3RheGFibGVfaW5jb21lCVPhu60gZOG7pW5nIGPDtG5nIHRo4bupYyB0w61uaDogTHVvbmdfbGFtX3ZpZWMJMTAwCUjhu4cgdGjhu5FuZwltb3JlX3ZlcnQKVGh14bq/IHRodSBuaOG6rXAJdl9pbmNvbWVfdGF4CVPhu60gZOG7pW5nIGjDoG06IGdldF9pbmNvbWVfdGF4X2Zyb21fdGF4YWJsZV9pbmNvbWUgKE3DoyBj4bunYSBj4buZdDogdl90YXhhYmxlX2luY29tZTsgTcOjIG5ow6JuIHZpw6puKQkxMDAJSOG7hyB0aOG7kW5nCW1vcmVfdmVydApMxrDGoW5nIHRo4buxYyBuaOG6rW4Jdl9uZXRfcGF5CVPhu60gZOG7pW5nIGPDtG5nIHRo4bupYyB0w61uaDogdl90b3RhbF9pbmNvbWUgLSB2X2luY29tZV90YXgJMTAwCUjhu4cgdGjhu5FuZwltb3JlX3ZlcnQK";
var text = absol.base64.base64DecodeUnicode(source);
var lines = text.trim().split('\n');
var rawTableData = lines.map(t => t.split("\t")).slice(0, 2);
var adapter = {
    data: {
        rowsPerPage: Infinity,
        head: {
            rows: [
                {
                    cells: [
                        { child: { text: '' } },
                        { child: { text: 'Tên cột' } },
                        { child: { text: 'Mã' } },
                        { child: { text: 'Thiết lập' } },
                        { child: { text: 'Chiều rộng cột' } },
                        { child: { text: 'Loại' } },
                        { child: { text: '' } },
                    ]
                }
            ]
        },
        body: {
            rows: rawTableData.map((rawRow, i) => {
                return {
                    cells: [
                        {
                            class:  'as-drag-zone',
                            child:  'span.mdi.mdi-drag'
                        },
                        {
                            child: { tag: 'span', child: { text: rawRow[0] } }
                        },
                        {
                            child: { tag: 'span', child: { text: rawRow[1] } }
                        },
                        {
                            child: { tag: 'span', child: { text: rawRow[2] } }
                        },
                        {
                            child: { tag: 'span', child: { text: rawRow[3] } }
                        },
                        {
                            child: { tag: 'expressioninput' }
                        },
                        {
                            child: {
                                tag: 'i',
                                class: 'material-icons',
                                child: { text: rawRow[5] }
                            }
                        }
                    ]
                }

            })
        }
    }
}


var table = absol._({
    tag: 'dynamictable',
    props: {
        adapter: adapter
    },
    on: {
        orderchange: function (event) {
            console.log(event)
        }
    }
})


var singlePage = absol._({
    tag: 'singlepage',
    child: [
        table
    ]
}).addTo(document.body);
