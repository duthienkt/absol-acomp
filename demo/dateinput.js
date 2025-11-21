
var _ = absol._;
var $ = absol.$;

var cursor = null;
var render = function (o) {
    var res =  _(o);
    document.body.insertBefore(res, cursor);
    return res;
}

cursor = document.body.firstChild;

render(`<h2>MultiDateInput</h2>`);

render({
    tag:'multidateinput',
    props: {
        value:Array(15).fill(null).map((u, i)=>{
            return new Date(new Date().getTime() + 86400000 * i * 2);
        }),
        min: new Date(2025, 10, 25),
        max: new Date(2025, 11, 1),
    },

    on:{
        change: function () {
            console.log(this.value);//or values
        }
    }
});

render({
    tag:'multidateinput',
    style:{
        width:'600px',
        height:'50px',
        overflow:'hidden'
    },
    props: {
        value:Array(15).fill(null).map((u, i)=>{
            return new Date(new Date().getTime() + 86400000 * i * 2);
        })
    },
    on:{
        change: function () {
            console.log(this.value);//or values
        }
    }
});






var inputDemoDiv = $('.input-demo');
var supportFormats = ['Quý QQ, yyyy', 'dd/mm/yyyy', 'Tuần ww, yyyy', null, 'yyyy', 'mm/yyyy', "Năm yyyy",
    'dd/mm/yyyy', 'dd-mm-yyyy', 'dd.mm.yyyy', 'yyyy/mm/dd', 'yyyy-mm-dd', 'mm/dd/yyyy', 'mmm-dd,yyyy'];
supportFormats.forEach(function (format) {
    _(
        {
            style: {
                'margin-bottom': '10px'
            },
            child: [
                {
                    tag: 'label',
                    style: { width: '10em', 'line-height': '30px', display: 'inline-block' },
                    child: { text: format + '' }
                },
                {
                    tag: 'dateinput',
                    props: {
                        value: new Date(),
                        format: format
                    },
                    on: {
                        change: function () {
                            console.trace(this.value);
                        }
                    }
                }
            ]
        }
    ).addTo(inputDemoDiv);


    _(
        {
            style: {
                'margin-bottom': '10px'
            },
            child: [
                {
                    tag: 'label',
                    style: { width: '10em', 'line-height': '30px', display: 'inline-block' },
                    child: { text: format + '' }
                },
                {
                    tag: 'dateinput',
                    props: {
                        format: format
                    },
                    on: {
                        change: function () {
                            console.trace(this.value);
                        }
                    }
                }
            ]
        }
    ).addTo(inputDemoDiv);

    _(
        {
            style: {
                'margin-bottom': '10px'
            },
            child: [
                {
                    tag: 'label',
                    style: { width: '10em', 'line-height': '30px', display: 'inline-block' },
                    child: { text: format + '(notNull)' }
                },
                {
                    tag: 'dateinput',
                    props: {
                        value: new Date(),
                        format: format,
                        notNull: true
                    },
                    on: {
                        change: function () {
                            console.log(this.value);
                        }
                    }
                }
            ]
        }
    ).addTo(inputDemoDiv);


    _(
        {
            style: {
                'margin-bottom': '10px'
            },
            child: [
                {
                    tag: 'label',
                    style: { width: '10em', 'line-height': '30px', display: 'inline-block' },
                    child: { text: format + '(notNull)' }
                },
                {
                    tag: 'dateinput',
                    props: {
                        format: format,
                        notNull: true
                    },
                    on: {
                        change: function () {
                            console.log(this.value);
                        }
                    }
                }
            ]
        }
    ).addTo(inputDemoDiv);
})

var mmInputs = $('#min-max-inputs');
var minValue = new Date(2019, 5, 17);
var maxValue = new Date(2020, 0, 1)
var minIp = absol._(
    {
        tag: 'dateinput',
        props: {
            value: minValue,
            maxDateLimit: maxValue
        },
        on: {
            change: function (ev) {
                maxIp.minDateLimit = ev.value;
            }
        }
    }
);
var maxIp = absol._(
    {
        tag: 'dateinput',
        props: {
            value: maxValue,
            minDateLimit: minValue,
            // dateToString: 'mmm-dd-yyyy', only support dd/mm/yyyy now
        },
        on: {
            change: function (ev) {
                minIp.maxDateLimit = ev.value;
            }
        }
    }
);
$('#min-ip', mmInputs).selfReplace(minIp);
$('#max-ip', mmInputs).selfReplace(maxIp);
$('#disabled-ip', mmInputs).selfReplace(_({
    tag: 'dateinput',
    props: {
        // value: maxValue,
        minDateLimit: minValue,
        disabled: true
    }
}));

_({
    tag: 'datenlevelinput',
    props: {},
    on: {
        change: function () {
            console.log(this.value, this.level);
        }
    }
}).addTo(document.body);
_('br').addTo(document.body);
_({
    tag: 'datenlevelinput',
    props: {
        value: new Date()
    },
    on: {
        change: function () {
            console.log(this.value, this.level);
        }
    }
}).addTo(document.body);
_('br').addTo(document.body);

_({
    tag: 'datenlevelinput',
    props: {
        value: new Date(),
        level: 'week',
        allowLevels: ['week', 'quarter']
    },
    on: {
        change: function () {
            console.log(this.value, this.level);
        }
    }
}).addTo(document.body);

x1 = _({
    tag: 'datenlevelinput',
    props: {
        disabled: true,
        value: new Date(),
        level: 'week',
        allowLevels: ['week', 'quarter']
    },
    on: {
        change: function () {
            console.log(this.value, this.level);
        }
    }
}).addTo(document.body);
x2 = _({
    tag: 'datenlevelinput',
    props: {
        readOnly: true,
        value: new Date(),
        level: 'week',
        allowLevels: ['week', 'quarter']
    },
    on: {
        change: function () {
            console.log(this.value, this.level);
        }
    }
}).addTo(document.body);

x2 = _({
    tag: 'datenlevelinput',
    class: 'as-border-none',
    props: {
        readOnly: true,
        value: new Date(),
        level: 'week',
        allowLevels: ['week', 'quarter']
    },
    on: {
        change: function () {
            console.log(this.value, this.level);
        }
    }
}).addTo(document.body);
// setTimeout(() => {
//     x1.scrollIntoView();
// }, 1500);