hr.paths.deletePath = function (host, id) {
    return new Promise(function (resolve, reject) {
        return;
        ModalElement.show_loading();
        FormClass.api_call({
            url: "paths_delete.php",
            params: [{ name: "id", value: id }],
            func: function (success, message) {
                ModalElement.close(-1);
                if (success) {
                    if (message.substr(0, 2) == "ok") {
                        var index = host.database.paths.getIndex(id);
                        host.database.paths.items.splice(index, 1);
                        resolve();
                    }
                    else if (message == "failed_used") {
                        ModalElement.alert({
                            message: LanguageModule.text("war_txt_can_not_delete")
                        });
                    }
                    else {
                        ModalElement.alert({ message: message });
                    }
                }
                else {
                    ModalElement.alert({ message: message });
                }
            }
        });
    });
};

hr.paths.deletePathConfirm = function (host, id) {
    return new Promise(function (resolve, reject) {
        return;
        var index = host.database.paths.getIndex(id);
        ModalElement.question({
            title: LanguageModule.text("war_title_delete_path"),
            message: LanguageModule.text2("war_txt_detele", [host.database.paths.items[index].name]),
            onclick: function (sel) {
                if (sel == 0) {
                    hr.paths.deletePath(host, id).then(function (value) {
                        resolve(value);
                    });
                }
            }
        });
    });
};


/*********************************** NEW CODE *****************************************************/

hr.paths.highlightRow = function () {
};
hr.paths.redrawPathDetails = function () {
};

hr.paths.PathsFileSystem = function PathsFileSystem() {
    absol.FinderFileSystem.call(this);
    absol.EventEmitter.call(this);

    this.cache = {
        readDir: {},
        stat: {},
        pathOfDirId: {},
        pathOfFileId: {},
        rawDirs: null,
        rawFiles: null
    }
    this.sync = this._loadInit();
}

absol.OOP.mixClass(hr.paths.PathsFileSystem, absol.FinderFileSystem, absol.EventEmitter);


hr.paths.PathsFileSystem.prototype.clearCache = function () {
    this.sync = this.sync.then(function () {
        this.cache = {
            readDir: {},
            stat: {},
            pathOfDirId: {},
            pathOfFileId: {},
            rawDirs: null,
            rawFiles: null
        }
        return this._loadInit();
    }.bind(this));
};


hr.paths.PathsFileSystem.prototype.reindex = function () {
    var cache = this.cache;
    cache.readDir = {};
    cache.stat = {};
    cache.pathOfDirId = { '0': 'd0' };
    cache.pathOfFileId = {};
    var pathById = cache.rawDirs.reduce(function (ac, cr) {
        ac[cr.id] = cr;
        return ac;
    }, {});
    var fileById = cache.rawFiles.reduce(function (ac, cr) {
        ac[cr.id] = cr;
        return ac;
    }, {});

    function makePathOfDir(id) {
        if (!(id in cache.pathOfDirId)) {
            if (!pathById[id]) return '/__trash__';
            cache.pathOfDirId[id] = [makePathOfDir(pathById[id].parentid), 'd' + id].join('/');
        }
        return cache.pathOfDirId[id];
    }

    function makePathOfFile(id) {
        if (!(id in cache.pathOfFileId)) {
            cache.pathOfFileId[id] = [makePathOfDir(fileById[id].pathid), 'f' + id].join('/');
        }
        return cache.pathOfFileId[id];
    }

    cache.rawDirs.forEach(function (it) {
        makePathOfDir(it.id);
    });

    cache.rawFiles.forEach(function (it) {
        makePathOfFile(it.id);
    });

    cache.readDir = {};
    cache.rawDirs.forEach(function (it) {
        cache.readDir['d' + it.parentid] = cache.readDir['d' + it.parentid] || [];
        cache.readDir['d' + it.parentid].push('d' + it.id);
        var stat = {
            raw: it,
            isDirectory: true,
            name: 'd' + it.id,
            displayName: it.name,
            path: cache.pathOfDirId[it.id],
            writable: it.id === -1 || systemconfig.privSystem >= 2,
            isVirtual: it.id === -1
        };
        cache.stat['d' + it.id] = stat;
        // ALogger.log(stat);
    });

    cache.rawFiles.forEach(function (it) {
        var imgHref;
        if (it.file_new) {
            imgHref = window.domainFilesNew + it.id + "_" + it.name + ".upload";
        }
        else {
            imgHref = window.domainFiles + it.id + "_" + it.name + ".upload";
        }

        var stat = {
            raw: it,
            displayName: it.title,
            ctime: it.ctime,
            name: 'f' + it.id,
            url: imgHref,
            path: cache.pathOfFileId[it.id],
            writable: it.pathid === -1 || systemconfig.privSystem >= 2
        };
        cache.stat['f' + it.id] = stat;
        cache.readDir['d' + it.pathid] = cache.readDir['d' + it.pathid] || [];
        cache.readDir['d' + it.pathid].push('f' + it.id);
    });
};

