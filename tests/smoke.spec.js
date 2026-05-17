const { test, expect } = require('@playwright/test');

function isoDateLocal(offsetDays = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildFixture() {
  const today = isoDateLocal(0);
  const twoWeeksAgo = isoDateLocal(-14);
  const sixWeeksAgo = isoDateLocal(-42);
  const nextClassDate = isoDateLocal(1);
  return {
    records: [
      { date: twoWeeksAgo, time: '09:00', guest: 'Alice M.', playlist: '2', classType: 'Spin' },
      { date: sixWeeksAgo, time: '09:00', guest: 'Ben T.', playlist: '1', classType: 'Spin' },
      { date: twoWeeksAgo, time: '09:00', guest: 'Carla D.', playlist: '3', classType: 'Spin' },
      { date: today, time: '10:00', guest: 'Alice M.', playlist: '3', classType: 'Spin' }
    ],
    weeklyPlan: [
      [
        `${nextClassDate}T09:00`,
        {
          date: nextClassDate,
          time: '09:00',
          playlist: '',
          attendees: ['Alice M.', 'Ben T.', 'Carla D.'],
          status: 'draft',
          notes: '',
          classType: 'Spin'
        }
      ]
    ],
    allGuests: ['Alice M.', 'Ben T.', 'Carla D.'],
    playlistTags: [
      ['1', ['Spin']],
      ['2', ['Spin']],
      ['3', ['Spin']],
      ['4', ['HIIT']]
    ],
    playlistStatus: [
      ['1', 'Active'],
      ['2', 'Active'],
      ['3', 'Active'],
      ['4', 'Active']
    ]
  };
}

async function topVisibleScheduleDay(page) {
  return page.locator('#a-scroller').evaluate((scroller) => {
    const sticky = document.querySelector('#a-week-strip-wrap');
    const stickyHeight = sticky?.getBoundingClientRect().height || 52;
    const stickyTopRaw = sticky ? parseFloat(getComputedStyle(sticky).top) : 0;
    const stickyTop = Number.isFinite(stickyTopRaw) ? stickyTopRaw : 0;
    const scrollerRect = scroller.getBoundingClientRect();
    const targetTop = scrollerRect.top + stickyTop + stickyHeight + 12;
    let active = scroller.querySelector('.a-day-section');
    scroller.querySelectorAll('.a-day-section').forEach((section) => {
      if (section.getBoundingClientRect().top <= targetTop) active = section;
    });
    return active?.dataset.dayIso || '';
  });
}

async function centeredRailDay(page) {
  return page.locator('[data-week-strip-scroller]').evaluate((rail) => {
    const railRect = rail.getBoundingClientRect();
    const railCenter = railRect.left + (railRect.width / 2);
    let closest = null;
    let closestDistance = Infinity;
    rail.querySelectorAll('.a-day-cell').forEach((cell) => {
      const rect = cell.getBoundingClientRect();
      const cellCenter = rect.left + (rect.width / 2);
      const distance = Math.abs(cellCenter - railCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = cell;
      }
    });
    return closest?.dataset.dayIso || '';
  });
}

const firebaseCompatStub = `
(function() {
  if (window.firebase) return;
  function makeDoc(path) {
    return {
      _path: path,
      collection(name) { return makeCollection(path + '/' + name); },
      doc(id) { return makeDoc(path + '/' + id); },
      set() { return Promise.resolve(); },
      delete() { return Promise.resolve(); },
      update() { return Promise.resolve(); },
      onSnapshot(_opts, cb) {
        if (typeof _opts === 'function') cb = _opts;
        if (cb) setTimeout(() => cb({ docs: [], empty: true, metadata: { fromCache: true, hasPendingWrites: false } }), 0);
        return function unsubscribe() {};
      },
      get() { return Promise.resolve({ exists: false, data: () => ({}) }); }
    };
  }
  function makeCollection(path) {
    return {
      _path: path,
      doc(id) { return makeDoc(path + '/' + (id || 'auto-id')); },
      collection(name) { return makeCollection(path + '/' + name); },
      onSnapshot(_opts, cb) {
        if (typeof _opts === 'function') cb = _opts;
        if (cb) setTimeout(() => cb({ docs: [], empty: true, metadata: { fromCache: true, hasPendingWrites: false } }), 0);
        return function unsubscribe() {};
      },
      get() { return Promise.resolve({ docs: [], empty: true }); }
    };
  }
  const authInstance = {
    onAuthStateChanged(cb) {
      setTimeout(() => cb(null), 0);
      return function unsubscribe() {};
    },
    signInWithPopup() { return Promise.reject({ code: 'auth/popup-blocked', message: 'stubbed in smoke test' }); },
    signInWithRedirect() { return Promise.resolve(); },
    signOut() { return Promise.resolve(); }
  };
  function authFn() { return authInstance; }
  authFn.GoogleAuthProvider = function GoogleAuthProvider() {};

  const firestoreInstance = {
    enablePersistence() { return Promise.resolve(); },
    collection(name) { return makeCollection(name); },
    batch() {
      return {
        set() {},
        delete() {},
        update() {},
        commit() { return Promise.resolve(); }
      };
    }
  };
  function firestoreFn() { return firestoreInstance; }

  window.firebase = {
    initializeApp() {},
    auth: authFn,
    firestore: firestoreFn
  };
})();
`;

test('class editor sheet stays horizontally fixed on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.route(/https:\/\/www\.gstatic\.com\/firebasejs\/.*\/firebase-.*compat\.js/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: firebaseCompatStub
    });
  });

  const fixture = buildFixture();
  await page.addInitScript((data) => {
    localStorage.setItem('hiloPlaylistData', JSON.stringify(data));
  }, fixture);

  await page.goto('/');

  const scheduledDay = page.locator(`.a-day-section[data-day-iso="${fixture.weeklyPlan[0][1].date}"]`);
  await scheduledDay.locator('.a-class-row').click();
  await scheduledDay.locator('.a-guest-row__name', { hasText: 'Alice M.' }).click();

  const sheet = page.locator('.hilo-sheet').last();
  await expect(sheet.locator('.hilo-sheet__title')).toHaveText('Edit Class');

  const body = sheet.locator('.hilo-sheet__body');
  const metrics = await body.evaluate((el) => ({
    clientWidth: el.clientWidth,
    scrollWidth: el.scrollWidth
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);

  await body.evaluate((el) => { el.scrollLeft = 120; });
  await expect.poll(() => body.evaluate((el) => el.scrollLeft)).toBe(0);
});

