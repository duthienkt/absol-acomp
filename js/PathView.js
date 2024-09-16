import ACore, { _, $ } from "../ACore";
import '../css/pathmenu.css';

/***
 * @extends AElement
 * @constructor
 */
function PathView() {
    this._items = [];
    this.$items = [];
}

PathView.tag = 'PathView'.toLowerCase();

PathView.render = function () {
    return _({
        extendEvent: ['press'],
        class: 'as-path-view'
    });
};


PathView.property = {};

PathView.property.items = {
    set: function (value) {
        this.clearChild();
        this._items = value || [];
        this.$items = this._items.map((item, i, array) => {
            item = item || {};

            var $item = _({
                tag: 'button',
                class: ['as-path-view-item'],
                child: []
            });
            if (item.icon) {
                $item.addChild(_(item.icon).addClass('as-path-view-item-icon'));
            }
            if (item.text || item.name) {
                $item.addChild(_({
                    class: 'as-path-view-item-text',
                    child: { text: item.text || item.name || '' }
                }));
            }

            if (i < array.length - 1) {
                $item.addChild(_({
                    class: 'as-path-view-item-arrow',
                    child: 'span.mdi.mdi-chevron-right'
                }));
            }

            $item.on('click', (event) => {
                this.emit('press', {
                    item: item,
                    index: i,
                    items: array,
                    type: 'click',
                    value: item.value,
                    originalEvent: event
                });
            });
            this.$items.push($item);
            return $item;
        });
        this.addChild(this.$items);
    },
    get: function () {
        return this._items;
    }
};


ACore.install(PathView);


export default PathView;