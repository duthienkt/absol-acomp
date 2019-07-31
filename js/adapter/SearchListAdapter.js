function SearchListAdapter() {
    this.searchList = null;
}

SearchListAdapter.prototype.onAttach = function (searchList) {
    this.searchList = searchList;
};

SearchListAdapter.prototype.getItemText = function (item, index) {
    return item.text;
};
SearchListAdapter.prototype.getItemValue = function (item, index) {
    return item.value;
};
SearchListAdapter.prototype.getItemIcon = function (item, index) {
    return item.icon;
};


SearchListAdapter.prototype.getItemView = function (item, index, _, $, query, reuseItem, refParent) {
    var list = [];
    var isFirst = false;
    var marginLeft = "";
    for (var i in item) {
        marginLeft = ""
        if (isFirst)
            marginLeft = "10px"
        isFirst = true;
        if (i === "icon") {
            list.push({
                tag: 'i',
                class: 'material-icons',
                style: {
                    verticalAlign: "middle",
                    marginLeft: marginLeft,
                },
                props: {
                    innerHTML: this.getItemIcon(item)
                }
            })
        }
        else
            if (i === "text") {
                list.push({
                    tag: 'span',
                    style: {
                        verticalAlign: "middle",
                        marginLeft: marginLeft,
                    },
                    props: {
                        innerHTML: this.getItemText(item)
                    }
                });
            }
            else
                if (i === "value") {

                }
    }
    if (reuseItem) {
        return reuseItem.clearChild().addChild(
            _({
                tag: 'div',
                child: list
            })
        );
    }
    else {
        return _({
            tag: 'div',
            child: list
        })
    }
};

SearchListAdapter.prototype.queryItems = function (self, query, mInput) {
    var query = query.toLowerCase();
    return self.items.map(function (item) {
        var start = item.text.toLowerCase().indexOf(query);
        if (start >= 0) {
            var hightlightedText = item.text.substr(0, start) + '<strong style="color:red">' + item.text.substr(start, query.length) + '</strong>' + item.text.substr(start + query.length);
            return {
                item: item,
                hightlightedText: hightlightedText
            }
        }
        else return null;
    }).filter(function (it) { return it !== null; })
};


export default SearchListAdapter;