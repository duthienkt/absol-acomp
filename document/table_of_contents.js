var rawFolder = 'https://raw.githubusercontent.com/duthienkt/absol-acomp/master';
var toc = {
    name: 'absol-acomp',
    type: 'package',
    children: [
        {
            name: 'Dom Component',
            type: 'group',
            children: Object.keys(absol.AComp.core.creator).map(key => {
                var clazz = absol.AComp.core.creator[key];
                var name = (clazz + '').match(/function\s+([a-zA-Z0-9_]+)/);
                name = (name && name[1]) || key;
                var res = {
                    type: 'dom-class',
                    tagName: key,
                    name: name,
                    href: [rawFolder, 'document', 'components', name].join('/')
                };

                return res;

            })
        },
        {
            name: 'Utils',
            type: 'group'
        }
    ]
};
module.exports = toc;