hr.paths.PathsFileSystem.prototype._loadInit = function () {
    var self = this;
    ModalElement.show_loading();
    var database = {};
    var cache = this.cache;
    return new Promise(function (resolve, reject) {
        FormClass.api_call({
            url: "database_load.php",
            params: [
                { name: "task", value: "paths_load_init" }
            ],
            func: function (success, message) {
                ModalElement.close(-1);
                if (success) {
                    if (message.substr(0, 2) == "ok") {
                        var content = EncodingClass.string.toVariable(message.substr(2));
                        contentModule.makeDatabaseContent({ database: database }, content);
                        cache.rawDirs = database.paths.items;
                        cache.rawFiles = database.files.items;
                        self.reindex();
                        self.emit('ready');
                        resolve();
                    }
                    else {
                        ModalElement.alert({ message: message });
                        reject({ message: message });
                    }
                }
                else {
                    ModalElement.alert({ message: message });
                    reject({ message: message });
                }
            }
        });
    });
};

hr.paths.PathsFileSystem.prototype.readDir = function (path) {
    return this.sync.then(function () {
        return this.cache.readDir[path.split('/').pop()] || [];
    }.bind(this));
};


hr.paths.PathsFileSystem.prototype.stat = function (path) {
    return this.sync.then(function () {
        return this.cache.stat[path.split('/').pop()];
    }.bind(this));
};

hr.paths.PathsFileSystem.prototype.supporteDisplayName = true;

hr.paths.PathsFileSystem.prototype.writeFile = function (path, data, onProcess) {
    var self = this;
    var dirPath = path.split('/');
    var fileName = dirPath.pop();
    fileName = data.name || fileName;
    var pathId = parseInt(dirPath.pop().replace('d', ''));
    var files = [data];
    var listFileName = [{ name: fileName }];
    return new Promise(function (resolve) {
        FormClass.api_call({
            url: "paths_save_new_file.php",
            params: [
                {
                    name: "listFile",
                    value: EncodingClass.string.fromVariable(listFileName)
                },
                {
                    name: "pathid",
                    value: pathId
                },
                {
                    name: "file_new",
                    value: 1
                }
            ],
            func: function (success, message) {
                if (success) {
                    if (message.substr(0, 2) != "ok") {
                        throw new Error(message);
                    }
                    var st = EncodingClass.string.toVariable(message.substr(2));
                    if (typeof onProcess === "function") onProcess(0.1);
                    var uploadList = [];
                    for (var i = 0; i < files.length; i++) {
                        uploadList.push({
                            filehandle: files[i],
                            filename: st[i].id + "_" + st[i].name + ".upload"
                        });
                    }
                    data_module.updateFiles({
                        path: ["hr", "files"],
                        upload: uploadList,
                        delete: [],
                        onProcess: function () {
                            onProcess(1);
                        }
                    }).then(function (res) {
                        if (res.status) {
                            self.cache.readDir ['d' + pathId] = self.cache.readDir ['d' + pathId];
                            Array.prototype.push.apply(self.cache.rawFiles, st);
                            self.reindex();
                            resolve(st);
                        }
                    });

                }
                else {
                    throw new Error(message);
                }
            }
        });
    });
};


