import headerHtml from '../components/app-header.html?raw';
import mobileNavHtml from '../components/mobile-nav.html?raw';
import sandboxViewHtml from '../components/sandbox-view.html?raw';
import sandboxModalsHtml from '../components/sandbox-modals.html?raw';
import networkViewHtml from '../components/network-view.html?raw';
import globalModalsHtml from '../components/global-modals.html?raw';
import footerHtml from '../components/app-footer.html?raw';

export function mountComponents() {
  const mount = (id, html) => {
    const target = document.getElementById(id);
    if (target) target.innerHTML = html;
  };
  mount('app-header', headerHtml);
  mount('mobile-navbar', mobileNavHtml);
  const main = document.getElementById('app-main');
  if (main) main.innerHTML = sandboxViewHtml + networkViewHtml;
  const modals = document.getElementById('app-modals');
  if (modals) modals.innerHTML = sandboxModalsHtml + globalModalsHtml;
  mount('app-footer', footerHtml);
}
