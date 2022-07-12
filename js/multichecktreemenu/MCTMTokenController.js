import SelectBoxItem from "../SelectBoxItem";
import { _ } from "../../ACore";
import { keyStringOf } from "../utils";

/****
 *
 * @param {MultiCheckTreeMenu} elt
 * @constructor
 */
function MCTMTokenController(elt) {
    this.elt = elt;
    this.$box = elt.$box;
    this.$itemCtn = elt.$itemCtn;
}


MCTMTokenController.prototype.updateFromViewValues = function () {
    var values = this.$box.viewValues;
    this.requireItems(values.length);
    var holder;
    for (var i = 0; i < values.length; ++i) {
        holder = this.$box.getHolderByValue(values[i]);
        this.$itemCtn.childNodes[i].data = holder.data;
    }
};

MCTMTokenController.prototype.requireItems = function (count) {
    while (this.$itemCtn.childNodes.length < count) {
        this.$itemCtn.addChild(this.makeToken());
    }
    while (this.$itemCtn.childNodes.length > count) {
        this.$itemCtn.lastChild.remove();
    }
};

MCTMTokenController.prototype.removeValue = function (targetValue) {
    this.$box.select(targetValue, false);
    this.updateFromViewValues();
    if (!this.elt.isFocus) {
        this.elt.notifyChange();
    }
};

MCTMTokenController.prototype.makeToken = function () {
    var ctrl = this;
    return _({
        tag: SelectBoxItem,
        on: {
            close: function () {
                ctrl.removeValue(this.value);
            }
        }
    });
};

export default MCTMTokenController;