let currentPage = 0;
const videosPerPage = 3;
let videos = [];
let filteredVideos = []; // Store filtered videos
let imageURL = '';
const { ipcRenderer } = require('electron');
const fs = require('fs');
let currentCategoryToRename = ''; // Store the category to rename
let hiddenCategories = []; // Track hidden categories



document.addEventListener('DOMContentLoaded', function() {
    const mangaGallery = document.getElementById('mangaGallery');
    const mangaViewer = document.getElementById('mangaViewer');
    const mangaThumbnailsContainer = document.querySelector('.manga-thumbnails');
    const chapterImagesContainer = document.getElementById('chapterImages');
    const mangaPagination = document.getElementById('mangaPagination');
    const backToGalleryBtn = document.getElementById('backToGalleryBtn');
    let currentGalleryPage = 0;
    const thumbnailsPerPage = 3;
    let mangaChapters = [];
    const usbPath = 'E:/mangas';
    let chapterNumber = 0;

    // Function to count the number of folders (chapters) in the USB path
    function countFolders(directory) {
        return new Promise((resolve, reject) => {
            fs.readdir(directory, { withFileTypes: true }, (err, files) => {
                if (err) {
                    return reject(err);
                }
                // Filter only directories
                const folders = files.filter(file => file.isDirectory());
                resolve(folders.length);
            });
        });
    }

    // Use the function with async/await to count folders
    (async function() {
        try {
            chapterNumber = await countFolders(usbPath); // Await the promise to get the actual value
            console.log('chapterNumber value:', chapterNumber); // Now it will log the correct value

            // Initialize the gallery after fetching chapter number
            initMangaGallery();
        } catch (err) {
            console.error('Error:', err);
        }
    })();
    

    // Helper function to get the number of folders (chapters) and images
    function getFoldersAndImages(path) {
        // This is a placeholder logic, in an actual app, 
        // you'd need a backend process to read the USB drive
        const folders = []; // Dynamically fetch folder names
        const images = []; // Dynamically fetch image files in each folder
        // Assume 10 chapters with varying image counts for now
        for (let i = 1; i <= 10; i++) {
            folders.push(`${path}/${i}`);
        }
        return { folders, images };
    }


    // Initialize the Manga Gallery after chapter count is ready
    function initMangaGallery() {
        // Populate mangaChapters based on the chapter count
        for (let i = 1; i <= chapterNumber; i++) {
            mangaChapters.push(`${usbPath}/${i}`);
        }
        displayMangaThumbnails();
        createPagination();
    }

    // Display thumbnails based on the current page
    function displayMangaThumbnails() {
        mangaThumbnailsContainer.innerHTML = '';
        const start = currentGalleryPage * thumbnailsPerPage;
        const end = Math.min(start + thumbnailsPerPage, mangaChapters.length);

        for (let i = start; i < end; i++) {
            const chapterPath = mangaChapters[i];
            const thumbnailDiv = document.createElement('div');
            thumbnailDiv.className = 'thumbnail-image';
            thumbnailDiv.innerHTML = `<img src="${chapterPath}/1.jpg" onerror="this.src='aabbcc.png'" />`;
            thumbnailDiv.onclick = () => goToFolder(chapterPath);
            mangaThumbnailsContainer.appendChild(thumbnailDiv);
        }
    }

    // Create pagination buttons
    function createPagination() {
        mangaPagination.innerHTML = '';
        const totalMangaPages = Math.ceil(mangaChapters.length / thumbnailsPerPage);

        for (let i = 0; i < totalMangaPages; i++) {
            const chapterbutton = document.createElement('button');
            chapterbutton.textContent = i + 1;
            chapterbutton.onclick = () => {
                currentGalleryPage = i;
                displayMangaThumbnails();
            };
            mangaPagination.appendChild(chapterbutton);
        }
    }

    // Go to manga chapter folder and load images
    function goToFolder(chapterPath) {
        mangaGallery.style.display = 'none';
        mangaViewer.style.display = 'block';
        loadChapterImages(chapterPath);
    }

    // Load images from the selected chapter
    function loadChapterImages(chapterPath) {
        chapterImagesContainer.innerHTML = '<div class="loading-spinner"></div>'; // Show loading spinner

        // Simulate loading images
        setTimeout(() => {
            chapterImagesContainer.innerHTML = '';
            for (let i = 1; i <= 10; i++) { // Assume there are 10 images per chapter
                const img = document.createElement('img');
                img.src = `${chapterPath}/${i}.jpg`;
                img.onerror = () => { img.src = 'aabbcc.png'; }; // Handle missing images
                chapterImagesContainer.appendChild(img);
            }
        }, 1000); // Simulate delay for image loading
    }

    // Back to gallery
    backToGalleryBtn.onclick = () => {
        mangaViewer.style.display = 'none';
        mangaGallery.style.display = 'block';
        currentGalleryPage = 0; // Reset to the first page
        displayMangaThumbnails();
    };


});


