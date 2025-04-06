// /const API_URL = 'http://localhost:5000/recommend';
        
// async function fetchRecommendations() {
//     const searchInput = document.getElementById('searchInput');
//     const loading = document.getElementById('loading');
//     const error = document.getElementById('error');
//     const grid = document.getElementById('recommendationsGrid');

//     const searchTerm = searchInput.value.trim();
    
//     if (!searchTerm) {
//         error.textContent = 'Please enter a book title';
//         return;
//     }

//     try {
//         // Show loading
//         loading.style.display = 'block';
//         error.textContent = '';
//         grid.innerHTML = '';

//         const response = await fetch(API_URL, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ title: searchTerm })
//         });

//         if (!response.ok) throw new Error('API request failed');

//         const data = await response.json();

//         if (!data.recommendations || data.recommendations.length === 0) {
//             throw new Error('No recommendations found');
//         }

//         // Clear previous results
//         grid.innerHTML = '';

//         // Create book cards
//         data.recommendations.forEach((item, index) => {
//             const bookCard = document.createElement('div');
//             bookCard.className = 'book-card';
//             bookCard.innerHTML = `
//                 <img src="${item[4]}" class="book-image" alt="${item[1]}">
//                 <h3>${item[1]}</h3>
//                 <p><strong>Genre:</strong> ${item[2]}</p>
//                 <p><strong>Rating:</strong> ${item[3]}/5</p>
//                 <p>${item[5]}</p>
//             `;
//             grid.appendChild(bookCard);
//         });

//     } catch (err) {
//         error.textContent = err.message;
//         grid.innerHTML = '';
//     } finally {
//         loading.style.display = 'none';
//     }
// }

// const recommendations = [
//     { 
//         category: 'movies',
//         title: 'Inception',
//         description: 'A mind-bending heist movie',
//         image: 'https://via.placeholder.com/200x200'
//     },
//     {
//         category: 'books',
//         title: 'The Alchemist',
//         description: 'A philosophical novel by Paulo Coelho',
//         image: 'https://via.placeholder.com/200x200'
//     },
//     {
//         category: 'songs',
//         title: 'Bohemian Rhapsody',
//         description: 'Classic rock song by Queen',
//         image: 'https://via.placeholder.com/200x200'
//     },
//     { 
//         category: 'movies',
//         title: 'The Dark Knight',
//         description: 'Batman faces the Joker in Gotham City',
//         image: 'https://via.placeholder.com/200x200'
//     },
//     {
//         category: 'books',
//         title: '1984',
//         description: 'Dystopian novel by George Orwell',
//         image: 'https://via.placeholder.com/200x200'
//     },
//     {
//         category: 'songs',
//         title: 'Hotel California',
//         description: 'Iconic song by Eagles',
//         image: 'https://via.placeholder.com/200x200'
//     },
// ];

// // Modified filterRecommendations function
// function filterRecommendations(category = 'all', searchTerm = '') {
//     let filtered = recommendations;

//     // First apply category filter
//     if (category !== 'all') {
//         filtered = filtered.filter(item => item.category === category);
//     }

//     // Then apply search filter
//     if (searchTerm) {
//         const lowerSearchTerm = searchTerm.toLowerCase();
//         filtered = filtered.filter(item => 
//             item.title.toLowerCase().includes(lowerSearchTerm) ||
//             item.description.toLowerCase().includes(lowerSearchTerm)
//         );
//     }

//     // Show message if no results found
//     if (filtered.length === 0) {
//         displayNoResults();
//     } else {
//         displayRecommendations(filtered);
//     }
// }

// // Add this new function to show no results message
// function displayNoResults() {
//     const container = document.getElementById('recommendations');
//     container.innerHTML = `
//         <div class="no-results">
//             <h3>No recommendations found</h3>
//             <p>Try adjusting your search or filters</p>
//         </div>`;
// }


// // Event listeners
// document.getElementById('searchButton').addEventListener('click', fetchRecommendations);
// document.getElementById('searchInput').addEventListener('keypress', (e) => {
//     if (e.key === 'Enter') fetchRecommendations();
// });


