theme.formSelectPartner = function(params){
    var inputsearchbox = absol.buildDom({
        tag:'searchcrosstextinput',
        style: {
            width: "var(--searchbox-width)"
        },
        props:{
            placeholder: LanguageModule.text("txt_search")
        },
        on: {
            stoptyping: function(){
                params.func.filter_change_func();
            }
        }
    });
    var itemsList = contentModule.getNationCityDualSelectMenu(params);
    itemsList.forEach(function(nItem){
        nItem.items.unshift({value: 0, text: LanguageModule.text("txt_all_city")});
    });
    itemsList.unshift({
        value: 0,
        text: LanguageModule.text("txt_all_nation"),
        items: [{value: 0, text: LanguageModule.text("txt_all_city")}]
    });
    var nation_cities_select = absol.buildDom({
        tag: "dualselectmenu",
        props: {
            items: itemsList,
            enableSearch: true,
            value: [0, 0]
        },
        on: {
            change: function(){
                params.func.filter_change_func();
            }
        }
    });
    var partner_class_select = absol.buildDom({
        tag: "multicheckmenu",
        props: {
            items: contentModule.getPartnerClassFilterList(params),
            enableSearch: true,
            values: [0]
        },
        on: {
            change: function(){
                params.func.filter_change_func();
            }
        }
    });
    console.log(partner_class_select);
    params.data_container.style.maxHeight = "calc(90vh - 250px)";
    params.data_container.style.auto = "auto";
    ModalElement.showWindow({
        title: LanguageModule.text("txt_partner"),
        bodycontent: DOMElement.div({
            children: [
                DOMElement.div({
                    attrs: {
                        style: {
                            paddingBottom: "10px"
                        }
                    },
                    children: [
                        DOMElement.div({
                            attrs: {
                                className: "single-button-header"
                            },
                            children: [partner_class_select]
                        }),
                        DOMElement.div({
                            attrs: {
                                className: "single-button-header"
                            },
                            children: [nation_cities_select]
                        }),
                        DOMElement.div({
                            attrs: {
                                className: "single-button-header"
                            },
                            children: [inputsearchbox]
                        })
                    ]
                }),
                params.data_container
            ]
        }),
        buttonlist: [
            {
                type: "primary",
                text: LanguageModule.text("txt_ok"),
                onclick: function(){
                    params.func.ok();
                    ModalElement.close();
                }
            },
            {
                text: LanguageModule.text("txt_cancel"),
                onclick: function(){
                    ModalElement.close();
                }
            }
        ]
    });
    params.data_container.nation_cities_select = nation_cities_select;
    params.data_container.inputsearchbox = inputsearchbox;
    params.data_container.partner_class_select = partner_class_select;
};

contentModule.reportTimeModule = function(params){
    var display_value = params.display_value;
    var timeClass = params.class;
    var timeItems = [
        {value: 1, text: LanguageModule.text("txt_yesterday")},
        {value: 2, text: LanguageModule.text("txt_today")},
        {value: 3, text: LanguageModule.text("txt_last_week")},
        {value: 4, text: LanguageModule.text("txt_this_week")},
        {value: 5, text: LanguageModule.text("txt_last_7_days")},
        {value: 13, text: LanguageModule.text("txt_7_days_before_after")},
        {value: 15, text: LanguageModule.text("txt_30_days_before_after")},
        {value: 6, text: LanguageModule.text("txt_last_month")},
        {value: 7, text: LanguageModule.text("txt_this_month")},
        {value: 8, text: LanguageModule.text("txt_last_30_days")},
        {value: 9, text: LanguageModule.text("txt_last_quarter")},
        {value: 10, text: LanguageModule.text("txt_this_quarter")},
        {value: 11, text: LanguageModule.text("txt_last_90_days")},
        {value: 12, text: LanguageModule.text("txt_last_year")},
        {value: 14, text: LanguageModule.text("txt_this_year")},
        {value: 0, text: LanguageModule.text("txt_option")}
    ];
    var props;
    if (params.props) {
        props = params.props;
    }
    else {
        props = {};
    }
    props.items = timeItems;
    props.value = params.value.relativeTime ? params.value.relativeTime: 0;
    var displayFunc = function(value){
        if (!display_value) display_value = null;
        if (value == 0) {
            absol.$("." + timeClass, params.container, function(elt){
                // console.log(elt);
                elt.style.display = display_value;
            });
        }
        else {
            absol.$("." + timeClass, params.container, function(elt){
                // console.log(elt);
                elt.style.display = "none";
            });
        }
    };
    var cbb = absol._({
        tag: "selectmenu",
        style: {
            size: "regular"
        },
        props: {
            items: timeItems,
            value: params.value.relativeTime ? params.value.relativeTime: 0
        },
        on: {
            change: function(){
                displayFunc(cbb.value);
                start.disabled = cbb.value != 0;
                end.disabled = cbb.value != 0;
                if (params.change) params.change();
            }
        }
    });

    var start = absol._({
        tag: 'dateinput',
        style: {
            size: "regular"
        },
        props: {
            value: params.value.start,
            disabled: cbb.value != 0
        },
        on: {
            change: function(){
                if (params.change) params.change();
            }
        }
    });

    var end = absol._({
        tag: 'dateinput',
        style: {
            size: "regular"
        },
        props: {
            value: params.value.end,
            disabled: cbb.value != 0
        },
        on: {
            change: function(){
                if (params.change) params.change();
            }
        }
    });

    var retval = {
        timeElt: cbb,
        startElt: start,
        endElt: end,
        getValue: function(){
            var timeValue, startValue, endValue;
            timeValue = cbb.value;
            startValue = start.value;
            endValue = end.value;
            var rs = contentModule.generateRelativeTime({value: timeValue, from: startValue, to: endValue});
            return {
                originValue: {
                    relativeTime: timeValue,
                    start: startValue,
                    end: endValue
                },
                specificValue: {
                    start: rs.start,
                    end: rs.end
                }
            };
        },
        displayFunc: displayFunc
    };

    return retval;

};

