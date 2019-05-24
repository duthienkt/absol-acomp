import Acore from "../ACore";
import OOP from "../../HTML5/OOP";
import Dom from "../../HTML5/Dom";


var _ = Acore._;
var $ = Acore.$;

function AutoComplateInput() {
    var res = _({
        extendEvent:'change',
        class: 'absol-autocomplete-input',
        child: [
            'input[type="text"]',
            {
                class: 'absol-autocomplete-input-dropdown',
                style: {
                    display: 'none'
                },
                child: {
                    tag: 'vscroller',
                    class: 'limited-height',
                    style: {
                        'max-height': '500px'
                    }
                }
            }
        ]
    });

    res.eventHandler = OOP.bindFunctions(res, AutoComplateInput.eventHandler);

    res.$input = $('input', res)
        .on('keyup', res.eventHandler.keyup)
        .on('keydown', res.eventHandler.keydown);


    res.$dropdown = $('.absol-autocomplete-input-dropdown', res);
    res.$vscroller = $('vscroller', res).on('click', res.eventHandler.vscrollerClick);
    res.$poolItems = [];
    res._currentData = [];
    res._sessionIndex = 0;
    res._updatedSession = -1;
    res._cache = {};
    OOP.drillProperty(res, res.$input, 'value');

    return res;
}


AutoComplateInput.eventHandler = {};
AutoComplateInput.eventHandler.keyup = function (event) {
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

// absol-autocomplete-input-item

AutoComplateInput.eventHandler.vscrollerClick = function (event) {
    var current = event.target;
    while (current && !current.containsClass('absol-autocomplete-input-item') && current != this.$vscroller) {
        current = current.parentElement;
    }

    if (current && current._holderItem) {
        var text = this.getItemText(current._holderItem);
        this.$input.value = text;
        this._lastQuery = text;
        this.$dropdown.addStyle('display', 'none');
        this.emit('change', { target: this, value: text }, this);
    }
};

AutoComplateInput.eventHandler.keydown = function (event) {
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
        this.emit('change', { target: this, value: text }, this);
    }
};

AutoComplateInput.prototype.find = function () {
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

AutoComplateInput.prototype.pushData = function (data, sessionIndex, query) {
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


AutoComplateInput.prototype.getItemText = function (item) {
    if (this.adapter && this.adapter.getItemText) {
        return this.adapter.getItemText(item, this);
    }
    else if (typeof item == 'string') {
        return item;
    } else {
        throw Error('You need adapter.getItemText(item, mAutoCompleteInput) to handle your item text!');
    }

}

AutoComplateInput.prototype.getItemView = function (item, index, _, $, query, reuseItem, refParent) {
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
                child: { text: text }
            }
        });
    }
};



/**
 * @param {String} query
 * @returns {Array}
 */
AutoComplateInput.prototype.queryItems = function (query) {
    if (this.adapter && this.adapter.queryItems) {
        return this.adapter.queryItems(query, this);
    }
    else {
        throw new Error('Invalid adapter: queryItems(query, mAutoCompleteInput) not found!');
    }
};


AutoComplateInput.prototype.clearCache = function (old) {
    if (typeof old != "number") old = 30;
    for (var key in this._cache) {
        var cacheHolder = this._cache[key];
        if (this._sessionIndex - cacheHolder.sessionIndex > old) {
            delete this._cache[key];
        }
    }
}


Acore.creator.autocompleteinput = AutoComplateInput;
