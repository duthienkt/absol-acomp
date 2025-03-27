import '../css/selectmenu.css';

import ACore from "../ACore";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom from "absol/src/HTML5/Dom";
import {prepareSearchForList, searchListByText} from "./list/search";
import SelectList from "./SelectList";

/*global absol*/
var _ = ACore._;
var $ = ACore.$;

ACore.creator['dropdown-ico'] = function () {
    return _([
        '<svg class="dropdown" width="100mm" height="100mm" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
        '<g transform="translate(0,-197)">',
        '<path d="m6.3152 218.09a4.5283 4.5283 0 0 0-3.5673 7.3141l43.361 55.641a4.5283 4.5283 0 0 0 7.1421 7e-3l43.496-55.641a4.5283 4.5283 0 0 0-3.5673-7.3216z" />',
        '</g>',
        '</svg>'
    ].join(''));
};


function SelectMenu() {
    var thisSM = this;
    this._items = [];
    this._value = null;
    this._lastValue = null;
    this.$holderItem = $('.absol-selectmenu-holder-item', this);

    this.$anchorCtn = SelectMenu.getAnchorCtn();
    this.$anchor = _('.absol-selectmenu-anchor.absol-disabled').addTo(this.$anchorCtn);
    this.$anchorContentCtn = _('.absol-selectmenu-anchor-content-container').addTo(this.$anchor);

    this.$dropdownBox = _('.absol-selectmenu-dropdown-box').addTo(this.$anchorContentCtn);
    this.$searchTextInput = _('searchtextinput').addStyle('display', 'none').addTo(this.$dropdownBox);
    this.$vscroller = _('bscroller').addTo(this.$dropdownBox);
    this.$selectlist = _('selectlist', this).addTo(this.$vscroller)
        .on('sizechangeasync', this.eventHandler.listSizeChangeAsync)
        .on('valuevisibilityasync', this.eventHandler.listValueVisibility);


    this.$scrollTrackElts = [];
    this.$removableTrackElts = [];

    this._itemsByValue = {};
    this.$searchTextInput.on('stoptyping', this.eventHandler.searchModify);
    this._searchCache = {};
    this.$selectlist.on('pressitem', this.eventHandler.selectlistPressItem, true);
    this.$selectlist.on('pressitem', function () {
        thisSM.isFocus = false;
    }, true);
    this._lastValue = "NOTHING_VALUE";
    this._resourceReady = true;


    this.on('mousedown', this.eventHandler.click, true);
    this.on('blur', this.eventHandler.blur);

    this.selectListBound = { height: 0, width: 0 };
    this.$attachhook = $('attachhook', this)
        .on('error', this.eventHandler.attached);

    this.sync = new Promise(function (rs) {
        $('attachhook', this).once('error', function () {
            rs();
        });
    });

    this._selectListScrollSession = null;
    this._itemIdxByValue = null;
    return this;
}

SelectMenu.tag = 'selectmenu-old';
SelectMenu.render = function () {
    return _({
        class: ['absol-selectmenu'],
        extendEvent: ['change', 'minwidthchange'],
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
            'attachhook',
        ]
    });
};

SelectMenu.optimizeResource = true;

// //will remove after SelectMenu completed
SelectMenu.getRenderSpace = function () {
    if (!SelectMenu.getRenderSpace.warned) {
        // console.warn('SelectMenu.getRenderSpace() will be removed in next version');
    }
    SelectMenu.getRenderSpace.warned = true;
    if (!SelectMenu.$renderSpace) {
        SelectMenu.$renderSpace = _('.absol-selectmenu-render-space')
            .addTo(document.body);
    }
    return SelectMenu.$renderSpace;
};


SelectMenu.getAnchorCtn = function () {
    if (!SelectMenu.$anchorCtn) {
        SelectMenu.$anchorCtn = _('.absol-selectmenu-anchor-container')
            .addTo(document.body);
    }
    return SelectMenu.$anchorCtn;
};


SelectMenu.prototype.updateItem = function () {
    this.$holderItem.clearChild();
    if (this._itemsByValue[this.value]) {
        var elt = _({ tag: 'selectlistitem', props: { data: this._itemsByValue[this.value] } }).addTo(this.$holderItem);
        elt.$descCtn.addStyle('width', this.$selectlist._descWidth + 'px');
    }
};

