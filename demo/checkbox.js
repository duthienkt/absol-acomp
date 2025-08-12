var _ = absol._;
var __ = (o) => _(o).addTo(document.body);


// document.body.style.backgroundColor = '#F6F4F4';
// document.body.style.backgroundColor = 'rgb(88, 80, 88)';
__(`<h2>CheckBoxInput</h2>`);

var grid = __({
    style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '20px'
    },
});

['v0', 'check-box', 'check-circle', 'reject-circle'].forEach(variant => {
    _({
        child: { text: variant },
    }).addTo(grid);
    _({
        child: {
            tag: 'checkboxinput',
            style: { variant: variant },
            props: {
                checked: true
            }
        }
    }).addTo(grid);
    _({
        child: {
            tag: 'checkboxinput',
            style: { variant: variant },
            props: {
                checked: true,
                readOnly: true
            }
        }
    }).addTo(grid);
    _({
        child: {
            tag: 'checkboxinput',
            style: { variant: variant },
            props: {
                checked: true,
                disabled: true
            }
        }
    }).addTo(grid);
    _({
        child: {
            tag: 'checkboxinput',
            style: { variant: variant },
            props: {
                checked: false,
                disabled: false
            }
        }
    }).addTo(grid);
    _({
        child: {
            tag: 'checkboxinput',
            style: { variant: variant },
            props: {
                checked: false,
                disabled: true
            }
        }
    }).addTo(grid);

});

__(`<h2>CheckBox</h2>`);


grid = __({
    style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '20px'
    },
});

['v0', 'check-box', 'check-circle', 'reject-circle'].forEach(variant => {
    _({
        child: { text: variant },
    }).addTo(grid);
    _({
        child: {
            tag: 'checkbox',
            style: { variant: variant, checkPosition: 'right' },
            props: {
                text: 'Option',
                checked: true
            }
        }
    }).addTo(grid);
    _({
        child: {
            tag: 'checkbox',
            style: { variant: variant },
            props: {
                text: 'Option',
                checked: true,
                readOnly: true
            }
        }
    }).addTo(grid);
    _({
        child: {
            tag: 'checkbox',
            style: { variant: variant },
            props: {
                text: 'Option',
                checked: true,
                disabled: true
            }
        }
    }).addTo(grid);
    _({
        child: {
            tag: 'checkbox',
            style: { variant: variant },
            props: {
                text: 'Option',
                checked: false,
                disabled: false
            }
        }
    }).addTo(grid);
    _({
        child: {
            tag: 'checkbox',
            style: { variant: variant },
            props: {
                text: 'Option',
                checked: false,
                disabled: true
            }
        }
    }).addTo(grid);
});

__(`<h2>Switch</h2>`);

['v0', 'large', 'regular', 'small'].forEach(size => {
    __({ tag: 'span', child: { text: ' ' + size + ' ' } });
    __({
        tag: 'switch',
        style: {
            size: size
        }
    })
});

__(`<h2>TextInput</h2>`);

['v0', 'large', 'regular', 'small'].forEach(size => {
    __({ tag: 'span', child: { text: ' ' + size + ' ' } });
    __({
        tag: 'textinput',
        style: {
            size: size
        }
    })
});
