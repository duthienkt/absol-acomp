import { _ } from '../ACore';
import Color from "absol/src/Color/Color";


/**
 * @augments {HTMLCanvasElement}
 * @augments {AElement}
 * @constructor
 */
function DataOverRGBTx() {
    this.ctx = this.getContext('2d');
    this.commands = [];
    this._state = 'none';
    this.runCommand = this.runCommand.bind(this);
}

DataOverRGBTx.tag = 'DataOverRGBTx'.toLowerCase();

DataOverRGBTx.render = function () {
    return _({
        tag: 'canvas',
        class: 'as-data-over-rgb-tx',
        attr: {
            width: 300,
            height: 300
        }
    });
};


DataOverRGBTx.prototype.begin = function () {
    this.viewColor('rgb(255, 0, 0)', 2);
    this.viewColor('rgb(255, 255, 0)', 8);
    this.viewColor('rgb(255, 0, 0)', 2);
};

DataOverRGBTx.prototype.sendBit = function (bit) {
    if (bit) {
        this.viewColor('rgb(0, 255, 255)', 2);
    }
    else {
        this.viewColor('rgb(255, 255, 0)', 2);
    }
    this.viewColor('rgb(255, 0, 0)', 2);
};

DataOverRGBTx.prototype.sendByte = function (byte) {
    for (var i = 0; i < 8; ++i) {
        this.sendBit(byte & 1);
        byte >>= 1;
    }
};

DataOverRGBTx.prototype.sendString = function (text) {
  for (var i = 0; i < text.length; ++i) {
    this.sendByte(text.charCodeAt(i));
  }
  this.sendByte(0);
  return this;
};
DataOverRGBTx.prototype.then = function (cb) {
    this.pushCmd({ type: 'cb', cb });
    return this;
}

DataOverRGBTx.prototype.viewColor = function (color, frame) {
    frame = frame || 1;
    frame *= 5 ;
    this.pushCmd({ type: 'color', value: color });
    for (var i = 1; i < frame; ++i) {
        this.pushCmd({ type: 'noop' });
    }
};

DataOverRGBTx.prototype.pushCmd = function (cmd) {
    this.commands.push(cmd);
    this.trigger();
    return this;
}

DataOverRGBTx.prototype.runCommand = function () {
    if (this.commands.length === 0) {
        this._state = 'none';
        return;
    }
    var cmd = this.commands.shift();
    if (cmd.type === 'color') {
        this.ctx.fillStyle = cmd.value;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    else if (cmd.type === 'cb') {
        //noop
        cmd.cb();
    }
    else {
        //noop
    }
    if (this.commands.length > 0) {
        requestAnimationFrame(this.runCommand);
    }
    else {
        this._state = 'none';
    }

};

DataOverRGBTx.prototype.trigger = function () {
    if (this._state === 'none') {
        this._state = 'running';
        requestAnimationFrame(this.runCommand);
    }
};


export default DataOverRGBTx;

