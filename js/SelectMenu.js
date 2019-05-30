import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { phraseMatch } from "absol/src/String/stringMatching";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import Dom from "absol/src/HTML5/Dom";

/*global absol*/
var _ = Acore._;
var $ = Acore.$;


Acore.creator['dropdown-ico'] = function () {
    return _([
        '<svg class="dropdown" width="100mm" height="100mm" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">',
        '<g transform="translate(0,-197)">',
        '<path d="m6.3152 218.09a4.5283 4.5283 0 0 0-3.5673 7.3141l43.361 55.641a4.5283 4.5283 0 0 0 7.1421 7e-3l43.496-55.641a4.5283 4.5283 0 0 0-3.5673-7.3216z" />',
        '</g>',
        '</svg>'
    ].join(''));
};


function SelectMenu() {
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

    res.eventHandler = OOP.bindFunctions(res, SelectMenu.eventHandler);
    res.$renderSpace = SelectMenu.getRenderSpace();

    res.$selectlist = _('selectlist', res).addTo(res.$renderSpace);
    res.$selectlist.on('change', res.eventHandler.selectlistChange, true);
    res.$vscroller = $('vscroller', res);
    res.on('click', res.eventHandler.click, true);
    res.on('blur', res.eventHandler.blur);

    res.$holderItem = $('.absol-selectmenu-holder-item', res);
    res.$dropdownBox = $('.absol-selectmenu-dropdown-box', res);
    res.$searchTextInput = $('searchtextinput', res);
    res.$searchTextInput.on('modify', res.eventHandler.searchModify);
    res.selectListBound = { height: 0, width: 0 };
    res.$attachhook = $('attachhook', res)
        .on('error', res.eventHandler.attached);

    res.sync = new Promise(function (rs) {
        $('attachhook', res).once('error', function () {
            rs();
        });
    });

    return res;
};



SelectMenu.getRenderSpace = function () {
    if (!SelectMenu.$renderSpace) {
        SelectMenu.$renderSpace = _('.absol-selectmenu-render-space')
            .addTo(document.body);
    };
    return SelectMenu.$renderSpace;
}



SelectMenu.prototype.updateItem = function () {
    this.$holderItem.clearChild();
    if (this.$selectlist.item)
        this.$selectlist.creatItem(this.$selectlist.item).addTo(this.$holderItem);
};



SelectMenu.prototype.init = function (props) {
    props = props || [];
    Object.keys(props).forEach(function (key) {
        if (props[key] === undefined) delete props[key];
    });

    this.super(props);
};

SelectMenu.property = {};
SelectMenu.property.items = {
    set: function (value) {
        this._items = value;
        this.$selectlist.items = value || [];
        this.selectListBound = this.$selectlist.getBoundingClientRect();
        this.addStyle('min-width', this.selectListBound.width + 2 + 30 + 'px');

        if (this.$selectlist.items.length > 0 && (this.$selectlist.item === undefined || this.value === undefined)) {
            this.value = this.items[0].value !== undefined ? this.items[0].value : this.items[0];
        }
    },
    get: function () {
        return this._items || [];
    }
};

SelectMenu.property.value = {
    set: function (value) {
        if (value === undefined && this._items && this.items.length > 0) {
            value = this._items[0].value !== undefined ? this._items[0].value : this._items[0];
        }
        this.$selectlist.value = value;
        this._lastValue = value;
        this.sync = this.sync.then(this.updateItem.bind(this));
    },
    get: function () {
        return this.$selectlist.value;
    }
};

