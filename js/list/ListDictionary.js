/***
 * usage: HR
 */
/***
 *
 * @param {Array<SelectionItem>} arr
 * @constructor
 */
function ItemDictionary(arr) {
    this.arr = arr;
    this.dict = {};
    this.dupKeys = [];
    this.update();
}

ItemDictionary.prototype.update = function () {
    this.dict = {};
    var dict = this.dict;
    var item;

    var dupKeyDict = {};

    function scan(arr) {
        for (var i = 0; i < arr.length; ++i) {
            item = arr[i];
            if (dict[item.value]) {
                dict[item.value].dupItems = dict[item.value].dupItems || [];
                dict[item.value].dupItems.push(item);
                dupKeyDict[item.value] = 1;
            }
            else {
                dict[item.value] = {
                    idx: i,
                    item: item
                };
            }
            if (item.items  && item.items.length > 0){
                scan( item.items);
            }
        }
    }

    scan(this.arr);
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
    if (iDict) return [iDict.item].concat(iDict.dupItems || []);
    return [];
};

ItemDictionary.prototype.getDuplicateKeys = function () {
    return this.dupKeys;
};

export default ItemDictionary;
