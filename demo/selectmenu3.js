//có thể lấy ra creator bằng cách require

var SelectMenu = absol.require('selectmenu');

function CustomSelectorMenu() {
    SelectMenu.call(this);
}

Object.assign(CustomSelectorMenu, SelectMenu);
CustomSelectorMenu.tag = 'CustomSelectorMenu'.toLowerCase();

//sao chép hàm, thuộc tính, các hàm xử lí sự kiện
Object.assign(CustomSelectorMenu.prototype, SelectMenu.prototype);
CustomSelectorMenu.eventHandler = Object.assign({}, SelectMenu.eventHandler);
CustomSelectorMenu.property = Object.assign({}, SelectMenu.property);

// hàm search tùy chỉnh
CustomSelectorMenu.eventHandler.searchModify = function (event) {
    var filterText = this.$searchTextInput.value.replace(/((\&nbsp)|(\s))+/g, ' ').trim();
    if (filterText.length == 0) {
        this._resourceReady = true;
        this.$selectlist.items = this.items;
        this.scrollToSelectedItem();
        this.$selectlist.removeClass('as-searching');
    }
    else {
        this.$selectlist.addClass('as-searching');
        var view = [];
        if (!this._searchCache[filterText]) {
            // thêm 1 số tường phụ cho item nếu chưa thêm, kiểm tra bằng trường __nvnText__
            // trường này không có trong item mà mới thêm trong hàm prepareSearchForList,
            // hàm prepareSearchForList này tự viết
            if (this._items.length > 0 && !this._items[0]["trường gì đó chuẩn bị trước"]) {
                prepareSearchForCustomList(this._items);
            }
            // tìm và trả ra danh sách các item theo filterText, hàm searchListByText tự viết
            view = searchCustomListByText(filterText, this._items);
            this._searchCache[filterText] = view;
        }
        else {
            view = this._searchCache[filterText];
        }
        this.$selectlist.items = view;
        this._resourceReady = true;
        this.$vscroller.scrollTop = 0;
    }

    this.selectListBound = this.$selectlist.getBoundingClientRect();
    this.updateDropdownPostion(true);
};

function prepareSearchForCustomList(list) {
    list.forEach(function (item) {
        // thêm 1 số trường nào đó vào item để trong lúc search không phải tính lại
        item["trường gì đó chuẩn bị trước"] = "Tự tính lấy nha";
    });
}

function searchCustomListByText(query, list) {
    // tìm đơn giản, tự hiện thực trong này
    return list.filter(function (item) {
        return item.text.indexOf(query) >= 0;
    });
}


absol.coreDom.install(CustomSelectorMenu);

/*******  demo chạy thử ****************/

var rItems = Array(310).fill(0).map(function (u, i) {
    return {
        text: "item số " + i,
        value: i,
        // trường gì cũng được, tự định nghĩa
        itemTag: "đây là item số" + i
    }
});

console.log(rItems);
absol._({
    tag: 'customselectormenu',
    props: {
        items: rItems,
        value: 30,
        enableSearch: true
    }
}).addTo(document.body);


