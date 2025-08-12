var _ = absol._;
var __ = o => absol._(o).addTo(document.body);

var stepper = _({
    tag: 'checkboxstepper',
    props: {
        title: 'Quá trình hội nhập',
        items: [
            { checked: true, text: 'Nộp hồ sơ' },
            { checked: true, text: 'Phỏng vấn, thi tuyển' },
            { text: 'Mời nhận việc' },
            { text: 'Không nhận việc' },
            { text: 'Từ chối tuyển dụng', disabled: true }
        ]
    }
});

function test1() {
    stepper.items[2].checked = !stepper.items[2].checked;
}

function test2() {
    stepper.items[3].disabled = !stepper.items[3].disabled;
}

var ctn = __({
    tag: 'div',
    style: {
        display: 'inline-block',
        padding: '50px',
        backgroundColor: 'rgb(246, 244, 244)',
    },
    child: stepper
});

__({
    tag: 'flexiconbutton',
    style: {
        margin: '10px'
    },
    props: {
        text: 'Test 1',
    },
    on: {
        click: test1
    }
});

__({
    tag: 'flexiconbutton',
    style: {
        margin: '10px'
    },
    props: {
        text: 'Test 2',
    },
    on: {
        click: test2
    }
});

__({
    child: {
        tag: 'a',
        props: {
            href: __filename
        },
        child: { text: 'Source code' }
    }
})

