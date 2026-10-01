/* Basic calculator. Evaluates with a hand-written parser (no eval),
   so BODMAS/BIDMAS order of operations is respected. */
(() => {
  "use strict";

  const exprEl = document.getElementById("expr");
  const resultEl = document.getElementById("result");
  const memEl = document.getElementById("mem");

  let expr = ""; // what the user has typed, e.g. "2+3*4"
  let justEvaluated = false; // true right after "=", so a digit starts fresh
  let memory = 0;

  const isOp = (c) => "+-*/".includes(c);
  const SYMBOL = { "*": "\u00d7", "/": "\u00f7", "-": "\u2212" };
  const pretty = (s) => s.replace(/[*/-]/g, (c) => SYMBOL[c]);

  /* ---------- Parser ----------
     expression := term (('+'|'-') term)*
     term       := unary (('*'|'/') unary)*
     unary      := '-' unary | number '%'*          */
  function evaluate(source) {
    const tokens = source.match(/\d*\.?\d+(?:e[-+]?\d+)?|\d+\.|[-+*/%]/g) || [];
    let pos = 0;

    const parseExpression = () => {
      let value = parseTerm();
      while (tokens[pos] === "+" || tokens[pos] === "-") {
        const op = tokens[pos++];
        const right = parseTerm();
        value = op === "+" ? value + right : value - right;
      }
      return value;
    };

    const parseTerm = () => {
      let value = parseUnary();
      while (tokens[pos] === "*" || tokens[pos] === "/") {
        const op = tokens[pos++];
        const right = parseUnary();
        if (op === "/" && right === 0) throw new Error("Cannot divide by zero");
        value = op === "*" ? value * right : value / right;
      }
      return value;
    };

    const parseUnary = () => {
      if (tokens[pos] === "-") {
        pos++;
        return -parseUnary();
      }
      const tok = tokens[pos++];
      if (tok === undefined || isOp(tok) || tok === "%")
        throw new Error("Incomplete expression");
      let value = parseFloat(tok);
      while (tokens[pos] === "%") {
        pos++;
        value /= 100;
      }
      return value;
    };

    const result = parseExpression();
    if (pos < tokens.length) throw new Error("Invalid expression");
    if (!Number.isFinite(result)) throw new Error("Math error");
    return parseFloat(result.toPrecision(12)); // fixes 0.1 + 0.2 style noise
  }

  /* ---------- Display ---------- */
  function render(
    shownExpr = expr,
    shownResult = expr || "0",
    isError = false,
  ) {
    exprEl.textContent = pretty(shownExpr);
    resultEl.textContent = pretty(shownResult);
    resultEl.classList.toggle("error", isError);
    memEl.hidden = memory === 0;
  }

  function showError(message) {
    render(expr, message, true);
    expr = "";
    justEvaluated = true;
  }

  /* Evaluate the current expression, or null if it is incomplete/invalid */
  function currentValue() {
    if (!expr) return 0;
    try {
      return evaluate(expr);
    } catch {
      return null;
    }
  }

  /* ---------- Input handlers ---------- */
  function inputDigit(d) {
    if (justEvaluated) {
      expr = "";
      justEvaluated = false;
    }
    const lastNumber = expr.split(/(?<!e)[-+*/%]/).pop();
    if (lastNumber === "0" && d !== ".") expr = expr.slice(0, -1); // no leading zeros
    if (expr.endsWith("%")) expr += "*"; // 50%3 -> 50%*3
    expr += d;
    render();
  }

  function inputDecimal() {
    if (justEvaluated) {
      expr = "";
      justEvaluated = false;
    }
    const lastNumber = expr.split(/[-+*/%]/).pop();
    if (lastNumber.includes(".")) return;
    expr += lastNumber === "" ? "0." : ".";
    render();
  }

  function inputOperator(op) {
    justEvaluated = false;
    if (expr === "") {
      if (op === "-") expr = "-";
      render();
      return;
    }
    if (expr === "-") return;
    if (isOp(expr.slice(-1))) {
      // Allow "5*-3"; otherwise replace the previous operator
      if (op === "-" && "*/".includes(expr.slice(-1))) expr += op;
      else expr = expr.replace(/[-+*/]+$/, "") + op;
    } else {
      expr += op;
    }
    render();
  }

  function inputPercent() {
    justEvaluated = false;
    if (expr === "" || isOp(expr.slice(-1))) return;
    expr += "%";
    render();
  }

  function calculate() {
    if (!expr) return;
    try {
      const value = evaluate(expr);
      render(expr + " =", String(value));
      expr = String(value);
      justEvaluated = true;
    } catch (e) {
      showError(e.message);
    }
  }

  function squareRoot() {
    const value = currentValue();
    if (value === null) return showError("Incomplete expression");
    if (value < 0) return showError("Invalid input");
    const root = parseFloat(Math.sqrt(value).toPrecision(12));
    render("\u221a(" + (expr || "0") + ") =", String(root));
    expr = String(root);
    justEvaluated = true;
  }

  function clearAll() {
    expr = "";
    justEvaluated = false;
    render("", "0");
  }

  function backspace() {
    if (justEvaluated) return clearAll();
    expr = expr.slice(0, -1);
    render(expr, expr || "0");
  }

  /* Memory: M+ / M- use the current value; MR inserts it; MC clears it */
  function memoryKey(key) {
    if (key === "MC") memory = 0;
    else if (key === "MR") {
      if (justEvaluated) expr = "";
      justEvaluated = false;
      if (expr !== "" && !isOp(expr.slice(-1))) expr += "*"; // 5 MR -> 5*mem
      expr += String(memory);
    } else {
      const value = currentValue();
      if (value === null) return showError("Incomplete expression");
      memory = parseFloat(
        (memory + (key === "M+" ? value : -value)).toPrecision(12),
      );
      justEvaluated = true;
    }
    render(expr, expr || "0");
  }

  /* ---------- Routing (buttons and keyboard share this) ---------- */
  function handleKey(key) {
    if (/^\d$/.test(key)) inputDigit(key);
    else if (key === ".") inputDecimal();
    else if (isOp(key)) inputOperator(key);
    else if (key === "%") inputPercent();
    else if (key === "=" || key === "Enter") calculate();
    else if (key === "C" || key === "Escape" || key === "Delete") clearAll();
    else if (key === "Backspace") backspace();
    else if (key === "sqrt") squareRoot();
    else if (["MC", "MR", "M+", "M-"].includes(key)) memoryKey(key);
  }

  document.querySelector(".keys").addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn) handleKey(btn.dataset.key);
  });

  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const key = e.key === "c" ? "C" : e.key;
    const btn = document.querySelector(
      `[data-key="${CSS.escape(key === "Enter" ? "=" : key)}"]`,
    );
    if (key === "Enter" || key === "/" || key === "Backspace")
      e.preventDefault();
    handleKey(key);
    if (btn) {
      btn.classList.add("pressed");
      setTimeout(() => btn.classList.remove("pressed"), 90);
    }
  });

  render("", "0");
})();
