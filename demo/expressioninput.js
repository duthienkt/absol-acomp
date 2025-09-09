var mathProps = ['abs', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'cbrt', 'ceil', 'clz32', 'cos', 'cosh', 'exp', 'expm1', 'floor', 'fround', 'hypot', 'imul', 'log', 'log10', 'log1p', 'log2', 'max', 'min', 'pow', 'random', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc', 'E', 'LN2', 'LN10', 'LOG2E', 'LOG10E', 'PI', 'SQRT1_2', 'SQRT2'];
mathFunctonList = mathProps.filter(x=> x.toLowerCase() === x).map(x => 'Math->' + x);
var stringProps = ['split', 'toLowerCase', 'toUpperCase', 'trim', 'trimLeft', 'trimRight', 'charAt', 'charCodeAt', 'codePointAt', 'concat', 'endsWith', 'includes', 'indexOf', 'lastIndexOf', 'localeCompare', 'match', 'normalize', 'padEnd', 'padStart', 'repeat', 'replace', 'search', 'slice', 'startsWith', 'substring', 'toLocaleLowerCase', 'toLocaleUpperCase', 'toString', 'valueOf'];
var stringFunctonList = stringProps.filter(x=> x.toLowerCase() === x).map(x => 'String->' + x);
var bscFunctionList = [
    "alert",
    "assigntostruct",
    "atallparticipant",
    "atallparticipantfilledout",
    "atleastparticipant",
    "atleastparticipantfilledout",
    "ceil",
    "checkfieldinstruct",
    "date",
    "datetime",
    "days",
    "disabled",
    "emptyobject",
    "exp",
    "floor",
    "getdirectmanager",
    "getemployeeinfo",
    "getmemberofparticipant",
    "getparticipantspecificdata",
    "if",
    "isnull",
    "ln",
    "log",
    "max",
    "member",
    "min",
    "pow",
    "round",
    "sqr",
    "sqrt",
    "testfunc",
    "testfunc1",
    "testfunc2",
    "functionList->human_policy_groups->getDataById",
    "functionList->human_policy_groups->submit",
    "functionList->human_policy_groups->delete",
    "functionList->human_policy_groups->getdatabyid",
    "functionList->human_policies->getDataById",
    "functionList->human_policies->getEmployeeApplyById",
    "functionList->human_policies->getApprovalById",
    "functionList->human_policies->save_edit",
    "functionList->human_policies->save_new",
    "functionList->human_policies->delete",
    "functionList->human_policies->apply_get_employee_items",
    "functionList->human_policies->getdatabyid",
    "functionList->human_policies->getemployeeapplybyid",
    "functionList->human_policies->getapprovalbyid",
    "functionList->loadEmployeeItemsPrivView",
    "functionList->importAsset",
    "functionList->asset_handover->assetTransactionsSave",
    "functionList->asset_handover->assetTransactionsConfirm",
    "functionList->asset_handover->assetTransactionsDeny",
    "functionList->asset_handover->assettransactionssave",
    "functionList->asset_handover->assettransactionsconfirm",
    "functionList->asset_handover->assettransactionsdeny",
    "functionList->checkThePolicyApplicant",
    "functionList->test->abc",
    "functionList->loademployeeitemsprivview",
    "functionList->importasset",
    "functionList->checkthepolicyapplicant"
];
var autocomplete = {
    variables: ['a', 'b', 'c', 'f', 'today', 'now'],
    functions: ['max', 'split', 'min', 'length', 'sub', 'and', 'or', 'not', 'xor']
        .concat(mathFunctonList)
        .concat(stringFunctonList)
        .concat(bscFunctionList)
};
var input = absol._({
    tag: 'expressioninput',
    class:'as-debug',
    on: {
        blur: function () {
            console.log('blur');
        },
        focus: function () {
            console.log('focus');
        },
        stopchange: function () {
            input2.value = this.value;
        }
    },
    props: {
        value: undefined
        // value: ' a+b+ c + f <= 1 + 2 + 3 + 4 \n+ Math->max(0, 12)+ String->split("this is text", \' \')',
        // icon: 'span.mdi.mdi-equal',
        // autocomplete: autocomplete
    }
}).addTo(document.body);
var input2 = absol._({
    tag: 'expressioninput',
    props: {
        value: '',
        autocomplete: autocomplete
    }
}).addTo(document.body);

absol._({
    style: {
        height: '50px'
    }
}).addTo(document.body);

var input2 = absol._({
    tag: 'expressioninput',
    props: {
        readOnly: true,
        value: ' a + b + c + f <= 1 + 2 + 3 + 4 + max(0, 12)+ split("this is text", \' \')',
        autocomplete: {
            variables: function () {
                return ['a', 'b', 'c', 'f', 'today', 'now']
            },
            functions: function () {
                return ['max', 'split', 'min', 'length', 'sub', 'and', 'or', 'not', 'xor']
            }
        }
    }
}).addTo(document.body);


var input2 = absol._({
    tag: 'expressioninput',
    props: {
        disabled: true,
        value: ' a + b + c + f <= 1 + 2 + 3 + 4 + max(0, 12)+ split("this is text", \' \')',
        autocomplete: {
            variables: function () {
                return ['a', 'b', 'c', 'f', 'today', 'now']
            },
            functions: function () {
                return ['max', 'split', 'min', 'length', 'sub', 'and', 'or', 'not', 'xor']
            }
        }
    }
}).addTo(document.body);


``
//
// var input1 = absol._({
//     tag: 'identtextinput',
//     props: {
//         value
// }).addTo(document.body);
//
// var input2 = absol._({
//     tag: 'identtextinput',
//     props: {
//         value: 'abczwu',
//         lowerCaseOnly: true
//     }
// }).addTo(document.body);