// Load videos from data.json and initialize the app
async function fetchVideos() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        videos = data;

        // Filter hidden categories from the display
        videos = videos.filter(category => {
            const videoType = Object.keys(category)[0];
            if (videoType.startsWith('/')) {
                hiddenCategories.push(category); // Store hidden categories
                return false; // Do not show hidden categories
            }
            return true;
        });

        initializeApp();
    } catch (error) {
        console.error('Error loading video data:', error);
    }
}

// Unhide categories if "unhide" code is detected
function unhideCategories() {
    hiddenCategories.forEach(category => {
        const oldCategoryName = Object.keys(category)[0];
        const newCategoryName = oldCategoryName.substring(1); // Remove the leading '/'
        category[newCategoryName] = category[oldCategoryName];
        delete category[oldCategoryName]; // Remove the old hidden category
        videos.push(category); // Add the updated category back to the visible list
    });
    hiddenCategories = []; // Clear hidden categories
    updateSidebar();
}


// Initialize the application: populate sidebar and select dropdown
function initializeApp() {
    // Check if there are any video categories in data.json
    if (videos.length === 0) {
        // If no categories, hide the dropdown and show the new type container
        document.getElementById('videoTypeSelect').style.display = 'none';
        document.getElementById('newTypeContainer').style.display = 'block';
    } else {
        // Otherwise, show the dropdown and populate it
        document.getElementById('videoTypeSelect').style.display = 'block';
        document.getElementById('newTypeContainer').style.display = 'none';
        populateVideoTypeSelect();
    }
    updateSidebar();
}


// Populate the sidebar with video types and add rename/delete buttons
function updateSidebar() {
    const sidebarList = document.getElementById('videoTypeList');
    sidebarList.innerHTML = ''; // Clear existing items

    videos.forEach(category => {
        const videoType = Object.keys(category)[0];
        const listItem = document.createElement('li');

        // Create rename button for categories
        const renameBtn = document.createElement('button');
        renameBtn.className = 'category-rename-btn';
        renameBtn.innerHTML = '<i class="fas fa-edit"></i>'; // Edit icon
        renameBtn.onclick = (event) => {
        event.stopPropagation(); // Prevent sidebar from closing
        openRenameModal(videoType);
        };

        // Create delete button for categories
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'category-delete-btn';
        deleteBtn.innerHTML = '🗑️'; // Trash icon
        deleteBtn.onclick = (event) => {
        event.stopPropagation(); // Prevent sidebar from closing
        confirmDeleteCategory(videoType);
        };  

        // Add category name, rename button, and delete button
        listItem.textContent = videoType.replace('-', ' ');
        listItem.appendChild(renameBtn);
        listItem.appendChild(deleteBtn);
        listItem.onclick = () => filterVideos(videoType); // Keep filter functionality
        sidebarList.appendChild(listItem);
    });
}

// Function to confirm and delete category
function confirmDeleteCategory(categoryName) {
    if (categoryName.startsWith('/')) {
        alert("Hidden categories cannot be deleted.");
        return; // Prevent deletion of hidden categories
    }

    if (confirm(`Are you sure you want to delete the category '${categoryName}'?`)) {
        ipcRenderer.send('delete-category', categoryName);
    }
}

