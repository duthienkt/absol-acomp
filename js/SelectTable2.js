import Acore from "../ACore";
import Dom from "absol/src/HTML5/Dom";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import { phraseMatch } from "absol/src/String/stringMatching";
import { nonAccentVietnamese } from "absol/src/String/stringFormat";
import Svg from "absol/src/HTML5/Svg";
import OOP from "absol/src/HTML5/OOP";
import SelectTable from "./SelectTable";


var privateDom = new Dom().install(Acore).install(SelectTable.privateDom);
var $ = privateDom.$;
var _ = privateDom._;


function SelectTable2() {
    var res = _({
        class: ['absol-select-table', 'exclude'],
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
                        tag: 'vscroller',
                        attr: { id: 'nonselected' },
                        class: 'absol-select-table-items-scroller',
                        child: {
                            child: ['.absol-select-table-nonselected-items-container', '.absol-select-table-nonselected-search-items-container']
                        }
                    },
                    {
                        tag: 'vscroller',
                        attr: { id: 'selected' },
                        class: 'absol-select-table-items-scroller',
                        child: {
                            child: ['.absol-select-table-selected-items-container', '.absol-select-table-selected-search-items-container']

                        }

                    }
                ]
            }
        ]
    });

    res.sync = res.afterAttached();
    res.eventHandler = OOP.bindFunctions(res, SelectTable2.eventHandler);
    res.$buttonsContainer = $('.absol-select-table-buttons-container', res);
    res.$searchContainer = $('.absol-select-table-searchtextinput-container', res);
    res.$nonselectedItemsContainer = $('.absol-select-table-nonselected-items-container', res);
    res.$selectedItemsContainer = $('.absol-select-table-selected-items-container', res);

    res.$nonselectedSearchItemsContainer = $('.absol-select-table-nonselected-search-items-container', res);
    res.$selectedSearchItemsContainer = $('.absol-select-table-selected-search-items-container', res);

    res.$removeAllBtn = $('button.remove-all', res).on('click', res.eventHandler.removeAllBtnClick);
    res.$addAllBtn = $('button.add-all', res).on('click', res.eventHandler.addAllBtnClick);
    res.$vscrollerSelected = $('vscroller#selected', res)
    res.$vscrollerNonselected = $('vscroller#nonselected', res);
    res.$body = $('.absol-select-table-body', res);
    res.$searchTextInput = $('searchtextinput', res).on('stoptyping', res.eventHandler.searchTextInputModify);
    return res;
};



SelectTable2.prototype.updateButtonsContainerSize = function () {
    var rootBound = this.$buttonsContainer.getBoundingClientRect();
    var containBound = this.$buttonsContainer.getBoundingRecursiveRect();
    var fontSize = this.getFontSize();
    this.$buttonsContainer.addStyle('width', (containBound.width + 1) / fontSize + 'em');
    this.$searchContainer.addStyle('right', (containBound.width + 5) / fontSize + 'em');
};

SelectTable2.prototype.addAll = function () {
    Array.apply(null, this.$nonselectedItemsContainer.childNodes).forEach(function (e) {
        e.addTo(this.$selectedItemsContainer);
    }.bind(this));
    this.requestSort();
};

SelectTable2.prototype.removeAll = function () {
    Array.apply(null, this.$selectedItemsContainer.childNodes).forEach(function (e) {
        e.addTo(this.$nonselectedItemsContainer);
    }.bind(this))
    this.requestSort();
};

SelectTable2.prototype.updateScroller = function () {
    var update = function () {
        if (this.style.height) {
            var bodyMargin = parseFloat(this.$body.getComputedStyleValue('margin-top').replace('px', '') || (0.14285714285 * 14 + ''));
            var bound = this.getBoundingClientRect();
            var bodyBound = this.$body.getBoundingClientRect();
            var bodyRBound = this.$body.getBoundingRecursiveRect();
            var availableHeight = bound.bottom - bodyMargin - bodyBound.top;
            var isOverflowHeight = availableHeight < bodyRBound.height;
            if (isOverflowHeight) {
                this.$vscrollerNonselected.addStyle('max-height', availableHeight + 'px');
                this.$vscrollerSelected.addStyle('max-height', availableHeight + 'px');
                this.$vscrollerSelected.addClass('limited-height');
                this.$vscrollerNonselected.addClass('limited-height');
            }
            else {
                this.$vscrollerNonselected.removeStyle('max-height');
                this.$vscrollerSelected.removeStyle('max-height');
                this.$vscrollerSelected.removeClass('limited-height');
                this.$vscrollerSelected.removeClass('limited-height');
                this.$vscrollerNonselected.removeClass('limited-height');
            }
        }
        requestAnimationFrame(this.$vscrollerNonselected.requestUpdateSize.bind(this.$vscrollerNonselected));
        requestAnimationFrame(this.$vscrollerSelected.requestUpdateSize.bind(this.$vscrollerSelected));
    }.bind(this);
    setTimeout(update, 1);
};

