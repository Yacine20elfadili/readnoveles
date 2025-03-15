const startChapter = 442;
let endChapter;
let availableChapters = [];
const itemsPerPage = 15;
let currentPage = 1;

// Function to check if a chapter file exists
async function checkChapter(chapter) {
    let response = await fetch(`${chapter}.html`);
    console.log(`Checking chapter ${chapter}: ${response.ok ? "Exists" : "Not Found!!!!!!!!!!!!!"}`);
    return response.ok;
}

// Optimized function to find the last available chapter
async function findLastChapter() {
    document.getElementById("spinner").style.display = "block"; // Show spinner
    document.getElementById("pagination").style.display = "none";

    let low = startChapter;
    let high = 1000; // Upper limit to prevent unnecessary requests
    let lastValid = startChapter;

    // Binary search to find the last available chapter
    while (low <= high) {
        let mid = Math.floor((low + high) / 2);
        let exists = await checkChapter(mid);

        if (exists) {
            lastValid = mid;
            low = mid + 1;  // Search in the higher range
        } else {
            high = mid - 1; // Search in the lower range
        }
    }

    const volumeList = document.getElementById("volumeList");
    
    endChapter = lastValid;
    let theFIRSTexists = await checkChapter(endChapter);
    if (theFIRSTexists) {
        console.log(`Last available chapter is: ${endChapter}`);

        for (let i = startChapter; i <= endChapter; i++) {
            availableChapters.push({
                number: i,
                title: `Chapter ${i}`,
                file: `${i}.html`,
            });
        }
        if (availableChapters.length > itemsPerPage)  document.getElementById("pagination").style.display = "flex";
    } else {
        volumeList.style.display = "block"
        volumeList.innerHTML = "<h1 style='color: red; text-align: center;'>There is no chapter available</h1>";
    }
    
    

    

    document.getElementById("spinner").style.display = "none";
    displayChapters(1 , theFIRSTexists);
    initCreateChapterButton(); // Initialize the create chapter button after chapters are loaded
}

// Function to display chapters
function displayChapters(page , really) {
    const volumeList = document.getElementById("volumeList");
    if (really) {
        volumeList.innerHTML = "";
    }
    
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedChapters = availableChapters.slice(startIndex, endIndex);

    paginatedChapters.forEach((chapter) => {
        const chapterDiv = document.createElement("div");
        chapterDiv.className = "volume";
        chapterDiv.onclick = () => {
            window.location.href = chapter.file;
        };
        chapterDiv.innerHTML = `<h2 class="volume-title">${chapter.title}</h2>`;
        volumeList.appendChild(chapterDiv);
    });

    document.getElementById("pageInfo").innerText = `Page ${page} of ${Math.ceil(availableChapters.length / itemsPerPage)}`;
    document.getElementById("prevBtn").disabled = page === 1;
    document.getElementById("nextBtn").disabled = page === Math.ceil(availableChapters.length / itemsPerPage);
}

// Pagination controls
document.getElementById("prevBtn").onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        displayChapters(currentPage , true);
    }
};

document.getElementById("nextBtn").onclick = () => {
    if (currentPage < Math.ceil(availableChapters.length / itemsPerPage)) {
        currentPage++;
        displayChapters(currentPage , true);
    }
};

// Dark Mode Toggle Functionality
const darkModeToggle = document.getElementById("darkModeToggle");
// Ensure the button text reflects the current mode on page load
darkModeToggle.innerText = document.body.classList.contains("dark-mode")
  ? "Light Mode"
  : "Dark Mode";
darkModeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  darkModeToggle.innerText = document.body.classList.contains("dark-mode")
    ? "Light Mode"
    : "Dark Mode";
});

findLastChapter(); // Start checking files
