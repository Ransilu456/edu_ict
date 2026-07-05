function tokenize(expr) {
  const tokens = [];
  for (let i = 0; i < expr.length; i++) {
    const ch = expr[i];
    if (/\s/.test(ch)) continue;
    if (/[A-Za-z]/.test(ch)) tokens.push({ type: 'IDENT', value: ch.toUpperCase() });
    else if (ch === '+') tokens.push({ type: 'PLUS' });
    else if (ch === '*') tokens.push({ type: 'STAR' });
    else if (ch === '.') tokens.push({ type: 'DOT' });
    else if (ch === '⊕') tokens.push({ type: 'XOR' });
    else if (ch === '(') tokens.push({ type: 'LPAREN' });
    else if (ch === ')') tokens.push({ type: 'RPAREN' });
    else if (ch === "'") tokens.push({ type: 'NOT' });
    else throw new Error(`Unexpected token: ${ch}`);
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
      consume('RPAREN');
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
    while (consume('STAR') || consume('DOT')) {
      const right = parseUnary();
      left = { op: 'AND', left, right };
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
    while (consume('PLUS')) {
      const right = parseXor();
      left = { op: 'OR', left, right };
    }
    return left;
  };
  return { parse: parseOr };
}

function buildAst(expression) {
  const tokens = tokenize(expression);
  const parser = createParser(tokens);
  const ast = parser.parse();
  return ast;
}

function astToCircuit(ast) {
  const nodes = [];
  const wires = [];
  const createNode = (type, label, x, y, inputsCount = 1) => {
    const id = `bool-${Math.random().toString(36).slice(2,8)}`;
    nodes.push({ id, type, label, x, y, inputsCount, outputsCount: 1, outputState: 0, outputState2: 0, inputValues: Array(inputsCount).fill(0), data: {} });
    return id;
  };
  const walk = (node, x, y, depth = 0) => {
    if (node.op === 'VAR') {
      return createNode('input', node.name, x, y, 0);
    }
    if (node.op === 'NOT') {
      const inputId = walk(node.expr, x - 90, y + depth * 40, depth + 1);
      const outId = createNode('not', 'NOT', x, y, 1);
      wires.push({ fromNodeId: inputId, fromPortIdx: 0, toNodeId: outId, toPortIdx: 0 });
      return outId;
    }
    const leftId = walk(node.left, x - 90, y - 30, depth + 1);
    const rightId = walk(node.right, x - 90, y + 30, depth + 1);
    const gateType = node.op === 'AND' ? 'and' : node.op === 'OR' ? 'or' : 'xor';
    const outId = createNode(gateType, gateType.toUpperCase(), x, y, 2);
    wires.push({ fromNodeId: leftId, fromPortIdx: 0, toNodeId: outId, toPortIdx: 0 });
    wires.push({ fromNodeId: rightId, fromPortIdx: 0, toNodeId: outId, toPortIdx: 1 });
    return outId;
  };
  walk(ast, 280, 140);
  return { nodes, wires };
}

export function parseBooleanExpression(expression) {
  const ast = buildAst(expression);
  return astToCircuit(ast);
}

window.parseBooleanExpression = parseBooleanExpression;