theme.checkinPartnerForm = function(host){
    var showLocation = function(position){
        var drawList = function(){
            if (!host.load_partner_done){
                setTimeout(function(){
                    drawList();
                }, 50);
                return;
            }
            var listPartner = [];
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            var distance, res;
            for (var i = 0; i < host.database.partner.items.length; i++){
                res = contentModule.getGPSByString(host.database.partner.items[i].gps);
                if (!res) continue;
                distance = contentModule.calcCrow(lat, lng, res.lat, res.lng);
                if (isNaN(distance) || distance > hr.maximumDistance) continue;
                listPartner.push(host.database.partner.items[i]);
            }
            ModalElement.close(-1);
            DOMElement.removeAllChildren(list_ctn);
            if (listPartner.length == 0){
                ModalElement.close(-1);
                list_ctn.innerText = LanguageModule.text("war_txt_there_is_no_available_partner_to_check_in");
                return;
            }
            var value = 0;
            var data = [];
            var highlightContent = function(row){
                if (row !== undefined) {
                    if (oldHighlightedRow !== row) {
                        for (i = 0; i < oldHighlightedRow.childNodes.length; i++) {
                            oldHighlightedRow.childNodes[i].style.backgroundColor = null;
                        }
                        for (i = 0; i < row.childNodes.length; i++) {
                            row.childNodes[i].style.backgroundColor = "var(--table-light-row-background-color)";
                        }
                        oldHighlightedRow = row;
                    }
                }
            };
            var oldHighlightedRow = DOMElement.tr({});
            listPartner.forEach(function(item){
                data.push([{
                    attrs: {
                        style: {cursor: "pointer"},
                        onclick: function(event, me){
                            value = {
                                employeeid: data_module.employeeOfMe[0],
                                partnerid: item.id,
                                partnergps: item.gps,
                                checkingps: position.coords.latitude + "," + position.coords.longitude,
                                checkin_follow_gps: 1,
                                checkintime: new Date()
                            };
                            var x = me;
                            while (x.tagName.toLowerCase() !== "tr") x = x.parentElement;
                            highlightContent(x);
                            checkinBtn.disabled = false;
                        }
                    },
                    text: item.name
                }]);
            });
            list_ctn.appendChild(DOMElement.div({
                attrs: {className: "cardsimpletableclass"},
                children: [DOMElement.table({
                    attrs: {style: {width: "100%"}},
                    data: data
                })]
            }));
            list_ctn.getValue = function(){
                return value;
            };
        };
        var drawListPre = function(){
            list_ctn.getValue = function(){
                return null;
            };
            ModalElement.show_loading();
            drawList();
        };
        host.database = {};
        host.load_partner_done = false;
        host.latLngScope = absol.measurements.latLngRectFromCenter(position.coords, hr.maximumDistance/1000);
        data_module.loadPartnerGPSList(host).then(function(){
            host.load_partner_done = true;
        });
        drawListPre();
    };
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showLocation);
    }
    else {
        console.log("Geolocation is not supported by this browser.");
    }

    var checkin = function(){
        if (host.checkintime && ((new Date().getTime() - host.checkintime.getTime()) > 60000)) return;
        host.checkintime = new Date();
        var data = list_ctn.getValue();
        if (!data){
            ModalElement.alert({message: "Chưa chọn đối tác"});
            return;
        }
        var res = contentModule.getGPSByString(data.partnergps);
        var res1 = contentModule.getGPSByString(data.checkingps);
        var distance = contentModule.calcCrow(res1.lat, res1.lng, res.lat, res.lng);
        if (distance > hr.maximumDistance){
            ModalElement.alert({message: LanguageModule.text2("war_txt_checkin_distance_invalid", [hr.maximumDistance])});
            return;
        }
        ModalElement.show_loading();
        FormClass.api_call({
            url: "partner_checkin_save_auto.php",
            params: [
                {name: "data", value: EncodingClass.string.fromVariable(data)}
            ],
            func: function(success, message){
                ModalElement.close(-1);
                if (success){
                    if (message.substr(0, 2) == "ok"){
                        ModalElement.close();
                        ModalElement.alert({message: "Checkin thành công"});
                    }
                    else {
                        ModalElement.alert({message: message});
                        return;
                    }
                }
                else {
                    ModalElement.alert({message: message});
                    return;
                }
            }
        });
    };
    var list_ctn = DOMElement.div({});
    var params = {
        title: LanguageModule.text("txt_checkin"),
        bodycontent: list_ctn,
        buttonlist: [
            {
                text: LanguageModule.text("txt_checkin"),
                onclick: function(){
                    checkin();
                }
            },
            {
                text: LanguageModule.text("txt_cancel"),
                onclick: function(){
                    ModalElement.close();
                }
            }
        ]
    };
    ModalElement.showWindow(params);
    var checkinBtn = params.buttonEltList[0];
    checkinBtn.disabled = true;
};

