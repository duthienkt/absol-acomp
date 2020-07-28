import '../css/autocompleteinput.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import Dom from "absol/src/HTML5/Dom";
import SearchStringArrayAdapter from "./adapter/SearchStringArrayAdapter";
import SearchObjectArrayAdapter from "./adapter/SearchObjectArrayAdapter";
import EventEmitter from 'absol/src/HTML5/EventEmitter';


var _ = ACore._;
var $ = ACore.$;

function AutoCompleteInput() {
    this.$input = $('input', this)
        .on('keyup', this.eventHandler.keyup)
        .on('keydown', this.eventHandler.keydown)
        .on('focus', this.eventHandler.focus)
        .on('blur', this.eventHandler.blur);


    this.$dropdown = $('.absol-autocomplete-input-dropdown', this);
    this.$vscroller = $('bscroller', this).on('click', this.eventHandler.vscrollerClick);
    this.$poolItems = [];
    this._currentData = [];
    this._sessionIndex = 0;
    this._updatedSession = -1;
    this._cache = {};
    OOP.drillProperty(this, this.$input, 'value');

    return this;
}

AutoCompleteInput.tag = 'AutoCompleteInput';

AutoCompleteInput.render = function () {
    return _({
        extendEvent: 'change',
        class: 'absol-autocomplete-input',
        child: [
            'input[type="text"].absol-autocomplete-input-text',
            {
                class: 'absol-autocomplete-input-dropdown',
                style: {
                    display: 'none'
                },
                child: {
                    tag: 'bscroller',
                    style: {
                        'max-height': '500px'
                    }
                }
            }
        ]
    });
};


AutoCompleteInput.eventHandler = {};
AutoCompleteInput.eventHandler.keyup = function (event) {
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


AutoCompleteInput.eventHandler.blur = function () {
    this.removeClass('focus');
};

AutoCompleteInput.eventHandler.focus = function () {
    this.addClass('focus');
    $(document.body).on('mousedown', this.eventHandler.clickOut);

    //todo
}

AutoCompleteInput.eventHandler.clickOut = function (event) {
    if (EventEmitter.hitElement(this, event)) return;
    $(document.body).off('mousedown', this.eventHandler.clickOut);
    var text = this.$input.value;

    if (this._lastValue != text) {
        this._lastValue = text;
        this.$dropdown.addStyle('display', 'none');
        this._lastValue = text;
        this.emit('change', { target: this, value: text }, this);
    }

}


AutoCompleteInput.eventHandler.vscrollerClick = function (event) {
    var current = event.target;
    while (current && !current.containsClass('absol-autocomplete-input-item') && current != this.$vscroller) {
        current = current.parentElement;
    }

    if (current && current._holderItem) {
        var text = this.getItemText(current._holderItem);
        this.$input.value = text;
        this._lastQuery = text;
        this._selectedIndex = current._holderIndex;
        this.$dropdown.addStyle('display', 'none');
        this._lastValue = text;
        this.emit('change', { target: this, value: text }, this);
    }
};

AutoCompleteInput.eventHandler.keydown = function (event) {
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

AutoCompleteInput.prototype.focus = function () {
    if (this.disabled) return;
    this.$input.focus.apply(this.$input, arguments);

};

AutoCompleteInput.prototype.blur = function () {
    this.$input.blur.apply(this.$input, arguments);

};

AutoCompleteInput.prototype.select = function () {
    this.$input.select.apply(this.$input, arguments);
}

AutoCompleteInput.prototype.find = function () {
    var query = this.$input.value;
    if (query == this._lastQuery) return;
    this._lastQuery = query;
    var currentSession = ++this._sessionIndex;
    if (!query) {
        this.pushData([], currentSession, query)
        return;
    }
    if (this.disableCache) {
        var onReciveData = function (data) {
            cacheHolder.data = data;
            this.pushData(data, currentSession, query);//sessionIndex may be change
        }.bind(this);
        var result = this.queryItems(query);
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
            var result = this.queryItems(query);
            if (typeof result.then == 'function')
                result.then(onReciveData);
            else onReciveData(result)

            this._cache[query] = cacheHolder;
        }
    }
};

AutoCompleteInput.prototype.pushData = function (data, sessionIndex, query) {
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
                    var newView = this.getItemView(item, i, _, $, query, reuseItem, this);
                    newView.addClass('absol-autocomplete-input-item');
                    newView._holderItem = item;
                    newView._holderIndex = i;
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


AutoCompleteInput.prototype.getItemText = function (item) {
    if (this.adapter && this.adapter.getItemText) {
        return this.adapter.getItemText(item, this);
    }
    else if (typeof item == 'string') {
        return item;
    }
    else {
        throw Error('You need adapter.getItemText(item, mAutoCompleteInput) to handle your item text!');
    }

}

AutoCompleteInput.prototype.getItemView = function (item, index, _, $, query, reuseItem, refParent) {
    if (this.adapter && this.adapter.getItemView) {
        return this.adapter.getItemView(item, index, _, $, query, reuseItem, refParent, this);
    }
    else {
        var text = this.getItemText(item);
        if (reuseItem) {
            reuseItem.childNodes[0].innerHTML = text;
            return reuseItem;
        }

        return _({
            child: {
                tag: 'span',
                class: 'absol-autocomplete-input-item-text',
                child: { text: text }
            }
        });
    }
};


/**
 * @param {String} query
 * @returns {Array}
 */
AutoCompleteInput.prototype.queryItems = function (query) {
    if (this.adapter && this.adapter.queryItems) {
        return this.adapter.queryItems(query, this);
    }
    else {
        throw new Error('Invalid adapter: queryItems(query, mAutoCompleteInput) not found!');
    }
};


AutoCompleteInput.prototype.clearCache = function (old) {
    if (typeof old != "number") old = 30;
    for (var key in this._cache) {
        var cacheHolder = this._cache[key];
        if (this._sessionIndex - cacheHolder.sessionIndex > old) {
            delete this._cache[key];
        }
    }
}

AutoCompleteInput.property = {};
AutoCompleteInput.property.adapter = {
    set: function (value) {
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
            this._adapter = value;
        }
        if (this.adapter && this.adapter.onAttached) {
            this.adapter.onAttached(this);
        }
    },
    get: function () {
        return this._adapter;
    }
};

AutoCompleteInput.property.disabled = {
    set: function (value) {
        if (value) {
            this.addClass('absol-disabled');
        }
        else {
            this.removeClass('absol-disabled');
        }
    },
    get: function () {
        return this.containsClass('absol-disabled');
    }
};

AutoCompleteInput.attribute = {};
AutoCompleteInput.attribute.disabled = {
    set: function (value) {
        if (value === true || value === 'true' || value === null) {
            this.disabled = true;
        }
        else {
            this.disabled = false;
        }
    },
    get: function () {
        return this.disabled ? 'true' : 'false'
    },
    remove: function () {
        this.disabled = false;
    }
};


ACore.install('AutoCompleteInput'.toLowerCase(), AutoCompleteInput);


export default AutoCompleteInput;