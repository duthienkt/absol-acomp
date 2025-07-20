import '../css/tabview.css';
import ACore from "../ACore";
import TabButton from "./TabButton";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends HScroller
 * @constructor
 */
function TabBar() {
    this.$parent = null;
    this.$addBtn = _({
        tag: 'button',
        class: 'as-tab-bar-add-btn',
        child: 'span.mdi.mdi-plus',
        on: {
            click: function () {
                if (this.$parent) {
                    this.$parent.emit('pressaddtab', { type: 'pressaddtab', target: this.$parent }, this.$parent);
                }
            }.bind(this)
        }
    });
    this.addChild(this.$addBtn);
    this.defineEvent(['active', 'close']);
    this.on('wheel', function (event) {
        var lastLeft = this.$viewport.scrollLeft;
        if (event.deltaY > 1) {
            this.$viewport.scrollLeft += 50;
        }
        else if (event.deltaY < -1) {
            this.$viewport.scrollLeft -= 50;
        }
        if (lastLeft != this.$viewport.scrollLeft)
            event.preventDefault();
    });
    this._tabs = [];
}

TabBar.tag = 'tabbar';

TabBar.render = function () {
    return _('hscroller.absol-tabbar');
};

TabBar.prototype.getAllTabButtons = function () {
    var buttons = [];
    $('tabbutton', this, function (e) {
        buttons.push(e);
    });
    return buttons;
};

/***
 *
 * @param {string} ident
 * @return {TabButton}
 */
TabBar.prototype.getButtonByIdent = function (ident) {
    return $('tabbutton#tabbuton-' + ident, this);
};


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
 * @param {{name: string, desc?: string, tabIcon?: string, preventClosing?: boolean, id?: string}|string} value
 * @return {TabButton}
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
        if (value.tabIcon) {
            props.icon = value.tabIcon;
        }
        if (value.preventClosing) {
            props.preventClosing = value.preventClosing;
        }
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
    });
    this.addChildBefore(tabButton, this.$addBtn)
    if (value.id) tabButton.attr('id', 'tabbuton-' + value.id);
    this._tabs.push(tabButton);
    this.requestUpdateSize();
    return tabButton;
};


TabBar.prototype.removeTab = function (id) {
    this._tabs = this._tabs.filter(function (value) {
        return value === id;
    });
    $('#tabbuton-' + id, this).remove();
    this.requestUpdateSize();
};


TabBar.prototype.activeTab = function (id) {
    var self = this;
    var activedbtn = $('.absol-tabbar-button-active', this);
    if (activedbtn && activedbtn.attr('id') != id) {
        activedbtn.active = false;
    }
    var mButton = $('#tabbuton-' + id, this);
    if (mButton) {
        mButton.active = true;
        setTimeout(function () {
            self.scrollInto(mButton);
        }, 30)
    }

};

TabBar.prototype.setModified = function (ident, flag) {
    var bt = this.getButtonByIdent(ident);
    if (bt) {
        bt.modified = flag;
    }
};


ACore.install(TabBar);

export default TabBar;