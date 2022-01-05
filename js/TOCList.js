import ACore, { $, _ } from "../ACore";
import TOCItem from "./TOCItem";
import QuickMenu from "./QuickMenu";
import BlurTrigger from "./tool/BlurTrigger";
import prepareSearchForItem, { searchTreeListByText } from "./list/search";


/***
 * @extends AElement
 * @constructor
 */
function TOCList() {
    this.$searchInput = null;
    this.$body = $('.as-toc-list-body', this);
    this.$searching = $('.as-toc-list-searching', this);

    this.rootController = new TOCVirtualRootController(this, [], this.$body);
    this.searchCache = {};
    this.savedState = { active: null, status: {} };
    /***
     * @name nodes
     * @type {{}[]}
     * @memberOf TOCList#
     */
}

TOCList.tag = 'TOCList'.toLowerCase();

TOCList.render = function () {
    return _({
        extendEvent: ['pressnode', 'checkednodechange', 'pressnodequickmmenu', 'statechange'],
        class: 'as-toc-list',
        child: [
            '.as-toc-list-body',
            '.as-toc-list-searching'
        ]
    });
};

TOCList.prototype.applySavedState = function () {
    var savedStatus = this.savedState.status;

    function visitArr(arr) {
        arr.forEach(function (ct) {
            var status = savedStatus[ct.ident];
            if (status) {
                ct.status = status;
            }
            savedStatus[ct.ident] = ct.status;
            visitArr(ct.children);
        });
    }

    visitArr(this.rootController.children);

    var activeCt = this.findControllerByIdent(this.savedState.active);
    if (activeCt) activeCt.active();
};

TOCList.prototype.resetSavedState = function () {
    this.savedState = { active: null, status: {} };
};

TOCList.prototype.saveState = function () {
    var oldState = this.savedState;
    var savedState = { active: null, status: {} };
    var changed = false;

    function visitArr(arr) {
        arr.forEach(function (ct) {
            savedState.status[ct.ident] = ct.status;
            changed = changed || savedState.status[ct.ident] !== oldState.status[ct.ident];
            if (ct.nodeElt.containsClass('as-active')) {
                savedState.active = ct.ident;
            }
            visitArr(ct.children);
        });
    }

    changed = changed || (oldState.active !== savedState.active);

    visitArr(this.rootController.children);
    this.savedState = savedState;
    if (changed) this.notifySavedStateChange();
};

TOCList.prototype.notifySavedStateChange = function () {
    this.emit('statechange', { target: this, type: 'statechange' }, this);
};

TOCList.prototype.loadSavedState = function (savedState) {
    savedState = savedState || {};
    this.savedState = {
        active: savedState.active || null,
        status: savedState.status || {}
    };
    this.applySavedState();
};


TOCList.prototype.openAllNodeRecursive = function () {
    this.rootController.openRecursive();
    this.savedState();
};

TOCList.prototype.closeAllNodeRecursive = function () {
    this.rootController.closeRecursive();
    this.savedState();
};

TOCList.prototype.deactivateAllNode = function () {
    this.rootController.deactivateRecursive();
};


/***
 *
 * @param ident
 * @returns {TOCNodeController|null}
 */
TOCList.prototype.activeNode = function (ident) {
    var nodeCt = this.findControllerByIdent(ident);
    if (nodeCt) nodeCt.active();
    return nodeCt;
};

/***
 *
 * @param {string} ident
 * @param {TOCNodeController|TOCVirtualRootController=} rootController
 * @returns {TOCNodeController}
 */
TOCList.prototype.findControllerByIdent = function (ident, rootController) {
    var res = null;
    rootController = rootController || this.rootController;

    function visitArr(arr) {
        arr.some(function (ct) {
            if (ct.ident === ident) {
                res = ct;
                return true;
            }
            visitArr(ct.children);
        });
    }

    visitArr(rootController.children);
    return res;
};

TOCList.prototype.makeNodeController = function (nodeData) {
    return new TOCNodeController(this, nodeData, null);
};

/**
 *
 * @param query
 * @private
 * @returns {TOCVirtualRootController}
 */