SelectMenu.prototype._dictByValue = function (items) {
    var dict = {};
    var item;
    for (var i = 0; i < items.length; ++i) {
        item = items[i];
        dict[item.value + ''] = item;
    }
    return dict;
};


SelectMenu.prototype.init = function (props) {
    props = props || {};
    Object.keys(props).forEach(function (key) {
        if (props[key] === undefined) delete props[key];
    });

    if (!('value' in props)) {
        if (props.items && props.items.length > 0) props.value = typeof props.items[0] == 'string' ? props.items[0] : props.items[0].value;
    }
    var value = props.value;
    delete props.value;
    this.super(props);
    this.value = value;
};

SelectMenu.property = {};
SelectMenu.property.items = {
    set: function (value) {
        this._searchCache = {};
        this._itemIdxByValue = null;
        /**
         * verity data
         */
        if (value) {
            value.forEach(function (it) {
                if (it && it.text) {
                    it.text = it.text + '';
                }
            });
        }

        this._items = value;
        this._itemsByValue = this._dictByValue(value);

        if (!this._itemsByValue[this.value] && value.length > 0) {
            this.value = value[0].value;
        }
        else
            this.updateItem();

        this.$dropdownBox.removeStyle('min-width');
        this.selectListBound = this.$selectlist.setItemsAsync(value || []);
        this.style.setProperty('--select-list-desc-width', this.$selectlist.measuredSize.descWidth + 'px');
        this._resourceReady = true;

        this.addStyle('min-width', this.selectListBound.width + 2 + 23 + 'px');
        this.emit('minwidthchange', {
            target: this,
            value: this.selectListBound.width + 2 + 23,
            type: 'minwidthchange'
        }, this);
    },
    get: function () {
        return this._items || [];
    }
};

SelectMenu.property.value = {
    set: function (value) {
        this.$selectlist.value = value;
        this._lastValue = value;
        this.updateItem();
    },
    get: function () {
        return this.$selectlist.value;
    }
};


