import { basicSetup, EditorView } from 'codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { Compartment, EditorSelection, Text } from '@codemirror/state'
import { MyParser } from '../lib/parser.js';
import { detect } from '../lib/detect.js';
import SimpleCode from '../lib/code.txt';


var compartment = new Compartment();

var customEvent = new CustomEvent('EditorContentChange', {});
var updateListenerExtension = EditorView.updateListener.of(function (update) {
  if (update.docChanged) {
    window.dispatchEvent(customEvent)
  }
});
var wrapping = false;

window.jss = {}
window.jss.formatCode = function () {
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
window.jss.goToLine = function (line) {
  var defaultLine = PARAM_LOC.length > 0 ? PARAM_LOC.join(":") : "1:1";
  var loc = prompt("Jump to line:column", defaultLine)
  if (loc) {
    var parts = loc.split(':').map(Number)
    makeSelectionLine(parts[0] || 1, parts[1] || 1)
  }
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
}

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
  return detect(code);
}

function setSelection(ret, key, shiftKey) {
  if (shiftKey && ret[key].active === 0) {
    ret[key].active = ret[key].locations.length + 1
  }

  if (shiftKey) {
    ret[key].active--
  } else {
    ret[key].active++
  }

  var active = ret[key].active - 1
  var location = ret[key].locations[active]
  var activeEl = document.querySelector(`#active-${key}`);

  if (active < 0 || active >= ret[key].locations.length) {
    // console.warn(`No more ${key} syntax found!`, active, ret[key].locations.length)
    clearSelection()
    activeEl.innerText = 0

    if (!shiftKey && ret[key].active >= ret[key].locations.length) {
      ret[key].active = 0
    }

    return;
  }

  makeSelectionLoc(location.start.index, location.end.index)
  activeEl.innerText = ret[key].active;
}

function makeSelection(range) {
  var selection = EditorSelection.create([
    range,
    EditorSelection.cursor(0)
  ], 1)
  var effects = EditorView.scrollIntoView(range, {
    x: 'center',
    y: 'center'
  })
  window.editorView.dispatch({
    selection,
    effects
  })
}
function makeSelectionLine(line, col) {
  // var pos = 0
  // if (line < 0) {
  //   pos = editorView.state.doc.line(editorView.state.doc.lines + line + 1)
  // } else {
  //   pos = editorView.state.doc.line(Math.max(1, line))
  // }
  var pos = editorView.state.doc.line(Math.max(1, line))
  var c = Math.min(pos.text.length, Math.max(1, col))
  var start = pos.from + c
  var range = EditorSelection.range(start - 1, start)
  makeSelection(range)
}
function makeSelectionLoc(start, end) {
  if (start === end) {
    end = start + 1;
  }
  var range = EditorSelection.range(start, end)
  makeSelection(range)
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
            <span class="en"><a href="${ret[key].syntax.ref}" target="_blank">${key}</a> (<span id="active-${key}">${ret[key].active}</span>/${ret[key].locations.length})</span>
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
    if (queryUrl === '') {
      return toastMessage('No URL provided in query string, using default code.');
    }
    if (!isValidUrl(queryUrl)) {
      return toastMessage('Invalid URL provided in query string=' + queryUrl);
    }
    return queryUrl
  }
}

function forceFetch(url, callback) {
  fetch(url)
    .then(response => response.text())
    .then(callback)
    .catch(error => {
      fetch("//break-cors.arp.sh/?url=" + encodeURIComponent(url))
          .then(response => {
            if (response.status === 200) {
              return response.text()
            } else {
              throw new Error('Failed to fetch the URL: ' + response.statusText);
            }
          })
          .then(callback)
          .catch(error => {
            console.error('Error fetching the URL:', error);
            toastMessage(error);
          });
    });
}

var PARAM_LOC = []
function DOMContentLoaded() {
  init()

  var PARAM_URL = ''
  var queryUrl = getQueryUrl()

  if (queryUrl) {
    var u = new URL(queryUrl)
    if (u.pathname.indexOf(':') > -1) {
      if (/\d+:\d+$/.test(queryUrl)) {
        var parts = queryUrl.split(':');
        PARAM_LOC = [Math.max(Number(parts[2]), 1), Math.max(Number(parts[3]), 1)]
        PARAM_URL = parts[0] + ':' + parts[1];
      }

      if (!PARAM_URL) {
        return toastMessage('URL Not valid, please check the query string.');
      }
    } else {
      PARAM_URL = queryUrl
    }

    // console.log(PARAM_URL, PARAM_LOC)
    forceFetch(PARAM_URL, (text) => {
      setContent(text);
      if (PARAM_LOC.length) {
        var pos = window.editorView.state.doc.line(PARAM_LOC[0]).from + PARAM_LOC[1]
        makeSelectionLoc(pos - 1, pos);
      }
      detectSyntax()
    });
  } else {
    setContent(SimpleCode)
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
      doc: '',
      extensions: [updateListenerExtension, basicSetup, compartment.of([]), javascript()],
      parent: document.getElementById('editor')
    })
  } catch (e) {
    toastMessage('Error initializing splitter/editor: ' + e);
  }
}

(function () {
  window.addEventListener('DOMContentLoaded', DOMContentLoaded)
  window.addEventListener('EditorContentChange', EditorContentChange)
  window.addEventListener('orientationchange', OrientationChange);
})();