TOCList.prototype._calcSearch = function (query) {
    var searchRootController = this.searchCache[query];
    if (searchRootController) return searchRootController;
    var itemTree = this.searchCache.__itemTree__;
    if (!itemTree) {
        itemTree = this.nodes.map(function visit(node) {
            var item = prepareSearchForItem({ text: node.name, value: Object.assign({}, node) });
            if (node.children && node.children.length > 0) {
                item.items = node.children.map(visit);
            }
            return item;
        });
        this.searchCache.__itemTree__ = itemTree;
    }
    var resultItemTree = searchTreeListByText(query, itemTree);
    var resultNodes = resultItemTree.map(function visit2(item) {
        var node = Object.assign({}, item.value);
        delete node.children;
        if (item.items && item.items.length > 0) {
            node.children = item.items.map(visit2);
        }
        return node;
    });
    this.searchCache[query] = new TOCVirtualRootController(this, resultNodes)
    return this.searchCache[query];
};

TOCList.prototype.search = function (query) {
    query = query || '';
    query = query.trim().replace('\s(\s+)', ' ');
    var searchRoot = this._calcSearch(query);
    var activeNodeCt;
    if (query.length === 0) {
        this.removeClass('as-searching');
        this.$searching.clearChild();
    }
    else {
        this.addClass('as-searching');
        this.$searching.clearChild();
        searchRoot.openRecursive();
        activeNodeCt = this.findControllerByIdent(this.savedState.active, searchRoot);
        if (activeNodeCt) activeNodeCt.active();
        this.$searching.addChild(searchRoot.getViewElements());
    }
};


TOCList.property = {};

TOCList.property.nodes = {
    /***
     * @this TOCList
     * @param nodes
     */
    set: function (nodes) {
        this.searchCache = {};
        nodes = nodes || [];
        this.rootController = new TOCVirtualRootController(this, nodes);
        this.$body.clearChild().addChild(this.rootController.getViewElements());
        this.applySavedState();
    },
    get: function () {
        return this.rootController.nodes;
    }
};

TOCList.property.searchInput = {
    /***
     * @this TOCList
     */
    set: function (elt) {
        if (this.$searchInput) {
            this.$searchInput.off('stoptyping', this.eventHandler.searchTextInputModify);
        }
        this.$searchInput = elt;
        if (this.$searchInput) {
            this.$searchInput.on('stoptyping', this.eventHandler.searchTextInputModify);
        }
    },
    /***
     * @this TOCList
     */
    get: function () {
        return this.$searchInput;
    }
}


/***
 * @memberOf TOCList#
 * @type {{}}
 */
TOCList.eventHandler = {};


TOCList.eventHandler.pressNode = function (nodeController, event) {
    var newEvent = {
        type: 'pressnode', target: this,
        originalEvent: event.originalEvent || event,
        controller: nodeController,
        nodeData: nodeController.nodeElt.nodeData,
        nodeElt: nodeController.nodeElt,
    };
    this.emit('pressnode', newEvent, this);
};

TOCList.eventHandler.checkedNodeChange = function (nodeController, event) {
    var newEvent = {
        type: 'checkednodechange',
        target: this,
        originalEvent: event.originalEvent || event,
        controller: nodeController,
        nodeData: nodeController.nodeElt.nodeData,
        nodeElt: nodeController.nodeElt
    };
    this.emit('checkednodechange', newEvent, this);
};


TOCList.eventHandler.pressNodeQuickMenu = function (nodeController, event) {
    var newEvent = {
        type: 'pressnodequickmmenu',
        target: this,
        originalEvent: event.originalEvent || event,
        controller: nodeController,
        nodeData: nodeController.nodeElt.nodeData,
        nodeElt: nodeController.nodeElt
    };

    newEvent.showMenu = function (menuProps, onSelect) {
        var token = QuickMenu.show(nodeController.nodeElt.$quickMenuBtn, menuProps, 'auto', onSelect, false);
        var blurTrigger = new BlurTrigger([], 'click', function () {
            QuickMenu.close(token);
        }, 10, 30);
    };
    this.emit('pressnodequickmmenu', newEvent, this);
};

/***
 * @this TOCList
 */
TOCList.eventHandler.searchTextInputModify = function () {
    this.search(this.$searchInput.value);
}


ACore.install(TOCList);

/***
 *
 * @param {TOCList} listElt
 * @param {{}[]} nodes
 * @constructor
 */
