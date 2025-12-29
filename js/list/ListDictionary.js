/***
 *
 * @param {SelectionItem[]} arr
 * @constructor
 */
import { keyStringOf, legacyKeyStringOf } from "../utils";


/**
 * ListDictionary provides fast lookup and duplicate detection for a list of SelectionItem objects.
 *
 * @class
 * @param {SelectionItem[]} arr - The array of selection items to index.
 * @param {Object} [opt] - Optional settings.
 * @param {boolean} [opt.depth=true] - Whether to scan nested items recursively.
 * @param {boolean} [opt.legacy=false] - Use legacy key string function.
 *
 * @property {SelectionItem[]} arr - The original array of items.
 * @property {Object} dict - Internal dictionary for fast lookup.
 * @property {Array<string>} dupKeys - List of keys with duplicate items.
 * @property {Function} keyStringOf - Function to generate key strings for items.
 */
function ListDictionary(arr, opt) {
    this.opt = Object.assign({ depth: true, legacy: false }, opt || {});
    if (this.opt.legacy) {
        this.keyStringOf = legacyKeyStringOf;
    }
    else {
        this.keyStringOf =  keyStringOf;
    }
    this.arr = arr;
    this.dict = {};
    this.dupKeys = [];
    this.update();
}


ListDictionary.prototype.update = function () {
    this.dict = {};
    var dict = this.dict;
    var depth = this.opt.depth;

    var dupKeyDict = {};

    var scan = (arr, parent) =>{
        var item;
        var key;
        var holder;
        for (var i = 0; i < arr.length; ++i) {
            item = arr[i];
            key = this.keyStringOf(item.value);
            holder = dict[key];
            if (holder) {
                holder.dupItems = dict[key].dupItems || [];
                holder.dupItems.push(item);
                dupKeyDict[key] =(dupKeyDict[key] || 0) + 1;
            }
            else {
                holder = {
                    pathIdx:parent? parent.pathIdx.concat([i]):[i],
                    idx: i,
                    item: item
                };
                dict[key] = holder;
            }
            if (depth && item.items && item.items.length > 0) {
                scan(item.items, holder);
            }
        }
    }

    scan(this.arr, null);
    this.dupKeys = Object.keys(dupKeyDict);
};

/***
 *
 * @param {String | Number} value
 * @returns {SelectionItem | null}
 */
ListDictionary.prototype.getItemByValue = function (value) {
    var iDict = this.dict[this.keyStringOf(value)];
    if (iDict) return iDict.item;
    return null;
};

/***
 *
 * @param {String | Number} value
 * @returns {Array<SelectionItem> }
 */
ListDictionary.prototype.getAllItemByValue = function (value) {
    var key = this.keyStringOf(value);
    var iDict = this.dict[key];
    if (iDict) return [iDict.item].concat(iDict.dupItems[key] || []);
    return [];
};

/**
 *
 * @return {Array<string>}
 */
ListDictionary.prototype.getDuplicateKeys = function () {
    return this.dupKeys;
};

export default ListDictionary;