contentModule.drawComment = function (params){
    var res;
    var comment_ctn = DOMElement.div({
        attrs: {
            style: {
                height: "30vh",
                maxHeight: "550px",
                width: "100%",
                border: "var(--control-border)",
                borderRadius: "10px",
                margin: "auto",
                overflow: "hidden"
            }
        }
    });
    if (params.new){
        var maximize = false;
        var collapseButton = DOMElement.button({
            attrs: {
                className: "maximize-comment-icon-ctn",
                onclick: function(event, me){
                    if (maximize){
                        comment_ctn.style.height = "30vh";
                        DOMElement.removeAllChildren(me);
                        me.appendChild(DOMElement.i({
                            attrs: {className: "mdi mdi-arrow-expand-vertical"}
                        }));
                    }
                    else {
                        comment_ctn.style.height = "60vh";
                        DOMElement.removeAllChildren(me);
                        me.appendChild(DOMElement.i({
                            attrs: {className: "mdi mdi-arrow-collapse-vertical"}
                        }));
                    }
                    maximize = !maximize;
                }
            },
            children: DOMElement.i({
                attrs: {className: "mdi mdi-arrow-expand-vertical"}
            })
        });
        if (params.new == 2){
            res = DOMElement.div({
                attrs: {
                    className: "mk-section-new",
                    "data-sectionid": "comment"
                },
                children: [
                    DOMElement.div({
                        attrs: {className: "mk-section-header-new"},
                        children: [
                            DOMElement.div({
                                attrs: {className: "mk-section-header-new-name"},
                                text: LanguageModule.text("txt_comment")
                            }),
                            DOMElement.div({
                                attrs: {className: "mk-section-header-new-right"},
                                children: collapseButton
                            })
                        ]
                    }),
                    DOMElement.div({
                        attrs: {className: "mk-section-body-new"},
                        children: [comment_ctn]
                    })
                ]
            });
        }
        else {
            collapseButton.classList.add("absolute");
            res = DOMElement.div({
                attrs: {style: {position: "relative"}},
                children: [
                    collapseButton,
                    comment_ctn
                ]
            });
        }
    }
    else {
        res = absol.buildDom({
            attr: {
                "data-sectionid": "comment"
            },
            child: [
                absol.buildDom({
                    class: 'mk-section-header',
                    child: [
                        {
                            class: 'mk-section-header-name',
                            child: { text: LanguageModule.text("txt_comment") },
                        }
                    ]
                }),
                comment_ctn
            ]
        });
    }
    contentModule.drawCommentInside(params).then(function(chatBox){
        comment_ctn.appendChild(chatBox.getView());
        res.setDisabled = function(type){
            chatBox.setDisabled(type);
        };
    });
    return res;
};

contentModule.questionChange = function (params) {
    HrModalElement.questionChange(params);
};

theme.deleteConfirm = function(title, message){
    return ModalElement.question({
        title: title,
        message: message
    });
};

ModalElement.alertNoLanguage = HrModalElement.alert;

ModalElement.showWindow = HrModalElement.showWindow;

ModalElement.alert = HrModalElement.alert;

ModalElement.question = HrModalElement.question;

ModalElement.show_loading = HrModalElement.show_loading;

ModalElement.is_loading = HrModalElement.is_loading;

ModalElement.close = HrModalElement.close;
ModalElement.closeAll = HrModalElement.closeAll;
ModalElement.hide = HrModalElement.hide;
ModalElement.repaint = HrModalElement.repaint;

ModalElement.show = HrModalElement.show;
theme.quickmenu = function(menuItems){
    var trigger = DOMElement.i({
        attrs: {
            className: "material-icons " +  DOMElement.dropdownclass.button,
            style: {
                fontSize: "20px",
                cursor: "pointer",
                color: "#929292"
            },
            onmouseout: function(event, me){
                me.style.color = "#929292";
            },
            onmouseover: function(event, me){
                me.style.color = "black";
            }
        },
        text: "more_vert"
    });
    absol.QuickMenu.showWhenClick(trigger, {items: menuItems}, 'auto', function (menuItem) {
        if (menuItem.cmd) menuItem.cmd();
    });
    return trigger;
};

theme.layoutInit = function(params){
    var pageElt = absol.buildDom({
        class: "card-main-body-ctn",
        child: [
            DOMElement.div({
                attrs: {
                    className: "card-main-body hr-main-body"
                },
                children: [
                    absol.buildDom({
                        class: "card-header-logo-ctn",
                        child: [
                            {
                                tag: 'img',
                                id: "company_logo_img",
                                props: {
                                    src: params.serviceLogo
                                }
                            }
                        ]
                    }),
                    params.tabPanel
                ]
            })
        ]
    });
    return pageElt;
};