function TOCVirtualRootController(listElt, nodes) {
    Object.defineProperties(this, {
        root: {
            value: this
        }
    });
    this.listElt = listElt;
    this.level = -1;
    this.nodes = nodes;
    /***
     *
     * @type {TOCNodeController[]}
     */
    this.children = nodes.map(function (nodeData) {
        return new TOCNodeController(listElt, nodeData, this);
    }.bind(this));
}


TOCVirtualRootController.prototype.deactivateRecursive = function () {
    this.children.forEach(function (ct) {

    });
};

TOCVirtualRootController.prototype.openRecursive = function () {
    this.children.forEach(function (ct) {
        ct.openRecursive();
    });
};

TOCVirtualRootController.prototype.closeRecursive = function () {
    this.children.forEach(function (ct) {
        ct.closeRecursive();
    });
};

TOCVirtualRootController.prototype.getViewElements = function () {
    var ac = [];
    this.children.forEach(function (ct) {
        ct.getViewElements(ac);
    });
    return ac;
};

TOCVirtualRootController.prototype.indexOfChild = function (child) {
    for (var i = 0; i < this.children.length; ++i) {
        if (child === this.children[i] || this.children[i].ident === child) return i;
    }
    return -1;
};

TOCVirtualRootController.prototype.addChildBefore = function (controller, at) {
    if (controller.parent) controller.remove();
    var atIdx = this.indexOfChild(at);

};


TOCVirtualRootController.prototype.addChildAfter = function (controller, at) {
    if (controller.parent) controller.remove();
    var atIdx = this.indexOfChild(at);


};

TOCVirtualRootController.prototype.removeChild = function (child) {

};


/***
 *
 * @param {function(nodeCt:TOCNodeController):(void|boolean)} callback return true to stop
 */
TOCVirtualRootController.prototype.traverse = function (callback) {
    this.children.some(function visit(ct) {
        return callback(ct) || ct.children.some(visit);
    });
};


/***
 *
 * @param {TOCList} listElt
 * @param {{}} nodeData
 * @param {TOCNodeController|TOCVirtualRootController} parent
 * @constructor
 */
function TOCNodeController(listElt, nodeData, parent) {
    Object.defineProperties(this, {
        listElt: { value: listElt },
        __parent__: {
            value: parent,
            enumerable: false,
            writable: true
        }
    });
    this.level = parent ? parent.level + 1 : 0;
    /***
     * @type {TOCItem}
     */
    this.nodeElt = _({
        tag: TOCItem.tag,
        props: {
            nodeData: nodeData,
            checked: !!nodeData.checked,
            name: nodeData.name,
            icon: nodeData.icon,
            level: this.level,
            controller: this,
            status: 'none'
        },
        on: {
            presstoggle: this.toggle.bind(this),
            press: this.ev_press.bind(this),
            checkedchange: this.ev_checkedChange.bind(this),
            pressquickmenu: this.ev_pressQuickMenu.bind(this)
        }
    });

    this.nodeElt.on('presstoggle', this.listElt.saveState.bind(this.listElt));
    /***
     * @name children
     * @type {TOCNodeController[]}
     * @memberOf TOCNodeController#
     */
    if (nodeData.children && nodeData.children.length > 0) {
        this.nodeElt.status = 'close';
        this.children = nodeData.children.map(function (c) {
            return new TOCNodeController(listElt, c, this);
        }.bind(this));
    }
    else {
        this.children = [];
    }
}

TOCNodeController.prototype.traverse = TOCVirtualRootController.prototype.traverse;

TOCNodeController.prototype.deactivateRecursive = function () {
    this.nodeElt.removeClass('as-active');
    this.children.forEach(function (ct) {
        ct.deactivateRecursive();
    });
};

TOCNodeController.prototype.removeChild = function () {

};

TOCNodeController.prototype.remove = function () {
    this.parent.removeChild(this);
};


TOCNodeController.prototype.toggle = function () {
    if (this.status === 'close') this.open();
    else if (this.status === 'open') this.close();
};


TOCNodeController.prototype.open = function () {
    if (this.status !== 'close') return;
    this.nodeElt.status = 'open';
    var pE = this.nodeElt.parentElement;
    if (!pE) return;
    var veArr = this.getViewElements();
    veArr.shift();
    var at = pE.findChildAfter(this.nodeElt);
    if (at) {
        while (veArr.length > 0) {
            pE.addChildBefore(veArr.shift(), at);
        }
    }
    else {
        pE.addChild(veArr);
    }
};


