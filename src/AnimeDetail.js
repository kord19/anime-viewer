import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';

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
    }
  }
`;

function AnimeDetail() {
  const { id } = useParams();
  const { loading, error, data } = useQuery(GET_ANIME_DETAILS, { variables: { id: parseInt(id) } });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  const { title, coverImage, episodes } = data.Media;
  const name = title.romaji;

  return (
    <div className="main-content anime-detail">
      <div className="anime-banner">
        <img src={coverImage.large} alt={`${name} Banner`} />
      </div>
      <h1>{name}</h1>
      <p>Total Episodes: {episodes}</p>
      <div className="episode-list">
        {Array.from({ length: episodes }, (_, index) => (
          <Link key={index} to={`/anime/${name}/episode/${index + 1}`}>
            <button className="episode-button">Episode {index + 1}</button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default AnimeDetail;
