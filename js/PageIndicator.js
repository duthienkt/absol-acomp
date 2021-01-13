import ACore from "../ACore";
import '../css/pageindicator.css';

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function PageIndicator() {


}


PageIndicator.tag = 'PageIndicator'.toLowerCase();

PageIndicator.render = function () {
    return _({
        class: 'as-page-indicator',
        child: [
            '.as-page-indicator-item',
            '.as-page-indicator-item',
            '.as-page-indicator-item',
            '.as-page-indicator-item'
        ]
    });
};

PageIndicator.property = {};

PageIndicator.property.length = {
    set: function (value) {
        value = value || 0;
        value = Math.max(0, value);
        while (this.childNodes.length < value) {
            this.addChild(_('.as-page-indicator-item'));
        }
        while (this.childNodes.length > value) {
            this.removeChild(this.childNodes[this.childNodes.length -1]);
        }

    },
    get: function () {

    }
};


ACore.install(PageIndicator);

export default PageIndicator;