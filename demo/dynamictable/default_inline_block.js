var rowRecords = [
    {
        completed: false,
        name: 'abc',
        endTime: '24/4/2024 00:00',
        remind: false,
        actor: "Pham Duc Dat",
        res: '',
        feature: '',
        tick: false
    },
    {
        completed: false,
        name: 'av',
        endTime: '24/4/2024 00:00',
        remind: false,
        actor: "Pham Duc Dat",
        res: '',
        feature: '',
        tick: false

    }
];

for (var i = 0; i < 50; ++i) {
    rowRecords.push({
        completed: Math.random() < 0.5,
        name: absol.string.randomPhrase(30),
        actor: absol.string.randomPhrase(15),
        endTime: absol.datetime.formatDateTime(new Date(Date.now() + Math.random() * 36e5 * 24 * 364), 'dd/mm/yyyy HH:mm'),
    });
}

var table = absol._({
    tag: 'dynamictable',
    props: {
        adapter: {
            data: {
                head: {
                    rows: [
                        {
                            cells: [
                                {
                                    child: { text: 'STT' }
                                },
                                {
                                    child: { text: 'Hoàn thành' }
                                },
                                {
                                    child: { text: 'Tên' }
                                },
                                {
                                    child: { text: 'Kết thúc' }
                                },
                                {
                                    child: { text: 'Nhắc nhở' }
                                },
                                {
                                    child: { text: 'Người thực hiên' }
                                },
                                {
                                    child: { text: 'Kết quả' }
                                },
                                {
                                    child: { text: 'Chức năng' }
                                },
                                {
                                    child: { text: 'Đánh dấu' }
                                },
                                {
                                    child: 'span.bsc-icon-hover-black.mdi.mdi-table-settings'
                                }
                            ]
                        }
                    ]
                },
                body: {
                    rows: rowRecords.map(rc => {
                        return {
                            cells: [
                                {
                                    child: 'span.as-dt-row-index'
                                },
                                {
                                    render: function (tdElt) {
                                        tdElt.addStyle('text-align', 'center');
                                        absol._({
                                            elt: tdElt,
                                            child: {
                                                tag: 'switch',
                                                props: {
                                                    disabled: true,
                                                    checked: rc.completed
                                                }
                                            }
                                        });
                                    }
                                },
                                { child: { text: rc.name }, innerText: rc.name },
                                { child: { text: rc.endTime } },
                                { child: { text: 'Không nhắc' } },
                                { child: { text: rc.actor } , innerText: rc.actor },
                                { child: { text: rc.res } },
                                {}, {}, {}

                            ]
                        }
                    })
                }
            }
        }
    }
}).addTo(document.body)