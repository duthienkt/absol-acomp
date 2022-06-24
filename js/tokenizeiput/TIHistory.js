/***
 * @param {TokenizeInput} elt
 * @constructor
 */
function TIHistory(elt){
    this.elt = elt;
    this.stack = [];
    this.topIdx = -1;
}

TIHistory.prototype.commit = function (text, offset){
    while (this.topIdx < this.stack.length - 1) {
        this.stack.pop();
    }
    var lastText = this.stack.length > 0 ? this.stack[this.stack.length - 1].text : null;
    if (text === lastText) {
        if (this.stack[this.stack.length - 1].offset !== offset)
            this.stack[this.stack.length - 1].offset = offset;
    }
    else {
        this.topIdx = this.stack.length;
        var record = {
            text: text,
            offset: offset
        };
        this.stack.push(record);
        this.elt.emit('change', {
            target: this,
            value: record.text,
            action: 'commit',
            record: record,
            type: 'change'
        }, this);
    }
};

TIHistory.prototype.undo = function (){
    if (this.topIdx <= 0) return;
    this.topIdx--;
    var record = this.stack[this.topIdx];
    this.elt.applyData(record.text, record.offset);
    this.elt.emit('change', { target: this, value: record.text, action: 'undo', record: record, type: 'change' }, this);
};



TIHistory.prototype.redo = function (){
    if (this.topIdx + 1 >= this.stack.length) return;
    this.topIdx++;
    var record = this.stack[this.topIdx];
    this.elt.applyData(record.text, record.offset);
    this.elt.emit('change', { target: this, value: record.text, action: 'redo', record: record, type: 'change' }, this);
};




export default TIHistory;