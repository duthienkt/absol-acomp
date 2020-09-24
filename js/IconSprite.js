import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;


function IconSprite() {
    this.$attachhook = _('attachhook').addTo(this).on('error', this.eventHandler.attached);
    this.on('frame', this.eventHandler.frame);
    this._checkRootTimeout = 30;
    this.loop = true;
}

IconSprite.tag = 'iconsprite';


IconSprite.render = function () {
    return _('sprite', true);
};


/**
 * @type {IconSprite}
 */
IconSprite.eventHandler = {};

IconSprite.eventHandler.attached = function () {
    var thisAS = this;
    this._checkRootTimeout = 30;
    this.afterReady().then(function () {
        thisAS.width = thisAS.texture.naturalWidth;
        thisAS.height = thisAS.width;
        thisAS.frames = {
            type: 'grid',
            col: 1,
            row: thisAS.texture.naturalHeight / thisAS.texture.naturalWidth
        }
        thisAS.drawFrame(0);
        thisAS.play();
    });
};

IconSprite.eventHandler.frame = function () {
    this._checkRootTimeout--;
    if (this._checkRootTimeout == 0){
        if (this.isDescendantOf(document.body)){
            this._checkRootTimeout = 30;
        }
        else{
            this.stop();
            this.remove();
        }
    }
};

ACore.install(IconSprite);

export default IconSprite;