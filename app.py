from flask import Flask, render_template
import pickle

app = Flask(__name__)

# Load the recommendation model
# with open("recommendation_model.pkl", "rb") as f:
#     model = pickle.load(f)

# Load the dataset (popular_df)
popular_df = pickle.load(open("popular.pkl","rb"))



@app.route("/")
def index():
    return render_template("index.html",
                           book_name = list(popular_df["Book-Title"].values),
                           author = list(popular_df["Book-Author"].values),
                           image = list(popular_df["Image-URL-M"].values),
                           votes = list(popular_df["num_ratings"].values),
                           rating = list(popular_df["avg_ratings"].values),)

# @app.route("/recommend", methods=["POST"])
# def recommend():
#     try:
#         data = request.json
#         book_title = data.get("title", "").lower()

#         # Use the model's recommend function
#         recommendations = model.recommend(book_title, popular_df)

#         return jsonify({"recommendations": recommendations})

#     except Exception as e:
#         return jsonify({"error": str(e)})

if __name__ == "__main__":
    app.run(debug=True)
