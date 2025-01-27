import ACore, { _ } from "../ACore";
import Element from "absol/src/HTML5/Element";
import AElement from "absol/src/HTML5/Element";


/***
 * @extends {AElement}
 * @constructor
 */
function PositionTracker() {
    this.defineEvent('positionchange');
    this.$trackScrollParents = [];
    this._scrollTrackEventHandler = this.notifyPositionChange.bind(this);
}

PositionTracker.tag = 'PositionTracker'.toLowerCase();

/***
 *
 * @return {AElement}
 */
PositionTracker.render = function () {
    return _('div');
};


PositionTracker.prototype.notifyPositionChange = function (event) {
    this.emit('positionchange', { type: 'positionchange', originEvent: event });
};

PositionTracker.prototype.startTrackPosition = function () {
    if (this.$trackScrollParents.length > 0)
        this.stopTrackPosition();
    var trackElt = this;
    while (trackElt) {
        if (trackElt.addEventListener)
            trackElt.addEventListener('scroll', this._scrollTrackEventHandler, false);
        else
            trackElt.attachEvent('onscroll', this._scrollTrackEventHandler, false);

        this.$trackScrollParents.push(trackElt);
        trackElt = trackElt.parentElement;
    }
    if (document.addEventListener) {
        document.addEventListener('scroll', this._scrollTrackEventHandler, false);
    }
    else {
        document.attachEvent('onscroll', this._scrollTrackEventHandler, false);
    }
    this.$trackScrollParents.push(document);
};

PositionTracker.prototype.stopTrackPosition = function () {
    var trackElt;
    for (var i = 0; i < this.$trackScrollParents.length; ++i) {
        trackElt = this.$trackScrollParents[i];
        if (trackElt.removeEventListener)
            trackElt.removeEventListener('scroll', this._scrollTrackEventHandler, false);
        else
            trackElt.dettachEvent('onscroll', this._scrollTrackEventHandler, false);
    }
    this.$trackScrollParents = [];
};

ACore.install(PositionTracker);

export default PositionTracker;