// // Update recommendations array
// const recommendations = [
//     // Movies
//     { 
//         category: 'movies',
//         title: 'Inception',
//         description: 'A mind-bending heist movie',
//         image: 'https://via.placeholder.com/200x200',
//         director: 'Christopher Nolan',
//         releaseDate: '2010-07-16',
//         rating: '8.8'
//     },
    
//     // Books
//     {
//         category: 'books',
//         title: '1984',
//         description: 'Dystopian novel by George Orwell',
//         image: 'https://via.placeholder.com/200x200',
//         author: 'George Orwell',
//         published: '1949',
//         genre: 'Dystopian Fiction',
//         pages: 328
//     },
//     {
//         category: 'books',
//         title: 'To Kill a Mockingbird',
//         description: 'Novel about racial injustice',
//         image: 'https://via.placeholder.com/200x200',
//         author: 'Harper Lee',
//         published: '1960',
//         genre: 'Southern Gothic',
//         pages: 281
//     }
// ];

// // Update displayRecommendations function
// function displayRecommendations(items) {
//     const container = document.getElementById('recommendations');
//     container.innerHTML = '';

//     items.forEach(item => {
//         const card = document.createElement('div');
//         card.className = `card ${item.category}-card`;
        
//         let detailsHtml = '';
//         if(item.category === 'books') {
//             detailsHtml = `
//                 <div class="card-details">
//                     <p><strong>Author:</strong> ${item.author}</p>
//                     <p><strong>Published:</strong> ${item.published}</p>
//                     <p><strong>Genre:</strong> ${item.genre}</p>
//                     <p><strong>Pages:</strong> ${item.pages}</p>
//                 </div>
//             `;
//         } else if(item.category === 'movies') {
//             detailsHtml = `
//                 <div class="card-details">
//                     <p><strong>Director:</strong> ${item.director}</p>
//                     <p><strong>Released:</strong> ${item.releaseDate}</p>
//                     <p><strong>Rating:</strong> ${item.rating}/10</p>
//                 </div>
//             `;
//         }

//         card.innerHTML = `
//             <img src="${item.image}" alt="${item.title}">
//             <h3>${item.title}</h3>
//             <p>${item.description}</p>
//             ${detailsHtml}
//         `;
//         container.appendChild(card);
//     });
// }

// // Update filter function to search book-specific fields
// function filterRecommendations(category = 'all', searchTerm = '') {
//     let filtered = recommendations;

//     if (category !== 'all') {
//         filtered = filtered.filter(item => item.category === category);
//     }

//     if (searchTerm) {
//         const lowerSearchTerm = searchTerm.toLowerCase();
//         filtered = filtered.filter(item => {
//             const baseMatch = item.title.toLowerCase().includes(lowerSearchTerm) ||
//                              item.description.toLowerCase().includes(lowerSearchTerm);
            
//             if(item.category === 'books') {
//                 return baseMatch || 
//                     item.author.toLowerCase().includes(lowerSearchTerm) ||
//                     item.genre.toLowerCase().includes(lowerSearchTerm);
//             }
//             return baseMatch;
//         });
//     }

//     if (filtered.length === 0) {
//         displayNoResults();
//     } else {
//         displayRecommendations(filtered);
//     }
// }



// // card demo

// // document.addEventListener('DOMContentLoaded', () => {
// //     // Show initial recommendations including demo card
// //     displayRecommendations(recommendations);
// //     setupEventListeners();
// // });


// // function setupEventListeners() {
// //     // Category filter buttons
// //     document.querySelectorAll('.category-btn').forEach(btn => {
// //         btn.addEventListener('click', () => {
// //             document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
// //             btn.classList.add('active');
// //             filterRecommendations(btn.dataset.category);
// //         });
// //     });

// //     // Search functionality
// //     document.querySelector('.search-btn').addEventListener('click', () => {
// //         const searchTerm = document.querySelector('.search-box').value;
// //         filterRecommendations(document.querySelector('.category-btn.active').dataset.category, searchTerm);
// //     });

// //     document.querySelector('.search-box').addEventListener('keypress', (e) => {
// //         if (e.key === 'Enter') {
// //             filterRecommendations(document.querySelector('.category-btn.active').dataset.category, e.target.value);
// //         }
// //     });
// // }
