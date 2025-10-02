import ACore, { _, $ } from "../ACore";
import { hitElement } from "absol/src/HTML5/EventEmitter";
import { SpinnerIco } from "./Icons";

function ChatGPTButton() {
    this.$dropwdown = _({
        class: ['as-dropdown-box-common-style', 'as-chat-gpt-dropdown'],
        child: [
            {
                class: 'as-chat-gpt-content-ctn',
            },
            {
                class: 'as-chat-gpt-pending',
                child:{
                    child:[
                        {tag:'span', child: {text:"Đang phản hồi "}},
                        {tag: SpinnerIco}
                    ]
                }

            },
            {
                class: 'as-chat-gpt-input-ctn',
                child: [
                    {
                        tag: 'textarea2',
                        style: {
                            size: 'regular'
                        },
                        props: {
                            placeholder: 'Nhập câu hỏi...'
                        }
                    },
                    {
                        tag: 'button',
                        class: ['as-chat-gpt-send-btn', 'as-transparent-button'],
                        child: 'span.mdi.mdi-send'
                    }
                ]
            }
        ]
    });
    this.$input = $('textarea2', this.$dropwdown);
    this.$contentCtn = $('.as-chat-gpt-content-ctn', this.$dropwdown);
    this.$button = $('.as-np-db-btn', this);
    this.$sendBtn = $('.as-chat-gpt-send-btn', this.$dropwdown);
    this.dropdownCtrl = new CGBDropdownController(this);
    this.actionCtrl = new CGBActionController(this);
    this.messageCtrl = new CGBMessageController(this);
    // this.open();
    this.isLoading = false;
}

ChatGPTButton.tag = 'chatgptbutton';

ChatGPTButton.render = function () {
    return _({
        class: ['as-chat-gpt-button', 'as-np-dropdown-button'],
        child: [
            {
                tag: 'button',
                class: 'as-np-db-btn',
                child: [
                    {
                        class: 'as-np-db-icon-ctn',
                        child: 'span.mdi.mdi-robot-outline.as-np-db-icon'
                    },
                    {
                        class: 'as-np-db-count'
                    }
                ]
            },
        ]
    });
};

ChatGPTButton.prototype.apiRoot = 'https://absol.cf/chatgpt/api/';


ChatGPTButton.prototype.open = function () {
    this.dropdownCtrl.open();
};


ChatGPTButton.prototype.close = function () {
    this.dropdownCtrl.close();
};


ChatGPTButton.property = {};

ChatGPTButton.property.isLoading = {
    set: function (value) {
        if (value) {
            this.$dropwdown.addClass('as-loading');
        }
        else {
            this.$dropwdown.removeClass('as-loading');
        }
    },
    get: function () {
        return  this.$dropwdown.hasClass('as-loading');

    }
};

ACore.install(ChatGPTButton);

export default ChatGPTButton;

function CGBDropdownController(elt) {
    this.elt = elt;
    this.isOpen = false;
    this.ev_click = this.ev_click.bind(this);
    this.ev_clickOut = this.ev_clickOut.bind(this);
    this.elt.$button.on('click', this.ev_click);
}

CGBDropdownController.prototype.open = function () {
    if (this.isOpen) return;
    this.isOpen = true;
    this.elt.$dropwdown.addTo(document.body);
    this.elt.$button.addClass('as-active');
    this.elt.$button.off('click', this.ev_click);
    this.elt.$contentCtn.scrollTop = this.elt.$contentCtn.scrollHeight;
    setTimeout(() => {
        document.addEventListener('click', this.ev_clickOut);
    }, 10);
};

CGBDropdownController.prototype.close = function () {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.elt.$dropwdown.remove();
    this.elt.$button.removeClass('as-active');
    document.removeEventListener('click', this.ev_clickOut);
    setTimeout(() => {
        this.elt.$button.on('click', this.ev_click);
    }, 10);

};

CGBDropdownController.prototype.ev_click = function () {
    this.open();
};


CGBDropdownController.prototype.ev_clickOut = function (event) {
    if (hitElement(this.elt.$dropwdown, event)) return;
    this.close();
};

/**
 *
 * @param {ChatGPTButton} elt
 * @constructor
 */
function CGBActionController(elt) {
    this.elt = elt;
    this.elt.$input.on('keydown', this.ev_keydown.bind(this), true);
    this.elt.$sendBtn.on('click', this.sendQuestion.bind(this));

}

/**
 *
 * @param {KeyboardEvent} event
 */
CGBActionController.prototype.ev_keydown = function (event) {
    if (event.key === 'Enter') {
        if (!event.shiftKey && !event.ctrlKey && !event.altKey) {
            event.preventDefault();
            this.sendQuestion();
        }
    }
};

CGBActionController.prototype.sendQuestion = function () {
    if (this.elt.isLoading) return;
    var text = this.elt.$input.value.trim();
    if (text.length === 0) return;
    this.elt.$input.value = '';
    this.elt.$input.updateSize();
    this.elt.messageCtrl.userAsk(text);
};


function CGBMessageController(elt) {
    this.elt = elt;
    /**
     *
     * @type {{role, content}[]}
     */
    this.history = [];
    this.loadHistory();
    this.history.forEach((item) => {
        this.viewMessage(item.role, item.content);
    })
}

CGBMessageController.prototype.saveHistory = function () {
    var text = JSON.stringify(this.history);
    localStorage.setItem('chatgpt_history', text);
};


CGBMessageController.prototype.loadHistory = function () {
    var text = localStorage.getItem('chatgpt_history') || '[]';
    try {
        this.history = JSON.parse(text);
    } catch (e) {
        this.history = [];
    }
};

CGBMessageController.prototype.pushToHistory = function (role, content) {
    this.history.push({ role: role, content: content });
    while (this.history.length > 20) this.history.shift();
    this.saveHistory();
};

CGBMessageController.prototype.viewMessage = function (role, content) {
    var ctn = _({
        class: 'as-chat-gpt-message-wrapper',
        attr: {
            'data-role': role
        },
        child: { class: 'as-chat-gpt-message-content', child: { text: content } },
    });
    this.elt.$contentCtn.addChild(ctn);
    this.elt.$contentCtn.scrollTop = this.elt.$contentCtn.scrollHeight;
    return ctn;
}

CGBMessageController.prototype.userAsk = function (content) {
    this.pushToHistory('user', content);
    this.viewMessage('user', content);
    var apiRoot = this.elt.apiRoot;
    if (!apiRoot.endsWith('/')) apiRoot += '/';
    this.elt.isLoading = true;
    fetch(apiRoot + 'chat/index.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            history: this.history.map((it) => ({ role: it.role, content: it.content })),
            userText: content
        })
    }).then(res => res.json())
        .then(data => {
            var botText = data.text || "Không thể trả lời lúc này, vui lòng thử lại sau.";
            this.pushToHistory('assistant', botText);
            this.viewMessage('assistant', botText);
            this.elt.isLoading = false;
        }).catch(err => {
        this.elt.isLoading = false;

    });
};

