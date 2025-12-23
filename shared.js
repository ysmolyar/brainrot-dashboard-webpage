// Shared JavaScript for Brainrot dashboards

// Supabase configuration
const SUPABASE_URL = 'https://tuueizexidbuvvgvxpms.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR1dWVpemV4aWRidXZ2Z3Z4cG1zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MjM2NjksImV4cCI6MjA4MTM5OTY2OX0.lQ0MVBF98Jvc8qzP4M3W2osRvWQlUuCHeVTajuERi7A';

// Password gate
const CORRECT_PASSWORD_HASH = '107458b366671198f2e4845cc0a436f532c1e5db47d61c79d2ad11aa419cc980';

// Shared state
let granularity = 'hourly';

// ============================================
// Time Range Functions (PST-based)
// ============================================

function getTimeRange() {
  const range = document.getElementById('time-range').value;
  const now = new Date();

  // Get midnight PST for today
  // Get today's date in PST as YYYY-MM-DD, then parse as midnight PST
  const pstDateStr = now.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' }); // YYYY-MM-DD
  const todayMidnightPST = new Date(pstDateStr + 'T00:00:00-08:00');

  switch (range) {
    case '24h':
      // Start at the beginning of the hour 23 hours ago to get 24 total periods (current hour + 23 previous)
      const start24h = new Date(now - 23 * 60 * 60 * 1000);
      start24h.setMinutes(0, 0, 0);
      return { start: start24h, end: now };
    case 'today':
      return { start: todayMidnightPST, end: now };
    case 'yesterday':
      const yesterdayPST = new Date(todayMidnightPST - 24 * 60 * 60 * 1000);
      return { start: yesterdayPST, end: todayMidnightPST };
    case '7d':
      // Today + 6 previous whole days = 7 days total (in PST)
      return { start: new Date(todayMidnightPST - 6 * 24 * 60 * 60 * 1000), end: now };
    case '14d':
      return { start: new Date(todayMidnightPST - 13 * 24 * 60 * 60 * 1000), end: now };
    case '30d':
      return { start: new Date(todayMidnightPST - 29 * 24 * 60 * 60 * 1000), end: now };
    case '90d':
      return { start: new Date(todayMidnightPST - 89 * 24 * 60 * 60 * 1000), end: now };
    case '180d':
      return { start: new Date(todayMidnightPST - 179 * 24 * 60 * 60 * 1000), end: now };
    default:
      return { start: new Date(todayMidnightPST - 6 * 24 * 60 * 60 * 1000), end: now };
  }
}

function updateSubtitle() {
  const range = document.getElementById('time-range').value;
  const labels = {
    '24h': 'Last 24 Hours',
    'today': 'Today',
    'yesterday': 'Yesterday',
    '7d': 'Last 7 Days',
    '14d': 'Last 14 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '180d': 'Last 180 Days'
  };
  const updatedEl = document.getElementById('updated');
  if (updatedEl) {
    updatedEl.textContent = labels[range] || range;
  }
}

function handleTimeRangeChange() {
  const range = document.getElementById('time-range').value;

  // Auto-switch granularity based on time range
  // For 7 days or more, default to daily
  // For 24h, today, yesterday, default to hourly
  if (range === '7d' || range === '14d' || range === '30d' || range === '90d' || range === '180d') {
    if (granularity === 'hourly') {
      selectGranularity('daily');
    }
  } else if (range === '24h' || range === 'today' || range === 'yesterday') {
    if (granularity === 'daily') {
      selectGranularity('hourly');
    }
  }

  updateSubtitle();
  if (typeof render === 'function') {
    render();
  }
}

// ============================================
// Granularity Functions
// ============================================

