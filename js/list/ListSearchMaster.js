import { randomIdent } from "absol/src/String/stringGenerate";
import Thread from "absol/src/Network/Thread";
import ListSearchFactor from "./ListSearchFactor";
import { calcDTQueryHash, revokeResource } from "../utils";
import noop from "absol/src/Code/noop";

function ListSearchMaster() {
    this.prepare();
    this.id = randomIdent(8);
    this.cache = {};
    this.share.instances.push(this.id);
}

ListSearchMaster.prototype.share = {
    worker: null,
    instances: []
};

ListSearchMaster.prototype.prepare = function () {
    if (this.share.worker) return;
    this.share.worker = new Thread({
        methods: {
            init: ListSearchFactor
        },
        extendCode: 'init(this)'
    });
};

ListSearchMaster.prototype.transfer = function (items) {
    this.prepare();
    this.cache = {};
    return this.share.worker.invoke('transferSearchItems', this.id, items);
};


ListSearchMaster.prototype.query = function (query) {
    var key = calcDTQueryHash(query);
    if (!this.cache[key]) {
        this.cache[key] = this.share.worker.invoke('callQuery', this.id, query);
    }

    return this.cache[key];
};


ListSearchMaster.prototype.destroy = function () {
    // return;
    this.cache = {};
    this.share.worker.invoke('destroySlave', this.id);
    var idx = this.share.instances.indexOf(this.id);
    this.destroy = noop;
    if (idx >= 0) {
        this.share.instances.splice(idx, 1);
    }
};

ListSearchMaster.prototype.revokeResource = function () {
};


export default ListSearchMaster;