hr.paths.PathsFileSystem.prototype.unlink = function (path) {
    //todo: edit multiple file
    var self = this;
    return new Promise(function (resolve, reject) {
        var id = path.split('/').pop();
        id = id.replace('f', '');
        id = parseInt(id);
        var idList = [id];
        FormClass.api_call({
            url: "paths_delete_file_list.php",
            params: [{ name: "idList", value: EncodingClass.string.fromVariable(idList) }],
            func: function (success, message) {
                if (success) {
                    if (message.substr(0, 2) == "ok") {
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        var errDict = st.reduce((ac, cr) => {
                            ac[cr] = true;
                            return ac;
                        }, {});
                        var deleteList = [];
                        idList.forEach(function (id) {
                            if (errDict[id]) return;
                            var idx = self.cache.rawFiles.findIndex(function (it) {
                                return it.id + '' === id + '';
                            });
                            if (idx < 0) return;
                            var rawInfo = self.cache.rawFiles[idx];
                            var filename = rawInfo.name;
                            self.cache.rawFiles.splice(idx, 1);
                            deleteList.push(id + "_" + filename + ".upload");
                        });
                        data_module.updateFiles({
                            path: ["hr", "files"],
                            upload: [],
                            delete: deleteList
                        }).then(function (res) {
                            if (res.status) resolve();
                            else reject({ message: res.message });
                        });
                        self.reindex();
                        if (st.length > 0) {
                            reject({ message: LanguageModule.text2("war_txt_list_file_has_used", [st.length]).replace(/^.+file(s?)/, 'File') });//todo: change message
                        }
                        resolve(st);
                    }
                    else if (message == "failed_used") {
                        reject({ message: LanguageModule.text("war_txt_can_not_delete") });
                    }
                    else {
                        reject({ message: message });
                    }

                }
                else {
                    reject({ message: message });
                }
            }
        });
    });
};


/***
 *
 * @param path
 * @param name
 * @return {Promise<stat>} new file info(stat)
 */
hr.paths.PathsFileSystem.prototype.rename = function (path, name) {
    var id = parseInt(path.split('/').pop().replace('f', ''));
    var self = this;
    return new Promise(function (resolve, reject) {
        ModalElement.show_loading();
        FormClass.api_call({
            url: "paths_rename_file.php",
            params: [{ name: "data", value: EncodingClass.string.fromVariable({ id: id, title: name }) }],
            func: function (success, message) {
                if (success) {
                    if (message.substr(0, 2) == "ok") {
                        ModalElement.close(-1);
                        ModalElement.close(1);
                        var idx = self.cache.rawFiles.findIndex(function (it) {
                            return it.id === id;
                        });
                        if (idx >= 0) {
                            self.cache.rawFiles[idx].title = name;
                            self.cache.stat['f' + id].displayName = name;
                        }
                        resolve(self.cache.stat['f' + id]);
                    }
                    else {
                        ModalElement.alert({ message: message });
                    }
                }
                else {
                    ModalElement.alert({ message: message });
                }
            }
        });
    });
};

