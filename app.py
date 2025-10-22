from flask import Flask, render_template, jsonify, request
import requests
import pickle
import numpy as np
import pandas as pd
import os
import gc

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
            
app = Flask(__name__)  

CLIENT_ID = "e6dab0a301ae45cca2333f97a5e75fb1"
CLIENT_SECRET = "da284dd9abfa4242add5f3676aa77999"

client_credentials_manager = SpotifyClientCredentials(client_id=CLIENT_ID, client_secret=CLIENT_SECRET)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

# ============ LAZY LOADING GLOBALS ============
# These will be loaded only when needed
_similarity_score = None
_Msimilarity_score = None
_Ssimilarity = None
_pt = None
_books = None
_movies = None
_music = None

# ============ CACHE FOR SPOTIFY COVERS ============
_cover_cache = {}

def get_song_cover(song_name, artist_name):
    """Cached version to avoid repeated Spotify API calls"""
    cache_key = f"{song_name}_{artist_name}"
    
    if cache_key in _cover_cache:
        return _cover_cache[cache_key]
    
    search_query = f"track:{song_name} artist:{artist_name}"
    try:
        results = sp.search(q=search_query, type="track", limit=1)
        
        if results and results["tracks"]["items"]:
            track = results["tracks"]["items"][0]
            album_cover = track["album"]["images"][0]["url"]
            _cover_cache[cache_key] = album_cover
            return album_cover
    except Exception as e:
        print(f"Spotify API error: {e}")
    
    default_cover = "https://i.postimg.cc/0QNxYz4V/social.png"
    _cover_cache[cache_key] = default_cover
    return default_cover

# ============ LAZY LOADERS ============
def load_book_similarity():
    global _similarity_score, _pt, _books
    if _similarity_score is None:
        print("Loading book similarity data...")
        _pt = pickle.load(open("pt.pkl", "rb"))
        _books = pickle.load(open("books.pkl", "rb"))
        _similarity_score = pickle.load(open("similarity_scores.pkl", "rb"))
        print("Book similarity loaded!")
    return _similarity_score, _pt, _books

def load_movie_similarity():
    global _Msimilarity_score, _movies
    if _Msimilarity_score is None:
        print("Loading movie similarity data...")
        movie_dict = pickle.load(open("movie_dict.pkl", "rb"))
        _movies = pd.DataFrame(movie_dict)
        _Msimilarity_score = pickle.load(open("Msimilarity.pkl", "rb"))
        print("Movie similarity loaded!")
    return _Msimilarity_score, _movies

def load_song_similarity():
    global _Ssimilarity, _music
    if _Ssimilarity is None:
        print("Loading song similarity data...")
        _music = pickle.load(open("Songdf.pkl", "rb"))
        _Ssimilarity = pickle.load(open("Ssimilarity.pkl", "rb"))
        print("Song similarity loaded!")
    return _Ssimilarity, _music

# ============ LOAD ONLY ESSENTIAL DATA AT STARTUP ============
print("Loading essential data...")
popular_df = pickle.load(open("popular.pkl", "rb"))

# Extract only necessary data and convert to simple lists
book_name = popular_df["Book-Title"].tolist()
author = popular_df["Book-Author"].tolist()
image = popular_df["Image-URL-M"].tolist()
votes = popular_df["num_ratings"].tolist()
rating = popular_df["avg_ratings"].tolist()

# Free memory immediately
del popular_df
gc.collect()

print("Essential data loaded! Memory optimized.")

@app.route("/")
def index():
    return render_template("index.html")

# ============ POSTER FETCH WITH SESSION REUSE ============
_poster_session = requests.Session()

def fetch_poster(movie_id):
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key=dc579d9a52f2ca4eb19e6a740c29578f&language=en-US"
        response = _poster_session.get(url, timeout=5)
        response.raise_for_status()
        data = response.json()

        poster_path = data.get('poster_path')
        vote_average = data.get("vote_average")
        date = data.get("release_date")

        if poster_path:
            poster_url = "https://image.tmdb.org/t/p/w500/" + poster_path
        else:
            poster_url = "https://via.placeholder.com/500x750?text=No+Image"

        return {
            "poster_url": poster_url,
            "vote_average": vote_average,
            "release_date": date
        }

    except Exception as e:
        print(f"Error fetching poster: {e}")
        return {
            "poster_url": "https://via.placeholder.com/500x750?text=Error",
            "vote_average": None,
            "release_date": None
        }

