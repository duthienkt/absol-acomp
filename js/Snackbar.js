import '../css/snackbar.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";
import {isDomNode} from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

var t = document.createElement;

/***
 * @extends AElement
 * @constructor
 */
function SnackBar() {
    // OOP.drillProperty(this, this.firstChild, 'message', 'data');
    /***
     *
     * @type {*}
     */
    this._message = null;
    this.message = null;
}

SnackBar.tag = 'SnackBar'.toLowerCase();

SnackBar.render = function () {
    return _({
        class: 'as-snackbar'
    })
};

SnackBar.property = {};

SnackBar.property.message = {
    set: function (value) {
        this._message = value;
        if (value instanceof Array) {
            this.clearChild();
            this.addChild(value.map(function (item) {
                return _(item);
            }));
        }
        else if (typeof value === 'string') {
            this.innerHTML = value;
        }
        else if (isDomNode(value)) {
            this.clearChild()
                .addChild(value);
        }
        else if (value && typeof value === 'object' &&
            (value.text
                || value.props || value.tag || value.attr
                || value.style || value.child
                || (value.child && value.child instanceof Array))) {
            this.clearChild()
                .addChild(_(value));
        }
        else {
            this.clearChild();
            this._message = null;
        }
    },
    get: function () {
        return this._message;
    }
}


ACore.install(SnackBar);

SnackBar.$instance = _('snackbar');
SnackBar._removeTimeout = -1;

SnackBar.show = function (message) {
    if (SnackBar._removeTimeout > 0) {
        clearTimeout(SnackBar._removeTimeout);
    }
    if (!SnackBar.$instance.parentElement) document.body.appendChild(SnackBar.$instance);
    SnackBar.$instance.removeClass('as-hiding');
    SnackBar._removeTimeout = setTimeout(function () {
        SnackBar.$instance.addClass('as-show');
        SnackBar.$instance.message = message;
        SnackBar._removeTimeout = setTimeout(function () {
            SnackBar.$instance.removeClass('as-show').addClass('as-hiding');
            SnackBar._removeTimeout = setTimeout(function () {
                SnackBar.$instance.remove();
                SnackBar._removeTimeout = -1;
                SnackBar.$instance.removeClass('as-hiding');
            }, 500);
        }, 3000);
    }, 1);
}


export default SnackBar;