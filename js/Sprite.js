import ACore from "../ACore";
import Dom from "absol/src/HTML5/Dom";

var _ = ACore._;
var $ = ACore.$;

export var NOT_READY = 0;
export var READY = 1;
export var START = 2;
export var RUNNING = 3;
export var PAUSE = 4;
export var STOP = 5;
export var ERROR = 6;
export var STATE_TO_STRING = ['NOT_READY', 'READY', 'START', 'RUNNING', 'PAUSE', 'STOP', 'ERROR'];

function Sprite() {
    this.loadTextureTimeout = 5000; 
    this._textureLoaded = false;
    this._state = NOT_READY;
    this.defineEvent(['ready', 'srcerror', 'play', 'resume', 'pause', 'stop', 'reset', 'end', 'frame']);
    this._length = 60;
    this._lastDrawFrame = -1;
    this._frameIndex = 0;
    this._timeout = -1;
    this.ctx = this.getContext('2d');
    this._fps = 10;
    this._lastDrawMilis = 0;
    this._overTime = 0;
    this.draw = this.draw.bind(this);
    this.texture = null;
    this._frames = {type: 'grid', col: 1, row: 1};
    this._loop = false;
}


Sprite.cache = {};


Sprite.prototype.draw = function () {
    //todo
    var now = new Date().getTime();
    var dt = this._overTime + now - this._lastDrawMilis;
    var di = Math.floor(dt / 1000 * this._fps);
    var frameIndex = (this._frameIndex + di);
    if (this._loop) {
        frameIndex = frameIndex % this._length;
    }
    else {
        frameIndex = Math.min(this._length - 1, frameIndex);
    }

    if (!isNaN(this._frameIndex) && frameIndex != this._frameIndex) {
        this.drawFrame(this._frameIndex);
    }

    this._overTime = dt - di * 1000 / this._fps;
    var nextTime = now + 1000 / this._fps - this._overTime - new Date().getTime();
    this._lastDrawMilis = now;
    this._frameIndex = frameIndex;

    this._timeout = -1;
    if (this._loop || frameIndex + 1 < this._length)
        this._timeout = setTimeout(this.draw, nextTime);
    else this.stop();
};

Sprite.prototype.drawFrame = function (index) {
    if (this._lastDrawFrame == index) return;
    this._lastDrawFrame = index;
    this.ctx.clearRect(0, 0, this.width, this.height);
    if (this._frames.type == 'grid') {
        var imgWidth = this.texture.naturalWidth;
        var imgHeight = this.texture.naturalHeight;
        var sHeight = imgHeight / this._frames.row;
        var sWidth = imgWidth / this._frames.col;
        var sx = (index % this._frames.col) * sWidth;
        var sy = Math.floor(index / this._frames.col) * sHeight;
        this.ctx.drawImage(this.texture, sx, sy, sWidth, sHeight, 0, 0, this.width, this.height)
    }
    else {

    }
    this.emit('frame', { name: 'frame', target: this, frameIndex: index }, this);
};

Sprite.prototype.stop = function () {
    this.pause();
    if (this._state != PAUSE) return this;
    this._state = STOP;
    this.emit('stop', { name: 'stop', target: this }, this);
    return this;
};


Sprite.prototype.pause = function () {
    if (this._state != RUNNING) return this;
    this._state = PAUSE;
    if (this._timeout > 0) {
        clearInterval(this._timeout);
        this._timeout = -1;
    }
    this._state = PAUSE;
    var now = new Date().getTime();
    this._overTime += now - this._lastDrawMilis;
    this.emit('pause', { name: 'pause', target: this }, this);
};

Sprite.prototype.resume = function () {
    if (this._state != START && this._state != PAUSE) return this;
    if (this._state == RUNNING) return this;
    this._state = RUNNING;
    var now = new Date().getTime();
    this._lastDrawMilis = now;
    this.draw();
    this.emit('resume', { name: 'pause', target: this }, this);
};

