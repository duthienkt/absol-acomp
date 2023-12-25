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