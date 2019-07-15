import Acore from "../ACore";


var _ = Acore._;
var $ = Acore.$;


function TabBar() {
    var res = _('hscroller.absol-tabbar');
    res.defineEvent(['active', 'close']);
    res._tabs = [];
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
    if (typeof value == "string") {
        props.name = value;
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
    }


    var tabButton = _({
        tag: 'tabbutton',
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
    if (value.id) tabButton.attr('id', 'tabbuton-' + value.id);
    this._tabs.push(tabButton);
    return tabButton;
};


TabBar.prototype.removeTab = function (id) {
    this._tabs = this._tabs.filter(function (value) {
        return value == id;
    });
    $('#tabbuton-' + id, this).remove();
};


TabBar.prototype.activeTab = function (id) {
    var activedbtn = $('.absol-tabbar-button-active', this);
    if (activedbtn && activedbtn.attr('id') != id) {
        activedbtn.active = false;
    }
    var mButton = $('#tabbuton-' + id, this);
    if (mButton) {
        mButton.active = true;
    }
};


Acore.creator.tabbar = TabBar;

export default TabBar;