hr.paths.PathsFileSystem.prototype.mkdir = function (rawInfo) {
    var self = this;
    return new Promise(function (resolve) {
        ModalElement.show_loading();
        FormClass.api_call({
            url: "paths_save.php",
            params: [{ name: "data", value: EncodingClass.string.fromVariable(rawInfo) }],
            func: function (success, message) {
                ModalElement.close(-1);
                if (success) {
                    if (message.substr(0, 2) == "ok") {
                        rawInfo.lastmodifiedtime = new Date();
                        rawInfo.id = parseInt(message.substring(2));
                        self.cache.rawDirs.push(rawInfo);
                        self.reindex();
                    }
                    else {
                        ModalElement.alert({ message: message });
                    }
                }
                else {
                    ModalElement.alert({ message: message });
                }
                resolve();//todo: reject error

            }
        });
    });
};

hr.paths.PathsFileSystem.prototype.moveFile = function (oldPath, newPath) {
    var self = this;
    var id = parseInt(oldPath.split('/').pop().replace('f', ''), 10);
    var t = newPath.split('/');
    t.pop();
    var newparentid = parseInt(t.pop().replace('d', ''), 10);
    return new Promise(function (resolve, reject) {
        FormClass.api_call({
            url: "paths_move_file.php",
            params: [
                { name: "id", value: id },
                {
                    name: "data", value: EncodingClass.string.fromVariable({
                        id: id,
                        pathid: newparentid
                    })
                }
            ],
            func: function (success, message) {
                ModalElement.close(-1);
                if (success) {
                    if (message.substr(0, 2) == "ok") {
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        self.cache.rawFiles.some(function (it) {
                            if (it.id !== id) return false;
                            it.pathid = newparentid;
                            self.reindex();
                            return true;
                        })
                        resolve();
                    }
                    else if (message == "failed_id") {
                        reject(Object.assign(new Error(LanguageModule.text("war_txt_failed_ver_reload_data")), { command: 'reload' }));
                    }
                    else {
                        reject(new Error(message));
                    }
                }
                else {
                    reject(new Error(message));
                }
            }
        });
    });
};

hr.paths.PathsFileSystem.prototype.moveDir = function (oldPath, newPath) {
    var self = this;
    var id = parseInt(oldPath.split('/').pop().replace('d', ''), 10);
    var t = newPath.split('/');
    t.pop();
    var newparentid = parseInt(t.pop().replace('d', ''), 10);
    return new Promise(function (resolve, reject) {
        FormClass.api_call({
            url: "paths_move_path.php",
            params: [
                { name: "id", value: id },
                {
                    name: "data", value: EncodingClass.string.fromVariable({
                        id: id,
                        parentid: newparentid
                    })
                }
            ],
            func: function (success, message) {
                ModalElement.close(-1);
                if (success) {
                    if (message.substr(0, 2) == "ok") {
                        var st = EncodingClass.string.toVariable(message.substr(2));
                        self.cache.rawDirs.some(function (it) {
                            if (it.id !== id) return false;
                            it.parentid = newparentid;
                            self.reindex();
                            return true;
                        })
                        resolve();
                    }
                    else if (message == "failed_id") {
                        reject(new Error(LanguageModule.text("war_txt_failed_ver_reload_data")));
                    }
                    else {
                        reject(new Error(message));
                    }
                }
                else {
                    reject(new Error(message));
                }
            }
        });
    });


};

hr.paths.PathsFileSystem.prototype.move = function (oldPath, newPath) {
    if (oldPath.split('/').pop().startsWith('f'))
        return this.moveFile(oldPath, newPath);
    else return this.moveDir(oldPath, newPath);
};

hr.paths.PathsFileSystem.prototype.modifyRawDirInfo = function (rawInfo) {
    var self = this;
    return new Promise(function (resolve) {
        ModalElement.show_loading();
        FormClass.api_call({
            url: "paths_save.php",
            params: [{ name: "data", value: EncodingClass.string.fromVariable(rawInfo) }],
            func: function (success, message) {
                ModalElement.close(-1);
                if (success) {
                    if (message.substr(0, 2) == "ok") {
                        self.cache.rawDirs.some(function (it) {
                            if (it.id === rawInfo.id) {
                                Object.assign(it, rawInfo);
                                it.lastmodifiedtime = new Date();
                                it.ver++;
                            }
                        })
                        self.reindex();
                    }
                    else {
                        ModalElement.alert({ message: message });
                    }
                }
                else {
                    ModalElement.alert({ message: message });
                }
                resolve();//todo: reject error
            }
        });
    });
};

