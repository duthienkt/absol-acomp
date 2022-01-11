import ACore, { _ } from "../ACore";
import '../css/verticaltimeline.css';
import { isRealNumber } from "./utils";


/***
 * @extends AElement
 * @constructor
 */
function VerticalTimeline() {
    this._current = 0;
    this._items = [];
    this.$items = [];
    this.current = 0;
}


VerticalTimeline.tag = 'VerticalTimeline'.toLowerCase();

VerticalTimeline.render = function () {
    return _({
        class: 'as-vertical-timeline',
        child: []
    });
};

VerticalTimeline.prototype._makeItem = function (item, i) {
    var iconElt = _('span.mdi.mdi-circle');
    return _({
        class: 'as-vertical-timeline-item',
        props: { $icon: iconElt },
        child: [
            {
                class: 'as-vertical-timeline-icon-ctn',
                child: iconElt
            },
            {
                class: 'as-vertical-timeline-tile',
                child: {
                    tag: 'span',
                    child: { text: item.text }
                }
            }
        ]
    });
};


VerticalTimeline.property = {};

VerticalTimeline.property.items = {
    /***
     * @this VerticalTimeline
     * @param items
     */
    set: function (items) {
        items = items || [];
        this._items = items;
        this.clearChild();
        this.$items = items.map(function (item, i) {
            return this._makeItem(item, i);
        }.bind(this));

        this.addChild(this.$items);
        this.current = this._current;//update
    },
    get: function () {

    }
};

VerticalTimeline.property.current = {
    set: function (value) {
        value = isRealNumber(value) ? (value >> 0) : -1;
        this._current = value;
        var itemElt;
        for (var i = 0; i < this.$items.length; ++i) {
            itemElt = this.$items[i];//.$icon.removeClass('');
            if (i < value) {
                itemElt.$icon.removeClass('mdi-numeric-' + (i + 1) + '-circle')
                    .removeClass('mdi-circle')
                    .addClass('mdi-check-circle');
                itemElt.removeClass('as-inactive').removeClass('as-active');

            }
            else if (i === value) {
                itemElt.$icon.addClass('mdi-numeric-' + (i + 1) + '-circle')
                    .removeClass('mdi-circle')
                    .removeClass('mdi-check-circle');
                itemElt.removeClass('as-inactive').addClass('as-active');
            }
            else {
                itemElt.addClass('as-inactive').removeClass('as-active');
                itemElt.$icon.removeClass('mdi-numeric-' + (i + 1) + '-circle')
                    .addClass('mdi-circle')
                    .removeClass('mdi-check-circle');
            }
        }


    },
    get: function () {
        return Math.max(-1, Math.min(this._current, this._items.length));
    }
};


ACore.install(VerticalTimeline);
export default VerticalTimeline;
