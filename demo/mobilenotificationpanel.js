var __ = o => absol._(o).addTo(document.body);
var _ = absol._;


var newNotiArr = [];
var readNotiArr = [];


function testAddNotification() {
    var newNoti = _({
        tag: 'npitem',
        props: {
            unread: true
        },
        on: {
            //click:...// or add here
        },
        child: [
            {
                style: {
                    padding: '10px'
                },
                child: [
                    {
                        tag: 'span',
                        child: [
                            { text: "Đây là thông báo lúc " },
                            {
                                tag: 'strong',
                                child: { text: new Date().toLocaleTimeString() }
                            },
                            {
                                text: ', ' + absol.string.randomSentence(100)
                            }
                        ]
                    }
                ]

            }
        ]
    });
    newNoti.pin = true;
    //newNoti.unread = true; //or set unread somewhere
    newNotificationSection.addChild(newNoti);//note: use addChild, do not use appendChild, insertChild
    newNoti.on('click', function () {
        var idx;
        //this is newNoti
        if (this.unread) {//move to readNotiArr
            this.unread = false;
            idx = newNotiArr.indexOf(newNoti);
            if (idx >= 0) {
                newNotiArr.splice(idx, 1);
                readNotiArr.push(this);
            }
        }
        //todo: handle click to message then close// close only be called automatically if click out of modal
        notificationDropdownButton.close();

    });

    newNoti.time = new Date()

    newNoti.on('unreadchange', function () {
        console.log('unreadchange', this.unread, newNoti.unread);//unread always false
    });
    newNoti.quickmenu = {
        getMenuProps: function () {
            return {
                items: [
                    {
                        text: 'Cut', key: 'extendStyle[color=red]',
                        cmd: 'cut',
                        extendStyle: {
                            color: 'red'
                        },
                        icon: 'span.mdi.mdi-content-cut'
                    },
                    "================================",
                    { text: 'Menu text', value: 123, cmd: 'test' },
                    {
                        text: 'Mark as unread',
                        cmd: 'mark_unread',
                    }
                ]
            }
        },
        onSelect: function (item) {
            if (item.cmd === 'mark_unread') {
                newNoti.unread = true;
            }
        }
    };
    newNotiArr.push(newNoti);
    notificationDropdownButton.count = newNotiArr.length;//set count
}


function readAll() {
    var noti;
    while (newNotiArr.length > 0) {
        noti = newNotiArr.shift();
        noti.unread = false;
        readNotiArr.push(noti);
    }

}


var newNotificationSection = _({
    tag: 'nplist',
    props: {
        moreText:"Xem thông báo cũ hơn"
    },
    on: {
        more: function () {
            testAddNotification();
            testAddNotification();
            testAddNotification();
            newNotificationSection.scrollToEnd();
        }
    }
});


var notificationDropdownButton = _({
    tag: 'MNPNotificationVirtualDropdown'.toLowerCase(),
    props: {
        icon: 'span.mdi.mdi-bell',
        count: 0
    },
    child: [
        {
            tag: 'h3',
            child: {
                text: 'Thông báo'
            }
        },
        newNotificationSection
    ]
});


notificationDropdownButton.quickmenu = {
    getMenuProps: function () {
        return {
            items: [
                {
                    text: 'Cut', key: 'extendStyle[color=red]',
                    cmd: 'cut',
                    extendStyle: {
                        color: 'red'
                    },
                    icon: 'span.mdi.mdi-content-cut'
                },
                "================================",
                { text: 'Menu text', value: 123, cmd: 'test' },
                {
                    text: 'Mark as unread',
                    cmd: 'mark_unread',
                }
            ]
        }
    },
    onSelect: function (item) {
        if (item.cmd === 'mark_unread') {
            //todo
        }
        console.log(item);
    }
};

notificationDropdownButton.addTo(document.body);
notificationDropdownButton.on('click', function(){
    notificationDropdownButton.count = 0;
})

testAddNotification();
testAddNotification();
testAddNotification();

var testDiv = __({
    style: {
        zIndex: 10009,
        position: "fixed",
        bottom: '100px',
        right: '30%',
        left: '30%',
        border: '1px solid red',
        background: 'white',
        padding: '10px',
    }
});
//
//
_({
    tag: "button",
    child: { text: "Test thêm thông báo" },
    on: {
        click: testAddNotification
    }
}).addTo(testDiv);



_({
    tag:"button",
    style:{
        position: 'relative',
        padding: '10px',
        fontSize: '20px',
    } ,
    child:['span.mdi.mdi-bell', '.as-header-bar-notification-action-count'],
    on: {
        click: function () {

            notificationDropdownButton.open();
        }
    }
}).addTo(testDiv);