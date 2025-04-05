const recommendations = [
    // Movies
    { 
        category: 'movies',
        title: 'Inception',
        description: 'A mind-bending heist movie',
        image: 'https://via.placeholder.com/200x200',
        director: 'Christopher Nolan',
        releaseDate: '2010',
        rating: '8.8'
    },
    { 
        category: 'movies',
        title: 'The Dark Knight',
        description: 'Batman faces the Joker in Gotham City',
        image: 'https://via.placeholder.com/200x200',
        director: 'Christopher Nolan',
        releaseDate: '2008',
        rating: '9.0'
    },

    // Books
    {
        category: 'books',
        title: '1984',
        description: 'Dystopian novel by George Orwell',
        image: 'https://via.placeholder.com/200x200',
        author: 'George Orwell',
        published: '1949',
        genre: 'Dystopian Fiction',
        pages: 328
    },
    {
        category: 'books',
        title: 'The Great Gatsby',
        description: 'American novel set in the Jazz Age',
        image: 'https://via.placeholder.com/200x200',
        author: 'F. Scott Fitzgerald',
        published: '1925',
        genre: 'Tragedy',
        pages: 180
    },

    // Songs
    {
        category: 'songs',
        title: 'Bohemian Rhapsody',
        description: 'Classic rock ballad by Queen',
        image: 'https://via.placeholder.com/200x200',
        artist: 'Queen',
        album: 'A Night at the Opera',
        duration: '5:55',
        released: '1975'
    },
    {
        category: 'songs',
        title: 'Hotel California',
        description: 'Iconic song by Eagles',
        image: 'https://via.placeholder.com/200x200',
        artist: 'Eagles',
        album: 'Hotel California',
        duration: '6:30',
        released: '1977'
    }
];



document.addEventListener('DOMContentLoaded', async () => {
    displayRecommendations(recommendations);
    setupEventListeners();
    try{
        let baba = await fetch("/book-all");
        let data = await baba.json();
        show(data);
        console.log("sucefully fetched all the files");
    }
    catch(e)
    {
        console.error(e);
    }
});

function displayRecommendations(items) {
    const container = document.getElementById('recommendations');
    container.innerHTML = '';

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = `card ${item.category}-card`;
        
        let detailsHtml = '';
        switch(item.category) {
            case 'movies':
                detailsHtml = `
                    <div class="card-details">
                        <p><strong>Director:</strong> ${item.director}</p>
                        <p><strong>Released:</strong> ${item.releaseDate}</p>
                        <p><strong>Rating:</strong> ${item.rating}/10</p>
                    </div>`;
                break;
                
            case 'books':
                detailsHtml = `
                    <div class="card-details">
                        <p><strong>Author:</strong> ${item.author}</p>
                        <p><strong>Published:</strong> ${item.published}</p>
                        <p><strong>Genre:</strong> ${item.genre}</p>
                        <p><strong>Pages:</strong> ${item.pages}</p>
                    </div>`;
                break;
                
            case 'songs':
                detailsHtml = `
                    <div class="card-details">
                        <p><strong>Artist:</strong> ${item.artist}</p>
                        <p><strong>Album:</strong> ${item.album}</p>
                        <p><strong>Duration:</strong> ${item.duration}</p>
                        <p><strong>Released:</strong> ${item.released}</p>
                    </div>`;
                break;
        }

        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${detailsHtml}
        `;
        container.appendChild(card);
    });
}

function filterRecommendations(category = 'all', searchTerm = '') {
    let filtered = recommendations;

    // Category Filter
    if (category !== 'all') {
        filtered = filtered.filter(item => item.category === category);
    }

    // Search Filter
    if (searchTerm) {
        const lowerSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(item => {
            const baseMatch = item.title.toLowerCase().includes(lowerSearchTerm) ||
                             item.description.toLowerCase().includes(lowerSearchTerm);
            
            switch(item.category) {
                case 'movies':
                    return baseMatch || 
                        item.director.toLowerCase().includes(lowerSearchTerm);
                        
                case 'books':
                    return baseMatch || 
                        item.author.toLowerCase().includes(lowerSearchTerm) ||
                        item.genre.toLowerCase().includes(lowerSearchTerm);
                        
                case 'songs':
                    return baseMatch || 
                        item.artist.toLowerCase().includes(lowerSearchTerm) ||
                        item.album.toLowerCase().includes(lowerSearchTerm);
            }
            return baseMatch;
        });
    }

    // Display results
    if (filtered.length === 0) {
        displayNoResults();
    } else {
        displayRecommendations(filtered);
    }
}

function displayNoResults() {
    const container = document.getElementById('recommendations');
    container.innerHTML = `
        <div class="no-results">
            <h3>No recommendations found</h3>
            <p>Try adjusting your search or filters</p>
        </div>`;
}

function setupEventListeners() {
    // Category Filters
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filterRecommendations(btn.dataset.category, document.querySelector('.search-box').value);
        });
    });

    // Search Functionality
    document.querySelector('.search-btn').addEventListener('click', () => {
        const searchTerm = document.querySelector('.search-box').value;
        const category = document.querySelector('.category-btn.active').dataset.category;
        filterRecommendations(category, searchTerm);
    });

    document.querySelector('.search-box').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const searchTerm = e.target.value;
            const category = document.querySelector('.category-btn.active').dataset.category;
            filterRecommendations(category, searchTerm);
        }
    });
}



function show(books)
{
    let dada = document.getElementById("recommendations");
    books.forEach(book=> {
        let html = `<div class="card books-card">
                        <img src="${book.image}" alt="The Great Gatsby">
                        <h3>${book.name}</h3>
                        <div class="card-details">
                        <p><strong>Author:</strong>${book.author}</p>
                        <p><strong>Views:</strong>${book.votes}</p>
                        <p><strong>Ratings:</strong>${book.rating}</p>
                        </div>
                    </div>`
        dada.innerHTML = dada.innerHTML + html;
    });
}