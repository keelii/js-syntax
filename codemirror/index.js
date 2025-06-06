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
    BlockScopedVar: {
        selector: "VariableDeclaration[kind=let],VariableDeclaration[kind=const]"
    },
    TemplateLiterals: {
        selector: "TemplateLiteral"
    },
    DestructuringAssignment: {
        selector: "AssignmentExpression>ArrayPattern,VariableDeclarator>ObjectPattern"
    },
    ArrowFunctions: {
        selector: "ArrowFunctionExpression"
    },
    ObjectInitializer: {
        selector: "ObjectExpression Property[shorthand=true]"
    },
    ForOf: {
        selector: "ForOfStatement[await=false]"
    },
    DefaultParameters: {
        selector: "FunctionDeclaration>AssignmentPattern,ArrowFunctionExpression>AssignmentPattern"
    },
    SpreadSyntax: {
        selector: "SpreadElement"
    },
    Class: {
        selector: "ClassDeclaration"
    },
    ImportExport: {
        selector: "ImportDeclaration,ExportNamedDeclaration,ExportAllDeclaration"
    },
    Generator: {
        selector: "[generator=true]"
    },
    // ES7
    Exponentiation: {
        selector: "BinaryExpression[operator='**']"
    },
    // ES8
    AsyncAwait: {
        selector: "[async=true]"
    },
    // ES9
    RestParameters: {
        selector: "FunctionDeclaration > RestElement"
    },
    ForAwaitOf: {
        selector: "ForOfStatement[await=true]"
    },
    // ES10
    OptionalCatchBinding: {
        selector: "CatchClause[param=null]"
    },
    // ES11
    OptionalChaining: {
        selector: "ChainExpression"
    },
    NullishCoalescing: {
        selector: "LogicalExpression[operator='??']"
    },
    DynamicImport: {
        selector: "ImportExpression"
    },
    // ES12
    LogicalOrAssignment: {
        selector: "AssignmentExpression[operator='??='],AssignmentExpression[operator='||=']"
    },
    NumberSeparator: {
        selector: "Literal[raw=/^\\d_\\d$/]"
    },
    // ES13
    TopLevelAwait: {
        selector: "Program>ExpressionStatement>AwaitExpression"
    },
    ClassPrivateMember: {
        selector: "ClassBody PrivateIdentifier"
    },
    ClassStaticBlock: {
        selector: "ClassBody>PropertyDefinition[static=true] ObjectExpression"
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
                result[key] = ret;
            }
        } catch (e) {
            console.error(e);
        }
    }
    return result;
}

window.editorView.setSelection = (s, e) => {
    window.editorView.dispatch({
        selection: EditorSelection.create([
            EditorSelection.range(s, e),
            EditorSelection.cursor(0)
        ], 1)
    })
}