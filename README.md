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
import {parse} from "parsemath" // or let {parse} = require("parsemath")

let value = parse("x^2 + x + 1", {x: 1e-1})
console.log(value) // 1.11
```

Some useful error messages:
```ts
parse("(x-y)(x+y)", { x: 1, y: 2 });
// Error: Unexpected '(' at position 5.

// (x-y)(x+y)
//      ▲
// ─────╯
```

Throws when it encounters an unspecified variable
```ts
parse("x^2 + y + 1" {x: 1e-1})
// Error: Unknown identifier 'y' at position 6.
//
// x^2 + y + 1
//       ▲
// ──────╯
```

