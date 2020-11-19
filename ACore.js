import Dom from "absol/src/HTML5/Dom";

var ACore = new Dom({ creator: Object.assign({}, Dom.ShareInstance.creator) });
export var _ = ACore._;
export var $ = ACore.$;

export default ACore;