hr.paths.PathsFileSystem.prototype.getFolderSelection = function () {
    var dict = {
        "0": {
            text: 'Root',
            value: 0
        }
    };
    this.cache.rawDirs.forEach(function (it) {
        dict[it.id] = {
            text: it.name || 'd' + it.id,
            value: it.id
        };
    });
    this.cache.rawDirs.forEach(function (it) {
        var item = dict[it.id];
        var parentItem = dict[it.parentid];
        if (parentItem) {
            parentItem.items = parentItem.items || [];
            parentItem.items.push(item);
        }
    });
    return [dict[0]];
};

/***
 * @typedef RawFolderInfo
 * @property {number} id
 * @property {number} parentid
 * @property {boolean} available
 * @property {boolean} public
 * @property {string} name
 * @property {number} ver
 * @property {Date} lastmodifiedtime
 *
 */

hr.paths.finderCommands = {};

hr.paths.finderCommands = {};

hr.paths.finderCommands.openFolderInfoDialog = {};
/***
 *
 * @param {RawFolderInfo=} rawInfo
 */
hr.paths.finderCommands.openFolderInfoDialog.exec = function (rawInfo) {
    rawInfo = Object.assign({}, {
        id: 0,//new
        available: true,
        'public': false,
        parentid: 0,
        name: '',
        ver: 1
    }, rawInfo || {});

    var items = this.fileSystem.getFolderSelection();
    //remove default folder
    if (items[0] && items[0].items) {
        items[0].items = items[0].items.filter(function (item) {
            return item.value >= 0;
        })
    }

    var paths_select = absol.buildDom({
        tag: "selecttreemenu",
        style: {
            width: "100%",
            display: "block"
        },
        props: {
            items: items,
            value: rawInfo.parentid,
            enableSearch: true
        }
    });

    var name_inputtext = theme.input({
        style: {
            width: "100%",
            minWidth: "300px"
        },
        value: rawInfo.name
    });

    var activated_inputselect = absol.buildDom({
        tag: "switch",
        style: {
            font: "var(--switch-fontsize)"
        },
        props: {
            checked: rawInfo.available
        }
    });
    var public_inputselect = absol.buildDom({
        tag: "switch",
        style: {
            font: "var(--switch-fontsize)"
        },
        props: {
            checked: rawInfo.public
        }
    });

    var tableData = [
        [
            { text: LanguageModule.text("txt_parent_folder") },
            { attrs: { style: { width: "var(--control-horizontal-distance-2)" } } },
            paths_select
        ],
        [{ attrs: { style: { height: "var(--control-verticle-distance-2)" } } }],
        [
            { text: LanguageModule.text("txt_name") },
            { attrs: { style: { width: "var(--control-horizontal-distance-2)" } } },
            name_inputtext
        ],
        [{ attrs: { style: { height: "var(--control-verticle-distance-2)" } } }],
        [
            { text: LanguageModule.text("txt_public") },
            { attrs: { style: { width: "var(--control-horizontal-distance-2)" } } },
            public_inputselect
        ],
        [{ attrs: { style: { height: "var(--control-verticle-distance-2)" } } }],
        [
            { text: LanguageModule.text("txt_active") },
            { attrs: { style: { width: "var(--control-horizontal-distance-2)" } } },
            activated_inputselect
        ]
    ];
    if (rawInfo.id !== 0) tableData.shift();//edit
    var pathEdit = DOMElement.table({
        data: tableData
    });

    return new Promise(function (resolve) {
        ModalElement.showWindow({
            title: rawInfo.id !== 0 ? "Sửa thư mục" : "Thêm thư mục",//LanguageModule.text("txt_media_manager"),
            bodycontent: pathEdit,
            buttonlist: [
                {
                    text: LanguageModule.text("txt_save"),
                    onclick: function () {
                        var name = name_inputtext.value.trim();
                        if (name.length === 0) {
                            ModalElement.alert({
                                message: LanguageModule.text("war_txt_no_name"),
                                func: function () {
                                    name_inputtext.focus();
                                }
                            });
                            return;
                        }
                        var res = Object.assign({}, rawInfo, {
                            name: name,
                            parentid: paths_select.value,
                            available: activated_inputselect.checked ? 1 : 0,
                            public: public_inputselect.checked ? 1 : 0,
                        });
                        ModalElement.close();
                        resolve(res);
                    }
                },
                {
                    text: LanguageModule.text("txt_cancel"),
                    onclick: function () {
                        ModalElement.close();
                        resolve(null);
                    }
                }
            ]
        });

        name_inputtext.focus();
    });
};


