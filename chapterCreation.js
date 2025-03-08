const startChapter = 442;
let endChapter;
let availableChapters = [];

async function findLastChapter() {
  document.getElementById("spinner").style.display = "block";
  for (let i = startChapter; i <= 99999; i++) {
    try {
      const response = await fetch(`${i}.html`);
      if (response.ok) {
        console.log(`File ${i} exists`);
        availableChapters.push({
          number: i,
          title: `Chapter ${i}`,
          file: `${i}.html`,
        });
      } else {
        console.log(`File ${i} does not exist`);
        endChapter = i - 1; // Set endChapter to the last existing chapter
        break;
      }
    } catch (error) {
      console.log(`File ${i} does not exist`);
      endChapter = i - 1;
      break;
    }
  }
  console.log(`Last available chapter is: ${endChapter}`);
  document.getElementById("spinner").style.display = "none";
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

  const pageInfo = document.getElementById("pageInfo");
  pageInfo.innerText = `Page ${page} of ${Math.ceil(
    availableChapters.length / itemsPerPage
  )}`;

  // Trigger the fade-in animation on page info
  pageInfo.classList.remove("animate");
  void pageInfo.offsetWidth; // Force reflow
  pageInfo.classList.add("animate");

  document.getElementById("prevBtn").disabled = page === 1;
  document.getElementById("nextBtn").disabled =
    page === Math.ceil(availableChapters.length / itemsPerPage);
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

// Start checking files
findLastChapter();
