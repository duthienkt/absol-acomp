import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom from "absol/src/HTML5/Dom";

var _ = Acore._;
var $ = Acore.$;

function SelectTreeMenu() {
    var res = _({
        class: ['absol-selectmenu'],
        extendEvent: 'change',
        attr: {
            tabindex: '1'
        },
        child: [
            '.absol-selectmenu-holder-item',
            {
                tag: 'button',
                class: 'absol-selectmenu-btn',
                child: ['dropdown-ico']
            },
            {
                class: 'absol-selectmenu-dropdown-box',
                child: [
                    {
                        tag: 'searchtextinput', style: {
                            display: 'none'
                        }
                    },
                    'vscroller']
            },
            'attachhook',
        ]
    });

    res.eventHandler = OOP.bindFunctions(res, SelectTreeMenu.eventHandler);
    res.$renderSpace = SelectTreeMenu.getRenderSpace();

    res.$treelist = _('treelist', res).addTo(res.$renderSpace);
    res.$treelist.on('press', res.eventHandler.treelistPress, true);
    res.$vscroller = $('vscroller', res);
    res.on('click', res.eventHandler.click, true);
    res.on('blur', res.eventHandler.blur);

    res.$holderItem = $('.absol-selectmenu-holder-item', res);
    res.$dropdownBox = $('.absol-selectmenu-dropdown-box', res);
    res.$searchTextInput = $('searchtextinput', res);
    res.$searchTextInput.on('modify', res.eventHandler.searchModify);
    res.treeListBound = { height: 0, width: 0 };
    res.$attachhook = $('attachhook', res)
        .on('error', res.eventHandler.attached);

    res.sync = new Promise(function (rs) {
        $('attachhook', res).once('error', function () {
            rs();
        });
    });
    return res;
}

SelectTreeMenu.prototype.updateDropdownPostion = function (searching) {
    var screenBottom = Dom.getScreenSize().height;

    var outBound = Dom.traceOutBoundingClientRect(this);
    var searchBound = this.$searchTextInput.getBoundingClientRect();
    var bound = this.getBoundingClientRect();
    var availableTop = bound.top - outBound.top - (this.enableSearch ? searchBound.height + 8 : 0) - 20;
    var availableBottom = Math.min(outBound.bottom, screenBottom) - bound.bottom - (this.enableSearch ? searchBound.height + 8 : 0) - 20;
    if (this.forceDown || (!this.$dropdownBox.containsClass('up') && searching) || (!searching && (availableBottom >= this.treeListBound.height || availableBottom > availableTop))) {
        if (!searching) {
            this.$dropdownBox.removeClass('up');
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChildBefore(this.$searchTextInput, this.$vscroller);

        }
        if (availableBottom < this.treeListBound.height) {
            this.$vscroller.addStyle('height', availableBottom + 'px');
        }
        else {
            this.$vscroller.addStyle('height', this.treeListBound.height + 'px');
        }
    }
    else {
        if (!searching) {
            this.$dropdownBox.addClass('up');
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChild(this.$searchTextInput);
        }
        if (availableTop < this.treeListBound.height) {
            this.$vscroller.addStyle('height', availableTop + 'px');

        }
        else {
            this.$vscroller.addStyle('height', this.treeListBound.height + 'px');
        }
    }
    this.$vscroller.requestUpdateSize();
    // this.scrollToSelectedItem();
};

SelectTreeMenu.getRenderSpace = SelectMenu.getRenderSpace;

SelectTreeMenu.eventHandler = {};

SelectTreeMenu.eventHandler.attached = function () {
    if (this._updateInterval) return;
    if (!this.$treelist.parentNode) this.$content.addTo(this.$renderSpace);
    this._updateInterval = setInterval(function () {
        if (!this.isDescendantOf(document.body)) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
            this.$treelist.selfRemove();
        }
    }.bind(this), 10000);
};

SelectTreeMenu.eventHandler.click = function (event) {
    if (EventEmitter.hitElement(this.$treelist, event) || (this.isFocus && !EventEmitter.hitElement(this.$dropdownBox, event))) {
        event.preventDefault();
        this.isFocus = false;
    }
    else {
        if (!this.isFocus) {
            this.$treelist.addTo(this.$vscroller);
            this.isFocus = true;
        }
    }
};


SelectTreeMenu.eventHandler.searchModify = function (event) {
    var value = this.$searchTextInput.value;
}

SelectTreeMenu.eventHandler.treelistPress = function (event) {
    var value = event.target.value;
    this._value = value;
    //not need update tree
    this.$holderItem.clearChild()
        .addChild(_({
            class: 'absol-selectlist-item',
            child: '<span>' + event.target.text + '</span>'
        }));
};

SelectTreeMenu.prototype.updateSelectedItem = function () {
    var self = this;
    $('treelistitem', this.$treelist, function (elt) {
        if (elt.value == self.value) {
            self.$holderItem.clearChild();
            self.$holderItem.addChild(_({
                class: 'absol-selectlist-item',
                child: '<span>' + elt.text + '</span>'
            }));
            elt.active = true;
        }
        else {
            elt.active = false;
        }
    });
}

SelectTreeMenu.property = {};
SelectTreeMenu.property.items = {
    set: function (value) {
        this._items = value || [];
        this.$treelist.items = this._items;
        this.treeListBound = this.$treelist.getBoundingClientRect();
        this.addStyle('min-width', this.treeListBound.width + 'px');
        this.updateSelectedItem();
    },
    get: function () {
        return this._items;
    }
};

SelectTreeMenu.property.value = {
    set: function (value) {
        this._value = value;
        this.updateSelectedItem();
    },
    get: function () {
        return this._value;
    }
};

SelectTreeMenu.property.enableSearch = {
    set: function (value) {
        this._enableSearch = !!value;
        if (value) {
            this.$searchTextInput.removeStyle('display');
        }
        else {
            this.$searchTextInput.addStyle('display', 'none');
        }
    },
    get: function () {
        return !!this._enableSearch;
    }
};

SelectTreeMenu.property.isFocus = {
    set: function (value) {
        value = !!value;
        if (value == this.isFocus) return;
        this._isFocus = value;
        if (value) {
            this.addClass('focus');
            this.$treelist.addTo(this.$vscroller);
            $('body').on('click', this.eventHandler.bodyClick);
            if (this.enableSearch) {
                setTimeout(function () {
                    this.$searchTextInput.focus();
                }.bind(this), 50);
            }

            this.updateDropdownPostion();

        }
        else {
            this.$treelist.addTo(this.$renderSpace);
            $('body').off('click', this.eventHandler.bodyClick);
            this.removeClass('focus');
            this.$searchTextInput.value = '';
            //check need to update
            // console.log(this.$treelist.items , this.items, this.$treelist.items == this.items);
            // // if (this.$treelist.items != this.items)
            this.$treelist.items = this.items;
            setTimeout( this.updateSelectedItem.bind(this), 1);
            this.treeListBound = this.$treelist.getBoundingRecursiveRect();
        }
    },
    get: function () {
        return !!this._isFocus;
    }
};


SelectTreeMenu.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('disabled');
        }
        else {
            this.removeClass('disabled');
        }
    },
    get: function () {
        return this.containsClass('disabled');
    }
};


SelectTreeMenu.property.hidden = {
    set: function (value) {
        if (value) {
            this.addClass('hidden');
        }
        else {
            this.removeClass('hidden');
        }
    },
    get: function () {
        return this.addClass('hidden');
    }
};

Acore.creator.selecttreemenu = SelectTreeMenu;
export default SelectTreeMenu;