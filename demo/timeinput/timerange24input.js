function render(...args) {
    return absol._(...args).addTo(document.body)
}

var input = render({
    tag: 'timerange24input',
    props: {
        dayOffset: 3600000 * 9.5,
        duration: 3600000
    },
    on: {
        change: function () {
            console.log(this.value)
            input3.value = this.value;
        }
    }
});

var input2 = render({
    tag: 'timerange24input',
    props: {
        dayOffset: 3600000 * 9.5,
        duration: 3600000,
        notNull: false
    }
});

render('<h5>Ref</h5>');

var input3 = render({
    tag: 'timerange24input',
    props: {
        value: input.value
    }
});

// var input = absol._({
//     tag: 'time24input',
//     props: {
//         dayOffset: 36e5 * 19.5,
//         value: 36e5 * 9
//     }
// }).addTo(document.body);
//
// var input = absol._({
//     tag: 'time24input',
//     props: {
//         dayOffset: 36e5 * 19.5,
//         value: null,
//         notNull: false
//     }
// }).addTo(document.body);