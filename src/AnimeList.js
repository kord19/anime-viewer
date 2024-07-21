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
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

function AnimeList() {
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);
  const [searchQuery, setSearchQuery] = useState('');
  const [letterFilter, setLetterFilter] = useState('');
  const [searchData, setSearchData] = useState(null);

  const { loading, error, data, fetchMore } = useQuery(GET_ANIME_LIST, {
    variables: { page, perPage },
    notifyOnNetworkStatusChange: true,
  });

  const { loading: searchLoading, error: searchError, data: searchResult } = useQuery(SEARCH_ANIME, {
    variables: { search: searchQuery, page: 1, perPage },
    skip: !searchQuery,
    onCompleted: data => setSearchData(data),
  });

  const { loading: letterLoading, error: letterError, data: letterResult } = useQuery(GET_ANIME_BY_LETTER, {
    variables: { letter: letterFilter, page: 1, perPage },
    skip: !letterFilter,
  });

  const loadMore = () => {
    if (data?.Page.pageInfo.hasNextPage) {
      fetchMore({
        variables: {
          page: page + 1,
        },
      }).then(() => setPage(prevPage => prevPage + 1));
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

  if (loading && !data && !searchData && !letterResult) return <p>Loading...</p>;
  if (error || searchError || letterError) return <p>Error :(</p>;

  const handleSearch = () => {
    setSearchQuery(searchQuery.trim());
  };

  const handleLetterClick = (letter) => {
    setLetterFilter(letter);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLetterFilter('');
  };

  const animeList = searchQuery ? searchResult?.Page.media : (letterFilter ? letterResult?.Page.media : data?.Page.media);

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
      <div className="anime-list">
        {animeList && animeList.map(anime => (
          <div className="anime-list-item" key={anime.id}>
            <Link to={`/anime/${anime.id}`}>
              <img src={anime.coverImage.large} alt={anime.title.romaji} />
              <h3>{anime.title.romaji}</h3>
            </Link>
          </div>
        ))}
        {(searchLoading || letterLoading || loading) && <p>Loading more...</p>}
      </div>
    </div>
  );
}

export default AnimeList;
