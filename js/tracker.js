export function getSavedStatuses() {
  return JSON.parse(localStorage.getItem('vardira_statuses') || '{}');
}

export function saveStatus(id, status) {
  const statuses = getSavedStatuses();
  if (status === "") {
    delete statuses[id];
  } else {
    statuses[id] = status;
  }
  localStorage.setItem('vardira_statuses', JSON.stringify(statuses));
}

export function getSavedReviews() {
  return JSON.parse(localStorage.getItem('vardira_reviews') || '{}');
}

export function saveReview(itemId, reviewText, isSpoiler) {
  const allReviews = getSavedReviews();
  if (!allReviews[itemId]) {
    allReviews[itemId] = [];
  }
  allReviews[itemId].unshift({
    text: reviewText,
    spoiler: isSpoiler,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('vardira_reviews', JSON.stringify(allReviews));
}