hr.paths.finderCommands.new_folder = {};

hr.paths.finderCommands.new_folder.match = function (treeElt) {
    return treeElt.stat && !treeElt.stat.isVirtual && treeElt.stat.writable;
};

hr.paths.finderCommands.new_folder.text = 'Thêm thư mục';//todo

hr.paths.finderCommands.new_folder.icon = 'span.mdi.mdi-folder-plus-outline'

hr.paths.finderCommands.new_folder.exec = function (treeElt) {
    var self = this;
    var fileSystem = this.fileSystem;
    var key = this.path.split('/').pop();
    var stat = fileSystem.cache.stat[key];
    if (!stat) {
        console.error("Data is not loaded!");
        return;
    }
    if (treeElt) stat = treeElt.stat;
    else stat = null;
    var initInfo = {};
    if (stat) initInfo.parentid = stat.raw.id;
    return this.execCommand('openFolderInfoDialog', initInfo).then(function (res) {
        if (!res) return;
        return fileSystem.mkdir(res).then(function () {
            ModalElement.close();
            self.navCtrl.reload(self.rootPath, false).then(function () {
                var newDirKey = 'd' + res.id;
                var newStat = fileSystem.cache.stat[newDirKey];
                if (newStat) self.navCtrl.viewDir(newStat.path);
            });
        });
    });
};


hr.paths.finderCommands.rmdir = {};


hr.paths.finderCommands.rmdir.exec = function () {
    alert("In processing...")
};


hr.paths.finderCommands.edit_folder = {};

hr.paths.finderCommands.edit_folder.text = 'Sửa';
hr.paths.finderCommands.edit_folder.icon = 'span.mdi.mdi-folder-edit-outline';


hr.paths.finderCommands.edit_folder.match = function (treeElt) {
    return treeElt && treeElt.stat && treeElt.stat.writable && !treeElt.stat.isVirtual;
}

hr.paths.finderCommands.edit_folder.exec = function (treeElt) {
    if (!treeElt) return;
    var self = this;
    var stat = treeElt.stat;
    var rawInfo = stat.raw;
    return this.execCommand('openFolderInfoDialog', rawInfo).then(function (res) {
        if (!res) return;
        if (absol.$.keyStringOf(rawInfo) !== absol.$.keyStringOf(res)) {
            self.fileSystem.modifyRawDirInfo(res).then(function () {
                treeElt.name = rawInfo.name;
            });
        }
    });
};

// hr.paths.finderCommands.

//
// hr.paths.openPathEditDialog = function (finder, pathid) {
//
// };

