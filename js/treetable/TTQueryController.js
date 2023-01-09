import { $ } from "../../ACore";
import noop from "absol/src/Code/noop";
import Thread from "absol/src/Network/Thread";
import TTSearchFactor from "./TTSearchFactor";
import { randomIdent } from "absol/src/String/stringGenerate";

var worker = null;
var prepareWorker = () => {
    prepareWorker = noop;
    worker = new Thread({
        methods: {
            init: TTSearchFactor
        },
        extendCode: 'init(this)'
    });


}


/***
 *
 * @param {TreeTable} elt
 * @constructor
 */
function TTQueryController(elt) {
    prepareWorker();
    this.id = randomIdent(8);
    this.elt = elt;
    this.$filterInputs = [];
    this.$searchInput = null;
    this['request'] = this['request'].bind(this);
}

TTQueryController.prototype.attachFilterInput = function (input) {
    if (this.$filterInputs.indexOf(input) >= 0) return;
    if (input.detachTreeTable)
        input.detachTreeTable();
    input.$treeTable = this;
    if ($(input).isSupportedEvent('stoptyping')) {
        input.on('stoptyping', this.request);
    }
    else {
        input.on('change', this.request);
    }

    input.detachTreeTable = this.detachFilterInput.bind(this, input);
    this.$filterInputs.push(input);
};

TTQueryController.prototype.detachFilterInput = function (input) {
    var idx = this.$filterInputs.indexOf(input);
    if (idx < 0) return;
    this.$filterInputs.splice(idx, 1);
    input.off(this.$searchInput.isSupportedEvent('stoptyping') ? 'stoptyping' : 'change', this.request);
    input.detachTreeTable = null;
};


TTQueryController.prototype.attachSearchInput = function (input) {
    if (this.$searchInput === input) return;
    if (input.detachTreeTable) input.detachTreeTable();
    this.$searchInput = input;
    if ($(input).isSupportedEvent('stoptyping')) {
        input.on('stoptyping', this.request);
    }
    else {
        input.on('change', this.request);
    }
    input.detachTreeTable = this.detachSearchInput.bind(this, input)
};


TTQueryController.prototype.detachSearchInput = function (input) {
    input = input || this.$searchInput;
    if (input !== this.$searchInput) return;
    input.off(this.$searchInput.isSupportedEvent('stoptyping') ? 'stoptyping' : 'change', this.request);
    input.detachTreeTable = null;
    this.$searchInput = null;
};


TTQueryController.prototype.makeQuery = function () {
    var res = {};
    if (this.$searchInput && this.$searchInput.value.trim().length > 0) {
        res.text = this.$searchInput.value.trim();
    }

    for (var key in res) {
        return res;
    }
    return null;
}

TTQueryController.prototype.request = function () {
    var query = this.makeQuery();
    if (query)
        worker.invoke('callQuery', this.id, query).then(searchResult => {
            this.elt.table.body.applyQueryResult(searchResult);
        });
    else this.elt.table.body.applyQueryResult(null);
};

TTQueryController.prototype.getSearchItems = function () {
    var getSearchItemOf = row => {
        var res = {};
        res.text = row.innerText;
        res.value = row.id;
        if (row.subRows && row.subRows.length > 0) {
            res.items = row.subRows.map(getSearchItemOf)
        }
        return res;
    }

    return this.elt.table.body.rows.map(getSearchItemOf);
};

TTQueryController.prototype.transferSearchItems = function () {
    worker.invoke('transferSearchItems', this.id, this.getSearchItems());
};


export default TTQueryController;