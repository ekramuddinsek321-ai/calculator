# Basic Calculator

A calculator built with plain HTML, CSS and JavaScript. No libraries and no `eval()`.

## Run it
Open `index.html` in any modern browser.

## Files
- `index.html`: layout (display and buttons)
- `style.css`: styling, responsive down to phone width
- `script.js`: input handling, expression parser, error handling

## How to use
- Click the buttons or type on your keyboard.
- `+ - * /` for operators, `Enter` or `=` to calculate.
- `Backspace` deletes one character. `Esc`, `Delete` or `c` clears everything.
- Pressing a digit after `=` starts a new calculation. Pressing an operator continues from the result.

## Features
- Addition, subtraction, multiplication, division with correct order of operations (BODMAS/BIDMAS): `2+3*4` gives `14`.
- Decimal numbers, with only one decimal point allowed per number and no leading zeros.
- Negative numbers: `5*-3` gives `-15`.
- **Extras:** square root (`√`), percentage (`50%` is `0.5`, so `200*10%` is `20`), memory keys (`M+`, `M-`, `MR`, `MC`) with an `M` indicator on the display, and a backspace key.
- Floating-point cleanup: `0.1+0.2` shows `0.3`.

## Error handling
The display shows a clear message and resets, instead of showing `NaN` or `Infinity`, for:
- Division by zero
- Incomplete expressions such as `5+`
- Square root of a negative number

## How it works
`evaluate()` in `script.js` is a small recursive-descent parser. `expression` handles `+ -`, `term` handles `* /`, and `unary` handles negatives and `%`. Because `term` is called inside `expression`, multiplication and division bind tighter than addition and subtraction.

## Test cases
| Input | Result |
|---|---|
| `2+3*4` | `14` |
| `10-4/2` | `8` |
| `0.1+0.2` | `0.3` |
| `5/0` | Cannot divide by zero |
| `5*-3` | `-15` |
| `200*10%` | `20` |
| `9`, `√` | `3` |
