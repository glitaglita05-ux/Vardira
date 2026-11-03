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

const forbiddenWords = [
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'dick', 'pussy', 'sex', 'porn', 
  'nigger', 'bastard', 'slut', 'whore', 'orgasm', 'cock', 'boob'
];

export function containsProfanity(text) {
  const lowerText = text.toLowerCase();
  return forbiddenWords.some(word => lowerText.includes(word));
}

export function saveReview(itemId, reviewText, isSpoiler, ratings, username) {
  const allReviews = getSavedReviews();
  if (!allReviews[itemId]) {
    allReviews[itemId] = [];
  }
  
  allReviews[itemId].unshift({
    id: 'rev_' + Date.now() + Math.random().toString(36).substring(2, 5),
    author: username || 'Anonymous Traveler',
    text: reviewText,
    spoiler: isSpoiler,
    ratings: ratings,
    likes: 0,
    likedByMe: false,
    date: new Date().toLocaleDateString()
  });
  
  localStorage.setItem('vardira_reviews', JSON.stringify(allReviews));
}

export function toggleLikeReview(itemId, reviewId) {
  const allReviews = getSavedReviews();
  if (!allReviews[itemId]) return;

  const review = allReviews[itemId].find(r => r.id === reviewId);
  if (review) {
    if (!review.likedByMe) {
      review.likes += 1;
      review.likedByMe = true;
    } else {
      review.likes -= 1;
      review.likedByMe = false;
    }
    allReviews[itemId].sort((a, b) => b.likes - a.likes);
    localStorage.setItem('vardira_reviews', JSON.stringify(allReviews));
  }
}

export function getUsername() {
  return localStorage.getItem('vardira_username') || '';
}

export function setUsername(name) {
  localStorage.setItem('vardira_username', name.trim() || 'Anonymous Traveler');
}
