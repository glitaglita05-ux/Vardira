import { fetchTVShows, getCuratedMovies } from './api.js';
import { getSavedStatuses, saveStatus, getSavedReviews, saveReview, containsProfanity, toggleLikeReview, getUsername, setUsername } from './tracker.js';

let masterCatalog = [];
let currentActiveIndex = null;
let currentFilter = 'all';
let currentPage = 1;
const itemsPerPage = 8;

async function init() {
  const container = document.getElementById('media-container');

  if (!getUsername()) {
    document.getElementById('usernameModal').style.display = 'flex';
  } else {
    document.getElementById('usernameModal').style.display = 'none';
  }

  try {
    const shows = await fetchTVShows();
    const movies = getCuratedMovies();

    masterCatalog = [...movies, ...shows];
    applyFilterAndPagination();
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading-state">Error initializing platform.</div>';
  }
}

window.saveUsername = function() {
  const input = document.getElementById('usernameInput').value.trim();
  if (input) {
    setUsername(input);
    document.getElementById('usernameModal').style.display = 'none';
  }
};

function getFilteredItems() {
  const userStatuses = getSavedStatuses();

  if (currentFilter === 'all') {
    return masterCatalog;
  } else if (['Watching', 'Completed', 'Plan to Watch', 'On-Hold', 'Dropped'].includes(currentFilter)) {
    return masterCatalog.filter(i => userStatuses[i.id] === currentFilter);
  } else if (['South Korea', 'Japan', 'China', 'Thailand'].includes(currentFilter)) {
    return masterCatalog.filter(i => i.country === currentFilter);
  } else {
    return masterCatalog.filter(i => i.category === currentFilter);
  }
}

window.renderGrid = function() {
  const container = document.getElementById('media-container');
  const paginationContainer = document.getElementById('paginationContainer');
  const userStatuses = getSavedStatuses();

  const filteredItems = getFilteredItems();

  if (filteredItems.length === 0) {
    container.innerHTML = '<div class="loading-state">No titles found in this view.</div>';
    paginationContainer.innerHTML = '';
    return;
  }

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = 1;

  const start = (currentPage - 1) * itemsPerPage;
  const paginatedItems = filteredItems.slice(start, start + itemsPerPage);

  container.innerHTML = paginatedItems.map((item) => {
    const status = userStatuses[item.id];
    const statusBadge = status ? `<div class="card-status-tag">${status}</div>` : '';
    const realIndex = masterCatalog.findIndex(m => m.id === item.id);

    return `
      <div class="card">
        <div class="card-img-wrapper">
          <img src="${item.cover_url}" alt="${item.title}" loading="lazy">
          ${statusBadge}
          <div class="card-badge">★ ${item.rating}</div>
        </div>
        <div class="card-content">
          <div>
            <div class="card-category">${item.country} • ${item.category}</div>
            <div class="card-title" title="${item.title}">${item.title}</div>
          </div>
          <button class="card-action" onclick="window.openDetailView(${realIndex})">Explore</button>
        </div>
      </div>
    `;
  }).join('');

  if (totalPages > 1) {
    let pagesHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const activeClass = i === currentPage ? 'page-btn active' : 'page-btn';
      pagesHTML += `<button class="${activeClass}" onclick="window.changePage(${i})">${i}</button>`;
    }
    paginationContainer.innerHTML = pagesHTML;
  } else {
    paginationContainer.innerHTML = '';
  }
};

