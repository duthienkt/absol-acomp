import prepareSearchForItem, { searchTreeListByText } from "./list/search";
import { stringHashCode } from "absol/src/String/stringUtils";
import {$} from "../ACore";


export function RawTableSearcher(elt, opt) {
    this.elt = elt;
    this.cache = {};
    this.prevHash = null;
    this.searching = false;
    this.ev_stopTyping = this.ev_stopTyping.bind(this);
    this.inputElt = opt && opt.inputElt;
    this.$tbody = $('tbody', this.elt) || this.elt;
    this.rowHolders = [];
    this.prevHash = 0;
}


RawTableSearcher.prototype.query = function (text) {
    text = text ||'';
    text = text.toLowerCase().replace(/\s+/g, ' ');
    if (text.length === 0) {
        this.reset();
        return;
    }
    else {
        this.beginSearching();
    }
    var searchRes = this.cache[text] || searchTreeListByText(text, this.rowHolders);
    var addedRow = {};
    var startRowIdx, endRowIdx;
    var holder;
    var colCount = this.rowHolders[0] && this.rowHolders[0].colCount;
    this.$tbody.clearChild();
    var i, j
    for ( i = 0; i < searchRes.length; ++i) {
        endRowIdx = searchRes[i].value;
        if (addedRow[endRowIdx]) continue;
        startRowIdx = endRowIdx;
        holder = this.rowHolders[startRowIdx];
        while (startRowIdx >0 && holder.colCount < colCount) {
            startRowIdx --;
            holder = this.rowHolders[startRowIdx];
        }
        endRowIdx = startRowIdx + this.rowHolders[startRowIdx].rowCount - 1;
        for ( j = startRowIdx; j <= endRowIdx; ++j) {
            addedRow[j] = true;
            this.$tbody.appendChild(this.rowHolders[j].rowElt);
        }
    }
};

RawTableSearcher.prototype.reset = function () {
    if (!this.searching) return;
    this.cache = {};
    this.searching = false;
    this.elt.classList.remove('as-searching');
    this.$tbody.clearChild();
    for (var i = 0; i < this.rowHolders.length; ++i)
        this.$tbody.appendChild(this.rowHolders[i].rowElt);
};

RawTableSearcher.prototype.beginSearching = function () {
    if (this.searching) return;
    this.searching = true;
    this.elt.classList.add('as-searching');
    var newHash;
    this.rowHolders = Array.prototype.map.call(this.$tbody.childNodes, (rowElt, idx) => {
        var res = {
            text: this.textOfRow(rowElt),
            rowElt: rowElt,
            value: idx,
            colCount: this.colCountOfRow(rowElt),
            rowCount: this.rowCountOfRow(rowElt)
        };
        newHash = stringHashCode(newHash + res.text);
        prepareSearchForItem(res);
        return res;
    });
    if (newHash !== this.prevHash) {
        this.cache = {};
        this.prevHash = newHash;
    }
}

RawTableSearcher.prototype.textOfRow = function (rowElt) {
    return Array.prototype.map.call(rowElt.childNodes, elt => elt.innerText).join(' ');
};

RawTableSearcher.prototype.colCountOfRow = function (rowElt) {
    return Array.prototype.reduce.call(rowElt.childNodes, (count, elt) => {
        var span = parseInt(elt.getAttribute('colspan')) || 1;
        return count + span;
    }, 0);
};

RawTableSearcher.prototype.rowCountOfRow = function (rowElt) {
    return Array.prototype.reduce.call(rowElt.childNodes, (count, elt) => {
        var span = parseInt(elt.getAttribute('rowspan')) || 1;
        return Math.max(count, span);
    }, 0);
};



RawTableSearcher.prototype.destroy = function () {
    this.inputElt = null;
    this.query('');
}

RawTableSearcher.prototype.ev_stopTyping = function (event) {
    this.query(this.inputElt.value);
};


Object.defineProperty(RawTableSearcher.prototype, 'inputElt', {
    set: function (elt) {
        if (this._inputElt) {
            this._inputElt.off('stoptyping', this.ev_stopTyping);
            this._inputElt = null;
        }
        if (elt) {
            this._inputElt = elt;
            elt.on('stoptyping', this.ev_stopTyping);
        }
    },
    get: function () {
        return this._inputElt;
    }
})