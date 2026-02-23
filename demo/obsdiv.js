var _ = absol._;
// Tạo một ObsDiv với các rule về class theo width
const demoObsDiv = _({
    tag: 'obsdiv',
    style: {
        width: '50vw',
        height: '200px',
        border: '2px solid #2196f3',
        resize: 'horizontal',
        overflow: 'auto',
        margin: '40px auto',
        transition: 'background 0.3s',
    },
    props:{
        reusable: true,
        respRules: [
            { minWidth: 0, maxWidth: 399, className: 'obs-small' },
            { maxWidth: 799, className: 'obs-medium' },
            {  className: 'obs-large' }
        ]
    },

    child: [{
        tag: 'div',
        style: {
            padding: '24px',
            fontSize: '1.2em',
            textAlign: 'center',
        },
        child: { text: 'Kéo thay đổi chiều rộng để test class responsive!' }
    },
        {
            tag: 'flexiconbutton',
            props: {
                text: "hide in 3s"
            },
            on: {
                click: () => {
                    demoObsDiv.addStyle('display', 'none');
                    setTimeout(()=>{
                        demoObsDiv.removeStyle('display');
                    }, 1000);
                }
            }
        },
        {
            tag: 'flexiconbutton',
            props: {
                text: "remove then add"
            },
            on: {
                click: () => {
                    demoObsDiv.remove();
                    setTimeout(()=>{
                        demoObsDiv.addTo(document.body);
                    }, 1000);
                }
            }
        }
    ]
});

demoObsDiv.on('resize', e => {
    console.log(e)
    absol.require('snackbar').show('ObsDiv resized to width: ' + e.borderRect.width, 2000);
    // console.log('resize event', e.target.offsetWidth, e);
});
demoObsDiv.on('viewchange', e => {
    console.log(e)
    absol.require('toast').make({
        props:{
            message:`ObsDiv ${e.action},  width: ` + e.borderRect.width,
            disappearTimeout: 4000,
        }
    }, 2000);
    // console.log('viewchange event', e);
});

document.body.appendChild(demoObsDiv);

// Thêm CSS cho các class responsive
const style = document.createElement('style');
style.textContent = `
.obs-small { background: #ffe082; }
.obs-medium { background: #80cbc4; }
.obs-large { background: #b39ddb; }
`;
document.head.appendChild(style);
