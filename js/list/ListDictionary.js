
/***
 *
 * @param {Array<SelectionItem>} arr
 * @constructor
 */
function ItemDictionary(arr) {
    this.arr = arr;
    this.dict = {};
    this.dupKeys = [];
}

ItemDictionary.prototype.update = function () {
    var dict = {};
    var item;
    var arr = this.arr;
    var n = this.arr.length;
    var dupKeyDict = {};
    for (var i = 0; i < n; ++i) {
        item = arr[i];
        if (dict[item.value]) {
            this.dict[item.value].dupItems = this.dict[item.value].dupItems || [];
            this.dict[item.value].dupItems.push(item);
            dupKeyDict[item.value] = 1;
        } else {
            dict[item.value] = {
                idx: i,
                item: item
            };
        }
    }
    this.dupKeys = Object.keys(dupKeyDict);
};

/***
 *
 * @param {String | Number} value
 * @returns {SelectionItem | null}
 */
ItemDictionary.prototype.getItemByValue = function (value) {
    var iDict = this.dict[value];
    if (iDict) return iDict.item;
    return null;
};

/***
 *
 * @param {String | Number} value
 * @returns {Array<SelectionItem> }
 */
ItemDictionary.prototype.getAllItemByValue = function (value) {
    var iDict = this.dict[value];
    if (iDict) return [iDict.item].concat(iDict.dupItems||[]);
    return [];
};

ItemDictionary.prototype.getDuplicateKeys = function () {
    return this.dupKeys;
};

export default  ItemDictionary;