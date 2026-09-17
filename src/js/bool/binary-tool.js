export function initBinaryTool() {
  const form = document.getElementById('binary-form');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = 'true';
  let operation = 'AND';
  const render = () => {
    const left = Number(form.querySelector('[name="left"]').value) || 0;
    const right = Number(form.querySelector('[name="right"]').value) || 0;
    const width = Number(form.querySelector('[name="width"]').value);
    const mask = (2 ** width) - 1;
    const leftValue = Math.max(left, 0) & mask;
    const rightValue = Math.max(right, 0) & mask;
    const leftBits = leftValue.toString(2).padStart(width, '0');
    const isShift = operation === 'LSHIFT' || operation === 'RSHIFT';
    const rightBits = rightValue.toString(2).padStart(width, '0');
    const value = operation === 'NOT' ? (~leftValue & mask) : operation === 'AND' ? leftValue & rightValue : operation === 'OR' ? leftValue | rightValue : operation === 'XOR' ? leftValue ^ rightValue : operation === 'LSHIFT' ? (leftValue << right) & mask : (leftValue >> right) & mask;
    const symbol = { NOT: '~', AND: '&', OR: '|', XOR: '^', LSHIFT: '<<', RSHIFT: '>>' }[operation];
    const rightDisplay = isShift ? `${right} bit${right === 1 ? '' : 's'}` : rightBits;
    document.getElementById('binary-output').innerHTML = `<div class="binary-equation"><span>${operation === 'NOT' ? '~' : ''}${leftBits}</span>${operation !== 'NOT' ? `<strong>${symbol}</strong><span>${rightDisplay}</span>` : ''}<b>= ${value.toString(2).padStart(width, '0')}</b></div><p>Decimal: <strong>${operation === 'NOT' ? `~${leftValue} = ${value}` : `${leftValue} ${symbol} ${rightValue} = ${value}`}</strong></p><small class="binary-note">Fixed width: ${width} bits · mask: ${mask.toString(2).padStart(width, '0')}</small>`;
  };
  form.querySelectorAll('[data-bit-operation]').forEach(button => button.addEventListener('click', () => {
    operation = button.dataset.bitOperation;
    form.querySelectorAll('[data-bit-operation]').forEach(item => item.classList.toggle('active', item === button));
    render();
  }));
  form.addEventListener('input', render);
  render();
}
