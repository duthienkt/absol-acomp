import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { phraseMatch } from "absol/src/String/stringMatching";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import Svg from "absol/src/HTML5/Svg";
import OOP from "absol/src/HTML5/OOP";
import "./BScroller";

var privateDom = new Dom().install(Acore);
var $ = privateDom.$;
var _ = privateDom._;


function SelectTable() {
    var res = _({
        class: 'absol-select-table',
        extendEvent: ['change', 'addall', 'removeall', 'add', 'remove'],
        child: [
            {
                class: 'absol-select-table-header',
                child: [
                    {
                        class: 'absol-select-table-searchtextinput-container',
                        child: 'searchtextinput'
                    },
                    {
                        class: 'absol-select-table-buttons-container',
                        child: [
                            {
                                tag: 'button',
                                class: 'add-all',
                                props: {
                                    innerHTML: 'Add All'
                                }
                            },
                            {
                                tag: 'button',
                                class: 'remove-all',
                                props: {
                                    innerHTML: 'Remove All'
                                }
                            }
                        ]
                    }

                ]
            },
            {
                class: 'absol-select-table-body',
                child: [

                    {
                        tag: 'bscroller',
                        attr: { id: 'nonselected' },
                        class: ['absol-select-table-items-scroller'],
                        child: {
                            child: ['.absol-select-table-nonselected-items-container', '.absol-select-table-nonselected-search-items-container']
                        }
                    },
                    {
                        tag: 'bscroller',
                        attr: { id: 'selected' },
                        class: ['absol-select-table-items-scroller'],
                        child: {
                            child: ['.absol-select-table-selected-items-container', '.absol-select-table-selected-search-items-container']

                        }

                    }
                ]
            }
        ]
    });

    res.sync = res.afterAttached();
    res.eventHandler = OOP.bindFunctions(res, SelectTable.eventHandler);
    res.$buttonsContainer = $('.absol-select-table-buttons-container', res);
    res.$searchContainer = $('.absol-select-table-searchtextinput-container', res);
    res.$nonselectedItemsContainer = $('.absol-select-table-nonselected-items-container', res);
    res.$selectedItemsContainer = $('.absol-select-table-selected-items-container', res);

    res.$nonselectedSearchItemsContainer = $('.absol-select-table-nonselected-search-items-container', res);
    res.$selectedSearchItemsContainer = $('.absol-select-table-selected-search-items-container', res);

    res.$removeAllBtn = $('button.remove-all', res).on('click', res.eventHandler.removeAllBtnClick);
    res.$addAllBtn = $('button.add-all', res).on('click', res.eventHandler.addAllBtnClick);
    res.$vscrollerSelected = $('bscroller#selected', res)
    res.$vscrollerNonselected = $('bscroller#nonselected', res);
    res.$body = $('.absol-select-table-body', res);
    res.$header = $('.absol-select-table-header', res);
    res.$searchTextInput = $('searchtextinput', res).on('stoptyping', res.eventHandler.searchTextInputModify);
    return res;
};



SelectTable.prototype.updateButtonsContainerSize = function () {
    var rootBound = this.$buttonsContainer.getBoundingClientRect();
    var containBound = this.$buttonsContainer.getBoundingRecursiveRect();
    var fontSize = this.getFontSize();
    this.$buttonsContainer.addStyle('width', (containBound.width + 1) / fontSize + 'em');
    this.$searchContainer.addStyle('right', (containBound.width + 5) / fontSize + 'em');
};

SelectTable.prototype.addAll = function () {
    Array.apply(null, this.$nonselectedItemsContainer.childNodes).forEach(function (e) {
        e.addTo(this.$selectedItemsContainer);
    }.bind(this));
    this.requestSort();
};

SelectTable.prototype.removeAll = function () {
    Array.apply(null, this.$selectedItemsContainer.childNodes).forEach(function (e) {
        e.addTo(this.$nonselectedItemsContainer);
    }.bind(this))
    this.requestSort();
};

