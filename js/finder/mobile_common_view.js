
theme.noneIconButton = function(params){
    var res = absol.buildDom({
        tag: "flexiconbutton",
        style: {
            minWidth: "var(--button-min-width)",
            height: "var(--button-height)",
            fontSize: "var(--button-title-font-size)",
            fontWeight: "var(--button-title-font-weight)"
        },
        on: {
            click: params.onclick
        },
        props:{
            text: params.text
        }
    });
    if (params.className) res.addClass(params.className);
    return res;
};

theme.mobileInitBack = function(){
    if (window.backLayoutFunc.length > 1){
        hr.menu.loadPage(window.backLayoutFunc[window.backLayoutFunc.length - 2].pageNumber, "hidden");
    }
    else {
        hr.menu.loadPage(1000, "hidden");
    }
    window.backLayoutFunc.pop();
};

theme.formSelectPartner = function(params){
    var inputsearchbox = absol.buildDom({
        tag:'searchcrosstextinput',
        style: {
            display: "block",
            width: "100%",
            marginBottom: "var(--control-verticle-distance-2)"
        },
        props: {
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
        style: {
            display: "block",
            width: "100%",
            marginBottom: "var(--control-verticle-distance-2)"
        },
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
        style: {
            display: "block",
            width: "100%",
            marginBottom: "var(--control-verticle-distance-2)"
        },
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
    params.data_container.style.maxHeight = "calc(90vh - 250px)";
    params.data_container.style.width = "100%";
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
                        partner_class_select,
                        nation_cities_select,
                        inputsearchbox
                    ]
                }),
                params.data_container
            ]
        }),
        buttonlist: [
            {
                text: LanguageModule.text("txt_ok"),
                type: "primary",
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
    console.log(params);
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
        if (value == 0) {
            absol.$("." + timeClass, params.container, function(elt){
                console.log(elt);
                elt.style.display = "inline-block";
            });
        }
        else {
            absol.$("." + timeClass, params.container, function(elt){
                console.log(elt);
                elt.style.display = "none";
            });
        }
    };
    var cbb = absol._({
        tag: "mselectmenu",
        style: {
            display: "block",
            width: "100%"
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
        }
    };

    return retval;

};

theme.checkinPartnerForm = function(host){
    if (data_module.employeeOfMe.length == 0){
        ModalElement.alert({message: LanguageModule.text("war_user_not_link_employee")});
        return;
    }
    var showLocation = function(position){
        viewer.value = position;
        var drawList = function(){
            DOMElement.removeAllChildren(list_ctn);
            if (!host.load_partner_done){
                setTimeout(function(){
                    drawList();
                }, 50);
                return;
            }
            else {
                var listPartner = [];
                var lat = position.latitude;
                var lng = position.longitude;
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
                    list_ctn.appendChild(DOMElement.div({
                        children: [
                            DOMElement.div({attrs: {style: {height: "30px"}}, text: LanguageModule.text("war_txt_there_is_no_available_partner_to_check_in")}),
                            DOMElement.div({attrs: {style: {height: "30px"}}, text: LanguageModule.text("txt_your_gps") + ": " + lat +"," + lng})
                        ]
                    }));
                    copyBtn.style.display = "";
                    copyBtn.onclick = function(){
                        absol.clipboard.copyText(lat +"," + lng);
                    };
                    FormClass.api_call({
                        url: "hr_system_debugs_save.php",
                        params: [{name: "data", value: EncodingClass.string.fromVariable({
                            userid: systemconfig.userid,
                            time: new Date(),
                            task: "checkin_partner",
                            content: lat +"," + lng
                        })}],
                        func: function(success, message){
                            if (success){
                                if (message.substr(0, 2) == "ok"){
                                    // TODO:
                                }
                                else {
                                    // ModalElement.alert({message: message});
                                }
                            }
                            else {
                                // ModalElement.alert({message: message});
                            }
                        }
                    });
                    return;
                }
                var value = 0;
                var data = [];
                var highlightContent = function(row) {
                    if (row !== undefined) {
                        if (oldHighlightedRow !== row) {
                            for (i = 0; i < oldHighlightedRow.childNodes.length; i++) {
                                oldHighlightedRow.childNodes[i].style.backgroundColor = null;
                            }
                            for (i = 0; i < row.childNodes.length; i++) {
                                row.childNodes[i].style.backgroundColor = "#bfbfbf";
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
                                    checkingps: position.latitude + "," + position.longitude,
                                    checkin_follow_gps: 1,
                                    checkintime: new Date()
                                };
                                var x = me;
                                while (x.tagName.toLowerCase() !== "tr") x = x.parentElement;
                                highlightContent(x);
                            }
                        },
                        text: item.name
                    }]);
                });
                checkinBtn.style.display = "";
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
            }
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
        host.latLngScope = absol.measurements.latLngRectFromCenter(position, hr.maximumDistance/1000);
        data_module.loadPartnerGPSList(host).then(function(values){
            host.load_partner_done = true;
        });
        drawListPre();
    };

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
                        theme.mobileInitBack();
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
    if (window.isApp){
        var getLocation = function(){
            mobileHost.getLocation(function(value){
                if (value == null){
                    ModalElement.alert({message: LanguageModule.text("war_txt_devices_not_supported_gps")});
                    return;
                }
                else {
                    showLocation(value);
                }
            });
        };
        var isPriv = mobileHost.checkLocationPermission();
        if (isPriv){
            getLocation();
        }
        else {
            mobileHost.requestLocationPermission(function(value){
                if (value) getLocation();
                else {
                    ModalElement.alert({message: LanguageModule.text("war_txt_devices_not_supported_gps")});
                }
            });
        }
    }
    else {
        if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
                showLocation(position.coords);
            }, function(err){
                if (err) ModalElement.alert({message: err.message});
            });
        }
        else {
            ModalElement.close(-1);
            ModalElement.alert({message: "Geolocation is not supported by this browser."});
        }
    }
    var list_ctn = DOMElement.div({});
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className: "material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_partner_checkin")
        },
        on: {
            action: function(){
                theme.mobileInitBack();
            }
        }
    });
    var checkinBtn = hr.button.primaryButton({
        text: LanguageModule.text("txt_checkin"),
        onclick: function(){
            checkin();
        }
    });
    var copyBtn = hr.button.primaryButton({
        text: LanguageModule.text("txt_copy_gps")
    });
    copyBtn.style.display = "none";
    checkinBtn.style.display = "none";
    var viewer = absol.buildDom({
        tag: 'locationview',
        style: {
            height: 'calc(var(--body-height) - 250px)'
        },
        props: {
            zoom: 16
        }
    });
    var singlePage = absol.buildDom({
        tag: 'tabframe',
        child: [
            header,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content"
                },
                children: [
                    list_ctn,
                    DOMElement.div({
                        attrs: {
                            style: {
                                display: "grid",
                                "grid-template-columns":  'auto auto',
                                "column-gap": "var(--distance-4)",
                                "align-items": "center",
                                paddingTop: "var(--distance-5)",
                                paddingBottom: "var(--distance-5)"
                            }
                        },
                        children: [
                            checkinBtn,
                            copyBtn,
                            hr.button.secondaryButton({
                                text: LanguageModule.text("txt_cancel"),
                                onclick: function(){
                                    theme.mobileInitBack();
                                }
                            })
                        ]
                    }),
                    DOMElement.div({
                        children: viewer
                    })
                ]
            })
        ]
    });
    host.holder.addChild(host.frameList);
    host.frameList.addChild(singlePage);
    singlePage.requestActive();
};

