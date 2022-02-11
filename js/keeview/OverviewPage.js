import Fragment from "absol/src/AppPattern/Fragment";
import OOP from "absol/src/HTML5/OOP";
import { _ } from "../../ACore";
import { randomIdent } from "absol/src/String/stringGenerate";
import { isRealNumber } from "../utils";
import context from "absol/src/AppPattern/Context";

/***
 * @extends Fragment
 * @param {{}} host
 * @constructor
 */
function OverviewPage(host) {
    Fragment.call(this);
    this.host = host;
    this.id = randomIdent(5);
    this._counter = 0;

}

OOP.mixClass(OverviewPage, Fragment);


OverviewPage.prototype.tabIcon = 'span.mdi.mdi-cube-outline';
OverviewPage.prototype.name = 'Overview Page';

OverviewPage.prototype.createView = function () {
    return _({
        child: { tag: 'span', child: { text: 'OverviewPage' } }
    });
};

OverviewPage.prototype.showModal = function (opt) {
    if (this.parent && this.parent.showModal)
        return this.parent.showModal(opt, this);
};

Object.defineProperty(OverviewPage.prototype, 'counter', {
    set: function (value) {
        /***
         *
         * @type {OverviewWidget}
         */
        var parent = this.parent;
        if (!isRealNumber(value)) value = 0;
        value = Math.max(0, value >> 0);
        this._counter = value;
        parent.updateCounter();

    },
    get: function () {
        return this._counter;
    }
});


export default OverviewPage;