TOCNodeController.prototype.close = function () {
    if (this.status !== 'open') return;
    var veArr = this.getViewElements();
    veArr.shift();
    while (veArr.length > 0) {
        veArr.pop().remove()
    }
    this.nodeElt.status = 'close';
};


TOCNodeController.prototype.getViewElements = function (ac) {
    ac = ac || [];
    ac.push(this.nodeElt);
    if (this.status === 'open' && this.children.length > 0) {
        this.children.forEach(function (ct) {
            ct.getViewElements(ac);
        });
    }
    return ac;
};

TOCNodeController.prototype.setLevelRecursive = function (value) {
    this.level = value;
    this.nodeElt.level = value;
    this.children.forEach(function (ct) {
        ct.setLevelRecursive(value + 1);
    });
};

TOCNodeController.prototype.openRecursive = function () {
    if (this.status === 'close') {
        this.open();
    }
    this.children.forEach(function (ct) {
        ct.openRecursive();
    });
};


TOCNodeController.prototype.ev_press = function (event) {
    this.listElt.eventHandler.pressNode(this, event);
};


TOCNodeController.prototype.ev_checkedChange = function (event) {
    this.nodeElt.nodeData.checked = this.nodeElt.checked;
    this.listElt.eventHandler.checkedNodeChange(this, event);
};

TOCNodeController.prototype.ev_pressQuickMenu = function (event) {
    this.listElt.eventHandler.pressNodeQuickMenu(this, event);
};

TOCNodeController.prototype.closeRecursive = function () {
    if (this.status === 'open') {
        this.close();
    }
    this.children.forEach(function (ct) {
        ct.openRecursive();
    });
};

/***
 *
 * @param {boolean=true} isActive default: true
 */
TOCNodeController.prototype.active = function (isActive) {
    var self = this;
    if (arguments.length === 0) isActive = true;
    //todo: notify savedState change
    if (isActive) {
        this.root.traverse(function (ct) {
            if (ct === self) {
                ct.nodeElt.addClass('as-active');
            }
            else
                ct.nodeElt.removeClass('as-active');
        });
        if (this.listElt.savedState.active !== this.ident) {
            this.listElt.savedState.active = this.ident;
            this.listElt.notifySavedStateChange();
        }
    }
    else {
        if (this.listElt.savedState.active === this.ident) {
            this.listElt.savedState.active = this.ident;
        }
        this.nodeElt.removeClass('as-active');
    }
};

Object.defineProperty(TOCNodeController.prototype, 'status', {
    get: function () {
        return this.nodeElt.status;
    },
    set: function (value) {
        if (value === 'open' && this.nodeElt.status === 'close') this.open();
        else if (value === 'close' && this.nodeElt.status === 'open') this.close();
    }
});

Object.defineProperty(TOCNodeController.prototype, 'root', {
    get: function () {
        return this.parent ? this.parent.root : this;
    }
});

Object.defineProperty(TOCNodeController.prototype, 'checked', {
    get: function () {
        return !!this.nodeElt.nodeData.checked;
    },
    set: function (value) {
        this.nodeElt.checked = !!value;
        this.nodeElt.nodeData.checked = !!value;
    }
});

Object.defineProperty(TOCNodeController.prototype, 'name', {
    set: function (value) {
        value = value || '';
        this.nodeElt.name = value;
        this.nodeElt.nodeData.name = value;
    },
    get: function () {
        return this.nodeElt.nodeData.name;
    }
});


Object.defineProperty(TOCNodeController.prototype, 'ident', {
    get: function () {
        return this.nodeElt.nodeData.ident;
    },
    set: function (value) {
        this.nodeElt.nodeData.ident = value;
    }
});

Object.defineProperty(TOCNodeController.prototype, 'nodeData', {
    get: function () {
        return this.nodeElt.nodeData;
    },
    set: function (value) {
        this.nodeElt.nodeData = value;
    }
});


Object.defineProperty(TOCNodeController.prototype, 'parent', {
    get: function () {
        return this.__parent__;
    }
});


export default TOCList;