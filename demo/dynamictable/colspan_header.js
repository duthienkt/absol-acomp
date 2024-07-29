var cellText = (txt, attr) => ({ attr: attr || {}, child: { tag: 'span', child: { text: txt } } });
var data = {
    head: {
        rows: [
            {
                cells: [
                    cellText('STT', { rowspan: 3 }),
                    cellText("Ten", { rowspan: 3, colspan: 2 }),
                    cellText("Tieu chi da cham", { rowspan: 3 }),
                    cellText('Hoc van 1', { colspan: 2 }),
                    cellText('Hoc van 2', { colspan: 2 }),
                    cellText('Kinh nghiem', { colspan: 2 }),
                    cellText('Kinh nghiem', { colspan: 2 }),
                    cellText('Kinh nghiem', { colspan: 2 }),
                    cellText('Kinh nghiem', { colspan: 2 }),
                    cellText('Kinh nghiem', { colspan: 2 }),
                    cellText('Kinh nghiem', { colspan: 2 }),
                    cellText('Kinh nghiem', { colspan: 2 }),
                    cellText('Kinh nghiem', { colspan: 2 }),
                    cellText('Kinh nghiem', { colspan: 2 })
                ]
            },
            {
                cells: [
                    cellText("Do kho"),
                    cellText('Trong so'),
                    cellText("Do kho"),
                    cellText('Trong so'),
                    cellText("Do kho"),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so'),
                    cellText('Trong so')
                ]
            },
            {
                cells: [
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),
                    cellText("edit"),

                ]
            }
        ]
    },
    body: {
        rows: Array(1000).fill().map(()=>( {
            cells: [
                cellText(1),
                cellText('Bao ve'),
                cellText('edit'),
                cellText('0'),
                cellText('0-0'),
                cellText('0'),
                cellText('0-0'),
                cellText('0'), cellText('0-0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
                cellText('0'),
            ]
        }))
    }
}

var table = absol._({
    tag: 'dynamictable',
    style:{
        height: '80vh'
    },
    props: {
        adapter: {
            fixedCol: 4,
            data: data
        }
    }
}).addTo(document.body);