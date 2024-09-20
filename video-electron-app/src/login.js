// login.js

document.addEventListener("DOMContentLoaded", function () {
    const loginPage = document.getElementById('loginPage');
    const mainApp = document.getElementById('mainApp');
    const hiddenApp = document.getElementById('hiddenApp'); // Hidden App
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');
    const logoutBtn = document.getElementById('logoutBtn');
    const readButton = document.getElementById('readButton');
    const watchButton = document.getElementById('watchButton'); // WATCH button
    const logoutBtnHidden = document.getElementById('logoutBtnHidden'); // Logout in hiddenApp
    
    // Password generation logic based on current date
    function generatePassword(prefix) {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${prefix}${day}${month}${year}`;
    }

 

    // Function to check if the user is logged in
    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    // Function to log the user in
    function login() {
        const enteredPassword = passwordInput.value;

        if (enteredPassword === generatePassword('video')) {
            localStorage.setItem('isLoggedIn', 'true');
            showMainApp();
            hideReadButton(); // Ensure READ button is hidden
        } else if (enteredPassword === generatePassword('manga')) {
            localStorage.setItem('isLoggedIn', 'true');
            showMainApp();
            showReadButton(); // Show READ button
        } else {
            errorMessage.style.display = 'block'; // Show error message
        }
    }

    // Function to show the main app
    function showMainApp() {
        loginPage.style.display = 'none';
        mainApp.style.display = 'block';
        hiddenApp.style.display = 'none'; // Ensure hiddenApp is hidden
    }


    // Function to show the hiddenApp
    function showHiddenApp() {
        mainApp.style.display = 'none';
        hiddenApp.style.display = 'block'; // Show hidden app
    }

    // Function to show the READ button
    function showReadButton() {
        readButton.style.display = 'inline-block';
    }

    // Function to hide the READ button
    function hideReadButton() {
        readButton.style.display = 'none';
    }

    // Function to log the user out
    function logout() {
        localStorage.removeItem('isLoggedIn'); // Remove login state
        location.reload(); // Reload the page to show the login page again
    }

    // Check login status on page load
    if (isLoggedIn()) {
        showMainApp(); // Skip login if the user is already logged in
        const isMangaLogin = localStorage.getItem('passwordType') === 'manga';
        if (isMangaLogin) {
            showReadButton(); // Show READ button if last login was with manga password
        }
    }

    // Login button click event
    loginBtn.addEventListener('click', login);

    // READ button click event (Switch to hiddenApp)
    readButton.addEventListener('click', showHiddenApp);

    // WATCH button click event (Switch back to mainApp)
    watchButton.addEventListener('click', showMainApp);

    // Logout button click event for mainApp
    logoutBtn.addEventListener('click', logout);

    // Logout button click event for hiddenApp
    logoutBtnHidden.addEventListener('click', logout);
});