function toggleGranularityDropdown() {
  const menu = document.getElementById('granularity-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

function selectGranularity(g) {
  granularity = g;
  document.getElementById('granularity-label').textContent = g === 'hourly' ? 'Hourly' : 'Daily';
  document.getElementById('granularity-menu').style.display = 'none';
  if (typeof render === 'function') {
    render();
  }
}

// ============================================
// Menu Functions
// ============================================

function toggleNavDropdown() {
  const menu = document.getElementById('nav-dropdown-menu');
  menu.classList.toggle('open');
}

function toggleHamburgerMenu() {
  const dropdown = document.getElementById('hamburger-dropdown');
  dropdown.classList.toggle('open');
}

function selectTimeRange(value) {
  document.getElementById('time-range').value = value;
  updateHamburgerMenuSelection();
  handleTimeRangeChange();
  toggleHamburgerMenu();
}

function selectTimezone(value) {
  document.getElementById('timezone').value = value;
  updateHamburgerMenuSelection();
  if (typeof render === 'function') {
    render();
  }
  toggleHamburgerMenu();
}

function updateHamburgerMenuSelection() {
  const timeRange = document.getElementById('time-range').value;
  const timezone = document.getElementById('timezone').value;

  // Update time range options
  document.querySelectorAll('.menu-section:first-child .menu-option').forEach(opt => {
    const match = opt.getAttribute('onclick')?.match(/'([^']+)'/);
    if (match) {
      opt.classList.toggle('active', match[1] === timeRange);
    }
  });

  // Update timezone options
  document.querySelectorAll('.menu-section:nth-child(2) .menu-option').forEach(opt => {
    const match = opt.getAttribute('onclick')?.match(/'([^']+)'/);
    if (match) {
      opt.classList.toggle('active', match[1] === timezone);
    }
  });
}

// Close menus when clicking outside
document.addEventListener('click', function(e) {
  // Close hamburger menu
  const menu = document.querySelector('.hamburger-menu');
  const dropdown = document.getElementById('hamburger-dropdown');
  if (menu && dropdown && !menu.contains(e.target) && dropdown.classList.contains('open')) {
    dropdown.classList.remove('open');
  }

  // Close nav dropdown
  const navDropdown = document.querySelector('.nav-dropdown');
  const navMenu = document.getElementById('nav-dropdown-menu');
  if (navDropdown && navMenu && !navDropdown.contains(e.target) && navMenu.classList.contains('open')) {
    navMenu.classList.remove('open');
  }

  // Close granularity dropdown
  const granularityDropdown = document.querySelector('.granularity-dropdown');
  const granularityMenu = document.getElementById('granularity-menu');
  if (granularityDropdown && granularityMenu && !granularityDropdown.contains(e.target)) {
    granularityMenu.style.display = 'none';
  }
});

// ============================================
// Bucket Key Functions (PST-based)
// ============================================

function createBucketKey(ts, start, end) {
  if (!ts) return null;
  const date = new Date(ts);
  if (date < start || date > end) return null;

  // The data is stored in UTC but needs to be shifted back 8 hours
  // to correct for the timezone issue (bucket by PST)
  const correctedDate = new Date(date.getTime() - 8 * 60 * 60 * 1000);
  const correctedTs = correctedDate.toISOString();

  if (granularity === 'daily') {
    return correctedTs.slice(0, 10);
  } else {
    return correctedTs.slice(0, 13);
  }
}

// ============================================
// Label Formatting Functions
// ============================================

function formatBucketLabel(bucket) {
  const displayTimezone = document.getElementById('timezone').value;

  // Bucket keys are in PST (America/Los_Angeles) after the -8 hour correction
  // We need to interpret them as PST, then display in the user's selected timezone

  if (granularity === 'daily') {
    // Daily bucket like "2025-12-21" is a PST date
    // For daily, the date itself doesn't shift between PST/EST, just display it
    const [year, month, day] = bucket.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12, 0, 0); // noon local time
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    return dateStr;
  } else {
    // Hourly bucket like "2025-12-21T20" is 8pm PST
    // Parse as PST, then format in user's display timezone
    const pstDate = new Date(bucket + ':00:00-08:00'); // Parse with PST offset
    const dateStr = pstDate.toLocaleDateString('en-US', {
      timeZone: displayTimezone,
      weekday: 'short'
    });
    const timeStr = pstDate.toLocaleTimeString('en-US', {
      timeZone: displayTimezone,
      hour: 'numeric'
    });
    return `${dateStr}, ${timeStr.toLowerCase()}`;
  }
}

// ============================================
// Password/Auth Functions
// ============================================

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkPassword(event) {
  event.preventDefault();
  const password = document.getElementById('password-input').value;
  const hash = await hashPassword(password);

  if (hash === CORRECT_PASSWORD_HASH) {
    localStorage.setItem('brainrot_auth', hash);
    showDashboard();
  } else {
    document.getElementById('password-error').style.display = 'block';
    document.getElementById('password-input').value = '';
  }
  return false;
}

