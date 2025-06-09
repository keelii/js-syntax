import {basicSetup, EditorView} from 'codemirror'
import {javascript} from '@codemirror/lang-javascript'
import {Compartment, EditorSelection} from '@codemirror/state'
import esquery from 'esquery'
import {MyParser} from './parser.js';
import {JsSyntaxEnum} from './syntax.js';


var compartment = new Compartment();

var doc = `#!/usr/bin/env node
// This is a sample JavaScript code
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
var a = 1111n;
var a = /^a/d;
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

var contentChange = new CustomEvent('contentChange', {});
var updateListenerExtension = EditorView.updateListener.of(function (update) {
    if (update.docChanged) {
        window.dispatchEvent(contentChange)
    }
});

window.editorView = new EditorView({
    doc,
    extensions: [updateListenerExtension, basicSetup, compartment.of([]), javascript()],
    parent: document.getElementById('editor')
})

var wrapping = false;

window.editorView.toggleWrap = function () {
    wrapping = !wrapping;
    window.editorView.dispatch({
        effects: [compartment.reconfigure(
            wrapping ? EditorView.lineWrapping : []
        )]
    });
}
window.editorView.getContent = function (content) {
    return window.editorView.state.doc.toString()
}
window.editorView.setContent = function (content) {
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

window.editorView.parse = function (code) {
    try {
        var hashBang = null
        var ret = MyParser.parse(code, {
            ecmaVersion: 'latest',
            sourceType: 'module',
            onComment: (a, b, s, e) => {
                if (s === 0) {
                    hashBang = {
                        start: s,
                        end: e,
                    }
                }
            }
        })
        ret._hashBang = hashBang
        console.debug(ret)
        return ret
    } catch (e) {
        console.error(e)
    }
}
window.editorView.detectSyntax = function () {
    var code = window.editorView.getContent();
    var ast = window.editorView.parse(code);

    if (!ast) return;

    var result = {};

    if (ast._hashBang) {
        result.Hashbang = {
            active: 0,
            syntax: JsSyntaxEnum.Hashbang,
            query: [ast._hashBang]
        };
    }

    for (var key in JsSyntaxEnum) {
        try {
            var ret = esquery.match(ast, JsSyntaxEnum[key].__selector)
            // console.debug(key, ret, JsSyntaxEnum[key].__selector)
            if (ret && ret.length > 0) {
                result[key] = {
                    active: 0,
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
function scrollToPos(start) {
    var pos = window.editorView.state.doc.lineAt(start).from;
    window.editorView.dispatch({
        effects: EditorView.scrollIntoView(pos, {
            y: "center",
            x: "nearest",
        }),
    });
}
window.editorView.setSelection = function (ret, key, shiftKey) {
    if (shiftKey && ret[key].active === 0) {
        ret[key].active = ret[key].query.length + 1
    }

    if (shiftKey) {
        ret[key].active--
    } else {
        ret[key].active++
    }

    var active = ret[key].active - 1
    var query = ret[key].query[active]
    var activeEl = document.querySelector(`#active-${key}`);

    if (active < 0 || active >= ret[key].query.length) {
        // console.warn(`No more ${key} syntax found!`, active, ret[key].query.length)
        window.editorView.dispatch({
            selection: { anchor: window.editorView.state.selection.main.from },
        });
        activeEl.innerText = 0

        if (!shiftKey && ret[key].active >= ret[key].query.length) {
            ret[key].active = 0
        }

        return;
    }

    var selection = EditorSelection.create([
        EditorSelection.range(query.start, query.end),
        EditorSelection.cursor(0)
    ], 1)
    window.editorView.dispatch({ selection })
    scrollToPos(query.start)

    activeEl.innerText = ret[key].active;
}

function detectSyntax() {
    var ret = window.editorView.detectSyntax()
    var tar = document.querySelector('#split-1')

    if (Object.keys(ret).length > 0) {
        tar.addEventListener("click", function (e) {
            if (e.target.classList.contains("locater")) {
                var key = e.target.getAttribute("data-key");
                window.editorView.setSelection(ret, key, e.shiftKey);
            }
        })
        var html = ''

        for (var key in ret) {
            html += `
            <li class="syntax-item">
                <span>
                    <a class="locater" data-key="${key}" href="javascript:;">☉</a>
                    <strong>${ret[key].syntax.name}</strong>
                </span>
                <span class="en">${key} (<span id="active-${key}">${ret[key].active}</span>/${ret[key].query.length})</span>
            </li>`
        }
        if (html) {
            tar.innerHTML = `<ul class="syntaxs">${html}</ul>`;
        } else {
            tar.innerHTML = ""
        }
    } else {
        tar.innerHTML = ""
    }
}

window.addEventListener('DOMContentLoaded', detectSyntax)
window.addEventListener('contentChange', detectSyntax)
