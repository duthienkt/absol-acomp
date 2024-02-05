import SelectListItem from '../SelectListItem';
import {_, $} from "../../ACore";

/***
 *
 * @extends {AElement}
 * @constructor
 */
function MSelectListItem() {
    this.$textCtn = $('.am-selectlist-item-text-ctn', this);
    this.$text = $('span.am-selectlist-item-text', this);
    this.$textValue = this.$text.childNodes[0];
    this.$descCtn = $('.am-selectlist-item-desc-ctn', this);
    this.$desc = $('span.am-selectlist-item-desc', this.$descCtn);
    this.$descValue = this.$desc.childNodes[0];
    this._extendClasses = [];
    this._extendStyle = {};
    this._data = "";
    this._level = 0;
}

MSelectListItem.tag = 'MSelectListItem'.toLowerCase();
MSelectListItem.render = function () {
    return _({
        class: 'am-selectlist-item',
        child: [
            {
                class: 'am-selectlist-item-text-ctn',
                child: {
                    tag: 'span',
                    class: 'am-selectlist-item-text',
                    child: { text: '' }
                }
            },
            {
                class: 'am-selectlist-item-desc-ctn',
                child: {
                    tag: 'span',
                    class: 'am-selectlist-item-desc',
                    child: { text: '' }
                }
            }
        ]
    });
}

MSelectListItem.property = Object.assign({}, SelectListItem.property);

MSelectListItem.property.icon = {
    set: function (icon) {
        if (this.$icon) {
            this.$icon.remove();
            this.$icon = null;

        }
        this._icon = icon || null;
        if (this._icon) {
            this.$icon = _(this._icon).addClass('am-selectlist-item-icon');
            this.$textCtn.addChildAfter(this.$icon, null);
        }
    },
    get: function () {
        return this._icon;
    }
};




export default MSelectListItem;