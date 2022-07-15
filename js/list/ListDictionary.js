/***
 *
 * @param {SelectionItem[]} arr
 * @constructor
 */
import { keyStringOf } from "../utils";

function ItemDictionary(arr, opt) {
    this.opt = Object.assign({ depth: true }, opt || {});
    this.arr = arr;
    this.dict = {};
    this.dupKeys = [];
    this.update();
}


ItemDictionary.prototype.update = function () {
    this.dict = {};
    var dict = this.dict;
    var depth = this.opt.depth;

    var dupKeyDict = {};

    function scan(arr) {
        var item;
        var key;
        for (var i = 0; i < arr.length; ++i) {
            item = arr[i];
            key = keyStringOf(item.value);
            if (dict[key]) {
                dict[key].dupItems = dict[key].dupItems || [];
                dict[key].dupItems.push(item);
                dupKeyDict[key] = 1;
            }
            else {
                dict[key] = {
                    idx: i,
                    item: item
                };
            }
            if (depth && item.items && item.items.length > 0) {
                scan(item.items);
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
    var iDict = this.dict[keyStringOf(value)];
    if (iDict) return iDict.item;
    return null;
};

/***
 *
 * @param {String | Number} value
 * @returns {Array<SelectionItem> }
 */
ItemDictionary.prototype.getAllItemByValue = function (value) {
    var key = keyStringOf(value);
    var iDict = this.dict[key];
    if (iDict) return [iDict.item].concat(iDict.dupItems[key] || []);
    return [];
};

ItemDictionary.prototype.getDuplicateKeys = function () {
    return this.dupKeys;
};

export default ItemDictionary;