// Listen for category deleted event from the main process
ipcRenderer.on('category-deleted', () => {
    fetchVideos(); // Reload videos and refresh the sidebar
    updateSidebar();
});
    

// Open rename modal
function openRenameModal(category) {
    currentCategoryToRename = category;
    document.getElementById('renameCategoryModal').style.display = 'block';
}

// Handle rename confirmation
document.getElementById('confirmRenameCategory').addEventListener('click', () => {
    const newCategoryName = document.getElementById('newCategoryName').value.trim();
    
    if (newCategoryName) {
        if (newCategoryName === '/unhide') {
            unhideCategories(); // Special case: unhide hidden categories
        } else {
            ipcRenderer.send('rename-category', { oldName: currentCategoryToRename, newName: newCategoryName });
        }
        document.getElementById('renameCategoryModal').style.display = 'none';
    } else {
        alert('Category name cannot be empty.');
    }
});

// Handle cancel rename action
document.getElementById('cancelRenameCategory').addEventListener('click', () => {
    document.getElementById('renameCategoryModal').style.display = 'none';
});

// Listen for category renamed event from main process
ipcRenderer.on('category-renamed', () => {
    fetchVideos();
    updateSidebar();
});



// Populate the select dropdown in the add video modal
function populateVideoTypeSelect() {
    const videoTypeSelect = document.getElementById('videoTypeSelect');
    videoTypeSelect.innerHTML = ''; // Clear existing options

    videos.forEach(category => {
        const videoType = Object.keys(category)[0];
        const option = document.createElement('option');
        option.value = videoType;
        option.textContent = videoType.replace('-', ' ');  // Display format
        videoTypeSelect.appendChild(option);
    });

    // Add the "Other" option for new video types
    const otherOption = document.createElement('option');
    otherOption.value = 'other';
    otherOption.textContent = 'Autre (Other)';
    videoTypeSelect.appendChild(otherOption);
}

// Handle change event for video type selection in the modal
document.getElementById('videoTypeSelect').addEventListener('change', (event) => {
    const newTypeContainer = document.getElementById('newTypeContainer');
    newTypeContainer.style.display = event.target.value === 'other' ? 'block' : 'none';
});

// Open modal when plus button is clicked
document.getElementById('addVideoBtn').addEventListener('click', () => {
    document.getElementById('addVideoModal').style.display = 'block';
});

// Handle cancel button in modal
document.getElementById('cancelAddVideo').addEventListener('click', () => {
    document.getElementById('addVideoModal').style.display = 'none';
});

// Handle confirm button in modal
document.getElementById('confirmAddVideo').addEventListener('click', () => {
    const videoType = document.getElementById('videoTypeSelect').value;
    const newVideoType = document.getElementById('newVideoType').value.trim();
    const videoURL = document.getElementById('videoURL').value.trim();

    // Unhide condition: if the name is "/" and the URL is "unhide"
    if (newVideoType === '/' && videoURL === 'unhide') {
        unhideCategories(); // Unhide all hidden categories
    } else {
        // Validate inputs for normal category creation
        if (!videoURL || (videoType === 'other' && !newVideoType)) {
            alert('All fields are required!');
            return;
        }

        // Continue with normal category creation
        const link = videoURL.replace('/file/', '/embed/').split('#')[0];
        const key = videoURL.includes('#') ? videoURL.substring(videoURL.indexOf('#')) : '';

        const videoData = {
            type: videoType === 'other' ? newVideoType : videoType,
            link: link,
            key: key
        };

        ipcRenderer.send('add-video', videoData);
    }
        // Update the sidebar and select dropdown with the new type
        updateSidebar();
        populateVideoTypeSelect();

    document.getElementById('addVideoModal').style.display = 'none';
});



// Event listener for when a video is added via IPC
ipcRenderer.on('video-added', () => {
    fetchVideos();
    displayThumbnails();
});