theme.formPersonalProfile = function(params){
    var buttonListLeft = [
        DOMElement.div({
            attrs: {
                className: "single-button-header-new"
            },
            children: [hr.button.iconCloseButton({
                onclick: params.cmdbutton.close
            })]
        })
    ];
    var buttonListRight = [
        DOMElement.div({
            attrs: {
                className: "single-button-header-new"
            },
            children: [hr.button.iconSaveButton({
                onclick: function(){
                    params.cmdbutton.save(function(){

                    });
                }
            })]
        })
    ];
    var fullname = absol.buildDom({
        tag: "textinput",
        style: {
            minWidth: "250px",
            width: "100%",
            size: "default"
        },
        props: {
            value: params.data.fullname
        }
    });
    var username = absol.buildDom({
        tag: "textinput",
        style: {
            minWidth: "250px",
            width: "100%",
            size: "default"
        },
        disabled: true,
        props: {
            value: params.data.username
        }
    });

    var language = absol.buildDom({
        tag: 'selectmenu',
        style: {
            size: "default",
            width: "100%"
        },
        props:{
            value: params.data.language,
            items: params.data.languageList
        }
    });
    var oldpassword = absol.buildDom({
        tag: "textinput",
        style: {
            minWidth: "250px",
            width: "100%",
            size: "default"
        }
    });
    var repassword = absol.buildDom({
        tag: "textinput",
        style: {
            minWidth: "250px",
            width: "100%",
            size: "default"
        }
    });
    var newpassword = absol.buildDom({
        tag: "textinput",
        style: {
            minWidth: "250px",
            width: "100%",
            size: "default"
        }
    });
    var email = absol.buildDom({
        tag: "textinput",
        style: {
            minWidth: "400px",
            width: "100%",
            size: "default"
        },
        props: {
            value: params.data.email
        }
    });
    var comment = absol.buildDom({
        tag: "textarea2",
        style: {
            minWidth: "250px",
            width: "100%",
            size: "default"
        },
        props: {
            value: params.data.comment
        }
    });
    var celloldpassword = DOMElement.tr([
        {
            attrs: {
                className: "hr-label ez-label as-has-required-indicator",
                style: {whiteSpace: "nowrap"}
            },
            text:  LanguageModule.text("txt_old_password")
        },
        {
            attrs: {style: {width: "var(--distance-2)"}}
        },
        {
            children: [oldpassword]
        }
    ]);
    celloldpassword.style.display = "none";
    var cellrepassword = DOMElement.tr([
        {
            attrs: {
                className: "hr-label ez-label as-has-required-indicator",
                style: {whiteSpace: "nowrap"}
            },
            text:  LanguageModule.text("txt_reinput_password_new")
        },
        {
            attrs: {style: {width: "var(--distance-2)"}}
        },
        {
            attrs: {style: {paddingTop: "var(--distance-4)"}},
            children: [repassword]
        }
    ]);
    cellrepassword.style.display = "none";
    var cellnewpassword = DOMElement.tr([
        {
            attrs: {
                className: "hr-label ez-label as-has-required-indicator",
                style: {whiteSpace: "nowrap"}
            },
            text: LanguageModule.text("txt_new_password")
        },{
            attrs: {style: {width: "var(--distance-2)"}}
        },{
            attrs: {style: {paddingTop: "var(--distance-4)"}},
            children: [newpassword]
        }
    ]);
    cellnewpassword.style.display = "none";
    var logo_img = DOMElement.img({
        attrs: {
            style: {
                maxHeight: "128px",
                maxWidth: "128px",
                cursor: "pointer",
                display: "inline-block"
            },
            src: params.data.user_avatars
        }
    });
    var logo_cell = DOMElement.div({
        attrs: {
            align: "center",
            style: {
                height: "130px",
                backgroundColor: "#ffffff",
                textAlign: "center",
                cursor: "pointer",
                verticalAlign: "middle",
                display: "table-cell"
            },
            onclick: function(event, me){
                absol.openFileDialog({accept:"image/*"}).then(function (result){
                    if (!result) return;
                    var file = result[0];
                    absol.image.resizeImageFile(file, {maxWidth: 256, maxHeight: 256, resultType: "DataURI", excludeSvg: true}).then(function (result){
                        var src = result;
                        params.user_avatars = src;
                        logo_img.src = src;
                    });
                });
                // pizo.xmlModalDragImage.createModal(document.body,function(){
                //     var src = pizo.xmlModalDragImage.imgUrl.src;
                //     params.user_avatars = src;
                //     logo_img.src = src;
                // });
            }
        },
        children: [logo_img]
    });
    var buttonPanel = DOMElement.div({
        attrs: {
            className: "button-panel-header-new"
        },
        children: [
            DOMElement.div({
                attrs: {
                    className: "button-panel-header-new-left"
                },
                children: buttonListLeft
            }),
            DOMElement.div({
                attrs: {
                    className: "button-panel-header-new-right"
                },
                children: buttonListRight
            })
        ]
    });
    var textId = ("text_" + Math.random() + Math.random()).replace(/\./g, '');
    var signature_inputtext = absol.buildDom({
        tag: 'div',
        class: "container-bot",
        props: {
            id: textId
        }
    });
    function displayDetails(value){
        var listElt = absol.$$('.user-settings', singlePage);
        if (value){
            listElt.forEach(function(elt){
                elt.style.display = "";
            });
        }
        else {
            listElt.forEach(function(elt){
                elt.style.display = "none";
            });
        }
    };

    var randomName = contentModule.generateRandom();
    var use_system_settings_input = absol.buildDom({
        tag: "radio",
        style: {
            size: "default"
        },
        props: {
            name: randomName,
            value: "use_system_settings",
            text: LanguageModule.text("txt_use_system_settings"),
            checked: params.data.format_number.type == "use_system_settings"
        },
        on: {
            change: function(){
                displayDetails(!this.checked);
            }
        }
    });
    var user_settings_input = absol.buildDom({
        tag: "radio",
        style: {
            size: "default"
        },
        props: {
            name: randomName,
            value: "user_settings",
            text: LanguageModule.text("txt_user_settings"),
            checked: params.data.format_number.type == "user_settings"
        },
        on: {
            change: function(){
                displayDetails(this.checked);
            }
        }
    });
    var separateSign_select = absol.buildDom({
        tag: 'selectmenu',
        style: {
            size: "default",
            width: "100%"
        },
        props:{
            value: params.data.format_number.separateSign,
            items: contentModule.getNumberFormatSymbolItems()
        }
    });
    var commaSign_select = absol.buildDom({
        tag: 'selectmenu',
        style: {
            size: "default",
            width: "100%"
        },
        props:{
            value: params.data.format_number.commaSign,
            items: contentModule.getNumberFormatSymbolItems()
        }
    });
    var change = 0;
    var data_container = DOMElement.div({
        attrs: {
            className: "hr-body-container"
        },
        children: DOMElement.table({
            data: [
                [
                    {
                        attrs: {
                            className: "hr-label ez-label as-has-required-indicator",
                            style: {whiteSpace: "nowrap"}
                        },
                        text: LanguageModule.text("txt_username")
                    },
                    {
                        attrs: {style: {width: "var(--distance-2)"}}
                    },
                    {
                        children: [username]
                    }
                ],
                [{attrs: {style: {height: "var(--distance-4)"}}}],
                [
                    {
                        attrs: {
                            className: "hr-label ez-label as-has-required-indicator",
                            style: {whiteSpace: "nowrap"}
                        },
                        text: LanguageModule.text("txt_fullname")
                    },
                    {
                        attrs: {style: {width: "var(--distance-2)"}}
                    },
                    {
                        children: [fullname]
                    }
                ],
                [
                    {},{},
                    {
                        children: [hr.button.linkButton({
                            text: LanguageModule.text("txt_change_password"),
                            onclick: function(event,me){
                                if (change == 0){
                                    change = 1;
                                    this.text = LanguageModule.text("txt_hide_change_password");
                                    celloldpassword.style.display = "";
                                    cellrepassword.style.display = "";
                                    cellnewpassword.style.display = "";
                                    oldpassword.setAttribute('type', "password");
                                    oldpassword.focus();
                                    newpassword.setAttribute('type', "password");
                                    repassword.setAttribute('type', "password");
                                }
                                else {
                                    change = 0;
                                    this.text = LanguageModule.text("txt_change_password");
                                    celloldpassword.style.display = "none";
                                    cellrepassword.style.display = "none";
                                    cellnewpassword.style.display = "none";
                                    oldpassword.setAttribute('type', "text");
                                    newpassword.setAttribute('type', "text");
                                    repassword.setAttribute('type', "text");
                                    oldpassword.value = "";
                                    newpassword.value = "";
                                    repassword.value = "";
                                }
                            }
                        })]
                    }
                ],
                celloldpassword,
                cellnewpassword,
                cellrepassword,
                [
                    {
                        attrs: {
                            className: "hr-label ez-label as-has-required-indicator",
                            style: {whiteSpace: "nowrap"}
                        },
                        text: LanguageModule.text("txt_email")
                    },
                    {
                        attrs: {style: {width: "var(--distance-2)"}}
                    },
                    {
                        children: [email]
                    }
                ],
                [{attrs: {style: {height: "var(--distance-4)"}}}],
                [
                    {
                        attrs: {
                            className: "hr-label ez-label as-has-required-indicator",
                            style: {whiteSpace: "nowrap"}
                        },
                        text: LanguageModule.text("txt_language")
                    },
                    {
                        attrs: {style: {width: "var(--distance-2)"}}
                    },
                    {
                        children: [language]
                    }
                ],
                [{attrs: {style: {height: "var(--distance-4)"}}}],
                [
                    {
                        attrs: {
                            className: "hr-label ez-label as-has-required-indicator",
                            style: {whiteSpace: "nowrap"}
                        },
                        text: LanguageModule.text("txt_theme")
                    },
                    {
                        attrs: {style: {width: "var(--distance-2)"}}
                    },
                    {
                        children: [absol.buildDom({
                            tag: "selectmenu",
                            style: {
                                size: "default",
                                width: "100%"
                            },
                            props: {
                                value: params.data.theme,
                                items: hr.menu.themeList()
                            },
                            on: {
                                change: function(){
                                    params.func.theme_change(this.value);
                                }
                            }
                        })]
                    }
                ],
                [{attrs: {style: {height: "var(--distance-4)"}}}],
                [
                    {attrs: {colSpan: 3, style: {fontWeight: "bold"}}, text: LanguageModule.text("txt_format_number")}
                ],
                [{attrs: {style: {height: "var(--distance-4)"}}}],
                [
                    {
                        attrs: {colSpan: 3, style: {fontWeight: "bold"}},
                        children: use_system_settings_input
                    }
                ],
                [{attrs: {style: {height: "var(--distance-4)"}}}],
                [
                    {
                        attrs: {colSpan: 3, style: {fontWeight: "bold"}},
                        children: user_settings_input
                    }
                ],
                [{attrs: {className: "user-settings", style: {height: "var(--distance-4)"}}}],
                [
                    {
                        attrs: {className: "user-settings hr-label", style: {whiteSpace: "nowrap"}},
                        text: LanguageModule.text("txt_digit_group_symbol")
                    },
                    {attrs: {className: "user-settings", style: {width: "var(--distance-2)"}}},
                    {attrs: {className: "user-settings"}, children: separateSign_select}
                ],
                [{attrs: {className: "user-settings", style: {height: "var(--distance-4)"}}}],
                [
                    {
                        attrs: {className: "user-settings  hr-label", style: {whiteSpace: "nowrap"}},
                        text: LanguageModule.text("txt_decimal_symbol")
                    },
                    {attrs: {className: "user-settings", style: {width: "var(--distance-2)"}}},
                    {attrs: {className: "user-settings"}, children: commaSign_select}
                ],
                [{attrs: {style: {height: "var(--distance-4)"}}}],
                [
                    {
                        attrs: {
                            className: "hr-label"
                        },
                        text: LanguageModule.text("txt_avatar")
                    },
                    {attrs: {style: {width: "var(--distance-2)"}}},
                    {
                        children: [
                            DOMElement.div({
                                attrs: {
                                    align: "center",
                                    style: {
                                        border: "var(--control-border-new)",
                                        width: "130px",
                                        borderRadius: "var(--default-radius)",
                                        overflow: "hidden"
                                    }
                                },
                                children: [
                                    DOMElement.div({
                                        attrs: {
                                            style: {
                                                display: "table-cell"
                                            }
                                        },
                                        children: [logo_cell]
                                    })
                                ]
                            })
                        ]
                    },
                    {}
                ],
                [{attrs: {style: {height: "var(--distance-4)"}}}],
                [
                    {
                        attrs: {
                            className: "hr-label",
                            style: {whiteSpace: "nowrap"}
                        },
                        text: LanguageModule.text("txt_note")
                    },
                    {
                        attrs: {style: {width: "var(--distance-2)"}}
                    },
                    {
                        children: [comment]
                    }
                ]
            ]
        })
    });
    var singlePage = absol.buildDom({
        tag: "singlepage",
        class: ["cd-page-not-padding"],
        child: [
            DOMElement.div({
                attrs: {
                    className: "absol-single-page-header"
                },
                children: [buttonPanel]
            }),
            data_container
        ]
    });
    use_system_settings_input.emit("change");
    singlePage.getValue = function(){
        var emailadd = email.value.trim();
        if (!contentModule.filterEmail.test(emailadd)){
            ModalElement.alert({
                message: LanguageModule.text("war_txt_email_invalid"),
                func: function(){
                    email.focus();
                }
            });
            return;
        }
        if (fullname.value.trim() == ""){
            ModalElement.alert({
                message: LanguageModule.text("war_txt_no_fullname"),
                func: function(){
                    fullname.focus();
                }
            });
            return;
        }
        var data = {
            fullname: fullname.value.trim(),
            email: emailadd,
            comment: comment.value.trim(),
            language: language.value,
            user_avatars: params.user_avatars,
            format_number: {
                type: use_system_settings_input.checked? "use_system_settings" : "user_settings",
                separateSign: separateSign_select.value,
                commaSign: commaSign_select.value
            }
        };
        if (data.format_number.type == "user_settings"){
            if (data.format_number.separateSign == data.format_number.commaSign){
                ModalElement.alert({message: LanguageModule.text("war_txt_the_same_separator")});
                return;
            }
        }
        if (change == 1) {
            if (oldpassword.value.trim() == ""){
                ModalElement.alert({
                    message: LanguageModule.text("war_txt_old_password_is_null"),
                    func: function(){
                        oldpassword.focus();
                    }
                });
                return;
            }
            if (newpassword.value.trim() == ""){
                ModalElement.alert({
                    message: LanguageModule.text("war_txt_password_is_null"),
                    func: function(){
                        newpassword.focus();
                    }
                });
                return;
            }
            if (newpassword.value != repassword.value) {
                ModalElement.alert({
                    message: LanguageModule.text("war_txt_password_nomatch"),
                    func: function(){
                        repassword.focus();
                    }
                });
                return;
            }
            data.newpassword = newpassword.value.trim();
            data.oldpassword = oldpassword.value.trim();
        }
        return data;
    };
    return singlePage;
};

