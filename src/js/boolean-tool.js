import { analyzeBooleanExpression, parseBooleanExpression } from './bool-parser.js';

export function initBooleanTool() {
  const form = document.getElementById('boolean-form');
  const input = document.getElementById('boolean-expression');
  const output = document.getElementById('boolean-output');
  if (!form || form.dataset.ready) return;
  form.dataset.ready = 'true';
  form.addEventListener('submit', event => {
    event.preventDefault();
    try {
      const result = analyzeBooleanExpression(input.value);
      output.innerHTML = `<div class="boolean-result-head"><strong>${result.variables.join(', ') || 'No variables'}</strong><span>${result.rows.length} combinations</span></div><table class="boolean-table"><thead><tr>${result.variables.map(name => `<th>${name}</th>`).join('')}<th>Output</th></tr></thead><tbody>${result.rows.map(row => `<tr>${result.variables.map(name => `<td>${row[name] ? 1 : 0}</td>`).join('')}<td><strong>${row.output ? 1 : 0}</strong></td></tr>`).join('')}</tbody></table>`;
      const action = document.getElementById('boolean-open-sandbox');
      action.disabled = false;
      action.onclick = () => {
        sessionStorage.setItem('logicQuest_pendingCircuit', JSON.stringify(parseBooleanExpression(input.value)));
        if (window.navigateToRoute) {
          window.navigateToRoute('/logic/sandbox');
        } else {
          history.pushState({}, '', '/logic/sandbox');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      };
    } catch (error) {
      output.innerHTML = `<p class="boolean-error">${error.message}</p>`;
    }
  });
}