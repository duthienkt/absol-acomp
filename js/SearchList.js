import '../css/searchlist.css';
import ACore from "../ACore";
import SearchListAdapter from "./adapter/SearchListAdapter";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

function SearchList() {
    this._pool = [];
    this.$dropdown = $('.absol-search-list-contents', this).on('click', this.eventHandler.clickContent);
    this.$dropdown.addStyle('display', 'none');
    this.$vscroller = $('bscroller', this).on('click', this.eventHandler.vscrollerClick);
    this.$input = $('.absol-search-list-search-input-container input[type="text"]', this)
        .on('keydown', this.eventHandler.keydown)
        .on('keyup', this.eventHandler.keyup);
    this._cache = {};
    this.$poolItems = [];
    this._currentData = [];
    this._sessionIndex = 0;
    this._updatedSession = -1;
    return this;
}

SearchList.tag = 'SearchList'.toLowerCase();

SearchList.render = function (){
  return   _({
      class: 'absol-search-list',
      style: {
          // height:'300px',
      },
      child: [
          {
              class: 'absol-search-list-search-input-container',
              child: 'input[type="text"]'
          },
          {
              tag: 'bscroller',
              class: 'absol-search-list-contents',
          }
      ]
  });
};

SearchList.eventHandler = {};

SearchList.eventHandler.clickContent = function (event) {
    var item = this._findItem(event.target);
    if (item) {
        this._value = this.adapter.getItemValue(item.__data__.item);
        this.$input.value = item.__data__.item.text;
        this.updateSelectedItem();
        this.$dropdown.addStyle('display', 'none');
    }
    else {

    }
};

SearchList.eventHandler.keydown = function (event) {
    var key = event.key;
    if (key == 'ArrowDown') {
        if (this._selectedIndex + 1 < this._currentData.length) {
            if (this.$poolItems[this._selectedIndex]) {
                this.$poolItems[this._selectedIndex].removeClass('active');
            }
            this._selectedIndex += 1;
            if (this.$poolItems[this._selectedIndex]) {
                this.$poolItems[this._selectedIndex].addClass('active');
                this.$vscroller.scrollInto(this.$poolItems[this._selectedIndex]);
            }

        }
        event.preventDefault();
    }
    else if (key == 'ArrowUp') {
        if (this._selectedIndex - 1 >= 0) {
            if (this.$poolItems[this._selectedIndex]) {
                this.$poolItems[this._selectedIndex].removeClass('active');
            }
            this._selectedIndex -= 1;
            if (this.$poolItems[this._selectedIndex]) {
                this.$poolItems[this._selectedIndex].addClass('active');
                this.$vscroller.scrollInto(this.$poolItems[this._selectedIndex]);
            }

        }
        event.preventDefault();
    }
    else if (key == 'Enter') {
        var text;
        if (this._currentData[this._selectedIndex] === undefined) {
            text = this.$input.value;
        }
        else {
            text = this.getItemText(this._currentData[this._selectedIndex]);
            this.$input.value = text;
        }
        this._lastQuery = text;
        this.$dropdown.addStyle('display', 'none');
        this._lastValue = text;
        this.emit('change', { target: this, value: text }, this);
    }

};

SearchList.eventHandler.keydown = function (event) {
    var key = event.key;
    if (key == 'ArrowDown') {
        if (this._selectedIndex + 1 < this._currentData.length) {
            if (this.$poolItems[this._selectedIndex]) {
                this.$poolItems[this._selectedIndex].removeClass('active');
            }
            this._selectedIndex += 1;
            if (this.$poolItems[this._selectedIndex]) {
                this.$poolItems[this._selectedIndex].addClass('active');
                this.$vscroller.scrollInto(this.$poolItems[this._selectedIndex]);
            }

        }
        event.preventDefault();
    }
    else if (key == 'ArrowUp') {
        if (this._selectedIndex - 1 >= 0) {
            if (this.$poolItems[this._selectedIndex]) {
                this.$poolItems[this._selectedIndex].removeClass('active');
            }
            this._selectedIndex -= 1;
            if (this.$poolItems[this._selectedIndex]) {
                this.$poolItems[this._selectedIndex].addClass('active');
                this.$vscroller.scrollInto(this.$poolItems[this._selectedIndex]);
            }

        }
        event.preventDefault();
    }
    else if (key == 'Enter') {
        var text;
        if (this._currentData[this._selectedIndex] === undefined) {
            text = this.$input.value;
        }
        else {
            text = this.getItemText(this._currentData[this._selectedIndex]);
            this.$input.value = text;
        }
        this._lastQuery = text;
        this.$dropdown.addStyle('display', 'none');
        this._lastValue = text;
        this.emit('change', { target: this, value: text }, this);
    }

};

