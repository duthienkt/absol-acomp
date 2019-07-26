import Acore from "../ACore";
import SearchListAdapter from "./adapter/SearchListAdapter";
import OOP from "absol/src/HTML5/OOP";

var _ = Acore._;
var $ = Acore.$;

function SearchList() {
    var res = _({
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
                child: Array(300).fill('<div class="absol-search-list-item default">This line</div>')
            }
        ]
    });
    res._pool = [];
    res.eventHandler = OOP.bindFunctions(res, SearchList.eventHandler);
    res.$contents = $('.absol-search-list-contents', res).on('click', res.eventHandler.clickContent);
    res.$input = $('.absol-search-list-search-input-container input[type="text"]', res)
        .on('keydown', res.eventHandler.keydownInput);
    return res;
}


SearchList.eventHandler = {};

SearchList.eventHandler.clickContent = function (event) {
    var item = this._findItem(event.target);
    if (item) {
        this._value = this.adapter.getItemValue(item.__data__);
        this.updateSelectedItem();
    }
    else {

    }
};

SearchList.eventHandler.keydownInput = function (event) {
    var key = event.key;

    console.log(key);

};

SearchList.adapter = {
    DEFAULT: SearchListAdapter
}

SearchList.property = {};
SearchList.property.adapter = {
    set: function (value) {
        if (typeof value == 'string') {
            if (value in SearchList.adapter) {
                this._adapter = new SearchList.adapter[value]();
            }
            else {
                throw new Error("Unknown build-in adapter name")
            }
        } else {
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
        if (elt == this) return;
        if (elt.containsClass && elt.containsClass('absol-search-list-item')) {
            return elt;
        }
        else {
            elt = elt.parentNode;
        }
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
        var itemView = self.adapter.getItemView(item, index, _, $, query, reusedItem, self.$contents);
        var valueKey = JSON.stringify(self.adapter.getItemValue(item))
        self.itemEltsDict[valueKey] = itemView;
        self.itemEltArr.push(itemView);
        $(itemView).addClass('absol-search-list-item');
        itemView.__data__ = item;// item wil hold  the data of itself
        itemView.__index__ = index;// item wil hold  the data of itself

        self.$contents.addChild(itemView);
        if (itemView == reusedItem) reusedItem = undefined;
    });
};

SearchList.prototype.updateSelectedItem = function () {
    var key = JSON.stringify(this._value);
    if (this.activeItemElt) {
        this.activeItemElt.removeClass('active');
    }

    this.activeItemElt = this.itemEltsDict[key];
    console.log(key);

    if (this.activeItemElt) {
        this.activeItemElt.addClass('active');
    }
};

SearchList.prototype.getPrevItem = function () {
    var index = this.activeItemElt ? this.__index__ : 0;
};


SearchList.prototype.removeAllToPool = function () {
    while (this.$contents.childNodes.length > 0) {
        this._pool.push(this.$contents.childNodes[0]);
        this.$contents.childNodes[0].remove();
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
        this.adapter.onAttach(this);
    }
};

Acore.install('SearchList'.toLowerCase(), SearchList);
export default SearchList;