Sprite.prototype.reset = function () {
    this._frameIndex = 0;
    this._overTime = 0;
}

Sprite.prototype.play = function () {
    if (this._state == ERROR) return this;
    if (this._state == RUNNING) return this;
    if (this._state == READY || this._state == STOP) {
        this.reset();
    }
    this._state = START;
    this.emit('play', { name: 'start', target: this }, this);
    this.resume();
    return this;
};

Sprite.prototype.afterReady = function () {
    var thisSprite = this;
    if (this._state == READY)
        Promise.resolve();
    else return new Promise(function (rs, rj) {
        thisSprite.once('ready', rs);
        thisSprite.once('srcerror', rj);
    });
};

Sprite.render = function () {
    return _('canvas.as-sprite');
};


Sprite.property = {};


Sprite.property.frames = {
    set: function (value) {
        this.stop();
        this._lastDrawFrame = -1;
        if (value && value.type == 'grid') {
            this._length = value.col * value.row;
        }
        this._frames = value;
        if (this._textureLoaded && this._frames && this._state == NOT_READY) {//todo: verify frame
            this._state = READY;
            this.emit('ready', { target: this, name: 'ready' }, this);
        }
    },
    get: function () {
        return this._frames;
    }
};

Sprite.property.frameIndex = {
    set: function (value) {
        value = value || 0;
        if (value < 0) value = this._length - 1;
        if (this._loop) {
            this._frameIndex = value % this._length - 1;
            this._overTime = 0;
        }
        else {
            this._frameIndex = Math.max(this._length - 1, value);
            this._overTime = 0;

        }
        this.drawFrame(this._frameIndex);
    },
    get: function () {
        return this._frameIndex;
    }
};


Sprite.property.src = {
    set: function (value) {
        this.stop();
        this._lastDrawFrame = -1;//did not draw any thing 
        value = value || [];
        var lastSrc = this._src;
        this._src = value || null;
        if (lastSrc == this._src) return;
        if (!value) this.texture = null;
        else {
            var cImage;
            if (!Sprite.cache[this._src]) {
                cImage = new Image();
                Sprite.cache[this._src] = cImage;
                cImage.src = this._src;
            }
            else {
                cImage = Sprite.cache[this._src];
            }
            this.texture = cImage;
            this._state = NOT_READY;
            var thisSprite = this;
            this._textureLoaded = false;
            Dom.waitImageLoaded(this.texture,  this.loadTextureTimeout).then(function (rs) {
                if (thisSprite.texture == cImage) {
                    thisSprite._textureLoaded = true;
                    if (thisSprite._frames) {
                        thisSprite._lastDrawFrame = -1;
                        thisSprite._state = READY;
                        thisSprite.emit('ready', { target: thisSprite, name: 'ready' }, thisSprite);
                    }
                }
            },
                function () {
                    if (thisSprite.texture == cImage) {
                        thisSprite._state = ERROR;
                        thisSprite.emit('srcerror', { target: thisSprite, name: 'srcerror' }, thisSprite);
                    }
                });
        }

    },
    get: function () {
        return this._src;
    }
}

Sprite.property.state = {
    get: function () {
        return STATE_TO_STRING[this._state];
    }
};
Sprite.property.length = {
    get: function () {
        return this._length;
    }
};

Sprite.property.fps = {
    set: function (value) {
        value = Math.max(value || 0, 0);
        this._fps = value;
        if (this._state == RUNNING) {
            clearInterval(this._timeout);
            this._timeout = -1;
            var now = new Date().getTime();
            this._overTime += now - this._lastDrawMilis;
            this._overTime = Math.min(1000 / this._fps, this._overTime);
            this.draw();
        }

    },
    get: function () {

    }
};

Sprite.property.loop = {
    set: function (value) {
        value = !!value;
        this._loop = value;
    },
    get: function () {
        return this._loop;
    }
}

ACore.install('sprite', Sprite);

export default Sprite;