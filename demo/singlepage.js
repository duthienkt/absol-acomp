var _ = absol._;
var __ = o => absol._(o).addTo(document.body);

__({
    tag: 'singlepage',
    style: {
        width: '80vw',
        height: '80vh',
        border: '1px solid red',
    },
    child: [
        {
            class: 'absol-single-page-header',
            style: {
                padding: '10px'
            },
            child: [{
                tag: 'flexiconbutton',
                props: {
                    text: 'Add Child',
                    icon: 'span.mdi.mdi-plus'
                }
            }]
        },
        {
            class: 'absol-single-page-footer',
            style: {
                padding: '1em',
            },
            child: {
                text: 'Footer content goes here',
            }
        },
        ... Array(100).fill(0).map((u, i) => {
            return { tag: 'p', child: { text: `Line ${i + 1}` } }
        })
    ]
});


__({
    tag: 'singlepage',
    style: {
        width: '80vw',
        height: '80vh',
        border: '1px solid red',
    },
    child: [

        {
            class: 'absol-single-page-footer',
            style: {
                padding: '1em',
            },
            child: {
                text: 'Footer content goes here',
            }
        },
        ... Array(100).fill(0).map((u, i) => {
            return { tag: 'p', child: { text: `Line ${i + 1}` } }
        })
    ]
});
