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
            availableChapters.push({ number: i , title: `Chapter ${i}`, file: `${i}.html`, });
        }
        if (availableChapters.length > itemsPerPage)  document.getElementById("pagination").style.display = "flex";
    } else {
        volumeList.style.display = "block"
        volumeList.innerHTML = "<h1 style='color: red; text-align: center;'>There is no chapter available</h1>";
    }
    
    document.getElementById("spinner").style.display = "none";

    // Check if a previous page was stored, otherwise default to 1.
    currentPage = parseInt(localStorage.getItem("currentPage")) || 1;
    displayChapters(currentPage, theFIRSTexists);
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
          localStorage.setItem("currentPage", currentPage);
          window.location.href = chapter.file;
        };
        chapterDiv.innerHTML = `<h2 class="volume-title">${chapter.title}</h2>`;
        volumeList.appendChild(chapterDiv);
    });

    // Update the custom pagination control
    renderPagination();
}


function renderPagination() {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; // Clear any existing content
  
  const totalPages = Math.ceil(availableChapters.length / itemsPerPage);
  const blockSize = 5;
  const currentBlock = Math.floor((currentPage - 1) / blockSize);
  const startPage = currentBlock * blockSize + 1;
  let endPage = startPage + blockSize - 1;
  if (endPage > totalPages) {
       endPage = totalPages;
  }

  // Create container for numbered buttons
  const numbersContainer = document.createElement("div");
  numbersContainer.className = "pagination-numbers";
  
  // Create container for arrow buttons
  const arrowsContainer = document.createElement("div");
  arrowsContainer.className = "pagination-arrows";

  // Create numbered page buttons for the current block
  for (let i = startPage; i <= endPage; i++) {
       const pageBtn = document.createElement("button");
       pageBtn.innerText = i;
       if (i === currentPage) {
           pageBtn.classList.add("active-page");
       }
       pageBtn.onclick = () => {
           currentPage = i;
           displayChapters(currentPage, true);
       };
       numbersContainer.appendChild(pageBtn);
  }
  
  // Create previous block arrow button if not on the first block
  if (currentBlock > 0) {
       const prevBlockBtn = document.createElement("button");
       prevBlockBtn.innerText = "<";
       prevBlockBtn.onclick = () => {
            currentPage = (currentBlock - 1) * blockSize + 1;
            displayChapters(currentPage, true);
       };
       arrowsContainer.appendChild(prevBlockBtn);
  }
  
  // Create next block arrow button if there are more pages after the current block
  if (endPage < totalPages) {
       const nextBlockBtn = document.createElement("button");
       nextBlockBtn.innerText = ">";
       nextBlockBtn.onclick = () => {
           currentPage = endPage + 1;
           displayChapters(currentPage, true);
       };
       arrowsContainer.appendChild(nextBlockBtn);
  }
  
  // Create jump to last page arrow button if not on the last page
  if (currentPage !== totalPages) {
       const lastPageBtn = document.createElement("button");
       lastPageBtn.innerText = ">>";
       lastPageBtn.onclick = () => {
           currentPage = totalPages;
           displayChapters(currentPage, true);
       };
       arrowsContainer.appendChild(lastPageBtn);
  }
  
  // Append the numbered buttons container and then the arrow buttons container
  paginationContainer.appendChild(numbersContainer);
  paginationContainer.appendChild(arrowsContainer);
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
