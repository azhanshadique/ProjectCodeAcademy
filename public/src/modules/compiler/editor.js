// import { getApps } from "firebase/app";
import { getApps } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { codeTemplates, executeCodeUsingJudge0,  judge0LanguageIds } from "./judge0.js";
import { auth } from "../../scripts/auth.js";
import { dbFirestore } from "../../scripts/init.js";
import {
  doc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";


document.addEventListener("DOMContentLoaded", function () {
  if (getApps().length === 0) {
    console.error("Firebase is not initialized");
    return;
  }
  // DOM Elements
  const codeEditor = document.getElementById('codeEditor');
  const languageSelect = document.getElementById('languageSelect');
  const customInput = document.getElementById('customInput');
  const outputContent = document.getElementById('outputContent');
  const runButton = document.getElementById('runCode');
  const clearCodeButton = document.getElementById('clearCode');
  const formatCodeButton = document.getElementById('formatCode');
  const clearInputButton = document.getElementById('clearInput');
  const clearOutputButton = document.getElementById('clearOutput');
  const saveCodeButton = document.getElementById('saveCode');
  const loadCodeButton = document.getElementById('loadCode');
  const saveStatus = document.getElementById('saveStatus');
  const autoSaveStatus = document.getElementById('autoSaveStatus');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const editorWrapper = document.getElementById('editorWrapper');
  const editorTitle = document.getElementById('editorTitle');

  // Initial state and variables
  let isRunning = false;
  let autoSaveTimer = null;
  let currentSnippetId = null;
  let isAuthenticated = false;
  let isEdited = false;

  // Initialize editor with default code
  if (codeEditor) {
    const defaultLanguage = 'javascript';
    languageSelect.value = defaultLanguage;
    codeEditor.value = codeTemplates[defaultLanguage];
    
    // Set up code editor
    codeEditor.addEventListener('input', function() {
      isEdited = true;
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
      
      if (isAuthenticated) {
        autoSaveTimer = setTimeout(function() {
          autoSaveCode();
        }, 3000); // Auto-save after 3 seconds of inactivity
      }
    });
  }

  // Run Code Button
  if (runButton) {
    runButton.addEventListener('click', function() {
      if (isRunning) return;
      
      isRunning = true;
      runButton.classList.add('loading');
      outputContent.textContent = 'Running code...';
      
      const language = languageSelect.value;
      const code = codeEditor.value;
      const input = customInput.value;
      
      executeCodeUsingJudge0(code, judge0LanguageIds[language], input, function(result) {
        isRunning = false;
        runButton.classList.remove('loading');
        
        if (result.success) {
          outputContent.classList.remove('error');
          outputContent.textContent = result.output;
        } else {
          outputContent.classList.add('error');
          outputContent.textContent = result.error;
        }
      });
    });
  }

  // Clear Code Button
  if (clearCodeButton) {
    clearCodeButton.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear all code?')) {
        const language = languageSelect.value;
        codeEditor.value = codeTemplates[language];
        isEdited = true;
      }
    });
  }

  // Format Code Button
  if (formatCodeButton) {
    formatCodeButton.addEventListener('click', function() {
      // Simple indentation formatting
      const code = codeEditor.value;
      
      try {
        let formattedCode = code;
        
        // Remove extra line breaks
        formattedCode = formattedCode.replace(/\n\s*\n\s*\n/g, '\n\n');
        
        // Fix indentation (basic implementation)
        const lines = formattedCode.split('\n');
        let indentLevel = 0;
        const indentChar = '    '; // 4 spaces
        
        const formattedLines = lines.map(line => {
          const trimmedLine = line.trim();
          
          // Adjust indent level based on braces
          if (trimmedLine.endsWith('{')) {
            const indentedLine = indentChar.repeat(indentLevel) + trimmedLine;
            indentLevel++;
            return indentedLine;
          } else if (trimmedLine.startsWith('}')) {
            indentLevel = Math.max(0, indentLevel - 1);
            return indentChar.repeat(indentLevel) + trimmedLine;
          } else {
            return indentChar.repeat(indentLevel) + trimmedLine;
          }
        });
        
        codeEditor.value = formattedLines.join('\n');
        isEdited = true;
      } catch (error) {
        console.error('Error formatting code:', error);
        alert('Could not format code. Try again later.');
      }
    });
  }

  // Clear Input Button
  if (clearInputButton) {
    clearInputButton.addEventListener('click', function() {
      customInput.value = '';
    });
  }

  // Clear Output Button
  if (clearOutputButton) {
    clearOutputButton.addEventListener('click', function() {
      outputContent.textContent = '';
      outputContent.classList.remove('error');
    });
  }

  // Language Select Change
  if (languageSelect) {
    languageSelect.addEventListener('change', function() {
      if (!isEdited || confirm('Changing the language will reset your code. Continue?')) {
        const language = this.value;
        codeEditor.value = codeTemplates[language];
        isEdited = false;
      } else {
        // Revert to previous selection
        this.value = [...this.options].find(option => 
          option.defaultSelected
        )?.value || 'javascript';
      }
    });
  }

  // Save Code Button
  if (saveCodeButton) {
    saveCodeButton.addEventListener('click', function() {
      const title = prompt('Enter a title for your code snippet:', editorTitle.textContent !== 'Interactive Code Editor' ? editorTitle.textContent : '');
      if (title === null) return; // User canceled
      
      saveCode(title);
    });
  }

  // Load Code Button
  if (loadCodeButton) {
    loadCodeButton.addEventListener('click', function() {
      loadSavedSnippets();
    });
  }

  // Fullscreen Button
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', function() {
      editorWrapper.classList.toggle('fullscreen');

      this.classList.toggle('exit');
      
      // Focus on editor
      if (editorWrapper.classList.contains('fullscreen')) {
        codeEditor.focus();
      }
    });
    
    // Add ESC key handler for fullscreen
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && editorWrapper.classList.contains('fullscreen')) {
        editorWrapper.classList.remove('fullscreen');
        fullscreenBtn.classList.remove('exit');
      }
    });
  }

  // Auto-save code
  function autoSaveCode() {
    if (!isAuthenticated || !isEdited) return;
    
    const user = auth.currentUser;
    const code = codeEditor.value;
    const language = languageSelect.value;
    
    if (autoSaveStatus) {
      autoSaveStatus.textContent = 'Saving...';
    }
    
    // new code added
    const autoSaveRef = doc(dbFirestore, 'auto-saves', user.uid);
    setDoc(autoSaveRef, {
      code: code,
      language: language,
      lastUpdated: serverTimestamp()
    })
    .then(function() {
      isEdited = false;

      if (autoSaveStatus) {
        autoSaveStatus.textContent = 'Saved';
        setTimeout(function() {
          autoSaveStatus.textContent = '';
        }, 3000);
      }
    })
    .catch(function(error) {
      console.error('Error auto-saving code:', error);

      if (autoSaveStatus) {
        autoSaveStatus.textContent = 'Error saving';
        setTimeout(function() {
          autoSaveStatus.textContent = '';
        }, 3000);
      }
    });



    // Reference to user's auto-save document
    // const autoSaveRef = dbFirestore.collection('auto-saves').doc(user.uid);
    
    // Save code
    // autoSaveRef.set({
    //   code: code,
    //   language: language,
    //   lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    // })
    // .then(function() {
    //   isEdited = false;
      
    //   if (autoSaveStatus) {
    //     autoSaveStatus.textContent = 'Saved';
        
    //     // Clear "Saved" message after 3 seconds
    //     setTimeout(function() {
    //       autoSaveStatus.textContent = '';
    //     }, 3000);
    //   }
    // })
    // .catch(function(error) {
    //   console.error('Error auto-saving code:', error);
      
    //   if (autoSaveStatus) {
    //     autoSaveStatus.textContent = 'Error saving';
        
    //     // Clear error message after 3 seconds
    //     setTimeout(function() {
    //       autoSaveStatus.textContent = '';
    //     }, 3000);
    //   }
    // });
  }

  // Save code as snippet
  function saveCode(title) {
    if (!isAuthenticated) return;
    
    const user = auth.currentUser;
    const code = codeEditor.value;
    const language = languageSelect.value;
    
    if (saveStatus) {
      saveStatus.textContent = 'Saving...';
      saveStatus.className = 'save-status saving';
    }
    
    // If we have a current snippet ID, update it
    if (currentSnippetId) {
      dbFirestore.collection('snippets').doc(currentSnippetId).update({
        title: title || 'Untitled Snippet',
        code: code,
        language: language,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(function() {
        if (editorTitle) editorTitle.textContent = title || 'Untitled Snippet';
        if (saveStatus) {
          saveStatus.textContent = 'Saved!';
          saveStatus.className = 'save-status saved';
          
          // Clear "Saved" message after 3 seconds
          setTimeout(function() {
            saveStatus.textContent = '';
            saveStatus.className = 'save-status';
          }, 3000);
        }
      })
      .catch(function(error) {
        console.error('Error updating snippet:', error);
        
        if (saveStatus) {
          saveStatus.textContent = 'Error saving';
          saveStatus.className = 'save-status';
        }
      });
    } else {
      // Create new snippet
      dbFirestore.collection('snippets').add({
        userId: user.uid,
        title: title || 'Untitled Snippet',
        code: code,
        language: language,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      })
      .then(function(docRef) {
        currentSnippetId = docRef.id;
        if (editorTitle) editorTitle.textContent = title || 'Untitled Snippet';
        
        // Update URL without refreshing
        const url = new URL(window.location.href);
        url.searchParams.set('snippet', currentSnippetId);
        window.history.pushState({}, '', url);
        
        if (saveStatus) {
          saveStatus.textContent = 'Saved!';
          saveStatus.className = 'save-status saved';
          
          // Clear "Saved" message after 3 seconds
          setTimeout(function() {
            saveStatus.textContent = '';
            saveStatus.className = 'save-status';
          }, 3000);
        }
      })
      .catch(function(error) {
        console.error('Error saving snippet:', error);
        
        if (saveStatus) {
          saveStatus.textContent = 'Error saving';
          saveStatus.className = 'save-status';
        }
      });
    }
  }

  // Load saved snippets
  function loadSavedSnippets() {
    if (!isAuthenticated) return;
    
    const user = auth.currentUser;
    
    // Create modal for snippet selection
    const modal = document.createElement('div');
    modal.className = 'modal active';
    
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h2>Saved Snippets</h2>
        <div id="snippets-list" style="max-height: 300px; overflow-y: auto; margin: 20px 0;"></div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener to close button
    modal.querySelector('.close-modal').addEventListener('click', function() {
      modal.remove();
    });
    
    // Load snippets
    const snippetsList = document.getElementById('snippets-list');
    
    // Show loader
    snippetsList.innerHTML = '<div class="loader"></div>';
    
    // Fetch snippets from Firestore
    dbFirestore.collection('snippets')
      .where('userId', '==', user.uid)
      .orderBy('lastUpdated', 'desc')
      .get()
      .then(function(querySnapshot) {
        if (querySnapshot.empty) {
          snippetsList.innerHTML = '<p>No saved snippets found.</p>';
          return;
        }
        
        snippetsList.innerHTML = '';
        
        querySnapshot.forEach(function(doc) {
          const snippet = doc.data();
          const snippetItem = document.createElement('div');
          snippetItem.className = 'snippet-item';
          snippetItem.style.padding = '10px';
          snippetItem.style.borderBottom = '1px solid #e2e8f0';
          snippetItem.style.cursor = 'pointer';
          
          const date = snippet.lastUpdated ? new Date(snippet.lastUpdated.toDate()) : new Date();
          const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          });
          
          snippetItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="margin: 0; font-size: 16px;">${snippet.title || 'Untitled Snippet'}</h4>
                <div style="display: flex; gap: 10px; color: #64748b; font-size: 12px; margin-top: 5px;">
                  <span>${snippet.language || 'javascript'}</span>
                  <span>Last updated: ${formattedDate}</span>
                </div>
              </div>
              <div>
                <button class="snippet-action" data-action="load" data-id="${doc.id}">Load</button>
              </div>
            </div>
          `;
          
          snippetsList.appendChild(snippetItem);
          
          // Add event listener to load button
          snippetItem.querySelector('[data-action="load"]').addEventListener('click', function() {
            const snippetId = this.getAttribute('data-id');
            loadSnippet(snippetId);
            currentSnippetId = snippetId;
            
            // Update URL without refreshing
            const url = new URL(window.location.href);
            url.searchParams.set('snippet', snippetId);
            window.history.pushState({}, '', url);
            
            modal.remove();
          });
        });
      })
      .catch(function(error) {
        console.error('Error getting snippets:', error);
        snippetsList.innerHTML = '<p>Error loading snippets. Please try again later.</p>';
      });
  }

  // Load snippet
  function loadSnippet(snippetId) {
    // Show loader
    const editorLoader = document.getElementById('editorLoader');
    if (editorLoader) {
      editorLoader.classList.add('active');
    }
    
    // Fetch snippet data from Firestore
    dbFirestore.collection('snippets').doc(snippetId).get()
      .then(function(doc) {
        if (doc.exists) {
          const snippet = doc.data();
          
          // Check if user is allowed to view this snippet
          const user = auth.currentUser;
          if (snippet.userId && user && snippet.userId !== user.uid) {
            alert('You do not have permission to view this snippet.');
            window.location.href = 'index.html';
            return;
          }
          
          // Update editor
          codeEditor.value = snippet.code || '';
          languageSelect.value = snippet.language || 'javascript';
          if (editorTitle) editorTitle.textContent = snippet.title || 'Untitled Snippet';
        } else {
          console.error('No snippet found with ID:', snippetId);
          alert('Snippet not found.');
          window.location.href = 'index.html';
        }
        
        // Hide loader
        if (editorLoader) {
          editorLoader.classList.remove('active');
        }
      })
      .catch(function(error) {
        console.error('Error getting snippet:', error);
        
        // Hide loader
        if (editorLoader) {
          editorLoader.classList.remove('active');
        }
      });
  }

  // Check authentication status
  auth.onAuthStateChanged(function(user) {
    isAuthenticated = !!user;
    
    // Show/hide auth-required elements
    const authRequired = document.querySelectorAll('.auth-required');
    authRequired.forEach(function(element) {
      if (isAuthenticated) {
        element.classList.remove('hidden');
      } else {
        element.classList.add('hidden');
      }
    });
    
    // If user is authenticated and there's no snippet ID, auto-save code
    if (isAuthenticated && !currentSnippetId) {
      autoSaveCode();
    }
    
    // Hide loader
    const editorLoader = document.getElementById('editorLoader');
    if (editorLoader) {
      editorLoader.classList.remove('active');
    }
  });

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