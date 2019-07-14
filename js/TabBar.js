import Acore from "../ACore";




var _ = Acore._;
var $ = Acore.$;


function TabBar() {
    var res = _('hscroller.absol-tabbar');
    res.defineEvent(['active', 'close']);
    return res;
};



TabBar.prototype.getAllTabButtons = function () {
    var buttons = [];
    $('tabbutton', this, function (e) {
        buttons.push(e);
    });
    return buttons;
};


TabBar.eventHander = {};



TabBar.property = {};

TabBar.property.tabs = {
    set: function (value) {
        this.clearChild();
        this._tabs = [];
        (value || []).forEach(this.addTab.bind(this));
    },
    get: function () {
        //each hold item data
        return this._tabs || [];
    }
};


/***
 * 
 * @param {{text}}
 * @return {tabbar}
 */
TabBar.prototype.addTab = function (value) {
    var self = this;
    var props = {};
    var ident;
    if (typeof value == "string") {
        props.name = value;
        ident = value;
    }
    else {
        if (value.name) {
            props.name = value.name;
        }
        else {
            throw new Error('Tab must has name attribute');
        }
        if (value.desc)
            props.desc = value.desc;

        if (typeof (value.ident) != 'undefined') {
            ident = value.ident;
        }
        else {
            throw new Error('Tab must has ident attribute');
        }
    }


    var tabButton = _({
        tag: 'tabbutton',
        id: 'tab-' + ident,
        props: props,
        on: {
            active: function (event, sender) {
                var prevented = false;
                self.emit('active', {
                    target: this,
                    value: value,
                    preventDefault: function () {
                        prevented = true;
                    }
                }, self);
                if (!prevented) {
                    self.getAllTabButtons().forEach(function (e) {
                        e.active = false;
                    });
                    this.active = true;
                }
            },
            close: function (event, sender) {
                var prevented = false;
                self.emit('close', {
                    target: this, value: value,
                    preventDefault: function () {
                        prevented = true;
                    }
                }, self);
                if (!prevented) {
                    //todo:active other
                    this.remove();
                }
            }
        }
    }).addTo(this);
    this._tabs.push(tabButton);
    return tabButton;
};


TabBar.prototype.removeTab = function (ident) {
    this._tabs = this._tabs.filter(function (value) {
        var itemIdent;
        if (typeof value == "string") {
            itemIdent = value;
        }
        else {
            itemIdent = value.ident;
        }
        return itemIdent == ident;
    });
    $('#tab-'+ ident, this).remove();
};

Acore.creator.tabbar = TabBar;

export default TabBar;