var _ = absol._;
var __ = o=>_(o).addTo(document.body);
var $ = absol.$;

__({
    tag:'textinput',
    style:{
        width:'base-content'
    },
    props:{
        value: "Hello, Absol.js TextInput!",
        maxU8Length: 12
    }
});

__({
    tag:'searchmultimodeinput',
});