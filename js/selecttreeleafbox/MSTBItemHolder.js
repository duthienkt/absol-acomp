import { _ } from "../../ACore";
import SelectTreeLeafItem from "./SelectTreeLeafItem";
import { MCTBItemHolder } from "../checktreebox/MCheckTreeBox";


function MSTBItemHolder(boxElt, parent, data) {
    this.ref = null;
    this.$list = boxElt.$list;
    this.level = parent.level + 1;
    this.status = 'none';
    this.boxElt = boxElt;
    this.parent = parent;
    this.data = data;
    this._elt = null;
    this.hasDesc = !!data.desc;
    this.hasIcon = !!data.icon;
    this.selected = false;
    if (data.items && data.items.length > 0) {
        this.children = data.items.map(item => new MSTBItemHolder(boxElt, this, item));
        this.hasDesc = this.hasDesc || this.children.some(child => child.hasDesc);
        this.hasIcon = this.hasIcon || this.children.some(child => child.hasIcon);
        this.status = 'close';
    }

}


MSTBItemHolder.prototype.ev_statusChange = MCTBItemHolder.prototype.ev_statusChange;
MSTBItemHolder.prototype.getViewElements = MCTBItemHolder.prototype.getViewElements;

MSTBItemHolder.prototype.select = function (flag) {
    this.selected = flag;
    if (this._elt) {
        this._elt.selected = flag;
    }
};


MSTBItemHolder.prototype.ev_click = function (event) {
    if (this.ref) {
        this.ref.ev_click(event);
    }
    else {
        this.boxElt.modes.normal.setValue(this.data.value);
        if (this.boxElt.mode !== this.boxElt.modes.normal) {
            this.boxElt.mode.updateSelectedFromRef();
        }
        this.boxElt.notifyPressItem();
    }
};

Object.defineProperty(MSTBItemHolder.prototype, 'elt', {
    get: function () {
        if (!this._elt) {
            this._elt = _({
                tag: SelectTreeLeafItem,
                props: {
                    data: this.data,
                    level: this.level,
                    status: this.status,
                    selected: this.selected
                },
                on: {
                    statuschange: this.ev_statusChange.bind(this),
                    click: this.ev_click.bind(this)
                }
            });
        }

        return this._elt;
    }
});


export default MSTBItemHolder;