// Authentication Handler
document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  auth.onAuthStateChanged(function(user) {
    const authRequired = document.querySelectorAll('.auth-required');
    const authNotRequired = document.querySelectorAll('.auth-not-required');
    const dashboardLink = document.getElementById('dashboard-link');
    
    if (user) {
      // User is signed in
      console.log('User is signed in:', user.email);
      
      // Show elements that require authentication
      authRequired.forEach(function(element) {
        element.classList.remove('hidden');
      });
      
      // Hide elements that are for non-authenticated users
      authNotRequired.forEach(function(element) {
        element.classList.add('hidden');
      });
      
      // Show dashboard link
      if (dashboardLink) {
        dashboardLink.classList.remove('hidden');
      }

      // Store user info in localStorage for easy access
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0]
      };
      localStorage.setItem('user', JSON.stringify(userData));
      
    } else {
      // User is signed out
      console.log('User is signed out');
      
      // Hide elements that require authentication
      authRequired.forEach(function(element) {
        element.classList.add('hidden');
      });
      
      // Show elements that are for non-authenticated users
      authNotRequired.forEach(function(element) {
        element.classList.remove('hidden');
      });
      
      // Hide dashboard link
      if (dashboardLink) {
        dashboardLink.classList.add('hidden');
      }
      
      // Remove user info from localStorage
      localStorage.removeItem('user');
    }
    
    // Hide loader if it exists
    const loaders = document.querySelectorAll('.loader-container');
    loaders.forEach(function(loader) {
      loader.classList.remove('active');
    });
  });
  
  // Handle login
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const errorElement = document.getElementById('login-error');
      
      // Show loader
      const loaders = document.querySelectorAll('.loader-container');
      loaders.forEach(function(loader) {
        loader.classList.add('active');
      });
      
      // Sign in with email and password
      auth.signInWithEmailAndPassword(email, password)
        .then(function(userCredential) {
          // Hide modal if it exists
          const authModal = document.getElementById('authModal');
          if (authModal) {
            authModal.classList.remove('active');
          }
          
          // Redirect to dashboard if on auth page
          if (window.location.pathname.includes('auth.html')) {
            window.location.href = 'dashboard.html';
          }
        })
        .catch(function(error) {
          console.error('Login error:', error);
          errorElement.textContent = error.message;
          
          // Hide loader
          loaders.forEach(function(loader) {
            loader.classList.remove('active');
          });
        });
    });
  }
  
  // Handle signup
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const passwordConfirm = document.getElementById('signup-password-confirm').value;
      const errorElement = document.getElementById('signup-error');
      
      // Password validation
      if (password.length < 6) {
        errorElement.textContent = 'Password must be at least 6 characters long';
        return;
      }
      
      if (password !== passwordConfirm) {
        errorElement.textContent = 'Passwords do not match';
        return;
      }
      
      // Show loader
      const loaders = document.querySelectorAll('.loader-container');
      loaders.forEach(function(loader) {
        loader.classList.add('active');
      });
      
      // Create user with email and password
      auth.createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
          // Create user document in Firestore
          return db.collection('users').doc(userCredential.user.uid).set({
            email: email,
            displayName: email.split('@')[0],
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            problemsSolved: 0,
            achievementsEarned: 0,
            daysStreak: 0,
            hoursSpent: 0,
            preferredLanguage: 'javascript',
            completedResources: []
          });
        })
        .then(function() {
          // Hide modal if it exists
          const authModal = document.getElementById('authModal');
          if (authModal) {
            authModal.classList.remove('active');
          }
          
          // Redirect to dashboard if on auth page
          if (window.location.pathname.includes('auth.html')) {
            window.location.href = 'dashboard.html';
          }
        })
        .catch(function(error) {
          console.error('Signup error:', error);
          errorElement.textContent = error.message;
          
          // Hide loader
          loaders.forEach(function(loader) {
            loader.classList.remove('active');
          });
        });
    });
  }
  
  // Handle logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      auth.signOut()
        .then(function() {
          console.log('User signed out');
          
          // Redirect to home page if on dashboard
          if (window.location.pathname.includes('dashboard.html')) {
            window.location.href = '../index.html';
          }
        })
        .catch(function(error) {
          console.error('Logout error:', error);
        });
    });
  }
  
  // Modal functionality
  const loginBtn = document.getElementById('login-btn');
  const signupBtn = document.getElementById('signup-btn');
  const authModal = document.getElementById('authModal');
  const closeModal = document.querySelector('.close-modal');
  
  if (loginBtn && authModal) {
    loginBtn.addEventListener('click', function() {
      authModal.classList.add('active');
      
      // Set active tab to login
      const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
      if (loginTab) {
        loginTab.click();
      }
    });
  }
  
  if (signupBtn && authModal) {
    signupBtn.addEventListener('click', function() {
      authModal.classList.add('active');
      
      // Set active tab to signup
      const signupTab = document.querySelector('.auth-tab[data-tab="signup"]');
      if (signupTab) {
        signupTab.click();
      }
    });
  }
  
  if (closeModal && authModal) {
    closeModal.addEventListener('click', function() {
      authModal.classList.remove('active');
    });
  }
  
  // Auth tab switching
  const authTabs = document.querySelectorAll('.auth-tab');
  if (authTabs.length > 0) {
    authTabs.forEach(function(tab) {
      tab.addEventListener('click', function() {
        // Remove active class from all tabs and forms
        document.querySelectorAll('.auth-tab').forEach(function(t) {
          t.classList.remove('active');
        });
        document.querySelectorAll('.auth-form').forEach(function(f) {
          f.classList.remove('active');
        });
        
        // Add active class to clicked tab and corresponding form
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab');
        document.getElementById(tabName + '-form').classList.add('active');
        
        // Clear error messages
        document.querySelectorAll('.auth-error').forEach(function(e) {
          e.textContent = '';
        });
      });
    });
  }
  
  // Tab switching from footer links
  const tabSwitches = document.querySelectorAll('.tab-switch');
  if (tabSwitches.length > 0) {
    tabSwitches.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        const tabName = link.getAttribute('data-tab');
        const tab = document.querySelector('.auth-tab[data-tab="' + tabName + '"]');
        if (tab) {
          tab.click();
        }
      });
    });
  }
  
  // Password toggle functionality
  const passwordToggles = document.querySelectorAll('.password-toggle');
  if (passwordToggles.length > 0) {
    passwordToggles.forEach(function(toggle) {
      toggle.addEventListener('click', function() {
        const passwordField = this.previousElementSibling;
        
        if (passwordField.type === 'password') {
          passwordField.type = 'text';
          this.textContent = '🔒';
        } else {
          passwordField.type = 'password';
          this.textContent = '👁️';
        }
      });
    });
  }
  
  // Mobile menu toggle
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function() {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
  }
});