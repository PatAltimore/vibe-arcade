/**
 * Vibe Arcade - Main Application Script
 * Loads game data from games.json and renders cards dynamically.
 */

// Accent colors cycling through neon palette for each card
const CARD_ACCENTS = [
  '#00ffff',   // cyan
  '#ff00ff',   // magenta
  '#ffff00',   // yellow
  '#00ff88',   // green
  '#ff6600',   // orange
  '#ff0088',   // pink
];

/**
 * Fetches the games list from games.json.
 * @returns {Promise<Array>} Array of game objects
 */
async function fetchGames() {
  const response = await fetch('games.json');
  if (!response.ok) {
    throw new Error(`Failed to load games.json (HTTP ${response.status})`);
  }
  return response.json();
}

/**
 * Creates an anchor element safely.
 * @param {string} href
 * @param {string} textContent
 * @param {string[]} classes
 * @returns {HTMLAnchorElement}
 */
function createLink(href, textContent, classes = []) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = textContent;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  classes.forEach(cls => a.classList.add(cls));
  return a;
}

/**
 * Builds a single game card element.
 * @param {Object} game - Game data object
 * @param {number} index - Card index (used for accent color)
 * @returns {HTMLElement}
 */
function buildGameCard(game, index) {
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length];

  // Card wrapper
  const card = document.createElement('article');
  card.classList.add('game-card');
  card.style.setProperty('--card-accent', accent);

  // Screenshot section — clicking navigates to game
  const screenshotLink = document.createElement('a');
  screenshotLink.href = game.url;
  screenshotLink.target = '_blank';
  screenshotLink.rel = 'noopener noreferrer';
  screenshotLink.setAttribute('aria-label', `Play ${game.title}`);

  const screenshotDiv = document.createElement('div');
  screenshotDiv.classList.add('card-screenshot');

  const img = document.createElement('img');
  img.src = game.screenshot;
  img.alt = `Screenshot of ${game.title}`;
  img.loading = 'lazy';
  img.onerror = () => {
    img.src = `https://placehold.co/600x400/0a0a2e/555577?text=${encodeURIComponent(game.title)}&font=monospace`;
  };

  screenshotDiv.appendChild(img);
  screenshotLink.appendChild(screenshotDiv);
  card.appendChild(screenshotLink);

  // Card body
  const body = document.createElement('div');
  body.classList.add('card-body');

  // Title
  const title = document.createElement('h2');
  title.classList.add('card-title');
  title.textContent = game.title;
  body.appendChild(title);

  // Summary
  const summary = document.createElement('p');
  summary.classList.add('card-summary');
  summary.textContent = game.summary;
  body.appendChild(summary);

  // Action buttons
  const actions = document.createElement('div');
  actions.classList.add('card-actions');

  // Play button
  const playBtn = createLink(game.url, '▶ PLAY', ['btn', 'btn-play']);
  actions.appendChild(playBtn);

  // GitHub button
  const githubBtn = createLink(game.repo, '⌥ Source', ['btn', 'btn-github']);
  actions.appendChild(githubBtn);

  body.appendChild(actions);
  card.appendChild(body);

  return card;
}

/**
 * Renders an error message in the container.
 * @param {HTMLElement} container
 * @param {string} message
 */
function renderError(container, message) {
  container.innerHTML = `
    <div class="error-message">
      <h2>!! SYSTEM ERROR !!</h2>
      <p>${message}</p>
      <p>Check that <code>games.json</code> exists and is valid JSON.</p>
    </div>
  `;
}

/**
 * Updates the game count badge.
 * @param {number} count
 */
function updateGameCount(count) {
  const badge = document.getElementById('game-count');
  if (badge) {
    badge.textContent = `${count} GAME${count !== 1 ? 'S' : ''} LOADED`;
  }
}

/**
 * Main initialization — fetches games and renders the card list.
 */
async function init() {
  const container = document.getElementById('cards-container');
  if (!container) return;

  try {
    const games = await fetchGames();

    if (!Array.isArray(games) || games.length === 0) {
      renderError(container, 'No games found in games.json.');
      return;
    }

    // Clear loading state
    container.innerHTML = '';
    container.classList.add('cards-grid');

    // Render each game card
    games.forEach((game, index) => {
      const card = buildGameCard(game, index);
      container.appendChild(card);
    });

    updateGameCount(games.length);

  } catch (err) {
    console.error('Vibe Arcade: Failed to load games:', err);
    renderError(container, err.message || 'Unknown error loading games.');
  }
}

// Kick off once DOM is ready
document.addEventListener('DOMContentLoaded', init);
