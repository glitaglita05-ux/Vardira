import { fetchTVShows, fetchComics, getCuratedMovies } from './api.js';
import { getSavedStatuses, saveStatus, getSavedReviews, saveReview } from './tracker.js';

let masterCatalog = [];
let currentActiveIndex = null;

async function init() {
  const container = document.getElementById('media-container');

  try {
    const [shows, comics] = await Promise.all([fetchTVShows(), fetchComics()]);
    const movies = getCuratedMovies();

    masterCatalog = [...movies, ...shows, ...comics];
    renderGrid(masterCatalog);
  } catch (err) {
    console.error(err);
    container.innerHTML = '<div class="loading-state">Error initializing platform.</div>';
  }
}

window.renderGrid = function(items) {
  const container = document.getElementById('media-container');
  const userStatuses = getSavedStatuses();

  if (items.length === 0) {
    container.innerHTML = '<div class="loading-state">No matching titles found.</div>';
    return;
  }

  container.innerHTML = items.map((item) => {
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
            <div class="card-category">${item.category}</div>
            <div class="card-title" title="${item.title}">${item.title}</div>
          </div>
          <button class="card-action" onclick="window.openDetailView(${realIndex})">Explore</button>
        </div>
      </div>
    `;
  }).join('');
};

window.openDetailView = function(index) {
  const item = masterCatalog[index];
  if (!item) return;

  currentActiveIndex = index;

  document.getElementById('detailImg').src = item.cover_url;
  document.getElementById('detailCategory').innerText = item.category;
  document.getElementById('detailTitle').innerText = item.title;
  document.getElementById('detailRating').innerText = `★ ${item.rating} / 10`;
  document.getElementById('detailDesc').innerText = item.summary;

  const userStatuses = getSavedStatuses();
  document.getElementById('statusSelect').value = userStatuses[item.id] || '';

  renderReviews(item.id);

  document.getElementById('catalog-view').style.display = 'none';
  document.getElementById('searchBarContainer').style.display = 'none';
  document.getElementById('detail-view').style.display = 'block';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

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
  const reviewText = textInput.value.trim();

  if (!reviewText) return;

  saveReview(item.id, reviewText, spoilerCheck.checked);

  textInput.value = '';
  spoilerCheck.checked = false;
  renderReviews(item.id);
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
    if (r.spoiler) {
      return `
        <div class="review-card spoiler" onclick="this.classList.toggle('revealed')">
          <div class="spoiler-warning-tag">⚠️ Contains Spoiler (Click to reveal)</div>
          <div class="review-text">${r.text}</div>
        </div>
      `;
    } else {
      return `
        <div class="review-card">
          <div class="review-text">${r.text}</div>
        </div>
      `;
    }
  }).join('');
}

window.showCatalogView = function() {
  document.getElementById('detail-view').style.display = 'none';
  document.getElementById('catalog-view').style.display = 'block';
  document.getElementById('searchBarContainer').style.display = 'block';
  renderGrid(masterCatalog);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.filterCategory = function(category, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('searchInput').value = '';

  const userStatuses = getSavedStatuses();

  if (category === 'all') {
    renderGrid(masterCatalog);
  } else if (category === 'Watching' || category === 'Completed') {
    const filtered = masterCatalog.filter(i => userStatuses[i.id] === category);
    renderGrid(filtered);
  } else {
    const filtered = masterCatalog.filter(i => i.category === category);
    renderGrid(filtered);
  }
};

window.handleSearch = function() {
  const query = document.getElementById('searchInput').value.toLowerCase().trim();
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));

  const filtered = masterCatalog.filter(item => 
    item.title.toLowerCase().includes(query) || item.category.toLowerCase().includes(query)
  );
  renderGrid(filtered);
};

document.addEventListener('DOMContentLoaded', init);
