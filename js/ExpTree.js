import '../css/exptree.css';
import ACore from "../ACore";
import {contenteditableTextOnly} from "./utils";
import OOP from "absol/src/HTML5/OOP";
import EventEmitter, {copyEvent} from "absol/src/HTML5/EventEmitter";
import Dom from "absol/src/HTML5/Dom";
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;


ACore.install('toggler-ico', function () {
    var res = _(
        '<svg class="toggler-ico" width="14" height="14" version="1.1" viewBox="0 0 3.7042 3.7042" xmlns="http://www.w3.org/2000/svg" >' +
        '    <rect style="fill: transparent; stroke: none" x="0" y="0" width="3.7042" height="3.7042"></rect>' +
        '    <g transform="translate(0 -293.3)" class="toggle-close">' +
        '        <path d="m0.52917 293.82v2.6458l2.6458-1.3229z" />' +
        '    </g>' +
        '    <g transform="translate(0 -293.3)" class="toggle-open">' +
        '        <path d="m3.175 294.09-2.6458 2.1167h2.6458z"/>' +
        '    </g>' +
        '</svg>'
    );
    return res;
});

ACore.install('remove-ico', function () {
    return _('<svg class="remove-ico" width="24" height="24" viewBox="0 0 24 24">\
                <rect style="fill: transparent; stroke: none" x="0" y="0" width="24" height="24"></rect>\
                <path class="close" d="M3,16.74L7.76,12L3,7.26L7.26,3L12,7.76L16.74,3L21,7.26L16.24,12L21,16.74L16.74,21L12,16.24L7.26,21L3,16.74" />\
                <circle class="modified" cx="12" cy="12" r="10" />\
            </svg>');
});

/***
 * @extends AElement
 * @constructor
 */
export function ExpNode() {
    var thisEN = this;
    this.$level = $('.absol-exp-node-level', this);
    this.$removeIcon = $('remove-ico', this)
        .on('click', function (event) {
            thisEN.emit('pressremove', {target: thisEN, type: 'pressremove'}, this);
        });
    this.on('keydown', this.eventHandler.buttonKeydown);

    this.$toggleIcon = $('toggler-ico', this)
        .on('click', function (event) {
            thisEN.emit('presstoggle', copyEvent(event, {target: thisEN, type: 'pressremove'}), this);
        });

    this.on('click', function (event) {
        if (!EventEmitter.hitElement(thisEN.$removeIcon, event) && !EventEmitter.hitElement(thisEN.$toggleIcon, event))
            thisEN.emit('press', copyEvent(event, {target: thisEN, type: 'press'}), this);
    })

    this.$iconCtn = $('div.absol-exp-node-ext-icon', this);
    this.$extIcon = $('img.absol-exp-node-ext-icon', this);
    this.$name = $('span.absol-exp-node-name', this);
    this.$desc = $('span.absol-exp-node-desc', this);
    contenteditableTextOnly(this.$name, function (text) {
        return text.replace(/[\\\/\|\?\:\<\>\*\r\n]/, '').trim();
    });
    OOP.drillProperty(thisEN, thisEN.$extIcon, 'extSrc', 'src');
    this._level = 0;
    this.__isExpNode__ = true;
    return thisEN;
}


ExpNode.tag = 'expnode';

ExpNode.render = function () {
    return _({
        tag: 'button',
        extendEvent: ['pressremove', 'press', 'presstoggle'],
        class: 'absol-exp-node',
        child: [
            '.absol-exp-node-level',
            'remove-ico',
            'toggler-ico',
            'img.absol-exp-node-ext-icon',
            'div.absol-exp-node-ext-icon',
            'span.absol-exp-node-name',
            'span.absol-exp-node-desc'
        ]
    });
};

ExpNode.property = {};

ExpNode.property.icon = {
    set: function (value) {
        if (this.$iconP) {
            this.$iconP.remove();
            this.$iconP = undefined;
        }
        if (value && value != null) {
            var newE;
            if (!Dom.isDomNode(value)) {
                newE = _(value);
            }
            this.$iconP = newE;
            this.$iconCtn.addChild(newE);
            this._icon = value;
        } else {
            this._icon = undefined;
        }
    },
    get: function () {
        return this._icon;
    }
};

ExpNode.property.level = {
    set: function (value) {
        value = value || 0;
        if (value !== this.level) {
            this._level = value || 0;

            this.$level.innerHTML = '&nbsp;'.repeat(this._level * 6);
        }
    },
    get: function () {
        return this._level || 0;
    }
};


ExpNode.property.name = {
    set: function (value) {
        value = value + '';
        this._name = value;
        this.$name.clearChild();
        if (value && value.length > 0)
            this.$name.addChild(_({text: value}));
    },
    get: function () {
        return this._name || '';
    }
};
ExpNode.property.desc = {
    set: function (value) {
        this._desc = (value || '') + '';
        this.$desc.clearChild();
        this.$desc.addChild(_({text: this._desc}));
    },
    get: function () {
        return this._desc || '';
    }
};


