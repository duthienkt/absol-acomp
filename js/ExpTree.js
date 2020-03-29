import ACore from "../ACore";
import { contenteditableTextOnly } from "./utils";
import OOP from "absol/src/HTML5/OOP";
import EventEmitter from "absol/src/HTML5/EventEmitter";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;



ACore.install('toggler-ico', function () {
    var res = _(
        '<svg class="toggler-ico" width="14" height="14" version="1.1" viewBox="0 0 3.7042 3.7042" xmlns="http://www.w3.org/2000/svg" >' +
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
                <path class="close" d="M3,16.74L7.76,12L3,7.26L7.26,3L12,7.76L16.74,3L21,7.26L16.24,12L21,16.74L16.74,21L12,16.24L7.26,21L3,16.74" />\
                <circle class="modified" cx="12" cy="12" r="10" />\
            </svg>');
});



export function ExpNode() {
    var res = _({
        tag: 'button',
        extendEvent: ['pressremove', 'press'],
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

    res.$level = $('.absol-exp-node-level', res);
    res.$removeIcon = $('remove-ico', res)
        .on('click', function (event) {
            this.emit('pressremove', { target: res, type: 'pressremove' }, this);
        });

    res.on('click', function (event) {
        if (!EventEmitter.hitElement(res.$removeIcon, event))
            res.emit('press', { target: res, type: 'press' }, this);
    })

    res.$iconCtn = $('div.absol-exp-node-ext-icon', res);
    res.$extIcon = $('img.absol-exp-node-ext-icon', res);
    res.$name = $('span.absol-exp-node-name', res);
    res.$desc = $('span.absol-exp-node-desc', res);
    contenteditableTextOnly(res.$name, function (text) {
        return text.replace(/[\\\/\|\?\:\<\>\*\r\n]/, '').trim();
    });
    OOP.drillProperty(res, res.$extIcon, 'extSrc', 'src');
    res._level = 0;
    res.__isExpNode__ = true;
    return res;
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

            this.$iconCtn.addChild(newE);
            this._icon = value;
        }
        else {
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
        if (value != this.level) {
            this._level = value || 0;

            this.$level.innerHTML = '&nbsp;'.repeat(this._level * 4);
        }
    },
    get: function () {
        return this._level || 0;
    }
};




ExpNode.property.name = {
    set: function (value) {
        this._name = value + '';
        this.$name.clearChild();
        if (this.name && this.name.length > 0)
            this.$name.addChild(_({ text: this._name }))
    },
    get: function () {
        return this._name || '';
    }
};
ExpNode.property.desc = {
    set: function (value) {
        this._desc = value + '';
        this.$desc.clearChild();
        this.$desc.addChild(_({ text: this._desc }))
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

        }
        else if (value == 'close') {
            this.addClass('status-close')
        }
        else if (value == 'open') {
            this.addClass('status-open');
        }
        else if (value == 'removable') {
            this.addClass('status-removable');
        }
        else if (value == 'modified') {
            this.addClass('status-modified');
        }
        else {
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
        if (value)
            this.addClass('active');
        else
            this.removeClass('active');

    },
    get: function () {
        return this.containsClass('active');
    }
}

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
        }
        else if(key == "ESC"){
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
        }
        else {
            if (curentName.length == 0) {
                span.innerHTML = lastName;
                rejectCallback && rejectCallback();
            }
            else {
                var res = resolveCallback && resolveCallback(curentName);
                if (res === false) {
                    span.innerHTML = lastName;
                }
                else if (res && res.then) {
                    res.then(function (result) {
                        if (result === false) {
                            span.innerHTML = lastName;
                            //faile
                        }
                        else {
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
}


export function ExpTree() {
    var res = _({
        class: 'absol-exp-tree',
        extendEvent: 'press',
        child: [
            'expnode',
            '.absol-exp-items'
        ]
    });
    res.$node = $('expnode', res)
        .on('press', function (event) {
            res.emit('press', { target: res, node: this, type: 'press' }, res)
        });
    // console.log(res.$node);

    res.$itemsContainer = $('.absol-exp-items', res);
    OOP.drillProperty(res, res.$node, ['desc', 'name', 'title', 'extSrc', 'active', 'icon']);
    res.__isExpTree__ = true;
    res._level = 0;
    return res;
}

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
        }
        else {
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


ExpTree.prototype.getParent = function () {
    var current = this.parentNode;
    while (current) {
        if (current.__isExpTree__)
            break;
        current = current.parentNode;
    }
    return current;
};


ExpTree.prototype.getNode = function () {
    return this.$node;
};

ExpTree.prototype.getChildren = function () {
    return Array.apply(null, this.$itemsContainer.childNodes);
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



ACore.install('expnode', ExpNode);
ACore.install('exptree', ExpTree);


export default ExpTree;