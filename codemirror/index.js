import {basicSetup, EditorView} from "codemirror"
import {javascript} from "@codemirror/lang-javascript"
import {Compartment, EditorSelection} from '@codemirror/state'
import esquery from "esquery"

const compartment = new Compartment();

// const baseTheme = EditorView.baseTheme({
//     ".cm-scroller::-webkit-scrollbar-thumb" : {
//         background : '#ccc'
//     },
//
//     ".cm-scroller::-webkit-scrollbar" : {
//         width : '.5rem',
//         height: '.5em',
//         borderRadius: '0.25rem',
//     },
//
//     ".cm-scroller::-webkit-scrollbar-thumb:hover" : {
//         background : '#999'
//     },
//
//     ".cm-scroller::-webkit-scrollbar-track" : {
//         background : "rgba(0, 0, 0, 0.1)"
//     },
// })

const doc = `// This is a sample JavaScript code
let _a = 0;
const _b = 0;
var a = \`\`;
var [a, b] = [1, 2];
var {x, y} = {x: 1, y: 2};
var f = () => {};
var g = {a}
for (var a of b) {}
function i(a = 0) {}
function j(...a) {}
var [...a] = []
class A {}
import __a from "a";
export {__a}
function *l() {}
var a = 1 ** 2
async function test() {}
(async function() {
    await test()
})();
for await (var a of b) {}
try {} catch {}
var a = b?.c
var a = b ?? ""
import("abc")
var a = a ??= 2;
var a = b ||= 2;
var a = 100_100;
await test()
class B {
    #a = 1;
    static a = {}
}
`

const contentChange = new CustomEvent("contentChange", {});

let updateListenerExtension = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
        window.dispatchEvent(contentChange)
    }
});

window.editorView = new EditorView({
    doc,
    extensions: [updateListenerExtension, basicSetup, compartment.of([]), javascript()],
    parent: document.getElementById("editor")
})

let wrapping = false;
window.editorView.toggleWrap = () => {
    wrapping = !wrapping;
    window.editorView.dispatch({
        effects: [compartment.reconfigure(
            wrapping ? EditorView.lineWrapping : []
        )]
    });
}
window.editorView.getContent = (content) => {
    return window.editorView.state.doc.toString()
}
window.editorView.setContent = (content) => {
    window.editorView.dispatch({
        selection: {
            anchor: 1,
            head: 1
        },
        changes: {
            from: 0,
            to: window.editorView.state.doc.length,
            insert: content
        }
    })
    window.editorView.scrollDOM.scrollTo({
        top: 0,
        left: 0
    })
};

import {Parser} from "acorn"
import jsx from "acorn-jsx"
import bigint from "acorn-bigint"

const MyParser = Parser.extend(
    jsx(),
    bigint
)

window.editorView.parse = (code) => {
    try {
        return MyParser.parse(code, {
            ecmaVersion: "latest",
            sourceType: "module"
        })
    } catch (e) {
        console.error(e)
    }
}


const JsSyntaxEnum = {
    // ES6
    LetConst: {
        selector: "VariableDeclaration[kind=let],VariableDeclaration[kind=const]",
        name: "块级作用域变量"
    },
    TemplateLiterals: {
        selector: "TemplateLiteral",
        name: "模板字符串"
    },
    DestructuringAssignment: {
        selector: "AssignmentExpression>ArrayPattern,VariableDeclarator>ObjectPattern",
      name: "解构赋值"
    },
    ArrowFunctions: {
        selector: "ArrowFunctionExpression",
      name: "箭头函数"
    },
    ObjectInitializer: {
        selector: "ObjectExpression Property[shorthand=true]",
      name: "对象字面量简写"
    },
    ForOf: {
        selector: "ForOfStatement[await=false]",
      name: "for...of 循环"
    },
    DefaultParameters: {
        selector: "FunctionDeclaration>AssignmentPattern,ArrowFunctionExpression>AssignmentPattern",
      name: "默认参数"
    },
    SpreadSyntax: {
        selector: "SpreadElement",
      name: "展开语法"
    },
    Class: {
        selector: "ClassDeclaration",
      name: "类定义"
    },
    ImportExport: {
        selector: "ImportDeclaration,ExportNamedDeclaration,ExportAllDeclaration",
      name: "模块导入导出"
    },
    Generator: {
        selector: "[generator=true]",
      name: "生成器函数"
    },
    // ES7
    Exponentiation: {
        selector: "BinaryExpression[operator='**']",
      name: "指数运算符"
    },
    // ES8
    AsyncAwait: {
        selector: "[async=true]",
      "name": "异步函数"
    },
    // ES9
    RestParameters: {
        selector: "FunctionDeclaration > RestElement",
      name: "剩余参数"
    },
    ForAwaitOf: {
        selector: "ForOfStatement[await=true]",
      name: "异步迭代"
    },
    // ES10
    OptionalCatchBinding: {
        selector: "CatchClause[param=null]",
      name: "可选的 catch 绑定"
    },
    // ES11
    OptionalChaining: {
        selector: "ChainExpression",
      name: "可选链"
    },
    NullishCoalescing: {
        selector: "LogicalExpression[operator='??']",
      name: "空值合并运算符"
    },
    DynamicImport: {
        selector: "ImportExpression",
      name: "动态导入"
    },
    // ES12
    LogicalOrAssignment: {
        selector: "AssignmentExpression[operator='??='],AssignmentExpression[operator='||=']",
      name: "逻辑或赋值运算符"
    },
    NumberSeparator: {
        selector: "Literal[raw=/^\\d_\\d$/]",
      name: "数字分隔符"
    },
    // ES13
    TopLevelAwait: {
        selector: "Program>ExpressionStatement>AwaitExpression",
      name: "顶级 await"
    },
    ClassPrivateMember: {
        selector: "ClassBody PrivateIdentifier",
      name: "类私有成员"
    },
    ClassStaticBlock: {
        selector: "ClassBody>PropertyDefinition[static=true] ObjectExpression",
      name: "类静态块"
    },
}

for (let key in JsSyntaxEnum) {
    try {
        JsSyntaxEnum[key].__selector = esquery.parse(JsSyntaxEnum[key].selector);
    } catch (e) {
        console.error(e)
    }
}

window.editorView.detectSyntax = () => {
    const code = window.editorView.getContent();
    const ast = window.editorView.parse(code);

    if (!ast)  return;

    const result = {};
    for (let key in JsSyntaxEnum) {
        try {
            const ret = esquery.match(ast, JsSyntaxEnum[key].__selector)
            if (ret && ret.length > 0) {
                result[key] = {
                  query: ret,
                  syntax: JsSyntaxEnum[key]
                };
            }
        } catch (e) {
            console.error(e);
        }
    }
    return result;
}

window.editorView.setSelection = (locs) => {
    window.editorView.dispatch({
        selection: EditorSelection.create([
            ...locs.map(loc => EditorSelection.range(loc[0], loc[1])),
            EditorSelection.cursor(0)
        ], 1)
    })
}
