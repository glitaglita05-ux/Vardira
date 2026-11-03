// Ασιατικές Ταινίες & Curated Dramas (K-Drama, C-Drama, J-Drama, Thai, etc.)
export function getCuratedMovies() {
  return [
    {
      id: "asia_mov_1",
      title: "Parasite (기생충)",
      category: "Movies",
      country: "South Korea",
      rating: 9.6,
      cover_url: "https://image.tmdb.org/t/p/w500/7IiT5Z8fxW1vj9YBBqV2zKx3Z1p.jpg",
      summary: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
    },
    {
      id: "asia_mov_2",
      title: "Drive My Car (ドライブ・マイ・カー)",
      category: "Movies",
      country: "Japan",
      rating: 8.9,
      cover_url: "https://image.tmdb.org/t/p/w500/3U6F0i1N8xXk8mY2f5k9Z1X.jpg",
      summary: "An aging actor and director finds solace and unexpected connection with his assigned young female chauffeur."
    },
    {
      id: "asia_mov_3",
      title: "Better Days (少年的你)",
      category: "Movies",
      country: "China",
      rating: 9.2,
      cover_url: "https://image.tmdb.org/t/p/w500/5k3D1mX9F8Z2w7x8y9z0Z.jpg",
      summary: "A bullied high school girl and a teenage street thug form a bond while facing intense gaokao exams and murder investigations."
    },
    {
      id: "asia_mov_4",
      title: "Bad Genius (ฉลาดเกมส์โกง)",
      category: "Movies",
      country: "Thailand",
      rating: 9.0,
      cover_url: "https://image.tmdb.org/t/p/w500/r1q8f7yX7Z8w9Y0z1A2B3C4D.jpg",
      summary: "A genius high school student constructs an elaborate exam-cheating scheme that expands from school tests to international standardized exams."
    }
  ];
}

// Φόρτωση Δημοφιλών Ασιατικών Σειρών μέσω TVMaze API
export async function fetchTVShows() {
  const queryTitles = [
    'Squid Game', 'Crash Landing on You', 'Goblin', 'Vincenzo', 
    'The Untamed', 'Alice in Borderland', 'Girl From Nowhere', 
    'Someday or One Day', '2gether'
  ];

  try {
    const promises = queryTitles.map(title => 
      fetch(`https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(title)}`)
        .then(res => res.ok ? res.json() : null)
    );

    const results = await Promise.all(promises);

    return results.filter(show => show !== null).map(show => ({
      id: `tv_${show.id}`,
      title: show.name,
      category: "Series",
      country: show.network?.country?.name || "Asia",
      rating: show.rating?.average || 8.5,
      cover_url: show.image?.medium || 'https://via.placeholder.com/210x295?text=No+Cover',
      summary: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'No description available.'
    }));
  } catch (err) {
    console.error("Error fetching Asian TV shows:", err);
    return [];
  }
}

// Φόρτωση Ασιατικών Comics & Webtoons (AniList API)
export async function fetchComics() {
  const query = `
    query {
      Page(page: 1, perPage: 10) {
        media(type: MANGA, sort: POPULARITY_DESC, countryOfOrigin: "KR") {
          id
          title {
            english
            romaji
          }
          averageScore
          coverImage {
            large
          }
          description
        }
      }
    }
  `;

  try {
    const response = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ query })
    });

    const data = await response.json();
    const mediaList = data.data.Page.media;

    return mediaList.map(item => ({
      id: `comic_${item.id}`,
      title: item.title.english || item.title.romaji,
      category: "Comics",
      country: "South Korea",
      rating: (item.averageScore / 10).toFixed(1),
      cover_url: item.coverImage.large,
      summary: item.description ? item.description.replace(/<[^>]*>?/gm, '') : 'No description available.'
    }));
  } catch (err) {
    console.error("Error fetching Webtoons:", err);
    return [];
  }
}
