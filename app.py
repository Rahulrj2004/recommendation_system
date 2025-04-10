from flask import Flask, render_template,jsonify,request
import requests
import pickle
import numpy as np
import pandas as pd

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
            
app = Flask(__name__)  

CLIENT_ID = "e6dab0a301ae45cca2333f97a5e75fb1"
CLIENT_SECRET = "da284dd9abfa4242add5f3676aa77999"

client_credentials_manager = SpotifyClientCredentials(client_id=CLIENT_ID,client_secret=CLIENT_SECRET)
sp = spotipy.Spotify(client_credentials_manager=client_credentials_manager)

def get_song_cover(song_name,artist_name):
    search_query = f"track:{song_name} artist:{artist_name}"
    results = sp.search(q=search_query,type="track")

    if results and results["tracks"]["items"]:
        track = results["tracks"]["items"][0]
        album_cover = track["album"]["images"][0]["url"]
        print(album_cover)
        return album_cover
    else:
        return "https://i.postimg.cc/0QNxYz4V/social.png"

popular_df = pickle.load(open("popular.pkl","rb"))
pt = pickle.load(open("pt.pkl","rb"))
books = pickle.load(open("books.pkl","rb")) 
similarity_score = pickle.load(open("similarity_scores.pkl","rb"))        

movie_dict = pickle.load(open("movie_dict.pkl","rb"))
movies = pd.DataFrame(movie_dict)
Msimilarity_score = pickle.load(open("Msimilarity.pkl","rb"))

book_name = list(popular_df["Book-Title"].values)
author = list(popular_df["Book-Author"].values)
image = list(popular_df["Image-URL-M"].values)
votes = list(popular_df["num_ratings"].values)
rating = list(popular_df["avg_ratings"].values)

music = pickle.load(open("Songdf.pkl","rb"))
Ssimilarity = pickle.load(open("Ssimilarity.pkl","rb"))    

@app.route("/")
def index():
    return render_template("index.html")

def fetch_poster(movie_id):
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key=dc579d9a52f2ca4eb19e6a740c29578f&language=en-US"
        response = requests.get(url)
        data = response.json()
        poster_path = data.get('poster_path')
        vote_average = data.get("vote_average")
        date = data.get("release_date")
        if poster_path:
            poster_url =  "https://image.tmdb.org/t/p/w500/" + poster_path
        else:
            poster_url  = "https://via.placeholder.com/500x750?text=No+Image"
        return {
        "poster_url": poster_url,
        "vote_average": vote_average,
        "release_date": date
    }
    except Exception as e:
        print(f"Error fetching poster: {e}")
        return "https://via.placeholder.com/500x750?text=Error"

@app.route("/movie-trailer/<int:movie_id>")
def get_movie_trailer(movie_id):
    url = f"https://api.themoviedb.org/3/movie/{movie_id}/videos?api_key=dc579d9a52f2ca4eb19e6a740c29578f&language=en-US"
    response = requests.get(url)
    data = response.json()

    # Filter for YouTube trailers
    trailers = [vid for vid in data.get("results", []) 
                if vid["type"] == "Trailer" and vid["site"] == "YouTube"]

    if trailers:
        # Take the first official trailer or the first available one
        trailer = next((t for t in trailers if t.get("official")), trailers[0])
        youtube_url = f"https://www.youtube.com/watch?v={trailer['key']}"
        return jsonify({"trailer_url": youtube_url})
    else:
        return jsonify({"trailer_url": None, "message": "No trailer found"}), 404
    

# @app.route("/movies-all")
# def get_movies():
#     all_movies = []      
#     print("Fetching movies")
#     for _, row in movies.iterrows():
#         all_movies.append({
#             "m_name":str(row["title"]),
#             "desc":str(row["tags"]),    
#             "image":fetch_poster(row["movie_id"])
#         })
#     print("Done searching movies")
#     return jsonify(all_movies)    
  
@app.route("/book-all")
def get_books():
    books = []
    for i in range(len(book_name)):
        books.append({
            "name": str(book_name[i]),
            "author":str(author[i]), 
            "image":str(image[i]),
            "votes":int(votes[i]),
            "rating":round(float(rating[i]),2)
        })
    return jsonify(books)            

@app.route("/recommend_books", methods=["POST"])
def recommend():
    data = request.get_json()
    user_input = data.get("user_input")
    index = np.where(pt.index == user_input)[0][0]
    similar_items  = sorted(list(enumerate(similarity_score[index])),key= lambda x:x[1],reverse =True)[1:6]

    data = []
    for i in similar_items:
        item =[]
        temp_df = books[books["Book-Title"] == pt.index[i[0]]]
        item.extend(list(temp_df.drop_duplicates("Book-Title")["Book-Title"].values))
        item.extend(list(temp_df.drop_duplicates("Book-Title")["Book-Author"].values))
        item.extend(list(temp_df.drop_duplicates("Book-Title")["Image-URL-M"].values))
        data.append(item)
    return jsonify(data)

@app.route("/recommend-movies", methods=["POST"])
def Mrecommend():
    data = request.get_json()
    movie = data.get("user_Input")
    print(movie)
    movie_index = movies[movies['title'] == movie].index[0]
    distance = Msimilarity_score[movie_index]
    movie_list = sorted(list(enumerate(distance)) , reverse=True , key=lambda x:x[1])[1:6]

    recommend_movies = []
    for i in movie_list:  
        movie_id = movies.iloc[i[0]].movie_id
        poster_data = fetch_poster(movie_id)
        recommend_movies.append({"name":movies.iloc[i[0]].title,
                                 "tag":movies.iloc[i[0]].tags,
                                 "image": poster_data["poster_url"],
                                 "ratings":poster_data["vote_average"],
                                 "release":poster_data["release_date"],
                                 "id":int(movie_id)    
                                 })
    return jsonify(recommend_movies)   

@app.route("/recommend-songs", methods=["POST"])
def Srecommend():
    data = request.get_json()
    Song = data.get("User_input")
    print(Song)
    index = music[music["song"] == Song].index[0]
    distances = sorted(list(enumerate(Ssimilarity[index])), reverse=True, key=lambda x: x[1])
    recommend_songs = []
    for i in distances[1:6]:
        artist = music.iloc[i[0]].artist
        print(artist)
        print(music.iloc[i[0]].song)
        recommend_songs.append({
            "s_name":music.iloc[i[0]].song,
            "image":get_song_cover(music.iloc[i[0]].song,artist),
            "artist":artist        
        })
    return jsonify(recommend_songs)

if __name__ == "__main__":  
    app.run(debug=True)   
