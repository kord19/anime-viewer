import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import { useQuery, gql, ApolloProvider } from '@apollo/client';
import client from './apollo-client';

const GET_ANIME_EPISODES = gql`
  query GetAnimeEpisodes($name: String!) {
    Media(search: $name, type: ANIME) {
      title {
        romaji
      }
      episodes
    }
  }
`;

function EpisodePlayer() {
  const { name, episode } = useParams();
  const navigate = useNavigate();
  const episodeNumber = parseInt(episode, 10);

  const { loading, error, data } = useQuery(GET_ANIME_EPISODES, {
    variables: { name },
  });

  if (loading) return <p>Carregando...</p>;
  if (error) return <p>Erro ao carregar episódios.</p>;

  const episodes = Array.from({ length: data.Media.episodes }, (_, i) => i + 1);

  // Formatar o nome do anime para URL
  const nameFormatted = name
    .split(' ')
    .map(word => word.toLowerCase())
    .join('-');
  
  // Capitalizar a primeira letra do nome
  const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  // Remover o zero à frente se o episódio for 10 ou maior
  const formattedEpisode = episodeNumber >= 10 ? episode : `0${episode}`;

  // Construir a URL do vídeo
  const videoUrl = `https://cdn01-s1.mywallpaper-cdn-4k.com/stream/${nameCapitalized[0]}/${nameFormatted}/${formattedEpisode}.mp4/index.m3u8`;

  // Calcular o próximo episódio
  const nextEpisodeNumber = episodeNumber + 1;

  const handleNextEpisode = () => {
    if (nextEpisodeNumber <= data.Media.episodes) {
      navigate(`/anime/${nameFormatted}/episode/${nextEpisodeNumber}`);
    }
  };

  return (
    <div className="player-wrapper">
      <ReactPlayer url={videoUrl} controls width="100%" height="70%" className="react-player" />
      <div className="navigation-buttons">
        {episodeNumber > 1 && (
          <Link to={`/anime/${nameFormatted}/episode/${episodeNumber - 1}`} className="nav-button">
            Episódio Anterior
          </Link>
        )}
        <button onClick={handleNextEpisode} className="nav-button">
          Próximo Episódio
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <EpisodePlayer />
    </ApolloProvider>
  );
}

export default App;
