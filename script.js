// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Element References ---
    const uploadBtn = document.getElementById('upload-btn');
    const uploadModal = document.getElementById('upload-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const uploadForm = document.getElementById('upload-form');
    const groupSelect = document.getElementById('group-select');
    const searchInput = document.getElementById('search-input');
    
    const views = {
        library: document.getElementById('library-view'),
        shelves: document.getElementById('shelves-view'),
        knowledgeGraph: document.getElementById('knowledge-graph-view')
    };
    
    const containers = {
        libraryGrid: document.getElementById('library-grid'),
        shelvesGrid: document.getElementById('shelves-grid'),
        filterButtons: document.getElementById('filter-buttons')
    };

    const navLinks = document.querySelectorAll('.nav-link');

    const API_URL = 'http://localhost:3000';
    let allNotes = [];
    let allGroups = [];

    // --- 2. Core Functions ---

    /**
     * Fetches all data (notes and groups) from the backend
     * @param {string} searchTerm - Optional search query
     */
    const fetchData = async (searchTerm = '') => {
        try {
            const response = await fetch(`${API_URL}/api/data?search=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            allNotes = data.notes;
            const newGroups = data.groups;

            if (JSON.stringify(allGroups) !== JSON.stringify(newGroups)) {
                allGroups = newGroups;
                populateGroupOptions(allGroups);
                renderFilterButtons(allGroups);
            }
            
            renderNotes(allNotes);
            renderShelves(allNotes, allGroups);

        } catch (error) {
            console.error('Failed to fetch data:', error);
            containers.libraryGrid.innerHTML = `<p class="col-span-full text-center text-red-500">Failed to load library data.</p>`;
        }
    };

    /**
     * Renders a single note card.
     * @param {object} note - The note object to render.
     * @returns {string} - The HTML string for the card.
     */
    const createNoteCardHTML = (note) => {
        const imageSrc = note.type === 'image' 
            ? `${API_URL}${note.filePath}` 
            : `https://placehold.co/600x400/c47b7b/ffffff?text=${encodeURIComponent(note.group)}`;
        
        return `
            <div class="bg-white rounded-xl shadow-lg overflow-hidden card-hover-effect flex flex-col">
                <a href="${API_URL}${note.filePath}" target="_blank" class="block">
                    <img src="${imageSrc}" alt="${note.displayName}" class="w-full h-48 object-cover">
                </a>
                <div class="p-4 flex-grow flex flex-col">
                    <h3 class="text-lg font-bold mb-1 truncate flex-grow">${note.displayName}</h3>
                    <span class="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded-full self-start mb-3">${note.group}</span>
                    <div class="flex items-center space-x-2 mt-auto pt-3 border-t">
                        <a href="${API_URL}${note.filePath}" download="${note.fileName}" class="flex-1 text-center bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm px-3 py-1.5 rounded-md transition-colors">Download</a>
                        <button data-id="${note.id}" class="delete-btn bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-md transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                </div>
            </div>
        `;
    };

    /**
     * Renders notes in the main library grid.
     * @param {Array} notes - The array of note objects to display.
     */
    const renderNotes = (notes) => {
        containers.libraryGrid.innerHTML = '';
        if (notes.length === 0) {
            containers.libraryGrid.innerHTML = `<p class="col-span-full text-center text-gray-500">No items found. Try uploading something!</p>`;
        } else {
            notes.forEach(note => {
                containers.libraryGrid.innerHTML += createNoteCardHTML(note);
            });
        }
        lucide.createIcons();
    };
    
    /**
     * Renders notes organized by shelves (groups).
     * @param {Array} notes - All notes.
     * @param {Array} groups - All available groups.
     */
    const renderShelves = (notes, groups) => {
        containers.shelvesGrid.innerHTML = '';
        groups.forEach(group => {
            const notesInGroup = notes.filter(note => note.group === group);
            if (notesInGroup.length > 0) {
                const shelfHTML = `
                    <div>
                        <h3 class="text-2xl font-bold text-stone-800 logo-font border-b-2 border-maroon-dark pb-2 mb-6">${group}</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                            ${notesInGroup.map(createNoteCardHTML).join('')}
                        </div>
                    </div>
                `;
                containers.shelvesGrid.innerHTML += shelfHTML;
            }
        });
        lucide.createIcons();
    };

    /**
     * Populates the group selection dropdown in the modal.
     */
    const populateGroupOptions = (groups) => {
        groupSelect.innerHTML = '<option value="">Select an existing group</option>';
        groups.forEach(group => {
            groupSelect.innerHTML += `<option value="${group}">${group}</option>`;
        });
    };

    /**
     * Renders the filter buttons for the main library view.
     */
    const renderFilterButtons = (groups) => {
        containers.filterButtons.innerHTML = '<button class="filter-btn active" data-filter="All">All</button>';
        groups.forEach(group => {
            containers.filterButtons.innerHTML += `<button class="filter-btn" data-filter="${group}">${group}</button>`;
        });
    };

    /**
     * Switches the visible view (Library, Shelves, etc.).
     * @param {string} viewName - The name of the view to show.
     */
    const switchView = (viewName) => {
        Object.values(views).forEach(view => view.classList.add('view-hidden'));
        if (views[viewName]) {
            views[viewName].classList.remove('view-hidden');
        }
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.view === viewName);
        });
    };

    // --- 3. Event Listeners ---

    // Navigation
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = e.target.dataset.view;
            switchView(viewName);
        });
    });

    // Modal Open/Close
    uploadBtn.addEventListener('click', () => uploadModal.classList.replace('hidden', 'flex'));
    closeModalBtn.addEventListener('click', () => uploadModal.classList.replace('flex', 'hidden'));

    // Form Submission
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(uploadForm);
        if (!formData.get('group') && !formData.get('newGroup')) {
            alert('Please select an existing group or create a new one.');
            return;
        }
        try {
            const response = await fetch(`${API_URL}/api/notes`, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(await response.text());
            uploadForm.reset();
            uploadModal.classList.replace('flex', 'hidden');
            await fetchData();
        } catch (error) {
            console.error('Error uploading file:', error);
            alert(`Upload failed: ${error.message}`);
        }
    });

    // Filtering
    containers.filterButtons.addEventListener('click', (e) => {
        if (e.target.classList.contains('filter-btn')) {
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const filter = e.target.dataset.filter;
            const filteredNotes = (filter === 'All') ? allNotes : allNotes.filter(note => note.group === filter);
            renderNotes(filteredNotes);
        }
    });
    
    // Searching (with debounce)
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchData(e.target.value);
            switchView('library'); // Always switch to library view on search
        }, 300);
    });

    // Delete Button (using event delegation)
    document.body.addEventListener('click', async (e) => {
        const deleteButton = e.target.closest('.delete-btn');
        if (deleteButton) {
            const noteId = deleteButton.dataset.id;
            if (confirm('Are you sure you want to delete this item?')) {
                try {
                    const response = await fetch(`${API_URL}/api/notes/${noteId}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error(await response.text());
                    await fetchData(); // Refresh data after deletion
                } catch (error) {
                    console.error('Error deleting note:', error);
                    alert(`Deletion failed: ${error.message}`);
                }
            }
        }
    });

    // --- 4. Initial Load ---
    fetchData();
    lucide.createIcons();
});
