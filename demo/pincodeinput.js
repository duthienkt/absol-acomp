// Demo for <pincodeinput>
// Usage: include this file in a demo page that loads absol + absol-acomp bundle.

var _ = absol._;
var $ = absol.$;
var $$ = absol.$$;

_({
    tag:'a',
    attr:{
        href: __dir+"/"+ __filename,
        target: '_blank'
    },
    child:{text: 'View source code'}
}).addTo(document.body);
var pin = _( {
    tag: 'pincodeinput',
    props: {
        length: 6,
        value: ''
    }
});

var root = _({
    style: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        width: '100vw',
        boxSizing: 'border-box'
    },
    child: [
        { tag: 'h2', child: { text: 'PinCodeInput demo' } },
       pin,
        {
            style: { marginTop: '12px' },
            child: [
                { tag: 'flexiconbutton', class: 'as-button', props: { text: 'Set value: 123456' } },
                { tag: 'flexiconbutton', class: 'as-button', style: { marginLeft: '8px' }, props: { text: 'Clear' } },
                { tag: 'flexiconbutton', class: 'as-button', style: { marginLeft: '8px' }, props: { text: 'Length = 4' } },
                { tag: 'flexiconbutton', class: 'as-button', style: { marginLeft: '8px' }, props: { text: 'Length = 6' } }
            ]
        },
        {
            style: { marginTop: '12px', fontSize: '14px' },
            child: [
                { tag: 'div', child: { text: 'value:' } },
                { tag: 'pre', class: 'pincode-value-view', style: { margin: '6px 0 0 0' }, child: { text: '""' } }
            ]
        }
    ]
}).addTo(document.body);

var buttons = $$('flexiconbutton', root);
var valueView = $('.pincode-value-view', root);

var updateView = function () {
    valueView.innerText = JSON.stringify(pin.value);
};

updateView();

pin.on('input', updateView);
pin.on('change', function (){
    updateView();
    absol.require('snackbar').show('Pin code :' + pin.value);
});

buttons[0].on('click', function () {
    pin.value = '123456';
    pin.focus();
    updateView();
});

buttons[1].on('click', function () {
    pin.clear();
    pin.focus();
    updateView();
});

buttons[2].on('click', function () {
    pin.length = 4;
    pin.focus();
    updateView();
});

buttons[3].on('click', function () {
    pin.length = 6;
    pin.focus();
    updateView();
});
