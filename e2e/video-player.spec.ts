import { test, expect } from '@playwright/test';

test.describe('ngVideo Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for AngularJS to bootstrap and compile the ng-video directive
    await page.waitForSelector('section.video.ng-scope');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('ngVideo');
    await expect(page.locator('.ng-video-container')).toBeVisible();
  });

  test('video element is present with vi-screen attribute', async ({ page }) => {
    const video = page.locator('video[vi-screen]');
    await expect(video).toBeAttached();
  });

  test('video element has a source set', async ({ page }) => {
    const video = page.locator('video[vi-screen]');
    // Wait for AngularJS to set the src attribute
    await expect(video).toHaveAttribute('src', /.+/);
  });

  test('play and pause controls are present', async ({ page }) => {
    const playBtn = page.locator('[vi-controls-play]');
    const pauseBtn = page.locator('[vi-controls-pause]');
    await expect(playBtn).toBeAttached();
    await expect(pauseBtn).toBeAttached();
  });

  test('controls section is visible', async ({ page }) => {
    const controls = page.locator('section.controls');
    await expect(controls).toBeAttached();
  });

  test('volume controls are present', async ({ page }) => {
    const decreaseBtn = page.locator('[vi-volume-decrease]');
    const increaseBtn = page.locator('[vi-volume-increase]');
    await expect(decreaseBtn).toBeAttached();
    await expect(increaseBtn).toBeAttached();
  });

  test('volume bar is rendered', async ({ page }) => {
    const volumeBar = page.locator('section.volume div.scale div.bar');
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
    const fsToggle = page.locator('[vi-full-screen-toggle]');
    await expect(fsToggle).toBeAttached();
  });

  test('feedback section is present', async ({ page }) => {
    const feedback = page.locator('section.feedback');
    await expect(feedback).toBeAttached();
  });

  test('duration display section exists', async ({ page }) => {
    const duration = page.locator('section.duration');
    await expect(duration).toBeAttached();
  });

  test('generic info section with messages is present', async ({ page }) => {
    const generic = page.locator('section.generic');
    await expect(generic).toBeAttached();
    // Messages span should contain M followed by a number
    const messagesSpan = page.locator('[vi-messages]');
    await expect(messagesSpan).toBeAttached();
  });

  test('playlist button is visible when playlist is closed', async ({ page }) => {
    const openPlaylistBtn = page.locator('span.open-playlist');
    await expect(openPlaylistBtn).toBeVisible();
  });

  test('clicking playlist button opens playlist', async ({ page }) => {
    const openPlaylistBtn = page.locator('span.open-playlist');
    await openPlaylistBtn.click();

    const playlist = page.locator('section.playlist');
    await expect(playlist).toBeVisible();

    // Playlist should have a title row and video items
    const playlistTitle = page.locator('section.playlist li.title');
    await expect(playlistTitle).toBeVisible();
    await expect(playlistTitle).toContainText('Playlist');
  });

  test('playlist shows video items', async ({ page }) => {
    // Open playlist
    await page.locator('span.open-playlist').click();

    // Should have at least 2 video items (from VideoController adding 2 sources)
    const videoItems = page.locator('section.playlist li[vi-playlist-video]');
    await expect(videoItems).toHaveCount(2);
  });

  test('playlist shows video names', async ({ page }) => {
    await page.locator('span.open-playlist').click();

    const videoItems = page.locator('section.playlist li[vi-playlist-video]');
    await expect(videoItems.first()).toContainText('Big Buck Bunny');
    await expect(videoItems.nth(1)).toContainText('The Bear');
  });

  test('playlist can be closed', async ({ page }) => {
    // Open playlist
    await page.locator('span.open-playlist').click();
    await expect(page.locator('section.playlist')).toBeVisible();

    // Close playlist
    const closeBtn = page.locator('section.playlist div.close-playlist');
    await closeBtn.click();

    // Playlist should be hidden
    await expect(page.locator('section.playlist')).toBeHidden();
  });

  test('clicking a playlist video changes the source', async ({ page }) => {
    const video = page.locator('video[vi-screen]');
    const initialSrc = await video.getAttribute('src');

    // Open playlist and click the second video
    await page.locator('span.open-playlist').click();
    const secondVideo = page.locator('section.playlist li[vi-playlist-video]').nth(1);
    await secondVideo.click();

    // Source should change
    await expect(video).not.toHaveAttribute('src', initialSrc!);
  });

  test('messages count is displayed', async ({ page }) => {
    const messagesSpan = page.locator('[vi-messages]');
    const text = await messagesSpan.textContent();
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

    const metaSpans = page.locator('section.playlist span[vi-meta]');
    const count = await metaSpans.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test('GitHub link is present', async ({ page }) => {
    const link = page.locator('section.generic a[href*="github.com"]');
    await expect(link).toBeAttached();
    await expect(link).toContainText('GitHub.com/Wildhoney/ngVideo');
  });
});
