var _ = absol._;
var $ = absol.$;

var app = _({
    class: 'am-application',
    child: []
}).addTo(document.body);


var firstPage = _({
    class:['am-activity', 'am-grid'],
    // style: {
    //     width: '100%',
    //     height: '100%'
    // },
    child: [
        {
            tag: 'mheaderbar',
            props: {
                title: 'KeeView',
                commands: [
                    {
                        icon: 'span.mdi.mdi-bell-outline',
                        name: 'notification'
                    },
                    {
                        icon: 'span.mdi.mdi-menu',
                        name: 'menu'
                    }
                ]
            }
        },
        {
            class:'am-activity-body'
        }
    ]
}).addTo(app);