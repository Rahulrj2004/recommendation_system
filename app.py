from flask import Flask, render_template,jsonify,request
import requests
import pickle
import numpy as np
import pandas as pd
            
app = Flask(__name__)  


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

@app.route("/")
def index():
    return render_template("index.html")

def fetch_poster(movie_id):
    try:
        url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key=dc579d9a52f2ca4eb19e6a740c29578f&language=en-US"
        response = requests.get(url)
        data = response.json()
        poster_path = data.get('poster_path')
        if poster_path:
            return "https://image.tmdb.org/t/p/w500/" + poster_path
        else:
            return "https://via.placeholder.com/500x750?text=No+Image"
    except Exception as e:
        print(f"Error fetching poster: {e}")
        return "https://via.placeholder.com/500x750?text=Error"


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
        recommend_movies.append({"name":movies.iloc[i[0]].title,
                                 "tag":movies.iloc[i[0]].tags,
                                 "image": fetch_poster(movies.iloc[i[0]].movie_id)})
    return jsonify(recommend_movies)   
if __name__ == "__main__":  
    app.run(debug=True)   
