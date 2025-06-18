import { firebaseConfig } from "/src/scripts/init.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class RealWorldChallenges {
  constructor() {
    this.challenges = [];
    this.filteredChallenges = [];
    this.userProgress = {};
    this.currentPage = 1;
    this.challengesPerPage = 9;
    this.currentChallenge = null;
    
    this.initializeElements();
    this.bindEvents();
    this.loadChallenges();
    this.loadUserProgress();
    this.loadLeaderboard();
  }

  initializeElements() {
    this.difficultyFilter = document.getElementById('difficultyFilter');
    this.categoryFilter = document.getElementById('categoryFilter');
    this.languageFilter = document.getElementById('languageFilter');
    this.clearFiltersBtn = document.getElementById('clearFilters');
    this.challengesGrid = document.getElementById('challengesGrid');
    this.loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Stats elements
    this.solvedChallengesEl = document.getElementById('solvedChallenges');
    this.totalPointsEl = document.getElementById('totalPoints');
    this.currentRankEl = document.getElementById('currentRank');
    this.currentStreakEl = document.getElementById('currentStreak');
    
    // Modal elements
    this.challengeModal = document.getElementById('challengeModal');
    this.solutionModal = document.getElementById('solutionModal');
    this.challengeTitle = document.getElementById('challengeTitle');
    this.challengeDifficulty = document.getElementById('challengeDifficulty');
    this.challengeCategory = document.getElementById('challengeCategory');
    this.challengePoints = document.getElementById('challengePoints');
    this.challengeDescription = document.getElementById('challengeDescription');
    this.challengeRequirements = document.getElementById('challengeRequirements');
    this.challengeExamples = document.getElementById('challengeExamples');
    this.challengeHints = document.getElementById('challengeHints');
    this.solutionContent = document.getElementById('solutionContent');
    
    // Leaderboard
    this.leaderboardContent = document.getElementById('leaderboardContent');
  }

  bindEvents() {
    // Filter events
    this.difficultyFilter.addEventListener('change', () => this.applyFilters());
    this.categoryFilter.addEventListener('change', () => this.applyFilters());
    this.languageFilter.addEventListener('change', () => this.applyFilters());
    this.clearFiltersBtn.addEventListener('click', () => this.clearFilters());
    
    // Load more
    this.loadMoreBtn.addEventListener('click', () => this.loadMoreChallenges());
    
    // Modal events
    document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
    document.getElementById('closeSolutionModal').addEventListener('click', () => this.closeSolutionModal());
    document.getElementById('startChallenge').addEventListener('click', () => this.startChallenge());
    document.getElementById('viewSolution').addEventListener('click', () => this.viewSolution());
    document.getElementById('submitSolution').addEventListener('click', () => this.submitSolution());
    
    // Leaderboard filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.loadLeaderboard(e.target.dataset.period);
      });
    });
    
    // Close modals on outside click
    this.challengeModal.addEventListener('click', (e) => {
      if (e.target === this.challengeModal) this.closeModal();
    });
    
    this.solutionModal.addEventListener('click', (e) => {
      if (e.target === this.solutionModal) this.closeSolutionModal();
    });
  }

  loadChallenges() {
    // Sample challenges data
    this.challenges = [
      {
        id: 'user-auth-system',
        title: 'User Authentication System',
        summary: 'Build a secure user authentication system with login, registration, and password reset functionality.',
        description: 'Create a complete user authentication system that handles user registration, login, logout, and password reset. The system should include proper validation, security measures, and user session management.',
        difficulty: 'intermediate',
        category: 'web-development',
        language: 'javascript',
        points: 75,
        estimatedTime: '3-4 hours',
        requirements: [
          'User registration with email validation',
          'Secure password hashing',
          'Login/logout functionality',
          'Password reset via email',
          'Session management',
          'Input validation and sanitization'
        ],
        examples: [
          {
            title: 'Registration Example',
            code: `// User registration endpoint
app.post('/register', async (req, res) => {
  const { email, password, confirmPassword } = req.body;
  // Implementation here
});`
          },
          {
            title: 'Login Example',
            code: `// User login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // Implementation here
});`
          }
        ],
        hints: [
          'Use bcrypt for password hashing',
          'Implement JWT for session management',
          'Add rate limiting for security',
          'Use email validation libraries'
        ],
        solution: {
          approach: 'This challenge requires implementing a secure authentication system using industry best practices.',
          code: `// Complete authentication system implementation
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// User registration
app.post('/register', async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    
    // Validation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});`
        },
        tags: ['authentication', 'security', 'backend', 'nodejs'],
        difficulty_level: 2,
        popularity: 95
      },
      {
        id: 'data-visualization-dashboard',
        title: 'Interactive Data Visualization Dashboard',
        summary: 'Create a responsive dashboard with charts, filters, and real-time data updates.',
        description: 'Build an interactive dashboard that displays data through various chart types, includes filtering capabilities, and updates in real-time. The dashboard should be responsive and user-friendly.',
        difficulty: 'advanced',
        category: 'web-development',
        language: 'javascript',
        points: 100,
        estimatedTime: '5-6 hours',
        requirements: [
          'Multiple chart types (bar, line, pie)',
          'Interactive filtering system',
          'Real-time data updates',
          'Responsive design',
          'Export functionality',
          'Data aggregation features'
        ],
        examples: [
          {
            title: 'Chart Component',
            code: `// Chart component example
const ChartComponent = ({ data, type }) => {
  useEffect(() => {
    // Chart rendering logic
  }, [data, type]);
  
  return <div id="chart-container"></div>;
};`
          }
        ],
        hints: [
          'Use Chart.js or D3.js for visualizations',
          'Implement WebSocket for real-time updates',
          'Use CSS Grid for responsive layout',
          'Add loading states for better UX'
        ],
        solution: {
          approach: 'This challenge involves creating a comprehensive dashboard with multiple visualization components.',
          code: `// Dashboard implementation with Chart.js
import Chart from 'chart.js/auto';

class Dashboard {
  constructor() {
    this.charts = {};
    this.data = {};
    this.filters = {};
    this.init();
  }
  
  init() {
    this.setupWebSocket();
    this.createCharts();
    this.setupFilters();
  }
  
  setupWebSocket() {
    this.ws = new WebSocket('ws://localhost:8080');
    this.ws.onmessage = (event) => {
      const newData = JSON.parse(event.data);
      this.updateCharts(newData);
    };
  }
}`
        },
        tags: ['dashboard', 'charts', 'real-time', 'frontend'],
        difficulty_level: 3,
        popularity: 88
      },
      {
        id: 'api-rate-limiter',
        title: 'API Rate Limiter Implementation',
        summary: 'Implement a robust rate limiting system for API endpoints with different strategies.',
        description: 'Create a rate limiting middleware that can handle different rate limiting strategies like token bucket, sliding window, and fixed window. Include features for different user tiers and bypass mechanisms.',
        difficulty: 'advanced',
        category: 'api-integration',
        language: 'javascript',
        points: 90,
        estimatedTime: '4-5 hours',
        requirements: [
          'Multiple rate limiting algorithms',
          'User tier-based limits',
          'Redis integration for distributed systems',
          'Bypass mechanisms for admin users',
          'Detailed logging and monitoring',
          'Graceful error handling'
        ],
        examples: [
          {
            title: 'Rate Limiter Middleware',
            code: `// Rate limiter middleware
const rateLimiter = (options) => {
  return async (req, res, next) => {
    // Rate limiting logic
  };
};`
          }
        ],
        hints: [
          'Use Redis for storing rate limit data',
          'Implement sliding window algorithm',
          'Add proper error responses',
          'Consider distributed system scenarios'
        ],
        solution: {
          approach: 'Implement a flexible rate limiter with multiple algorithms and Redis backend.',
          code: `// Advanced rate limiter implementation
class RateLimiter {
  constructor(options) {
    this.redis = new Redis(options.redis);
    this.algorithm = options.algorithm || 'sliding-window';
    this.limits = options.limits;
  }
  
  async isAllowed(key, limit, window) {
    switch (this.algorithm) {
      case 'sliding-window':
        return this.slidingWindow(key, limit, window);
      case 'token-bucket':
        return this.tokenBucket(key, limit, window);
      default:
        return this.fixedWindow(key, limit, window);
    }
  }
}`
        },
        tags: ['rate-limiting', 'api', 'redis', 'middleware'],
        difficulty_level: 3,
        popularity: 76
      },
      {
        id: 'file-upload-system',
        title: 'Secure File Upload System',
        summary: 'Build a secure file upload system with validation, virus scanning, and cloud storage.',
        description: 'Create a comprehensive file upload system that handles multiple file types, validates uploads, scans for malware, and stores files securely in cloud storage with proper access controls.',
        difficulty: 'intermediate',
        category: 'web-development',
        language: 'javascript',
        points: 80,
        estimatedTime: '3-4 hours',
        requirements: [
          'File type validation',
          'File size limits',
          'Virus/malware scanning',
          'Cloud storage integration',
          'Progress tracking',
          'Access control and permissions'
        ],
        examples: [
          {
            title: 'Upload Handler',
            code: `// File upload handler
app.post('/upload', upload.single('file'), async (req, res) => {
  // File processing logic
});`
          }
        ],
        hints: [
          'Use multer for file handling',
          'Implement file type checking',
          'Add progress tracking with WebSocket',
          'Use AWS S3 or similar for storage'
        ],
        solution: {
          approach: 'Implement a secure file upload system with comprehensive validation and cloud storage.',
          code: `// Secure file upload implementation
const multer = require('multer');
const AWS = require('aws-sdk');
const ClamAV = require('clamscan');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // File validation logic
  }
});`
        },
        tags: ['file-upload', 'security', 'cloud-storage', 'validation'],
        difficulty_level: 2,
        popularity: 82
      },
      {
        id: 'search-algorithm-optimization',
        title: 'Search Algorithm Optimization',
        summary: 'Optimize search algorithms for large datasets with indexing and caching strategies.',
        description: 'Implement and optimize various search algorithms for handling large datasets. Include features like fuzzy search, auto-complete, search result ranking, and caching mechanisms.',
        difficulty: 'advanced',
        category: 'algorithms',
        language: 'python',
        points: 95,
        estimatedTime: '4-6 hours',
        requirements: [
          'Multiple search algorithms implementation',
          'Fuzzy search capabilities',
          'Auto-complete functionality',
          'Search result ranking',
          'Caching and indexing',
          'Performance optimization'
        ],
        examples: [
          {
            title: 'Search Engine Class',
            code: `# Search engine implementation
class SearchEngine:
    def __init__(self):
        self.index = {}
        self.cache = {}
    
    def search(self, query):
        # Search implementation
        pass`
          }
        ],
        hints: [
          'Use inverted index for fast lookups',
          'Implement Levenshtein distance for fuzzy search',
          'Add LRU cache for frequent queries',
          'Consider using Elasticsearch for production'
        ],
        solution: {
          approach: 'Build a comprehensive search engine with multiple algorithms and optimization techniques.',
          code: `# Advanced search engine implementation
import re
from collections import defaultdict
from difflib import SequenceMatcher

class AdvancedSearchEngine:
    def __init__(self):
        self.inverted_index = defaultdict(set)
        self.documents = {}
        self.cache = {}
        self.max_cache_size = 1000
    
    def add_document(self, doc_id, content):
        self.documents[doc_id] = content
        words = self.tokenize(content)
        for word in words:
            self.inverted_index[word].add(doc_id)
    
    def search(self, query, fuzzy=False):
        if query in self.cache:
            return self.cache[query]
        
        results = self.perform_search(query, fuzzy)
        self.update_cache(query, results)
        return results`
        },
        tags: ['search', 'algorithms', 'optimization', 'indexing'],
        difficulty_level: 3,
        popularity: 71
      },
      {
        id: 'database-migration-tool',
        title: 'Database Migration Tool',
        summary: 'Create a tool for managing database schema migrations with rollback capabilities.',
        description: 'Build a comprehensive database migration tool that can handle schema changes, data migrations, rollbacks, and maintain migration history across different database systems.',
        difficulty: 'advanced',
        category: 'database',
        language: 'python',
        points: 85,
        estimatedTime: '4-5 hours',
        requirements: [
          'Schema migration support',
          'Data migration capabilities',
          'Rollback functionality',
          'Migration history tracking',
          'Multi-database support',
          'Backup and restore features'
        ],
        examples: [
          {
            title: 'Migration Class',
            code: `# Migration base class
class Migration:
    def up(self):
        # Forward migration
        pass
    
    def down(self):
        # Rollback migration
        pass`
          }
        ],
        hints: [
          'Use database-specific SQL dialects',
          'Implement transaction support',
          'Add validation for migration scripts',
          'Create detailed logging system'
        ],
        solution: {
          approach: 'Implement a flexible migration system that works across different database systems.',
          code: `# Database migration tool implementation
import sqlite3
import psycopg2
from abc import ABC, abstractmethod

class DatabaseAdapter(ABC):
    @abstractmethod
    def execute(self, sql):
        pass
    
    @abstractmethod
    def begin_transaction(self):
        pass

class MigrationManager:
    def __init__(self, db_adapter):
        self.db = db_adapter
        self.migrations = []
        self.setup_migration_table()
    
    def add_migration(self, migration):
        self.migrations.append(migration)
    
    def migrate(self):
        for migration in self.migrations:
            if not self.is_applied(migration):
                self.apply_migration(migration)`
        },
        tags: ['database', 'migration', 'schema', 'sql'],
        difficulty_level: 3,
        popularity: 68
      }
    ];

    this.filteredChallenges = [...this.challenges];
    this.renderChallenges();
    this.updateStats();
  }

  applyFilters() {
    const difficulty = this.difficultyFilter.value;
    const category = this.categoryFilter.value;
    const language = this.languageFilter.value;

    this.filteredChallenges = this.challenges.filter(challenge => {
      const matchesDifficulty = difficulty === 'all' || challenge.difficulty === difficulty;
      const matchesCategory = category === 'all' || challenge.category === category;
      const matchesLanguage = language === 'all' || challenge.language === language;
      
      return matchesDifficulty && matchesCategory && matchesLanguage;
    });

    this.currentPage = 1;
    this.renderChallenges();
  }

  clearFilters() {
    this.difficultyFilter.value = 'all';
    this.categoryFilter.value = 'all';
    this.languageFilter.value = 'all';
    this.filteredChallenges = [...this.challenges];
    this.currentPage = 1;
    this.renderChallenges();
  }

  renderChallenges() {
    const startIndex = 0;
    const endIndex = this.currentPage * this.challengesPerPage;
    const challengesToShow = this.filteredChallenges.slice(startIndex, endIndex);

    let html = '';
    challengesToShow.forEach(challenge => {
      const isSolved = this.isChallengeCompleted(challenge.id);
      const status = this.getChallengeStatus(challenge.id);
      
      html += `
        <div class="challenge-card ${isSolved ? 'solved' : ''}" data-challenge-id="${challenge.id}">
          <div class="challenge-header">
            <div class="challenge-meta">
              <span class="difficulty-badge ${challenge.difficulty}">${challenge.difficulty}</span>
              <span class="category-badge">${challenge.category.replace('-', ' ')}</span>
              <span class="points-badge">${challenge.points} points</span>
            </div>
            <h3 class="challenge-title">${challenge.title}</h3>
            <p class="challenge-summary">${challenge.summary}</p>
          </div>
          
          <div class="challenge-footer">
            <div class="challenge-stats">
              <span>
                <span class="material-symbols-outlined">schedule</span>
                ${challenge.estimatedTime}
              </span>
              <span>
                <span class="material-symbols-outlined">trending_up</span>
                ${challenge.popularity}% liked
              </span>
            </div>
            <div class="challenge-status ${status.toLowerCase().replace(' ', '-')}">${status}</div>
          </div>
          
          <div class="solved-indicator">
            <span class="material-symbols-outlined">check</span>
          </div>
        </div>
      `;
    });

    this.challengesGrid.innerHTML = html;

    // Show/hide load more button
    const hasMore = endIndex < this.filteredChallenges.length;
    this.loadMoreBtn.style.display = hasMore ? 'block' : 'none';

    // Bind click events
    this.bindChallengeEvents();
  }

  bindChallengeEvents() {
    const challengeCards = this.challengesGrid.querySelectorAll('.challenge-card');
    challengeCards.forEach(card => {
      card.addEventListener('click', () => {
        const challengeId = card.dataset.challengeId;
        this.showChallengeDetails(challengeId);
      });
    });
  }

  loadMoreChallenges() {
    this.currentPage++;
    this.renderChallenges();
  }

  showChallengeDetails(challengeId) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    this.currentChallenge = challenge;
    const isSolved = this.isChallengeCompleted(challengeId);

    // Populate modal content
    this.challengeTitle.textContent = challenge.title;
    this.challengeDifficulty.textContent = challenge.difficulty;
    this.challengeDifficulty.className = `difficulty-badge ${challenge.difficulty}`;
    this.challengeCategory.textContent = challenge.category.replace('-', ' ');
    this.challengePoints.textContent = `${challenge.points} points`;
    this.challengeDescription.textContent = challenge.description;

    // Requirements
    let requirementsHtml = '';
    challenge.requirements.forEach(req => {
      requirementsHtml += `<li>${req}</li>`;
    });
    this.challengeRequirements.innerHTML = requirementsHtml;

    // Examples
    let examplesHtml = '';
    challenge.examples.forEach(example => {
      examplesHtml += `
        <div class="example-item">
          <div class="example-title">${example.title}</div>
          <pre><code>${example.code}</code></pre>
        </div>
      `;
    });
    this.challengeExamples.innerHTML = examplesHtml;

    // Hints
    let hintsHtml = '';
    challenge.hints.forEach(hint => {
      hintsHtml += `<div class="hint-item">${hint}</div>`;
    });
    this.challengeHints.querySelector('.hints-container').innerHTML = hintsHtml;

    // Update action buttons
    document.getElementById('startChallenge').style.display = isSolved ? 'none' : 'inline-flex';
    document.getElementById('viewSolution').style.display = isSolved ? 'inline-flex' : 'none';
    document.getElementById('submitSolution').style.display = 'none';

    this.challengeModal.classList.add('active');
  }

  closeModal() {
    this.challengeModal.classList.remove('active');
    this.currentChallenge = null;
  }

  closeSolutionModal() {
    this.solutionModal.classList.remove('active');
  }

  startChallenge() {
    if (!this.currentChallenge) return;
    
    // Open code editor with challenge template
    const editorUrl = `/src/modules/OnlineCompiler/index.html?challenge=${this.currentChallenge.id}`;
    window.open(editorUrl, '_blank');
    
    // Mark as in progress
    this.updateChallengeProgress(this.currentChallenge.id, 'in-progress');
    this.closeModal();
  }

  viewSolution() {
    if (!this.currentChallenge || !this.currentChallenge.solution) return;

    const solution = this.currentChallenge.solution;
    this.solutionContent.innerHTML = `
      <div class="solution-approach">
        <h4>Approach</h4>
        <p>${solution.approach}</p>
      </div>
      
      <div class="solution-code">
        <h4>Implementation</h4>
        <pre><code>${solution.code}</code></pre>
      </div>
      
      <div class="solution-explanation">
        <h4>Key Points</h4>
        <ul>
          <li>Follow security best practices</li>
          <li>Implement proper error handling</li>
          <li>Add comprehensive testing</li>
          <li>Consider scalability and performance</li>
        </ul>
      </div>
    `;

    this.solutionModal.classList.add('active');
  }

  submitSolution() {
    // This would typically validate the solution
    // For now, we'll mark it as completed
    if (this.currentChallenge) {
      this.markChallengeCompleted(this.currentChallenge.id);
      this.closeModal();
    }
  }

  getChallengeStatus(challengeId) {
    const progress = this.userProgress[challengeId];
    if (!progress) return 'Not Started';
    
    if (progress.completed) return 'Solved';
    if (progress.inProgress) return 'In Progress';
    return 'Not Started';
  }

  isChallengeCompleted(challengeId) {
    return this.userProgress[challengeId]?.completed || false;
  }

  updateChallengeProgress(challengeId, status) {
    if (!this.userProgress[challengeId]) {
      this.userProgress[challengeId] = {};
    }
    
    this.userProgress[challengeId].inProgress = status === 'in-progress';
    this.saveUserProgress();
  }

  async markChallengeCompleted(challengeId) {
    const challenge = this.challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    if (!this.userProgress[challengeId]) {
      this.userProgress[challengeId] = {};
    }
    
    this.userProgress[challengeId].completed = true;
    this.userProgress[challengeId].completedAt = new Date();
    this.userProgress[challengeId].points = challenge.points;
    
    await this.saveUserProgress();
    this.updateStats();
    this.renderChallenges();
    
    // Show success message
    alert(`Congratulations! You've earned ${challenge.points} points!`);
  }

  updateStats() {
    const completedChallenges = Object.values(this.userProgress).filter(p => p.completed).length;
    const totalPoints = Object.values(this.userProgress)
      .filter(p => p.completed)
      .reduce((sum, p) => sum + (p.points || 0), 0);
    
    const rank = this.calculateRank(totalPoints);
    const streak = this.calculateStreak();

    this.solvedChallengesEl.textContent = completedChallenges;
    this.totalPointsEl.textContent = totalPoints;
    this.currentRankEl.textContent = rank;
    this.currentStreakEl.textContent = streak;
  }

  calculateRank(points) {
    if (points >= 1000) return 'Expert';
    if (points >= 500) return 'Advanced';
    if (points >= 200) return 'Intermediate';
    if (points >= 50) return 'Beginner';
    return 'Novice';
  }

  calculateStreak() {
    const completedDates = Object.values(this.userProgress)
      .filter(p => p.completed && p.completedAt)
      .map(p => new Date(p.completedAt).toDateString())
      .sort();
    
    if (completedDates.length === 0) return 0;
    
    let streak = 1;
    const today = new Date().toDateString();
    
    // Simple streak calculation
    for (let i = completedDates.length - 1; i > 0; i--) {
      const current = new Date(completedDates[i]);
      const previous = new Date(completedDates[i - 1]);
      const diffDays = (current - previous) / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return Math.min(streak, 30); // Cap at 30 days
  }

  async loadLeaderboard(period = 'weekly') {
    // Simulate leaderboard data
    const leaderboardData = [
      { name: 'Alex Chen', points: 1250, avatar: 'AC', challenges: 15 },
      { name: 'Sarah Johnson', points: 980, avatar: 'SJ', challenges: 12 },
      { name: 'Mike Rodriguez', points: 875, avatar: 'MR', challenges: 11 },
      { name: 'Emily Davis', points: 720, avatar: 'ED', challenges: 9 },
      { name: 'David Kim', points: 650, avatar: 'DK', challenges: 8 },
      { name: 'Lisa Wang', points: 580, avatar: 'LW', challenges: 7 },
      { name: 'John Smith', points: 520, avatar: 'JS', challenges: 6 },
      { name: 'Maria Garcia', points: 480, avatar: 'MG', challenges: 6 },
      { name: 'Tom Wilson', points: 420, avatar: 'TW', challenges: 5 },
      { name: 'Anna Brown', points: 380, avatar: 'AB', challenges: 4 }
    ];

    let html = '';
    leaderboardData.forEach((user, index) => {
      const rank = index + 1;
      const isTopThree = rank <= 3;
      
      html += `
        <div class="leaderboard-item">
          <div class="rank-number ${isTopThree ? 'top-3' : ''}">${rank}</div>
          <div class="user-avatar">${user.avatar}</div>
          <div class="user-info">
            <div class="user-name">${user.name}</div>
            <div class="user-stats">${user.challenges} challenges solved</div>
          </div>
          <div class="user-points">${user.points}</div>
        </div>
      `;
    });

    this.leaderboardContent.innerHTML = html;
  }

  async loadUserProgress() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
      const doc = await db.collection('challenge_progress').doc(user.uid).get();
      if (doc.exists) {
        this.userProgress = doc.data().progress || {};
      }
      
      this.updateStats();
      this.renderChallenges();
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  }

  async saveUserProgress() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
      await db.collection('challenge_progress').doc(user.uid).set({
        progress: this.userProgress,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }
}

// Initialize the challenges system when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new RealWorldChallenges();
});