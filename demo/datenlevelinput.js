var level = ["date", "week", "month", "quarter", "year"];

function render(o) {
    return absol._(o).addTo(document.body);
}

level.forEach(level => {
    render({
        tag: 'h2',
        child: {
            text: 'level = ' + level
        }
    });
    render({
        tag: 'datenlevelinput',
        props: {
            level: level,
        }
    });

    render('br');
});

render({
    tag: 'h2',
    child: {
        text: 'readObly = ' + true
    }
});

render({
    tag: 'datenlevelinput',
    props: {
        value: new Date(),
        readOnly: true
    },
    on: {
        change: function () {
            v1.value = this.value;
        }
    }
});

var v1 = render({
    tag: 'datenlevelinput',
    class: 'as-border-none',
    props: {
        value: new Date(),
        readOnly: true
    }
});


render({
    tag: 'h2',
    child: {
        text: 'disabled = ' + true
    }
});
render({
    tag: 'datenlevelinput',
    props: {
        value: new Date(),
        disabled: true
    }
});



