import EventEmitter from 'absol/src/HTML5/EventEmitter';
import ACore from '../ACore';
import AElement from "absol/src/HTML5/AElement";

var _ = ACore._;
var $ = ACore.$;

/***
 * @extends AElement
 * @constructor
 */
function FollowerToggler() {
    this.defineEvent(['close', 'open', 'preopen']);
    this.on('click', this.eventHandler.click);
    this.addClass('as-follower-trigger');
    this.$follower = null;
    this._opened = false;
}

FollowerToggler.tag = 'FollowerToggler'.toLowerCase();

FollowerToggler.render = function () {
    return _('div');
};

FollowerToggler.prototype.toggle = function () {
    if (this._opened) this.close();
    else this.open();
};

FollowerToggler.prototype.open = function () {
    if (this._opened) return;
    this._opened = true;
    this.addClass('as-follower-trigger-open');
    if (!this.$follower) return;
    this.emit('preopen', { name: 'preopen', target: this }, this);
    var thisTg = this;
    setTimeout(function () {
        thisTg.$follower.refollow();
        thisTg.$follower.removeClass('absol-follower-hidden');
        document.body.addEventListener('click', thisTg.eventHandler.clickBody);
        thisTg.emit('open', { name: 'open', target: this }, this);
    }, 1);
};

FollowerToggler.prototype.close = function () {
    if (!this._opened) return;
    this._opened = false;
    this.removeClass('as-follower-trigger-open');
    if (!this.$follower) return;
    this.$follower.unfollow();
    this.$follower.addClass('absol-follower-hidden');
    document.body.removeEventListener('click', this.eventHandler.clickBody);
    this.emit('close', { name: 'close', target: this }, this);
};


FollowerToggler.prototype.bindFollower = function (elt) {
    if (this.$follower) {
        this.$follower.followTarget = null;
    }
    if (elt && elt.refollow) {
        if (this._opened)
            elt.removeClass('absol-follower-hidden');
        else
            elt.addClass('absol-follower-hidden');
        elt.followTarget = this;
        this.$follower = elt;
    }
    else {
        throw new Error("Must be a follower!");
    }
}

FollowerToggler.eventHandler = {};

FollowerToggler.eventHandler.clickBody = function (event) {
    if (EventEmitter.hitElement(this, event) || EventEmitter.hitElement(this.$follower, event))
        return;
    this.close();
};


FollowerToggler.eventHandler.click = function () {
    this.toggle();
};

ACore.install(FollowerToggler);

export default FollowerToggler;