hr.paths.init = function (host) {
    return new Promise(function (resolveMn, rejectMn) {
        hr.menu.changeCurrentUrlTab(host, "paths");


        host.holder.addChild(host.frameList);
        var finder = absol._({
            tag: 'finder',
            style: { width: '100%', height: '100%' },
            class: systemconfig.privSystem >= 2 ? [] : 'as-disable-create-folder',//TODO: better config
            props: {
                fileSystem: new hr.paths.PathsFileSystem(),
                rootPath: 'd0',
                path: 'd0'
            }
        });

        Object.keys(hr.paths.finderCommands).forEach(function (name) {
            finder.addCommand(name, hr.paths.finderCommands[name]);
        });
        finder.addButton('new_folder', 'view'); // add [new_folder]  before [ view ]

        // finder.addCommand('rmdir', hr.paths.finderCommands.rmdir);//override
        finder.addFolderMenuItem('edit_folder', 'move_dir');
        finder.addFolderMenuItem('new_folder');
        var singlePage = absol._({
            tag: 'frame',
            child: finder
        });
        host.frameList.addChild(singlePage);
        singlePage.requestActive();


        resolveMn(host);
    });
};

hr.paths.makeDesktopFinderDialogWrapper = function (param) {

};


hr.paths.makeMobileFinderDialogWrapper = function (param) {

};

hr.paths.makeFinderWrapper = function (param) {
    if (window.isMobile) {
        return hr.paths.makeMobileFinderDialogWrapper(param);
    }
    else {
        return hr.paths.makeDesktopFinderDialogWrapper(param);
    }
};


hr.paths.makeFinderDialogInstance = function (params) {
    if (hr.paths.FinderDialogClass) return new hr.paths.FinderDialogClass(params);
    var Fragment = absol.Fragment;
    var _ = absol._;
    var $ = absol.$;

    function FinderDialogClass(params) {
        Fragment.call(this);
        this.params = params || {};
        this.isMobile = window.isMobile;
        this.resolve = function () {
        };
        this.result = null;
    }

    absol.OOP.mixClass(FinderDialogClass, Fragment);


    FinderDialogClass.prototype.makeMobileWindow = function () {
        var self =this;
        this.$act = _({
            style:{
                zIndex: 888889 - 10,
                position: 'fixed',
                top: '0',
                left: '0',
                width: '100%',
                height: 'var(--body-height, 100%)',
                display: 'grid',
                'grid-template-rows': 'auto 1fr',
                backgroundColor: 'white'
            },
            child:[
                {
                    tag:'mheaderbar',
                    props:{
                        title: this.params.title || "Chọn file",// LanguageModule.text("txt_choose_file");
                        actionIcon: '<i class="material-icons">arrow_back_ios</i>',
                        commands:[
                            {
                                icon:'span.mdi.mdi-check',
                                name:'ok'
                            }
                        ]
                    },
                    on:{
                        action: function () {
                            self.result = null;
                            self.stop();
                        },
                        command: function (){
                            self.stop();
                        }
                    }
                },
                this.$finder
            ]
        });
        this.$headerBar = this.$act.firstChild;
        this.$okBtn = this.$headerBar.$commands[0];
    };


    FinderDialogClass.prototype.makeDesktopWindow = function () {
        var self = this;
        //Modal params
        this.bodycontent = this.$finder;
        this.title = this.params.title || "Chọn file";// LanguageModule.text("txt_choose_file");
        this.buttonlist = [
            {
                text: LanguageModule.text("txt_ok"),
                onclick: function () {
                    self.stop();
                }
            },
            {
                text: LanguageModule.text("txt_cancel"),
                onclick: function () {
                    self.result = null;
                    self.stop();
                }
            }
        ]

    };


    FinderDialogClass.prototype.createView = function () {
        var self = this;
        var params = this.params;
        this.$finder  = _({
            tag: 'finder',
            // class: 'as-compact-mode',
            class: systemconfig.privSystem >= 2 ? [] : 'as-disable-create-folder',
            style:this.isMobile?{}: {
                width: '900px',
                height: '600px',
                maxHeight: 'calc(90vh - 260px)',
                maxWidth: '80vw',
                border: '1px solid #ddd'
            },
            props: {
                fileSystem: new hr.paths.PathsFileSystem(),
                rootPath: 'd0',
                path: params.defaultFolder,
                accept: params.accept
            }
        });
        this.$finder.on('selectedchange', function () {
            self.$okBtn.disabled = self.$finder.selectedFiles.length === 0;
            if (self.isMobile) {
                if (self.$finder.selectedFiles.length >0) {
                    self.$okBtn.removeStyle('visibility');
                }
                else {
                    self.$okBtn.addStyle('visibility', 'hidden');
                }
            }
            self.result = self.$finder.selectedFiles.map(function (file) {
                return Object.assign({}, { url: file.url }, file.raw);
            });
        });

        this.$finder.on('dblclickfile', function (event) {
            event.preventDefault();
            self.result = self.$finder.selectedFiles.map(function (file) {
                return Object.assign({}, { url: file.url }, file.raw);
            });
            self.stop();
        });

        this.$view = this.$finder;

        if (this.isMobile) {
            this.makeMobileWindow();
        }
        else {
            this.makeDesktopWindow();
        }
    };


    FinderDialogClass.prototype.onStart = function () {
        this.getView();
        if (this.isMobile) {
            this.$act.addTo(document.body);
        }
        else {
            HrModalElement.showWindow(this);
            this.$okBtn = this.buttonEltList[0];
            this.$cancelBtn = this.buttonEltList[1];
        }
    };

    FinderDialogClass.prototype.onStop = function () {
        if (this.isMobile) {
            this.$act.remove();
        }
        else {
            HrModalElement.close();
        }
        this.resolve(this.result);
    };


    FinderDialogClass.prototype.startForResult = function () {
        var self = this;
        return new Promise(function (resolve) {
            self.resolve = resolve;
            self.start();
        });
    };



    hr.paths.FinderDialogClass = FinderDialogClass;
    return new FinderDialogClass(params);
};