@app.route("/movie-trailer/<int:movie_id>")
def get_movie_trailer(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key=dc579d9a52f2ca4eb19e6a740c29578f&language=en-US"
    try:
        response = _poster_session.get(url, timeout=5)
        data = response.json()

        # Filter for YouTube trailers
        trailers = [vid for vid in data.get("results", []) 
                    if vid["type"] == "Trailer" and vid["site"] == "YouTube"]

        if trailers:
            trailer = next((t for t in trailers if t.get("official")), trailers[0])
            youtube_url = f"https://www.youtube.com/watch?v={trailer['key']}"
            return jsonify({"trailer_url": youtube_url})
        else:
            return jsonify({"trailer_url": None, "message": "No trailer found"}), 404
    except Exception as e:
        print(f"Trailer fetch error: {e}")
        return jsonify({"trailer_url": None, "message": "Error fetching trailer"}), 500
  
@app.route("/book-all")
def get_books():
    """Optimized: Pre-build list without repeated conversions"""
    books_list = [
        {
            "name": book_name[i],
            "author": author[i], 
            "image": image[i],
            "votes": int(votes[i]),
            "rating": round(float(rating[i]), 2)
        }
        for i in range(len(book_name))
    ]
    return jsonify(books_list)

@app.route("/recommend_books", methods=["POST"])
def recommend():
    data = request.get_json()
    user_input = data.get("user_input")

    # Lazy load
    similarity_score, pt, books = load_book_similarity()

    try:
        index = np.where(pt.index == user_input)[0][0]
    except (IndexError, KeyError):
        return jsonify([])

    similar_items = sorted(
        list(enumerate(similarity_score[index])), 
        key=lambda x: x[1], 
        reverse=True
    )[1:6]

    recommendations = []
    for i in similar_items:
        temp_df = books[books["Book-Title"] == pt.index[i[0]]]
        temp_df = temp_df.drop_duplicates("Book-Title")
        
        if not temp_df.empty:
            recommendations.append([
                temp_df["Book-Title"].values[0],
                temp_df["Book-Author"].values[0],
                temp_df["Image-URL-M"].values[0]
            ])
    
    return jsonify(recommendations)

@app.route("/recommend-movies", methods=["POST"])
def Mrecommend():
    try:
        data = request.get_json()
        movie = data.get("user_Input")

        # Lazy load
        Msimilarity_score, movies = load_movie_similarity()

        movie_index = movies[movies['title'] == movie].index[0]
        distance = Msimilarity_score[movie_index]
        movie_list = sorted(
            list(enumerate(distance)), 
            reverse=True, 
            key=lambda x: x[1]
        )[1:6]

        recommend_movies = []
        for i in movie_list:
            movie_id = movies.iloc[i[0]].movie_id
            poster_data = fetch_poster(movie_id)
            recommend_movies.append({
                "name": movies.iloc[i[0]].title,
                "tag": movies.iloc[i[0]].tags,
                "image": poster_data["poster_url"],
                "ratings": poster_data["vote_average"],
                "release": poster_data["release_date"],
                "id": int(movie_id)
            })

        return jsonify(recommend_movies)

    except (IndexError, KeyError) as e:
        print("Movie not found:", e)
        return jsonify([])
    except Exception as e:
        print("Error in /recommend-movies:", e)
        return jsonify({"error": str(e)}), 500

@app.route("/recommend-songs", methods=["POST"])
def Srecommend():
    data = request.get_json()
    Song = data.get("User_input")
    
    # Lazy load
    Ssimilarity, music = load_song_similarity()
    
    try:
        index = music[music["song"] == Song].index[0]
    except (IndexError, KeyError):
        return jsonify([])

    distances = sorted(
        list(enumerate(Ssimilarity[index])), 
        reverse=True, 
        key=lambda x: x[1]
    )
    
    recommend_songs = []
    for i in distances[1:6]:
        song_name = music.iloc[i[0]].song
        artist = music.iloc[i[0]].artist
        
        recommend_songs.append({
            "s_name": song_name,
            "image": get_song_cover(song_name, artist),
            "artist": artist        
        })
    
    return jsonify(recommend_songs)

if __name__ == "__main__":
    # Use PORT environment variable for deployment
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)