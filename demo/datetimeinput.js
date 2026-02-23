var _ = absol._;
var $ = absol.$;
var inputDemoDiv = $('.input-demo');
var supportFormats = ['d/MM/yyyy', 'dd/MM/yyyy', 'dd-MM-yyyy', 'dd.MM.yyyy', 'yyyy/MM/dd', 'yyyy-MM-dd', 'MM/dd/yyyy'];
function __(o) {
    return _(o).addTo(document.body);
}

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
                    child: { text: format }
                },
                {
                    tag: 'datetimeinput',
                    props: {
                        value: new Date(),
                        format: format
                    },
                    on: {
                        change: function () {
                            absol.require('snackbar').show(this.value + '');
                        }
                    }
                },
                {
                    tag: 'label',
                    style: { width: '10em', 'line-height': '30px', display: 'inline-block' },
                    child: { text: format + ' hh:mm a' }
                },
                {
                    tag: 'datetimeinput',
                    props: {
                        value: new Date(),
                        format: format + ' hh:mm a'
                    },
                    on: {
                        change: function () {
                            absol.require('snackbar').show(this.value + '');
                        }
                    }
                },
                {
                    tag: 'datetimeinput',
                    props: {
                        value: new Date(),
                        format: format + ' hh:mm a',
                        notNull: true
                    },
                    on: {
                        change: function () {
                            absol.require('snackbar').show(this.value + '');
                        }
                    }
                },
                {
                    tag: 'datetimeinput',
                    props: {
                        value: new Date(),
                        format: format + ' hh:mm a',
                        notNull: true,
                        disabled: true
                    },
                    on: {
                        change: function () {
                            absol.require('snackbar').show(this.value + '');
                        }
                    }
                }
            ]
        }
    ).addTo(inputDemoDiv);
});


_(
    {
        style: {
            'margin-bottom': '10px'
        },
        child: [
            {
                tag: 'label',
                style: { width: '10em', 'line-height': '30px', display: 'inline-block' },
                child: { text: 'default' }
            },
            {
                tag: 'datetimeinput',
                props: {},
                on: {
                    change: function () {
                        absol.require('snackbar').show(this.value + '');
                    }
                }
            },
            {
                tag: 'datetimeinput',
                props: {
                    notNull: true
                },
                on: {
                    change: function () {
                        absol.require('snackbar').show(this.value + '');
                    }
                }
            },
            {
                tag: 'datetimeinput',
                props: {
                    notNull: true,
                    disabled: true
                },
                on: {
                    change: function () {
                        absol.require('snackbar').show(this.value + '');
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
                child: { text: 'default' }
            },
            {
                tag: 'datetimeinput',
                props: {
                    format: 'dd/MM/yyyy HH:mm'
                },
                on: {
                    change: function () {
                        absol.require('snackbar').show(this.value + '');
                    }
                }
            },
            {
                tag: 'datetimeinput',
                props: {
                    format: 'dd/MM/yyyy HH:mm',
                    notNull: true
                },
                on: {
                    change: function () {
                        absol.require('snackbar').show(this.value + '');
                    }
                }
            },
            {
                tag: 'datetimeinput',
                props: {
                    notNull: true,
                    disabled: true,
                    format: 'dd/MM/yyyy HH:mm'
                },
                on: {
                    change: function () {
                        absol.require('snackbar').show(this.value + '');
                    }
                }
            }
        ]
    }
).addTo(inputDemoDiv);

__("<h3><Test/h3>");

var ti = __({
    tag: 'datetimeinput',
    props: {
        format: 'dd/MM/yyyy',
        value: new Date()
    }
});


var btn = __({
    tag:'flexiconbutton',
    props:{
        text:'ViewTime'
    },
    on:{
        mousedown: function () {
            text.innerHTML = ti.value + '';
        }
    }
});


var text = __({
    tag: 'span',
    style: {
        padding: '10px'
    }
});