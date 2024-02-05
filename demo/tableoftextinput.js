var _ = absol._;


var tI = _({
    tag: 'tableoftextinput',
    props: {
        data: ["cell 1", "cell 2", "cell 3"],

    },
    on:{
        change: function () {
            tI1.data = this.data;
        }
    }
}).addTo(document.body);

var tI1 = _({
    tag: 'tableoftextinput',
    props: {
        data:tI.data
    }
}).addTo(document.body);