SearchList.prototype.clearCache = function (old) {
    if (typeof old != "number") old = 30;
    for (var key in this._cache) {
        var cacheHolder = this._cache[key];
        if (this._sessionIndex - cacheHolder.sessionIndex > old) {
            delete this._cache[key];
        }
    }
}

SearchList.eventHandler.keyup = function (event) {
    if (this._keyTimeout) {
        clearTimeout(this._keyTimeout);
        this._keyTimeout = 0;
    }

    var cTimeout = setTimeout(function () {
        clearTimeout(cTimeout);
        this.find();
    }.bind(this), 300);


    if (this._cacheTimeout) {
        clearTimeout(this._cacheTimeout);
        this._cacheTimeout = 0;
    }

    var cacheTimeout = setTimeout(function () {
        clearTimeout(cacheTimeout);
        this.clearCache();
    }.bind(this), 300);

    this._cacheTimeout = cacheTimeout;
    this._keyTimeout = cTimeout;
};

SearchList.prototype.find = function () {
    var query = this.$input.value;
    if (query == this._lastQuery) return;
    this._lastQuery = query;
    var currentSession = ++this._sessionIndex;
    if (!query) {
        this.pushData([], currentSession, query)
        return;
    }
    var result;
    if (this.disableCache) {
        var onReciveData = function (data) {
            cacheHolder.data = data;
            this.pushData(data, currentSession, query);//sessionIndex may be change
        }.bind(this);
        result = this.adapter.queryItems(this, query);
        if (typeof result.then == 'function')
            result.then(onReciveData);
        else onReciveData(result)
    }
    else {
        if (this._cache[query]) {
            this._cache[query].sessionIndex = currentSession;
            if (!this._cache[query].pending) {
                var data = this._cache[query].data;
                this.pushData(data, currentSession);
            }
        }
        else {
            var cacheHolder = { pending: true, sessionIndex: currentSession };
            var onReciveData = function (data) {
                cacheHolder.data = data;
                cacheHolder.pending = false;
                this.pushData(data, cacheHolder.sessionIndex, query);//sessionIndex may be change
            }.bind(this);
            result = this.adapter.queryItems(this, query);
            if (typeof result.then == 'function')
                result.then(onReciveData);
            else onReciveData(result)

            this._cache[query] = cacheHolder;
        }
    }
};

SearchList.prototype.pushData = function (data, sessionIndex, query) {
    if (sessionIndex > this._updatedSession) {
        this._updatedSession = sessionIndex;
        this.$vscroller.clearChild();
        this._currentData = data;
        if (data && data.length > 0) {
            this.$dropdown.removeStyle('display');
        }
        else {
            this.$dropdown.addStyle('display', 'none');
        }

        var maxHeight = this.getComputedStyleValue('max-height');
        if (maxHeight == 'none' || !maxHeight) {
            maxHeight = 10000;
        }
        else {
            maxHeight = parseFloat(maxHeight.replace('px', ''));
        }

        var outBound = Dom.traceOutBoundingClientRect(this);
        var bound = this.$input.getBoundingClientRect();
        var aTop = bound.top - outBound.top;
        var aBotom = outBound.bottom - bound.bottom;
        this.$dropdown.removeClass('top');
        if (aTop > aBotom) {
            maxHeight = Math.min(maxHeight, aTop - 10);
        }
        else {
            maxHeight = Math.min(maxHeight, aBotom - 10);
        }

        this.$vscroller.addStyle('max-height', maxHeight + 'px');
        this._selectedIndex = -1;
        data.reduce(function (sync, item, i, arr) {
            return sync.then(function () {
                if (this._updatedSession != sessionIndex) return;
                return new Promise(function (rs) {
                    if (this._updatedSession != sessionIndex) return;
                    var reuseItem = this.$poolItems.length > i ? this.$poolItems[i] : undefined;
                    if (reuseItem) {
                        reuseItem.removeClass('active');
                    }
                    var newView = this.adapter.getItemView(item.item, i, _, $, query, reuseItem, this);
                    newView.addClass('absol-search-list-item');
                    newView.__data__ = item;
                    newView.__index__ = i;
                    if (i == this._selectedIndex)
                        newView.addClass('active');
                    if (this.$poolItems.length <= i) {
                        this.$poolItems.push(newView);
                    }
                    else {
                        this.$poolItems[i] = newView;
                    }
                    this.$vscroller.addChild(newView);
                    if (i == 0) {
                        var estimateHeight = newView.getBoundingClientRect().height * arr.length;
                        if (aTop > aBotom && estimateHeight > aBotom) {
                            this.$dropdown.addClass('top');
                        }
                    }
                    if (i >= 50 && i % 50 == 0)
                        setTimeout(rs, 0);
                    else rs();
                }.bind(this));
            }.bind(this))
        }.bind(this), Promise.resolve());
    }
};

