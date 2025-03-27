var __ = o => absol._(o).addTo(document.body);
var _ = absol._;

//main tabPanel in KeeView
var tabView = __({
    tag: 'tabview',
    style: {
        width: '100%',
        height: '200px',
    },
    child: [// sample
        {
            tag: 'tabframe',
            props: {
                name: "tab 1"
            },
            child: [
                { text: "tab 1" }
            ]
        },
        {
            tag: 'tabframe',
            props: {
                name: "tab 2"
            },
            child: [
                { text: "tab 2" }
            ]
        },
    ]
});

tabView.tvTitle = "admin";

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
            console.log(item);
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
    tag: 'npdropdownbutton',
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
            newNoti.unread = true;
        }
        console.log(item);
    }
};

tabView.notificationPanel.addChild(notificationDropdownButton);

testAddNotification();
testAddNotification();
testAddNotification();


__({
    tag: "button",
    child: { text: "Test thêm thông báo" },
    on: {
        click: testAddNotification
    }
});


__('br');
__('br');
__(`<a href="./notificationpanel.js">Mã nguồn ví dụ ở đây</a>`);
__('br');
__('br');
__('br');
