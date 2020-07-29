import '../css/treelist.css';
import ACore from "../ACore";
import OOP from "absol/src/HTML5/OOP";

var _ = ACore._;
var $ = ACore.$;

function TreeListItem() {
    var thisTI = this;
    this.$list = $('treelist', this).on('press', function (event, sender) {
        thisTI.emit('press', event, this);
    });

    this.$parent = $('.absol-tree-list-item-parent', this).on('mousedown', this.eventHandler.clickParent);
    this.$text = $('span.absol-tree-list-item-text', this);
    this.$desc = $('span.absol-tree-list-item-desc', this);
    this.$descCtn = $('.absol-tree-list-item-desc-container', this);
    this.$list.level = 1;
    OOP.drillProperty(this, this.$list, 'items');

    return this;
}

TreeListItem.tag = 'TreeListItem'.toLowerCase();
TreeListItem.render = function () {
    return _({
        extendEvent: ['press', 'clickparent'],
        class: 'absol-tree-list-item',
        child: [
            {
                class: 'absol-tree-list-item-parent',
                child: ['span.absol-tree-list-item-text',
                    {
                        class: 'absol-tree-list-item-desc-container',
                        child: 'span.absol-tree-list-item-desc'
                    }
                ]
            },
            'treelist'
        ]
    });
};


TreeListItem.eventHandler = {};
TreeListItem.eventHandler.clickParent = function (event) {
    event.preventDefault();
    var prevented = false;
    var self = this;
    this.emit('press', {
        target: self,
        preventDefault: function () {
            prevented = true;
        },
        isPrevented: function () {
            return prevented;
        },
        data: this.data
    }, this);
    if (!prevented) {
        var top = self.getTopLevelElt();
        $('treelistitem', top, function (e) {
            if (e != self)
                e.active = false;
        })
        self.active = true;
    }
};

TreeListItem.prototype.getTopLevelElt = function () {
    var current = this;
    while (current) {
        var parent = current.parentNode;
        if (!parent || (!parent.classList.contains('absol-tree-list') && !parent.classList.contains('absol-tree-list-item'))) break;
        current = current.parentNode;
    }
    return current;
};


TreeListItem.property = {
    text: {
        set: function (value) {
            value = value + '';
            this.$text.innerHTML = value;
        },
        get: function () {
            return this.$text.innerHTML;
        }
    },
    desc: {
        set: function (value) {
            value = value + '';
            this.$desc.innerHTML = value;
        },
        get: function () {
            return this.$desc.innerHTML
        }
    },
    level: {
        set: function (value) {
            value = value || 0;
            if (value == this.level) return;
            this._level = value;
            this.$parent.addStyle('padding-left', this._level * 0.4 * 3 + 'em');
            this.$list.level = value + 1;
        },
        get: function () {
            return this._level || 0;
        }
    },
    active: {
        set: function (value) {
            if (value) {
                this.addClass('active');
            }
            else {
                this.removeClass('active');
            }
        },
        get: function () {
            return this.containsClass('active');
        }
    },
    data: {
        set: function (value) {
            this._data = value;
        },
        get: function () {
            return this._data;
        }
    },
    value: {
        get: function () {
            var data = this.data;
            if (typeof data == 'string') return data;
            if (typeof data.value == "undefined") {
                return data.text;
            }
            else {
                return data.value;
            }
        }
    }
};


TreeListItem.property.extendClasses = {
    set: function (value) {
        var self = this;
        this.extendClasses.forEach(function (className) {
            self.$parent.removeClass(className);
        });
        this._extendClass = [];
        if (!value) return;
        if (typeof value == 'string') {
            value = value.split(/\s+/).filter(function (c) {
                return c.length > 0
            });
        }

        if (value instanceof Array) {
            this._extendClass = value;
            this._extendClass.forEach(function (className) {
                self.$parent.addClass(className);
            });
        }
        else {
            throw new Error('Invalid extendClasses');
        }
    },
    get: function () {
        return this._extendClass || [];
    }
};


TreeListItem.property.extendStyle = {
    set: function (value) {
        this.$parent.removeStyle(this._extendStyle || {});
        this._extendStyle = value || {};
        this.$parent.addStyle(this.extendStyle);
    },
    get: function () {
        return this._extendStyle || {};
    }
};


ACore.install(TreeListItem);

export default TreeListItem;