SelectTable.prototype.updateScroller = function () {
    var update = function () {
        if (this.style.height) {
            var height = parseFloat(this.getComputedStyleValue('height').replace('px', ''));
            var headerHeight = parseFloat(this.$header.getComputedStyleValue('height').replace('px', ''));
            var bodyMargin = parseFloat(this.$body.getComputedStyleValue('margin-top').replace('px', ''));
            var borderWidth = 1;
            var availableHeight = height - headerHeight - bodyMargin * 2 - borderWidth * 2;
            this.$vscrollerNonselected.addStyle('max-height', availableHeight + 'px');
            this.$vscrollerSelected.addStyle('max-height', availableHeight + 'px');
        }
    }.bind(this);
    setTimeout(update, 1);
};

SelectTable.prototype.getAllItemElement = function () {
    var selectedItemElements = Array.apply(null, this.$selectedItemsContainer.childNodes);
    var nonselectedItemElements = Array.apply(null, this.$nonselectedItemsContainer.childNodes);
    return selectedItemElements.concat(nonselectedItemElements);
};

SelectTable.prototype.init = function (props) {
    this.super(props);
    this.sync = this.sync.then(this.updateButtonsContainerSize.bind(this));
};

SelectTable.eventHandler = {};
SelectTable.eventHandler.addAllBtnClick = function (event) {
    this.addAll();
    if (this.searching) {
        this.eventHandler.searchTextInputModify(event);
    }
    this.emit('addall', EventEmitter.copyEvent(event, {}), this);
    this.updateScroller();
};

SelectTable.eventHandler.removeAllBtnClick = function (event) {
    this.removeAll();
    if (this.searching) {
        this.eventHandler.searchTextInputModify(event);
    }
    this.emit('removeall', EventEmitter.copyEvent(event, {}), this);
    this.updateScroller();
};

