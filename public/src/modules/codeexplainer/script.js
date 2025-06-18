import { firebaseConfig } from "../../scripts/init.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class CodeExplainer {
  constructor() {
    this.currentExplanation = null;
    this.cache = new Map();
    this.rateLimitDelay = 5000; // 5 seconds between requests
    this.lastRequestTime = 0;
    this.maxCacheSize = 50;
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
    
    this.initializeElements();
    this.bindEvents();
    this.loadSampleCode();
    this.loadSavedExplanations();
  }

  initializeElements() {
    this.codeInput = document.getElementById('codeInput');
    this.lineNumbers = document.getElementById('lineNumbers');
    this.languageSelect = document.getElementById('languageSelect');
    this.loadSampleBtn = document.getElementById('loadSample');
    this.clearCodeBtn = document.getElementById('clearCode');
    this.explainCodeBtn = document.getElementById('explainCode');
    this.analyzeComplexityBtn = document.getElementById('analyzeComplexity');
    this.findIssuesBtn = document.getElementById('findIssues');
    this.saveExplanationBtn = document.getElementById('saveExplanation');
    this.exportExplanationBtn = document.getElementById('exportExplanation');
    this.toggleLineNumbersBtn = document.getElementById('toggleLineNumbers');
    this.loadSavedBtn = document.getElementById('loadSavedExplanations');
    
    this.explanationContent = document.getElementById('explanationContent');
    this.breakdownContent = document.getElementById('breakdownContent');
    this.complexityTab = document.getElementById('complexityTab');
    this.issuesTab = document.getElementById('issuesTab');
    this.suggestionsTab = document.getElementById('suggestionsTab');
    this.savedExplanationsGrid = document.getElementById('savedExplanationsGrid');
    
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
  }

  bindEvents() {
    this.codeInput.addEventListener('input', () => this.updateLineNumbers());
    this.codeInput.addEventListener('scroll', () => this.syncLineNumbers());
    
    this.loadSampleBtn.addEventListener('click', () => this.loadSampleCode());
    this.clearCodeBtn.addEventListener('click', () => this.clearCode());
    this.explainCodeBtn.addEventListener('click', () => this.explainCode());
    this.analyzeComplexityBtn.addEventListener('click', () => this.analyzeComplexity());
    this.findIssuesBtn.addEventListener('click', () => this.findIssues());
    this.saveExplanationBtn.addEventListener('click', () => this.saveExplanation());
    this.exportExplanationBtn.addEventListener('click', () => this.exportExplanation());
    this.toggleLineNumbersBtn.addEventListener('click', () => this.toggleLineNumbers());
    this.loadSavedBtn.addEventListener('click', () => this.loadSavedExplanations());
    
    this.languageSelect.addEventListener('change', () => this.loadSampleCode());
    
    // Tab switching
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
    });
  }

  // Input validation
  validateInput(code) {
    if (!code || code.trim().length === 0) {
      throw new Error('Please enter some code to explain');
    }
    
    if (code.length > 10000) {
      throw new Error('Code is too long. Please limit to 10,000 characters.');
    }
    
    // Check for potentially malicious content
    const suspiciousPatterns = [
      /eval\s*\(/i,
      /document\.write/i,
      /innerHTML\s*=/i,
      /<script/i
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(code)) {
        console.warn('Potentially unsafe code detected');
        break;
      }
    }
    
    return true;
  }

  // Rate limiting
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const waitTime = this.rateLimitDelay - timeSinceLastRequest;
      this.showRateLimitMessage(waitTime);
      
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  showRateLimitMessage(waitTime) {
    const seconds = Math.ceil(waitTime / 1000);
    this.explanationContent.innerHTML = `
      <div class="rate-limit-message">
        <span class="material-symbols-outlined">schedule</span>
        <p>Please wait ${seconds} seconds before making another request to avoid rate limits.</p>
      </div>
    `;
  }

  // Cache management
  generateCacheKey(code, language) {
    const content = code + language;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  getCachedExplanation(code, language) {
    const key = this.generateCacheKey(code, language);
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.cacheExpiry) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.explanation;
  }

  setCachedExplanation(code, language, explanation) {
    const key = this.generateCacheKey(code, language);
    
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      explanation,
      timestamp: Date.now()
    });
  }

  // Main explanation function
  async explainCode() {
    const code = this.codeInput.value.trim();
    const language = this.languageSelect.value;
    
    try {
      // Validate input
      this.validateInput(code);
      
      // Check cache first
      const cachedExplanation = this.getCachedExplanation(code, language);
      if (cachedExplanation) {
        this.displayExplanation(cachedExplanation);
        this.generateLineBreakdown(code, cachedExplanation);
        this.enableSaveButtons(code, language, cachedExplanation);
        return;
      }
      
      // Show loading state
      this.setLoading(this.explainCodeBtn, true);
      this.showLoadingState();
      
      // Enforce rate limiting
      await this.enforceRateLimit();
      
      // Make API call
      const explanation = await this.callGeminiAPI(code, language);
      
      // Cache the result
      this.setCachedExplanation(code, language, explanation);
      
      // Display results
      this.displayExplanation(explanation);
      this.generateLineBreakdown(code, explanation);
      this.enableSaveButtons(code, language, explanation);
      
    } catch (error) {
      this.handleError(error);
    } finally {
      this.setLoading(this.explainCodeBtn, false);
    }
  }

  // Gemini API call with proper error handling
  async callGeminiAPI(code, language) {
    const apiKey = "AIzaSyCNOwZ57YqeMfoL76lUeCusGWUWnKouQ5w"; // Move to environment variables in production
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const prompt = this.buildPrompt(code, language);
    
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleAPIError(response);
        return null;
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'API returned an error');
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('No explanation returned from API');
      }

      return this.parseGeminiResponse(text);
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timed out. Please try again.');
      }
      
      throw error;
    }
  }

  // Build structured prompt for better responses
  buildPrompt(code, language) {
    return `Please analyze this ${language} code and provide a structured explanation:

CODE:
\`\`\`${language}
${code}
\`\`\`

Please analyze this ${language} code and explain it in the following structure:

## Overall Purpose
[Summarize what the code achieves overall]

## Key Concepts
[What core programming concepts are used? E.g., loops, functions, classes, recursion, sorting]

## Line-by-Line Breakdown
[Go through the code line-by-line and explain what each does. If lines are grouped in logic blocks, group accordingly.]

## Algorithm Explanation
[What algorithm is implemented? How does it work logically? Mention steps.]

## Complexity Analysis
- **Time Complexity**: Analyze and provide Big-O notation
- **Space Complexity**: Analyze and provide Big-O notation
- Mention any performance bottlenecks

Ensure clarity, readability, and educational quality in your explanation.
`;
  }

  // Parse Gemini response into structured format
  parseGeminiResponse(text) {
    const sections = [];
    const lines = text.split('\n');
    let currentSection = null;
    let currentContent = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for section headers
      if (trimmed.startsWith('##')) {
        // Save previous section
        if (currentSection) {
          sections.push({
            title: currentSection,
            content: currentContent.join('\n').trim()
          });
        }
        
        // Start new section
        currentSection = trimmed.replace(/^##\s*/, '');
        currentContent = [];
      } else if (currentSection) {
        currentContent.push(line);
      }
    }
    
    // Save last section
    if (currentSection) {
      sections.push({
        title: currentSection,
        content: currentContent.join('\n').trim()
      });
    }
    
    // If no sections found, create a default one
    if (sections.length === 0) {
      sections.push({
        title: 'Code Explanation',
        content: text
      });
    }
    
    return sections;
  }

  // Handle API errors gracefully
  async handleAPIError(response) {
    let errorMessage = 'API request failed';
    
    try {
      const errorData = await response.json();
      
      switch (response.status) {
        case 400:
          errorMessage = 'Invalid request. Please check your code and try again.';
          break;
        case 401:
          errorMessage = 'API authentication failed. Please check the API key.';
          break;
        case 403:
          errorMessage = 'API access forbidden. Please check your permissions.';
          break;
        case 429:
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (parseError) {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }

  // Display explanation with proper formatting
  displayExplanation(explanations) {
    if (!explanations || explanations.length === 0) {
      this.explanationContent.innerHTML = `
        <div class="no-explanation">
          <span class="material-symbols-outlined">error</span>
          <p>No explanation could be generated. Please try again.</p>
        </div>
      `;
      return;
    }

    let html = '';
    explanations.forEach(explanation => {
      html += `
        <div class="explanation-item">
          <div class="explanation-title">${this.escapeHtml(explanation.title)}</div>
          <div class="explanation-text">${this.formatContent(explanation.content)}</div>
        </div>
      `;
    });
    
    this.explanationContent.innerHTML = html;
  }

  // Format content with proper HTML
  formatContent(content) {
    // Convert markdown-like formatting to HTML
    let formatted = this.escapeHtml(content);
    
    // Convert code blocks
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    
    // Convert inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Convert bold text
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  // Generate line-by-line breakdown
  generateLineBreakdown(code, explanations) {
    const lines = code.split('\n');
    let html = '';
    
    // Try to extract line-specific explanations from the API response
    const lineBreakdownSection = explanations.find(section => 
      section.title.toLowerCase().includes('line') || 
      section.title.toLowerCase().includes('breakdown')
    );
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        const lineNumber = index + 1;
        const explanation = this.getLineExplanation(line.trim(), lineNumber, lineBreakdownSection);
        
        html += `
          <div class="line-breakdown">
            <div class="line-code">
              <span class="line-number-badge">${lineNumber}</span>
              <code>${this.escapeHtml(line)}</code>
            </div>
            <div class="line-explanation">${explanation}</div>
          </div>
        `;
      }
    });
    
    this.breakdownContent.innerHTML = html || `
      <div class="no-breakdown">
        <span class="material-symbols-outlined">code</span>
        <p>No line breakdown available</p>
      </div>
    `;
  }

  // Extract line-specific explanation
  getLineExplanation(line, lineNumber, breakdownSection) {
    if (breakdownSection) {
      // Try to find explanation for this specific line
      const content = breakdownSection.content;
      const linePattern = new RegExp(`line\\s*${lineNumber}[:\\-]?\\s*([^\\n]+)`, 'i');
      const match = content.match(linePattern);
      
      if (match) {
        return match[1].trim();
      }
    }
    
    // Fallback to generic explanation
    return this.generateGenericLineExplanation(line);
  }

  // Generate generic line explanation
  generateGenericLineExplanation(line) {
    if (line.includes('function') || line.includes('def ')) {
      return 'Defines a new function with specified parameters.';
    } else if (line.includes('if')) {
      return 'Conditional statement that executes code based on a boolean condition.';
    } else if (line.includes('for') || line.includes('while')) {
      return 'Loop statement that repeats code execution while a condition is true.';
    } else if (line.includes('return')) {
      return 'Returns a value from the function and exits the function execution.';
    } else if (line.includes('=') && !line.includes('==')) {
      return 'Variable assignment or initialization statement.';
    } else if (line.includes('console.log') || line.includes('print')) {
      return 'Output statement that displays information to the console.';
    } else if (line.includes('//') || line.includes('#')) {
      return 'Comment line that provides documentation or explanation.';
    }
    
    return 'Code statement that performs a specific operation or computation.';
  }

  // Show loading state
  showLoadingState() {
    this.explanationContent.innerHTML = `
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Analyzing your code...</p>
        <small>This may take a few seconds</small>
      </div>
    `;
  }

  // Error handling
  handleError(error) {
    console.error('Code explanation error:', error);
    
    let errorMessage = 'An unexpected error occurred. Please try again.';
    let showFallback = false;
    
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      errorMessage = 'Rate limit exceeded. Please wait a moment before trying again.';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Request timed out. Please try again with shorter code.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Network error. Please check your connection and try again.';
      showFallback = true;
    } else if (error.message.includes('API')) {
      errorMessage = error.message;
    } else {
      showFallback = true;
    }
    
    this.explanationContent.innerHTML = `
      <div class="error-state">
        <span class="material-symbols-outlined">error</span>
        <p>${errorMessage}</p>
        ${showFallback ? '<button class="btn btn-outline" onclick="codeExplainer.showFallbackExplanation()">Show Basic Analysis</button>' : ''}
      </div>
    `;
  }

  // Fallback explanation when API fails
  showFallbackExplanation() {
    const code = this.codeInput.value.trim();
    const language = this.languageSelect.value;
    
    const fallbackExplanation = [{
      title: 'Basic Code Analysis',
      content: `This appears to be ${language} code with ${code.split('\n').length} lines. While we couldn't get a detailed AI explanation, here's what we can determine from the code structure.`
    }];
    
    this.displayExplanation(fallbackExplanation);
    this.generateLineBreakdown(code, fallbackExplanation);
  }

  // Enable save buttons after successful explanation
  enableSaveButtons(code, language, explanation) {
    this.currentExplanation = {
      code,
      language,
      explanation,
      timestamp: new Date()
    };
    
    this.saveExplanationBtn.disabled = false;
    this.exportExplanationBtn.disabled = false;
  }

  // Utility functions
  updateLineNumbers() {
    const lines = this.codeInput.value.split('\n');
    const lineNumbersHtml = lines.map((_, index) => 
      `<div class="line-number">${index + 1}</div>`
    ).join('');
    this.lineNumbers.innerHTML = lineNumbersHtml;
  }

  syncLineNumbers() {
    this.lineNumbers.scrollTop = this.codeInput.scrollTop;
  }

  setLoading(button, isLoading) {
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
      button.innerHTML = '<span class="loading-spinner"></span> Analyzing...';
    } else {
      button.classList.remove('loading');
      button.disabled = false;
      button.innerHTML = '<span class="material-symbols-outlined">psychology</span> Explain Code';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Load sample code
  loadSampleCode() {
    const language = this.languageSelect.value;
    const samples = {
      javascript: `// Binary Search Implementation
function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

// Example usage
const numbers = [1, 3, 5, 7, 9, 11, 13, 15];
const target = 7;
const result = binarySearch(numbers, target);
console.log(\`Element found at index: \${result}\`);`,

      python: `# Quick Sort Algorithm
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

# Example usage
numbers = [3, 6, 8, 10, 1, 2, 1]
sorted_numbers = quicksort(numbers)
print(f"Original: {numbers}")
print(f"Sorted: {sorted_numbers}")`,

      java: `// Linked List Implementation
public class LinkedList {
    private Node head;
    
    private class Node {
        int data;
        Node next;
        
        Node(int data) {
            this.data = data;
            this.next = null;
        }
    }
    
    public void insert(int data) {
        Node newNode = new Node(data);
        if (head == null) {
            head = newNode;
        } else {
            Node current = head;
            while (current.next != null) {
                current = current.next;
            }
            current.next = newNode;
        }
    }
    
    public void display() {
        Node current = head;
        while (current != null) {
            System.out.print(current.data + " -> ");
            current = current.next;
        }
        System.out.println("null");
    }
}`
    };

    this.codeInput.value = samples[language] || samples.javascript;
    this.updateLineNumbers();
    this.clearAnalysis();
  }

  clearCode() {
    this.codeInput.value = '';
    this.updateLineNumbers();
    this.clearAnalysis();
  }

  clearAnalysis() {
    this.explanationContent.innerHTML = `
      <div class="no-explanation">
        <span class="material-symbols-outlined">lightbulb</span>
        <p>Click "Explain Code" to get a detailed analysis of your code</p>
      </div>
    `;
    
    this.breakdownContent.innerHTML = `
      <div class="no-breakdown">
        <span class="material-symbols-outlined">code</span>
        <p>Line-by-line explanations will appear here</p>
      </div>
    `;
    
    this.saveExplanationBtn.disabled = true;
    this.exportExplanationBtn.disabled = true;
    this.currentExplanation = null;
  }

  // Additional methods for complexity analysis, issue finding, etc.
  async analyzeComplexity() {
    // Implementation for complexity analysis
    this.switchTab('complexity');
  }

  async findIssues() {
    // Implementation for finding issues
    this.switchTab('issues');
  }

  switchTab(tabName) {
    this.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    this.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
  }

  toggleLineNumbers() {
    this.lineNumbers.style.display = this.lineNumbers.style.display === 'none' ? 'block' : 'none';
  }

  async saveExplanation() {
    // Implementation for saving explanations
    if (!this.currentExplanation) {
      alert('No explanation to save');
      return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
      alert('Please sign in to save explanations');
      return;
    }

    try {
      await db.collection('code_explanations').add({
        userId: user.uid,
        code: this.currentExplanation.code,
        language: this.currentExplanation.language,
        explanation: this.currentExplanation.explanation,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        title: this.generateExplanationTitle(this.currentExplanation.code)
      });
      
      alert('Explanation saved successfully!');
      this.loadSavedExplanations();
    } catch (error) {
      console.error('Error saving explanation:', error);
      alert('Failed to save explanation. Please try again.');
    }
  }

  exportExplanation() {
    // Implementation for exporting explanations
    if (!this.currentExplanation) {
      alert('No explanation to export');
      return;
    }

    const content = this.generateExportContent();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `code-explanation-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  generateExportContent() {
    const explanation = this.currentExplanation;
    let content = `# Code Explanation\n\n`;
    content += `**Language:** ${explanation.language}\n`;
    content += `**Date:** ${explanation.timestamp.toLocaleDateString()}\n\n`;
    content += `## Code\n\n\`\`\`${explanation.language}\n${explanation.code}\n\`\`\`\n\n`;
    content += `## Explanation\n\n`;
    
    explanation.explanation.forEach(item => {
      content += `### ${item.title}\n\n${item.content}\n\n`;
    });
    
    return content;
  }

  generateExplanationTitle(code) {
    const firstLine = code.split('\n')[0].trim();
    if (firstLine.includes('function') || firstLine.includes('def ')) {
      const match = firstLine.match(/(?:function|def)\s+(\w+)/);
      return match ? `${match[1]} Function` : 'Code Explanation';
    } else if (firstLine.includes('class')) {
      const match = firstLine.match(/class\s+(\w+)/);
      return match ? `${match[1]} Class` : 'Code Explanation';
    } else if (firstLine.includes('//') || firstLine.includes('#')) {
      return firstLine.replace(/^[\/\/#\s]+/, '').substring(0, 30);
    }
    
    return `Code Explanation - ${new Date().toLocaleDateString()}`;
  }

  async loadSavedExplanations() {
    // Implementation for loading saved explanations
    const user = firebase.auth().currentUser;
    if (!user) {
      this.savedExplanationsGrid.innerHTML = `
        <div class="no-saved">
          <span class="material-symbols-outlined">login</span>
          <p>Please sign in to view saved explanations</p>
        </div>
      `;
      return;
    }

    try {
      const snapshot = await db.collection('code_explanations')
        .where('userId', '==', user.uid)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();
      
      if (snapshot.empty) {
        this.savedExplanationsGrid.innerHTML = `
          <div class="no-saved">
            <span class="material-symbols-outlined">bookmark_border</span>
            <p>No saved explanations yet</p>
          </div>
        `;
        return;
      }
      
      let html = '';
      snapshot.forEach(doc => {
        const data = doc.data();
        const date = data.timestamp ? data.timestamp.toDate().toLocaleDateString() : 'Unknown date';
        const preview = data.code.substring(0, 50) + (data.code.length > 50 ? '...' : '');
        
        html += `
          <div class="saved-explanation-card" data-id="${doc.id}">
            <div class="saved-card-header">
              <div class="saved-card-title">${data.title || 'Untitled'}</div>
              <div class="saved-card-language">${data.language}</div>
            </div>
            <div class="saved-card-preview">${this.escapeHtml(preview)}</div>
            <div class="saved-card-date">${date}</div>
          </div>
        `;
      });
      
      this.savedExplanationsGrid.innerHTML = html;
      
    } catch (error) {
      console.error('Error loading saved explanations:', error);
      this.savedExplanationsGrid.innerHTML = `
        <div class="no-saved">
          <span class="material-symbols-outlined">error</span>
          <p>Error loading saved explanations</p>
        </div>
      `;
    }
  }
}

// Initialize the code explainer when the page loads
let codeExplainer;
document.addEventListener('DOMContentLoaded', () => {
  codeExplainer = new CodeExplainer();
});

// Make it globally accessible for onclick handlers
window.codeExplainer = codeExplainer;