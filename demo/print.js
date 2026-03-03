var _ = absol._;
var $ = absol.$;
var mm2px = 3.7795275591;
var printBtn = _({
    tag: 'flexiconbutton',
    props: {
        text: 'Print',
        icon: 'span.mdi.mdi-printer'
    },
    on: {
        click: function () {
            absol.printer.downloadAsPDFBlob([paperA4], {
                margin: {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0
                }
            }).then(blob => {
                var url = URL.createObjectURL(blob);
                window.open(url, '_blank'); // Open PDF in new tab
            })
        }
    }
}).addTo(document.body);
_({
    style:{height: '30px'}
}).addTo(document.body);

var paperA4 = _({
    style: {
        fontFamily:'Times New Roman, serif',
        fontSize: 13,
        width: '794px',
        boxSizing: 'border-box',
        padding: [20, 15, 10, 10].map(v => v * mm2px + 'px').join(' '),
        minHeight: '1123px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)', // Added box-shadow similar to Word page
    }
}).addTo(document.body);

function render(o) {
    return _(o).addTo(paperA4);
}

render({
    style:{
        whiteSpace: 'pre-wrap',
        marginBottom: '10px'
    },
    child:[
        '<span style="display:inline-block;vertical-align:middle">Borderless: </span>',
        {
            tag: 'numberinput',
           class:'as-width-auto',
            props: {
                value: 1000,
                outputMode: 'borderless'
            }
        },
        '<span style="display:inline-block;vertical-align:middle"> Output: </span>',
        {
            tag: 'numberinput',
            props: {
                value: 1000,
                outputMode: true
            }
        }
    ]
});


render({
    style:{
        whiteSpace: 'pre-wrap',
        marginBottom: '10px'
    },
    child:[
        '<span style="display:inline-block;vertical-align:middle">Borderless: </span>',
        {
            tag: 'selectmenu',
            class:'as-width-auto',
            props: {
                value: 3,
                items:[
                    {text: 'Option 1', value: 1},
                    {text: 'Option 2', value: 2},
                    {text: 'Option 3', value: 3}

                ],
                outputMode: 'borderless'
            }
        },
        '<span style="display:inline-block;vertical-align:middle"> Output: </span>',
        {
            tag: 'selectmenu',
            class:'as-width-auto',
            props: {
                value: 3,
                items:[
                    {text: 'Option 1', value: 1},
                    {text: 'Option 2', value: 2},
                    {text: 'Option 3', value: 3}

                ],
                outputMode: true
            }
        },
    ]
});

return;
var now = Date.now();
absol.printer.silentDownloadAsPdf({
    paddingEven: false,
    fileName: 'Test_1800_form.pdf',
    docs: Array(1800).fill(0).map((u, i) => {
        return {
            index: i,
            opt: {
                footer: "Form thứ " + (i + 1)
            },
            render: function (holderDiv, data) {
                holderDiv.innerHTML = `<div><span>Đây là form thứ ${i + 1} </span> These indicate InDesign attempting to dynamically allocate memory, and having it fail. The first time it tries to allocate 6MB, and fails. The second time it tries to allocate 61MB, also failing.

I don't think that it is normal behavior for InDesign to try to allocate 61MB of RAM in one fell swoop. It seems awfully high, though not outside the realm of possibility. I suspect InDesign is failing to properly sanity-check something that causes it to think it needs that much memory when it does not.

On the other hand, 6MB is not crazy. If your OS cannot support allocating 6MB of RAM, that's concerning. (One reason it might not support it is that this is the 683rd try and InDesign has already allocated 4GB of memory in 6MB chunks, and since InDesign is a 32-bit program, it cannot address more than 4GB of RAM no matter what.)

Either way, I think the strongest liklihood is "garbage in, garbage out," and something is wrong with one of your input files, be it the INDD document or a linked file such as a PDF. Oh, and also bugs in InDesign.

We can't really say without more information. I'm also uncertain what to suggest...there are some tools to characterize the memory allocation behavior of applications, but they tend to be highly technical and difficult to interpret. I am not certain what to recommend to you in that space. Perhaps someone else will have a better idea.</div>`;
            }
        }

    })
}).then(() => {
    console.log(Date.now() - now);
});
