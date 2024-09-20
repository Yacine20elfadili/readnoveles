const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');


// Path to your data.json file
const dataFilePath = path.join(__dirname, 'src', 'data.json');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'src', 'renderer.js'),
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'src', 'videoapp-icon.ico') // Point to your icon file
  });

  mainWindow.loadFile('src/index.html');
  // Maximize the window
  mainWindow.maximize();
}



// Listen for the 'add-video' event
ipcMain.on('add-video', (event, videoData) => {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading data.json:', err);
          return;
      }

      let jsonData;
      try {
          // Handle empty or invalid JSON
          jsonData = data ? JSON.parse(data) : [];
      } catch (e) {
          console.error('Invalid JSON in data.json:', e);
          jsonData = [];
      }

      let typeExists = false;

      // Check if the video type already exists
      jsonData.forEach(category => {
          if (category[videoData.type]) {
              typeExists = true;
              category[videoData.type].push({
                  link: videoData.link,
                  key: videoData.key
              });
          }
      });

      // If the type doesn't exist, create a new category
      if (!typeExists && videoData.type) { // Ensure videoData.type is not empty
          let newCategory = {};
          newCategory[videoData.type] = [
              {
                  link: videoData.link,
                  key: videoData.key
              }
          ];
          jsonData.push(newCategory);
      }

      // Write the updated data back to data.json
      fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8', err => {
          if (err) {
              console.error('Error writing to data.json:', err);
              return;
          }
          console.log('Video and new type added successfully!');
          event.sender.send('video-added');
      });
  });
});

// Listen for the 'delete-video' event
ipcMain.on('delete-video', (event, videoData) => {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading data.json:', err);
          return;
      }

      let jsonData = JSON.parse(data);

      jsonData.forEach(category => {
          const videoType = Object.keys(category)[0];
          category[videoType] = category[videoType].filter(video => video.link !== videoData.link && video.key !== videoData.key);
      });

      fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8', err => {
          if (err) {
              console.error('Error writing to data.json:', err);
              return;
          }
          console.log('Video deleted successfully!');
          event.sender.send('video-deleted');
      });
  });
});


// Listen for the 'rename-category' event
ipcMain.on('rename-category', (event, renameData) => {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading data.json:', err);
          return;
      }

      let jsonData = JSON.parse(data);

      // Find the category and rename it
      jsonData.forEach(category => {
          const categoryName = Object.keys(category)[0];
          if (categoryName === renameData.oldName) {
              if (renameData.newName === 'hide') {
                  // Hide the category by prepending '/' to its name
                  category[`/${renameData.oldName}`] = category[renameData.oldName];
                  delete category[renameData.oldName];
              } else {
                  // Normal rename process
                  category[renameData.newName] = category[renameData.oldName];
                  delete category[renameData.oldName];
              }
          }
      });

      // Write the updated data back to data.json
      fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8', err => {
          if (err) {
              console.error('Error writing to data.json:', err);
              return;
          }
          console.log('Category renamed successfully!');
          event.sender.send('category-renamed');
      });
  });
});


// Listen for the 'delete-category' event
ipcMain.on('delete-category', (event, categoryName) => {
  fs.readFile(dataFilePath, 'utf8', (err, data) => {
      if (err) {
          console.error('Error reading data.json:', err);
          return;
      }

      let jsonData = JSON.parse(data);

      // Filter out the category to delete
      jsonData = jsonData.filter(category => {
          const currentCategoryName = Object.keys(category)[0];
          return currentCategoryName !== categoryName; // Keep all other categories
      });

      // Write the updated data back to data.json
      fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), 'utf8', err => {
          if (err) {
              console.error('Error writing to data.json:', err);
              return;
          }
          console.log(`Category '${categoryName}' deleted successfully!`);
          event.sender.send('category-deleted'); // Notify the renderer
      });
  });
});



app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