SelectMenu.property.enableSearch = {
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

SelectMenu.prototype.updateDropdownPostion = function (updateAnchor) {
    if (!this.isFocus) {
        this.$anchorContentCtn
            .removeStyle('left')
            .removeStyle('top');
        this.$dropdownBox.removeStyle('min-width');
        return;
    }
    var bound = this.getBoundingClientRect();
    if (!updateAnchor) {
        var outBound = Dom.traceOutBoundingClientRect(this);

        if (!this.isFocus || bound.top > outBound.bottom || bound.bottom < outBound.top) {
            this.isFocus = false;
            return;
        }

        var anchorOutBound = Dom.traceOutBoundingClientRect(this.$anchor);
        var searchBound = this.$searchTextInput.getBoundingClientRect();
        var availableTop = bound.top - anchorOutBound.top - (this.enableSearch ? searchBound.height + 8 : 0) - 20;
        var availableBottom = anchorOutBound.bottom - bound.bottom - (this.enableSearch ? searchBound.height + 8 : 0) - 20;

        if (this.forceDown || availableBottom >= this.selectListBound.height || availableBottom > availableTop) {
            this.isDropdowUp = false;
            if (this.$dropdownBox.firstChild != this.$searchTextInput) {
                this.$searchTextInput.selfRemove();
                this.$dropdownBox.addChildBefore(this.$searchTextInput, this.$vscroller);
            }
            this.$vscroller.addStyle('max-height', availableBottom + 'px');
        }
        else {
            this.isDropdowUp = true;
            if (this.$dropdownBox.lastChild !== this.$searchTextInput) {
                this.$searchTextInput.selfRemove();
                this.$dropdownBox.addChild(this.$searchTextInput);
            }
            this.$vscroller.addStyle('max-height', availableTop + 'px');
        }
        this.$dropdownBox.addStyle('min-width', bound.width + 'px');
    }
    var anchorBound = this.$anchor.getBoundingClientRect();
    if (this.isDropdowUp) {
        this.$anchorContentCtn.addStyle({
            left: bound.left - anchorBound.left + 'px',
            top: bound.top - anchorBound.top - this.$dropdownBox.clientHeight - 1 + 'px',
        });
    }
    else {
        this.$anchorContentCtn.addStyle({
            left: bound.left - anchorBound.left + 'px',
            top: bound.bottom - anchorBound.top + 'px',
        });
    }
};

SelectMenu.prototype.scrollToSelectedItem = function () {
    var self = this;
    setTimeout(function () {
        if (self.$selectlist.$selectedItem) {
            var fistChildBound = self.$selectlist.childNodes[1].getBoundingClientRect();
            var lastChildBound = self.$selectlist.lastChild.getBoundingClientRect();
            var listBound = {
                top: fistChildBound.top,
                height: lastChildBound.bottom - fistChildBound.top,
                bottom: lastChildBound.bottom
            }
            var itemBound = self.$selectlist.$selectedItem.getBoundingClientRect();
            if (self.isDropdowUp) {
                var scrollBound = self.$vscroller.getBoundingClientRect();
                self.$vscroller.scrollTop = Math.max(itemBound.bottom - scrollBound.height - listBound.top, 0);

            }
            else {
                self.$vscroller.scrollTop = itemBound.top - listBound.top;
            }
        }
    }.bind(this), 3);
};


SelectMenu.prototype.startTrackScroll = function () {
    var trackElt = this.parentElement;
    while (trackElt) {
        if (trackElt.addEventListener) {
            trackElt.addEventListener('scroll', this.eventHandler.scrollParent, false);

        }
        else {
            trackElt.attachEvent('onscroll', this.eventHandler.scrollParent, false);
        }

        this.$scrollTrackElts.push(trackElt);
        trackElt = trackElt.parentElement;
    }
    if (document.addEventListener) {
        document.addEventListener('scroll', this.eventHandler.scrollParent, false);

        document.addEventListener('wheel', this.eventHandler.wheelDocument, true);
    }
    else {
        document.attachEvent('onscroll', this.eventHandler.scrollParent, false);
    }
    this.$scrollTrackElts.push(document);

};

SelectMenu.prototype.stopTrackScroll = function () {
    var trackElt;
    for (var i = 0; i < this.$scrollTrackElts.length; ++i) {
        trackElt = this.$scrollTrackElts[i];
        if (trackElt.removeEventListener) {
            trackElt.removeEventListener('scroll', this.eventHandler.scrollParent, false);
        }
        else {
            trackElt.dettachEvent('onscroll', this.eventHandler.scrollParent, false);

        }
    }
    this.$scrollTrackElts = [];
};

SelectMenu.prototype.startListenRemovable = function () {
    var removableElt = this.parentElement;
    while (removableElt) {
        if (removableElt.isSupportedEvent && removableElt.isSupportedEvent('remove')) {
            removableElt.on('remove', this.eventHandler.removeParent);
        }
        removableElt = removableElt.parentElement;
    }
};

SelectMenu.prototype.stopListenRemovable = function () {
    var removableElt;
    while (this.$removableTrackElts.length > 0) {
        removableElt = this.$removableTrackElts.pop();
        removableElt.off('remove', this.eventHandler.removeParent);
    }
};

SelectMenu.prototype._releaseResource = function () {
    this.$selectlist.items = [];
};

SelectMenu.prototype._requestResource = function () {
    this.$selectlist.items = this._items || [];
};

SelectMenu.property.isFocus = {
    set: function (value) {
        if (value && (this.disabled || this.readOnly)) return;
        var self = this;
        value = !!value;
        if (value == this.isFocus) return;
        this._isFocus = value;
        if (value) {
            this.startTrackScroll();
            this.selectListScrollToken = null;//force scroll
            var isAttached = false;
            setTimeout(function () {
                if (isAttached) return;
                $('body').on('mousedown', self.eventHandler.bodyClick);
                isAttached = true;
            }, 1000);
            $('body').once('click', function () {
                setTimeout(function () {
                    if (isAttached) return;
                    $('body').on('mousedown', self.eventHandler.bodyClick);
                    isAttached = true;
                }, 10);
            });

            if (this.enableSearch) {
                setTimeout(function () {
                    self.$searchTextInput.focus();
                }, 50);
            }

            this.updateDropdownPostion();
            this.scrollToSelectedItem();
            this.$anchor.removeClass('absol-disabled');
        }
        else {
            this.$anchor.addClass('absol-disabled');
            this.stopTrackScroll();
            $('body').off('mousedown', this.eventHandler.bodyClick);
            setTimeout(function () {
                if (self.$searchTextInput.value != 0) {
                    self.$searchTextInput.value = '';
                    self.$selectlist.items = self.items;
                    self._resourceReady = true;
                    self.$selectlist.removeClass('as-searching');
                }
            }, 100)
            this.updateItem();
        }
    },
    get: function () {
        return !!this._isFocus;
    }
};


SelectMenu.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('disabled');
        }
        else {
            this.removeClass('disabled');
        }
    },
    get: function () {
        return this.hasClass('disabled');
    }
};


