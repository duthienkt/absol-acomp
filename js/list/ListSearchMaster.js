import { randomIdent } from "absol/src/String/stringGenerate";
import Thread from "absol/src/Network/Thread";
import ListSearchFactor from "./ListSearchFactor";
import { calcDTQueryHash, revokeResource } from "../utils";

function ListSearchMaster() {
    this.prepare();
    this.id = randomIdent(8);
    this.cache = {};
}

ListSearchMaster.prototype.share = {
    worker: null
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
    this.cache = {};
    this.share.worker.invoke('destroySlave', this.id);
}

export default ListSearchMaster;