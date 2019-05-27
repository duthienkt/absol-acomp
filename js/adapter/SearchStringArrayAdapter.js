/**
 * @typedef {Object} SearchArrayAdapterOption
 * @property {function} searchFuntion
 * 
 * 
 * 
 * @param {Array<String>} arr 
 * @param {SearchArrayAdapterOption} options not implement yet
 */
function SearchStringArrayAdapter(texts, options) {
    if (!this.queryItems) return new SearchStringArrayAdapter(texts, options);
    
    this.texts = texts;
}

SearchStringArrayAdapter.prototype.queryItems = function (query, mInput) {
    var query = query.toLocaleLowerCase();
    return this.texts.map(function (text) {
        var start = text.toLocaleLowerCase().indexOf(query);
        if (start >= 0) {
            var hightlightedText = text.substr(0, start) + '<strong style="color:red">' + text.substr(start, query.length) + '</strong>' + text.substr(start + query.length);
            return {
                text: text,
                hightlightedText: hightlightedText
            }
        }
        else return null;
    }).filter(function (it) { return it !== null; })
};


SearchStringArrayAdapter.onAttached = function(parent){
    this.parent = parent;
};

SearchStringArrayAdapter.prototype.getItemText = function (item, mInput) {
    return item.text;
};

SearchStringArrayAdapter.prototype.getItemView = function (item, index, _, $, query, reuseItem, refParent, mInput) {
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

export default SearchStringArrayAdapter;