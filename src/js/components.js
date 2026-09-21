import headerHtml from '../components/app-header.html?raw';
import sandboxViewHtml from '../components/sandbox-view.html?raw';
import sandboxSidebarHtml from '../components/sandbox-sidebar.html?raw';
import sandboxToolbarHtml from '../components/sandbox-toolbar.html?raw';
import sandboxModalsHtml from '../components/sandbox-modals.html?raw';
import networkViewHtml from '../components/network-view.html?raw';
import icTesterViewHtml from '../components/ic-tester-view.html?raw';
// import breadboardViewHtml from '../components/breadboard-view.html?raw';
import globalModalsHtml from '../components/global-modals.html?raw';
import footerHtml from '../components/app-footer.html?raw';

const booleanHtml = `<section class="view-panel boolean-view"><div class="boolean-content"><div class="home-kicker"><span>DIGITAL LOGIC / BOOLEAN TOOL</span></div><h1>Turn expressions into understanding.</h1><p class="home-intro">Parse an expression, inspect every input combination, and send the resulting circuit to the sandbox.</p><form id="boolean-form" class="boolean-form"><label for="boolean-expression">Boolean expression</label><input id="boolean-expression" value="(A XOR B) AND NOT C" autocomplete="off"><button type="submit">Generate truth table</button></form><div id="boolean-output" class="boolean-output"><p>Try AND, OR, NOT, XOR, XNOR, NAND, NOR, or symbolic aliases.</p></div><button id="boolean-open-sandbox" class="boolean-sandbox-action" type="button" disabled>Open generated circuit in sandbox</button></div></section>`;
const binaryHtml = `<section class="view-panel binary-view"><div class="boolean-content"><div class="home-kicker"><span>BINARY / BITWISE LAB</span></div><h1>See every bit do its work.</h1><p class="home-intro">Compare two numbers in binary and inspect the result of common bitwise operations.</p><form id="binary-form" class="boolean-form"><div class="binary-input-grid"><label>First decimal number<input name="left" type="number" value="10" min="0"></label><label>Second number or shift count<input name="right" type="number" value="12" min="0"></label><label>Fixed width<select name="width"><option value="4">4 bits</option><option value="8" selected>8 bits</option><option value="16">16 bits</option></select></label></div><fieldset class="bit-operation-group"><legend>Operation</legend><div class="bit-operation-buttons"><button type="button" data-bit-operation="AND" class="active">AND</button><button type="button" data-bit-operation="OR">OR</button><button type="button" data-bit-operation="XOR">XOR</button><button type="button" data-bit-operation="NOT">NOT</button><button type="button" data-bit-operation="LSHIFT">LEFT SHIFT</button><button type="button" data-bit-operation="RSHIFT">RIGHT SHIFT</button></div></fieldset></form><div id="binary-output" class="boolean-output"></div></div></section>`;

export function mountComponents() {
  const mount = (id, html) => {
    const target = document.getElementById(id);
    if (target) target.innerHTML = html;
  };
  mount('app-header', headerHtml);
  const main = document.getElementById('app-main');
  if (main) {
    main.innerHTML = booleanHtml + binaryHtml + sandboxViewHtml + icTesterViewHtml + networkViewHtml;
    const sidebarSlot = document.getElementById('sandbox-sidebar-slot');
    if (sidebarSlot) sidebarSlot.outerHTML = sandboxSidebarHtml;
    const toolbarSlot = document.getElementById('sandbox-toolbar-slot');
    if (toolbarSlot) toolbarSlot.outerHTML = sandboxToolbarHtml;
  }
  const modals = document.getElementById('app-modals');
  if (modals) modals.innerHTML = sandboxModalsHtml + globalModalsHtml;
  mount('app-footer', footerHtml);
}