ExpNode.property.status = {
    set: function (value) {
        this.removeClass('status-open')
            .removeClass('status-close')
            .removeClass('status-modified')
            .removeClass('status-removable');
        if (!value || value == 'none') {
            //todo

        } else if (value == 'close') {
            this.addClass('status-close')
        } else if (value == 'open') {
            this.addClass('status-open');
        } else if (value == 'removable') {
            this.addClass('status-removable');
        } else if (value == 'modified') {
            this.addClass('status-modified');
        } else {
            throw new Error('Invalid status ' + value)
        }
        this._status = value;
    },
    get: function () {
        return this._status;
    }
}

ExpNode.property.active = {
    set: function (value) {
        if (value) {
            this.addClass('as-active');
            this.addClass('active');
        } else {
            this.removeClass('as-active');
            this.removeClass('active');
        }
    },
    get: function () {
        return this.containsClass('as-active');
    }
};

ExpNode.prototype.rename = function (resolveCallback, rejectCallback) {
    var self = this;
    var span = this.$name;
    var lastName = span.innerHTML;
    span.attr('contenteditable', 'true');
    span.focus();
    document.execCommand('selectAll', false, null);

    function keydowEventHandle(event) {
        var key = event.key;
        if (key == 'Enter') {
            event.preventDefault();
            span.blur();
            span.attr('contenteditable', undefined);
        } else if (key == "ESC") {
            event.preventDefault();
            span.innerHTML = lastName;
            span.blur();
            span.attr('contenteditable', undefined);
        }
    }

    function blurEventHandle(event) {
        finish();
        var curentName = span.innerHTML.replace(/[\\\/\|\?\:\<\>\*\r\n]/, '').trim();
        if (curentName == lastName) {
            rejectCallback && rejectCallback();
        } else {
            if (curentName.length == 0) {
                span.innerHTML = lastName;
                rejectCallback && rejectCallback();
            } else {
                var res = resolveCallback && resolveCallback(curentName);
                if (res === false) {
                    span.innerHTML = lastName;
                } else if (res && res.then) {
                    res.then(function (result) {
                        if (result === false) {
                            span.innerHTML = lastName;
                            //faile
                        } else {
                            //success
                        }
                    }, function () {
                        //reject value
                        span.innerHTML = lastName;

                    })
                } else {
                    //success
                }
            }
        }
    }

    function finish() {
        span.off('keydown', keydowEventHandle);
        span.off('blur', blurEventHandle);
        $(document.body).once('click', function () {
            setTimeout(function () {
                span.attr('contenteditable', undefined);
            }, 2);
        });

    }

    span.on('keydown', keydowEventHandle);
    span.on('blur', blurEventHandle);
};

ExpNode.prototype.findNodeBefore = function () {
    var tree = this.parentElement;
    var root;
    var prevTree;
    var res = null;
    if (tree.__isExpTree__) {
        root = tree.getRoot();
        root.visitRecursive(function (cTree) {
            if (cTree === tree) {
                res = prevTree;
            }
            prevTree = cTree;
        })
    }
    return res && res.getNode();
};

ExpNode.prototype.findNodeAfter = function () {
    var tree = this.parentElement;
    var root;
    var prevTree;
    var res = null;
    if (tree.__isExpTree__) {
        root = tree.getRoot();
        root.visitRecursive(function (cTree) {
            if (prevTree === tree) {
                res = cTree;
            }
            prevTree = cTree;
        })
    }
    return res && res.getNode();
};

ExpNode.eventHandler = {};

/****
 *
 * @param {KeyboardEvent} event
 */
ExpNode.eventHandler.buttonKeydown = function (event) {
    if (event.target === this) {
        if (!event.metaKey && !event.shiftKey && !event.ctrlKey && !event.altKey) {
            var destNode;
            var tree = this.parentElement;
            var parentTree = tree && tree.getParent();
            switch (event.key) {
                case 'ArrowLeft':
                    if (tree.status === 'open') {
                        tree.status = 'close';
                        tree.notifyStatusChange();
                    } else {
                        destNode = parentTree && parentTree.getNode();
                    }
                    break;
                case 'ArrowRight':
                    if (tree.status === 'close') {
                        tree.status = 'open';
                        tree.notifyStatusChange();
                    } else {
                        destNode = this.findNodeAfter();
                    }
                    break;
                case 'ArrowUp':
                    destNode = this.findNodeBefore();
                    break;
                case 'ArrowDown':
                    destNode = this.findNodeAfter();
                    break;
                case 'Space':
                    this.click();
                    break;
            }
            if (destNode) {
                destNode.focus();
                event.preventDefault();
            }
        }
    }
};

/***
 * @extends AElement
 * @constructor
 */
