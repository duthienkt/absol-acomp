import SelectListItem from "../SelectListItem";
import { _ } from "../../ACore";

function SLBItemHolder(parent, data) {
    this.data = data;
    this.parent = parent;
    this._elt = null;
}




Object.defineProperty(SLBItemHolder.prototype, 'elt', {
    get: function () {
        if (!this._elt) {
            this._elt = _({
                tag: SelectListItem.tag,
                props: {
                    data: this.data
                }
            });
        }
        return this._elt;
    }
});


export default SLBItemHolder;