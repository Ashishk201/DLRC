// script.js

// The local manager.py script will automatically update the data in this object.
// Do not edit this object manually.
const libraryData = {
  "notes": [
    {},
    {
      "id": 1755284150660,
      "displayName": "Money and Banking 10 Years",
      "group": "Commerce",
      "fileName": "1755284150_Money_and_Banking_10_Years.pdf",
      "type": "document"
    },
    {
      "id": 1755284169147,
      "displayName": "VARC",
      "group": "CAT",
      "fileName": "1755284169_VARC.pdf",
      "type": "document"
    },
    {
      "id": 1755284181044,
      "displayName": "LRDI",
      "group": "CAT",
      "fileName": "1755284181_LRDI.pdf",
      "type": "document"
    },
    {
      "id": 1755284192895,
      "displayName": "QA",
      "group": "CAT",
      "fileName": "1755284192_QA.pdf",
      "type": "document"
    },
    {
      "id": 1755284233981,
      "displayName": "Hindi A",
      "group": "Hindi",
      "fileName": "1755284233_Hindi_A.pdf",
      "type": "document"
    },
    {
      "id": 1755284250097,
      "displayName": "Hindi B",
      "group": "Hindi",
      "fileName": "1755284250_Hindi_B.pdf",
      "type": "document"
    },
    {
      "id": 1755284261164,
      "displayName": "Hindi C",
      "group": "Hindi",
      "fileName": "1755284261_Hindi_C.pdf",
      "type": "document"
    },
    {
      "id": 1755284275052,
      "displayName": "Question Paper",
      "group": "Hindi",
      "fileName": "1755284275_Question_Paper.pdf",
      "type": "document"
    },
    {
      "id": 1755285201909,
      "displayName": "Money and Banking 10 Year",
      "group": "Commerce",
      "fileName": "1755285201_Money_and_Banking_10_Year.pdf",
      "type": "document"
    },
    {
      "id": 1755285212039,
      "displayName": "Hindi A",
      "group": "Hindi",
      "fileName": "1755285212_Hindi_A.pdf",
      "type": "document"
    },
    {
      "id": 1755285222248,
      "displayName": "Hindi B",
      "group": "Hindi",
      "fileName": "1755285222_Hindi_B.pdf",
      "type": "document"
    }
  ],
  "groups": [
    "Books",
    "Notes",
    "Commerce",
    "CAT",
    "Hindi"
  ]
}; // DATA_PLACEHOLDER

document.addEventListener('DOMContentLoaded', () => {
    const mainContent = document.getElementById('main-content');
    const navLinks = document.querySelectorAll('.nav-link');
    
    const allNotes = libraryData.notes;
    const allGroups = libraryData.groups;
    let currentView = 'library';

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
        // Links will now point to a local 'library_files' folder.
        const fileUrl = `library_files/${note.fileName}`;
        const imageSrc = note.type === 'image' ? fileUrl : `https://placehold.co/600x400/c47b7b/ffffff?text=${encodeURIComponent(note.group)}`;
        
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover-effect flex flex-col">
                <a href="${fileUrl}" target="_blank" class="block">
                    <img src="${imageSrc}" alt="${note.displayName}" class="w-full h-48 object-cover">
                </a>
                <div class="p-4 flex-grow flex flex-col">
                    <h3 class="text-lg font-bold mb-1 truncate flex-grow">${note.displayName}</h3>
                    <span class="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full self-start mb-3">${note.group}</span>
                    <div class="flex items-center space-x-2 mt-auto pt-3 border-t">
                        <a href="${fileUrl}" download class="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded-md transition-colors">Download</a>
                    </div>
                </div>
            </div>
        `;
    };

    const renderLibraryView = (notes = allNotes) => {
        const libraryGridHTML = notes.length > 0 
            ? notes.map(createNoteCardHTML).join('') 
            : `<p class="col-span-full text-center text-gray-500">The library is empty. Use the local manager to add files.</p>`;
        
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
        if (allNotes.length === 0) {
            return `<p class="text-center text-gray-500">There are no shelves to display because the library is empty.</p>`;
        }
        const shelvesHTML = allGroups.map(group => {
            const notesInGroup = allNotes.filter(note => note.group === group);
            if (notesInGroup.length === 0) return '';
            return `
                <div>
                    <h3 class="text-2xl font-bold text-stone-800 logo-font border-b-2 border-maroon-dark pb-2 mb-6">${group}</h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">${notesInGroup.map(createNoteCardHTML).join('')}</div>
                </div>`;
        }).join('');
        return `<div id="shelves-view" class="space-y-12">${shelvesHTML || '<p class="text-center text-gray-500">No items found in any shelf.</p>'}</div>`;
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
                document.getElementById('library-grid').innerHTML = filteredNotes.length > 0 
                    ? filteredNotes.map(createNoteCardHTML).join('') 
                    : `<p class="col-span-full text-center text-gray-500">No items match your search.</p>`;
                lucide.createIcons();
            });
        }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active', 'text-stone-900', 'font-semibold'));
            e.target.classList.add('active', 'text-stone-900', 'font-semibold');
            currentView = e.target.dataset.view;
            renderView();
        });
    });

    // Initial Load
    renderView();
});
