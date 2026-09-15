async function mountRootLanding() {
  const response = await fetch('/landing.html');
  const html = await response.text();
  const landingDocument = new DOMParser().parseFromString(html, 'text/html');

  document.title = landingDocument.title;
  document.querySelector('meta[name="description"]')?.setAttribute(
    'content',
    landingDocument.querySelector('meta[name="description"]')?.content || ''
  );
  document.querySelector('#landing-root').innerHTML = landingDocument.body.innerHTML;
  await import('./landing.js');
}

mountRootLanding();