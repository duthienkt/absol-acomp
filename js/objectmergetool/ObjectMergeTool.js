import '../../css/objectmergetool.css';
import ACore, { $, _ } from "../../ACore";
import OMTBaseType from "./type/OMTBaseType";
import "./type/OMTStruct";
import "./type/OMTString";
import "./type/OMTImage";
import "./type/OMTEnum";
import "./type/OMTArray";
import "./type/OMTEnumSet";
import "./type/OMTFile";
import "./type/OMTFileArray";
import "./type/OMTColor";
import "./type/OMTBool";
import "./type/OMTHtml";
import "./type/OMDateTime";


/***
 * @extends AElement
 * @constructor
 */
function ObjectMergeTool() {
    this._descriptors = null;
    this._objects = null;
    this.root = null;

    this.$body = $('.as-omt-body', this)
        .on('mouseover', this.eventHandler.mouseOverNode);
    this.hoveringNode = null;
    /**
     * @type {Object[]}
     * @memberOf ObjectMergeTool#
     * @name objects
     */
    /**
     * @type {Object}
     * @memberOf ObjectMergeTool#
     * @name descriptors
     */

}


ObjectMergeTool.tag = 'ObjectMergeTool'.toLowerCase();

ObjectMergeTool.render = function () {
    return _({
        class: 'as-omt',
        extendEvent: ['change'],
        child: [
            {
                class: 'as-omt-body'
            }
        ]
    });
};

ObjectMergeTool.prototype._tryFlushData = function () {
    if (this.root && this.objects && this.objects.length > 0) {
        this.root.assign(this.objects[0]);
    }
};

ObjectMergeTool.prototype._findNode = function (targetElt) {
    while (targetElt && targetElt !== this) {
        if (targetElt.omtNode) return targetElt.omtNode;
        targetElt = targetElt.parentElement;
    }
    return null;
};

ObjectMergeTool.prototype.notifyChange = function () {
    this.emit('change', { type: 'change', target: this }, this);
};

ObjectMergeTool.property = {};

ObjectMergeTool.property.descriptor = {
    set: function (value) {
        this._descriptor = value || {};
        this.$body.clearChild();
        this.root = OMTBaseType.make(this, null, this._descriptor);
        this.$body.addChild(this.root.elt);
        this._tryFlushData();
    },
    get: function () {
        return this._descriptor;
    }
};

ObjectMergeTool.property.objects = {
    set: function (value) {
        this._objects = value || [];
        this._tryFlushData();
    },
    get: function () {
        return this._objects;
    }
};

ObjectMergeTool.property.data = {
    get: function () {
        if (this.root) {
            return this.root.export();
        }
        if (this._objects && this.objects.length > 0) return this._objects[0];
        return null;
    }
};


/***
 * @type {{}}
 * @memberOf ObjectMergeTool#
 */
ObjectMergeTool.eventHandler = {};


/***
 * @this ObjectMergeTool
 * @param {MouseEvent} event
 */
ObjectMergeTool.eventHandler.mouseOverNode = function (event) {
    var node = this._findNode(event.target);
    if (this.hoveringNode === node) return;
    if (this.hoveringNode) {
        this.hoveringNode.elt.removeClass('as-hover');
    }
    this.hoveringNode = node;
    if (this.hoveringNode) {
        this.hoveringNode.elt.addClass('as-hover');
    }
};


ACore.install(ObjectMergeTool);

export default ObjectMergeTool;