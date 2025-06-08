import esquery from 'esquery';

var JsSyntaxEnum = {
  // ES6
  LetConst: {
    selector: 'VariableDeclaration[kind=let],VariableDeclaration[kind=const]',
    name: '块级作用域变量'
  },
  TemplateLiterals: {
    selector: 'TemplateLiteral',
    name: '模板字符串'
  },
  DestructuringAssignment: {
    selector: 'AssignmentExpression>ArrayPattern,VariableDeclarator>ObjectPattern',
    name: '解构赋值'
  },
  ArrowFunctions: {
    selector: 'ArrowFunctionExpression',
    name: '箭头函数'
  },
  ObjectInitializer: {
    selector: 'ObjectExpression Property[shorthand=true]',
    name: '对象字面量简写'
  },
  ForOf: {
    selector: 'ForOfStatement[await=false]',
    name: 'for...of 循环'
  },
  DefaultParameters: {
    selector: 'FunctionDeclaration>AssignmentPattern,ArrowFunctionExpression>AssignmentPattern',
    name: '默认参数'
  },
  SpreadSyntax: {
    selector: 'SpreadElement',
    name: '展开语法'
  },
  Class: {
    selector: 'ClassDeclaration',
    name: '类定义'
  },
  ImportExport: {
    selector: 'ImportDeclaration,ExportNamedDeclaration,ExportAllDeclaration',
    name: '模块导入导出'
  },
  Generator: {
    selector: '[generator=true]',
    name: '生成器函数'
  },
  // ES7
  Exponentiation: {
    selector: 'BinaryExpression[operator=\'**\']',
    name: '指数运算符'
  },
  // ES8
  AsyncAwait: {
    selector: '[async=true]',
    'name': '异步函数'
  },
  // ES9
  RestParameters: {
    selector: 'FunctionDeclaration > RestElement',
    name: '剩余参数'
  },
  ForAwaitOf: {
    selector: 'ForOfStatement[await=true]',
    name: '异步迭代'
  },
  // ES10
  OptionalCatchBinding: {
    selector: 'CatchClause[param=null]',
    name: '可选的 catch 绑定'
  },
  // ES11
  OptionalChaining: {
    selector: 'ChainExpression',
    name: '可选链'
  },
  NullishCoalescing: {
    selector: 'LogicalExpression[operator=\'??\']',
    name: '空值合并运算符'
  },
  DynamicImport: {
    selector: 'ImportExpression',
    name: '动态导入'
  },
  // ES12
  LogicalOrAssignment: {
    selector: 'AssignmentExpression[operator=\'??=\'],AssignmentExpression[operator=\'||=\']',
    name: '逻辑或赋值运算符'
  },
  NumberSeparator: {
    selector: 'Literal[raw=/^\\d_\\d$/]',
    name: '数字分隔符'
  },
  // ES13
  TopLevelAwait: {
    selector: 'Program>ExpressionStatement>AwaitExpression',
    name: '顶级 await'
  },
  ClassPrivateMember: {
    selector: 'ClassBody PrivateIdentifier',
    name: '类私有成员'
  },
  ClassStaticBlock: {
    selector: 'ClassBody>PropertyDefinition[static=true] ObjectExpression',
    name: '类静态块'
  }
}

for (let key in JsSyntaxEnum) {
  try {
    JsSyntaxEnum[key].__selector = esquery.parse(JsSyntaxEnum[key].selector);
  } catch (e) {
    console.error(e)
  }
}

export { JsSyntaxEnum };
