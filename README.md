# JavaScript syntax detector

A JavaScript newer syntax(ES6+) detector, 
Only focused on **lexical** syntax, not APIs. 
Because new lexical syntax will cause SyntaxError, 
it breaks your code, and cannot caught.
while the APIs may not, it can be polyfilled or caught. 

check it online [js-syntax](https://js-syntax.com).

**YES:**

* new token(=?)
* new keywords(yield, await)
* new operators(**)
* new literals(template literals)
* ...

**NO:**

* Promise
* globalThis
* Array.prototype.API
* Map/Set/WeakMap/WeakSet
* ...

## screenshots

![Image](https://github.com/user-attachments/assets/3c2f4e9d-bbb3-4275-a4a6-f39581600c3e)

## CLI tool

### Darwin

```bash
curl -o js-syntax https://unpkg.com/js-syntax-detector@1.0.11/bin/darwin/js-syntax
chmod +x js-syntax
./js-syntax --help
```

### Linux(x86_64)

```bash
curl -o js-syntax https://unpkg.com/js-syntax-detector@1.0.11/bin/linux/js-syntax
chmod +x js-syntax
./js-syntax --help
```

## Use it in your project

```bash
npm install -g js-syntax-detector
```
