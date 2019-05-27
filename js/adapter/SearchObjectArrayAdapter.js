/**
 * @typedef {Object} SearchObjectArrayAdapter
 * @property {function} getItemText
 * 
 * 
 * 
 * @param {Array<Object>} arr 
 * @param {SearchArrayAdapterOption} options
 */
function SearchObjectArrayAdapter(objects, options) {
    if (!this.queryItems) return new SearchObjectArrayAdapter(texts, options);
    this.objects = objects;
    this.options = options;
}

SearchObjectArrayAdapter.prototype.queryItems = function (query, mInput) {
    var query = query.toLocaleLowerCase();
    return this.objects.map(function (object) {
        var text = this.getItemText(object);
        var start = text.toLocaleLowerCase().indexOf(query);
        if (start >= 0) {
            var hightlightedText = text.substr(0, start) + '<strong style="color:red">' + text.substr(start, query.length) + '</strong>' + text.substr(start + query.length);
            return {
                text: text,
                object:object,
                hightlightedText: hightlightedText
            }
        }
        else return null;
    }.bind(this)).filter(function (it) { return it !== null; })
};


SearchObjectArrayAdapter.prototype.onAttached = function (parent) {
    this.parent = parent;
    parent.getSelectedObject = function () {
        if (this._selectedIndex >= 0) {
            return this.$poolItems[this._selectedIndex]._holderItem.object;
        }
        else {
            return null;
        }
    }
};

SearchObjectArrayAdapter.prototype.getItemText = function (item, mInput) {
    if (this.options && this.options.getItemText)
        return this.options.getItemText.call(this, item, mInput);
    else if (typeof item.text == 'string') {
        return item.text;
    }
    else
        return item.toString();
};

SearchObjectArrayAdapter.prototype.getItemView = function (item, index, _, $, query, reuseItem, refParent, mInput) {
    if (reuseItem) {
        reuseItem.childNodes[0].innerHTML = item.hightlightedText;
        return reuseItem;
    }
    else
        return _({
            tag: 'div',
            child: {
                tag: 'span',
                props: {
                    innerHTML: item.hightlightedText
                }
            }
        })
}

export default SearchObjectArrayAdapter;