function showDashboard() {
  document.getElementById('password-gate').classList.add('hidden');
  const dashboard = document.getElementById('dashboard-content');
  dashboard.classList.add('visible');
  dashboard.classList.add('loading-content');
  if (typeof fetchData === 'function') {
    fetchData();
  }
}

function hideSkeletons() {
  const dashboard = document.getElementById('dashboard-content');
  if (dashboard) {
    dashboard.classList.remove('loading-content');
  }
}

async function checkAuth() {
  const storedHash = localStorage.getItem('brainrot_auth');
  if (storedHash === CORRECT_PASSWORD_HASH) {
    showDashboard();
  }
}

// ============================================
// Pull to Refresh (Mobile)
// ============================================

let pullStartY = 0;
let currentPullDistance = 0;
let isPulling = false;
let isRefreshing = false;
let hasTriggeredHaptic = false;
const pullThreshold = 60;
const maxPull = 120;

function haptic(style = 'light') {
  if ('vibrate' in navigator) {
    if (style === 'light') navigator.vibrate(10);
    else if (style === 'medium') navigator.vibrate(20);
    else if (style === 'success') navigator.vibrate([10, 50, 20]);
  }
}

function initPullToRefresh() {
  const spinner = document.getElementById('ptr-spinner');
  const dashboard = document.getElementById('dashboard-content');

  if (!spinner || !dashboard) return;

  document.addEventListener('touchstart', (e) => {
    if (isRefreshing) return;

    // Check if we're at the top
    if (window.scrollY <= 0) {
      pullStartY = e.touches[0].clientY;
      isPulling = true;
      hasTriggeredHaptic = false;
      currentPullDistance = 0;
      dashboard.style.transition = 'none';
      spinner.style.transition = 'none';
    }
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const rawPull = currentY - pullStartY;

    // Only activate when pulling down and at top of page
    if (rawPull > 0 && window.scrollY <= 0) {
      // Apply resistance curve - gets harder to pull as you go
      const resistance = Math.max(0.4 - (rawPull / 1000), 0.2);
      currentPullDistance = Math.min(rawPull * resistance, maxPull);

      // Move the entire dashboard content down
      dashboard.style.transform = `translateY(${currentPullDistance}px)`;

      // Position and show spinner
      spinner.style.top = `${currentPullDistance - 30}px`;
      spinner.style.opacity = Math.min(currentPullDistance / pullThreshold, 1);
      spinner.classList.add('visible');

      // Rotate spinner based on pull progress
      const rotation = (currentPullDistance / pullThreshold) * 360;
      const svgEl = spinner.querySelector('svg');
      if (svgEl) {
        svgEl.style.transform = `rotate(${rotation}deg)`;
      }

      // Haptic when crossing threshold
      if (currentPullDistance >= pullThreshold && !hasTriggeredHaptic) {
        hasTriggeredHaptic = true;
        haptic('medium');
      } else if (currentPullDistance < pullThreshold && hasTriggeredHaptic) {
        hasTriggeredHaptic = false;
      }
    }
  }, { passive: true });

  document.addEventListener('touchend', async () => {
    if (!isPulling || isRefreshing) return;
    isPulling = false;

    dashboard.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    spinner.style.transition = 'top 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';

    if (currentPullDistance >= pullThreshold) {
      // Trigger refresh
      isRefreshing = true;
      haptic('success');

      // Hold at refresh position
      dashboard.style.transform = 'translateY(50px)';
      spinner.style.top = '20px';
      spinner.classList.add('refreshing');

      // Do the refresh
      if (typeof fetchData === 'function') {
        await fetchData(true);
      }

      // Reset after refresh
      setTimeout(() => {
        dashboard.style.transform = 'translateY(0)';
        spinner.style.top = '-50px';
        spinner.style.opacity = '0';
        spinner.classList.remove('visible', 'refreshing');
        isRefreshing = false;
      }, 300);
    } else {
      // Snap back
      dashboard.style.transform = 'translateY(0)';
      spinner.style.top = '-50px';
      spinner.style.opacity = '0';
      spinner.classList.remove('visible');
    }
  }, { passive: true });
}

// Initialize pull to refresh when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPullToRefresh);
} else {
  initPullToRefresh();
}
