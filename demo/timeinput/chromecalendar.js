var $ = absol.$;
var _ = absol._;

function render(o) {
    return absol._(o).addTo(document.body);
}

var level2Format = {
    day: 'dd/MM/yyyy',
    week: 'Tuần ww, yyyy',
    month: 'MM/yyyy',
    quarter: 'Quý Q, yyyy',
    year: 'yyyy'
};

['day', 'week', 'month', 'quarter', 'year'].forEach(function (level) {
    render(`<h2>${level}</h2>`);
    var picker = render({
        tag: 'chromecalendar',
        props: {
            selectedDates: [new Date(2023, 0, 4)],
            level: level,
            min: new Date(2022, 0, 1),
            max: new Date(2024, 10, 15),
        },
        on: {
            pick: () => {
                var value = picker.selectedDates[0];
                var row = _({
                    child: [
                        {
                            tag: 'span',
                            style: {
                                color: '#ddd'
                            },

                            child: {
                                text: absol.datetime.formatDateTime(new Date(), 'HH:mm:ss')
                            }
                        },
                        { text: " : [" + level + "]" },
                        {
                            text: absol.datetime.formatDateTime(value, level2Format[level])
                        }
                    ]
                });
                logger.addChild(row);
                logger.scrollTop = logger.scrollHeight;

            }
        }
    });

});
//
// var picker1 = render({
//     tag:'chromecalendar'
// })

var logger = _({
    tag: 'pre',
    style: {
        position: 'fixed',
        zIndex: 1000,
        top: '5px',
        left: '300px',
        height: '80vh',
        width: 'calc(100% - 350px)',
        overflow: 'auto',
        padding: '10px',
        backgroundColor: 'white',
        border: '1px solid black'
    }
}).addTo(document.body);
