
var single = absol._({
    tag:'singleselectlist',
    props:{
        items:[
            {text:'Item 1', value:1},
            {text:'Item 2', value:2},
            {text:'Item 3', value:3},
            {text:'Item 4', value:4},
            {text:'Item 5', value:5}
        ]
    }
}).addTo(document.body);

var leftSide = absol._({
    tag:'singleselectlist',
    props:{
        strictValue: false, //default:  true
        items:[
            {text:'Item 1', value:1},
            {text:'Item 2', value:2},
            {text:'Item 3', value:3},
            {text:'Item 4', value:4},
            {text:'Item 5', value:5}
        ]
    }
});

var rightSide = absol._({
    tag:'singleselectlist',
    props:{
        items:[
            {text:'Item A', value:'A'},
            {text:'Item B', value:'B'},
            {text:'Item C', value:'C'},
            {text:'Item D', value:'D'},
            {text:'Item E', value:'E'}
        ]
    }
});

var dualWithGrid = absol._({
    style:{
        display:'grid',
        gridTemplateColumns:'1fr 1fr',
        gap:'10px',
    },
    child:[leftSide, rightSide]
}).addTo(document.body);