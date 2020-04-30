import ACore from "../ACore";

var _ = ACore._;
var $ = ACore.$;

function MLeftNavigator() {
    this.on('dragstart', this.eventHandler.modalDragStart)
        .on('drag', this.eventHandler.modalDrag)
        .on('dragend', this.eventHandler.modalDragEnd);
    this.$content = $('.as-m-navigator-content', this);
    this.$modal = $('.as-m-navigator-modal', this);
    this._contentWidth = 0;

    this._speedTimeout = -1;
    this._dragSpeed = 0;
    this._preDragTime = 0;
    this._state = -1;
}

MLeftNavigator.render = function () {
    return _({
        tag: 'hanger',
        class: 'as-m-navigator',
        child: [
            '.as-m-navigator-modal',
            '.as-m-navigator-content'
        ]
    });
};


['addChild', 'addChildBefore', 'addChildAfter', 'clearChild', 'findChildBefore', 'findChildAfter', 'removeChild'].forEach(function (key) {
    MLeftNavigator.prototype[key] = function () {
        return this.$content[key].apply(this.$bodyContainer, arguments);
    };
});

MLeftNavigator.prototype.getChildNodes = function(){
    return this.$modal.childNodes;
};

MLeftNavigator.prototype.open = function (v0) {
    if (this._state == 1) return;
    v0 = v0 || 1000;
    v0 = Math.max(400, Math.min(4000, v0));
    var ctBound = this.$content.getBoundingClientRect();
    var dx = - ctBound.left;
    var dt = Math.sqrt(2 * dx / v0) / 2;
    this.$content.addStyle('transition', 'right ease-out ' + dt + 's');
    this.$modal.addStyle('transition', 'opacity ease-out ' + dt + 's');
    console.log('opacity ease-out ' + dt + 's');

    this.$content.addStyle('right', 'calc(100% - ' + ctBound.width + 'px)');
    this.$modal.addStyle('opacity', '0.5');

    this.addClass('as-open');
    var thisnm = this;
    this._state = -1;
    setTimeout(function () {
        thisnm._state = 1;
        thisnm.$content.removeStyle('transition');
        thisnm.$modal.removeStyle('transition');
    }, dt * 1000 + 1);
};

MLeftNavigator.prototype.close = function (v0) {
    if (this._state == 0) return;
    v0 = v0 || 0;
    v0 = v0 || 1000;
    v0 = Math.max(400, Math.min(4000, v0));

    var ctBound = this.$content.getBoundingClientRect();
    var dx = ctBound.right;
    var dt = Math.sqrt(2 * dx / v0) / 2;
    this.$content.addStyle('transition', 'right ease-out ' + dt + 's');
    this.$modal.addStyle('transition', 'opacity ease-out ' + dt + 's');
    this.$content.addStyle('right', '100%');
    setTimeout(this.$modal.addStyle.bind(this.$modal, 'opacity', '0.001'), 4);
    // this.$modal.addStyle('opacity', '0.001');

    var thisnm = this;
    this._state = 0;

    setTimeout(function () {
        thisnm._state = -1;
        thisnm.$content.removeStyle('transition');
        thisnm.$modal.removeStyle('transition');
        thisnm.removeClass('as-open');
    }, dt * 1000 + 1);
};



/** 
 * @type {MLeftNavigator}
 */
MLeftNavigator.eventHandler = {};

MLeftNavigator.eventHandler.modalDragStart = function (event) {
    this.addClass('as-dragging');
    this._contentWidth = this.$content.getBoundingClientRect().width;
    this._preDragTime = new Date().getTime();
    this._preMoveDistance = 0;
    this._dragSpeed = 0;
    this._preX = event.clientX;
    var moveVec = event.currentPoint.sub(event.startingPoint);
    if (Math.abs(moveVec.x) > 3) event.preventDefault();
};

MLeftNavigator.eventHandler.modalDrag = function (event) {
    var thisnm = this;
    var now = new Date().getTime();
    if (now - this._preDragTime > 10) {
        var dt = now - this._preDragTime;
        this._dragSpeed = (event.clientX - this._preX) * 1000 / dt;
        this._preDragTime = now;
        this._preX = event.clientX;
    }

    if (this._speedTimeout > 0) {
        this._speedTimeout = -1;
    }

    this._speedTimeout = setTimeout(function () {
        thisnm._dragSpeed = 0;
    }, 200);

    var moveVec = event.currentPoint.sub(event.startingPoint);
    var dx;
    if (this._state != 0) {
        event.preventDefault();
        if (this._state == -1) {
            dx = Math.max(0, Math.min(moveVec.x, this._contentWidth));

        }
        else if (this._state == 1) {
            dx = Math.max(0, Math.min(this._contentWidth + moveVec.x, this._contentWidth));
        }
        this.$content.addStyle({
            right: 'calc(100% - ' + (dx) + 'px)'
        });
        this.$modal.addStyle('opacity', (dx / this._contentWidth / 2) + '');
    }

    // this.$modal.addStyle('opacity', dx / this._contentWidth / 2 +'')
};


MLeftNavigator.eventHandler.clickModal = function (event) {
    if (event.target == this.$modal)
        this.close();
};

/**
 * throwing_speed 400px/s
 * 
 */
MLeftNavigator.eventHandler.modalDragEnd = function () {
    this.removeClass('as-dragging');
    var ctBound = this.$content.getBoundingClientRect();
    if (this._dragSpeed > -200 || (ctBound.right > ctBound.width / 2 && this._dragSpeed >= 0)) {
        this.open(this._dragSpeed);
    }
    else if (this._dragSpeed < -200 || (ctBound.right < ctBound.width / 2 && this._dragSpeed <= 0)) {
        this.close(-this._dragSpeed);
    }
};




ACore.install('mleftnavigator', MLeftNavigator);

export default MLeftNavigator;