SearchList.adapter = {
    DEFAULT: SearchListAdapter
}

SearchList.property = {};
SearchList.property.adapter = {
    set: function (value) {
        if (typeof value == 'string' || typeof value == 'number') {
            if (value in SearchList.adapter) {
                this._adapter = new SearchList.adapter[value]();
            }
            else {
                throw new Error("Unknown build-in adapter name")
            }
        }
        else
            if (typeof value == 'object') {
                if (value instanceof Array) {
                    if (value[0] == 'SearchStringArray') {
                        this._adapter = new SearchStringArrayAdapter(value[1], value[2]);
                    }
                    else if (value[0] == 'SearchObjectArray') {
                        this._adapter = new SearchObjectArrayAdapter(value[1], value[2]);
                    }
                    else {
                        throw new Error("Unknown adapter type name");
                    }
                }
                else {
                    this._adapter = Object.assign(new SearchListAdapter(), value)
                }
                if (this.adapter && this.adapter.onAttached) {
                    this.adapter.onAttached(this);
                }
            }
            else {
                if (value) {
                    if ((value.queryItems && value.getItemView && value.getItemText) || (value.extend && (value.extend in SearchList.adapter))) {
                        if (value.extend && (value.extend in SearchList.adapter)) {
                            this.adapter = Object.assign(new SearchList.adapter[value.extend](), value)
                        }
                        else {
                            this._adapter = value;
                        }
                    }
                    else {
                        throw new Error("Invalid adapter");
                    }
                }
                else {
                    this._adapter = new SearchList.adapter.DEFAULT();
                }
            }
    },
    get: function () {
        return this._adapter;
    }
};

SearchList.property.items = {
    set: function (value) {
        this._items = value;
        if (this._verifyParams()) {
            this.updateItems();
        }
    },
    get: function () {
        return this._items;
    }
};

SearchList.prototype._findItem = function (elt) {
    while (elt) {
        if (elt.hasClass && elt.hasClass('absol-search-list-item')) {
            return elt;
        }
        else {
            elt = elt.parentNode;
        }
        if (elt === this) return;
    }
    return undefined;
};

SearchList.prototype.updateItems = function () {
    this.removeAllToPool();
    var self = this;
    var reusedItem;
    var query = '';
    this.itemEltsDict = {};
    this.itemEltArr = [];
    this.items.forEach(function (item, index) {
        if (!reusedItem) reusedItem = self.getOneFromPool();
        var itemView = self.adapter.getItemView(item, index, _, $, query, reusedItem, self.$dropdown);
        var valueKey = JSON.stringify(self.adapter.getItemValue(item))
        self.itemEltsDict[valueKey] = itemView;
        self.itemEltArr.push(itemView);
        $(itemView).addClass('absol-search-list-item');
        itemView.__data__ = item;// item wil hold  the data of itself
        itemView.__index__ = index;// item wil hold  the data of itself

        self.$dropdown.addChild(itemView);
        if (itemView === reusedItem) reusedItem = undefined;
    });
};

SearchList.prototype.updateSelectedItem = function () {
    var key = JSON.stringify(this._value);
    if (this.activeItemElt) {
        this.activeItemElt.removeClass('active');
    }

    this.activeItemElt = this.itemEltsDict[key];

    if (this.activeItemElt) {
        this.activeItemElt.addClass('active');
    }
};

SearchList.prototype.getPrevItem = function () {
    var index = this.activeItemElt ? this.__index__ : 0;
};


SearchList.prototype.removeAllToPool = function () {
    while (this.$dropdown.childNodes.length > 0) {
        this._pool.push(this.$dropdown.childNodes[0]);
        this.$dropdown.childNodes[0].remove();
    }
};

SearchList.prototype.getOneFromPool = function () {
    if (this._pool.length > 0) {
        return this._pool.pop();
    }
    else return undefined;
};


SearchList.prototype.clearPool = function () {
    this._pool = [];
};

SearchList.prototype._verifyParams = function () {
    if (this.items && this.adapter) return true;
    return false;
};

SearchList.prototype.init = function (props) {
    this.ready = false;
    var myProps = Object.assign({}, props || {});
    if ('adapter' in myProps) {
        //todo: 
        this.adapter = myProps.adapter;
        delete myProps.adapter;
    }
    else {
        this.adapter = 'DEFAULT';
    }

    if ('items' in myProps) {
        this.items = myProps.items;
        delete myProps.items
    }
    else {

    }

    Object.assign(this, myProps);
    if (this.adapter) {
        this.ready = true;
        //this.adapter.onAttach(this);
    }
};

ACore.install('SearchList'.toLowerCase(), SearchList);
export default SearchList;