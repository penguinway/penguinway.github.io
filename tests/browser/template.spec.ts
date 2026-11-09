import { expect, test } from '@playwright/test';
import fs from 'node:fs/promises';

const playlist = { id: '7298728834454061071', server: 'qishui' };

test('template starts with local search and a configured capsule, without comments or a music hall', async ({
  page,
}) => {
  const requests: string[] = [];
  const errors: string[] = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  const vendor = new URL('./fixtures/music/', import.meta.url);
  const player = await fs.readFile(new URL('APlayer.min.js', vendor), 'utf8');
  const meting = await fs.readFile(new URL('Meting.min.js', vendor), 'utf8');
  // Observe attempted requests while isolating optional CDN availability.
  await page.route('**/*', (route) => {
    const address = new URL(route.request().url());
    if (address.hostname === '127.0.0.1') return route.continue();
    if (address.searchParams.get('id') === playlist.id)
      return route.fulfill({
        json: [
          {
            name: 'Template track',
            artist: 'Fixture',
            url: '/media/shortcodes/flower.mp4',
            cover: '/img/logo.png',
          },
        ],
      });
    if (address.pathname.endsWith('APlayer.min.js'))
      return route.fulfill({
        body: player,
        contentType: 'application/javascript',
      });
    if (address.pathname.endsWith('Meting.min.js'))
      return route.fulfill({
        body: meting,
        contentType: 'application/javascript',
      });
    return route.fulfill({ body: '', contentType: 'application/javascript' });
  });
  for (const route of [
    '/',
    '/p/writing/',
    '/music/',
    '/message/',
    '/recentcomments/',
    '/about/',
    '/links/',
    '/equipment/',
    '/brevity/',
    '/p/components/',
  ]) {
    await page.goto(route);
    await expect(page.locator('html')).toHaveAttribute(
      'data-solitude-runtime',
      'ready',
    );
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await page.locator('body').innerText()).not.toMatch(
      /\p{Script=Han}/u,
    );
    await expect(
      page.locator(
        '#post-comment, .card-recent-comment, #message-barrage, #Music-page .aplayer',
      ),
    ).toHaveCount(0);
    const capsule = page.locator('#nav-music solitude-meting');
    await expect(capsule).toHaveCount(1);
    await expect(capsule).toHaveAttribute('id', playlist.id);
    await expect(capsule).toHaveAttribute('server', playlist.server);
    await expect(capsule).toHaveAttribute('type', 'playlist');
    await expect(page.locator('#nav-music .aplayer')).toHaveCount(1);
    await expect(
      page.locator(
        '#menus a[href="/music/"], #menus a[href="/message/"], #menus a[href="/recentcomments/"]',
      ),
    ).toHaveCount(0);
  }
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute(
    'data-solitude-runtime',
    'ready',
  );
  await page.locator('#search-button a').click();
  await page.locator('#search-input').fill('hidden');
  await expect(page.locator('#search-results')).toContainText(
    'Hidden from the homepage',
  );
  expect(requests.some((url) => url.endsWith('/search.xml'))).toBe(true);
  expect(
    requests.some((url) => {
      const address = new URL(url);
      return (
        address.searchParams.get('id') === playlist.id &&
        address.searchParams.get('server') === playlist.server
      );
    }),
  ).toBe(true);
  expect(
    requests.filter((url) =>
      /lc-cn-|comments\.invalid|\/(?:valine|waline|twikoo|artalk)@|giscus\.app/i.test(
        url,
      ),
    ),
  ).toEqual([]);
  expect(errors).toEqual([]);
});
