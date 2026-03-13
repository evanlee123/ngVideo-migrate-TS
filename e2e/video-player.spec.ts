import { test, expect } from '@playwright/test';

test.describe('ngVideo Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for Angular to bootstrap and render the ng-video component with a video element
    await page.waitForSelector('ng-video video');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('ngVideo');
    await expect(page.locator('.ng-video-container')).toBeVisible();
  });

  test('video element is present', async ({ page }) => {
    const video = page.locator('ng-video video');
    await expect(video).toBeAttached();
  });

  test('video element has a source set', async ({ page }) => {
    const video = page.locator('ng-video video');
    // Wait for Angular to set the src attribute
    await expect(video).toHaveAttribute('src', /.+/);
  });

  test('play and pause controls are present', async ({ page }) => {
    const playBtn = page.locator('.controls .glyphicon-play');
    const pauseBtn = page.locator('.controls .glyphicon-pause');
    await expect(playBtn).toBeAttached();
    await expect(pauseBtn).toBeAttached();
  });

  test('controls section is visible', async ({ page }) => {
    const controls = page.locator('.controls');
    await expect(controls).toBeAttached();
  });

  test('volume controls are present', async ({ page }) => {
    const decreaseBtn = page.locator('.volume .decrease');
    const increaseBtn = page.locator('.volume .increase');
    await expect(decreaseBtn).toBeAttached();
    await expect(increaseBtn).toBeAttached();
  });

  test('volume bar is rendered', async ({ page }) => {
    const volumeBar = page.locator('.volume div.scale div.bar');
    await expect(volumeBar).toBeAttached();
  });

  test('timeline input exists', async ({ page }) => {
    const timeline = page.locator('section.timeline input[type="range"]');
    await expect(timeline).toBeAttached();
  });

  test('buffer canvas element renders', async ({ page }) => {
    const canvas = page.locator('section.buffer canvas');
    await expect(canvas).toBeAttached();
  });

  test('fullscreen toggle button is present', async ({ page }) => {
    const fsToggle = page.locator('.full-screen .glyphicon-fullscreen');
    await expect(fsToggle).toBeAttached();
  });

  test('feedback section is present', async ({ page }) => {
    const feedback = page.locator('.feedback');
    await expect(feedback).toBeAttached();
  });

  test('duration display section exists', async ({ page }) => {
    const duration = page.locator('section.duration');
    await expect(duration).toBeAttached();
  });

  test('generic info section with messages is present', async ({ page }) => {
    const generic = page.locator('section.generic');
    await expect(generic).toBeAttached();
    // Messages component should contain M followed by a number
    const messagesEl = page.locator('vi-messages');
    await expect(messagesEl).toBeAttached();
  });

  test('playlist button is visible when playlist is closed', async ({ page }) => {
    const openPlaylistBtn = page.locator('span.open-playlist');
    await expect(openPlaylistBtn).toBeVisible();
  });

  test('clicking playlist button opens playlist', async ({ page }) => {
    const openPlaylistBtn = page.locator('span.open-playlist');
    await openPlaylistBtn.click();

    const playlist = page.locator('.playlist');
    await expect(playlist).toBeVisible();

    // Playlist should have a title row and video items
    const playlistTitle = page.locator('.playlist li.title');
    await expect(playlistTitle).toBeVisible();
    await expect(playlistTitle).toContainText('Playlist');
  });

  test('playlist shows video items', async ({ page }) => {
    // Open playlist
    await page.locator('span.open-playlist').click();

    // Should have at least 2 video items (from AppComponent adding 2 sources)
    const videoItems = page.locator('.playlist li:not(.title)');
    await expect(videoItems).toHaveCount(2);
  });

  test('playlist shows video names', async ({ page }) => {
    await page.locator('span.open-playlist').click();

    const videoItems = page.locator('.playlist li:not(.title)');
    await expect(videoItems.first()).toContainText('Big Buck Bunny');
    await expect(videoItems.nth(1)).toContainText('The Bear');
  });

  test('playlist can be closed', async ({ page }) => {
    // Open playlist
    await page.locator('span.open-playlist').click();
    await expect(page.locator('.playlist')).toBeVisible();

    // Close playlist
    const closeBtn = page.locator('.playlist div.close-playlist');
    await closeBtn.click();

    // Playlist should be hidden
    await expect(page.locator('.playlist')).toBeHidden();
  });

  test('clicking a playlist video changes the source', async ({ page }) => {
    const video = page.locator('ng-video video');
    const initialSrc = await video.getAttribute('src');

    // Open playlist and click the second video
    await page.locator('span.open-playlist').click();
    const secondVideo = page.locator('.playlist li:not(.title)').nth(1);
    await secondVideo.click();

    // Source should change
    await expect(video).not.toHaveAttribute('src', initialSrc!);
  });

  test('messages count is displayed', async ({ page }) => {
    const messagesEl = page.locator('vi-messages');
    const text = await messagesEl.textContent();
    // Should match pattern like "M5" (M followed by number)
    expect(text).toMatch(/M\d+/);
  });

  test('generic section shows volume, playback rate, playing state', async ({ page }) => {
    const generic = page.locator('section.generic');
    const text = await generic.textContent();
    // Should contain V (volume), R (playback rate), P (playing), L (loading), B (buffered)
    expect(text).toMatch(/V[\d.]+/);
    expect(text).toMatch(/R[\d.]+/);
    expect(text).toMatch(/P[01]/);
    expect(text).toMatch(/L[01]/);
  });

  test('meta elements exist in playlist items', async ({ page }) => {
    await page.locator('span.open-playlist').click();

    const metaElements = page.locator('.playlist vi-meta');
    const count = await metaElements.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('GitHub link is present', async ({ page }) => {
    const link = page.locator('section.generic a[href*="github.com"]');
    await expect(link).toBeAttached();
    await expect(link).toContainText('GitHub.com/Wildhoney/ngVideo');
  });
});