SelectMenu.property.hidden = {
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

SelectMenu.property.selectedIndex = {
    get: function () {
        if (!this._itemIdxByValue) {
            this._itemIdxByValue = {};
            for (var i = 0; i < this._items.length; ++i) {
                this._itemIdxByValue[this._items[i].value] = i;
            }
        }
        var idx = this._itemIdxByValue[this._value];
        return idx >= 0 ? idx : -1;
    }
};

/**
 * @type {SelectMenu}
 */
SelectMenu.eventHandler = {};

SelectMenu.eventHandler.attached = function () {
    if (this._updateInterval) return;
    if (!this.$anchor.parentNode) this.$anchor.addTo(this.$anchorCtn);
    this.$attachhook.updateSize = this.$attachhook.updateSize || this.updateDropdownPostion.bind(this);
    Dom.addToResizeSystem(this.$attachhook);
    this.stopListenRemovable();
    this.startListenRemovable();
    if (!this._resourceReady) {
        this._requestResource();
        this._resourceReady = true;
    }
    this._updateInterval = setInterval(function () {
        if (!this.isDescendantOf(document.body)) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
            this.$anchor.selfRemove();
            this.stopTrackScroll();
            this.stopListenRemovable();
            this.eventHandler.removeParent();
        }
    }.bind(this), 10000);
};


SelectMenu.eventHandler.scrollParent = function (event) {
    var self = this;
    if (this._scrollFrameout > 0) {
        this._scrollFrameout = 10;
        return;
    }
    this._scrollFrameout = this._scrollFrameout || 10;

    function update() {
        self.updateDropdownPostion(false);
        self.scrollToSelectedItem();
        self._scrollFrameout--;
        if (self._scrollFrameout > 0) requestAnimationFrame(update);
    }

    update();
};

SelectMenu.eventHandler.removeParent = function (event) {
    this._releaseResource();
    this._resourceReady = false;
};

SelectMenu.eventHandler.click = function (event) {
    if (EventEmitter.isMouseRight(event)) return;
    this.isFocus = !this.isFocus;
};


SelectMenu.eventHandler.bodyClick = function (event) {
    if (!EventEmitter.hitElement(this, event) && !EventEmitter.hitElement(this.$anchor, event)) {
        setTimeout(function () {
            this.isFocus = false;
        }.bind(this), 5)
    }
};

SelectMenu.eventHandler.selectlistPressItem = function (event) {
    this.updateItem();
    if (this._lastValue != this.value) {
        event.lastValue = this._lastValue;
        event.value = this.value;
        setTimeout(function () {
            this.emit('change', event, this);
        }.bind(this), 1)
        this._lastValue = this.value;
    }
};


SelectMenu.eventHandler.searchModify = function (event) {
    var filterText = this.$searchTextInput.value.replace(/((\&nbsp)|(\s))+/g, ' ').trim();
    if (filterText.length == 0) {
        this._resourceReady = true;
        this.$selectlist.items = this.items;
        this.scrollToSelectedItem();
        this.$selectlist.removeClass('as-searching');
    }
    else {
        this.$selectlist.addClass('as-searching');
        var view = [];
        if (!this._searchCache[filterText]) {
            if (this._items.length > 0 && !this._items[0].__nvnText__) {
                prepareSearchForList(this._items);
            }

            view = searchListByText(filterText, this._items);
            this._searchCache[filterText] = view;
        }
        else {
            view = this._searchCache[filterText];
        }
        this.$selectlist.items = view;
        this._resourceReady = true;
        this.$vscroller.scrollTop = 0;
    }

    this.selectListBound = this.$selectlist.getBoundingClientRect();
    this.updateDropdownPostion(true);
};

SelectMenu.eventHandler.listSizeChangeAsync = function () {
    this.updateDropdownPostion();
};

SelectMenu.eventHandler.listValueVisibility = function (event) {
    if (!this.isFocus) return;
    if (this._selectListScrollSession == event.session) return;

    this._selectListScrollSession = event.session;
    this.scrollToSelectedItem();
};


ACore.install(SelectMenu);

export default SelectMenu;