/**
 *
 * @param {{accept: string, hideFinder:boolean, defaultFolder: string}=}params
 * @return {Promise<unknown>}
 */
hr.paths.openFinderDialog = function (params) {
    params = Object.assign({ accept: '*', defaultFolder: 'd0/d-1' }, params);
    var dialog = hr.paths.makeFinderDialogInstance(params);
    return dialog.startForResult();
};

hr.paths.openBrowserFileDialog = function (params) {
    params = Object.assign({ accept: '*', defaultFolder: 'd0/d-1' }, params);
    return absol.openFileDialog(params).then(function (files) {
        if (!files || files.length === 0) return null;
        ModalElement.show_loading();
        var fileSystem = new hr.paths.PathsFileSystem();
        var syncs = files.map((file, i) => {
            return fileSystem.writeFile(params.defaultFolder + '/' + file.name, file, function () {
            }).then(files => {
                var file = files && files[0];
                if (!file) return null;
                var res = Object.assign({}, file, fileSystem.cache.stat['f' + file.id]);
                delete res.raw;
                delete res.file_new;
                return res;
            });
        });

        return Promise.all(syncs).then(function (result) {
            ModalElement.close(-1);
            return result;
        }).catch(function (error) {
            console.error(error);
            return null;
        })
    });
};

/**
 *
 * @param {{accept: string, hideFinder:boolean, defaultFolder: string}=}params
 * @return {Promise<unknown>}
 */
hr.paths.openChooseFileDialog = function (params) {
    params = Object.assign({ accept: '*', defaultFolder: 'd0/d-1' }, params);
    if (params.hideFinder) {
        return hr.paths.openBrowserFileDialog(params);
    }
    else {
        return hr.paths.openFinderDialog(params);
    }
};


setTimeout(function () {
    window.contentModule.chooseFile = hr.paths.openChooseFileDialog;
    //todo: move function
}, 100)

ModuleManagerClass.register({
    name: "Paths",
    prerequisites: ["ModalElement", "FormClass"]
});
