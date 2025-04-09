from flask import Flask, render_template,jsonify,request
import pickle
import numpy as np

app = Flask(__name__)        

# Load the recommendation model
# with open("recommendation_model.pkl", "rb") as f:
#     model = pickle.load(f)  

# Load the dataset (popular_df)
popular_df = pickle.load(open("popular.pkl","rb"))
pt = pickle.load(open("pt.pkl","rb"))
books = pickle.load(open("books.pkl","rb")) 
similarity_score = pickle.load(open("similarity_scores.pkl","rb"))        

movie_list = pickle.load(open("movie.pkl","rb"))
movie_desc = list(movie_list["tags"].values)
movie_list = list(movie_list["title"].values)

book_name = list(popular_df["Book-Title"].values)
author = list(popular_df["Book-Author"].values)
image = list(popular_df["Image-URL-M"].values)  
votes = list(popular_df["num_ratings"].values)
rating = list(popular_df["avg_ratings"].values)
   
@app.route("/")  
def index():
    return render_template("index.html")

# @app.route("/index2")
# def index2():
#     return render_template("index2.html")

@app.route("/movie-all")
def get_movies():
    movies = []
    for i in range(len(movie_list)):
        movies.append({
            "m-name":str(movie_list),
            "desc":str(movie_desc)
        })
    return jsonify(movies)

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
    print(data)
    return jsonify(data)

if __name__ == "__main__":  
    app.run(debug=True)        
                