SelectTable2.prototype.getAllItemElement = function () {
    var selectedItemElements = Array.apply(null, this.$selectedItemsContainer.childNodes);
    var nonselectedItemElements = Array.apply(null, this.$nonselectedItemsContainer.childNodes);
    return selectedItemElements.concat(nonselectedItemElements);
};

SelectTable2.prototype.init = function (props) {
    this.super(props);
    this.sync = this.sync.then(this.updateButtonsContainerSize.bind(this));
};

SelectTable2.eventHandler = {};
SelectTable2.eventHandler.addAllBtnClick = function (event) {
    this.addAll();
    if (this.searching) {
        this.eventHandler.searchTextInputModify(event);
    }
    this.emit('addall', EventEmitter.copyEvent(event, {}), this);
    this.updateScroller();
};

SelectTable2.eventHandler.removeAllBtnClick = function (event) {
    this.removeAll();
    if (this.searching) {
        this.eventHandler.searchTextInputModify(event);
    }
    this.emit('removeall', EventEmitter.copyEvent(event, {}), this);
    this.updateScroller();
};

SelectTable2.prototype._filter = function (items, filterText) {
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

SelectTable2.prototype._stringcmp = function (s0, s1) {
    if (s0 == s1) return 0;
    if (s0 > s1) return 1;
    return -1;
};

SelectTable2.prototype._getString = function (item) {
    if (typeof item == "string") return item;
    return item.text;
};

SelectTable2.prototype._equalArr = function (a, b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; ++i) {
        if (a[i] != b[i]) return false;
    }
    return true;
};


SelectTable2.prototype._applySort = function (items, sortFlag) {
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

SelectTable2.prototype.requestSort = function () {
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

SelectTable2.eventHandler.searchTextInputModify = function (event) {
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




SelectTable2.property = {};

SelectTable2.property.disableMoveAll = {
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

SelectTable2.property.removeAllText = {
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

SelectTable2.property.addAllText = {
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

SelectTable2.property.searching = {
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




SelectTable2.property.sorted = {
    set: function (value) {
        this._sort = value;
        this.requestSort();

    },
    get: function () {
        return this._sort;
    }
};

SelectTable2.property.selectedItems = {
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

SelectTable2.property.nonselectedItems = {
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


SelectTable2.property.selectedSearchItems = {
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

SelectTable2.property.nonselectedSearchItems = {
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
        extendEvent: ['requestmove', 'clickadd', 'clickremove', 'clickexclude'],
        class: 'absol-select-table-item',
        child: ['span.absol-select-table-item-text',
            {
                class: 'absol-select-table-item-right-container',
                child: {
                    class: 'absol-select-table-item-right-container-table',
                    child: {
                        class: 'absol-select-table-item-right-container-row',
                        child: [
                            {
                                attr:{
                                    title:'Add'
                                },
                                class: ['absol-select-table-item-right-container-cell', 'add'],
                                child: 'addicon'

                            },
                            {
                                attr:{
                                    title:'Remove'
                                },
                                class: ['absol-select-table-item-right-container-cell', 'remove'],
                                child: 'subicon'

                            },
                            { attr:{
                                title:'Exclude'
                            },
                                class: ['absol-select-table-item-right-container-cell', 'exclude'],
                                child: 'excludeico'
                            },
                        ]
                    }
                }

            }
        ]
    });
    res.$text = $('span', res);
    res.eventHandler = OOP.bindFunctions(res, Item.eventHandler);
    res.$rightBtn = $('.absol-select-table-item-right-container', res);
    res.on('dblclick', res.eventHandler.dblclick);
    res.$addBtn = $('.absol-select-table-item-right-container-cell.add', res).on('click', res.eventHandler.addBtClick);
    res.$removeBtn = $('.absol-select-table-item-right-container-cell.remove', res).on('click', res.eventHandler.removeBtClick);
    res.$excludeBtn = $('.absol-select-table-item-right-container-cell.exclude', res).on('click', res.eventHandler.excludeBtClick);
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

Item.eventHandler.removeBtClick = function (event) {
    this.emit('clickremove', event, this);
};

Item.eventHandler.addBtClick = function (event) {
    this.emit('clickadd', event, this);
};

Item.eventHandler.excludeBtClick = function (event) {
    this.emit('clickexclude', event, this);
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



function ExcludeIco() {
    return _(
        '<svg class="exclude-icon" width="24" height="24" viewBox="0 0 24 24">\
            <path  d="M8.27,3L3,8.27V15.73L8.27,21H15.73C17.5,19.24 21,15.73 21,15.73V8.27L15.73,3M9.1,5H14.9L19,9.1V14.9L14.9,19H9.1L5,14.9V9.1M11,15H13V17H11V15M11,7H13V13H11V7" />\
        </svg>');
}


privateDom.install({
    item: Item,
    excludeico: ExcludeIco
});



Acore.install('selecttable2', SelectTable2);