theme.checkbox = function(params){
    var res = {
        tag: "checkbox",
        props: {},
        on: {}
    };
    if (params.class !== undefined) res.class = params.class;
    if (params.checked !== undefined) res.props.checked = params.checked;
    if (params.disabled !== undefined) res.props.disabled = params.disabled;
    if (params.text !== undefined) res.props.text = params.text;
    if (params.cursor !== undefined) res.props.cursor = params.cursor;
    if (params.onchange !== undefined) res.on.change = params.onchange;
    return absol.buildDom(res);
};

theme.input = function(params){
    var res = {
        class: "cardsimpleInput",
        tag: "input",
        props: {},
        on: {}
    };
    if (params.type == "number") res.tag = "numberinput";
    if (params.style !== undefined) res.style = params.style;
    if (params.value !== undefined) res.props.value = params.value;
    if (params.disabled !== undefined) res.props.disabled = params.disabled;
    if (params.onkeyup !== undefined) res.on.keyup = params.onkeyup;
    if (params.onkeydown !== undefined) res.on.keydown = params.onkeydown;
    if (params.onfocus !== undefined) res.on.focus = params.onfocus;
    if (params.onblur !== undefined) res.on.blur = params.onblur;
    if (params.align !== undefined) res.props.align = params.align;
    if (params.placeholder !== undefined) res.props.placeholder = params.placeholder;
    if (params.autocomplete !== undefined) res.props.autocomplete = params.autocomplete;
    if (params.onchange !== undefined) res.on.change = params.onchange;
    return absol._(res);
};