SelectTable.prototype._filter = function (items, filterText) {
    var result = [];
    if (filterText.length == 1) {
        result = items.map(function (item) {
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

        result.sort(function (a, b) {
            if (b.score - a.score == 0) {
                if (nonAccentVietnamese(b.text) > nonAccentVietnamese(a.text)) return -1;
                return 1;
            }
            return b.score - a.score;
        });
        result = result.filter(function (x) {
            return x.score > 0;
        });
    }
    else {
        var its = items.map(function (item) {
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
        var result = its.filter(function (x) {
            return x.score > 0.5;
        });
        if (result.length == 0) {
            var bestScore = its[0].score;
            result = its.filter(function (it) {
                return it.score + 0.001 >= bestScore;
            });
        }
        if (result[0].score == 0) result = [];
    }
    result = result.map(function (e) {
        return e.item;
    });

    return result;
};

SelectTable.prototype._stringcmp = function (s0, s1) {
    if (s0 == s1) return 0;
    if (s0 > s1) return 1;
    return -1;
};

SelectTable.prototype._getString = function (item) {
    if (typeof item == "string") return item;
    return item.text;
};

SelectTable.prototype._equalArr = function (a, b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] != b[i] && a[i].text != b[i].text && a[i].value != b[i].value) return false;
    }
    return true;
};


SelectTable.prototype._applySort = function (items, sortFlag) {
    var res = items.slice();

    if (sortFlag == 1 || sortFlag === true) {
        res.sort(function (a, b) {
            return this._stringcmp(this._getString(a), this._getString(b))
        }.bind(this))
    }
    else if (sortFlag == -1) {
        res.sort(function (a, b) {
            return - this._stringcmp(this._getString(a), this._getString(b))
        }.bind(this))
    }
    else if (typeof sortFlag == 'function') {
        res.sort(function (a, b) {
            return sortFlag(a, b)
        }.bind(this))
    }
    return res;
};

SelectTable.prototype.requestSort = function () {
    
    if (!this.sorted || this.sorted == 0) return;
    var selectedItems = this.selectedItems;
    var selectedItemsNew = this._applySort(selectedItems, this.sorted);
    if (!this._equalArr(selectedItems, selectedItemsNew)) {
        this.selectedItems = selectedItemsNew;
    }

    var nonselectedItems = this.nonselectedItems;
    var nonselectedItemsNew = this._applySort(nonselectedItems, this.sorted);
    if (!this._equalArr(nonselectedItems, nonselectedItemsNew)) {
        this.nonselectedItems = nonselectedItemsNew;
    }

};

SelectTable.eventHandler.searchTextInputModify = function (event) {
    var filterText = this.$searchTextInput.value.trim();
    if (filterText.length > 0) {
        var selectedItems = this.selectedItems;
        var nonselectedItems = this.nonselectedItems;
        this.selectedSearchItems = selectedItems;
        this.nonselectedSearchItems = this._filter(nonselectedItems, filterText);
        this.selectedSearchItems = this._filter(selectedItems, filterText);
    }
    else {
    }
    this.searching = filterText.length > 0;

};




SelectTable.property = {};

SelectTable.property.disableMoveAll = {
    set: function (value) {
        if (value)
            this.addClass('disable-move-all');
        else
            this.removeClass('disable-move-all');
    },
    get: function () {
        return this.containsClass('disable-move-all');
    }
};

SelectTable.property.removeAllText = {
    set: function (text) {
        this._removeAllText = text;
        //todo: update remove all text
        if (!text)
            this.$removeAllBtn.addStyle('display', 'none');
        else {
            this.$removeAllBtn.removeStyle('display');
            this.$removeAllBtn.innerHTML = this.removeAllText;
            this.updateButtonsContainerSize();
        }
    },
    get: function () {
        return this._removeAllText || 'Remove All'
    }
};

SelectTable.property.addAllText = {
    set: function (text) {
        this._addAllText = text;
        if (!text)
            this.$addAllBtn.addStyle('display', 'none');
        else {
            this.$addAllBtn.removeStyle('display');
            this.$addAllBtn.innerHTML = this.removeAllText;
            this.updateButtonsContainerSize();
        }
    },
    get: function () {
        return this._addAllText || 'Add All'
    }
};

SelectTable.property.searching = {
    set: function (value) {
        if (value) {
            this.addClass('searching');
        }
        else {
            this.removeClass('searching');
        }
        this.updateScroller();
    },
    get: function () {
        return this.containsClass('searching');
    }
};




SelectTable.property.sorted = {
    set: function (value) {
        this._sort = value;
        this.requestSort();

    },
    get: function () {
        return this._sort;
    }
};

SelectTable.property.selectedItems = {
    set: function (items) {
        this.$selectedItemsContainer.clearChild();
        var $nonselectedItemsContainer = this.$nonselectedItemsContainer;
        var $selectedItemsContainer = this.$selectedItemsContainer;
        var self = this;
        if (items instanceof Array) {
            items.map(function (item) {
                return _({
                    tag: 'item',
                    props: {
                        data: item
                    },
                    on: {
                        requestmove: function (event) {
                            if (this.parentElement == $selectedItemsContainer) {
                                this.addTo($nonselectedItemsContainer);
                                self.emit('remove', EventEmitter.copyEvent(event, { item: item }), self);
                            }
                            else {
                                this.addTo($selectedItemsContainer);
                                self.emit('add', EventEmitter.copyEvent(event, { item: item }), self);
                            }
                            self.updateScroller();
                            self.requestSort();

                        }
                    }
                }).addTo(this.$selectedItemsContainer);
            }.bind(this))
        }
        else {
            // error
        }
        this.updateScroller();
        this.requestSort();
    },
    get: function () {
        return Array.prototype.map.call(this.$selectedItemsContainer.childNodes, function (e) {
            return e.data;
        });
    }

}

SelectTable.property.nonselectedItems = {
    set: function (items) {
        this.$nonselectedItemsContainer.clearChild();
        var $nonselectedItemsContainer = this.$nonselectedItemsContainer;
        var $selectedItemsContainer = this.$selectedItemsContainer;
        var self = this;
        if (items instanceof Array) {
            items.map(function (item) {
                return _({
                    tag: 'item',
                    props: {
                        data: item
                    },
                    on: {
                        requestmove: function (event) {
                            if (this.parentElement == $selectedItemsContainer) {
                                this.addTo($nonselectedItemsContainer);
                                self.emit('remove', EventEmitter.copyEvent(event, { item: item }), self);
                            }
                            else {
                                this.addTo($selectedItemsContainer);
                                self.emit('add', EventEmitter.copyEvent(event, { item: item }), self);
                            }
                            self.updateScroller();
                            self.requestSort();
                        }
                    }
                }).addTo(this.$nonselectedItemsContainer);
            }.bind(this))
        }
        else {
            // error
        }
        this.updateScroller();
        this.requestSort();
    },
    get: function () {
        return Array.prototype.map.call(this.$nonselectedItemsContainer.childNodes, function (e) {
            return e.data;
        });
    }
};


SelectTable.property.selectedSearchItems = {
    set: function (items) {
        this.$selectedSearchItemsContainer.clearChild();
        var $nonselectedSearchItemsContainer = this.$nonselectedSearchItemsContainer;
        var $selectedSearchItemsContainer = this.$selectedSearchItemsContainer;
        var table = this;
        if (items instanceof Array) {
            items.map(function (item) {
                return _({
                    tag: 'item',
                    props: {
                        data: item
                    },
                    on: {
                        requestmove: function (event) {
                            if (this.parentElement == $selectedSearchItemsContainer) {
                                this.addTo($nonselectedSearchItemsContainer);
                                table.getAllItemElement().filter(function (itemElement) {
                                    if (itemElement.data == this.data) {
                                        itemElement.addTo(table.$nonselectedItemsContainer);
                                        return true;
                                    }
                                    return false;
                                }.bind(this));
                                table.emit('remove', EventEmitter.copyEvent(event, { item: item }), table);

                            }
                            else {
                                this.addTo($selectedSearchItemsContainer);
                                table.getAllItemElement().filter(function (itemElement) {
                                    if (itemElement.data == this.data) {
                                        itemElement.addTo(table.$selectedItemsContainer);
                                        return true;
                                    }
                                    return false;
                                }.bind(this));
                                table.emit('add', EventEmitter.copyEvent(event, { item: item }), table);

                            }
                            table.updateScroller();
                            table.requestSort();
                        }
                    }
                }).addTo(this.$selectedSearchItemsContainer);
            }.bind(this))
        }
        else {
            // error
        }
        this.updateScroller();
    },
    get: function () {
        return Array.prototype.map.call(this.$selectedSearchItemsContainer.childNodes, function (e) {
            return e.data;
        });
    }

}

SelectTable.property.nonselectedSearchItems = {
    set: function (items) {
        this.$nonselectedSearchItemsContainer.clearChild();
        var $nonselectedSearchItemsContainer = this.$nonselectedSearchItemsContainer;
        var $selectedSearchItemsContainer = this.$selectedSearchItemsContainer;
        var table = this;
        if (items instanceof Array) {
            items.map(function (item) {
                return _({
                    tag: 'item',
                    props: {
                        data: item
                    },
                    on: {
                        requestmove: function (event) {
                            if (this.parentElement == $selectedSearchItemsContainer) {
                                this.addTo($nonselectedSearchItemsContainer);
                                table.getAllItemElement().filter(function (itemElement) {
                                    if (itemElement.data == this.data) {
                                        itemElement.addTo(table.$nonselectedItemsContainer);
                                        return true;
                                    }
                                    return false;
                                }.bind(this));
                                table.emit('remove', EventEmitter.copyEvent(event, { item: item }), table);
                            }
                            else {
                                this.addTo($selectedSearchItemsContainer);
                                table.getAllItemElement().filter(function (itemElement) {
                                    if (itemElement.data == this.data) {
                                        itemElement.addTo(table.$selectedItemsContainer);
                                        return true;
                                    }
                                    return false;
                                }.bind(this));
                                table.emit('add', EventEmitter.copyEvent(event, { item: item }), table);

                            }
                            table.updateScroller();
                            table.requestSort();

                        }
                    }
                }).addTo(this.$nonselectedSearchItemsContainer);
            }.bind(this))
        }
        else {
            // error
        }
        this.updateScroller();
    },
    get: function () {
        return Array.prototype.map.call(this.$nonselectedSearchItemsContainer.childNodes, function (e) {
            return e.data;
        });
    }
};


/*
namespace of selecttable
*/
function Item() {
    var res = _({
        extendEvent: ['requestmove'],
        class: 'absol-select-table-item',
        child: ['span.absol-select-table-item-text',
            {
                class: 'absol-select-table-item-right-container',
                child: {
                    class: 'absol-select-table-item-right-container-table',
                    child: {
                        class: 'absol-select-table-item-right-container-cell',
                        child: ['addicon', 'subicon']
                    }
                }

            }
        ]
    });
    res.$text = $('span', res);
    res.eventHandler = OOP.bindFunctions(res, Item.eventHandler);
    res.$rightBtn = $('.absol-select-table-item-right-container', res);
    res.on('dblclick', res.eventHandler.dblclick);
    res.$rightBtn.on('click', res.eventHandler.rightBtClick);
    return res;
};


Item.eventHandler = {};
Item.eventHandler.dblclick = function (event) {
    event.preventDefault();
    if (!EventEmitter.hitElement(this.$rightBtn, event))
        this.emit('requestmove', event, this);
};

Item.eventHandler.rightBtClick = function (event) {
    this.emit('requestmove', event, this);
};


Item.property = {};
Item.property.data = {
    set: function (value) {
        this._data = value;
        if (value) {
            var text;
            if (typeof value == "string") {
                text = value;
            }
            else {
                text = value.text;
            }
            this.$text.innerHTML = text;
        }
    },
    get: function () {
        return this._data;
    }
};

Item.property.text = {
    get: function () {
        return this._data ? (typeof this._data == 'string' ? this._data : this._data.text) : '';
    }
};

/**
 * 
 * <svg width="100mm" height="100mm" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
 <g transform="translate(0,-197)">
  <path d="m39.873 198.21v38.668h-38.668v20.252h38.668v38.668h20.253v-38.668h38.668v-20.252h-38.668v-38.668z" style="fill-rule:evenodd;fill:#5fbbc2;stroke-linejoin:round;stroke-width:2.4109;stroke:#002eea"/>
 </g>
</svg>
 */

function AddIcon() {
    return Svg.ShareInstance.buildSvg(
        '<svg class="add-icon" width="100mm" height="100mm" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        '<g transform="translate(0,-197)">' +
        '<path d="m39.873 198.21v38.668h-38.668v20.252h38.668v38.668h20.253v-38.668h38.668v-20.252h-38.668v-38.668z" style="fill-rule:evenodd;stroke-linejoin:round;stroke-width:2.4109;" />' +
        '</g>' +
        '</svg>'
    );
};

function SubIcon() {
    return Svg.ShareInstance.buildSvg(
        '<svg class="sub-icon" width="100mm" height="100mm" version="1.1" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
        ' <g transform="translate(0,-197)">' +
        '  <path d="m98.795 236.87v20.253h-97.589v-20.253z" style="fill-rule:evenodd;stroke-linejoin:round;stroke-width:2.411;"/>' +
        ' </g>' +
        '</svg>'
    );
};

privateDom.install({
    subicon: SubIcon,
    addicon: AddIcon,
    item: Item
});

SelectTable.privateDom = privateDom;


Acore.creator.selecttable = SelectTable;

export default SelectTable;