import { $, _ } from '../ACore';
import FlexiconButton from "./FlexiconButton";

function delay(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}

function GSMInput() {
    this.$connectBtn = $('.as-gsm-input-connect-btn', this).on('click', async () => {
        await this.requestPort();
        await this.test();
        var simOK = await this.checkSIM();
        if (simOK) {
            await this.sendSMS("0363844698", "Hello, this is test sms!, from Keeview dev")
        }
    });
}

GSMInput.tag = 'GSMInput';

GSMInput.render = function () {
    return _({
        class: 'as-gsm-input',
        child: [
            {
                class: 'as-gsm-input-header',
                child: [
                    {
                        tag: FlexiconButton,
                        class: 'as-gsm-input-connect-btn',
                        props: {
                            text: "Connect"
                        }
                    }
                ]
            }
        ]
    });
};

GSMInput.prototype.sendCommand = async function (command) {
    if (!this.writer) return '';
    command += "\r";
    await this.writer.write(command);
    console.log(`snd> ${command}`);
    await delay(100);
    var st = '';
    var t;
    var idx = -1;
    while ((st.indexOf('OK') < 0 && st.indexOf('ERROR') < 0&&st.indexOf('>') < 0) ||( idx < 0)||(!st.endsWith('\n') &&!st.endsWith('\r')&&!st.endsWith('>'))) {
        await delay(100);
        t = await this.reader.read();
        console.log(`rev< ${t.value}`)
        st += t.value;
        if (idx < 0) {
            idx = st.indexOf(command);
            if (idx >= 0) {
                st = st.substring(idx + command.length);
                st.trimStart();
            }
        }
    }
    st = st.trim();
    console.log('===',[st]);
    return st;
}


GSMInput.prototype.test = async function () {
    if (!this.writer) return false;
    var st = await this.sendCommand('AT');
    return st.indexOf('OK') >= 0;
};


GSMInput.prototype.checkSIM = async function () {
    if (!this.writer) return false;
    var st = await this.sendCommand('AT+cpin?');
    return st.indexOf('OK') >= 0;
};

GSMInput.prototype.sendSMS = async function (phone, message) {
    if (!this.writer) return false;
    var st = '';
    st = await this.sendCommand('AT+CMGF=1');
    if (st.indexOf('OK') < 0) return false;
    // st = await this.sendCommand('AT+CSCS="GSM"');
    st = await this.sendCommand(`AT+CMGS="${phone}"`);
    if (st.indexOf('>') < 0) return false;
    console.log("Send message" +
        "")
    await this.writer.write(message + String.fromCharCode(26));
    await delay(1000);
    st = '';
    while (!st.includes('OK') && !st.includes('ERROR')) {
        var t = await this.reader.read();
        st += t.value;
        console.log(st);
        await delay(100);
    }
    return st.indexOf('OK') >= 0;
};

GSMInput.prototype.requestPort = function () {
    if (!navigator.serial) return Promise.resolve();
    return navigator.serial.requestPort().then(port => {
        return port.open({ baudRate: 115200 }).then(() => port);
    }).then(port => {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        this.reader = textDecoder.readable.getReader();

        const textEncoder = new TextEncoderStream();
        const writableStreamClosed = textEncoder.readable.pipeTo(port.writable);
        this.writer = textEncoder.writable.getWriter();
    }, err => {
        this.reader = null;
        this.writer = null;
        console.error(err.message)
    });
};


export default GSMInput;