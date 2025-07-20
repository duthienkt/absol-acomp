var _ = absol._;
var __ = o => _(o).addTo(document.body);

__(`<h1>Number Input</h1>`);
__(`<h3>FloatFixed < 0</h3>`);
var mNumberInput1 = absol._({
    tag: 'numberinput',
    // class: 'as-width-auto',
    style: {
        width: '13em'
    },
    props: {
        value: 1234356.789422,
        min: 0,
        max: 1e9,
        floatFixed: -3,//adapt for old config
        stepper: true,
        valueDraggable: true
    },
    on: {
        change: function (event) {
            console.log(event.by, this.value);
            absol.require('snackbar').show(this.value + '');
        }
    }
}).addTo(document.body);
__(`<h3>Format auto</h3>`);
var mNumberInput = absol._({
    tag: 'numberinput',
    // class: 'as-width-auto',
    style: {
        width: '13em'
    },
    props: {
        value: 1234356.789422,
        step: 1000,
        min: 0,
        max: 1e9,
        floatFixed: 2//adapt for old config
    },
    on: {
        change: function (event) {
            console.log(event.by, this.value);
            absol.require('snackbar').show(this.value + '');
        }
    }
}).addTo(document.body);

var mNumberInput1 = absol._({
    tag: 'numberinput',
    // class: 'as-width-auto',
    style: {
        width: '13em'
    },
    props: {
        value: 1234356.789422,
        step: 1000,
        min: 0,
        max: 1e9,
        floatFixed: 2,//adapt for old config
        stepper: true
    },
    on: {
        change: function (event) {
            console.log(event.by, this.value);
            absol.require('snackbar').show(this.value + '');
        }
    }
}).addTo(document.body);


var mNumberInput2 = absol._({
    tag: 'numberinput',
    // class: 'as-width-auto',
    style: {
        width: '13em'
    },
    props: {
        value: 1234356.789422,
        step: 1000,
        min: 0,
        max: 1e9,
        floatFixed: 2,//adapt for old config
        // stepper: true,
        readOnly: true
    },
    on: {
        change: function (event) {
            console.log(event.by, this.value);
            absol.require('snackbar').show(this.value + '');
        }
    }
}).addTo(document.body);

var mNumberInput2 = absol._({
    tag: 'numberinput',
    // class: 'as-width-auto',
    style: {
        width: '13em'
    },
    props: {
        value: 1234356.789422,
        step: 1000,
        min: 0,
        max: 1e9,
        floatFixed: 2,//adapt for old config
        // stepper: true,
        disabled: true
    },
    on: {
        change: function (event) {
            console.log(event.by, this.value);
            absol.require('snackbar').show(this.value + '');
        }
    }
}).addTo(document.body);

__(`<h3>Format: "en-US"</h3>`);
var mNumberInput = absol._({
    tag: 'numberinput',
    // class: 'as-width-auto',
    style: {
        width: '13em'
    },
    props: {
        value: 1234356.789422,
        step: 0.2,
        min: 0,
        max: 1e9,
        floatFixed: 2,//adapt for old config
        format: 'en-US',
    },
    on: {
        change: function (event) {
            console.log(event.by, this.value);
            absol.require('snackbar').show(this.value + '');
        }
    }
}).addTo(document.body);


__(`<h3>Format: "none"</h3>`);
var mNumberInput = absol._({
    tag: 'numberinput',
    // class: 'as-width-auto',
    style: {
        width: '13em'
    },
    props: {
        value: 1234356.789422,
        step: 0.2,
        min: 0,
        max: 1e9,
        floatFixed: 2,//adapt for old config
        format: 'none',
    },
    on: {
        change: function (event) {
            console.log(event.by, this.value);
            absol.require('snackbar').show(this.value + '');
        }
    }
}).addTo(document.body);

__(`<h3>Value: null</h3>`);
var mNumberInput = absol._({
    tag: 'numberinput',
    // class: 'as-width-auto',
    style: {
        width: '13em'
    },
    props: {
        value: null,
        step: 2e-1,
        min: 0,
        max: 1e9,
    },
    on: {
        change: function (event) {
            console.log(event.by, this.value);
            absol.require('snackbar').show(this.value + '');
        }
    }
}).addTo(document.body);

var mNumberInput = absol._({
    tag: 'numberinput',
    // class: 'as-width-auto',
    style: {
        width: '13em'
    },
    props: {
        value: null,
        step: 0.2,
        min: 0,
        max: 1e9,
        notNull: false
    },
    on: {
        change: function (event) {
            console.log(event.by, this.value);
            absol.require('snackbar').show(this.value + '');
        }
    }
}).addTo(document.body);

__(`<h3>Size:</h3>`);

var grid = __({
    style: {
        display: 'grid',
        'grid-template-columns': 'auto 1fr',
        'gap': '10px',
        alignItems: 'center',
    }
});

['v0', 'large', 'medium', 'small'].forEach(size => {
    _({
        tag: 'span',
        child: { text: size }
    }).addTo(grid);
    _({
        tag: 'numberinput',
        style: {
            size: size,
            width: '100%'
        }
    }).addTo(grid)
});