theme.createNotificationForm = function(){
    if (!hr.menu.notificationsHost.notificationsLoaded) return;
    var host = hr.menu.notificationsHost;
    host.newNotificationSection = absol.buildDom({
        tag: "nplist",
        props: {
            moreText: LanguageModule.text("txt_see_more_old_notifications")
        },
        on: {
            more: function(){
                data_module.drawAddNotification(20);
            }
        }
    });
    host.setMoreTextFunc = function(moreText){
        host.newNotificationSection.moreText = moreText;
    };
    host.notificationDropdownButton = absol.buildDom({
        tag: 'npdropdownbutton',
        props: {
            icon: 'span.mdi.mdi-bell',
            count: host.countNotSeenAll,
            quickmenu: {
                getMenuProps: function(){
                    var itemsList = [];
                    itemsList.push({
                        text: LanguageModule.text("txt_mark_all_as_read"),
                        extendClasses: "bsc-quickmenu",
                        cmd: function(){
                            data_module.seenNotification(-1);
                            var childNodes = host.newNotificationSection.getChildNodes();
                            childNodes.forEach(function(item){
                                item.unread = false;
                            });
                        },
                        icon: 'span.mdi.mdi-bell-check'
                    });
                    return {items: itemsList};
                },
                onSelect: function(item){
                    item.cmd();
                    console.log(item);
                }
            }
        },
        on: {
            click: function(){
                data_module.seenNotification(0);
            }
        },
        child: [
            {
                tag: 'h3',
                child: {
                    text: LanguageModule.text("txt_notifications")
                }
            },
            host.newNotificationSection
        ]
    });
    host.setCountFunc = function(count){
        host.notificationDropdownButton.count = count;
    };
    host.getCountFunc = function(){
        return host.notificationDropdownButton.count;
    };
    host.closeDropdownButtonFunc = function(){
        host.notificationDropdownButton.close();
    };
    host.gptButton = absol._({
        tag: 'chatgptbutton'
    });
    hr.menu.tabPanel.notificationPanel.addChild(host.gptButton);
    hr.menu.tabPanel.notificationPanel.addChild(host.notificationDropdownButton);
};

