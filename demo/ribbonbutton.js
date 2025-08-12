var __ = (o) => absol._(o).addTo(document.body);
var _ = absol._;


var variants = ['v0', 'tertiary', 'primary', 'secondary', 'light'];

var grid = __({
    style: {
        display: "grid",
        gridTemplateColumns: `repeat(${variants.length} ,1fr)`,
        gap: '20px'
    }
});

var menuItems = [
        {
            style: {
                fontWeight: 'bold',
                paddingLeft: '10px'
            },
            child: { tag: 'span', child: { text: 'Upload Picture From' } }
        },
        { text: "Dropbox", icon: 'span.mdi.mdi-dropbox' },
        { text: "Microsoft Onedrive", icon: 'span.mdi.mdi-microsoft-onedrive' },
        { text: "Google Drive", icon: 'span.mdi.mdi-google-drive' },
        '-------',
        {
            icon: 'span.mdi.mdi-desktop-classic',
            text: 'Your computer'
        }
    ];




['v0', 'small', 'regular', 'large'].forEach((size) => {
    console.log('size', size);
    _(`<label style="grid-column: span ${variants.length}">${size}</label>`).addTo(grid);
    variants.forEach(variant => {
        _({
            child: {
                tag: 'ribbonbutton',
                style: {
                    size: size,
                    variant: variant,
                },
                props: {
                    text: 'Upload(' + variant + ')',
                    // text:"",
                    icon: 'span.mdi.mdi-upload',
                    items: ()=>menuItems
                }
            }
        }).addTo(grid);
    });


    variants.forEach(variant => {
        _({
            child: [{
                tag: 'ribbonbutton',
                style: {
                    size: size,
                    variant: variant,
                    margin: '0 0 10px 0px',
                },
                props: {
                    text: 'Upload(' + variant + ')',
                    
                    items: menuItems    
                }
            }, 'br', {
                tag: 'flexiconbutton',
                style: {
                    size: size,
                    variant: variant,
                },
                props: {
                    disabled: true,
                    items: menuItems ,  
                    text: 'Disabled(' + variant + ')',
                }
            }]
        }).addTo(grid);
    });

});