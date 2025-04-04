/const API_URL = 'http://localhost:5000/recommend';
        
async function fetchRecommendations() {
    const searchInput = document.getElementById('searchInput');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const grid = document.getElementById('recommendationsGrid');

    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        error.textContent = 'Please enter a book title';
        return;
    }

    try {
        // Show loading
        loading.style.display = 'block';
        error.textContent = '';
        grid.innerHTML = '';

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title: searchTerm })
        });

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();

        if (!data.recommendations || data.recommendations.length === 0) {
            throw new Error('No recommendations found');
        }

        // Clear previous results
        grid.innerHTML = '';

        // Create book cards
        data.recommendations.forEach((item, index) => {
            const bookCard = document.createElement('div');
            bookCard.className = 'book-card';
            bookCard.innerHTML = `
                <img src="${item[4]}" class="book-image" alt="${item[1]}">
                <h3>${item[1]}</h3>
                <p><strong>Genre:</strong> ${item[2]}</p>
                <p><strong>Rating:</strong> ${item[3]}/5</p>
                <p>${item[5]}</p>
            `;
            grid.appendChild(bookCard);
        });

    } catch (err) {
        error.textContent = err.message;
        grid.innerHTML = '';
    } finally {
        loading.style.display = 'none';
    }
}

const recommendations = [
    { 
        category: 'movies',
        title: 'Inception',
        description: 'A mind-bending heist movie',
        image: 'https://via.placeholder.com/200x200'
    },
    {
        category: 'books',
        title: 'The Alchemist',
        description: 'A philosophical novel by Paulo Coelho',
        image: 'https://via.placeholder.com/200x200'
    },
    {
        category: 'songs',
        title: 'Bohemian Rhapsody',
        description: 'Classic rock song by Queen',
        image: 'https://via.placeholder.com/200x200'
    },
    { 
        category: 'movies',
        title: 'The Dark Knight',
        description: 'Batman faces the Joker in Gotham City',
        image: 'https://via.placeholder.com/200x200'
    },
    {
        category: 'books',
        title: '1984',
        description: 'Dystopian novel by George Orwell',
        image: 'https://via.placeholder.com/200x200'
    },
    {
        category: 'songs',
        title: 'Hotel California',
        description: 'Iconic song by Eagles',
        image: 'https://via.placeholder.com/200x200'
    },
];

// Modified filterRecommendations function
function filterRecommendations(category = 'all', searchTerm = '') {
    let filtered = recommendations;

    // First apply category filter
    if (category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
    }

    // Then apply search filter
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(lowerSearchTerm) ||
            item.description.toLowerCase().includes(lowerSearchTerm)
        );
    }

    // Show message if no results found
    if (filtered.length === 0) {
        displayNoResults();
    } else {
        displayRecommendations(filtered);
    }
}

// Add this new function to show no results message
function displayNoResults() {
    const container = document.getElementById('recommendations');
    container.innerHTML = `
        <div class="no-results">
            <h3>No recommendations found</h3>
            <p>Try adjusting your search or filters</p>
        </div>`;
}


// Event listeners
document.getElementById('searchButton').addEventListener('click', fetchRecommendations);
document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchRecommendations();
});


document.addEventListener('DOMContentLoaded', () => {
    // Show initial recommendations including demo card
    displayRecommendations(recommendations);
    setupEventListeners();
});

// Add this function to handle event listeners
function setupEventListeners() {
    // Category filter buttons
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterRecommendations(btn.dataset.category);
        });
    });

    // Search functionality
    document.querySelector('.search-btn').addEventListener('click', () => {
        const searchTerm = document.querySelector('.search-box').value;
        filterRecommendations(document.querySelector('.category-btn.active').dataset.category, searchTerm);
    });

    document.querySelector('.search-box').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            filterRecommendations(document.querySelector('.category-btn.active').dataset.category, e.target.value);
        }
    });
}