theme.filterForm = function(params){
    var h = DOMElement.div({
        attrs: {
            className: "hr-filter-form"
        },
        children: [
            DOMElement.div({
                attrs: {
                    className: "hr-filter-form-header-ctn"
                },
                children: [
                    DOMElement.div({
                        attrs: {
                            className: "hr-filter-title"
                        },
                        text: params.title? params.title : LanguageModule.text("txt_filter_setting")
                    }),
                    DOMElement.div({
                        attrs: {
                            className: "hr-filter-form-icon-close-ctn",
                            onclick: function(){
                                bodycontent.remove();
                            }
                        },
                        children: [DOMElement.i({
                            attrs: {
                                className: "material-icons"
                            },
                            text: "clear"
                        })]
                    })
                ]
            }),
            DOMElement.div({
                attrs: {
                    className: "hr-filter-form-body-ctn"
                },
                children: [params.bodycontent]
            }),
            DOMElement.div({
                attrs: {
                    className: "hr-filter-form-footer-ctn"
                },
                children: [
                    DOMElement.div({
                        attrs: {
                            className: "hr-filter-form-footer-left"
                        },
                        children: [DOMElement.div({
                            attrs: {
                                className: "single-button-header-new"
                            },
                            children: [hr.button.linkButton({
                                text: LanguageModule.text("txt_reset"),
                                onclick: function(){
                                    params.func.reset();
                                }
                            })]
                        })]
                    }),
                    DOMElement.div({
                        attrs: {
                            className: "hr-filter-form-footer-right"
                        },
                        children: [
                            DOMElement.div({
                                attrs: {
                                    className: "single-button-header-new"
                                },
                                children: [hr.button.primaryButton({
                                    text: LanguageModule.text("txt_apply"),
                                    onclick: function(){
                                        params.func.apply();
                                        bodycontent.remove();
                                    }
                                })]
                            }),
                            DOMElement.div({
                                attrs: {
                                    className: "single-button-header-new"
                                },
                                children: [hr.button.lightButton({
                                    text: LanguageModule.text("txt_cancel"),
                                    onclick: function(){
                                        bodycontent.remove();
                                    }
                                })]
                            })
                        ]
                    })
                ]
            })
        ]
    });
    bodycontent = DOMElement.div({
        attrs: {
            className: "hr-filter-form-ctn"
        },
        children: [h]
    });
    document.body.appendChild(bodycontent);
};

theme.officeFilterForm = function(params){
    return new Promise(function(resolve, reject){
        var randomName = contentModule.generateRandom();
        var getValueFunc = function(){
            var value;
            var res = [];
            value = absol.Radio.getValueByName(randomName + "read_status");
            if (value == "all"){
                res.push("unread", "read");
            }
            else {
                res.push(value);
            }
            value = absol.Radio.getValueByName(randomName + "use_status");
            if (value == "all"){
                res.push("using", "deleted");
            }
            else {
                res.push(value);
            }
            value = absol.Radio.getValueByName(randomName + "important_status");
            if (value == "all"){
                res.push("important", "not_important");
            }
            else {
                res.push(value);
            }
            value = absol.Radio.getValueByName(randomName + "marked_star");
            if (value == "all"){
                res.push("starred", "unstarred");
            }
            else {
                res.push(value);
            }
            return res;
        };
        var setValueFunc = function(values){
            var elts;
            var readValue;
            if ((values.indexOf("read") >= 0) && (values.indexOf("unread") >= 0)){
                readValue = "all";
            }
            else if (values.indexOf("read") >= 0){
                readValue = "read";
            }
            else if (values.indexOf("unread") >= 0){
                readValue = "unread";
            }
            elts = absol.Radio.getAllByName(randomName + "read_status");
            elts.forEach(function(elt){
                if (elt.value == readValue){
                    elt.checked = true;
                }
            });
            var useValue;
            if ((values.indexOf("using") >= 0) && (values.indexOf("deleted") >= 0)){
                useValue = "all";
            }
            else if (values.indexOf("using") >= 0){
                useValue = "using";
            }
            else if (values.indexOf("deleted") >= 0){
                useValue = "deleted";
            }
            elts = absol.Radio.getAllByName(randomName + "use_status");
            elts.forEach(function(elt){
                if (elt.value == useValue){
                    elt.checked = true;
                }
            });
            var importantValue;
            if ((values.indexOf("important") >= 0) && (values.indexOf("not_important") >= 0)){
                importantValue = "all";
            }
            else if (values.indexOf("important") >= 0){
                importantValue = "important";
            }
            else if (values.indexOf("not_important") >= 0){
                importantValue = "not_important";
            }
            elts = absol.Radio.getAllByName(randomName + "important_status");
            elts.forEach(function(elt){
                if (elt.value == importantValue){
                    elt.checked = true;
                }
            });
            var markedValue;
            if ((values.indexOf("starred") >= 0) && (values.indexOf("unstarred") >= 0)){
                markedValue = "all";
            }
            else if (values.indexOf("starred") >= 0){
                markedValue = "starred";
            }
            else if (values.indexOf("unstarred") >= 0){
                markedValue = "unstarred";
            }
            elts = absol.Radio.getAllByName(randomName + "marked_star");
            elts.forEach(function(elt){
                if (elt.value == markedValue){
                    elt.checked = true;
                }
            });
        };
        var groupList = [
            {
                text: LanguageModule.text("txt_read_status"),
                name: "read_status",
                items: [
                    {
                        value: "read",
                        text: LanguageModule.text("txt_read")
                    },
                    {
                        value: "unread",
                        text: LanguageModule.text("txt_unread")
                    },
                    {
                        value: "all",
                        text: LanguageModule.text("txt_all")
                    }
                ]
            },
            {
                text: LanguageModule.text("txt_use_status"),
                name: "use_status",
                items: [
                    {
                        value: "using",
                        text: LanguageModule.text("txt_using")
                    },
                    {
                        value: "deleted",
                        text: LanguageModule.text("txt_deleted")
                    },
                    {
                        value: "all",
                        text: LanguageModule.text("txt_all")
                    }
                ]
            },
            {
                text: LanguageModule.text("txt_important_status"),
                name: "important_status",
                items: [
                    {
                        value: "important",
                        text: LanguageModule.text("txt_important")
                    },
                    {
                        value: "not_important",
                        text: LanguageModule.text("txt_not_important")
                    },
                    {
                        value: "all",
                        text: LanguageModule.text("txt_all")
                    }
                ]
            },
            {
                text: LanguageModule.text("txt_marked_star"),
                name: "marked_star",
                items: [
                    {
                        value: "starred",
                        text: LanguageModule.text("txt_starred")
                    },
                    {
                        value: "unstarred",
                        text: LanguageModule.text("txt_unstarred")
                    },
                    {
                        value: "all",
                        text: LanguageModule.text("txt_all")
                    }
                ]
            }
        ];
        var bodycontent = DOMElement.div({});
        groupList.forEach(function(item){
            var childs = [
                DOMElement.div({
                    attrs: {
                        className: "hr-filter-form-group-title"
                    },
                    text: item.text
                })
            ];
            item.items.forEach(function(cItem){
                childs.push(DOMElement.div({
                    attrs: {className: "hr-filter-form-group-radio"},
                    children: [absol.buildDom({
                        tag: "radio",
                        style: {
                            display: "block"
                        },
                        props: {
                            name: randomName + item.name,
                            value: cItem.value,
                            text: cItem.text
                        }
                    })]
                }));
            });
            bodycontent.appendChild(DOMElement.div({
                attrs: {
                    className: "hr-filter-form-group"
                },
                children: childs
            }))
        });
        theme.filterForm({
            bodycontent: bodycontent,
            func: {
                reset: function(){
                    setValueFunc(params.originValues);
                },
                apply: function(){
                    resolve(getValueFunc());
                }
            }
        });
        setValueFunc(params.values);
    });
};

