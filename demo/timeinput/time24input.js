function render(o) {
    return absol._(o).addTo(document.body);
}

render("<h2>Picker</h2>");
var startTime = render({
    tag: 'timeinput',
    on:{
        change: function () {
            console.log(this.value)
            picker.dayOffset = this.value;
            endTime.dayOffset = this.value;
            picker.scrollIntoSelected();
        }
    }
});


var picker = render({
    tag: 'chrometime24picker',
    props: {
        dayOffset: 0,
        value: null
    }
});

var endTime = render({
    tag: 'time24input',
    props:{
      dayOffset: 0,
      value: null,
    },
    on:{
        change: function () {
            console.log(this.value)
            console.log(this.value);
        }
    }
});


render("<h2>Input</h2>");

var input = absol._({
    tag: 'time24input',
    props: {
        dayOffset: 3600000 * 9.5,
        value: 3600000
    }
}).addTo(document.body);


var input = absol._({
    tag: 'time24input',
    props: {
        dayOffset: 36e5 * 19.5,
        value: 36e5 * 9
    }
}).addTo(document.body);

var input = absol._({
    tag: 'time24input',
    props: {
        dayOffset: 36e5 * 19.5,
        value: null,
        notNull: false
    }
}).addTo(document.body);

