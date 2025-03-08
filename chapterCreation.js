const startChapter = 442;
let endChapter;
let availableChapters = [];

async function findLastChapter() {
  document.getElementById("spinner").style.display = "block"; // Show spinner
  document.getElementById("pagination").style.display = "none";

  const maxChapters = 1000; // Limit search range to avoid excessive requests
  let requests = [];

  for (let i = startChapter; i <= maxChapters; i++) {
    requests.push(fetch(`${i}.html`).then(response => ({ chapter: i, exists: response.ok })));
  }

  const results = await Promise.all(requests); // Wait for all requests

  for (const { chapter, exists } of results) {
    if (exists) {
      availableChapters.push({
        number: chapter,
        title: `Chapter ${chapter}`,
        file: `${chapter}.html`,
      });
    } else {
      endChapter = chapter - 1;
      break;
    }
  }

  console.log(`Last available chapter is: ${endChapter}`);
  document.getElementById("spinner").style.display = "none"; // Hide spinner
  document.getElementById("pagination").style.display = "flex";
  
  displayChapters(currentPage);
}

const itemsPerPage = 15;
let currentPage = 1;

function displayChapters(page) {
  const volumeList = document.getElementById("volumeList");
  volumeList.innerHTML = "";

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

document.getElementById("prevBtn").onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    displayChapters(currentPage);
  }
};

document.getElementById("nextBtn").onclick = () => {
  if (currentPage < Math.ceil(availableChapters.length / itemsPerPage)) {
    currentPage++;
    displayChapters(currentPage);
  }
};

findLastChapter(); // Start checking files
