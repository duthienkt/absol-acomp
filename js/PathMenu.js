import '../css/pathmenu.css';
import ACore, { _, $ } from "../ACore";
import QuickMenu from "./QuickMenu";
import AElement from "absol/src/HTML5/AElement";

/***
 * @extends AElement
 * @constructor
 */
function PathMenu() {
    this._path = [];
    this.$items = [];
}


PathMenu.tag = 'PathMenu'.toLowerCase();
PathMenu.render = function () {
    return _({
        attr: {
            tabindex: '1'
        },
        extendEvent: ['press', 'change'],
        class: 'as-path-menu'
    });
};


PathMenu.prototype._makeItem = function (data, idx) {
    var self = this;
    var button = _({
        class: ['as-ribbon-split-button', 'as-path-menu-item'],
        child: {
            class: 'as-ribbon-split-button-content',
            child: [{
                tag: 'button',
                attr: {
                    'tabindex': '-1'
                },
                class: 'as-ribbon-split-button-primary',
                child: {
                    tag: 'span',
                    class: 'as-ribbon-split-button-text',
                    child: { text: (data.name || data.text || '') + '' }
                }
            },
                {
                    tag: 'button',
                    attr: {
                        'tabindex': '-1'
                    },
                    class: 'as-ribbon-split-button-extend',
                    child: ['span.mdi.mdi-chevron-right']
                }
            ]
        }
    });

    button.on('mouseenter', function () {
        if (document.activeElement && AElement.prototype.isDescendantOf.call(document.activeElement, self) && self.hasClass('as-opening-item')) {
            if (button.quickMenu) button.quickMenu.open();
        }
    });

    var extendIconElt = $('.as-ribbon-split-button-extend .mdi', button);

    var primaryBtn = $('.as-ribbon-split-button-primary', button)
        .on('click', function () {
            self.emit('press', {
                target: self,
                pathItem: data,
                index: idx
            }, self);
        });

    //as-ribbon-split-button-icon
    var icon = null;
    if (data.icon) {
        icon = _(data.icon);
    }
    else if (data.iconSrc) {
        icon = _({ tag: 'img', props: { src: data.iconSrc } })
    }

    if (icon) {
        if (icon.parentElement) icon = $(icon.cloneNode(true));
        icon.addClass('as-ribbon-split-button-icon');
        primaryBtn.addChildBefore(icon, primaryBtn.firstChild);
    }

    var quickTrigger = $('.as-ribbon-split-button-extend', button);


    if (data.items && data.items.length > 0) {
        button.quickMenu = QuickMenu.toggleWhenClick(quickTrigger, {
            getMenuProps: function () {
                return {
                    items: data.items.map(function (it, menuIndex) {
                        if (typeof it === "string") return it;
                        if (typeof it === "object") {
                            if (it.icon || it.iconSrc || it.name || it.text) {
                                return {
                                    text: it.name || it.text,
                                    menuIndex: menuIndex,
                                    icon: it.iconSrc ? {
                                        tag: 'img',
                                        props: { src: it.iconSrc }
                                    } : (it.icon || undefined),
                                    extendStyle: it.extendStyle || {},
                                    extendClass: it.extendClass || [],
                                }
                            }
                        }
                        return it;
                    })
                }
            },
            anchor: [1, 6, 0, 7],
            onOpen: function () {
                self.addClass('as-opening-item');
                extendIconElt.addClass('mdi-rotate-90');
            },
            onClose: function () {
                self.removeClass('as-opening-item');
                extendIconElt.removeClass('mdi-rotate-90');
            },
            onSelect: function (item) {
                var dataItem = data.items[item.menuIndex];
                self.emit('change', {
                    target: self,
                    pathItem: data,
                    item: dataItem,
                    index: idx
                }, self);
                button.removeClass('as-open');
            }
        });
    }

    return button;
};


PathMenu.property = {};

PathMenu.property.path = {
    set: function (path) {
        this._path = path || [];
        this.$items.forEach(elt => elt.remove());
        this.$items = this._path.map((it, i) => this._makeItem(it, i));
        this.addChild(this.$items);
    },
    get: function () {
        return this._path;
    }
};

ACore.install(PathMenu);

export default PathMenu;
