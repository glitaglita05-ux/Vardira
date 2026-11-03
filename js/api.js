export function getCuratedMovies() {
  return [
    {
      id: "asia_mov_1",
      title: "Parasite",
      category: "Movies",
      country: "South Korea",
      rating: 9.6,
      cover_url: "https://image.tmdb.org/t/p/w500/7IiT5Z8fxW1vj9YBBqV2zKx3Z1p.jpg",
      summary: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
    },
    {
      id: "asia_mov_2",
      title: "Drive My Car",
      category: "Movies",
      country: "Japan",
      rating: 8.9,
      cover_url: "https://image.tmdb.org/t/p/w500/3U6F0i1N8xXk8mY2f5k9Z1X.jpg",
      summary: "An aging actor and director finds solace and unexpected connection with his assigned young female chauffeur."
    },
    {
      id: "asia_mov_3",
      title: "Better Days",
      category: "Movies",
      country: "China",
      rating: 9.2,
      cover_url: "https://image.tmdb.org/t/p/w500/5k3D1mX9F8Z2w7x8y9z0Z.jpg",
      summary: "A bullied high school girl and a teenage street thug form a bond while facing intense gaokao exams and murder investigations."
    },
    {
      id: "asia_mov_4",
      title: "Bad Genius",
      category: "Movies",
      country: "Thailand",
      rating: 9.0,
      cover_url: "https://image.tmdb.org/t/p/w500/r1q8f7yX7Z8w9Y0z1A2B3C4D.jpg",
      summary: "A genius high school student constructs an elaborate exam-cheating scheme that expands from school tests to international standardized exams."
    },
    {
      id: "asia_mov_5",
      title: "Train to Busan",
      category: "Movies",
      country: "South Korea",
      rating: 9.3,
      cover_url: "https://image.tmdb.org/t/p/w500/cu13f8U5WtSOz3vK23mPjEaZ9W6.jpg",
      summary: "While a zombie virus breaks out in South Korea, passengers struggle to survive on the train from Seoul to Busan."
    },
    {
      id: "asia_mov_6",
      title: "Your Name",
      category: "Movies",
      country: "Japan",
      rating: 9.5,
      cover_url: "https://image.tmdb.org/t/p/w500/q719jzvnlSdYkLZkPj9Xp7G9r29.jpg",
      summary: "Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?"
    }
  ];
}

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

    return results.filter(show => show !== null).map((show) => {
      let country = "South Korea";
      if (['Alice in Borderland'].includes(show.name)) country = "Japan";
      if (['The Untamed'].includes(show.name)) country = "China";
      if (['Girl From Nowhere', '2gether'].includes(show.name)) country = "Thailand";

      return {
        id: `tv_${show.id}`,
        title: show.name,
        category: "Series",
        country: country,
        rating: show.rating?.average || 8.5,
        cover_url: show.image?.medium || 'https://via.placeholder.com/210x295?text=No+Cover',
        summary: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'No description available.'
      };
    });
  } catch (err) {
    console.error("Error fetching Asian TV shows:", err);
    return [];
  }
}
