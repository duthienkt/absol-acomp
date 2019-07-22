import Acore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import SelectMenu from "./SelectMenu";
import Dom from "absol/src/HTML5/Dom";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { phraseMatch } from "absol/src/String/stringMatching";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";

var _ = Acore._;
var $ = Acore.$;


function SelectBox() {
    var res = _({
        class: ['absol-selectbox'],
        extendEvent: ['change', 'add', 'remove'],
        attr: {
            tabindex: '1'
        },
        child: [
            '.absol-selectbox-content-item',
            {
                class: 'absol-selectmenu-dropdown-box',
                child: [
                    {
                        tag: 'searchtextinput', style: {
                            display: 'none'
                        }
                    },
                    {
                        tag: 'bscroller',
                        class: 'limited-height',
                        child: [
                            '.absol-selectlist.search'//handled event by itself, reusing style

                        ]
                    }]
            },
            'attachhook',
        ]
    });
    res.eventHandler = OOP.bindFunctions(res, SelectBox.eventHandler);
    res.$renderSpace = SelectMenu.getRenderSpace();

    res.$vscroller = $('bscroller', res);
    res.$attachhook = $('attachhook', res);
    res.$selectlist = _('.absol-selectlist.choose', res).addTo(res.$renderSpace);
    res.$searchlist = $('.absol-selectlist.search', res).addStyle('display', 'none');
    res.on('click', res.eventHandler.click, true);
    res.on('blur', res.eventHandler.blur);
    res.$holderItem = $('.absol-selectbox-content-item', res);
    res.$dropdownBox = $('.absol-selectmenu-dropdown-box', res);
    res.$searchTextInput = $('searchtextinput', res);
    res.$searchTextInput.on('modify', res.eventHandler.searchModify);
    res.selectListBound = { height: 0, width: 0 };//selectlist did not init  

    res.sync = new Promise(function (rs) {
        res.$attachhook.once('error', function () {
            rs();
        });
    });

    res.$attachhook.on('error', res.eventHandler.attached);

    return res;
};





SelectBox.prototype.updateItemList = function () {
    var self = this;
    self.$selectlist.clearChild();
    this._items.map(function (item) {
        var text;
        if (typeof item == 'string') {
            text = item;
        }
        else {
            text = item.text;
        }
        return _({
            class: 'absol-selectlist-item',
            child: '<span>' + text + '</span>',
            props: {
                _data: item
            },
            on: {
                click: function (event) {
                    self.eventHandler.selectlistChange(event, this);
                }
            }
        }).addTo(self.$selectlist);
    });

    this.selectListBound = this.$selectlist.getBoundingClientRect();
    this.addStyle('min-width', this.selectListBound.width + 15 + 'px');
};



SelectBox.prototype.init = function (props) {
    props = props || [];
    Object.keys(props).forEach(function (key) {
        if (props[key] === undefined) delete props[key];
    });
    this.super(props);
};


SelectBox.prototype.resetFilter = function () {
    Array.prototype.forEach.call(this.$selectlist.childNodes, function (e) {
        e.removeStyle('display');
    }.bind(this));
};


SelectBox.prototype.updateDropdownPostion = function (searching) {
    var screenBottom = Dom.getScreenSize().height;
    var outBound = Dom.traceOutBoundingClientRect(this);
    var bound = this.getBoundingClientRect();
    var searchBound = this.$searchTextInput.getBoundingClientRect();

    var availableTop = bound.top - outBound.top - (this.enableSearch ? searchBound.height + 8 : 0) - 7;//for boder
    var availableBottom = Math.min(outBound.bottom, screenBottom) - bound.bottom - (this.enableSearch ? searchBound.height + 8 : 0) - 7;
    if (this.forceDown || (!this.$dropdownBox.containsClass('up') && searching) || (!searching && (availableBottom >= this.selectListBound.height || availableBottom > availableTop))) {
        if (!searching) {
            this.$dropdownBox.removeClass('up');
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChildBefore(this.$searchTextInput, this.$vscroller);

        }
        this.$vscroller.addStyle('max-height', availableBottom + 'px');
    }
    else {
        if (!searching) {
            this.$dropdownBox.addClass('up');
            this.$searchTextInput.selfRemove();
            this.$dropdownBox.addChild(this.$searchTextInput);
        }
        if (availableTop < this.selectListBound.height) {
            this.$vscroller.addStyle('max-height', availableTop + 'px');

        }
        else {
            this.$vscroller.addStyle('max-height', this.selectListBound.height + 'px');
        }
    }
};

