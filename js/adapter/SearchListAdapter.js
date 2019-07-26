function SearchListAdapter() {
    this.searchList = null;
}

SearchListAdapter.prototype.onAttach = function (searchList) {
    this.searchList = searchList;
};

SearchListAdapter.prototype.getItemText = function (item, index) {
    return item;
};
SearchListAdapter.prototype.getItemValue = function (item, index) {
    return item;
};


SearchListAdapter.prototype.getItemView = function (item, index, _, $, query, reuseItem, refParent) {
    if (reuseItem) {
        return reuseItem.clearChild().addChild(_({ text: this.getItemText(item) }));
    }
    else {
        return _({ child: { text: this.getItemText(item) } });
    }
};

SearchListAdapter.prototype.queryItems = function (items, query) {

};  


export default SearchListAdapter;