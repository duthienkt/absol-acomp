var __ = o => absol._(o).addTo(document.body);

var i1 = __({
    tag: 'solidcolorpicker',
    props: {
        value: null,
        nullable: true
    },
    on: {
        change: function () {
            v1.value = this.value;
        }
    }
});

var v1 = __({
    tag: 'ColorPickerButton'.toLowerCase(),
    props: {
        value: i1.value,
        nullable: true
    }
});


var i2 = __({
    tag: 'solidcolorpicker',
    props: {
        value: '#673ab7',
        hasOpacity: false,
        // nullable: true

    },
    on: {
        change: function () {
            v2.value = this.value;
        }
    }
});


var v2 = __({
    tag: 'ColorPickerButton'.toLowerCase(),
    props: {
        value: i2.value,
        mode: 'hex6',
        nullable: false
    }
});