SelectBox.prototype.addSelectedItem = function (data) {
    var self = this;
    _({
        tag: 'selectboxitem',
        props: {
            data: data
        },
        on: {
            close: function (event) {
                self.eventHandler.removeItem(event, this);
                event.itemData = data;
                self.emit('remove', event, self);
                self.emit('change', event, self);
            }
        }
    }).addTo(this.$holderItem);
};


SelectBox.prototype.queryValues = function () {
    return Array.prototype.map.call(this.$holderItem.childNodes, function (e) {
        var data = e.data;
        return (typeof data == 'string') ? data : data.value;
    })
};
SelectBox.prototype.querySelectedItems = function () {
    return Array.prototype.map.call(this.$holderItem.childNodes, function (e) {
        return e.data;
    });
};

SelectBox.prototype.updateSelectedItem = function () {
    if (!this._values) return;
    var dict = this._values.reduce(function (ac, cr) {
        var value = cr;
        ac[value] = true;
        return ac;
    }, {});
    this.$holderItem.clearChild();
    Array.prototype.forEach.call(this.$selectlist.childNodes, function (e) {
        var value = (typeof e._data == 'string') ? e._data : e._data.value;
        if (dict[value]) {
            e.addClass('selected');
            this.addSelectedItem(e._data);
        }
        else {
            e.removeClass('selected');
        }
    }.bind(this));
};



SelectBox.prototype.init = SelectMenu.prototype.init;


SelectBox.property = {};

SelectBox.property.isFocus = {
    set: function (value) {
        value = !!value;
        if (value == this.isFocus) return;
        this._isFocus = value;
        if (value) {
            $('body').on('click', this.eventHandler.bodyClick);
            this.addClass('focus');
            this.$searchlist.addStyle('display', 'none');
            this.$selectlist.addTo(this.$vscroller);
            if (this.enableSearch) {
                setTimeout(function () {
                    this.$searchTextInput.focus();
                }.bind(this), 50);
            }
            this.selectListBound = this.$selectlist.getBoundingClientRect();
            this.updateDropdownPostion();
        }
        else {
            this.$selectlist.addTo(this.$renderSpace);
            $('body').off('click', this.eventHandler.bodyClick);
            this.removeClass('focus');
            this.$searchTextInput.value = '';
            this.$searchTextInput.emit('stoptyping');
        }
    },
    get: SelectMenu.property.isFocus.get
};



SelectBox.property.items = {
    set: function (value) {
        this._items = value;
        this.updateItemList();
        // this.sync = this.sync.then(this.updateSelectedItem.bind(this));
    },
    get: SelectMenu.property.items.get
};

SelectBox.property.values = {
    set: function (value) {
        this._values = (value instanceof Array) ? value : [value];
        this.sync = this.sync.then(this.updateSelectedItem.bind(this));
    },
    get: function () {
        return this._values || [];
    }
};


