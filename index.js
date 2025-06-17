import { basicSetup, EditorView } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { Compartment, EditorSelection } from '@codemirror/state'
import esquery from 'esquery'
import { MyParser } from './parser.js';
import { JsSyntaxEnum } from './syntax.js';


var compartment = new Compartment();

var doc = `#!/usr/bin/env node
// This is a sample JavaScript code
let _a = 0;
const _b = 0;
var a = \`\`;
var a = tagged\`\`;
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
var a = {}
var b = {...a}
var c = {...b}
async function test() {}
(async function() {
    await test()
})();
for await (var a of b) {}
try {} catch {}
var a = 1111n;
var a = /^a/d;
var a = /^a/s;
var a = /^a/u;
var a = /^a/v;
var a = /^a/y;
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

var customEvent = new CustomEvent('EditorContentChange', {});
var updateListenerExtension = EditorView.updateListener.of(function (update) {
  if (update.docChanged) {
    window.dispatchEvent(customEvent)
  }
});
var wrapping = false;

window.jss = {}
window.jss.formatCode = function() {
  var content = getContent()
  var results = beautifier.js(content)
  setContent(results)
}
window.jss.toggleWrap = function () {
  wrapping = !wrapping;
  window.editorView.dispatch({
    effects: [compartment.reconfigure(
      wrapping ? EditorView.lineWrapping : []
    )]
  });
}

function getSize() {
  return window.editorView.state.doc.length
}
function getContent(content) {
  return window.editorView.state.doc.toString()
}
function setContent(content) {
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
function parseCode(code) {
  try {
    var hashBang = null
    var ret = MyParser.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      onComment: (a, b, s, e) => {
        if (s === 0 && code.indexOf('#!') === 0) {
          if (/\/(?:[\w-]+\/)*[\w-]+(?:\s+.*)?/.test(b)) {
            hashBang = {
              start: s,
              end: e
            }
          }
        }
      }
    })
    ret._hashBang = hashBang
    // console.debug(ret)
    return ret
  } catch (e) {
    toastMessage(e)
  }
}
function matchSelector() {
  var code = getContent();
  var ast = parseCode(code);

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
      toastMessage(e)
    }
  }
  return result;
}
function scrollToPos(start) {
  var pos = window.editorView.state.doc.lineAt(start).from;
  window.editorView.dispatch({
    effects: EditorView.scrollIntoView(pos, {
      y: 'center',
      x: 'nearest'
    })
  });
}
function setSelection(ret, key, shiftKey) {
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
    clearSelection()
    activeEl.innerText = 0

    if (!shiftKey && ret[key].active >= ret[key].query.length) {
      ret[key].active = 0
    }

    return;
  }

  makeSelection(query.start, query.end)
  activeEl.innerText = ret[key].active;
}
function makeSelection(start, end) {
  if (start === end) {
    end = start + 1;
  }
  var selection = EditorSelection.create([
    EditorSelection.range(start, end),
    EditorSelection.cursor(0)
  ], 1)
  window.editorView.dispatch({ selection })
  scrollToPos(start)
}
function clearSelection() {
  window.editorView.dispatch({
    selection: {anchor: window.editorView.state.selection.main.from}
  });
}

function locateSyntaxKey(e, ret) {
  if (e.target.classList.contains('locater')) {
    var key = e.target.getAttribute('data-key');
    setSelection(ret, key, e.shiftKey);
  }
}
function detectSyntax() {
  var ret = matchSelector()
  var tar = document.querySelector('#split-1')
  var handleClick = function (e) {
    locateSyntaxKey(e, ret)
  }

  if (Object.keys(ret).length < 1) {
    tar.innerHTML = ''
    return false
  }

  tar.removeEventListener('click', handleClick)
  tar.addEventListener('click', handleClick)

  var html = ''

  for (var key in ret) {
    html += `
        <li class="syntax-item">
            <span>
                <a class="locater" data-key="${key}" href="javascript:;">☉</a>
                <strong>${ret[key].syntax.name}</strong>
            </span>
            <span class="en"><a href="${ret[key].syntax.ref}" target="_blank">${key}</a> (<span id="active-${key}">${ret[key].active}</span>/${ret[key].query.length})</span>
        </li>`
  }
  if (html) {
    tar.innerHTML = `<ul class="syntaxs">${html}</ul>`;
  } else {
    tar.innerHTML = ''
  }
}

function toastMessage(e) {
  console.error(e);
  if (window.Toastify) {
    var toast = Toastify({
      text: e,
      duration: 3000,
      position: 'center',
      onClick: function () {
        toast.hideToast();
      }
    }).showToast();
  }
}
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

function getQueryUrl() {
  if (typeof URLSearchParams !== 'undefined') {
    var queryUrl = new URLSearchParams(location.search).get('url')

    if (queryUrl === null) {
      return false
    }
    if (queryUrl === "") {
      return toastMessage("No URL provided in query string, using default code.");
    }
    if (!isValidUrl(queryUrl)) {
      return toastMessage('Invalid URL provided in query string=' + queryUrl);
    }
    return queryUrl
  }
}
function DOMContentLoaded() {
  init()

  var PARAM_URL = ''
  var PARAM_LOC = []
  var queryUrl = getQueryUrl()

  if (queryUrl) {
    var u = new URL(queryUrl)
    if (u.pathname.indexOf(":") > -1) {
      if (/\d+:\d+$/.test(queryUrl)) {
        var parts = queryUrl.split(':');
        PARAM_LOC = [Math.max(Number(parts[2]), 1), Math.max(Number(parts[3]), 1)]
        PARAM_URL = parts[0] + ":" + parts[1];
      }

      if (!PARAM_URL) {
        return toastMessage("URL Not valid, please check the query string.");
      }
    } else {
      PARAM_URL = queryUrl
    }

    // console.log(PARAM_URL, PARAM_LOC)

    fetch(PARAM_URL)
      .then(response => response.text())
      .then(text => {
        setContent(text);
        if (PARAM_LOC.length) {
          var pos = window.editorView.state.doc.line(PARAM_LOC[0]).from + PARAM_LOC[1]
          makeSelection(pos - 1, pos);
        }
        detectSyntax()
      })
      .catch(error => {
        console.error('Error fetching the URL:', error);
        toastMessage(error);
      });
  } else {
    setContent(doc)
    detectSyntax()
  }
}

function EditorContentChange() {
  detectSyntax()
}
function OrientationChange() {
  window.editorView.destroy()
  window.splitter.destroy()
  window.addOrientationClass()
  initSplitter()
  init()
}

function init() {
  try {
    window.editorView = new EditorView({
      doc: "",
      extensions: [updateListenerExtension, basicSetup, compartment.of([]), javascript()],
      parent: document.getElementById('editor')
    })
  } catch (e) {
    toastMessage("Error initializing splitter/editor: " + e);
  }
}

(function () {
  window.addEventListener('DOMContentLoaded', DOMContentLoaded)
  window.addEventListener('EditorContentChange', EditorContentChange)
  window.addEventListener('orientationchange', OrientationChange);
})();
