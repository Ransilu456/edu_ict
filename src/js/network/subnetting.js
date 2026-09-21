export function initSubnetting(container) {
  if (!container) return;

  container.innerHTML = `
    <div class="sn-lab">
      <div class="sn-header">
        <div class="sn-title-wrap">
          <span class="sn-badge">NETWORKING / LAYER 3</span>
          <h2>Subnetting &amp; CIDR Calculator</h2>
          <p class="sn-subtitle">Analyze IPv4 networks, visualize network vs host bits, calculate subnets, and practice for A/L ICT exams.</p>
        </div>
      </div>

      <div class="sn-grid">
        <!-- Input & Configuration Card -->
        <div class="sn-card sn-input-card">
          <h3 class="sn-card-title">Network Configuration</h3>
          
          <div class="sn-form-group">
            <label for="sn-ip-input">IP Address</label>
            <div class="sn-ip-field-wrap">
              <input type="text" id="sn-ip-input" class="sn-input" value="192.168.1.10" placeholder="e.g. 192.168.1.10" spellcheck="false" />
              <span class="sn-slash">/</span>
              <input type="number" id="sn-cidr-input" class="sn-input sn-input-cidr" min="1" max="30" value="24" />
            </div>
          </div>

          <div class="sn-slider-group">
            <div class="sn-slider-header">
              <span>CIDR Prefix: /<strong id="sn-cidr-val">24</strong></span>
              <span id="sn-mask-preview">255.255.255.0</span>
            </div>
            <input type="range" id="sn-cidr-slider" min="1" max="30" value="24" class="sn-range" />
            <div class="sn-slider-ticks">
              <span>/8 (Class A)</span>
              <span>/16 (Class B)</span>
              <span>/24 (Class C)</span>
              <span>/30</span>
            </div>
          </div>

          <div class="sn-quick-presets">
            <span class="sn-presets-label">Presets:</span>
            <button type="button" class="sn-preset-btn" data-ip="192.168.1.0" data-cidr="24">192.168.1.0/24</button>
            <button type="button" class="sn-preset-btn" data-ip="10.0.0.0" data-cidr="16">10.0.0.0/16</button>
            <button type="button" class="sn-preset-btn" data-ip="172.16.0.0" data-cidr="20">172.16.0.0/20</button>
            <button type="button" class="sn-preset-btn" data-ip="192.168.0.0" data-cidr="27">192.168.0.0/27</button>
          </div>
        </div>

        <!-- Binary Bit Visualization Card -->
        <div class="sn-card sn-vis-card">
          <h3 class="sn-card-title">32-Bit Binary Layout</h3>
          <p class="sn-vis-legend">
            <span class="sn-leg-item"><span class="sn-swatch net"></span> Network Bits (<span id="sn-net-bits-count">24</span>)</span>
            <span class="sn-leg-item"><span class="sn-swatch host"></span> Host Bits (<span id="sn-host-bits-count">8</span>)</span>
          </p>

          <div class="sn-bit-octets" id="sn-bit-display">
            <!-- Rendered by JS -->
          </div>
        </div>
      </div>

      <!-- Network Details Output Cards -->
      <div class="sn-results-grid">
        <div class="sn-stat-card">
          <div class="sn-stat-label">Network Address</div>
          <div class="sn-stat-val text-cyan" id="res-net-addr">192.168.1.0</div>
          <div class="sn-stat-sub">First address in block (Identifies the wire)</div>
        </div>
        <div class="sn-stat-card">
          <div class="sn-stat-label">Broadcast Address</div>
          <div class="sn-stat-val text-amber" id="res-bc-addr">192.168.1.255</div>
          <div class="sn-stat-sub">Last address (Sends to all hosts)</div>
        </div>
        <div class="sn-stat-card">
          <div class="sn-stat-label">Usable Host Range</div>
          <div class="sn-stat-val text-green" id="res-host-range">192.168.1.1 - 192.168.1.254</div>
          <div class="sn-stat-sub">Assignable to computers, printers, routers</div>
        </div>
        <div class="sn-stat-card">
          <div class="sn-stat-label">Usable Hosts</div>
          <div class="sn-stat-val text-purple" id="res-usable-hosts">254</div>
          <div class="sn-stat-sub">Formula: 2<sup>H</sup> - 2 = 2<sup>8</sup> - 2</div>
        </div>
        <div class="sn-stat-card">
          <div class="sn-stat-label">Subnet Mask</div>
          <div class="sn-stat-val" id="res-subnet-mask">255.255.255.0</div>
          <div class="sn-stat-sub">Wildcard: <span id="res-wildcard">0.0.0.255</span></div>
        </div>
        <div class="sn-stat-card">
          <div class="sn-stat-label">IP Class &amp; Scope</div>
          <div class="sn-stat-val text-blue" id="res-class-scope">Class C · Private (RFC 1918)</div>
          <div class="sn-stat-sub" id="res-total-subnets">Subnet capacity: 1 block</div>
        </div>
      </div>

      <!-- Subnet Sub-division Table Card -->
      <div class="sn-card sn-table-card">
        <div class="sn-card-header-flex">
          <h3 class="sn-card-title">Subnet Sub-Division (Borrowing Bits)</h3>
          <div class="sn-subdivide-ctrls">
            <span>Split this network into:</span>
            <select id="sn-split-select" class="sn-select">
              <option value="2">2 Subnets (Borrow 1 bit)</option>
              <option value="4" selected>4 Subnets (Borrow 2 bits)</option>
              <option value="8">8 Subnets (Borrow 3 bits)</option>
              <option value="16">16 Subnets (Borrow 4 bits)</option>
            </select>
          </div>
        </div>
        
        <div class="sn-table-responsive">
          <table class="sn-table">
            <thead>
              <tr>
                <th>Subnet #</th>
                <th>Network ID</th>
                <th>Subnet Mask</th>
                <th>Usable Range</th>
                <th>Broadcast Address</th>
                <th>Hosts / Subnet</th>
              </tr>
            </thead>
            <tbody id="sn-split-tbody">
              <!-- Rendered by JS -->
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  bindEvents(container);
  calculate(container);
}

function bindEvents(c) {
  const ipInput = c.querySelector('#sn-ip-input');
  const cidrInput = c.querySelector('#sn-cidr-input');
  const slider = c.querySelector('#sn-cidr-slider');
  const splitSelect = c.querySelector('#sn-split-select');

  function updateCidr(val) {
    const num = Math.max(1, Math.min(30, Number(val) || 24));
    if (cidrInput) cidrInput.value = num;
    if (slider) slider.value = num;
    c.querySelector('#sn-cidr-val').textContent = num;
    calculate(c);
  }

  ipInput?.addEventListener('input', () => calculate(c));
  cidrInput?.addEventListener('input', (e) => updateCidr(e.target.value));
  slider?.addEventListener('input', (e) => updateCidr(e.target.value));
  splitSelect?.addEventListener('change', () => calculate(c));

  c.querySelectorAll('.sn-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (ipInput) ipInput.value = btn.dataset.ip;
      updateCidr(btn.dataset.cidr);
    });
  });
}

function ipToInt(ip) {
  const parts = ip.trim().split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) return null;
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255
  ].join('.');
}

function getMask(cidr) {
  if (cidr === 0) return 0;
  return ((0xFFFFFFFF << (32 - cidr)) >>> 0);
}

function calculate(c) {
  const ipStr = c.querySelector('#sn-ip-input')?.value || '192.168.1.1';
  const cidr = Math.max(1, Math.min(30, parseInt(c.querySelector('#sn-cidr-input')?.value, 10) || 24));

  let ipInt = ipToInt(ipStr);
  if (ipInt === null) ipInt = ipToInt('192.168.1.1');

  const maskInt = getMask(cidr);
  const wildcardInt = (~maskInt) >>> 0;
  const netInt = (ipInt & maskInt) >>> 0;
  const bcInt = (netInt | wildcardInt) >>> 0;

  const totalHosts = Math.pow(2, 32 - cidr);
  const usableHosts = totalHosts > 2 ? totalHosts - 2 : 0;
  const firstHostInt = usableHosts > 0 ? netInt + 1 : netInt;
  const lastHostInt = usableHosts > 0 ? bcInt - 1 : bcInt;

  // Mask string
  const maskStr = intToIp(maskInt);
  const wildcardStr = intToIp(wildcardInt);
  c.querySelector('#sn-mask-preview').textContent = maskStr;
  c.querySelector('#sn-net-bits-count').textContent = cidr;
  c.querySelector('#sn-host-bits-count').textContent = 32 - cidr;

  // Results display
  c.querySelector('#res-net-addr').textContent = intToIp(netInt);
  c.querySelector('#res-bc-addr').textContent = intToIp(bcInt);
  c.querySelector('#res-host-range').textContent = usableHosts > 0
    ? `${intToIp(firstHostInt)} — ${intToIp(lastHostInt)}`
    : 'None (Point-to-point / Subnet ID only)';
  c.querySelector('#res-usable-hosts').textContent = usableHosts.toLocaleString();
  c.querySelector('#res-subnet-mask').textContent = maskStr;
  c.querySelector('#res-wildcard').textContent = wildcardStr;

  // Class & Scope
  const firstOctet = (ipInt >>> 24) & 255;
  let ipClass = 'Class C';
  if (firstOctet < 128) ipClass = 'Class A';
  else if (firstOctet < 192) ipClass = 'Class B';
  else if (firstOctet < 224) ipClass = 'Class C';
  else if (firstOctet < 240) ipClass = 'Class D (Multicast)';
  else ipClass = 'Class E (Experimental)';

  let scope = 'Public Internet';
  if (firstOctet === 10) scope = 'Private (10.0.0.0/8)';
  else if (firstOctet === 172 && ((ipInt >>> 16) & 255) >= 16 && ((ipInt >>> 16) & 255) <= 31) scope = 'Private (172.16.0.0/12)';
  else if (firstOctet === 192 && ((ipInt >>> 16) & 255) === 168) scope = 'Private (192.168.0.0/16)';
  else if (firstOctet === 127) scope = 'Loopback';

  c.querySelector('#res-class-scope').textContent = `${ipClass} · ${scope}`;
  c.querySelector('#res-total-subnets').innerHTML = `Subnet capacity: <strong>2<sup>${32 - cidr}</sup> = ${totalHosts.toLocaleString()}</strong> IPs in block`;

  // Render Binary Bits
  renderBits(c, ipInt, cidr);

  // Render Subdivisions
  renderSubdivisions(c, netInt, cidr);
}

function renderBits(c, ipInt, cidr) {
  const container = c.querySelector('#sn-bit-display');
  if (!container) return;

  const binStr = (ipInt >>> 0).toString(2).padStart(32, '0');
  let html = '';

  for (let octet = 0; octet < 4; octet++) {
    const octetBits = binStr.slice(octet * 8, (octet + 1) * 8);
    const octetVal = (ipInt >>> (24 - octet * 8)) & 255;

    html += `<div class="sn-octet-col">
      <div class="sn-octet-header">Octet ${octet + 1}: <strong>${octetVal}</strong></div>
      <div class="sn-octet-bits">`;

    for (let b = 0; b < 8; b++) {
      const bitIndex = octet * 8 + b;
      const isNet = bitIndex < cidr;
      const bitChar = octetBits[b];
      html += `<span class="sn-bit ${isNet ? 'net-bit' : 'host-bit'}" title="Bit ${bitIndex + 1}: ${isNet ? 'Network' : 'Host'} bit">${bitChar}</span>`;
    }

    html += `</div></div>`;
  }

  container.innerHTML = html;
}

function renderSubdivisions(c, baseNetInt, cidr) {
  const tbody = c.querySelector('#sn-split-tbody');
  const splitCount = parseInt(c.querySelector('#sn-split-select')?.value, 10) || 4;
  if (!tbody) return;

  const borrowBits = Math.log2(splitCount);
  const newCidr = cidr + borrowBits;

  if (newCidr > 30) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#ef4444;padding:16px;">Cannot divide: new prefix would exceed /30 limit.</td></tr>`;
    return;
  }

  const subSize = Math.pow(2, 32 - newCidr);
  const subMask = getMask(newCidr);
  const maskStr = intToIp(subMask);
  const usable = subSize > 2 ? subSize - 2 : 0;

  let rows = '';
  for (let i = 0; i < splitCount; i++) {
    const net = (baseNetInt + i * subSize) >>> 0;
    const bc = (net + subSize - 1) >>> 0;
    const first = usable > 0 ? net + 1 : net;
    const last = usable > 0 ? bc - 1 : bc;

    rows += `
      <tr>
        <td><strong>#${i + 1}</strong></td>
        <td><code class="text-cyan">${intToIp(net)}/${newCidr}</code></td>
        <td>${maskStr}</td>
        <td><code class="text-green">${intToIp(first)} - ${intToIp(last)}</code></td>
        <td><code class="text-amber">${intToIp(bc)}</code></td>
        <td><span class="sn-badge-sub">${usable.toLocaleString()} hosts</span></td>
      </tr>
    `;
  }

  tbody.innerHTML = rows;
}
