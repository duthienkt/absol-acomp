import '../css/snackbar.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;

var t = document.createElement;

/***
 * @extends AElement
 * @constructor
 */
function SnackBar() {
    OOP.drillProperty(this, this.firstChild, 'message', 'data');

}

SnackBar.tag = 'SnackBar'.toLowerCase();

SnackBar.render = function () {
    return _({
        class: 'as-snackbar',
        child: { text: '' }
    })
};

ACore.install(SnackBar);

SnackBar.$instance = _('snackbar');
SnackBar._removeTimeout = -1;

SnackBar.show = function (message) {
    if (SnackBar._removeTimeout > 0) {
        clearTimeout(SnackBar._removeTimeout);
    }
    if (!SnackBar.$instance.parentElement) document.body.appendChild(SnackBar.$instance);
    SnackBar.$instance.removeClass('as-hiding');
    SnackBar._removeTimeout = setTimeout(function (){
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