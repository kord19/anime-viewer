import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';

// Queries
const GET_ANIME_LIST = gql`
  query GetAnimeList($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME) {
        id
        title {
          romaji
        }
        coverImage {
          large
        }
        genres
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const SEARCH_ANIME = gql`
  query SearchAnime($search: String!, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, search: $search) {
        id
        title {
          romaji
        }
        coverImage {
          large
        }
        genres
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const GET_ANIME_BY_LETTER = gql`
  query GetAnimeByLetter($letter: String!, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, search: $letter) {
        id
        title {
          romaji
        }
        coverImage {
          large
        }
        genres
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const GET_ANIME_BY_GENRE = gql`
  query GetAnimeByGenre($genre: String!, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, genre_in: [$genre]) {
        id
        title {
          romaji
        }
        coverImage {
          large
        }
        genres
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const GET_GENRES = gql`
  {
    GenreCollection
  }
`;

function AnimeList() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(50);  // Aumentando o número de animes por página
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [animeList, setAnimeList] = useState([]);

  const { loading, error, data, fetchMore } = useQuery(GET_ANIME_LIST, {
    variables: { page, perPage },
    notifyOnNetworkStatusChange: true,
    skip: searchQuery || letterFilter || genreFilter,
    onCompleted: data => {
      if (!searchQuery && !letterFilter && !genreFilter) {
        setAnimeList(data.Page.media);
      }
    },
  });

  const { loading: searchLoading, error: searchError, data: searchResult } = useQuery(SEARCH_ANIME, {
    variables: { search: searchQuery, page: 1, perPage },
    skip: !searchQuery,
    onCompleted: data => {
      setAnimeList(data.Page.media);
    },
  });

  const { loading: letterLoading, error: letterError, data: letterResult } = useQuery(GET_ANIME_BY_LETTER, {
    variables: { letter: letterFilter, page: 1, perPage },
    skip: !letterFilter,
    onCompleted: data => {
      setAnimeList(data.Page.media);
    },
  });

  const { loading: genreLoading, error: genreError, data: genreResult } = useQuery(GET_ANIME_BY_GENRE, {
    variables: { genre: genreFilter, page: 1, perPage },
    skip: !genreFilter,
    onCompleted: data => {
      setAnimeList(data.Page.media);
    },
  });

  const { loading: genreListLoading, error: genreListError, data: genreData } = useQuery(GET_GENRES);

  const loadMore = () => {
    if (genreFilter && genreResult?.Page.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          genre: genreFilter,
          page: page + 1,
        },
      }).then((newData) => {
        setPage(prevPage => prevPage + 1);
        setAnimeList(prevList => [...prevList, ...newData.data.Page.media]);
      });
    } else if (letterFilter && letterResult?.Page.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          letter: letterFilter,
          page: page + 1,
        },
      }).then((newData) => {
        setPage(prevPage => prevPage + 1);
        setAnimeList(prevList => [...prevList, ...newData.data.Page.media]);
      });
    } else if (searchQuery && searchResult?.Page.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          search: searchQuery,
          page: page + 1,
        },
      }).then((newData) => {
        setPage(prevPage => prevPage + 1);
        setAnimeList(prevList => [...prevList, ...newData.data.Page.media]);
      });
    } else if (data?.Page.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          page: page + 1,
        },
      }).then((newData) => {
        setPage(prevPage => prevPage + 1);
        setAnimeList(prevList => [...prevList, ...newData.data.Page.media]);
      });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        === document.documentElement.offsetHeight
      ) {
        loadMore();
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [data, fetchMore, page]);

  if (loading && !animeList.length && !searchQuery && !letterFilter && !genreFilter) return <p>Loading...</p>;
  if (error || searchError || letterError || genreError || genreListError) return <p>Error :(</p>;

  const handleSearch = () => {
    setSearchQuery(searchQuery.trim());
  };

  const handleLetterClick = (letter) => {
    setLetterFilter(letter);
    setPage(1);
  };

  const handleGenreChange = (event) => {
    setGenreFilter(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLetterFilter('');
    setGenreFilter('');
    setPage(1);
  };

  return (
    <div className="main-content">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search for an anime..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="search-icon" onClick={handleSearch}>🔍</button>
        <button className="clear-filters" onClick={clearFilters}>❌ Clear Filters</button>
      </div>
      <div className="letter-buttons">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(letter => (
          <button key={letter} onClick={() => handleLetterClick(letter)}>
            {letter}
          </button>
        ))}
      </div>
      <div className="genre-filter">
        <select value={genreFilter} onChange={handleGenreChange}>
          <option value="">All Genres</option>
          {genreData && genreData.GenreCollection.map(genre => (
            <option key={genre} value={genre}>{genre}</option>
          ))}
        </select>
      </div>
      <div className="anime-list">
        {animeList.map(anime => (
          <div className="anime-list-item" key={anime.id}>
            <Link to={`/anime/${anime.id}`}>
              <img src={anime.coverImage.large} alt={anime.title.romaji} />
              <h3>{anime.title.romaji}</h3>
            </Link>
          </div>
        ))}
        {(searchLoading || letterLoading || genreLoading || loading || genreListLoading) && <p>Loading more...</p>}
      </div>
    </div>
  );
}

export default AnimeList;
