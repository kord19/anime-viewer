import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';

// Queries
const GET_ANIME_DETAILS = gql`
  query GetAnimeDetails($id: Int) {
    Media(id: $id) {
      id
      title {
        romaji
      }
      coverImage {
        large
      }
      episodes
      description
      genres
      relations {
        edges {
          node {
            id
            title {
              romaji
            }
            type
          }
          relationType
        }
      }
    }
  }
`;

const GET_ANIME_BY_GENRE = gql`
  query GetAnimeByGenre($genre: String!, $excludeId: Int!, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(type: ANIME, genre_in: [$genre], id_not: $excludeId) {
        id
        title {
          romaji
        }
        coverImage {
          large
        }
        genres
      }
    }
  }
`;

function AnimeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_ANIME_DETAILS, { variables: { id: parseInt(id) } });

  const [genre, setGenre] = React.useState('');
  const { loading: genreLoading, error: genreError, data: genreData } = useQuery(GET_ANIME_BY_GENRE, {
    variables: { genre, excludeId: parseInt(id), page: 1, perPage: 5 },
    skip: !genre,
  });

  React.useEffect(() => {
    if (data && data.Media && data.Media.genres && data.Media.genres.length > 0) {
      setGenre(data.Media.genres[0]);
    }
  }, [data]);

  if (loading || genreLoading) return <p>Loading...</p>;
  if (error || genreError) return <p>Error :(</p>;

  const { title, coverImage, episodes, description, genres, relations } = data.Media;
  const name = title.romaji;

  // Find the next season relation
  const nextSeason = relations.edges.find(edge => edge.relationType === 'SEQUEL');

  const handleNextSeason = () => {
    if (nextSeason) {
      navigate(`/anime/${nextSeason.node.id}`);
    }
  };

  return (
    <div className="main-content anime-detail">
      <div className="anime-banner">
        <img src={coverImage.large} alt={`${name} Banner`} />
      </div>
      <h1>{name}</h1>
      <p>{description}</p>
      <p>Total Episodes: {episodes}</p>
      <p>Genres: {genres.join(', ')}</p>
      <div className="episode-list">
        {Array.from({ length: episodes }, (_, index) => (
          <Link key={index} to={`/anime/${name}/episode/${index + 1}`}>
            <button className="episode-button">Episode {index + 1}</button>
          </Link>
        ))}
      </div>
      {nextSeason && (
        <button onClick={handleNextSeason} className="next-season-button">
          Próxima Temporada: {nextSeason.node.title.romaji}
        </button>
      )}
      <div className="suggested-anime">
        <h2>Animes similares</h2>
        {genreData && genreData.Page.media.length > 0 ? (
          genreData.Page.media.map((anime) => (
            <div key={anime.id} className="suggested-anime-item">
              <Link to={`/anime/${anime.id}`}>
                <img src={anime.coverImage.large} alt={anime.title.romaji} />
                <h3>{anime.title.romaji}</h3>
              </Link>
            </div>
          ))
        ) : (
          <p>No similar animes found.</p>
        )}
      </div>
    </div>
  );
}

export default AnimeDetail;