window.changePage = function(page) {
  currentPage = page;
  renderGrid();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.openDetailView = function(index) {
  const item = masterCatalog[index];
  if (!item) return;

  currentActiveIndex = index;

  document.getElementById('detailImg').src = item.cover_url;
  document.getElementById('detailCategory').innerText = `${item.country} • ${item.category}`;
  document.getElementById('detailTitle').innerText = item.title;
  document.getElementById('detailRating').innerText = `★ ${item.rating} / 10`;
  document.getElementById('detailDesc').innerText = item.summary;

  const userStatuses = getSavedStatuses();
  document.getElementById('statusSelect').value = userStatuses[item.id] || '';

  setupRatingInputs();
  renderReviews(item.id);

  document.getElementById('catalog-view').style.display = 'none';
  document.getElementById('searchBarContainer').style.display = 'none';
  document.getElementById('detail-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

function setupRatingInputs() {
  const container = document.getElementById('ratingInputsContainer');
  container.innerHTML = `
    <div class="rating-group">
      <label>Acting Rating</label>
      <select id="rateActing">
        <option value="10">10 - Masterpiece</option>
        <option value="9">9 - Exceptional</option>
        <option value="8" selected>8 - Great</option>
        <option value="7">7 - Good</option>
        <option value="6">6 - Above Average</option>
        <option value="5">5 - Average</option>
        <option value="4">4 - Below Average</option>
        <option value="3">3 - Bad</option>
        <option value="2">2 - Terrible</option>
        <option value="1">1 - Unwatchable</option>
      </select>
    </div>
    <div class="rating-group">
      <label>Storyline Rating</label>
      <select id="rateStoryline">
        <option value="10">10 - Masterpiece</option>
        <option value="9">9 - Exceptional</option>
        <option value="8" selected>8 - Great</option>
        <option value="7">7 - Good</option>
        <option value="6">6 - Above Average</option>
        <option value="5">5 - Average</option>
        <option value="4">4 - Below Average</option>
        <option value="3">3 - Bad</option>
        <option value="2">2 - Terrible</option>
        <option value="1">1 - Unwatchable</option>
      </select>
    </div>
  `;
}

window.updateTitleStatus = function() {
  const item = masterCatalog[currentActiveIndex];
  if (!item) return;
  const selectedStatus = document.getElementById('statusSelect').value;
  saveStatus(item.id, selectedStatus);
};

window.submitReview = function() {
  const item = masterCatalog[currentActiveIndex];
  if (!item) return;

  const textInput = document.getElementById('reviewInput');
  const spoilerCheck = document.getElementById('spoilerCheck');
  const errorBox = document.getElementById('filterError');
  const reviewText = textInput.value.trim();

  if (!reviewText) return;

  if (containsProfanity(reviewText)) {
    errorBox.style.display = 'block';
    return;
  }
  errorBox.style.display = 'none';

  const ratings = {
    acting: document.getElementById('rateActing').value,
    storyline: document.getElementById('rateStoryline').value
  };

  saveReview(item.id, reviewText, spoilerCheck.checked, ratings, getUsername());

  textInput.value = '';
  spoilerCheck.checked = false;
  renderReviews(item.id);
};

window.handleLike = function(itemId, reviewId) {
  toggleLikeReview(itemId, reviewId);
  renderReviews(itemId);
};

function renderReviews(itemId) {
  const container = document.getElementById('reviewsContainer');
  const allReviews = getSavedReviews();
  const itemReviews = allReviews[itemId] || [];

  if (itemReviews.length === 0) {
    container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">No reviews yet. Be the first to share your thoughts!</div>';
    return;
  }

  container.innerHTML = itemReviews.map(r => {
    let ratingDisplay = '';
    if (r.ratings) {
      if (r.ratings.acting) ratingDisplay += `🎭 Acting: ${r.ratings.acting}/10 &nbsp;`;
      if (r.ratings.storyline) ratingDisplay += `📖 Storyline: ${r.ratings.storyline}/10`;
    }

    const likeClass = r.likedByMe ? 'like-btn liked' : 'like-btn';
    const likeIcon = r.likedByMe ? '❤️' : '🤍';

    const contentBox = r.spoiler ? `
      <div class="review-card spoiler" onclick="this.classList.toggle('revealed')">
        <div class="spoiler-warning-tag">⚠️ Contains Spoiler (Click to reveal)</div>
        <div class="review-text">${r.text}</div>
      </div>
    ` : `
      <div class="review-text">${r.text}</div>
    `;

    return `
      <div class="review-card">
        <div class="review-header">
          <span class="review-author">@${r.author}</span>
          <span>${r.date}</span>
        </div>
        ${ratingDisplay ? `<div class="review-ratings-badge">${ratingDisplay}</div>` : ''}
        ${contentBox}
        <div class="review-footer">
          <button class="${likeClass}" onclick="window.handleLike('${itemId}', '${r.id}')">
            ${likeIcon} <span>${r.likes}</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

window.showCatalogView = function() {
  document.getElementById('detail-view').style.display = 'none';
  document.getElementById('catalog-view').style.display = 'block';
  document.getElementById('searchBarContainer').style.display = 'block';

  renderGrid();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.filterCategory = function(category, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.getElementById('searchInput').value = '';

  currentFilter = category;
  currentPage = 1;
  renderGrid();
};

function applyFilterAndPagination() {
  currentPage = 1;
  renderGrid();
}

window.handleSearch = function() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

  const container = document.getElementById('media-container');
  const paginationContainer = document.getElementById('paginationContainer');
  const userStatuses = getSavedStatuses();

  const filtered = masterCatalog.filter(item => 
    item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query) || item.country.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    container.innerHTML = '<div class="loading-state">No titles found matching your search.</div>';
    paginationContainer.innerHTML = '';
    return;
  }

  container.innerHTML = filtered.map((item) => {
    const status = userStatuses[item.id];
    const statusBadge = status ? `<div class="card-status-tag">${status}</div>` : '';
    const realIndex = masterCatalog.findIndex(m => m.id === item.id);

    return `
      <div class="card">
        <div class="card-img-wrapper">
          <img src="${item.cover_url}" alt="${item.title}" loading="lazy">
          ${statusBadge}
          <div class="card-badge">★ ${item.rating}</div>
        </div>
        <div class="card-content">
          <div>
            <div class="card-category">${item.country} • ${item.category}</div>
            <div class="card-title" title="${item.title}">${item.title}</div>
          </div>
          <button class="card-action" onclick="window.openDetailView(${realIndex})">Explore</button>
        </div>
      </div>
    `;
  }).join('');
  
  paginationContainer.innerHTML = '';
};

window.openResetModal = function() {
  document.getElementById('resetModal').style.display = 'flex';
};

window.closeResetModal = function() {
  document.getElementById('resetModal').style.display = 'none';
};

window.confirmResetData = function() {
  localStorage.removeItem('vardira_statuses');
  localStorage.removeItem('vardira_reviews');
  closeResetModal();
  
  currentFilter = 'all';
  currentPage = 1;
  document.querySelectorAll('.filter-btn').forEach((b, idx) => {
    if (idx === 0) b.classList.add('active');
    else b.classList.remove('active');
  });

  renderGrid();
};

document.addEventListener('DOMContentLoaded', init);
