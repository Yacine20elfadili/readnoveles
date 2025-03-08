// Toggle password visibility
document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    this.textContent = type === 'password' ? '👁️' : '🙈';
  });
  
  
  // Handle form submission
  document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
  
    // Disable button and show loading state
    const loginButton = document.getElementById('loginButton');
    loginButton.classList.add('loading');
    loginButton.textContent = 'Logging in...';
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Simulate async request
    setTimeout(function() {
      if (username === 'medyacine' && password === '2005') {
        showWelcomeMessage(`Welcome, ${username}!`);
      } else {
        showErrorMessage('Invalid username or password.');
      }
  
      // Reset button state
      loginButton.classList.remove('loading');
      loginButton.textContent = 'Login';
    }, 1000);
  });
  
  function showErrorMessage(message) {
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    
    usernameError.textContent = message;
    passwordError.textContent = message;
  
    usernameError.style.display = 'block';
    passwordError.style.display = 'block';
  
    setTimeout(() => {
      usernameError.style.display = 'none';
      passwordError.style.display = 'none';
    }, 3000);
  }
  
  function showWelcomeMessage(message) {
    const welcomeMessage = document.getElementById('welcomeMessage');
    welcomeMessage.textContent = message;
    welcomeMessage.style.display = 'block';
  
    setTimeout(() => {
      window.location.href = 'chapterList.html'; // Redirect to next page
    }, 1500);
  }
  