SelectMenu.property.selectedIndex = {
    get: function () {
        if (!this._items) return -1;
        var value = this.value;
        for (var i = 0; i < this._items.length; ++i) {
            if (value == this._items[i] || value == this._items[i].value)
                return i;
        }
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

SelectMenu.prototype.updateDropdownPostion = function (searching) {
    var screenBottom = Dom.getScreenSize().height;

    var outBound = Dom.traceOutBoundingClientRect(this);
    var searchBound = this.$searchTextInput.getBoundingClientRect();
    var bound = this.getBoundingClientRect();
    var availableTop = bound.top - outBound.top - (this.enableSearch ? searchBound.height + 8 : 0) - 20;
    var availableBottom = Math.min(outBound.bottom, screenBottom) - bound.bottom - (this.enableSearch ? searchBound.height + 8 : 0) - 20;
    if (this.forceDown || (!this.$dropdownBox.containsClass('up') && searching) || (!searching && (availableBottom >= this.selectListBound.height || availableBottom > availableTop))) {
        if (!searching) {
            this.$dropdownBox.removeClass('up');
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChildBefore(this.$searchTextInput, this.$vscroller);

        }
        if (availableBottom < this.selectListBound.height) {
            this.$vscroller.addStyle('height', availableBottom + 'px');
        }
        else {
            this.$vscroller.addStyle('height', this.selectListBound.height + 'px');
        }
    }
    else {
        if (!searching) {
            this.$dropdownBox.addClass('up');
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChild(this.$searchTextInput);
        }
        if (availableTop < this.selectListBound.height) {
            this.$vscroller.addStyle('height', availableTop + 'px');

        }
        else {
            this.$vscroller.addStyle('height', this.selectListBound.height + 'px');
        }
    }
    this.$vscroller.requestUpdateSize();
    this.scrollToSelectedItem();
};

SelectMenu.prototype.scrollToSelectedItem = function () {

    requestAnimationFrame(function () {
        $('.selected', this.$selectlist, function (e) {
            var scrollBound = this.$vscroller.getBoundingClientRect();
            var itemBound = e.getBoundingClientRect();
            if (itemBound.top < scrollBound.top) {
                this.$vscroller.$viewport.scrollTop -= scrollBound.top - itemBound.top;
            }
            else {
                var newScrollTop = this.$vscroller.$viewport.scrollTop - (scrollBound.top - itemBound.top);
                if (newScrollTop > this.$vscroller.$viewport.scrollHeight - scrollBound.height) {
                    newScrollTop = this.$vscroller.$viewport.scrollHeight - scrollBound.height;
                }
                if (newScrollTop < 0) newScrollTop = 0;
                this.$vscroller.$viewport.scrollTop = newScrollTop;
            }
            this.$vscroller.$vscrollbar.innerOffset = this.$vscroller.$viewport.scrollTop;
            this.$vscroller.requestUpdateSize();
            return true;
        }.bind(this));
    }.bind(this));
};

SelectMenu.prototype.init = function (props) {
    this.super(props);
};

SelectMenu.property.isFocus = {
    set: function (value) {
        value = !!value;
        if (value == this.isFocus) return;
        this._isFocus = value;
        if (value) {
            this.addClass('focus');
            this.$selectlist.addTo(this.$vscroller);
            $('body').on('click', this.eventHandler.bodyClick);
            if (this.enableSearch) {
                setTimeout(function () {
                    this.$searchTextInput.focus();
                }.bind(this), 50);
            }

            this.updateDropdownPostion();

        }
        else {
            this.$selectlist.addTo(this.$renderSpace);
            $('body').off('click', this.eventHandler.bodyClick);
            this.removeClass('focus');
            this.$searchTextInput.value = '';
            this.$selectlist.items = this.items;
            this.selectListBound = this.$selectlist.getBoundingRecursiveRect();
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
        return this.containsClass('disabled');
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

SelectMenu.eventHandler = {};

SelectMenu.eventHandler.attached = function () {
    if (this._updateInterval) return;
    if (!this.$selectlist.parentNode) this.$content.addTo(this.$renderSpace);
    this._updateInterval = setInterval(function () {
        if (!this.isDescendantOf(document.body)) {
            clearInterval(this._updateInterval);
            this._updateInterval = undefined;
            this.$selectlist.selfRemove();
        }
    }.bind(this), 10000);
};

SelectMenu.eventHandler.click = function (event) {
    if (EventEmitter.hitElement(this.$selectlist, event) || (this.isFocus && !EventEmitter.hitElement(this.$dropdownBox, event))) {
        event.preventDefault();
        this.isFocus = false;
    }
    else {
        if (!this.isFocus) {
            this.$selectlist.addTo(this.$vscroller);
            this.isFocus = true;
        }
    }
};



SelectMenu.eventHandler.bodyClick = function (event) {
    if (!EventEmitter.hitElement(this, event)) {
        this.isFocus = false;
    }
};

SelectMenu.eventHandler.selectlistChange = function (event) {
    this.updateItem();
    this.selectMenuValue = this.value;
    if (this._lastValue != this.value) {
        this.emit('change', event, this);
        this._lastValue = this.value;
    }
};


SelectMenu.eventHandler.searchModify = function (event) {
    var filterText = this.$searchTextInput.value.replace(/((\&nbsp)|(\s))+/g, ' ').trim();
    if (filterText.length == 0) {
        this.$selectlist.items = this.items;
    }
    else {
        var view = [];
        if (filterText.length == 1) {
            view = this.items.map(function (item) {
                var res = { item: item, text: typeof item === 'string' ? item : item.text };
                return res;
            }).map(function (it) {
                it.score = 0;
                var text = it.text.replace(/((\&nbsp)|(\s))+/g, ' ').trim();
                it.score += text.toLowerCase().indexOf(filterText.toLowerCase()) >= 0 ? 100 : 0;
                text = nonAccentVietnamese(text);
                it.score += text.toLowerCase().indexOf(filterText.toLowerCase()) >= 0 ? 100 : 0;
                return it;
            });

            view.sort(function (a, b) {
                if (b.score - a.score == 0) {
                    if (nonAccentVietnamese(b.text) > nonAccentVietnamese(a.text)) return -1;
                    return 1;
                }
                return b.score - a.score;
            });
            view = view.filter(function (x) {
                return x.score > 0;
            })
        }
        else {
            var its = this.items.map(function (item) {
                var res = { item: item, text: typeof item === 'string' ? item : item.text };
                var text = res.text.replace(/((\&nbsp)|(\s))+/g, ' ').trim();
                res.score = (phraseMatch(text, filterText)
                    + phraseMatch(nonAccentVietnamese(text), nonAccentVietnamese(filterText))) / 2;
                if (nonAccentVietnamese(text).replace(/s/g, '').toLowerCase().indexOf(nonAccentVietnamese(filterText).toLowerCase().replace(/s/g, '')) > -1)
                    res.score = 100;
                return res;
            });
            if (its.length == 0) return;

            its.sort(function (a, b) {
                if (b.score - a.score == 0) {
                    if (nonAccentVietnamese(b.text) > nonAccentVietnamese(a.text)) return -1;
                    return 1;
                }
                return b.score - a.score;
            });
            var view = its.filter(function (x) {
                return x.score > 0.5;
            });
            if (view.length == 0) {
                var bestScore = its[0].score;
                view = its.filter(function (it) {
                    return it.score + 0.001 >= bestScore;
                });
            }
            if (view[0].score == 0) view = [];
        }
        view = view.map(function (e) {
            return e.item;
        });
        this.$selectlist.items = view;
    }

    this.selectListBound = this.$selectlist.getBoundingRecursiveRect();
    this.updateDropdownPostion(true);
};

Acore.creator.selectmenu = SelectMenu;

export default SelectMenu