import { firebaseConfig } from "/src/scripts/init.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class CodingDiary {
  constructor() {
    this.entries = [];
    this.filteredEntries = [];
    this.currentEntry = null;
    this.currentTags = [];
    this.autoSaveTimer = null;
    this.currentPage = 1;
    this.entriesPerPage = 12;
    this.viewMode = 'grid';
    
    this.initializeElements();
    this.bindEvents();
    this.loadEntries();
    this.loadStatistics();
    this.loadQuickNotes();
    this.generateTagsCloud();
  }

  initializeElements() {
    // Control elements
    this.newEntryBtn = document.getElementById('newEntryBtn');
    this.searchInput = document.getElementById('searchInput');
    this.tagFilter = document.getElementById('tagFilter');
    
    // Stats elements
    this.totalEntriesEl = document.getElementById('totalEntries');
    this.currentStreakEl = document.getElementById('currentStreak');
    this.totalTagsEl = document.getElementById('totalTags');
    this.reviewCountEl = document.getElementById('reviewCount');
    
    // Editor elements
    this.entryEditor = document.getElementById('entryEditor');
    this.editorTitle = document.getElementById('editorTitle');
    this.entryTitle = document.getElementById('entryTitle');
    this.entryTags = document.getElementById('entryTags');
    this.tagsDisplay = document.getElementById('tagsDisplay');
    this.flagForReview = document.getElementById('flagForReview');
    this.richTextEditor = document.getElementById('richTextEditor');
    this.saveEntryBtn = document.getElementById('saveEntry');
    this.cancelEntryBtn = document.getElementById('cancelEntry');
    
    // Entries elements
    this.entriesContainer = document.getElementById('entriesContainer');
    this.loadMoreBtn = document.getElementById('loadMoreEntries');
    
    // Quick notes elements
    this.quickNotesArea = document.getElementById('quickNotesArea');
    this.saveQuickNoteBtn = document.getElementById('saveQuickNote');
    this.clearQuickNotesBtn = document.getElementById('clearQuickNotes');
    
    // Tags cloud
    this.tagsCloud = document.getElementById('tagsCloud');
    
    // Modal elements
    this.entryModal = document.getElementById('entryModal');
    this.modalEntryTitle = document.getElementById('modalEntryTitle');
    this.modalEntryDate = document.getElementById('modalEntryDate');
    this.modalEntryTags = document.getElementById('modalEntryTags');
    this.modalEntryContent = document.getElementById('modalEntryContent');
    this.modalReviewFlag = document.getElementById('modalReviewFlag');
  }

  bindEvents() {
    // Control events
    this.newEntryBtn.addEventListener('click', () => this.showNewEntryEditor());
    this.searchInput.addEventListener('input', () => this.filterEntries());
    this.tagFilter.addEventListener('change', () => this.filterEntries());
    
    // Editor events
    this.saveEntryBtn.addEventListener('click', () => this.saveEntry());
    this.cancelEntryBtn.addEventListener('click', () => this.hideEditor());
    this.entryTags.addEventListener('keypress', (e) => this.handleTagInput(e));
    this.richTextEditor.addEventListener('input', () => this.scheduleAutoSave());
    
    // Toolbar events
    document.querySelectorAll('.toolbar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleToolbarAction(e));
    });
    
    document.getElementById('insertCodeBlock').addEventListener('click', () => this.insertCodeBlock());
    document.getElementById('insertLink').addEventListener('click', () => this.insertLink());
    
    // View controls
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.changeView(e.target.dataset.view));
    });
    
    // Load more
    this.loadMoreBtn.addEventListener('click', () => this.loadMoreEntries());
    
    // Quick notes
    this.saveQuickNoteBtn.addEventListener('click', () => this.saveQuickNoteAsEntry());
    this.clearQuickNotesBtn.addEventListener('click', () => this.clearQuickNotes());
    this.quickNotesArea.addEventListener('input', () => this.saveQuickNotes());
    
    // Modal events
    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    document.getElementById('editEntry').addEventListener('click', () => this.editCurrentEntry());
    document.getElementById('deleteEntry').addEventListener('click', () => this.deleteCurrentEntry());
    
    // Close modal on outside click
    this.entryModal.addEventListener('click', (e) => {
      if (e.target === this.entryModal) this.closeModal();
    });
    
    // Auto-save quick notes
    setInterval(() => this.saveQuickNotes(), 30000); // Save every 30 seconds
  }

  showNewEntryEditor() {
    this.currentEntry = null;
    this.currentTags = [];
    this.editorTitle.textContent = 'New Entry';
    this.entryTitle.value = '';
    this.entryTags.value = '';
    this.tagsDisplay.innerHTML = '';
    this.flagForReview.checked = false;
    this.richTextEditor.innerHTML = '';
    this.entryEditor.style.display = 'block';
    this.entryTitle.focus();
    
    // Scroll to editor
    this.entryEditor.scrollIntoView({ behavior: 'smooth' });
  }

  hideEditor() {
    this.entryEditor.style.display = 'none';
    this.currentEntry = null;
    this.currentTags = [];
    
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  handleTagInput(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const tag = this.entryTags.value.trim().toLowerCase();
      
      if (tag && !this.currentTags.includes(tag)) {
        this.currentTags.push(tag);
        this.updateTagsDisplay();
        this.entryTags.value = '';
      }
    }
  }

  updateTagsDisplay() {
    let html = '';
    this.currentTags.forEach(tag => {
      html += `
        <span class="tag-item">
          ${tag}
          <span class="tag-remove" onclick="codingDiary.removeTag('${tag}')">&times;</span>
        </span>
      `;
    });
    this.tagsDisplay.innerHTML = html;
  }

  removeTag(tag) {
    this.currentTags = this.currentTags.filter(t => t !== tag);
    this.updateTagsDisplay();
  }

  handleToolbarAction(e) {
    e.preventDefault();
    const action = e.currentTarget.dataset.action;
    
    if (action) {
      document.execCommand(action, false, null);
      this.richTextEditor.focus();
    }
  }

  insertCodeBlock() {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    
    const codeBlock = document.createElement('pre');
    codeBlock.innerHTML = '<code>// Your code here</code>';
    
    range.deleteContents();
    range.insertNode(codeBlock);
    
    // Move cursor after the code block
    range.setStartAfter(codeBlock);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    
    this.richTextEditor.focus();
  }

  insertLink() {
    const url = prompt('Enter URL:');
    if (url) {
      const text = prompt('Enter link text:', url);
      if (text) {
        document.execCommand('createLink', false, url);
        this.richTextEditor.focus();
      }
    }
  }

  scheduleAutoSave() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setTimeout(() => {
      this.showAutoSaveIndicator();
    }, 2000);
  }

  showAutoSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'auto-save-indicator show';
    indicator.textContent = 'Auto-saved';
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      indicator.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(indicator);
      }, 300);
    }, 2000);
  }

  async saveEntry() {
    const title = this.entryTitle.value.trim();
    const content = this.richTextEditor.innerHTML;
    
    if (!title) {
      alert('Please enter a title for your entry');
      return;
    }
    
    if (!content || content === '<br>') {
      alert('Please enter some content for your entry');
      return;
    }
    
    const user = firebase.auth().currentUser;
    if (!user) {
      alert('Please sign in to save entries');
      return;
    }
    
    try {
      const entryData = {
        userId: user.uid,
        title: title,
        content: content,
        tags: this.currentTags,
        flaggedForReview: this.flagForReview.checked,
        createdAt: this.currentEntry ? this.currentEntry.createdAt : firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      
      if (this.currentEntry) {
        // Update existing entry
        await db.collection('diary_entries').doc(this.currentEntry.id).update(entryData);
        alert('Entry updated successfully!');
      } else {
        // Create new entry
        await db.collection('diary_entries').add(entryData);
        alert('Entry saved successfully!');
      }
      
      this.hideEditor();
      this.loadEntries();
      this.loadStatistics();
      this.generateTagsCloud();
      
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  }

  async loadEntries() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
      const snapshot = await db.collection('diary_entries')
        .where('userId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .get();
      
      this.entries = [];
      snapshot.forEach(doc => {
        this.entries.push({ id: doc.id, ...doc.data() });
      });
      
      this.filteredEntries = [...this.entries];
      this.currentPage = 1;
      this.renderEntries();
      
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  }

  filterEntries() {
    const searchTerm = this.searchInput.value.toLowerCase();
    const selectedTag = this.tagFilter.value;
    
    this.filteredEntries = this.entries.filter(entry => {
      const matchesSearch = !searchTerm || 
        entry.title.toLowerCase().includes(searchTerm) ||
        entry.content.toLowerCase().includes(searchTerm);
      
      const matchesTag = selectedTag === 'all' || 
        entry.tags.includes(selectedTag);
      
      return matchesSearch && matchesTag;
    });
    
    this.currentPage = 1;
    this.renderEntries();
  }

  renderEntries() {
    const startIndex = 0;
    const endIndex = this.currentPage * this.entriesPerPage;
    const entriesToShow = this.filteredEntries.slice(startIndex, endIndex);
    
    if (entriesToShow.length === 0) {
      this.entriesContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--gray);">
          <span class="material-symbols-outlined" style="font-size: 3rem; opacity: 0.5;">article</span>
          <p>No entries found. Start writing your first entry!</p>
        </div>
      `;
      this.loadMoreBtn.style.display = 'none';
      return;
    }
    
    this.entriesContainer.className = `entries-container entries-${this.viewMode}`;
    
    let html = '';
    entriesToShow.forEach(entry => {
      const date = entry.createdAt ? entry.createdAt.toDate().toLocaleDateString() : 'Unknown date';
      const preview = this.stripHtml(entry.content).substring(0, 150) + '...';
      
      html += `
        <div class="entry-card ${entry.flaggedForReview ? 'flagged' : ''}" data-entry-id="${entry.id}">
          ${entry.flaggedForReview ? '<div class="review-flag"><span class="material-symbols-outlined">flag</span>Review</div>' : ''}
          
          <div class="entry-header">
            <h3 class="entry-title">${entry.title}</h3>
            <div class="entry-date">${date}</div>
          </div>
          
          <div class="entry-preview">${preview}</div>
          
          <div class="entry-footer">
            <div class="entry-tags">
              ${entry.tags.map(tag => `<span class="entry-tag">${tag}</span>`).join('')}
            </div>
            
            <div class="entry-actions">
              <button class="entry-action-btn" onclick="codingDiary.editEntry('${entry.id}')" title="Edit">
                <span class="material-symbols-outlined">edit</span>
              </button>
              <button class="entry-action-btn" onclick="codingDiary.deleteEntry('${entry.id}')" title="Delete">
                <span class="material-symbols-outlined">delete</span>
              </button>
            </div>
          </div>
        </div>
      `;
    });
    
    this.entriesContainer.innerHTML = html;
    
    // Add click handlers for entry cards
    this.entriesContainer.querySelectorAll('.entry-card').forEach(card => {
      card.addEventListener('click', (e) => {
        // Don't open modal if clicking on action buttons
        if (!e.target.closest('.entry-actions')) {
          const entryId = card.dataset.entryId;
          this.showEntryModal(entryId);
        }
      });
    });
    
    // Show/hide load more button
    const hasMore = endIndex < this.filteredEntries.length;
    this.loadMoreBtn.style.display = hasMore ? 'block' : 'none';
  }

  loadMoreEntries() {
    this.currentPage++;
    this.renderEntries();
  }

  changeView(view) {
    this.viewMode = view;
    
    // Update active button
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    this.renderEntries();
  }

  showEntryModal(entryId) {
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry) return;
    
    this.currentEntry = entry;
    
    // Populate modal content
    this.modalEntryTitle.textContent = entry.title;
    this.modalEntryDate.textContent = entry.createdAt ? entry.createdAt.toDate().toLocaleDateString() : 'Unknown date';
    this.modalEntryContent.innerHTML = entry.content;
    
    // Display tags
    let tagsHtml = '';
    entry.tags.forEach(tag => {
      tagsHtml += `<span class="tag-item">${tag}</span>`;
    });
    this.modalEntryTags.innerHTML = tagsHtml;
    
    // Show/hide review flag
    this.modalReviewFlag.style.display = entry.flaggedForReview ? 'block' : 'none';
    
    this.entryModal.classList.add('active');
  }

  closeModal() {
    this.entryModal.classList.remove('active');
    this.currentEntry = null;
  }

  editEntry(entryId) {
    const entry = this.entries.find(e => e.id === entryId);
    if (!entry) return;
    
    this.currentEntry = entry;
    this.currentTags = [...entry.tags];
    this.editorTitle.textContent = 'Edit Entry';
    this.entryTitle.value = entry.title;
    this.entryTags.value = '';
    this.updateTagsDisplay();
    this.flagForReview.checked = entry.flaggedForReview;
    this.richTextEditor.innerHTML = entry.content;
    this.entryEditor.style.display = 'block';
    
    // Scroll to editor
    this.entryEditor.scrollIntoView({ behavior: 'smooth' });
  }

  editCurrentEntry() {
    if (this.currentEntry) {
      this.closeModal();
      this.editEntry(this.currentEntry.id);
    }
  }

  async deleteEntry(entryId) {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }
    
    try {
      await db.collection('diary_entries').doc(entryId).delete();
      alert('Entry deleted successfully!');
      this.loadEntries();
      this.loadStatistics();
      this.generateTagsCloud();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry. Please try again.');
    }
  }

  async deleteCurrentEntry() {
    if (this.currentEntry) {
      this.closeModal();
      await this.deleteEntry(this.currentEntry.id);
    }
  }

  async loadStatistics() {
    const user = firebase.auth().currentUser;
    if (!user) {
      this.totalEntriesEl.textContent = '0';
      this.currentStreakEl.textContent = '0';
      this.totalTagsEl.textContent = '0';
      this.reviewCountEl.textContent = '0';
      return;
    }
    
    try {
      const snapshot = await db.collection('diary_entries')
        .where('userId', '==', user.uid)
        .get();
      
      const entries = [];
      snapshot.forEach(doc => {
        entries.push(doc.data());
      });
      
      // Calculate statistics
      const totalEntries = entries.length;
      const reviewCount = entries.filter(e => e.flaggedForReview).length;
      const allTags = new Set();
      entries.forEach(entry => {
        entry.tags.forEach(tag => allTags.add(tag));
      });
      const totalTags = allTags.size;
      const currentStreak = this.calculateStreak(entries);
      
      // Update UI
      this.totalEntriesEl.textContent = totalEntries;
      this.currentStreakEl.textContent = currentStreak;
      this.totalTagsEl.textContent = totalTags;
      this.reviewCountEl.textContent = reviewCount;
      
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }

  calculateStreak(entries) {
    if (entries.length === 0) return 0;
    
    // Sort entries by creation date
    const sortedEntries = entries
      .filter(e => e.createdAt)
      .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
    
    if (sortedEntries.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check if there's an entry today or yesterday
    const latestEntry = sortedEntries[0];
    const latestDate = new Date(latestEntry.createdAt.toDate());
    latestDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today - latestDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) return 0; // Streak broken
    
    // Count consecutive days
    const entryDates = new Set();
    sortedEntries.forEach(entry => {
      const date = new Date(entry.createdAt.toDate());
      date.setHours(0, 0, 0, 0);
      entryDates.add(date.getTime());
    });
    
    let currentDate = new Date(today);
    if (daysDiff === 1) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    while (entryDates.has(currentDate.getTime())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
  }

  async generateTagsCloud() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
      const snapshot = await db.collection('diary_entries')
        .where('userId', '==', user.uid)
        .get();
      
      const tagCounts = {};
      snapshot.forEach(doc => {
        const entry = doc.data();
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      // Update tag filter options
      this.updateTagFilter(Object.keys(tagCounts));
      
      // Generate tags cloud
      const sortedTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20); // Show top 20 tags
      
      if (sortedTags.length === 0) {
        this.tagsCloud.innerHTML = `
          <div style="text-align: center; color: var(--gray); font-style: italic;">
            No tags yet. Start adding tags to your entries!
          </div>
        `;
        return;
      }
      
      const maxCount = Math.max(...sortedTags.map(([, count]) => count));
      
      let html = '';
      sortedTags.forEach(([tag, count]) => {
        const size = Math.min(5, Math.max(1, Math.ceil((count / maxCount) * 5)));
        html += `
          <div class="cloud-tag size-${size}" onclick="codingDiary.filterByTag('${tag}')">
            ${tag}
            <span class="tag-count">${count}</span>
          </div>
        `;
      });
      
      this.tagsCloud.innerHTML = html;
      
    } catch (error) {
      console.error('Error generating tags cloud:', error);
    }
  }

  updateTagFilter(tags) {
    const currentValue = this.tagFilter.value;
    
    // Clear existing options except "All Tags"
    this.tagFilter.innerHTML = '<option value="all">All Tags</option>';
    
    // Add tag options
    tags.sort().forEach(tag => {
      const option = document.createElement('option');
      option.value = tag;
      option.textContent = tag;
      this.tagFilter.appendChild(option);
    });
    
    // Restore previous selection if it still exists
    if (tags.includes(currentValue)) {
      this.tagFilter.value = currentValue;
    }
  }

  filterByTag(tag) {
    this.tagFilter.value = tag;
    this.filterEntries();
  }

  async saveQuickNoteAsEntry() {
    const content = this.quickNotesArea.value.trim();
    
    if (!content) {
      alert('Please enter some content in quick notes first');
      return;
    }
    
    // Pre-fill the editor with quick notes content
    this.showNewEntryEditor();
    this.entryTitle.value = 'Quick Note - ' + new Date().toLocaleDateString();
    this.richTextEditor.innerHTML = content.replace(/\n/g, '<br>');
    
    // Clear quick notes
    this.quickNotesArea.value = '';
    this.saveQuickNotes();
  }

  async saveQuickNotes() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    const content = this.quickNotesArea.value;
    
    try {
      await db.collection('quick_notes').doc(user.uid).set({
        content: content,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving quick notes:', error);
    }
  }

  async loadQuickNotes() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
      const doc = await db.collection('quick_notes').doc(user.uid).get();
      if (doc.exists) {
        this.quickNotesArea.value = doc.data().content || '';
      }
    } catch (error) {
      console.error('Error loading quick notes:', error);
    }
  }

  clearQuickNotes() {
    if (confirm('Are you sure you want to clear all quick notes?')) {
      this.quickNotesArea.value = '';
      this.saveQuickNotes();
    }
  }

  stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }
}

// Initialize the coding diary when the page loads
let codingDiary;
document.addEventListener('DOMContentLoaded', () => {
  codingDiary = new CodingDiary();
});

// Make it globally accessible for onclick handlers
window.codingDiary = codingDiary;