theme.checkinForm = function(host){
    if (data_module.employeeOfMe.length == 0){
        ModalElement.alert({
            message: LanguageModule.text("war_txt_you_need_to_link_with_an_employee_in_organization_chart_to_use_app_functions"),
            func: function(){
                theme.mobileInitBack();
            }
        });
        return;
    }
    ModalElement.show_loading();
    data_module.loadEmployeeCheckinByApp(function(content){
        ModalElement.close(-1);
        if ((content.checkin_by_phone.length == 0) || (content.status !== 1)){
            ModalElement.alert({
                message: LanguageModule.text("war_txt_not_check_in_using_the_app_yet"),
                func: function(){
                    theme.mobileInitBack();
                }
            });
            return;
        }
        var checkin_by_phone_list = content.checkin_by_phone.split(";");
        host.methods = [];
        host.hasOther = false;
        checkin_by_phone_list.forEach(function(item){
            switch (item) {
                case "other":
                    host.methods.push({value: "other", text: LanguageModule.text("txt_other") + "            "});
                    host.hasOther = true;
                    break;
                case "project":
                    host.methods.push({value: "project", text: LanguageModule.text("txt_projects") + "            "});
                    break;
                default:

            }
        });
        host.take_a_photo = content.take_a_photo;
        var projectSelected;
        var drawList = function(){
            DOMElement.removeAllChildren(list_ctn);
            if (!host.load_project_done){
                setTimeout(function(){
                    drawList();
                }, 50);
                return;
            }
            else {
                ModalElement.close(-1);
                var listProject = [];
                var lat = positionData.latitude;
                var lng = positionData.longitude;
                var distance, res;
                var dic1 = contentModule.makeDictionaryIndex(host.database.projects.items);
                var dic2 = contentModule.makeDictionaryIndex(host.database.geopos.items);
                var k1, k2;
                for (var i = 0; i < host.database.geopos_projects.items.length; i++){
                    k1 = dic1[host.database.geopos_projects.items[i].projectid];
                    k2 = dic2[host.database.geopos_projects.items[i].geoid];
                    if ((k1 >= 0) && (k2 >= 0)){
                        res = contentModule.getGPSByString(host.database.geopos.items[k2].location);
                        if (!res) continue;
                        distance = contentModule.calcCrow(lat, lng, res.lat, res.lng);
                        if (isNaN(distance) || distance > hr.maximumDistance) continue;
                        listProject.push({
                            projectid: host.database.geopos_projects.items[i].projectid,
                            geoid: host.database.geopos_projects.items[i].geoid,
                            project_name: host.database.projects.items[k1].name,
                            geo_name: host.database.geopos.items[k2].name,
                            location: host.database.geopos.items[k2].location
                        });
                    }
                }
                DOMElement.removeAllChildren(list_ctn);
                if (listProject.length == 0){
                    checkinBtn.disabled = true;
                    list_ctn.appendChild(DOMElement.div({
                        children: [
                            DOMElement.div({attrs: {style: {height: "30px"}}, text: LanguageModule.text("war_txt_there_is_no_available_project_to_check_in")}),
                            DOMElement.div({attrs: {style: {height: "30px"}}, text: LanguageModule.text("txt_your_gps") + ": " + lat +"," + lng})
                        ]
                    }));
                    FormClass.api_call({
                        url: "hr_system_debugs_save.php",
                        params: [{name: "data", value: EncodingClass.string.fromVariable({
                            userid: systemconfig.userid,
                            time: new Date(),
                            task: "checkin_project",
                            content: lat +"," + lng
                        })}],
                        func: function(success, message){
                            if (success){
                                if (message.substr(0, 2) == "ok"){
                                    // TODO:
                                }
                                else {
                                    // ModalElement.alert({message: message});
                                }
                            }
                            else {
                                // ModalElement.alert({message: message});
                            }
                        }
                    });
                    return;
                }
                checkinBtn.disabled = false;
                var value = 0;
                var data = [];
                var highlightContent = function(row) {
                    if (row !== undefined) {
                        if (oldHighlightedRow !== row) {
                            for (i = 0; i < oldHighlightedRow.childNodes.length; i++) {
                                oldHighlightedRow.childNodes[i].style.backgroundColor = null;
                            }
                            for (i = 0; i < row.childNodes.length; i++) {
                                row.childNodes[i].style.backgroundColor = "var(--table-new-row-selected)";
                            }
                            oldHighlightedRow = row;
                        }
                    }
                };
                var oldHighlightedRow = DOMElement.tr({});
                listProject.forEach(function(item, i){
                    data.push([{
                        attrs: {
                            style: {cursor: "pointer"},
                            onclick: function(event, me){
                                projectSelected = {
                                    taskid: item.projectid,
                                    geoid: item.geoid,
                                    taskgps: item.location
                                };
                                var x = me;
                                while (x.tagName.toLowerCase() !== "tr") x = x.parentElement;
                                highlightContent(x);
                            }
                        },
                        children: [
                            DOMElement.div({
                                text: item.project_name
                            }),
                            DOMElement.div({
                                attrs: {
                                    style: {
                                        fontStyle: "italic",
                                        fontSize: "0.9em",
                                        paddingTop: "5px"
                                    }
                                },
                                text: item.geo_name
                            })
                        ]
                    }]);
                });
                checkinBtn.style.display = "";
                var tableView = DOMElement.table({
                    attrs: {style: {width: "100%"}},
                    data: data
                });
                list_ctn.appendChild(DOMElement.div({
                    attrs: {className: "as-table-new"},
                    children: [tableView]
                }));
                tableView.childNodes[0].firstChild.firstChild.onclick();
                list_ctn.getValue = function(){
                    return value;
                };
            }
        };
        var drawListPre = function(){
            list_ctn.getValue = function(){
                return null;
            };
            ModalElement.show_loading();
            drawList();
        };
        var drawProjects = function(){
            if (!host.latLngScope) return;
            if (!host.loadProjects){
                host.database = {};
                data_module.loadProjectsGPSList(host).then(function(values){
                    host.load_project_done = true;
                });
                host.loadProjects = true;
            }
            drawListPre();
        };
        var showLocation = function(position){
            checkinBtn.text = LanguageModule.text("txt_checkin");
            viewer.value = position;
            host.latLngScope = absol.measurements.latLngRectFromCenter(position, hr.maximumDistance/1000);
            if (method_select.value == "project"){
                drawProjects();
            }
            else {
                checkinBtn.disabled = false;
            }
        };
        var method_select;
        var checkin = function(){
            var data = data_ctn.getValue();
            if (!data) return;
            absol.faceid.openFaceIdAuthenticationDialog({verification: host.take_a_photo, vectors: window.domainFaceRecognitions + systemconfig.userid + "_vector.dat"}).then(function(res){
                if (!res.success){
                    ModalElement.alert({message: LanguageModule.text("war_txt_face_recognition_failed")});
                    return;
                }
                if (res.verificationImage) data.take_a_photo = host.take_a_photo;
                else data.take_a_photo = 0;
                ModalElement.show_loading();
                FormClass.api_call({
                    url: "checkin_save.php",
                    params: [{name: "data", value: EncodingClass.string.fromVariable(data)}],
                    func: function(success, message){
                        ModalElement.close(-1);
                        if (success){
                            if (message.substr(0, 2) == "ok"){
                                var data = EncodingClass.string.toVariable(message.substr(2));
                                if (host.take_a_photo && res.verificationImage){
                                    data_module.updateFiles({
                                        path: ["hr", "face_recognitions", "checkin_images"],
                                        upload: [
                                            {
                                                filehandle: res.verificationImage,
                                                filename: data.id + ".jpg"
                                            }
                                        ],
                                        delete: []
                                    });
                                }
                                theme.mobileInitBack();
                                ModalElement.alert({message: "Checkin thành công"});
                            }
                            else if (message == "failed_employee"){
                                ModalElement.alert({
                                    message: LanguageModule.text("war_txt_you_need_to_link_with_an_employee_in_organization_chart_to_use_app_functions")
                                });
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
            });
        };
        var list_ctn = DOMElement.div({
            attrs: {
                style: {
                    marginTop: "var(--distance-5)",
                    padding: "var(--distance-2)",
                    border: "var(--control-border-new)",
                    borderRadius: "var(--default-radius)"
                }
            }
        });
        var drawDataCtn = function(){
            DOMElement.removeAllChildren(data_ctn);
            method_select = absol.buildDom({
                tag: "selectmenu",
                style: {
                    width: "100%",
                    size: "default"
                },
                props: {
                    items: host.methods
                },
                on: {
                    change: function(){
                        switch (this.value) {
                            case "other":
                                list_ctn.style.display = "none";
                                checkinBtn.disabled = false;
                                break;
                            default:
                                list_ctn.style.display = "";
                                drawProjects();
                        }
                    }
                }
            });
            if (host.hasOther) method_select.value = "other";
            var comment_input = absol.buildDom({
                tag: "textarea2",
                style: {
                    width: "100%",
                    height: "70px",
                    size: "default"
                }
            });
            data_ctn.appendChild(DOMElement.div({
                children: [
                    DOMElement.div({
                        attrs: {
                            className: "hr-label",
                            style: {
                                marginBottom: "var(--distance-2)"
                            }
                        },
                        text: LanguageModule.text("txt_method")
                    }),
                    method_select,
                    list_ctn,
                    DOMElement.div({
                        attrs: {
                            className: "hr-label",
                            style: {
                                marginBottom: "var(--distance-2)",
                                marginTop: "var(--distance-5)"
                            }
                        },
                        text: LanguageModule.text("txt_note")
                    }),
                    comment_input
                ]
            }));
            data_ctn.getValue = function(){
                var method = method_select.value;
                var data = {
                    method: method
                };
                var comment = comment_input.value.trim();
                data.checkingps = positionData.latitude + "," + positionData.longitude;
                switch (method) {
                    case "project":
                        if (!projectSelected){
                            ModalElement.alert({message: LanguageModule.text2("war_txt_not_yet_select", [LanguageModule.text("txt_projects")])});
                            return;
                        }
                        data.taskid = projectSelected.taskid;
                        data.taskgps = projectSelected.taskgps;
                        data.geoid = projectSelected.geoid;
                        break;
                    default:

                }
                data.comment = comment;
                return data;
            };
        };
        var positionData;
        var data_ctn = DOMElement.div({});
        var header = absol.buildDom({
            tag: 'mheaderbar',
            props: {
                actionIcon: DOMElement.i({
                    attrs: {
                        className: "material-icons"
                    },
                    text: "arrow_back_ios"
                }),
                title: LanguageModule.text("txt_work_checkin")
            },
            on: {
                action: function(){
                    theme.mobileInitBack();
                }
            }
        });
        var checkinBtn = hr.button.primaryButton({
            text: LanguageModule.text("txt_getting_gps"),
            onclick: function(){
                checkin();
            }
        });
        checkinBtn.disabled = true;
        var viewer = absol.buildDom({
            tag: 'locationview',
            style: {
                height: 'calc(var(--body-height) - 250px)'
            },
            props: {
                zoom: 16
            }
        });
        var singlePage = absol.buildDom({
            tag: 'tabframe',
            child: [
                header,
                DOMElement.div({
                    attrs: {
                        className: "card-mobile-content"
                    },
                    children: [
                        data_ctn,
                        DOMElement.div({
                            attrs: {
                                style: {
                                    display: "grid",
                                    "grid-template-columns":  '1fr 1fr',
                                    "column-gap": "var(--distance-4)",
                                    "align-items": "center",
                                    paddingTop: "var(--distance-5)",
                                    paddingBottom: "var(--distance-5)"
                                }
                            },
                            children: [
                                checkinBtn,
                                hr.button.secondaryButton({
                                    text: LanguageModule.text("txt_cancel"),
                                    onclick: function(){
                                        theme.mobileInitBack();
                                    }
                                })
                            ]
                        }),
                        DOMElement.div({
                            children: viewer
                        })
                    ]
                })
            ]
        });
        host.holder.addChild(host.frameList);
        host.frameList.addChild(singlePage);
        singlePage.requestActive();
        drawDataCtn();
        if (window.isApp){
            var getLocation = function(){
                mobileHost.getLocation(function(value){
                    if (value == null){
                        ModalElement.alert({message: LanguageModule.text("war_txt_devices_not_supported_gps")});
                        return;
                    }
                    else {
                        positionData = value;
                        showLocation(positionData);
                    }
                });
            };
            var isPriv = mobileHost.checkLocationPermission();
            if (isPriv){
                getLocation();
            }
            else {
                mobileHost.requestLocationPermission(function(value){
                    if (value) getLocation();
                    else {
                        ModalElement.alert({message: LanguageModule.text("war_txt_devices_not_supported_gps")});
                    }
                });
            }
        }
        else {
            if (navigator.geolocation){
                navigator.geolocation.getCurrentPosition(function(position){
                    positionData = position.coords;
                    showLocation(positionData);
                }, function(err){
                    if (err) ModalElement.alert({message: err.message});
                });
            }
            else {
                ModalElement.close(-1);
                ModalElement.alert({message: "Geolocation is not supported by this browser."});
            }
        }
    });
};

contentModule.drawComment = function (params){
    var drawComment = function(){
        contentModule.drawCommentInside({taskid: params.taskid, tablename: params.tablename, disabled: true}).then(function(chatBox){
            var x = chatBox.getView();
            var y = absol.$('.card-chat-box-messages-container', x);
            y.addStyle({
                position: "relative",
                left: "unset",
                top: "unset",
                right: "unset",
                bottom: "unset",
                overflowY: "visible"
            });
            comment_ctn.appendChild(y);
            hr.menu.notificationsHost.commentInputList.push({
                input: y,
                taskid: params.taskid,
                task: params.tablename
            });
        });
    };
    var drawCommentEdit = function(){
        window.backLayoutFunc.push({
            func: function(){
                params.frameList.removeLast();
                window.backLayoutFunc.pop();
            }
        });
        ModalElement.show_loading();
        contentModule.drawCommentInside(params).then(function(cBox){
            ModalElement.close(-1);
            var header = absol.buildDom({
                tag: 'mheaderbar',
                props: {
                    actionIcon: DOMElement.i({
                        attrs: {
                            className: "material-icons"
                        },
                        text: "arrow_back_ios"
                    }),
                    title: LanguageModule.text("txt_comment")
                },
                on: {
                    action: function(){
                        DOMElement.removeAllChildren(comment_ctn);
                        drawComment();
                        params.frameList.removeLast();
                        window.backLayoutFunc.pop();
                    },
                    command: function(event){
                        event.commandItem.cmd();
                    }
                }
            });
            var singlePage = absol.buildDom({
                tag: 'tabframe',
                child: [
                    header,
                    DOMElement.div({
                        attrs: {
                            className: "card-mobile-content",
                            style: {
                                padding: 0
                            }
                        },
                        children: [cBox.getView()]
                    })
                ]
            });
            params.frameList.addChild(singlePage);
            singlePage.requestActive();
        });
    };
    var comment_ctn = DOMElement.div({});
    var child = [
        {
            class: 'm-mk-section-header-name',
            child: { text: LanguageModule.text("txt_comment") }
        }
    ];
    var add_elt = absol.buildDom({
        class: 'm-mk-section-header-right',
        child: [
            DOMElement.a({
                attrs: {
                    onclick: function(){
                        drawCommentEdit();
                    }
                },
                text: LanguageModule.text("txt_add")
            })
        ]
    });
    if (!params.disabled) child.push(add_elt);
    var res = absol.buildDom({
        attr: {
            "data-sectionid": "comment"
        },
        class: "hr-right-content-box",
        style: {
            marginTop: "var(--distance-3)"
        },
        child: [
            absol.buildDom({
                style: {paddingBottom: "var(--distance-2)"},
                child: child
            }),
            DOMElement.div({
                attrs: {style: {padding: "var(--distance-3)", minHeight: "50px", borderRadius: "var(--default-radius)", border: "var(--control-border-new)"}},
                children: [comment_ctn]
            })
        ]
    });
    res.setDisabled = function(type){
        add_elt.style.display = "none";
    };
    drawComment();
    return res;
};

contentModule.questionChange = HrModalElement.questionChange;

theme.HeaderBarWithSearch = (function(){
    var _ = absol._;
    var $ = absol.$;
    function HeaderBarWithSearch(){
        var self = this;
        this.$disableSearchBtn = _({
            tag: 'button',
            class: ['am-header-bar-left-btn', 'am-header-bar-disable-search-btn'],
            child:{ tag:'i', class: 'material-icons', child:{text:'keyboard_backspace'}},
            on:{
                click: function(){
                    self.eventHandler.clickDisableSearchBtn();
                    self.$searchInput.emit("back");
                }
            }
        });
        this.addChildBefore(this.$disableSearchBtn, this.firstChild);
    }

    HeaderBarWithSearch.tag = 'headerbarwithsearch';

    HeaderBarWithSearch.render = function(data){
        var searchInput = data.searchInput;
        var res =  _('mheaderbar');
        searchInput.attr('style', undefined);
        res.$searchInput = searchInput;
        res.addChildBefore(searchInput, res.$right);
        return res;
    };

    HeaderBarWithSearch.prototype.searchMode = function(flag){
        if (this.containsClass('am-search-mode') == flag) return;
        if (flag){
            this.addClass('am-search-mode');
            this.$searchInput.focus();
            this._prevActionIcon = this.actionIcon;
        }
        else {
            this.removeClass('am-search-mode');
            this.$searchInput.blur();
            this.$searchInput.value = "";
            this.$searchInput.emit("stoptyping");
        }
        close
    };

    HeaderBarWithSearch.eventHandler = {};

    HeaderBarWithSearch.eventHandler.clickDisableSearchBtn = function(event){
        this.searchMode(false);
    };

    absol.coreDom.install(HeaderBarWithSearch);
    return HeaderBarWithSearch;
})();

ModalElement.alertNoLanguage = HrModalElement.alert;

ModalElement.showWindow = HrModalElement.showWindow;

ModalElement.alert = HrModalElement.alert;

ModalElement.question = HrModalElement.question;

ModalElement.show_loading = HrModalElement.show_loading;

ModalElement.is_loading = HrModalElement.is_loading;

ModalElement.close = function(oldfunc){
    return function(index){
        HrModalElement.close(index);
        oldfunc(index);
    }
}(ModalElement.close);
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
    return absol.buildDom({
        class: 'am-application',
        child: [
            params.tabPanel,
            params.tabBar
        ]
    });
};

theme.formPersonalProfile = function(params){
    var header = absol.buildDom({
        tag: 'mheaderbar',
        props: {
            actionIcon: DOMElement.i({
                attrs: {
                    className:"material-icons"
                },
                text: "arrow_back_ios"
            }),
            title: LanguageModule.text("txt_personal_profile"),
            commands: [
                {
                    icon:  DOMElement.i({
                        attrs: {
                            className:"material-icons"
                        },
                        text: "save"
                    })
                }
            ]
        },
        on: {
            action: params.cmdbutton.close,
            command: function(){
                params.cmdbutton.save(function(){
                    if (dataFaceRecognition){
                        DOMElement.removeAllChildren(face_recognition_status_elt_ctn);
                        face_recognition_status_elt_ctn.appendChild(DOMElement.span({
                            attrs: {
                                style: {
                                    color: contentModule.statusColorConfig[hr.face_recognition.getStatusType(-1)].text.color
                                }
                            },
                            text: LanguageModule.text(contentModule.statusColorConfig[hr.face_recognition.getStatusType(-1)].name)
                        }));
                    }
                    dataFaceRecognition = null;
                });
            }
        }
    });
    var fullname = absol.buildDom({
        tag: "textinput",
        style: {
            size: "default",
            width: "100%"
        },
        props: {
            value: params.data.fullname,
            maxU8Length: 80
        }
    });
    var username = absol.buildDom({
        tag: "textinput",
        style: {
            size: "default",
            width: "100%"
        },
        props: {
            disabled: true,
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
    var font_level_select = absol.buildDom({
        tag: 'selectmenu',
        style: {
            size: "default",
            width: "100%"
        },
        props:{
            value: params.data.font_level,
            items: contentModule.getFontLevelList()
        }
    });
    var email = absol.buildDom({
        tag: "textinput",
        style: {
            size: "default",
            width: "100%"
        },
        props: {
            value: params.data.email,
            maxU8Length: 1024
        }
    });
    var comment = absol.buildDom({
        tag: "textarea2",
        style: {
            size: "default",
            width: "100%",
            height: "100px"
        },
        props: {
            value: params.data.comment
        }
    });
    var celloldpasswordlabel = DOMElement.div({
        attrs: {
            className: "hr-label ez-label as-has-required-indicator",
            style: {
                display: "none",
                marginTop: "var(--distance-5)",
                marginBottom: "var(--distance-2)"
            }
        },
        text: LanguageModule.text("txt_old_password")
    });
    var oldpassword = absol.buildDom({
        tag: "textinput",
        style: {
            width: "100%",
            size: "default",
            display: "none"
        }
    });
    var celloldpasswordinput = oldpassword;
    var cellnewpasswordlabel = DOMElement.div({
        attrs: {
            className: "hr-label ez-label as-has-required-indicator",
            style: {
                display: "none",
                marginTop: "var(--distance-5)",
                marginBottom: "var(--distance-2)"
            }
        },
        text: LanguageModule.text("txt_new_password")
    });
    var newpassword = absol.buildDom({
        tag: "textinput",
        style: {
            width: "100%",
            size: "default",
            display: "none"
        }
    });
    var cellnewpasswordinput = newpassword;
    var cellrepasswordlabel = DOMElement.div({
        attrs: {
            className: "hr-label ez-label as-has-required-indicator",
            style: {
                display: "none",
                marginTop: "var(--distance-5)",
                marginBottom: "var(--distance-2)"
            }
        },
        text: LanguageModule.text("txt_reinput_password_new")
    });
    var repassword = absol.buildDom({
        tag: "textinput",
        style: {
            width: "100%",
            size: "default",
            display: "none"
        }
    });
    var cellrepasswordinput = repassword;
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
               //  pizo.xmlModalDragImage.createModal(document.body,function(){
               //     var src = pizo.xmlModalDragImage.imgUrl.src;
               //     params.user_avatars = src;
               //     logo_img.src = src;
               // });
            }
        },
        children: [logo_img]
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
    var childs = [
        DOMElement.div({
            attrs: {
                className: "hr-label",
                style: {
                    marginBottom: "var(--distance-2)"
                }
            },
            text: LanguageModule.text("txt_username")
        }),
        username,
        DOMElement.div({
            attrs: {
                className: "hr-label ez-label as-has-required-indicator",
                style: {
                    marginBottom: "var(--distance-2)",
                    marginTop: "var(--distance-5)"
                }
            },
            text: LanguageModule.text("txt_fullname")
        }),
        fullname,
        DOMElement.div({
            attrs: {style: {paddingTop: "var(--distance-5)"}},
            children: [DOMElement.a({
                attrs:{
                    style: {
                        cursor: "pointer",
                        color: "var(--a-color)"
                    },
                    onclick:  function(event,me){
                        if (change == 0){
                            change = 1;
                            me.text = LanguageModule.text("txt_hide_change_password");
                            celloldpasswordlabel.style.display = "";
                            celloldpasswordinput.style.display = "";
                            cellnewpasswordlabel.style.display = "";
                            cellnewpasswordinput.style.display = "";
                            cellrepasswordlabel.style.display = "";
                            cellrepasswordinput.style.display = "";
                            oldpassword.setAttribute('type', "password");
                            oldpassword.focus();
                            newpassword.setAttribute('type', "password");
                            repassword.setAttribute('type', "password");
                        }
                        else {
                            change = 0;
                            me.text = LanguageModule.text("txt_change_password");
                            celloldpasswordlabel.style.display = "none";
                            celloldpasswordinput.style.display = "none";
                            cellnewpasswordlabel.style.display = "none";
                            cellnewpasswordinput.style.display = "none";
                            cellrepasswordlabel.style.display = "none";
                            cellrepasswordinput.style.display = "none";
                            oldpassword.setAttribute('type', "text");
                            newpassword.setAttribute('type', "text");
                            repassword.setAttribute('type', "text");
                            oldpassword.value = "";
                            newpassword.value = "";
                            repassword.value = "";
                        }
                    }
                },
                text: LanguageModule.text("txt_change_password")
            })]
        }),
        celloldpasswordlabel,
        celloldpasswordinput,
        cellnewpasswordlabel,
        cellnewpasswordinput,
        cellrepasswordlabel,
        cellrepasswordinput,
        DOMElement.div({
            attrs: {
                className: "hr-label ez-label as-has-required-indicator",
                style: {
                    marginBottom: "var(--distance-2)",
                    marginTop: "var(--distance-5)"
                }
            },
            text: LanguageModule.text("txt_email")
        }),
        email,
        DOMElement.div({
            attrs: {
                className: "hr-label ez-label as-has-required-indicator",
                style: {
                    marginBottom: "var(--distance-2)",
                    marginTop: "var(--distance-5)"
                }
            },
            text: LanguageModule.text("txt_language")
        }),
        language,
        DOMElement.div({
            attrs: {
                className: "hr-label ez-label as-has-required-indicator",
                style: {
                    marginBottom: "var(--distance-2)",
                    marginTop: "var(--distance-5)"
                }
            },
            text: LanguageModule.text("txt_format_number")
        }),
        DOMElement.div({
            attrs: {style: {height: "var(--default-size)", lineHeight: "var(--default-size)"}},
            children: [use_system_settings_input]
        }),
        DOMElement.div({
            attrs: {style: {height: "var(--default-size)", lineHeight: "var(--default-size)"}},
            children: [user_settings_input]
        }),
        DOMElement.div({
            attrs: {
                className: "user-settings hr-label ez-label as-has-required-indicator",
                style: {
                    marginBottom: "var(--distance-2)",
                    marginTop: "var(--distance-5)"
                }
            },
            text: LanguageModule.text("txt_digit_group_symbol")
        }),
        DOMElement.div({
            attrs: {className: "user-settings"},
            children: [separateSign_select]
        }),
        DOMElement.div({
            attrs: {
                className: "user-settings hr-label ez-label as-has-required-indicator",
                style: {
                    marginBottom: "var(--distance-2)",
                    marginTop: "var(--distance-5)"
                }
            },
            text: LanguageModule.text("txt_decimal_symbol")
        }),
        DOMElement.div({
            attrs: {className: "user-settings"},
            children: [commaSign_select]
        })
    ];
    var face_recognition_status_elt_ctn = DOMElement.div({
        children: DOMElement.span({
            attrs: {
                style: {
                    color: contentModule.statusColorConfig[hr.face_recognition.getStatusType(params.data.face_recognition_status)].text.color
                }
            },
            text: LanguageModule.text(contentModule.statusColorConfig[hr.face_recognition.getStatusType(params.data.face_recognition_status)].name)
        })
    });
    childs.push(DOMElement.div({
        attrs: {
            style: {
                marginBottom: "var(--distance-2)",
                marginTop: "var(--distance-5)",
                display: "grid",
                gridTemplateColumns: "1fr auto"
            }
        },
        children: [
            DOMElement.span({
                attrs: {className: "hr-label"},
                text: LanguageModule.text("txt_face_recognition")
            }),
            face_recognition_status_elt_ctn
        ]
    }));
    var dataFaceRecognition;
    var face_recognition_register = function(){
        // if (window.androidHost && (localStorage.getItem("support_native_camera") !== "true")){
        //     ModalElement.alert({message: "Nhận diện khuôn mặt chưa được hỗ trợ cho hệ điều hành Android"});
        //     return;
        // }
        absol.faceid.openFaceIdEnrollmentDialog({avatar: true, verification: true}).then(function(res){
            if (res.success){
                dataFaceRecognition = {
                    avatar: res.avatar,
                    vectorsFile: res.vectorsFile,
                    verificationImage: res.verificationImage
                };
            }
            else {
                dataFaceRecognition = null;
            }
        });
    };
    switch (params.data.face_recognition_status) {
        case 0:
            childs.push(hr.button.linkButton({
                text: LanguageModule.text("txt_register"),
                onclick: function(){
                    face_recognition_register();
                }
            }));
            break;
        case 1:
        case -1:
        case 2:
            childs.push(hr.button.linkButton({
                text: LanguageModule.text("txt_re_register"),
                onclick: function(){
                    face_recognition_register();
                }
            }));
            break;

    }
    childs.push(
        DOMElement.div({
            attrs: {
                className: "hr-label",
                style: {
                    marginBottom: "var(--distance-2)",
                    marginTop: "var(--distance-5)"
                }
            },
            text: LanguageModule.text("txt_avatar")
        }),
        DOMElement.div({
            attrs: {
                align: "center",
                style: {
                    border: "1px solid #d6d6d6",
                    width: "130px",
                    borderRadius: "3px"
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
        }),
        DOMElement.div({
            attrs: {
                className: "hr-label",
                style: {
                    marginBottom: "var(--distance-2)",
                    marginTop: "var(--distance-5)"
                }
            },
            text: LanguageModule.text("txt_comment")
        }),
        comment
    );
    var singlePage = DOMElement.div({
        attrs: {style: {height: "100%"}},
        children: [
            header,
            DOMElement.div({
                attrs: {
                    className: "card-mobile-content"
                },
                children: childs
            })
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
                message: LanguageModule.text("war_no_fullname"),
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
            font_level: font_level_select.value,
            user_avatars: params.user_avatars,
            format_number: {
                type: use_system_settings_input.checked? "use_system_settings" : "user_settings",
                separateSign: separateSign_select.value,
                commaSign: commaSign_select.value
            },
            dataFaceRecognition: dataFaceRecognition
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
                    message: LanguageModule.text("txt_old_password_is_null"),
                    func: function(){
                        oldpassword.focus();
                    }
                });
                return;
            }
            if (newpassword.value.trim() == ""){
                ModalElement.alert({
                    message: LanguageModule.text("txt_password_is_null"),
                    func: function(){
                        newpassword.focus();
                    }
                });
                return;
            }
            if (newpassword.value != repassword.value) {
                ModalElement.alert({
                    message: LanguageModule.text("war_password_nomatch"),
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

theme.formConfirmPassword = function(params){
    ModalElement.showWindow({
        index: 1,
        closebutton: false,
        title: LanguageModule.text("txt_confirm_password"),
        bodycontent: DOMElement.table({
            data: [
                [
                    {},{},params.notification
                ],
                [
                    {
                        attrs: {style: {whiteSpace: "nowrap"}},
                        text: LanguageModule.text("txt_password")
                    },
                    {attrs: {style: {width: "10px"}}},
                    params.password_confirm
                ],
                [{attrs: {style: {height: "20px"}}}],
                [{
                    attrs :{
                        colSpan: 3,
                        align: "center"
                    },
                    children: [DOMElement.table({
                        data: [[
                            {
                                children: [theme.noneIconButton({
                                    onclick: params.func.ok,
                                    text: LanguageModule.text("txt_ok")
                                })]
                            },
                            {
                                attrs: {style: {width: carddone.menu.distanceButtonForm}}
                            },
                            {
                                children: [theme.noneIconButton({
                                    onclick: params.func.close,
                                    text: LanguageModule.text("txt_close")
                                })]
                            }
                        ]]
                    })]
                }]
            ]
        })
    });
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
    if (params.style !== undefined) res.style = params.style;
    if (params.value !== undefined) res.props.value = params.value;
    if (params.disabled !== undefined) res.props.disabled = params.disabled;
    if (params.onkeyup !== undefined) res.on.keyup = params.onkeyup;
    if (params.onkeydown !== undefined) res.on.keydown = params.onkeydown;
    if (params.onfocus !== undefined) res.on.focus = params.onfocus;
    if (params.onblur !== undefined) res.on.blur = params.onblur;
    if (params.align !== undefined) res.props.align = params.align;
    if (params.placeholder !== undefined) res.props.placeholder = params.placeholder;
    if (params.type !== undefined) res.props.type = params.type;
    if (params.autocomplete !== undefined) res.props.autocomplete = params.autocomplete;
    if (params.onchange !== undefined) res.props.onchange = params.onchange;
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
    host.setCountFunc = function(count){
        hr.menu.mobileTabbar.modifyItem(1001, 'counter', count);
    };
    host.getCountFunc = function(){
        return hr.menu.mobileTabbar.getItem(1001).counter;
    };
    host.closeDropdownButtonFunc = function(){
        // TODO: nothing
    };
    host.setCountFunc(host.countNotSeenAll);
};

theme.getSelectItem = function(outputMode){
    if (outputMode){
        return {value: 0, text: ""}
    }
    else {
        return {value: 0, text: LanguageModule.text("txt_select_value")};
    }
};

ModuleManagerClass.register({
    name: "Common_view",
    prerequisites: ["ModalElement"]
});