SelectBox.property.enableSearch = {
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

SelectBox.property.disabled = {
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


SelectBox.property.hidden = SelectMenu.property.hidden;

SelectBox.eventHandler = Object.assign({}, SelectMenu.eventHandler);

SelectBox.eventHandler.attached = function (event) {
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

SelectBox.eventHandler.click = function (event) {
    if (EventEmitter.hitElement(this.$selectlist, event) || (this.isFocus && !EventEmitter.hitElement(this.$dropdownBox, event)) || EventEmitter.hitElement(this.$searchlist, event)) {
        event.preventDefault();
        this.isFocus = false;
    }
    else {
        if (!this.isFocus && (event.target == this.$holderItem || event.target == this)) {
            this.updateDropdownPostion();
            this.isFocus = true;
        }
    }
};


SelectBox.eventHandler.selectlistChange = function (event, itemElt) {
    //todo
    this.$vscroller.removeStyle('max-height');
    var data = itemElt._data;
    itemElt.addClass('selected');
    this.addSelectedItem(data);
    this._values = this.queryValues();
    this.resetFilter();
    event.itemData = data;
    this.emit('add', event, this);
    this.emit('change', event, this);
};

SelectBox.eventHandler.removeItem = function (event, item) {
    var data = item.data;
    item.selfRemove();
    Array.prototype.forEach.call(this.$selectlist.childNodes, function (e) {
        if (e._data == data) {
            e.removeClass('selected');
        }
    });
    Array.prototype.forEach.call(this.$searchlist.childNodes, function (e) {
        if (e._data == data) {
            e.removeClass('selected');
        }
    });
    this._values = this.queryValues();
    // this.emit('change', event, this);

};



SelectBox.eventHandler.searchModify = function (event) {
    var filterText = this.$searchTextInput.value.replace(/((\&nbsp)|(\s))+/g, ' ').trim();
    if (filterText.length == 0) {
        this.$selectlist.addTo(this.$vscroller);
        this.$searchlist.addStyle('display', 'none');
    }
    else {
        this.$searchlist.removeStyle('display');
        this.$selectlist.addTo(this.$renderSpace);
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
            });
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

        var self = this;
        self.$searchlist.clearChild();
        view.map(function (item) {
            var sameElement = Array.prototype.filter.call(self.$selectlist.childNodes, function (e) {
                return e._data == item;
            })[0];

            if (sameElement.style.display == 'none' || sameElement.containsClass('selected')) return;
            var text;
            if (typeof item == 'string') {
                text = item;
            }
            else {
                text = item.text;
            }
            return _({
                class: 'absol-selectlist-item',
                child: '<span>' + text + '<span>',
                props: {
                    _data: item
                },
                on: {
                    click: function (event) {
                        this.addStyle('display', 'none')
                        self.eventHandler.selectlistChange(event, sameElement);
                    }
                }
            }).addTo(self.$searchlist);
        });

    }

    if (filterText.length > 0)
        this.selectListBound = this.$searchlist.getBoundingClientRect();
    else
        this.selectListBound = this.$selectlist.getBoundingClientRect();

    this.updateDropdownPostion(true);

};;



function SelectBoxItem() {
    var res = _({
        class: 'absol-selectbox-item',
        extendEvent: 'close',
        child: [
            '.absol-selectbox-item-text',
            {
                class: 'absol-selectbox-item-close',
                child: '<span class="mdi mdi-close"></span>'
            }
        ]
    });
    res.eventHandler = OOP.bindFunctions(res, SelectBoxItem.eventHandler);
    res.$text = $('.absol-selectbox-item-text', res);
    res.$close = $('.absol-selectbox-item-close', res);
    res.$close.on('click', res.eventHandler.clickClose);
    return res;
};

SelectBoxItem.eventHandler = {};
SelectBoxItem.eventHandler.clickClose = function (event) {
    this.emit('close', event);
};

SelectBoxItem.property = {};

SelectBoxItem.property.data = {
    set: function (value) {
        this._data = value;
        this.$text.clearChild();
        this.$text.addChild(_('<span>' + this.text + '</span>'));
    },
    get: function () {
        return this._data;
    }
};

SelectBoxItem.property.text = {
    get: function () {
        if (typeof this._data == 'string')
            return this._data;
        else return this._data.text;
    }
};

SelectBoxItem.property.value = {
    get: function () {
        if (typeof this._data == 'string')
            return this._data;
        else return this._data.value;
    }
};


Acore.creator.selectbox = SelectBox;
Acore.creator.selectboxitem = SelectBoxItem;
export default SelectBox;