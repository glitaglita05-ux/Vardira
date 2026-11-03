export async function fetchTVShows() {
  try {
    const res = await fetch('https://api.tvmaze.com/shows');
    const data = await res.json();
    return data.slice(0, 18).map((show, idx) => ({
      id: 'tv_' + idx,
      title: show.name,
      category: 'Series',
      rating: show.rating && show.rating.average ? show.rating.average : '7.5',
      cover_url: show.image ? show.image.original || show.image.medium : 'https://via.placeholder.com/210x295/121824/f8fafc?text=No+Cover',
      summary: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'No description available.',
    }));
  } catch (err) {
    console.error("TVMaze API Error:", err);
    return [];
  }
}

export async function fetchComics() {
  const anilistQuery = `
    query {
      Page(page: 1, perPage: 18) {
        media(type: MANGA, sort: TRENDING_DESC) {
          id
          title { english romaji }
          coverImage { extraLarge large }
          averageScore
          description
        }
      }
    }
  `;

  try {
    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ query: anilistQuery })
    });
    const json = await res.json();
    if (!json.data || !json.data.Page) return [];
    
    return json.data.Page.media.map(m => ({
      id: 'comic_' + m.id,
      title: m.title.english || m.title.romaji || 'Untitled',
      category: 'Comics',
      rating: m.averageScore ? (m.averageScore / 10).toFixed(1) : '8.0',
      cover_url: m.coverImage ? (m.coverImage.extraLarge || m.coverImage.large) : 'https://via.placeholder.com/210x295/121824/f8fafc?text=No+Cover',
      summary: m.description ? m.description.replace(/<[^>]*>?/gm, '') : 'No description available.',
    }));
  } catch (err) {
    console.error("AniList API Error:", err);
    return [];
  }
}

export function getCuratedMovies() {
  return [
    { id: 'mov_1', title: "Midnight Echoes", category: "Movies", rating: "8.4", cover_url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop&q=80", summary: "A dark atmospheric thriller following a mysterious investigation." },
    { id: 'mov_2', title: "Crimson Veil", category: "Movies", rating: "8.1", cover_url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80", summary: "An intense romantic drama exploring forbidden alliances." },
    { id: 'mov_3', title: "Neon Syndicate", category: "Movies", rating: "7.9", cover_url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80", summary: "In a futuristic underworld, a rogue crew plans a heist." }
  ];
}
