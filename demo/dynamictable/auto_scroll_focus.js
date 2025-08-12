
var _ = absol._;
var $ = absol.$;


var table = _({
    tag: 'dynamictable',
    style:{
        height:'90vh',
        width:'100%',
    },
    props: {
        adapter: {
            data: {
                head:{
                    rows:[
                        {
                            cells:[
                                { child: { text: 'ID' } },
                                { child: { text: 'Name' } },
                                { child: { text: 'Score' } }
                            ]
                        }
                    ]
                },
                body:{
                    rows:Array(200).fill(null).map((u, i)=>{
                        return {
                            cells:[
                                { child: { text: (i + 1) + '' } },
                                { child: { tag:'textinput', props:{ value: 'text' } } },
                                { child: { tag:'numberinput', props: {value: Math.round(Math.random()*10)} }  }
                            ]
                        };
                    })
                }
            }
        }
    }
}).addTo(document.body);

var numberInputs = absol.$$('numberinput');
setTimeout(() => {
    // var idx = Math.floor(Math.random() * numberInputs.length);
    var idx = 100;
    var input = numberInputs[idx];
    input.focus();
    console.log("focus", input);
}, 5000);

setTimeout(() => {
    // var idx = Math.floor(Math.random() * numberInputs.length);
    var idx = 50;
    var input = numberInputs[idx];
    input.focus();
    console.log("focus", input);
}, 10000);