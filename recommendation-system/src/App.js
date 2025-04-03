// App.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BsStarFill, BsHeart } from 'react-icons/bs';
import './App.css';

const mockRecommendations = [
  {
    id: 1,
    title: "Inception",
    type: "movie",
    genre: "Sci-Fi",
    rating: 4.8,
    image: "https://m.media-amazon.com/images/I/51EGh5g5ZaL.jpg",
    description: "A thief who enters the dreams of others to steal secrets."
  },
  {
    id: 2,
    title: "1984",
    type: "book",
    genre: "Dystopian",
    rating: 4.6,
    image: "https://m.media-amazon.com/images/I/41X7fEM8fHL.jpg",
    description: "A dystopian novel about government surveillance."
  },
  {
    id: 3,
    title: "Bohemian Rhapsody",
    type: "song",
    genre: "Rock",
    rating: 4.9,
    image: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg",
    description: "Iconic song by Queen from 1975."
  },
];

function App() {
  const [recommendations, setRecommendations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  // Simulate API call
  const fetchRecommendations = async () => {
    setLoading(true);
    // Simulated delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Filter mock data
    const filtered = mockRecommendations.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || item.type === category;
      return matchesSearch && matchesCategory;
    });
    
    setRecommendations(filtered);
    setLoading(false);
  };

  useEffect(() => {
    fetchRecommendations();
  }, [category]);

  const handleLike = (id) => {
    // Implement like functionality
    console.log(`Liked item ${id}`);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Recommendation System</h1>
      </header>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search movies, books, songs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">All</option>
          <option value="movie">Movies</option>
          <option value="book">Books</option>
          <option value="song">Songs</option>
        </select>
        <button onClick={fetchRecommendations}>Search</button>
      </div>

      {loading ? (
        <div className="loading">Loading recommendations...</div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((item) => (
            <div key={item.id} className="recommendation-card">
              <img src={item.image} alt={item.title} />
              <div className="card-content">
                <h3>{item.title}</h3>
                <div className="meta">
                  <span className="type">{item.type}</span>
                  <span className="rating">
                    <BsStarFill /> {item.rating}
                  </span>
                </div>
                <p className="description">{item.description}</p>
                <div className="actions">
                  <button 
                    className="like-btn"
                    onClick={() => handleLike(item.id)}
                  >
                    <BsHeart /> Like
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;