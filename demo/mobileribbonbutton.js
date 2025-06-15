var __ = o=> absol._(o).addTo(document.body);
var _ = absol._;

document.body.style.fontSize= '14px'

var buttonList = __({
    class : ["as-mobile-ribbon-list"],
    child:[
        {
            tag: 'ribbonbutton',
            class:'as-big',

            props:{
                icon: 'span.mdi.mdi-home',
                text: 'Đọc/ Chưa đọc',
            },
            on:{
                click:function(){
                    console.log('click');
                }
            }
        },
        {
            tag: 'ribbonbutton',
            class:'as-big',
            props:{
                icon: 'span.mdi.mdi-trash-can',
                text: 'Nhóm/ Nhãn',
            }
        },
        {
            class:'as-big',
            tag: 'ribbonbutton',
            props:{
                icon: 'span.mdi.mdi-home',
                text: 'Hoàn thành',
            }
        },
        {
            class:'as-big',
            tag: 'ribbonbutton',
            props:{
                icon: 'span.mdi.mdi-trash-can',
                text: 'Delete',
            }
        },
        {
            tag: 'ribbonbutton',
            class:'as-big',
            props:{
                icon: 'span.mdi.mdi-trash-can',
                text: 'Nhóm/ Nhãn',
            }
        },
        {
            class:'as-big',
            tag: 'ribbonbutton',
            props:{
                icon: 'span.mdi.mdi-home',
                text: 'Hoàn thành',
            }
        },
        {
            class:'as-big',
            tag: 'ribbonbutton',
            props:{
                icon: 'span.mdi.mdi-trash-can',
                text: 'Delete',
            }
        }
    ]
});
