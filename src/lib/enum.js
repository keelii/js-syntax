export var JsSyntaxEnum = {
  Hashbang: {
    selector: '',
    name: 'Hashbang 注释',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar#hashbang_comments'
  },
  // ES6
  LetConst: {
    selector: 'VariableDeclaration[kind=let],VariableDeclaration[kind=const]',
    name: 'let 和 const',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let'
  },
  UsingDeclaration: {
    selector: 'VariableDeclaration[kind="using"],VariableDeclaration[kind="await using"]',
    name: 'using 声明',
    ref: 'https://github.com/tc39/proposal-explicit-resource-management'
  },
  TemplateLiterals: {
    selector: 'TemplateLiteral',
    name: '模板字符串',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals'
  },
  TaggedTemplateLiterals: {
    selector: 'TaggedTemplateExpression',
    name: '带标签的模板字符串',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals#tagged_templates'
  },
  DestructuringAssignment: {
    selector: 'VariableDeclarator>ArrayPattern,VariableDeclarator>ObjectPattern',
    name: '解构赋值',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring'
  },
  ArrowFunctions: {
    selector: 'ArrowFunctionExpression',
    name: '箭头函数',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions'
  },
  ObjectInitializer: {
    selector: 'ObjectExpression Property[shorthand=true]',
    name: '对象字面量简写',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer'
  },
  ForOf: {
    selector: 'ForOfStatement[await=false]',
    name: 'for...of 循环',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of'
  },
  DefaultParameters: {
    selector: 'FunctionDeclaration>AssignmentPattern,ArrowFunctionExpression>AssignmentPattern',
    name: '默认参数',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters'
  },
  SpreadSyntax: {
    selector: 'SpreadElement',
    name: '展开语法',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax'
  },
  BigInt: {
    selector: 'Literal[bigint]',
    name: '大整数',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt'
  },
  RegExpMatchIndices: {
    selector: 'Literal[regex.flags="d"]',
    name: '正则表达式标识 /d',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#flags'
  },
  RegExpMatchDotAll: {
    selector: 'Literal[regex.flags="s"]',
    name: '正则表达式标识 /s',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#flags'
  },
  RegExpMatchUnicode: {
    selector: 'Literal[regex.flags="u"]',
    name: '正则表达式标识 /u',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#flags'
  },
  RegExpMatchUnicodeSets: {
    selector: 'Literal[regex.flags="v"]',
    name: '正则表达式标识 /v',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#flags'
  },
  RegExpMatchSticky: {
    selector: 'Literal[regex.flags="y"]',
    name: '正则表达式标识 /y',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/RegExp#flags'
  },
  NumericSeparators: {
    selector: 'Literal[raw=/^\\d+_\\d+$/]',
    name: '数字分割符',
    ref: 'https://github.com/tc39/proposal-numeric-separator'
  },
  Class: {
    selector: 'ClassDeclaration',
    name: '类定义',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes'
  },
  ImportExport: {
    selector: 'ImportDeclaration:not([attributes]),ExportNamedDeclaration,ExportAllDeclaration',
    name: '模块导入导出',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import'
  },
  ImportAttribute: {
    selector: 'ImportDeclaration[attributes.0.type=ImportAttribute]',
    name: '导入模块属性',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import/with'
  },
  Generator: {
    selector: '[generator=true]',
    name: '生成器函数',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Generator'
  },
  // ES7
  Exponentiation: {
    selector: 'BinaryExpression[operator=\'**\']',
    name: '指数运算符',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Exponentiation'
  },
  // ES8
  AsyncAwait: {
    selector: '[async=true]',
    name: '异步函数',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function'
  },
  // ES9
  RestParameters: {
    selector: 'FunctionDeclaration > RestElement',
    name: '剩余参数',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters'
  },
  ForAwaitOf: {
    selector: 'ForOfStatement[await=true]',
    name: '异步迭代',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of'
  },
  // ES10
  OptionalCatchBinding: {
    selector: 'CatchClause[param=null]',
    name: '可选的 catch 绑定',
    ref: 'https://tc39.es/proposal-optional-catch-binding/'
  },
  // ES11
  OptionalChaining: {
    selector: 'ChainExpression',
    name: '可选链',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining'
  },
  NullishCoalescing: {
    selector: 'LogicalExpression[operator=\'??\']',
    name: '空值合并运算符',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing'
  },
  DynamicImport: {
    selector: 'ImportExpression',
    name: '动态导入',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import'
  },
  // ES12
  LogicalOrAssignment: {
    selector: 'AssignmentExpression[operator=\'??=\'],AssignmentExpression[operator=\'||=\']',
    name: '逻辑或赋值运算符',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_OR_assignment'
  },
  // ES13
  TopLevelAwait: {
    selector: 'Program>ExpressionStatement>AwaitExpression',
    name: '顶层 await',
    ref: 'https://tc39.es/proposal-top-level-await/'
  },
  ClassPrivateMember: {
    selector: 'ClassBody PrivateIdentifier',
    name: '类私有成员',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties'
  },
  ClassStaticBlock: {
    selector: 'ClassBody>PropertyDefinition[static=true] ObjectExpression',
    name: '类的静态初始化块',
    ref: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks'
  }
}

