import { firebaseConfig } from "/src/scripts/init.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class LearningRoadmap {
  constructor() {
    this.currentPath = 'frontend';
    this.userProgress = {};
    this.achievements = [];
    this.studySchedule = {
      duration: 60,
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      reminderTime: '09:00'
    };
    
    this.initializeElements();
    this.bindEvents();
    this.loadLearningPaths();
    this.loadUserProgress();
    this.generateAchievements();
    this.generateCalendar();
  }

  initializeElements() {
    this.pathSelect = document.getElementById('pathSelect');
    this.resetProgressBtn = document.getElementById('resetProgress');
    this.completedTopicsEl = document.getElementById('completedTopics');
    this.totalTopicsEl = document.getElementById('totalTopics');
    this.progressPercentageEl = document.getElementById('progressPercentage');
    this.currentStreakEl = document.getElementById('currentStreak');
    this.progressFill = document.getElementById('progressFill');
    this.progressText = document.getElementById('progressText');
    this.roadmapPath = document.getElementById('roadmapPath');
    this.topicDetailsPanel = document.getElementById('topicDetailsPanel');
    this.topicTitle = document.getElementById('topicTitle');
    this.panelContent = document.getElementById('panelContent');
    this.closePanel = document.getElementById('closePanel');
    this.achievementsGrid = document.getElementById('achievementsGrid');
    this.scheduleCalendar = document.getElementById('scheduleCalendar');
    this.achievementModal = document.getElementById('achievementModal');
    this.scheduleModal = document.getElementById('scheduleModal');
    this.customizeScheduleBtn = document.getElementById('customizeSchedule');
    this.studyDurationSlider = document.getElementById('studyDuration');
    this.durationValue = document.getElementById('durationValue');
  }

  bindEvents() {
    this.pathSelect.addEventListener('change', (e) => {
      this.currentPath = e.target.value;
      this.loadLearningPaths();
      this.updateProgress();
    });

    this.resetProgressBtn.addEventListener('click', () => this.resetProgress());
    this.closePanel.addEventListener('click', () => this.hideTopicDetails());
    this.customizeScheduleBtn.addEventListener('click', () => this.showScheduleModal());

    // Achievement modal
    document.getElementById('closeAchievement').addEventListener('click', () => {
      this.achievementModal.classList.remove('active');
    });

    // Schedule modal
    document.getElementById('closeScheduleModal').addEventListener('click', () => {
      this.scheduleModal.classList.remove('active');
    });

    document.getElementById('saveSchedule').addEventListener('click', () => this.saveSchedule());
    document.getElementById('cancelSchedule').addEventListener('click', () => {
      this.scheduleModal.classList.remove('active');
    });

    // Study duration slider
    this.studyDurationSlider.addEventListener('input', (e) => {
      this.durationValue.textContent = `${e.target.value} minutes`;
    });
  }

  loadLearningPaths() {
    const paths = {
      frontend: {
        name: 'Frontend Development',
        levels: [
          {
            level: 1,
            title: 'Fundamentals',
            topics: [
              {
                id: 'html-basics',
                title: 'HTML Basics',
                description: 'Learn the structure and semantics of HTML',
                resources: [
                  { title: 'HTML Tutorial', type: 'Article', url: '#' },
                  { title: 'HTML Video Course', type: 'Video', url: '#' },
                  { title: 'HTML Practice', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '2 hours'
              },
              {
                id: 'css-fundamentals',
                title: 'CSS Fundamentals',
                description: 'Master styling and layout with CSS',
                resources: [
                  { title: 'CSS Basics', type: 'Article', url: '#' },
                  { title: 'Flexbox Guide', type: 'Interactive', url: '#' },
                  { title: 'CSS Grid Tutorial', type: 'Video', url: '#' }
                ],
                estimatedTime: '3 hours'
              },
              {
                id: 'javascript-basics',
                title: 'JavaScript Basics',
                description: 'Learn programming fundamentals with JavaScript',
                resources: [
                  { title: 'JS Fundamentals', type: 'Article', url: '#' },
                  { title: 'Interactive JS Course', type: 'Interactive', url: '#' },
                  { title: 'JS Exercises', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '4 hours'
              }
            ]
          },
          {
            level: 2,
            title: 'Intermediate',
            topics: [
              {
                id: 'responsive-design',
                title: 'Responsive Design',
                description: 'Create websites that work on all devices',
                resources: [
                  { title: 'Responsive Web Design', type: 'Article', url: '#' },
                  { title: 'Media Queries Guide', type: 'Video', url: '#' },
                  { title: 'Mobile-First Design', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '3 hours'
              },
              {
                id: 'dom-manipulation',
                title: 'DOM Manipulation',
                description: 'Learn to interact with web pages dynamically',
                resources: [
                  { title: 'DOM API Guide', type: 'Article', url: '#' },
                  { title: 'Event Handling', type: 'Interactive', url: '#' },
                  { title: 'DOM Projects', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '4 hours'
              },
              {
                id: 'async-javascript',
                title: 'Async JavaScript',
                description: 'Master promises, async/await, and API calls',
                resources: [
                  { title: 'Promises Tutorial', type: 'Article', url: '#' },
                  { title: 'Fetch API Guide', type: 'Video', url: '#' },
                  { title: 'Async Exercises', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '5 hours'
              }
            ]
          },
          {
            level: 3,
            title: 'Advanced',
            topics: [
              {
                id: 'react-basics',
                title: 'React Basics',
                description: 'Build dynamic UIs with React',
                resources: [
                  { title: 'React Documentation', type: 'Article', url: '#' },
                  { title: 'React Tutorial', type: 'Video', url: '#' },
                  { title: 'React Projects', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '6 hours'
              },
              {
                id: 'state-management',
                title: 'State Management',
                description: 'Learn Redux and Context API',
                resources: [
                  { title: 'Redux Tutorial', type: 'Article', url: '#' },
                  { title: 'Context API Guide', type: 'Video', url: '#' },
                  { title: 'State Management Practice', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '4 hours'
              },
              {
                id: 'testing',
                title: 'Testing',
                description: 'Write tests for your applications',
                resources: [
                  { title: 'Jest Testing Guide', type: 'Article', url: '#' },
                  { title: 'React Testing Library', type: 'Video', url: '#' },
                  { title: 'Testing Exercises', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '5 hours'
              }
            ]
          }
        ]
      },
      backend: {
        name: 'Backend Development',
        levels: [
          {
            level: 1,
            title: 'Server Fundamentals',
            topics: [
              {
                id: 'nodejs-basics',
                title: 'Node.js Basics',
                description: 'Learn server-side JavaScript with Node.js',
                resources: [
                  { title: 'Node.js Tutorial', type: 'Article', url: '#' },
                  { title: 'Node.js Course', type: 'Video', url: '#' },
                  { title: 'Node.js Exercises', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '4 hours'
              },
              {
                id: 'express-framework',
                title: 'Express Framework',
                description: 'Build web servers with Express.js',
                resources: [
                  { title: 'Express Guide', type: 'Article', url: '#' },
                  { title: 'REST API Tutorial', type: 'Video', url: '#' },
                  { title: 'Express Projects', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '5 hours'
              },
              {
                id: 'databases',
                title: 'Databases',
                description: 'Learn SQL and NoSQL databases',
                resources: [
                  { title: 'SQL Basics', type: 'Article', url: '#' },
                  { title: 'MongoDB Tutorial', type: 'Video', url: '#' },
                  { title: 'Database Design', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '6 hours'
              }
            ]
          }
        ]
      },
      datastructures: {
        name: 'Data Structures & Algorithms',
        levels: [
          {
            level: 1,
            title: 'Basic Data Structures',
            topics: [
              {
                id: 'arrays-strings',
                title: 'Arrays & Strings',
                description: 'Master fundamental data structures',
                resources: [
                  { title: 'Array Operations', type: 'Article', url: '#' },
                  { title: 'String Algorithms', type: 'Video', url: '#' },
                  { title: 'Practice Problems', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '4 hours'
              },
              {
                id: 'linked-lists',
                title: 'Linked Lists',
                description: 'Understand pointer-based data structures',
                resources: [
                  { title: 'Linked List Guide', type: 'Article', url: '#' },
                  { title: 'Implementation Tutorial', type: 'Video', url: '#' },
                  { title: 'Linked List Problems', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '3 hours'
              },
              {
                id: 'stacks-queues',
                title: 'Stacks & Queues',
                description: 'Learn LIFO and FIFO data structures',
                resources: [
                  { title: 'Stack & Queue Basics', type: 'Article', url: '#' },
                  { title: 'Implementation Guide', type: 'Video', url: '#' },
                  { title: 'Practice Problems', type: 'Exercise', url: '#' }
                ],
                estimatedTime: '3 hours'
              }
            ]
          }
        ]
      }
    };

    this.currentPathData = paths[this.currentPath];
    this.renderRoadmap();
  }

  renderRoadmap() {
    let html = '';
    
    this.currentPathData.levels.forEach((level, levelIndex) => {
      const isLevelUnlocked = this.isLevelUnlocked(levelIndex);
      const isLevelCompleted = this.isLevelCompleted(level);
      
      html += `
        <div class="roadmap-level ${isLevelCompleted ? 'completed' : ''} ${!isLevelUnlocked ? 'locked' : ''}">
          <div class="level-indicator ${isLevelCompleted ? 'completed' : ''} ${!isLevelUnlocked ? 'locked' : ''}">
            ${level.level}
          </div>
          <div class="level-topics">
            ${level.topics.map(topic => this.renderTopicNode(topic, isLevelUnlocked)).join('')}
          </div>
        </div>
      `;
    });
    
    this.roadmapPath.innerHTML = html;
    this.bindTopicEvents();
  }

  renderTopicNode(topic, isUnlocked) {
    const isCompleted = this.isTopicCompleted(topic.id);
    const isCurrent = this.isCurrentTopic(topic.id);
    
    return `
      <div class="topic-node ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''} ${!isUnlocked ? 'locked' : ''}" 
           data-topic-id="${topic.id}">
        <div class="topic-title">${topic.title}</div>
        <div class="topic-status">
          ${isCompleted ? 'Completed' : isCurrent ? 'In Progress' : !isUnlocked ? 'Locked' : 'Not Started'}
        </div>
        <div class="topic-icon">
          <span class="material-symbols-outlined">check</span>
        </div>
      </div>
    `;
  }

  bindTopicEvents() {
    const topicNodes = this.roadmapPath.querySelectorAll('.topic-node:not(.locked)');
    topicNodes.forEach(node => {
      node.addEventListener('click', () => {
        const topicId = node.dataset.topicId;
        this.showTopicDetails(topicId);
      });
    });
  }

  showTopicDetails(topicId) {
    const topic = this.findTopicById(topicId);
    if (!topic) return;

    const isCompleted = this.isTopicCompleted(topicId);
    const progress = this.getTopicProgress(topicId);

    this.topicTitle.textContent = topic.title;
    this.panelContent.innerHTML = `
      <div class="topic-details">
        <div class="topic-info">
          <h4>Description</h4>
          <div class="topic-description">${topic.description}</div>
          
          <div class="topic-resources">
            <h5>Learning Resources</h5>
            <ul class="resource-list">
              ${topic.resources.map(resource => `
                <li class="resource-item">
                  <span class="resource-title">${resource.title}</span>
                  <span class="resource-type">${resource.type}</span>
                </li>
              `).join('')}
            </ul>
          </div>
          
          <div class="estimated-time">
            <strong>Estimated Time:</strong> ${topic.estimatedTime}
          </div>
        </div>
        
        <div class="topic-actions">
          <div class="topic-progress">
            <h5>Progress</h5>
            <div class="progress-circle" style="background: conic-gradient(var(--orange-dot) ${progress * 3.6}deg, #E0E0E0 ${progress * 3.6}deg)">
              <div class="progress-percentage">${progress}%</div>
            </div>
          </div>
          
          <div class="action-buttons">
            ${!isCompleted ? `
              <button class="btn btn-primary" onclick="learningRoadmap.markTopicCompleted('${topicId}')">
                <span class="material-symbols-outlined">check_circle</span>
                Mark Complete
              </button>
            ` : `
              <button class="btn btn-outline" onclick="learningRoadmap.markTopicIncomplete('${topicId}')">
                <span class="material-symbols-outlined">undo</span>
                Mark Incomplete
              </button>
            `}
            <button class="btn btn-secondary" onclick="learningRoadmap.startPractice('${topicId}')">
              <span class="material-symbols-outlined">play_arrow</span>
              Start Practice
            </button>
          </div>
        </div>
      </div>
    `;

    this.topicDetailsPanel.classList.add('active');
  }

  hideTopicDetails() {
    this.topicDetailsPanel.classList.remove('active');
  }

  findTopicById(topicId) {
    for (const level of this.currentPathData.levels) {
      const topic = level.topics.find(t => t.id === topicId);
      if (topic) return topic;
    }
    return null;
  }

  isLevelUnlocked(levelIndex) {
    if (levelIndex === 0) return true;
    
    const previousLevel = this.currentPathData.levels[levelIndex - 1];
    return this.isLevelCompleted(previousLevel);
  }

  isLevelCompleted(level) {
    return level.topics.every(topic => this.isTopicCompleted(topic.id));
  }

  isTopicCompleted(topicId) {
    const pathProgress = this.userProgress[this.currentPath] || {};
    return pathProgress[topicId]?.completed || false;
  }

  isCurrentTopic(topicId) {
    const pathProgress = this.userProgress[this.currentPath] || {};
    return pathProgress[topicId]?.current || false;
  }

  getTopicProgress(topicId) {
    const pathProgress = this.userProgress[this.currentPath] || {};
    return pathProgress[topicId]?.progress || 0;
  }

  async markTopicCompleted(topicId) {
    if (!this.userProgress[this.currentPath]) {
      this.userProgress[this.currentPath] = {};
    }
    
    this.userProgress[this.currentPath][topicId] = {
      completed: true,
      current: false,
      progress: 100,
      completedAt: new Date()
    };

    await this.saveUserProgress();
    this.renderRoadmap();
    this.updateProgress();
    this.checkAchievements();
    this.hideTopicDetails();
  }

  async markTopicIncomplete(topicId) {
    if (!this.userProgress[this.currentPath]) {
      this.userProgress[this.currentPath] = {};
    }
    
    this.userProgress[this.currentPath][topicId] = {
      completed: false,
      current: true,
      progress: 50,
      completedAt: null
    };

    await this.saveUserProgress();
    this.renderRoadmap();
    this.updateProgress();
    this.hideTopicDetails();
  }

  startPractice(topicId) {
    // Redirect to practice page or open practice modal
    window.open('/src/modules/OnlineCompiler/index.html', '_blank');
  }

  updateProgress() {
    const allTopics = this.currentPathData.levels.flatMap(level => level.topics);
    const completedTopics = allTopics.filter(topic => this.isTopicCompleted(topic.id));
    const progressPercentage = Math.round((completedTopics.length / allTopics.length) * 100);

    this.completedTopicsEl.textContent = completedTopics.length;
    this.totalTopicsEl.textContent = allTopics.length;
    this.progressPercentageEl.textContent = `${progressPercentage}%`;
    this.progressFill.style.width = `${progressPercentage}%`;
    this.progressText.textContent = `${progressPercentage}% Complete`;

    // Update streak
    this.updateStreak();
  }

  updateStreak() {
    const streak = this.calculateStreak();
    this.currentStreakEl.textContent = streak;
  }

  calculateStreak() {
    // Simple streak calculation based on recent completions
    const pathProgress = this.userProgress[this.currentPath] || {};
    const completedTopics = Object.values(pathProgress).filter(topic => topic.completed);
    
    if (completedTopics.length === 0) return 0;
    
    // For demo purposes, return a simple calculation
    return Math.min(completedTopics.length, 7);
  }

  async resetProgress() {
    if (confirm('Are you sure you want to reset your progress? This action cannot be undone.')) {
      this.userProgress[this.currentPath] = {};
      await this.saveUserProgress();
      this.renderRoadmap();
      this.updateProgress();
    }
  }

  generateAchievements() {
    const achievements = [
      {
        id: 'first-topic',
        title: 'First Steps',
        description: 'Complete your first topic',
        icon: '🎯',
        condition: () => this.getCompletedTopicsCount() >= 1
      },
      {
        id: 'level-one',
        title: 'Level Master',
        description: 'Complete an entire level',
        icon: '🏆',
        condition: () => this.getCompletedLevelsCount() >= 1
      },
      {
        id: 'streak-week',
        title: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        condition: () => this.calculateStreak() >= 7
      },
      {
        id: 'half-path',
        title: 'Halfway Hero',
        description: 'Complete 50% of a learning path',
        icon: '⭐',
        condition: () => this.getProgressPercentage() >= 50
      },
      {
        id: 'path-complete',
        title: 'Path Master',
        description: 'Complete an entire learning path',
        icon: '👑',
        condition: () => this.getProgressPercentage() >= 100
      },
      {
        id: 'multi-path',
        title: 'Polyglot',
        description: 'Make progress in multiple paths',
        icon: '🌟',
        condition: () => Object.keys(this.userProgress).length >= 2
      }
    ];

    this.achievements = achievements;
    this.renderAchievements();
  }

  renderAchievements() {
    let html = '';
    
    this.achievements.forEach(achievement => {
      const isUnlocked = achievement.condition();
      
      html += `
        <div class="achievement-card ${isUnlocked ? 'unlocked' : ''}">
          <div class="achievement-icon">${achievement.icon}</div>
          <div class="achievement-title">${achievement.title}</div>
          <div class="achievement-description">${achievement.description}</div>
        </div>
      `;
    });
    
    this.achievementsGrid.innerHTML = html;
  }

  checkAchievements() {
    this.achievements.forEach(achievement => {
      const wasUnlocked = this.isAchievementUnlocked(achievement.id);
      const isNowUnlocked = achievement.condition();
      
      if (!wasUnlocked && isNowUnlocked) {
        this.unlockAchievement(achievement);
      }
    });
    
    this.renderAchievements();
  }

  isAchievementUnlocked(achievementId) {
    return this.userProgress.achievements?.includes(achievementId) || false;
  }

  unlockAchievement(achievement) {
    if (!this.userProgress.achievements) {
      this.userProgress.achievements = [];
    }
    
    this.userProgress.achievements.push(achievement.id);
    this.saveUserProgress();
    this.showAchievementModal(achievement);
  }

  showAchievementModal(achievement) {
    document.getElementById('achievementTitle').textContent = achievement.title;
    document.getElementById('achievementDescription').textContent = achievement.description;
    this.achievementModal.classList.add('active');
  }

  getCompletedTopicsCount() {
    const pathProgress = this.userProgress[this.currentPath] || {};
    return Object.values(pathProgress).filter(topic => topic.completed).length;
  }

  getCompletedLevelsCount() {
    return this.currentPathData.levels.filter(level => this.isLevelCompleted(level)).length;
  }

  getProgressPercentage() {
    const allTopics = this.currentPathData.levels.flatMap(level => level.topics);
    const completedTopics = allTopics.filter(topic => this.isTopicCompleted(topic.id));
    return Math.round((completedTopics.length / allTopics.length) * 100);
  }

  generateCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    let html = `
      <div class="calendar-header">
        <h4>${firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h4>
        <div class="calendar-nav">
          <button class="btn btn-outline">Previous</button>
          <button class="btn btn-outline">Next</button>
        </div>
      </div>
      <div class="calendar-grid">
        <div class="calendar-day-header">Sun</div>
        <div class="calendar-day-header">Mon</div>
        <div class="calendar-day-header">Tue</div>
        <div class="calendar-day-header">Wed</div>
        <div class="calendar-day-header">Thu</div>
        <div class="calendar-day-header">Fri</div>
        <div class="calendar-day-header">Sat</div>
    `;
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      html += '<div class="calendar-day other-month"></div>';
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === now.toDateString();
      const isStudyDay = this.isStudyDay(date);
      const isCompleted = this.isStudyCompleted(date);
      
      html += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${isStudyDay ? 'study-day' : ''} ${isCompleted ? 'completed' : ''}">
          <div class="day-number">${day}</div>
          ${isStudyDay ? '<div class="study-indicator"></div>' : ''}
        </div>
      `;
    }
    
    html += '</div>';
    this.scheduleCalendar.innerHTML = html;
  }

  isStudyDay(date) {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' });
    return this.studySchedule.days.includes(dayName);
  }

  isStudyCompleted(date) {
    // Check if user completed any topic on this date
    const pathProgress = this.userProgress[this.currentPath] || {};
    return Object.values(pathProgress).some(topic => {
      if (!topic.completedAt) return false;
      const completedDate = new Date(topic.completedAt);
      return completedDate.toDateString() === date.toDateString();
    });
  }

  showScheduleModal() {
    this.scheduleModal.classList.add('active');
    
    // Populate current settings
    this.studyDurationSlider.value = this.studySchedule.duration;
    this.durationValue.textContent = `${this.studySchedule.duration} minutes`;
    
    document.getElementById('reminderTime').value = this.studySchedule.reminderTime;
    
    // Set selected days
    const dayCheckboxes = document.querySelectorAll('.day-checkbox input[type="checkbox"]');
    dayCheckboxes.forEach(checkbox => {
      checkbox.checked = this.studySchedule.days.includes(checkbox.value);
    });
  }

  saveSchedule() {
    this.studySchedule.duration = parseInt(this.studyDurationSlider.value);
    this.studySchedule.reminderTime = document.getElementById('reminderTime').value;
    
    const selectedDays = [];
    const dayCheckboxes = document.querySelectorAll('.day-checkbox input[type="checkbox"]:checked');
    dayCheckboxes.forEach(checkbox => {
      selectedDays.push(checkbox.value);
    });
    this.studySchedule.days = selectedDays;
    
    this.saveUserProgress();
    this.generateCalendar();
    this.scheduleModal.classList.remove('active');
  }

  async loadUserProgress() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
      const doc = await db.collection('learning_progress').doc(user.uid).get();
      if (doc.exists) {
        this.userProgress = doc.data().progress || {};
        this.studySchedule = doc.data().schedule || this.studySchedule;
      }
      
      this.updateProgress();
      this.renderAchievements();
      this.generateCalendar();
    } catch (error) {
      console.error('Error loading user progress:', error);
    }
  }

  async saveUserProgress() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
      await db.collection('learning_progress').doc(user.uid).set({
        progress: this.userProgress,
        schedule: this.studySchedule,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error saving user progress:', error);
    }
  }
}

// Initialize the learning roadmap when the page loads
let learningRoadmap;
document.addEventListener('DOMContentLoaded', () => {
  learningRoadmap = new LearningRoadmap();
});

// Make it globally accessible for onclick handlers
window.learningRoadmap = learningRoadmap;