test('redesigned app smoke flow works in local unsigned mode', async ({ page }) => {
  const errors = [];
  const pageErrors = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  await page.route(/https:\/\/www\.gstatic\.com\/firebasejs\/.*\/firebase-.*compat\.js/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: firebaseCompatStub
    });
  });

  const fixture = buildFixture();
  await page.addInitScript((data) => {
    localStorage.setItem('hiloPlaylistData', JSON.stringify(data));
  }, fixture);

  await page.goto('/');

  await expect(page.locator('#a-scroller')).toBeVisible();
  await expect(page.locator('#a-week-strip-wrap')).toHaveCount(1);
  await expect.poll(() => page.locator('#a-agenda .a-day-section').count()).toBeGreaterThanOrEqual(140);
  await expect(page.locator('[data-week-strip-scroller]')).toBeVisible();

  const scheduledDay = page.locator(`.a-day-section[data-day-iso="${fixture.weeklyPlan[0][1].date}"]`);
  await expect(scheduledDay.locator('.a-class-row')).toHaveCount(1);
  await expect(scheduledDay.locator('.a-empty-day--add')).toBeVisible();
  await expect(scheduledDay.locator('.a-empty-day--add')).toContainText('Plan class');
  await scheduledDay.locator('.a-class-row').click();
  await expect(scheduledDay.locator('.a-guest-row__name', { hasText: 'Alice M.' })).toBeVisible();
  await scheduledDay.locator('.a-guest-row__name', { hasText: 'Alice M.' }).click();
  await expect(page.locator('.hilo-sheet__title').last()).toHaveText('Edit Class');
  await page.locator('.hilo-sheet__close').last().click();
  await expect(page.locator('.hilo-sheet')).toHaveCount(0);

  await scheduledDay.locator('.a-empty-day--add').click();
  await expect(scheduledDay.locator('.a-empty-expand')).toBeVisible();
  await scheduledDay.locator('.a-empty-expand .a-field-row').first().click();
  await expect(page.locator('.hilo-sheet__title').last()).toHaveText('New Class');

  const guestSearch = page.locator('.hilo-sheet').last().locator('.sheet-guest-entry input');
  await guestSearch.fill('Alice');
  await page.locator('.hilo-sheet').last().locator('.sheet-guest-suggestion-pill', { hasText: 'Alice M.' }).click();
  await expect(guestSearch).toHaveValue('');

  const selectedGuest = page.locator('.hilo-sheet').last().locator('.sheet-selected-guest', { hasText: 'Alice M.' });
  await expect(selectedGuest).toBeVisible();
  await expect(page.locator('.hilo-sheet').last().locator('.sheet-selected-guest__check')).toHaveCount(0);
  await expect.poll(async () => selectedGuest.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      borderStyle: styles.borderTopStyle,
      hasBorder: parseFloat(styles.borderTopWidth) > 0,
      background: styles.backgroundColor
    };
  })).toEqual({
    borderStyle: 'solid',
    hasBorder: true,
    background: 'rgb(234, 226, 248)'
  });

  await page.locator('.hilo-sheet__close').last().click();
  await expect(page.locator('.hilo-sheet')).toHaveCount(0);

  await page.locator('button[data-tab=\"history\"]').click();
  await expect(page.locator('.hilo-header__title')).toHaveText('History');
  await page.locator('.h-search-input').fill('spin');
  await expect(page.locator('.h-search-input')).toHaveValue('spin');

  await page.locator('button[data-tab=\"guests\"]').click();
  await expect(page.locator('.hilo-header__title')).toHaveText('Guests');
  await page.locator('.g-search-input').fill('Alice');
  await expect(page.locator('.g-list')).toContainText('Alice');

  await page.locator('button[data-tab=\"more\"]').click();
  await expect(page.locator('.hilo-header__title')).toHaveText('More');
  await page.locator('.m-row', { hasText: 'Settings' }).click();
  await expect(page.locator('.s-title')).toHaveText('Settings');
  await expect(page.locator('.s-sync-pill')).toContainText('Not signed in');

  expect(pageErrors).toEqual([]);
  expect(errors).toEqual([]);
});

