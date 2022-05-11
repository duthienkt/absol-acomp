/***
 *
 * @param {DynamicTable} tableElt
 * @constructor
 */
function DTWaitingViewController(tableElt) {
    this.tableElt = tableElt;
    this.tokens = {};
    this.traceToken = {};
    this.timeoutIdx = -1;
}

DTWaitingViewController.prototype.begin = function () {
    var token = Math.random() + '';
    if (this.tableElt.$searchInput)
        this.tableElt.$searchInput.waiting = true;
    this.tokens[token] = true;
    this.traceToken[token] = new Error(token);
    if (this.timeoutIdx > 0) {
        clearTimeout(this.timeoutIdx);
        this.timeoutIdx = -1;
    }
    return token;
};

DTWaitingViewController.prototype.end = function (token) {
    delete this.tokens[token];
    delete this.traceToken[token];
    if (this.timeoutIdx > 0) {
        clearTimeout(this.timeoutIdx);
    }
    this.timeoutIdx = setTimeout(function () {
        this.timeoutIdx = -1;
        for (var i in this.tokens) return;
        if (this.tableElt.$searchInput)
            this.tableElt.$searchInput.waiting = false;
    }.bind(this), 100);

};


export default DTWaitingViewController;