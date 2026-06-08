import React from 'react'

const MovieCard = ({ movie: { title, rating, posterUrl, year, language } }) => {
  return (
    <div className="movie-card">
      <img
        src={posterUrl}
        alt={title}
      />

      <div className="mt-4">
        <h3>{title}</h3>

        <div className="content">
          <div className="rating">
            <img src="star.png" alt="Star Icon" />
            <p>{rating}</p>
          </div>

          <span>•</span>
          <p className="lang">{language}</p>

          <span>•</span>
          <p className="year">{year}</p>
        </div>
      </div>
    </div>
  )
}
export default MovieCard;