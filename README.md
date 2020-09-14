# parsemath
Simple parser for arithmetic expressions.

- Written in typescript.
- No dependencies.
- Designed to safely parse untrusted expression strings.
Identifiers, operations, and functions can be restricted.
- Supports the following operations: `+` (unary and binary), `-` (unary and binary), `*`, `/`, `^`, `**`, and `=` (equality, not assignment).
- Supports variable substitution (see below).
- Whitespace insensitive.

### Installation
```bash
npm install parsemath
```

### Use
```ts
import {parse} from "parsemath"

let value = parse("x^2 + x + 1", {x: 1e-1})
console.log(value) // 1.11
```

