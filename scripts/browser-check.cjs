// Optional developer tooling only. The website itself does not run JavaScript.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const base = 'http://127.0.0.1:8765';
const output = path.join(__dirname, '../validation');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}),
  });
  try {
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    const errors = [];
    const results = [];
    page.on('pageerror', e => errors.push(String(e)));
    page.on('response', r => {
      if (r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
    });
    page.on('requestfailed', r => errors.push(`${r.url()} ${r.failure().errorText}`));
    for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 912 });
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      const layout = await page.evaluate(() => {
        const rect = e => {
          const r = e.getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
        };
        const core = rect(document.querySelector('.graph-core'));
        const cards = [...document.querySelectorAll('.architecture-card')].map(e => {
          const branch = getComputedStyle(e, '::after');
          return {
            ...rect(e), bottomRow: e.parentElement.classList.contains('bottom'),
            connectorHeight: parseFloat(branch.height),
            connectorLeft: parseFloat(branch.left), connectorWidth: parseFloat(branch.width),
            fontSizes: [...e.querySelectorAll('h3,p')].map(t => parseFloat(getComputedStyle(t).fontSize)),
            fits: [...e.querySelectorAll('h3,p')].every(t => {
              const box = t.getBoundingClientRect();
              const card = e.getBoundingClientRect();
              return box.left >= card.left && box.right <= card.right && box.top >= card.top && box.bottom <= card.bottom && t.scrollWidth <= t.clientWidth;
            }),
          };
        });
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          core, cards,
          targets: [...document.querySelectorAll('.site-header a, .button')]
            .filter(e => e.getBoundingClientRect().width > 0)
            .map(e => ({ text: e.textContent.trim() || e.getAttribute('aria-label'), ...rect(e) })),
          heading: rect(document.querySelector('h1')),
          hero: rect(document.querySelector('.hero')),
          strip: rect(document.querySelector('.feature-strip')),
          fontLoaded: document.fonts.check('700 16px Inter'),
        };
      });
      assert(!layout.overflow, `Horizontal overflow at ${width}`);
      assert(layout.fontLoaded, 'Self-hosted font did not load');
      assert.equal(layout.cards.length, 6);
      for (const card of layout.cards) {
        assert(card.fits, `Card text overflows at ${width}`);
        assert(card.fontSizes.every(s => s >= 12), `Card text below 12px at ${width}`);
        if (width >= 600) {
          const x = card.left + card.width / 2;
          assert(x >= layout.core.left && x <= layout.core.right, `Connector misses core horizontally at ${width}`);
          const end = card.bottomRow ? card.top + 1 - card.connectorHeight : card.bottom - 1 + card.connectorHeight;
          const edge = card.bottomRow ? layout.core.bottom : layout.core.top;
          assert(Math.abs(end - edge) <= 2, `Detached desktop connector at ${width}: ${end} / ${edge}`);
        } else {
          const spineX = card.left + 1 + card.connectorLeft;
          assert(spineX > layout.core.left && spineX < layout.core.right, `Spine misses core at ${width}`);
          assert(Math.abs(card.connectorLeft + card.connectorWidth) <= 1, `Branch misses mobile card at ${width}`);
        }
      }
      for (const target of layout.targets) assert(target.height >= 44, `Short touch target at ${width}: ${target.text}`);
      for (const link of await page.locator('a[href^="#"]').all()) {
        const href = await link.getAttribute('href');
        await link.focus();
        await link.click();
        assert.equal(await page.evaluate(() => location.hash), href);
      }
      results.push({ width, ...layout });
      console.log(`PASS ${width}px: overflow, six legible cards, connector endpoints, touch targets and anchors`);
    }
    for (const [width, height, name] of [[1440, 912, 'desktop'], [768, 1024, 'tablet'], [390, 844, 'mobile'], [320, 800, 'mobile-320']]) {
      await page.setViewportSize({ width, height });
      await page.goto(base);
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: width !== 1440 });
      if (width !== 1440) await page.screenshot({ path: path.join(output, `${name}-viewport.png`) });
      if (width < 600) await page.locator('.architecture').screenshot({ path: path.join(output, `${name}-architecture.png`) });
    }
    await page.getByRole('link', { name: 'Read the project background' }).click();
    assert(page.url().endsWith('/background.html'));
    await page.getByRole('link', { name: '← Agent Gov Graph home' }).click();
    assert(page.url().endsWith('/index.html'));
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    assert.equal(await page.getByRole('link', { name: 'Discuss research on GitHub' }).getAttribute('href'),
      'https://github.com/datadownunda/agent-gov-graph/issues/new?title=Research%20collaboration%20inquiry');
    // Verify the destination only; do not submit an inquiry.
    const favicon = await page.request.get(`${base}/favicon.svg`);
    assert.equal(favicon.status(), 200);
    assert.deepEqual(errors, []);
    fs.writeFileSync(path.join(output, 'browser-results.json'), JSON.stringify({ results, errors }, null, 2) + '\n');
    console.log('PASS background round trip, contact destination, reduced motion, favicon and zero failed local requests');
  } finally {
    await browser.close();
  }
})().catch(e => { console.error(e); process.exitCode = 1; });