theme.filterBtn = function(func){
    var filterIcon = DOMElement.i({
        attrs: {
            className: "mdi mdi-filter-outline"
        }
    });
    var res = DOMElement.button({
        attrs: {
            className: "hr-large-filter-icon-ctn",
            onclick: function(){
                func();
            }
        },
        children: [filterIcon]
    });
    res.setFiltered = function(value){
        if (value){
            DOMElement.removeAllChildren(filterIcon);
            filterIcon.appendChild(DOMElement.div({
                attrs: {
                    className: "filtered"
                }
            }))
        }
        else {
            DOMElement.removeAllChildren(filterIcon);
        }
    };
    return res;
};

theme.officeFilterIcon = function(params){
    var drawFilterForm = function(){
        theme.officeFilterForm(params).then(function(values){
            if (EncodingClass.string.compare(values, params.values)){
                params.values = values;
                params.change_func();
            }
            if (EncodingClass.string.compare(values, params.originValues)){
                filterBtn.setFiltered(true);
            }
            else {
                filterBtn.setFiltered(false);
            }
        })
    };
    var filterBtn = theme.filterBtn(function(){
        drawFilterForm();
    });
    return filterBtn;
};

theme.headerQuickmenuIcon = function(quickMenuItems){
    var qmenuButton = DOMElement.button({
        attrs: {
            className: "hr-header-quickmenu-icon-ctn"
        },
        children: [DOMElement.i({
            attrs: {
                className: "material-icons"
            },
            text: "more_vert"
        })]
    });
    absol.QuickMenu.toggleWhenClick(qmenuButton, {
        getMenuProps: function(){
            var items;
            if (typeof quickMenuItems == "function"){
                items = quickMenuItems();
            }
            else items = quickMenuItems;
            return {items: items};
        },
        onSelect: function (item){
            item.cmd();
        },
        anchor: [3, 4]
    });
    return qmenuButton;
};

theme.bodyQuickmenuIcon = function(quickMenuItems){
    var qmenuButton = DOMElement.button({
        attrs: {
            className: "hr-body-quickmenu-icon-ctn"
        },
        children: [DOMElement.i({
            attrs: {
                className: "material-icons"
            },
            text: "more_vert"
        })]
    });
    absol.QuickMenu.toggleWhenClick(qmenuButton, {
        getMenuProps: function(){
            var items;
            if (typeof quickMenuItems == "function"){
                items = quickMenuItems();
            }
            else items = quickMenuItems;
            return {items: items};
        },
        onSelect: function (item){
            item.cmd();
        },
        anchor: [3, 4]
    });
    return qmenuButton;
};

theme.statusPill = function(type){
    return DOMElement.button({
        attrs: {
            className: "hr-status-pill",
            style: {
                backgroundColor: contentModule.statusColorConfig[type].text.color + "33",
                border: "1px solid" + contentModule.statusColorConfig[type].text.color
            }
        },
        children: [DOMElement.span({
            attrs: {
                style: {
                    color: contentModule.statusColorConfig[type].text.color
                }
            },
            text: LanguageModule.text(contentModule.statusColorConfig[type].name)
        })]
    });
};

theme.getSelectItem = function(outputMode){
    if (outputMode){
        return {value: 0, text: ""}
    }
    else {
        return {value: 0, text: LanguageModule.text("txt_select_value")};
    }
};

theme.filterIconInsideTable = function(params){
    var filteredDiv = absol._({});
    var filter = absol._({
        class: "hr-large-filter-icon-inside-table",
        style: params.style ? params.style : {},
        child: {
            tag: 'i',
            class: ["mdi", "mdi-filter-outline"],
            child: filteredDiv,
            on: {
                click: function(){
                    if (params.onclick) params.onclick();
                }
            }
        }
    });
    if (params.hasFilter) {
        filteredDiv.addClass("filtered");
    }
    filter.setFilter = function(hasFilter) {
        if (hasFilter) filteredDiv.addClass("filtered");
        else filteredDiv.removeClass("filtered");
    };
    return filter;
};

ModuleManagerClass.register({
    name: "Common_view",
    prerequisites: ["ModalElement"]
});
