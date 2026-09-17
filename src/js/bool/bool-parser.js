function tokenize(expr) {
  const tokens = [];
  const source = String(expr || '');
  for (let i = 0; i < source.length;) {
    const ch = source[i];
    if (/\s/.test(ch)) { i++; continue; }
    if (/[A-Za-z_]/.test(ch)) {
      const start = i++;
      while (i < source.length && /[A-Za-z0-9_]/.test(source[i])) i++;
      const word = source.slice(start, i).toUpperCase();
      const operators = { AND: 'AND', OR: 'OR', NOT: 'NOT', XOR: 'XOR', XNOR: 'XNOR', NAND: 'NAND', NOR: 'NOR' };
      tokens.push(operators[word] ? { type: operators[word] } : { type: 'IDENT', value: word });
      continue;
    }
    const symbols = { '+': 'OR', '|': 'OR', '*': 'AND', '.': 'AND', '∧': 'AND', '∨': 'OR', '⊕': 'XOR', '⊙': 'XNOR', '¬': 'NOT' };
    if (symbols[ch]) tokens.push({ type: symbols[ch] });
    else if (ch === '(') tokens.push({ type: 'LPAREN' });
    else if (ch === ')') tokens.push({ type: 'RPAREN' });
    else if (ch === "'") tokens.push({ type: 'NOT' });
    else throw new Error(`Unexpected token "${ch}" at position ${i + 1}`);
    i++;
  }
  tokens.push({ type: 'EOF' });
  return tokens;
}

function createParser(tokens) {
  let index = 0;
  const peek = () => tokens[index];
  const consume = (type) => {
    if (peek().type === type) { index++; return true; }
    return false;
  };
  const parsePrimary = () => {
    if (consume('LPAREN')) {
      const expr = parseOr();
      if (!consume('RPAREN')) throw new Error('Missing closing parenthesis');
      return expr;
    }
    if (peek().type === 'IDENT') {
      const token = peek();
      index++;
      return { op: 'VAR', name: token.value };
    }
    if (consume('NOT')) {
      return { op: 'NOT', expr: parsePrimary() };
    }
    throw new Error('Expected identifier or parenthesis');
  };
  const parseUnary = () => {
    if (consume('NOT')) return { op: 'NOT', expr: parseUnary() };
    return parsePrimary();
  };
  const parseAnd = () => {
    let left = parseUnary();
    while (consume('AND') || consume('NAND')) {
      const operator = tokens[index - 1].type;
      const right = parseUnary();
      left = { op: operator === 'NAND' ? 'NAND' : 'AND', left, right };
    }
    return left;
  };
  const parseXor = () => {
    let left = parseAnd();
    while (consume('XOR')) {
      const right = parseAnd();
      left = { op: 'XOR', left, right };
    }
    return left;
  };
  const parseOr = () => {
    let left = parseXor();
    while (consume('OR') || consume('NOR')) {
      const operator = tokens[index - 1].type;
      const right = parseXor();
      left = { op: operator === 'NOR' ? 'NOR' : 'OR', left, right };
    }
    return left;
  };
  return {
    parse() {
      const ast = parseOr();
      if (peek().type !== 'EOF') throw new Error('Unexpected trailing input');
      return ast;
    },
  };
}

function buildAst(expression) {
  const tokens = tokenize(expression);
  const parser = createParser(tokens);
  const ast = parser.parse();
  return ast;
}

function variablesIn(ast, result = new Set()) {
  if (ast.op === 'VAR') result.add(ast.name);
  else if (ast.op === 'NOT') variablesIn(ast.expr, result);
  else { variablesIn(ast.left, result); variablesIn(ast.right, result); }
  return result;
}

function evaluateAst(ast, values) {
  if (ast.op === 'VAR') return Boolean(values[ast.name]);
  if (ast.op === 'NOT') return !evaluateAst(ast.expr, values);
  const left = evaluateAst(ast.left, values);
  const right = evaluateAst(ast.right, values);
  if (ast.op === 'AND') return left && right;
  if (ast.op === 'OR') return left || right;
  if (ast.op === 'XOR') return left !== right;
  if (ast.op === 'XNOR') return left === right;
  if (ast.op === 'NAND') return !(left && right);
  if (ast.op === 'NOR') return !(left || right);
  throw new Error(`Unsupported operator ${ast.op}`);
}

function astToCircuit(ast) {
  const nodes = [];
  const wires = [];
  let leafIndex = 0;
  const createNode = (type, label, x, y, inputsCount = 1, outputsCount = 1) => {
    const id = `bool-${Math.random().toString(36).slice(2,8)}`;
    nodes.push({ id, type, label, x, y, inputsCount, outputsCount, outputState: 0, outputState2: 0, inputValues: Array(inputsCount).fill(0), data: {} });
    return id;
  };
  const walk = (node, depth = 0) => {
    if (node.op === 'VAR') {
      const y = 70 + leafIndex++ * 100;
      return { id: createNode('input', node.name, 70, y, 0), y };
    }
    if (node.op === 'NOT') {
      const input = walk(node.expr, depth + 1);
      const y = input.y;
      const outId = createNode('not', 'NOT', 70 + depth * 180, y, 1);
      wires.push({ fromNodeId: input.id, fromPortIdx: 0, toNodeId: outId, toPortIdx: 0 });
      return { id: outId, y };
    }
    const left = walk(node.left, depth + 1);
    const right = walk(node.right, depth + 1);
    const gateType = { AND: 'and', OR: 'or', XOR: 'xor', XNOR: 'xnor', NAND: 'nand', NOR: 'nor' }[node.op];
    const y = (left.y + right.y) / 2;
    const outId = createNode(gateType, gateType.toUpperCase(), 70 + depth * 180, y, 2);
    wires.push({ fromNodeId: left.id, fromPortIdx: 0, toNodeId: outId, toPortIdx: 0 });
    wires.push({ fromNodeId: right.id, fromPortIdx: 0, toNodeId: outId, toPortIdx: 1 });
    return { id: outId, y };
  };
  const root = walk(ast);
  const outputId = createNode('output', 'OUTPUT', 70 + treeDepth(ast) * 180, root.y, 1, 0);
  wires.push({ fromNodeId: root.id, fromPortIdx: 0, toNodeId: outputId, toPortIdx: 0 });
  return { nodes, wires };
}

function treeDepth(node) {
  if (node.op === 'VAR') return 1;
  if (node.op === 'NOT') return 1 + treeDepth(node.expr);
  return 1 + Math.max(treeDepth(node.left), treeDepth(node.right));
}

export function parseBooleanExpression(expression) {
  const ast = buildAst(expression);
  return astToCircuit(ast);
}

export function analyzeBooleanExpression(expression) {
  const ast = buildAst(expression);
  const variables = [...variablesIn(ast)].sort();
  const rows = Array.from({ length: 2 ** variables.length }, (_, index) => {
    const values = Object.fromEntries(variables.map((name, bit) => [name, Boolean(index & (1 << (variables.length - bit - 1)))]));
    return { ...values, output: evaluateAst(ast, values) };
  });
  return { ast, variables, rows };
}

window.parseBooleanExpression = parseBooleanExpression;
window.analyzeBooleanExpression = analyzeBooleanExpression;