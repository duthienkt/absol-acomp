import OOP from "absol/src/HTML5/OOP";
import SLBItemHolder from "./SLBItemHolder";
import { _ } from "../../ACore";
import { getScreenSize, getScrollSize } from "absol/src/HTML5/Dom";

export function SLBModeNormal(elt, items) {
    this.elt = elt;
    this.$scroller = this.elt.$scroller;
    this.$content = this.elt.$content;
    this.items = items;
    this.children = items.map(item => new SLBItemHolder(this, item));
    this.children.forEach((child, i) => {
        child.idx = i;
        // child.elt;
    });
    this.$pages = [];

}

SLBModeNormal.prototype._getPageElt = function (idx) {
    if (this.$pages[idx]) return this.$pages[idx];
    while (this.$pages.length <= idx) this.$pages.push(undefined);
    var children = this.children.slice(idx * 50, idx * 50 + 50);
    var pageElt = _({
        class: 'as-select-list-box-page',
        style: {
            top: 20 * idx * 50 + 'px'
        },
        child: children.map(child => child.elt)
    });
    this.$pages[idx] = pageElt;
    return pageElt;
};

SLBModeNormal.prototype._getPageCount = function () {
    return Math.ceil(this.items.length / 50);
}

SLBModeNormal.prototype.onStart = function () {
    this.elt.$content.addStyle('height', this.items.length * 20 + 'px');
    // var n = this._getPageCount();
    // for (var i =0; i < n; ++i){
    //     this.$content.addChild(this._getPageElt(i));
    // }
    this.updateListView();
};


SLBModeNormal.prototype.onStop = function () {

};

SLBModeNormal.prototype.updateListView = function () {
    var maxHeight = Math.max(4096, getScreenSize().height);
    var startIdx = Math.floor(this.$scroller.scrollTop / 1000) - 1;
    var endIdx = startIdx + Math.ceil(maxHeight / 1000) + 1;
    startIdx = Math.max(0, startIdx);
    endIdx = Math.min(this._getPageCount(), endIdx);
    var needViewPages = Array(endIdx - startIdx).fill(null).map((u, i) => this._getPageElt(startIdx + i));
    Array.prototype.forEach.call(this.$content.childNodes, elt => {
        if (needViewPages.indexOf(elt) < 0) {
            elt.remove();
        }
    });
    needViewPages.forEach(elt=>{
       if (!elt.parentElement){
           this.$content.addChild(elt);
       }
    });
}


export function SLBModeSearch(elt, items) {
    this.items = items;
}

OOP.mixClass(SLBModeSearch, SLBModeNormal);
// SLBModeSearch.prototype.onStart

