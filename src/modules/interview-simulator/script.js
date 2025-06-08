import { firebaseConfig } from "/src/scripts/init.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class InterviewSimulator {
  constructor() {
    this.currentQuestion = null;
    this.interviewStartTime = null;
    this.timeLimit = 45; // minutes
    this.timerInterval = null;
    this.userSolution = '';
    this.testResults = [];
    this.interviewHistory = [];
    this.performanceChart = null;
    
    this.initializeElements();
    this.bindEvents();
    this.loadInterviewHistory();
    this.loadStatistics();
    this.initializeChart();
  }

  initializeElements() {
    this.difficultySelect = document.getElementById('difficultySelect');
    this.categorySelect = document.getElementById('categorySelect');
    this.timeLimitSelect = document.getElementById('timeLimit');
    this.startInterviewBtn = document.getElementById('startInterview');
    
    // Stats elements
    this.totalInterviewsEl = document.getElementById('totalInterviews');
    this.successRateEl = document.getElementById('successRate');
    this.averageTimeEl = document.getElementById('averageTime');
    this.currentStreakEl = document.getElementById('currentStreak');
    
    // Session elements
    this.interviewSession = document.getElementById('interviewSession');
    this.questionTitle = document.getElementById('questionTitle');
    this.questionDifficulty = document.getElementById('questionDifficulty');
    this.questionCategory = document.getElementById('questionCategory');
    this.timer = document.getElementById('timer');
    this.timeRemaining = document.getElementById('timeRemaining');
    this.questionDescription = document.getElementById('questionDescription');
    this.questionExamples = document.getElementById('questionExamples');
    this.questionConstraints = document.getElementById('questionConstraints');
    this.codeEditor = document.getElementById('codeEditor');
    this.languageSelect = document.getElementById('languageSelect');
    this.testResults = document.getElementById('testResults');
    
    // Results elements
    this.interviewResults = document.getElementById('interviewResults');
    this.overallScore = document.getElementById('overallScore');
    this.scorePercentage = document.getElementById('scorePercentage');
    this.feedbackContent = document.getElementById('feedbackContent');
    
    // History elements
    this.historyContent = document.getElementById('historyContent');
    this.historyFilter = document.getElementById('historyFilter');
    
    // Analytics elements
    this.insightsList = document.getElementById('insightsList');
  }

  bindEvents() {
    this.startInterviewBtn.addEventListener('click', () => this.startInterview());
    document.getElementById('endInterview').addEventListener('click', () => this.endInterview());
    document.getElementById('runCode').addEventListener('click', () => this.runCode());
    document.getElementById('submitSolution').addEventListener('click', () => this.submitSolution());
    
    // Results actions
    document.getElementById('reviewSolution').addEventListener('click', () => this.reviewSolution());
    document.getElementById('startNewInterview').addEventListener('click', () => this.startNewInterview());
    document.getElementById('saveResults').addEventListener('click', () => this.saveResults());
    
    // History filter
    this.historyFilter.addEventListener('change', () => this.filterHistory());
    
    // Analytics period buttons
    document.querySelectorAll('.period-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.updateAnalytics(e.target.dataset.period);
      });
    });
    
    // Code editor auto-save
    this.codeEditor.addEventListener('input', () => {
      this.userSolution = this.codeEditor.value;
    });
    
    // Time limit change
    this.timeLimitSelect.addEventListener('change', (e) => {
      this.timeLimit = parseInt(e.target.value);
    });
  }

  async startInterview() {
    const difficulty = this.difficultySelect.value;
    const category = this.categorySelect.value;
    
    // Generate or select a question
    this.currentQuestion = await this.generateQuestion(difficulty, category);
    
    if (!this.currentQuestion) {
      alert('Failed to generate question. Please try again.');
      return;
    }
    
    // Setup interview session
    this.interviewStartTime = new Date();
    this.userSolution = '';
    this.testResults = [];
    
    // Show interview session
    this.interviewSession.style.display = 'block';
    this.interviewResults.style.display = 'none';
    
    // Populate question details
    this.displayQuestion();
    
    // Start timer
    this.startTimer();
    
    // Scroll to session
    this.interviewSession.scrollIntoView({ behavior: 'smooth' });
  }

  async generateQuestion(difficulty, category) {
    // Sample questions database
    const questions = {
      easy: {
        arrays: [
          {
            id: 'two-sum',
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            examples: [
              {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
              }
            ],
            constraints: [
              '2 <= nums.length <= 10^4',
              '-10^9 <= nums[i] <= 10^9',
              '-10^9 <= target <= 10^9',
              'Only one valid answer exists.'
            ],
            testCases: [
              { input: '[2,7,11,15], 9', expected: '[0,1]' },
              { input: '[3,2,4], 6', expected: '[1,2]' },
              { input: '[3,3], 6', expected: '[0,1]' }
            ],
            template: {
              javascript: `function twoSum(nums, target) {
    // Your solution here
}`,
              python: `def two_sum(nums, target):
    # Your solution here
    pass`,
              java: `public int[] twoSum(int[] nums, int target) {
    // Your solution here
}`,
              cpp: `vector<int> twoSum(vector<int>& nums, int target) {
    // Your solution here
}`
            }
          }
        ],
        'linked-lists': [
          {
            id: 'reverse-linked-list',
            title: 'Reverse Linked List',
            description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
            examples: [
              {
                input: 'head = [1,2,3,4,5]',
                output: '[5,4,3,2,1]',
                explanation: 'The linked list is reversed.'
              }
            ],
            constraints: [
              'The number of nodes in the list is the range [0, 5000].',
              '-5000 <= Node.val <= 5000'
            ],
            testCases: [
              { input: '[1,2,3,4,5]', expected: '[5,4,3,2,1]' },
              { input: '[1,2]', expected: '[2,1]' },
              { input: '[]', expected: '[]' }
            ],
            template: {
              javascript: `function reverseList(head) {
    // Your solution here
}`,
              python: `def reverse_list(head):
    # Your solution here
    pass`
            }
          }
        ]
      },
      medium: {
        arrays: [
          {
            id: 'longest-substring',
            title: 'Longest Substring Without Repeating Characters',
            description: 'Given a string s, find the length of the longest substring without repeating characters.',
            examples: [
              {
                input: 's = "abcabcbb"',
                output: '3',
                explanation: 'The answer is "abc", with the length of 3.'
              }
            ],
            constraints: [
              '0 <= s.length <= 5 * 10^4',
              's consists of English letters, digits, symbols and spaces.'
            ],
            testCases: [
              { input: '"abcabcbb"', expected: '3' },
              { input: '"bbbbb"', expected: '1' },
              { input: '"pwwkew"', expected: '3' }
            ],
            template: {
              javascript: `function lengthOfLongestSubstring(s) {
    // Your solution here
}`,
              python: `def length_of_longest_substring(s):
    # Your solution here
    pass`
            }
          }
        ],
        trees: [
          {
            id: 'binary-tree-level-order',
            title: 'Binary Tree Level Order Traversal',
            description: 'Given the root of a binary tree, return the level order traversal of its nodes\' values.',
            examples: [
              {
                input: 'root = [3,9,20,null,null,15,7]',
                output: '[[3],[9,20],[15,7]]',
                explanation: 'Level order traversal groups nodes by their depth.'
              }
            ],
            constraints: [
              'The number of nodes in the tree is in the range [0, 2000].',
              '-1000 <= Node.val <= 1000'
            ],
            testCases: [
              { input: '[3,9,20,null,null,15,7]', expected: '[[3],[9,20],[15,7]]' },
              { input: '[1]', expected: '[[1]]' },
              { input: '[]', expected: '[]' }
            ],
            template: {
              javascript: `function levelOrder(root) {
    // Your solution here
}`,
              python: `def level_order(root):
    # Your solution here
    pass`
            }
          }
        ]
      },
      hard: {
        'dynamic-programming': [
          {
            id: 'edit-distance',
            title: 'Edit Distance',
            description: 'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.',
            examples: [
              {
                input: 'word1 = "horse", word2 = "ros"',
                output: '3',
                explanation: 'horse -> rorse (replace \'h\' with \'r\'), rorse -> rose (remove \'r\'), rose -> ros (remove \'e\')'
              }
            ],
            constraints: [
              '0 <= word1.length, word2.length <= 500',
              'word1 and word2 consist of lowercase English letters.'
            ],
            testCases: [
              { input: '"horse", "ros"', expected: '3' },
              { input: '"intention", "execution"', expected: '5' }
            ],
            template: {
              javascript: `function minDistance(word1, word2) {
    // Your solution here
}`,
              python: `def min_distance(word1, word2):
    # Your solution here
    pass`
            }
          }
        ]
      }
    };

    // Select appropriate question based on filters
    const difficultyQuestions = questions[difficulty] || questions.medium;
    const categoryQuestions = category === 'all' 
      ? Object.values(difficultyQuestions).flat()
      : difficultyQuestions[category] || Object.values(difficultyQuestions).flat();
    
    if (categoryQuestions.length === 0) {
      return null;
    }
    
    // Return random question
    const randomIndex = Math.floor(Math.random() * categoryQuestions.length);
    return categoryQuestions[randomIndex];
  }

  displayQuestion() {
    if (!this.currentQuestion) return;
    
    // Update question header
    this.questionTitle.textContent = this.currentQuestion.title;
    this.questionDifficulty.textContent = this.difficultySelect.value;
    this.questionDifficulty.className = `difficulty-badge ${this.difficultySelect.value}`;
    this.questionCategory.textContent = this.categorySelect.value === 'all' ? 'Mixed' : this.categorySelect.value.replace('-', ' ');
    
    // Update question content
    this.questionDescription.innerHTML = `<p>${this.currentQuestion.description}</p>`;
    
    // Display examples
    let examplesHtml = '<h4>Examples:</h4>';
    this.currentQuestion.examples.forEach((example, index) => {
      examplesHtml += `
        <div class="example-item">
          <strong>Example ${index + 1}:</strong><br>
          <strong>Input:</strong> ${example.input}<br>
          <strong>Output:</strong> ${example.output}<br>
          <strong>Explanation:</strong> ${example.explanation}
        </div>
      `;
    });
    this.questionExamples.innerHTML = examplesHtml;
    
    // Display constraints
    let constraintsHtml = '<h4>Constraints:</h4><ul class="constraints-list">';
    this.currentQuestion.constraints.forEach(constraint => {
      constraintsHtml += `<li>${constraint}</li>`;
    });
    constraintsHtml += '</ul>';
    this.questionConstraints.innerHTML = constraintsHtml;
    
    // Set code template
    const language = this.languageSelect.value;
    this.codeEditor.value = this.currentQuestion.template[language] || '';
    this.userSolution = this.codeEditor.value;
  }

  startTimer() {
    let timeLeft = this.timeLimit * 60; // Convert to seconds
    
    this.timerInterval = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      
      this.timeRemaining.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      // Warning when 5 minutes left
      if (timeLeft <= 300) {
        this.timer.classList.add('warning');
      }
      
      // Time's up
      if (timeLeft <= 0) {
        this.endInterview();
        return;
      }
      
      timeLeft--;
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.timer.classList.remove('warning');
  }

  runCode() {
    if (!this.currentQuestion) return;
    
    // Simulate code execution with test cases
    const results = this.executeTestCases();
    this.displayTestResults(results);
  }

  executeTestCases() {
    // Simulate test case execution
    const results = [];
    
    this.currentQuestion.testCases.forEach((testCase, index) => {
      // Simple simulation - in real implementation, this would execute the code
      const passed = Math.random() > 0.3; // 70% pass rate for simulation
      
      results.push({
        index: index + 1,
        input: testCase.input,
        expected: testCase.expected,
        actual: passed ? testCase.expected : 'Wrong output',
        passed: passed,
        executionTime: Math.floor(Math.random() * 100) + 'ms'
      });
    });
    
    return results;
  }

  displayTestResults(results) {
    let html = '';
    
    results.forEach(result => {
      html += `
        <div class="test-case ${result.passed ? 'passed' : 'failed'}">
          <div class="test-case-header">
            <span>Test Case ${result.index}</span>
            <span>${result.passed ? 'PASSED' : 'FAILED'}</span>
          </div>
          <div><strong>Input:</strong> ${result.input}</div>
          <div><strong>Expected:</strong> ${result.expected}</div>
          <div><strong>Actual:</strong> ${result.actual}</div>
          <div><strong>Time:</strong> ${result.executionTime}</div>
        </div>
      `;
    });
    
    this.testResults.innerHTML = html;
    this.testResults.scrollTop = this.testResults.scrollHeight;
  }

  submitSolution() {
    if (!this.currentQuestion) return;
    
    // Run final test cases
    const results = this.executeTestCases();
    this.testResults = results;
    
    // End interview and show results
    this.endInterview();
  }

  endInterview() {
    this.stopTimer();
    
    // Calculate interview duration
    const endTime = new Date();
    const duration = Math.floor((endTime - this.interviewStartTime) / 1000 / 60); // minutes
    
    // Calculate scores
    const scores = this.calculateScores(duration);
    
    // Show results
    this.showResults(scores, duration);
    
    // Save to history
    this.saveToHistory(scores, duration);
  }

  calculateScores(duration) {
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalTests = this.testResults.length || this.currentQuestion?.testCases.length || 3;
    
    // Calculate individual scores
    const testCasesScore = Math.round((passedTests / totalTests) * 100);
    const timeEfficiency = Math.max(0, Math.round(100 - (duration / this.timeLimit) * 30));
    const codeQuality = Math.floor(Math.random() * 30) + 70; // Simulated
    const problemSolving = Math.floor(Math.random() * 20) + 75; // Simulated
    
    // Overall score
    const overallScore = Math.round((testCasesScore * 0.4 + timeEfficiency * 0.2 + codeQuality * 0.2 + problemSolving * 0.2));
    
    return {
      overall: overallScore,
      timeEfficiency,
      codeQuality,
      problemSolving,
      testCases: testCasesScore,
      testCasesText: `${passedTests}/${totalTests}`
    };
  }

  showResults(scores, duration) {
    // Hide session, show results
    this.interviewSession.style.display = 'none';
    this.interviewResults.style.display = 'block';
    
    // Update score circle
    this.scorePercentage.textContent = `${scores.overall}%`;
    const scoreCircle = document.querySelector('.score-circle');
    scoreCircle.style.background = `conic-gradient(var(--orange-dot) ${scores.overall * 3.6}deg, #E0E0E0 ${scores.overall * 3.6}deg)`;
    
    // Update breakdown bars
    this.updateBreakdownBar('timeEfficiencyBar', 'timeEfficiencyScore', scores.timeEfficiency);
    this.updateBreakdownBar('codeQualityBar', 'codeQualityScore', scores.codeQuality);
    this.updateBreakdownBar('problemSolvingBar', 'problemSolvingScore', scores.problemSolving);
    this.updateBreakdownBar('testCasesBar', 'testCasesScore', scores.testCases, scores.testCasesText);
    
    // Generate feedback
    this.generateFeedback(scores, duration);
    
    // Scroll to results
    this.interviewResults.scrollIntoView({ behavior: 'smooth' });
  }

  updateBreakdownBar(barId, scoreId, percentage, customText = null) {
    const bar = document.getElementById(barId);
    const scoreEl = document.getElementById(scoreId);
    
    if (bar && scoreEl) {
      bar.style.width = `${percentage}%`;
      scoreEl.textContent = customText || `${percentage}%`;
    }
  }

  generateFeedback(scores, duration) {
    const feedback = [];
    
    // Positive feedback
    if (scores.testCases >= 80) {
      feedback.push({
        type: 'positive',
        title: 'Excellent Problem Solving!',
        content: 'You successfully passed most test cases, demonstrating strong algorithmic thinking.'
      });
    }
    
    if (scores.timeEfficiency >= 80) {
      feedback.push({
        type: 'positive',
        title: 'Great Time Management!',
        content: 'You completed the solution efficiently within the time limit.'
      });
    }
    
    // Areas for improvement
    if (scores.codeQuality < 70) {
      feedback.push({
        type: 'improvement',
        title: 'Code Quality',
        content: 'Consider improving code readability with better variable names and comments.'
      });
    }
    
    if (scores.testCases < 60) {
      feedback.push({
        type: 'improvement',
        title: 'Test Case Coverage',
        content: 'Review edge cases and ensure your solution handles all possible inputs.'
      });
    }
    
    // General recommendations
    feedback.push({
      type: 'recommendation',
      title: 'Next Steps',
      content: 'Practice similar problems and focus on explaining your thought process during interviews.'
    });
    
    // Display feedback
    let html = '';
    feedback.forEach(item => {
      html += `
        <div class="feedback-item">
          <div class="feedback-type ${item.type}">${item.title}</div>
          <div>${item.content}</div>
        </div>
      `;
    });
    
    this.feedbackContent.innerHTML = html;
  }

  reviewSolution() {
    // Show the solution in the code editor
    this.interviewSession.style.display = 'block';
    this.interviewResults.style.display = 'none';
    
    // Disable editing
    this.codeEditor.readOnly = true;
    this.codeEditor.style.background = '#F8F9FA';
    
    // Hide action buttons
    document.getElementById('runCode').style.display = 'none';
    document.getElementById('submitSolution').style.display = 'none';
  }

  startNewInterview() {
    // Reset everything
    this.currentQuestion = null;
    this.interviewStartTime = null;
    this.userSolution = '';
    this.testResults = [];
    
    // Hide session and results
    this.interviewSession.style.display = 'none';
    this.interviewResults.style.display = 'none';
    
    // Reset code editor
    this.codeEditor.readOnly = false;
    this.codeEditor.style.background = 'white';
    this.codeEditor.value = '';
    
    // Show action buttons
    document.getElementById('runCode').style.display = 'inline-flex';
    document.getElementById('submitSolution').style.display = 'inline-flex';
    
    // Clear test results
    this.testResults.innerHTML = '';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async saveResults() {
    const user = firebase.auth().currentUser;
    if (!user) {
      alert('Please sign in to save results');
      return;
    }

    try {
      const resultData = {
        userId: user.uid,
        questionId: this.currentQuestion?.id,
        questionTitle: this.currentQuestion?.title,
        difficulty: this.difficultySelect.value,
        category: this.categorySelect.value,
        timeLimit: this.timeLimit,
        duration: Math.floor((new Date() - this.interviewStartTime) / 1000 / 60),
        scores: this.calculateScores(Math.floor((new Date() - this.interviewStartTime) / 1000 / 60)),
        solution: this.userSolution,
        testResults: this.testResults,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('interview_results').add(resultData);
      alert('Results saved successfully!');
      this.loadInterviewHistory();
      this.loadStatistics();
    } catch (error) {
      console.error('Error saving results:', error);
      alert('Failed to save results. Please try again.');
    }
  }

  async loadInterviewHistory() {
    const user = firebase.auth().currentUser;
    if (!user) return;

    try {
      const snapshot = await db.collection('interview_results')
        .where('userId', '==', user.uid)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      this.interviewHistory = [];
      snapshot.forEach(doc => {
        this.interviewHistory.push({ id: doc.id, ...doc.data() });
      });

      this.displayHistory();
    } catch (error) {
      console.error('Error loading interview history:', error);
    }
  }

  displayHistory() {
    if (this.interviewHistory.length === 0) {
      this.historyContent.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--gray);">
          <span class="material-symbols-outlined" style="font-size: 3rem; opacity: 0.5;">history</span>
          <p>No interview history yet. Start your first interview!</p>
        </div>
      `;
      return;
    }

    let html = '';
    this.interviewHistory.forEach(interview => {
      const date = interview.timestamp ? interview.timestamp.toDate().toLocaleDateString() : 'Unknown date';
      const scoreClass = interview.scores?.overall >= 80 ? 'excellent' : 
                        interview.scores?.overall >= 60 ? 'good' : 'needs-improvement';
      
      html += `
        <div class="history-item">
          <div class="history-date">${date}</div>
          <div class="history-question">
            <strong>${interview.questionTitle || 'Unknown Question'}</strong><br>
            <small>${interview.difficulty} • ${interview.category} • ${interview.duration}min</small>
          </div>
          <div class="history-score ${scoreClass}">${interview.scores?.overall || 0}%</div>
        </div>
      `;
    });

    this.historyContent.innerHTML = html;
  }

  filterHistory() {
    // Implementation for filtering history
    this.displayHistory();
  }

  async loadStatistics() {
    const user = firebase.auth().currentUser;
    if (!user) {
      // Show default values
      this.totalInterviewsEl.textContent = '0';
      this.successRateEl.textContent = '0%';
      this.averageTimeEl.textContent = '0m';
      this.currentStreakEl.textContent = '0';
      return;
    }

    try {
      const snapshot = await db.collection('interview_results')
        .where('userId', '==', user.uid)
        .get();

      const interviews = [];
      snapshot.forEach(doc => {
        interviews.push(doc.data());
      });

      // Calculate statistics
      const totalInterviews = interviews.length;
      const successfulInterviews = interviews.filter(i => i.scores?.overall >= 70).length;
      const successRate = totalInterviews > 0 ? Math.round((successfulInterviews / totalInterviews) * 100) : 0;
      const averageTime = totalInterviews > 0 ? Math.round(interviews.reduce((sum, i) => sum + (i.duration || 0), 0) / totalInterviews) : 0;
      const currentStreak = this.calculateStreak(interviews);

      // Update UI
      this.totalInterviewsEl.textContent = totalInterviews;
      this.successRateEl.textContent = `${successRate}%`;
      this.averageTimeEl.textContent = `${averageTime}m`;
      this.currentStreakEl.textContent = currentStreak;

    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }

  calculateStreak(interviews) {
    if (interviews.length === 0) return 0;
    
    // Sort by timestamp
    const sortedInterviews = interviews
      .filter(i => i.timestamp && i.scores?.overall >= 70)
      .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());
    
    if (sortedInterviews.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (const interview of sortedInterviews) {
      const interviewDate = interview.timestamp.toDate();
      const daysDiff = Math.floor((today - interviewDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak + 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  initializeChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    this.performanceChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Performance Score',
          data: [65, 72, 80, 75, 85, 78, 90],
          borderColor: 'var(--orange-dot)',
          backgroundColor: 'rgba(254, 50, 10, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  updateAnalytics(period) {
    // Update chart data based on period
    if (this.performanceChart) {
      // Simulate different data for different periods
      const data = {
        week: [65, 72, 80, 75, 85, 78, 90],
        month: [70, 75, 78, 82, 85, 88, 90, 85, 87, 89, 92, 95],
        year: [60, 65, 70, 75, 80, 85, 88, 90, 87, 89, 91, 93]
      };
      
      this.performanceChart.data.datasets[0].data = data[period] || data.week;
      this.performanceChart.update();
    }
    
    // Update insights
    this.updateInsights(period);
  }

  updateInsights(period) {
    const insights = {
      week: [
        {
          type: 'strength',
          title: 'Strong Finish',
          content: 'Your performance improved significantly towards the end of the week.'
        },
        {
          type: 'weakness',
          title: 'Monday Struggles',
          content: 'Consider warming up with easier problems at the start of the week.'
        },
        {
          type: 'recommendation',
          title: 'Consistency',
          content: 'Try to maintain a regular practice schedule for better results.'
        }
      ],
      month: [
        {
          type: 'strength',
          title: 'Steady Growth',
          content: 'You\'ve shown consistent improvement throughout the month.'
        },
        {
          type: 'recommendation',
          title: 'Challenge Yourself',
          content: 'Consider attempting harder difficulty levels to continue growing.'
        }
      ],
      year: [
        {
          type: 'strength',
          title: 'Excellent Progress',
          content: 'Your performance has improved dramatically over the year.'
        },
        {
          type: 'recommendation',
          title: 'Specialization',
          content: 'Consider focusing on specific algorithm categories for deeper expertise.'
        }
      ]
    };
    
    const currentInsights = insights[period] || insights.week;
    
    let html = '';
    currentInsights.forEach(insight => {
      html += `
        <div class="insight-item">
          <div class="insight-type ${insight.type}">${insight.title}</div>
          <div>${insight.content}</div>
        </div>
      `;
    });
    
    this.insightsList.innerHTML = html;
  }
}

// Initialize the interview simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new InterviewSimulator();
});