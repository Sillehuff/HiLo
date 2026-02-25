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

  await expect(page.locator('#weekly')).toBeVisible();
  await expect(page.locator('#weekStrip')).toHaveCount(1);
  await expect(page.locator('#calendarGrid .day-card')).toHaveCount(7);
  await expect(page.locator('#calendarGrid .class-item').first()).toBeVisible();

  await page.locator('button[data-tab=\"dashboard\"]').click();
  await expect(page.locator('#dashboard')).toBeVisible();
  await expect(page.locator('#plannedClassList')).toContainText('Spin');
  await expect.poll(async () => page.locator('#runnerUps tr').count()).toBeGreaterThan(0);

  await page.locator('button[data-tab=\"weekly\"]').click();
  await page.locator('#calendarGrid .class-actions button').first().click();
  await expect(page.locator('#class-modal')).toBeVisible();
  await page.locator('#cancel-modal').click();
  await expect(page.locator('#class-modal')).toHaveClass(/hidden/);

  await page.locator('button[data-tab=\"history\"]').click();
  await page.fill('#history-search', 'spin');
  await expect(page.locator('#historyTbody tr').first()).toBeVisible();

  await page.locator('button[data-tab=\"guests\"]').click();
  await page.fill('#guest-search-filter', 'Alice');
  await expect(page.locator('#guests-grid')).toContainText('Alice');

  await page.locator('button[data-tab=\"settings\"]').click();
  await expect(page.locator('#settings-auth-info')).toContainText('Not signed in');

  expect(pageErrors).toEqual([]);
  expect(errors).toEqual([]);
});