// Display video thumbnails
function displayThumbnails() {
    const container = document.getElementById('thumbnailContainer');
    container.innerHTML = ''; // Clear existing thumbnails

    const start = currentPage * videosPerPage;
    const end = Math.min(start + videosPerPage, filteredVideos.length);
    const videoCount = end - start;

    // Remove previous layout classes
    container.classList.remove('one-item', 'two-items', 'three-items');

    // Apply the correct class based on the number of videos
    if (videoCount === 1) {
        container.classList.add('one-item');
    } else if (videoCount === 2) {
        container.classList.add('two-items');
    } else {
        container.classList.add('three-items');
    } 

    for (let i = start; i < end; i++) {
        const video = filteredVideos[i];
        const videoItem = document.createElement('div');
        videoItem.classList.add('video-item');
        
        videoItem.innerHTML = `
            <img src="${imageURL}" alt="Video Thumbnail" class="video-thumbnail" onclick="playVideo('${video.link}', '${video.key}')">
            <span class="play-button">&#9658;</span>
            <button class="delete-btn" onclick="deleteVideo('${video.link}', '${video.key}')">🗑️</button>
        `;
        container.appendChild(videoItem);
    }

    // Show the thumbnail container
    container.style.display = 'grid';
}


// Handle deleting a video
function deleteVideo(link, key) {
    if (confirm('Are you sure you want to delete this video?')) {
        ipcRenderer.send('delete-video', { link, key });
    }
}

// Receive updated video data from the main process
ipcRenderer.on('video-deleted', () => {
    fetchVideos();
    displayThumbnails();
});

// Play video
function playVideo(link, key) {
    const videoUrl = `${link}${key}`;
    const player = document.getElementById('videoPlayer');
    player.src = videoUrl;

    // Add half-fade effect on the playing thumbnail
    document.querySelectorAll('.video-item').forEach(item => {
        item.classList.remove('playing');
    });
    event.target.closest('.video-item').classList.add('playing');
}


// Create numbered buttons for pagination
function createPaginationButtons() {
    const buttonContainer = document.getElementById('buttonContainer');
    buttonContainer.innerHTML = ''; // Clear existing buttons
    const totalPages = Math.ceil(filteredVideos.length / videosPerPage);

    for (let i = 0; i < totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i + 1;
        button.onclick = () => {
            currentPage = i;
            displayThumbnails();
            highlightActiveButton(i);
        };
        buttonContainer.appendChild(button);
    }

    highlightActiveButton(currentPage);
}

// Highlight the current page button
function highlightActiveButton(activePage) {
    const buttons = document.querySelectorAll('.button-container button');
    buttons.forEach((button, index) => {
        button.classList.toggle('active', index === activePage);
    });
}

// Filter videos by type
function filterVideos(type) {
    const category = videos.find(category => category[type]);

    if (category) {
        filteredVideos = category[type];

        // Extract all the category names dynamically from data.json
        const categories = videos.map(category => Object.keys(category)[0]);

        // Set imageURL based on the order of the categories
        if (type === categories[0]) {
            imageURL = "thumbnail.jpg"; // First category image
        } else if (type === categories[1]) {
            imageURL = "animeanime.jpg"; // Second category image
        }else if (type === categories[2]) {
            imageURL = "ddeeff.jpg"; // Second category image
        } else {
            imageURL = "aabbcc.png"; // Default image for other categories
        }

        currentPage = 0;
        displayThumbnails();
        createPaginationButtons();
        setTimeout(closeSidebar, 500); // Close sidebar after 2 seconds
    } else {
        console.error("No videos found for type: " + type);
    }
}


// Close the sidebar
function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        document.getElementById('thumbnailContainer').style.display = 'grid';
    }
    document.getElementById('addVideoModal').style.display = 'none';
    document.getElementById('renameCategoryModal').style.display = 'none';//555
}

// Toggle Sidebar
document.getElementById('listButton').onclick = function() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');

    if (sidebar.classList.contains('open')) {
        document.getElementById('thumbnailContainer').style.display = 'none';
    } else {
        document.getElementById('thumbnailContainer').style.display = 'grid';
        document.getElementById('addVideoModal').style.display = 'none';
        document.getElementById('renameCategoryModal').style.display = 'none';
    }
};

// Hide the thumbnail container by default
document.getElementById('thumbnailContainer').style.display = 'none';

// Fetch and display videos on load
document.addEventListener('DOMContentLoaded', async () => {
    await fetchVideos();
});