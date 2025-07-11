import esquery from 'esquery';
import { MyParser } from './parser.js';
import { JsSyntaxEnum } from './enum.js';


var ESQueryMap = {}

for (let key in JsSyntaxEnum) {
  try {
    ESQueryMap[key] = esquery.parse(JsSyntaxEnum[key].selector);
  } catch (e) {
    console.error(e)
  }
}

export function parseCode(code) {
  try {
    var hashBang = null
    var ret = MyParser.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
      onComment: (a, b, s, e) => {
        if (s === 0 && code.indexOf('#!') === 0) {
          if (/\/(?:[\w-]+\/)*[\w-]+(?:\s+.*)?/.test(b)) {
            hashBang = {
              start: {
                line: 1,
                column: 1,
                index: s
              },
              end: {
                line: 1,
                column: e - s,
                index: e
              }
            }
          }
        }
      }
    })
    ret._hashBang = hashBang

    return ret
  } catch (e) {
    console.error('Error parsing code: ', e);
    return null;
  }
}

function parseAst(ast) {
  return JSON.parse(
      JSON.stringify(
          ast,
          (key, value) => {
            return typeof value === "bigint"
                ? Number(value)
                : value
          }
      )
  )
}

export function detect(code) {
  var ast = parseCode(code)
  var result = {};

  console.debug("ast", parseAst(ast).body);

  if (!ast) return result;

  if (ast._hashBang) {
    result.Hashbang = {
      active: 0,
      syntax: JsSyntaxEnum.Hashbang,
      locations: [ast._hashBang]
    };
  }

  for (var key in JsSyntaxEnum) {
    try {
      var ret = esquery.match(ast, ESQueryMap[key])
      if (ret && ret.length > 0) {
        // console.debug(key, ret, JsSyntaxEnum[key].__selector)
        result[key] = {
          active: 0,
          syntax: JsSyntaxEnum[key],
          locations: ret.map(item => ({
            start: {
              line: item.loc.start.line,
              column: item.loc.start.column + 1,
              index: item.start
            },
            end: {
              line: item.loc.start.line,
              column: item.loc.start.column + 1,
              index: item.end
            }
          }))
        };
      }
    } catch (e) {
      console.error('Error matching selector for ' + key + ': ', e);
    }
  }
  return result;
}
