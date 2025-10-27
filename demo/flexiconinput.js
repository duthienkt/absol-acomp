var ctn = $('#ctn');
var input0 = _({
    tag: 'flexiconinput',
    style: {
        'font-family': "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
        margin: '0.2em',
        width: '3.9em'
    },
    props: {
        value: '20',
        unit: '℃'// only 1 character
    }
});

var input1 = _({
    tag: 'flexiconinput',
    style: {
        'font-family': "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
        margin: '0.2em',
        width: '5em'
    },
    props: {
        icon: 'span.mdi.mdi-coolant-temperature',
        value: '20',
        unit: '℃'// only 1 character
    }
});

var input2 = _({
    tag: 'flexiconinput',
    style: {
        'font-family': "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
        margin: '0.2em',
        width: '6em'
    },
    props: {
        icon: 'span.mdi.mdi-music-accidental-sharp',
        value: 'FFDDEE'
    }
});

$('#ip0').selfReplace(input0);
$('#ip1').selfReplace(input1);
$('#ip2').selfReplace(input2);

['v0', 'small', 'regular', 'large'].forEach(function (size) {
    var input0 = _({
        tag: 'flexiconinput',
        style: {
            margin: '0.2em',
            size: size
        },
        props: {
            value: '20',
            unit: '℃'// only 1 character
        }
    }).addTo(ctn);

});

_('br').addTo(document.body);


['tiny', 'small', 'regular', 'large'].forEach(function (size) {
    var input0 = _({
        tag: 'ribbontextinput',
        style: {
            margin: '0.2em',
            size: size
        },
        props: {
            label: 'W',
            value: '20',
            unit: 'px',
            items:[
                {
                    text:"px"
                }
            ]
        }
    }).addTo(ctn);

});

