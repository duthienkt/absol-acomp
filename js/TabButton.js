import Acore from "../ACore";

var _ = Acore._;
var $ = Acore.$;


function TabButton() {
    var res = _({
        tag: 'button',
        class: 'absol-tabbar-button',
        extendEvent: ['close', 'active'],
        child: [{
            class: 'absol-tabbar-button-text',
        },
        {
            tag:'span', 
            class: ['absol-tabbar-button-close', 'mdi', 'mdi-close'],
            attr: { title: 'Close (Ctrl+F4)' },
            on: {
                click: function (event) {
                    event.tabButtonEventName = 'delete';
                    res.emit('close', event);
                }
            }
        }],
        on: {
            click: function (event) {
                if (event.tabButtonEventName) return;
                event.tabButtonEventName = 'active';
                res.emit('active', event);
            }
        }
    });

    res.$textView = $('.absol-tabbar-button-text', res);
    return res;
};


TabButton.property = {};
TabButton.property.active = {
    set: function (value) {
        this._active = value;
        if (value)
            this.addClass('absol-tabbar-button-active');
        else
            this.removeClass('absol-tabbar-button-active');
    },
    get: function () {
        return this._active;
    }
};


TabButton.property.name = {
    set: function (value) {
        this._name = value || '';
        this.$textView.innerHTML = this._name;

    },
    get: function () {
        return this._name;
    }
};


TabButton.property.desc = {
    set:function(value){
        this.attr('title', value);
    },
    get:function(){
        return this.attr('title');
    }
}

Acore.creator.tabbutton = TabButton;