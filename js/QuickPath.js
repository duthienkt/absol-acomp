import '../css/quickpath.css';
import ACore from "../ACore";
import QuickMenu from "./QuickMenu";

var _ = ACore._;
var $ = ACore.$;

function QuickPath() {
    this._holders = [];
}

/**
 * @type {QuickPath}
 */
QuickPath.eventHandler = {};

QuickPath.eventHandler.click = function (event) {
    var button = this._fileButton(event.target)
    if (button) this.pressButton(button);
};

QuickPath.tag = 'QuickPath'.toLowerCase();

/**
 * @returns {QuickPath}
 */
QuickPath.render = function () {
    return _({
        class: 'absol-quick-path',
        extendEvent: ['change', 'press']
    });
};


QuickPath.prototype.updatePath = function () {
    this.clearChild();
    var self = this;
    this._holders = this._path.map(function (data, index) {
        var holder = self._createButton(data, index);
        holder.buttom.addTo(self);
        return holder;
    })


};

QuickPath.prototype._createButton = function (pathItem, index) {
    var buttom = _({
        tag: 'expnode',
        class: 'absol-quick-path-btn',
        attr: {
            'data-index': '' + index
        }
    });
    buttom.status = 'close';
    buttom.name = pathItem.name;
    if (pathItem.icon) {
        buttom.icon = pathItem.icon;
    }
    if (pathItem.iconSrc) {
        buttom.icon = { tag: 'img', props: { src: pathItem.iconSrc } };
    }
    var thisQuickpath = this;

    if (pathItem.items) {
        QuickMenu.toggleWhenClick(buttom,
            {
                getAnchor: function () {
                    return [1, 2, 6, 5];
                },
                getMenuProps: function () {
                    return {
                        extendStyle: {
                            fontSize: buttom.getComputedStyleValue('font-size')
                        },
                        items: pathItem.items.map(function (it, menuIndex) {
                            var res = {
                                text: it.name,
                                menuIndex: menuIndex,
                                icon: it.iconSrc ? { tag: 'img', props: { src: it.iconSrc } } : (it.icon || undefined),
                                extendStyle: it.extendStyle || {},
                                extendClass: it.extendClass || [],
                            }
                            return res;
                        })
                    }
                },
                onOpen: function () {
                    buttom.status = 'open';
                    thisQuickpath.emit('press', {
                        target: thisQuickpath,
                        pathItem: pathItem,
                        index: index
                    }, thisQuickpath);

                },
                onClose: function () {
                    buttom.status = 'close';
                },
                onSelect: function (item) {
                    var dataItem = pathItem.items[item.menuIndex];
                    thisQuickpath.emit('change', {
                        target: thisQuickpath,
                        pathItem: pathItem,
                        item: dataItem,
                        index: index
                    }, thisQuickpath);
                    thisQuickpath.status = 'close';

                }
            })
    }
    else {
        buttom.on('click', function () {
            this.emit('press', { target: thisQuickpath, pathItem: pathItem, index: index }, thisQuickpath);
        });
    }

    return { buttom: buttom };
}

QuickPath.prototype.push = function (item) {
    this.path.push(item);
    var holder = this._createButton(item, this.path.length - 1);
    this.addChild(holder, buttom);
    this._holders.push(holder);
};

QuickPath.prototype.clear = function () {
    this.path = [];
    this._holders = [];
}


QuickPath.prototype.pop = function () {
    //todo
    var res = this.path.pop();
    var button = $('button[data-index="' + this.path.length + '"]');
    if (button) button.remove();
    return res;
};


QuickPath.property = {};

/**
 * @typedef PathElement
 * @property {String} name
 * @property {String} icon
 * @property {Array<String>} items
 *
 */

QuickPath.property.path = {
    /**
     * @param {Array<PathElement>} value
     */
    set: function (value) {
        this._path = value || [];
        this.updatePath();
    },
    get: function () {
        return this._path || [];
    }
};


QuickPath.property.textPath = {
    get: function () {
        return this.path.join('/');
    }
};

ACore.install('quickpath', QuickPath);

export default QuickPath;