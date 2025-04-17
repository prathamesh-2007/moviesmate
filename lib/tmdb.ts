import { BASE_URL, headers, INDUSTRY_MAPPING } from './config/tmdb';
import { Movie, TVShow } from './types/tmdb';
import { getCertificationQuery } from './utils/certifications';
import { getRandomPage } from './utils/pagination';

// Cache with LRU implementation
class LRUCache {
  private capacity: number;
  private cache: Map<string, { data: any; timestamp: number }>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: string): any | undefined {
    const item = this.cache.get(key);
    if (item && Date.now() - item.timestamp < 2 * 60 * 1000) { // 2 minutes TTL
      this.cache.delete(key);
      this.cache.set(key, item); // Move to end (most recently used)
      return item.data;
    }
    if (item) {
      this.cache.delete(key); // Remove expired item
    }
    return undefined;
  }

  set(key: string, value: any): void {
    if (this.cache.size >= this.capacity) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, { data: value, timestamp: Date.now() });
  }
}

const cache = new LRUCache(100); // Store up to 100 items

async function fetchWithCache(url: string, options: RequestInit) {
  const cacheKey = url;
  const cached = cache.get(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    cache.set(cacheKey, data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

export const fetchMovies = async (params: {
  industry?: string;
  year?: string;
  genre?: string;
  contentRating?: string;
}) => {
  const { industry, year, genre, contentRating } = params;
  
  let baseUrl = `${BASE_URL}/discover/movie?include_adult=false&sort_by=release_date.desc`;
  
  if (industry) {
    const industryConfig = INDUSTRY_MAPPING[industry];
    if (industryConfig) {
      baseUrl += `&with_original_language=${industryConfig.language}`;
      baseUrl += `&region=${industryConfig.region}`;
    }
  }
  
  if (year) baseUrl += `&primary_release_year=${year}`;
  if (genre) baseUrl += `&with_genres=${genre}`;
  
  if (industry && contentRating) {
    baseUrl += getCertificationQuery(industry, contentRating);
  }

  const randomPage = await getRandomPage(baseUrl);
  const url = `${baseUrl}&page=${randomPage}`;

  try {
    const data = await fetchWithCache(url, { headers });
    
    if (!data.results?.length) {
      const firstPageData = await fetchWithCache(`${baseUrl}&page=1`, { headers });
      return (firstPageData.results || []).slice(0, 3);
    }
    
    return data.results.slice(0, 3);
  } catch (error) {
    console.error('Error fetching movies:', error);
    return [];
  }
};

export const fetchTVShows = async (params: {
  industry?: string;
  year?: string;
  genre?: string;
  contentRating?: string;
}) => {
  const { industry, year, genre } = params;
  
  let baseUrl = `${BASE_URL}/discover/tv?include_adult=false&sort_by=first_air_date.desc`;
  
  if (industry) {
    const industryConfig = INDUSTRY_MAPPING[industry];
    if (industryConfig) {
      baseUrl += `&with_original_language=${industryConfig.language}`;
      baseUrl += `&with_origin_country=${industryConfig.region}`;
    }
  }
  
  if (year) baseUrl += `&first_air_date_year=${year}`;
  if (genre) baseUrl += `&with_genres=${genre}`;

  const randomPage = await getRandomPage(baseUrl);
  const url = `${baseUrl}&page=${randomPage}`;

  try {
    const data = await fetchWithCache(url, { headers });
    
    let results = data.results || [];
    
    if (industry) {
      const industryConfig = INDUSTRY_MAPPING[industry];
      if (industryConfig) {
        results = results.filter((show: TVShow) => 
          show.origin_country.includes(industryConfig.region)
        );
      }
    }
    
    if (!results.length) {
      const firstPageData = await fetchWithCache(`${baseUrl}&page=1`, { headers });
      results = (firstPageData.results || []).filter((show: TVShow) => {
        if (!industry) return true;
        const industryConfig = INDUSTRY_MAPPING[industry];
        return industryConfig ? show.origin_country.includes(industryConfig.region) : true;
      });
    }
    
    return results.slice(0, 3);
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return [];
  }
};

export const fetchMovieDetails = async (id: number): Promise<Movie> => {
  const url = `${BASE_URL}/movie/${id}?language=en-US`;
  return fetchWithCache(url, { headers });
};

export const fetchMovieCredits = async (id: number) => {
  const url = `${BASE_URL}/movie/${id}/credits?language=en-US`;
  return fetchWithCache(url, { headers });
};

export const fetchTVShowDetails = async (id: number): Promise<TVShow> => {
  const url = `${BASE_URL}/tv/${id}?language=en-US`;
  return fetchWithCache(url, { headers });
};

export const fetchTrending = async () => {
  const url = `${BASE_URL}/trending/movie/day?language=en-US`;
  const data = await fetchWithCache(url, { headers });
  return data.results;
};

export const fetchPopular = async () => {
  const url = `${BASE_URL}/movie/now_playing?language=en-US`;
  const data = await fetchWithCache(url, { headers });
  return data.results;
};

export const fetchNowPlaying = async () => {
  const url = `${BASE_URL}/movie/now_playing?language=en-US&region=US`;
  const data = await fetchWithCache(url, { headers });
  return data.results;
};

export const fetchTopRatedMovies = async () => {
  const url = `${BASE_URL}/movie/top_rated?language=en-US`;
  const data = await fetchWithCache(url, { headers });
  return data.results;
};

export const fetchTopRatedTVShows = async () => {
  const url = `${BASE_URL}/tv/top_rated?language=en-US`;
  const data = await fetchWithCache(url, { headers });
  return data.results;
};

export const fetchMovieTrailer = async (id: number) => {
  const url = `${BASE_URL}/movie/${id}/videos?language=en-US`;
  const data = await fetchWithCache(url, { headers });
  return data.results.find((video: any) => video.type === 'Trailer');
};