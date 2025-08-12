var __ = (o) => absol._(o).addTo(document.body);
var _ = absol._;


var variants = ['v0', 'tertiary', 'primary', 'secondary', 'light', 'link', 'danger'];

var grid = __({
    style: {
        display: "grid",
        gridTemplateColumns: `repeat(${variants.length} ,1fr)`,
        gap: '20px'
    }
});


['10px', '12px', '14px', '18px'].forEach((size) => {
    console.log('size', size);
    _(`<label style="grid-column: span ${variants.length}">${size}</label>`).addTo(grid);
    variants.forEach(variant => {
        _({
            child: {
                tag: 'flexiconbutton',
                style: {
                    'font-size': size,
                    variant: variant,
                },
                props: {
                    text: 'Quay lại(' + variant + ')',
                    icon: 'span.mdi.mdi-arrow-left'
                }
            }
        }).addTo(grid);
    });


    variants.forEach(variant => {
        _({
            child: [{
                tag: 'flexiconbutton',
                style: {
                    'font-size': size,
                    variant: variant,
                    margin: '0 0 10px 0px',
                },
                props: {
                    text: 'Quay lại(' + variant + ')',
                }
            }, 'br', {
                tag: 'flexiconbutton',
                style: {
                    'font-size': size,
                    variant: variant,
                },
                props: {
                    disabled: true,
                    text: 'Disabled(' + variant + ')',
                }
            }]
        }).addTo(grid);
    });


});


['v0', 'small', 'regular', 'large'].forEach((size) => {
    console.log('size', size);
    _(`<label style="grid-column: span ${variants.length}">${size}</label>`).addTo(grid);
    variants.forEach(variant => {
        _({
            child: {
                tag: 'flexiconbutton',
                style: {
                    size: size,
                    variant: variant,
                },
                props: {
                    text: 'Quay lại(' + variant + ')',
                    icon: 'span.mdi.mdi-arrow-left'
                }
            }
        }).addTo(grid);
    });


    variants.forEach(variant => {
        _({
            child: [{
                tag: 'flexiconbutton',
                style: {
                    size: size,
                    variant: variant,
                    margin: '0 0 10px 0px',
                },
                props: {
                    text: 'Quay lại(' + variant + ')',
                }
            }, 'br', {
                tag: 'flexiconbutton',
                style: {
                    size: size,
                    variant: variant,
                },
                props: {
                    disabled: true,
                    text: 'Disabled(' + variant + ')',
                }
            }]
        }).addTo(grid);
    });

});