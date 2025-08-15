// script.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let allNotes = [];
    let allGroups = [];
    let currentView = 'library';

    const API_URL = ''; // No need for full URL when hosted together

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_URL}/api/data`);
            const data = await response.json();
            allNotes = data.notes;
            allGroups = data.groups;
            renderView();
        } catch (error) {
            console.error('Failed to fetch data:', error);
            mainContent.innerHTML = `<p class="text-center text-red-500">Could not load library data.</p>`;
        }
    };

    const renderView = () => {
        let html = '';
        switch (currentView) {
            case 'shelves':
                html = renderShelvesView();
                break;
            case 'knowledge-graph':
                html = renderKnowledgeGraphView();
                break;
            default: // library view
                html = renderLibraryView();
        }
        mainContent.innerHTML = html;
        addEventListeners();
        lucide.createIcons();
    };

    const createNoteCardHTML = (note) => {
        const fileUrl = `${API_URL}/library_files/${note.fileName}`;
        const imageSrc = note.type === 'image' ? fileUrl : `https://placehold.co/600x400/c47b7b/ffffff?text=${encodeURIComponent(note.group)}`;
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover-effect flex flex-col">
                <a href="${fileUrl}" target="_blank" class="block"><img src="${imageSrc}" alt="${note.displayName}" class="w-full h-48 object-cover"></a>
                <div class="p-4 flex-grow flex flex-col">
                    <h3 class="text-lg font-bold mb-1 truncate flex-grow">${note.displayName}</h3>
                    <span class="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full self-start">${note.group}</span>
                </div>
            </div>`;
    };

    const renderLibraryView = (notes = allNotes) => {
        const libraryGridHTML = notes.length > 0 ? notes.map(createNoteCardHTML).join('') : `<p class="col-span-full text-center text-gray-500">No items found.</p>`;
        return `
            <div id="library-view">
                <section class="hero-gradient text-white rounded-2xl p-8 md:p-16 mb-16 text-center shadow-2xl">
                    <h1 class="text-4xl md:text-6xl font-bold mb-4 logo-font">Your Personal Library, Reimagined.</h1>
                    <div class="relative max-w-2xl mx-auto mt-8">
                        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 w-5 h-5"></i>
                        <input type="text" id="search-input" placeholder="Search by name or group..." class="w-full bg-white/20 border border-white/30 text-white placeholder-stone-300 rounded-lg py-3 pl-12 pr-4">
                    </div>
                </section>
                <div id="library-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">${libraryGridHTML}</div>
            </div>`;
    };

    const renderShelvesView = () => {
        const shelvesHTML = allGroups.map(group => {
            const notesInGroup = allNotes.filter(note => note.group === group);
            if (notesInGroup.length === 0) return '';
            return `
                <div>
                    <h3 class="text-2xl font-bold text-stone-800 logo-font border-b-2 border-maroon-dark pb-2 mb-6">${group}</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">${notesInGroup.map(createNoteCardHTML).join('')}</div>
                </div>`;
        }).join('');
        return `<div id="shelves-view" class="space-y-12">${shelvesHTML}</div>`;
    };

    const renderKnowledgeGraphView = () => `
        <div class="text-center py-16">
            <h2 class="text-4xl font-bold text-stone-900 logo-font mb-4">Knowledge Graph</h2>
            <p class="text-stone-600 max-w-2xl mx-auto mb-8">A visual map of your interconnected notes will appear here, helping you discover new patterns and insights.</p>
            <i data-lucide="share-2" class="w-24 h-24 text-maroon-dark mx-auto"></i>
            <p class="text-xl font-semibold text-stone-700 mt-4">Coming Soon!</p>
        </div>`;

    const addEventListeners = () => {
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filteredNotes = allNotes.filter(note => 
                    note.displayName.toLowerCase().includes(searchTerm) || 
                    note.group.toLowerCase().includes(searchTerm)
                );
                document.getElementById('library-grid').innerHTML = filteredNotes.length > 0 ? filteredNotes.map(createNoteCardHTML).join('') : `<p class="col-span-full text-center text-gray-500">No items match your search.</p>`;
                lucide.createIcons();
            });
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            currentView = e.target.dataset.view;
            renderView();
        });
    });

    fetchData();
});