export function ExpTree() {
    var thisET = this;
    this.$node = $('expnode', this)
        .on('press', function (event) {
            thisET.emit('press', Object.assign({}, {
                target: thisET,
                node: this,
                type: 'press'
            }, event), this);
        })
        .on('pressremove', function (event) {
            thisET.emit('pressremove', Object.assign({}, {
                target: thisET,
                node: this,
                type: 'pressremove'
            }, event), this);
        })
        .on('presstoggle', this.eventHandler.nodePressToggle);

    this.$itemsContainer = $('.absol-exp-items', thisET);
    OOP.drillProperty(this, this.$node, ['desc', 'name', 'title', 'extSrc', 'active', 'icon']);
    this.__isExpTree__ = true;
    this._level = 0;
}


ExpTree.tag = 'ExpTree'.toLowerCase();

ExpTree.render = function () {
    return _({
        class: 'absol-exp-tree',
        extendEvent: ['press', 'pressremove', 'statuschange'],
        child: [
            'expnode',
            '.absol-exp-items'
        ]
    });
};

ExpTree.property = {};

ExpTree.property.level = {
    set: function (value) {
        value = value || 0;
        if (value != this.level) {
            this.$node.level = value;
            Array.prototype.forEach.call(this.$itemsContainer.childNodes, function (e) {
                e.level = value + 1;
            })
        }

    },
    get: function () {
        return this.$node.level;
    }
};


ExpTree.property.status = {
    set: function (value) {
        this.$node.status = value;
        if (value != 'open') {
            this.addClass('hide-children');
        } else {
            this.removeClass('hide-children');
        }
    },
    get: function () {
        return this.$node.status;
    }
};


['findChildBefore', 'findChildAfter', 'removeChild', 'clearChild']
    .forEach(function (key) {
        ExpTree.prototype[key] = function () {
            this.$itemsContainer[key].apply(this.$itemsContainer, arguments);
        }
    });

ExpTree.prototype.addChild = function (child) {
    if (!child.__isExpTree__) throw new Error('Child node must be a ExpTree');
    child.level = this.level + 1;
    this.$itemsContainer.addChild(child);
};

ExpTree.prototype.addChildBefore = function (child, at) {
    child.level = this.level + 1;
    this.$itemsContainer.addChildBefore(child, at);
};

ExpTree.prototype.addChildAfter = function (child, at) {
    child.level = this.level + 1;
    this.$itemsContainer.addChildAfter(child, at);
};

/****
 *
 * @return {ExpTree}
 */
ExpTree.prototype.getParent = function () {
    var current = this.parentNode;
    while (current) {
        if (current.__isExpTree__)
            break;
        current = current.parentNode;
    }
    return current;
};

/***
 *
 * @return {ExpTree}
 */
ExpTree.prototype.getRoot = function () {
    var parent = this.getParent();
    if (!parent) return this;
    return parent.getRoot();
}


ExpTree.prototype.getNode = function () {
    return this.$node;
};

ExpTree.prototype.getChildren = function () {
    return Array.apply(null, this.$itemsContainer.childNodes);
};

/***
 *
 * @param {function(tree: ExpTree): void} cb
 */
ExpTree.prototype.visitRecursive = function (cb) {
    cb(this);
    if (this.status === 'open')
        Array.prototype.forEach.call(this.$itemsContainer.childNodes, function (child) {
            child.visitRecursive(cb);
        });
};

ExpTree.prototype.getPath = function () {
    var path = [];
    var current = this;
    while (current) {
        path.push(current.name);
        current = current.getParent();
    }
    return path.reverse();
};

ExpTree.prototype.accessByPath = function (path) {
    if (path.length == 0) return this;
    var childs = this.getChildren();

    var res;
    for (var i = 0; i < childs.length; ++i) {
        if (childs[i].name == path[0]) {
            res = childs[i].accessByPath(path.slice(1));
            break;
        }
    }
    return res;
};

ExpTree.prototype.toggle = function () {
    switch (this.status) {
        case 'close':
            this.status = 'open';
            break;
        case 'open':
            this.status = 'close';
            break;
    }
};


ExpTree.prototype.notifyStatusChange = function (props) {
    this.emit('statuschange', Object.assign({type: 'statuschange', target: this}, props), this);
};

ExpTree.eventHandler = {};

ExpTree.eventHandler.nodePressToggle = function (event) {
    this.toggle();
    this.notifyStatusChange({originEvent: event});
};

/***
 * @extends ExpTree
 * @constructor
 */
export function ExpGroup() {
    this.addClass('as-exp-group');
    this.__isExpTree__ = true;
}


ExpGroup.tag = 'ExpGroup'.toLowerCase();

ExpGroup.render = function () {
    return _('div');
};

/***
 *
 * @param {function(tree: ExpTree): void} cb
 */
ExpGroup.prototype.visitRecursive = function (cb) {
    Array.prototype.forEach.call(this.childNodes, function (child) {
        child.visitRecursive(cb);
    });
};

ExpGroup.prototype.getParent = function () {
    return null;
};

ExpGroup.prototype.getRoot = function () {
    return this;
};

ExpGroup.prototype.getNode = function () {
    return null;
};

ACore.install(ExpNode);
ACore.install(ExpTree);
ACore.install(ExpGroup);


export default ExpTree;