test('schedule defaults to today and syncs the horizontal date rail while scrolling', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.route(/https:\/\/www\.gstatic\.com\/firebasejs\/.*\/firebase-.*compat\.js/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: firebaseCompatStub
    });
  });

  const fixture = buildFixture();
  const today = isoDateLocal(0);
  const oldClassDate = isoDateLocal(-42);
  fixture.weeklyPlan.push([
    `${oldClassDate}T08:00`,
    {
      date: oldClassDate,
      time: '08:00',
      playlist: '2',
      attendees: ['Ben T.'],
      status: 'finalized',
      notes: '',
      classType: 'Spin'
    }
  ]);

  await page.addInitScript((data) => {
    localStorage.setItem('hiloPlaylistData', JSON.stringify(data));
  }, fixture);

  await page.goto('/');

  const rail = page.locator('[data-week-strip-scroller]');
  await expect(rail).toBeVisible();
  await expect.poll(() => page.locator('.a-day-cell--active').getAttribute('data-day-iso')).toBe(today);
  await expect.poll(() => topVisibleScheduleDay(page)).toBe(today);
  await page.waitForTimeout(250);
  const todayRailLeft = await rail.evaluate((el) => el.scrollLeft);
  const railMetrics = await rail.evaluate((el) => ({
    clientWidth: el.clientWidth,
    scrollWidth: el.scrollWidth,
    buttonCount: el.querySelectorAll('.a-day-cell').length
  }));
  expect(railMetrics.scrollWidth).toBeGreaterThan(railMetrics.clientWidth);
  expect(railMetrics.buttonCount).toBeGreaterThanOrEqual(140);

  await rail.hover();
  await page.mouse.wheel(400, 0);
  let railScrolledDate = '';
  await expect.poll(async () => {
    const left = await rail.evaluate((el) => el.scrollLeft);
    const active = await page.locator('.a-day-cell--active').getAttribute('data-day-iso');
    const centered = await centeredRailDay(page);
    const topVisible = await topVisibleScheduleDay(page);
    railScrolledDate = centered;
    return left > todayRailLeft && active === centered && topVisible === centered && centered !== today;
  }).toBe(true);
  expect(railScrolledDate).not.toBe(today);

  await page.locator(`.a-day-cell[data-day-iso="${oldClassDate}"]`).click();

  const oldSection = page.locator(`.a-day-section[data-day-iso="${oldClassDate}"]`);
  await expect(oldSection.locator('.a-class-row')).toBeVisible();
  await expect.poll(() => page.locator('.a-day-cell--active').getAttribute('data-day-iso')).toBe(oldClassDate);
  await expect.poll(() => topVisibleScheduleDay(page)).toBe(oldClassDate);
  await expect.poll(async () => {
    const left = await rail.evaluate((el) => el.scrollLeft);
    return left < todayRailLeft;
  }).toBe(true);
});

test('schedule sticky rail respects the mobile safe area', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  await page.route(/https:\/\/www\.gstatic\.com\/firebasejs\/.*\/firebase-.*compat\.js/, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: firebaseCompatStub
    });
  });

  const fixture = buildFixture();
  await page.addInitScript((data) => {
    localStorage.setItem('hiloPlaylistData', JSON.stringify(data));
  }, fixture);

  await page.goto('/');
  await page.addStyleTag({ content: ':root { --safe-top: 47px !important; }' });

  await page.locator('#a-scroller').evaluate((scroller) => {
    scroller.scrollTop += 1200;
    scroller.dispatchEvent(new Event('scroll'));
  });

  await expect.poll(() => page.locator('#a-week-strip-wrap').evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const top = parseFloat(getComputedStyle(el).top);
    return {
      cssTop: Math.round(Number.isFinite(top) ? top : 0),
      visualTop: Math.round(rect.top)
    };
  })).toEqual({ cssTop: 47, visualTop: 47 });
});
