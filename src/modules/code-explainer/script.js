import { firebaseConfig } from "/src/scripts/init.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class CodeExplainer {
  constructor() {
    this.currentExplanation = null;
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
}`,

      cpp: `// Binary Tree Implementation
#include <iostream>
using namespace std;

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

class BinaryTree {
private:
    TreeNode* root;
    
    void inorderHelper(TreeNode* node) {
        if (node != nullptr) {
            inorderHelper(node->left);
            cout << node->val << " ";
            inorderHelper(node->right);
        }
    }
    
public:
    BinaryTree() : root(nullptr) {}
    
    void insert(int val) {
        root = insertHelper(root, val);
    }
    
    TreeNode* insertHelper(TreeNode* node, int val) {
        if (node == nullptr) {
            return new TreeNode(val);
        }
        
        if (val < node->val) {
            node->left = insertHelper(node->left, val);
        } else {
            node->right = insertHelper(node->right, val);
        }
        
        return node;
    }
    
    void inorder() {
        inorderHelper(root);
        cout << endl;
    }
};`,

      c: `// Stack Implementation using Array
#include <stdio.h>
#include <stdlib.h>
#define MAX_SIZE 100

typedef struct {
    int items[MAX_SIZE];
    int top;
} Stack;

Stack* createStack() {
    Stack* stack = (Stack*)malloc(sizeof(Stack));
    stack->top = -1;
    return stack;
}

int isEmpty(Stack* stack) {
    return stack->top == -1;
}

int isFull(Stack* stack) {
    return stack->top == MAX_SIZE - 1;
}

void push(Stack* stack, int item) {
    if (isFull(stack)) {
        printf("Stack overflow\\n");
        return;
    }
    stack->items[++stack->top] = item;
}

int pop(Stack* stack) {
    if (isEmpty(stack)) {
        printf("Stack underflow\\n");
        return -1;
    }
    return stack->items[stack->top--];
}

int peek(Stack* stack) {
    if (isEmpty(stack)) {
        return -1;
    }
    return stack->items[stack->top];
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
    
    this.complexityTab.innerHTML = `
      <div class="no-analysis">
        <span class="material-symbols-outlined">trending_up</span>
        <p>Complexity analysis will appear here</p>
      </div>
    `;
    
    this.issuesTab.innerHTML = `
      <div class="no-analysis">
        <span class="material-symbols-outlined">warning</span>
        <p>Code issues and warnings will appear here</p>
      </div>
    `;
    
    this.suggestionsTab.innerHTML = `
      <div class="no-analysis">
        <span class="material-symbols-outlined">tips_and_updates</span>
        <p>Improvement suggestions will appear here</p>
      </div>
    `;
    
    this.saveExplanationBtn.disabled = true;
    this.exportExplanationBtn.disabled = true;
    this.currentExplanation = null;
  }

  async explainCode() {
    const code = this.codeInput.value.trim();
    if (!code) {
      alert('Please enter some code to explain');
      return;
    }

    this.setLoading(this.explainCodeBtn, true);
    
    try {
      const explanation = await this.generateExplanation(code);
      this.displayExplanation(explanation);
      this.generateLineBreakdown(code);
      
      this.currentExplanation = {
        code: code,
        language: this.languageSelect.value,
        explanation: explanation,
        timestamp: new Date()
      };
      
      this.saveExplanationBtn.disabled = false;
      this.exportExplanationBtn.disabled = false;
    } catch (error) {
      console.error('Error explaining code:', error);
      alert('Failed to explain code. Please try again.');
    } finally {
      this.setLoading(this.explainCodeBtn, false);
    }
  }

  async generateExplanation(code) {
    // Simulate AI explanation generation
    // In a real implementation, this would call an AI service
    const language = this.languageSelect.value;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const explanations = this.getCodeExplanations(code, language);
        resolve(explanations);
      }, 1500);
    });
  }

  getCodeExplanations(code, language) {
    const explanations = [];
    
    // Overall purpose
    explanations.push({
      title: 'Overall Purpose',
      content: this.getOverallPurpose(code, language)
    });
    
    // Key concepts
    explanations.push({
      title: 'Key Concepts',
      content: this.getKeyConcepts(code, language)
    });
    
    // Algorithm explanation
    explanations.push({
      title: 'Algorithm Explanation',
      content: this.getAlgorithmExplanation(code, language)
    });
    
    // Time and space complexity
    explanations.push({
      title: 'Complexity Analysis',
      content: this.getComplexityExplanation(code, language)
    });
    
    return explanations;
  }

  getOverallPurpose(code, language) {
    if (code.includes('binarySearch') || code.includes('binary_search')) {
      return 'This code implements a binary search algorithm, which efficiently finds a target element in a sorted array by repeatedly dividing the search space in half.';
    } else if (code.includes('quicksort') || code.includes('QuickSort')) {
      return 'This code implements the quicksort algorithm, a highly efficient divide-and-conquer sorting algorithm that works by selecting a pivot element and partitioning the array around it.';
    } else if (code.includes('LinkedList') || code.includes('linked_list')) {
      return 'This code implements a linked list data structure, which stores elements in nodes that are connected through pointers, allowing for dynamic memory allocation.';
    } else if (code.includes('BinaryTree') || code.includes('TreeNode')) {
      return 'This code implements a binary tree data structure, where each node has at most two children, commonly used for efficient searching and sorting operations.';
    } else if (code.includes('Stack') || code.includes('stack')) {
      return 'This code implements a stack data structure, which follows the Last-In-First-Out (LIFO) principle, commonly used for function calls, expression evaluation, and backtracking.';
    }
    
    return 'This code demonstrates fundamental programming concepts and data structure operations, showcasing proper implementation patterns and best practices.';
  }

  getKeyConcepts(code, language) {
    const concepts = [];
    
    if (code.includes('while') || code.includes('for')) {
      concepts.push('Iterative loops for repetitive operations');
    }
    if (code.includes('if') && code.includes('else')) {
      concepts.push('Conditional logic for decision making');
    }
    if (code.includes('function') || code.includes('def ') || code.includes('public ')) {
      concepts.push('Function/method definitions for code organization');
    }
    if (code.includes('class') || code.includes('struct')) {
      concepts.push('Object-oriented programming with classes/structures');
    }
    if (code.includes('recursion') || code.includes('recursive')) {
      concepts.push('Recursive function calls for divide-and-conquer approach');
    }
    
    return concepts.length > 0 ? concepts.join(', ') : 'Basic programming constructs and control flow';
  }

  getAlgorithmExplanation(code, language) {
    if (code.includes('binarySearch')) {
      return 'The algorithm maintains two pointers (left and right) and repeatedly calculates the middle index. It compares the middle element with the target and adjusts the search boundaries accordingly, eliminating half of the remaining elements in each iteration.';
    } else if (code.includes('quicksort')) {
      return 'The algorithm selects a pivot element and partitions the array into three parts: elements less than the pivot, elements equal to the pivot, and elements greater than the pivot. It then recursively sorts the left and right partitions.';
    } else if (code.includes('LinkedList')) {
      return 'The algorithm traverses the linked list by following the next pointers from node to node. For insertion, it finds the appropriate position and updates the pointer references to maintain the chain.';
    }
    
    return 'The algorithm follows a systematic approach to solve the problem efficiently, using appropriate data structures and control flow mechanisms.';
  }

  getComplexityExplanation(code, language) {
    if (code.includes('binarySearch')) {
      return 'Time Complexity: O(log n) - Each iteration eliminates half of the remaining elements. Space Complexity: O(1) - Uses only a constant amount of extra space.';
    } else if (code.includes('quicksort')) {
      return 'Time Complexity: O(n log n) average case, O(n²) worst case. Space Complexity: O(log n) due to recursive call stack.';
    } else if (code.includes('LinkedList')) {
      return 'Time Complexity: O(n) for traversal and search operations, O(1) for insertion at known position. Space Complexity: O(1) for operations, O(n) for storage.';
    }
    
    return 'The complexity depends on the specific operations and data structures used in the implementation.';
  }

  displayExplanation(explanations) {
    let html = '';
    explanations.forEach(explanation => {
      html += `
        <div class="explanation-item">
          <div class="explanation-title">${explanation.title}</div>
          <div class="explanation-text">${explanation.content}</div>
        </div>
      `;
    });
    
    this.explanationContent.innerHTML = html;
  }

  generateLineBreakdown(code) {
    const lines = code.split('\n');
    let html = '';
    
    lines.forEach((line, index) => {
      if (line.trim()) {
        const explanation = this.explainLine(line.trim(), index + 1);
        html += `
          <div class="line-breakdown">
            <div class="line-code">
              <span class="line-number-badge">${index + 1}</span>
              <code>${this.escapeHtml(line)}</code>
            </div>
            <div class="line-explanation">${explanation}</div>
          </div>
        `;
      }
    });
    
    this.breakdownContent.innerHTML = html || '<div class="no-breakdown"><span class="material-symbols-outlined">code</span><p>No significant lines to explain</p></div>';
  }

  explainLine(line, lineNumber) {
    // Simple line explanation logic
    if (line.includes('function') || line.includes('def ')) {
      return 'Defines a new function with specified parameters.';
    } else if (line.includes('if')) {
      return 'Conditional statement that executes code based on a boolean condition.';
    } else if (line.includes('while') || line.includes('for')) {
      return 'Loop statement that repeats code execution while a condition is true.';
    } else if (line.includes('return')) {
      return 'Returns a value from the function and exits the function execution.';
    } else if (line.includes('=') && !line.includes('==')) {
      return 'Variable assignment or initialization statement.';
    } else if (line.includes('console.log') || line.includes('print')) {
      return 'Output statement that displays information to the console.';
    } else if (line.includes('//') || line.includes('#')) {
      return 'Comment line that provides documentation or explanation.';
    } else if (line.includes('{') || line.includes('}')) {
      return 'Code block delimiter that groups related statements together.';
    }
    
    return 'Code statement that performs a specific operation or computation.';
  }

  async analyzeComplexity() {
    const code = this.codeInput.value.trim();
    if (!code) {
      alert('Please enter some code to analyze');
      return;
    }

    this.setLoading(this.analyzeComplexityBtn, true);
    
    try {
      const complexity = await this.generateComplexityAnalysis(code);
      this.displayComplexityAnalysis(complexity);
      this.switchTab('complexity');
    } catch (error) {
      console.error('Error analyzing complexity:', error);
      alert('Failed to analyze complexity. Please try again.');
    } finally {
      this.setLoading(this.analyzeComplexityBtn, false);
    }
  }

  async generateComplexityAnalysis(code) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysis = this.calculateComplexity(code);
        resolve(analysis);
      }, 1000);
    });
  }

  calculateComplexity(code) {
    const analysis = [];
    
    // Time complexity analysis
    let timeComplexity = 'O(1)';
    if (code.includes('for') && code.includes('for')) {
      timeComplexity = 'O(n²)';
    } else if (code.includes('while') || code.includes('for')) {
      timeComplexity = 'O(n)';
    } else if (code.includes('binarySearch') || code.includes('binary_search')) {
      timeComplexity = 'O(log n)';
    } else if (code.includes('quicksort') || code.includes('mergesort')) {
      timeComplexity = 'O(n log n)';
    }
    
    analysis.push({
      label: 'Time Complexity',
      value: timeComplexity,
      level: this.getComplexityLevel(timeComplexity)
    });
    
    // Space complexity analysis
    let spaceComplexity = 'O(1)';
    if (code.includes('recursion') || code.includes('recursive')) {
      spaceComplexity = 'O(log n)';
    } else if (code.includes('array') || code.includes('list')) {
      spaceComplexity = 'O(n)';
    }
    
    analysis.push({
      label: 'Space Complexity',
      value: spaceComplexity,
      level: this.getComplexityLevel(spaceComplexity)
    });
    
    // Cyclomatic complexity
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(code);
    analysis.push({
      label: 'Cyclomatic Complexity',
      value: cyclomaticComplexity.toString(),
      level: cyclomaticComplexity <= 5 ? 'low' : cyclomaticComplexity <= 10 ? 'medium' : 'high'
    });
    
    return analysis;
  }

  getComplexityLevel(complexity) {
    if (complexity.includes('O(1)') || complexity.includes('O(log n)')) {
      return 'low';
    } else if (complexity.includes('O(n)') || complexity.includes('O(n log n)')) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  calculateCyclomaticComplexity(code) {
    let complexity = 1; // Base complexity
    
    // Count decision points
    const decisionKeywords = ['if', 'else if', 'while', 'for', 'case', 'catch', '&&', '||'];
    decisionKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }

  displayComplexityAnalysis(analysis) {
    let html = '';
    analysis.forEach(item => {
      html += `
        <div class="complexity-item">
          <div class="complexity-label">${item.label}</div>
          <div class="complexity-value complexity-${item.level}">${item.value}</div>
        </div>
      `;
    });
    
    this.complexityTab.innerHTML = html;
  }

  async findIssues() {
    const code = this.codeInput.value.trim();
    if (!code) {
      alert('Please enter some code to analyze');
      return;
    }

    this.setLoading(this.findIssuesBtn, true);
    
    try {
      const issues = await this.generateIssuesAnalysis(code);
      this.displayIssues(issues);
      this.generateSuggestions(code);
      this.switchTab('issues');
    } catch (error) {
      console.error('Error finding issues:', error);
      alert('Failed to find issues. Please try again.');
    } finally {
      this.setLoading(this.findIssuesBtn, false);
    }
  }

  async generateIssuesAnalysis(code) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const issues = this.analyzeCodeIssues(code);
        resolve(issues);
      }, 1000);
    });
  }

  analyzeCodeIssues(code) {
    const issues = [];
    const lines = code.split('\n');
    
    lines.forEach((line, index) => {
      const lineNumber = index + 1;
      const trimmedLine = line.trim();
      
      // Check for common issues
      if (trimmedLine.includes('var ')) {
        issues.push({
          severity: 'warning',
          message: 'Consider using "let" or "const" instead of "var" for better scoping',
          line: lineNumber
        });
      }
      
      if (trimmedLine.includes('==') && !trimmedLine.includes('===')) {
        issues.push({
          severity: 'warning',
          message: 'Consider using strict equality (===) instead of loose equality (==)',
          line: lineNumber
        });
      }
      
      if (trimmedLine.length > 100) {
        issues.push({
          severity: 'info',
          message: 'Line is too long, consider breaking it into multiple lines',
          line: lineNumber
        });
      }
      
      if (trimmedLine.includes('TODO') || trimmedLine.includes('FIXME')) {
        issues.push({
          severity: 'info',
          message: 'TODO/FIXME comment found - remember to address this',
          line: lineNumber
        });
      }
      
      if (trimmedLine.includes('console.log') && !trimmedLine.includes('//')) {
        issues.push({
          severity: 'info',
          message: 'Debug console.log statement found - consider removing for production',
          line: lineNumber
        });
      }
    });
    
    return issues;
  }

  displayIssues(issues) {
    if (issues.length === 0) {
      this.issuesTab.innerHTML = `
        <div class="no-analysis">
          <span class="material-symbols-outlined">check_circle</span>
          <p>No issues found in your code!</p>
        </div>
      `;
      return;
    }
    
    let html = '';
    issues.forEach(issue => {
      html += `
        <div class="issue-item">
          <div class="issue-severity ${issue.severity}">${issue.severity.toUpperCase()}</div>
          <div class="issue-message">${issue.message}</div>
          <div class="issue-line">Line ${issue.line}</div>
        </div>
      `;
    });
    
    this.issuesTab.innerHTML = html;
  }

  generateSuggestions(code) {
    const suggestions = [];
    
    if (code.includes('for') && code.includes('array')) {
      suggestions.push({
        title: 'Consider Array Methods',
        description: 'You might be able to use array methods like map(), filter(), or reduce() for more functional programming approach.'
      });
    }
    
    if (code.includes('if') && code.includes('else if')) {
      suggestions.push({
        title: 'Switch Statement',
        description: 'Consider using a switch statement if you have multiple conditions checking the same variable.'
      });
    }
    
    if (code.includes('function') && !code.includes('return')) {
      suggestions.push({
        title: 'Return Values',
        description: 'Consider returning values from your functions to make them more reusable and testable.'
      });
    }
    
    if (!code.includes('//') && !code.includes('/*')) {
      suggestions.push({
        title: 'Add Comments',
        description: 'Adding comments to explain complex logic will make your code more maintainable.'
      });
    }
    
    suggestions.push({
      title: 'Error Handling',
      description: 'Consider adding try-catch blocks or input validation to handle potential errors gracefully.'
    });
    
    let html = '';
    suggestions.forEach(suggestion => {
      html += `
        <div class="suggestion-item">
          <div class="suggestion-title">${suggestion.title}</div>
          <div class="suggestion-description">${suggestion.description}</div>
        </div>
      `;
    });
    
    this.suggestionsTab.innerHTML = html;
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

  exportExplanation() {
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

  async loadSavedExplanations() {
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
      
      // Add click handlers for saved explanations
      this.savedExplanationsGrid.querySelectorAll('.saved-explanation-card').forEach(card => {
        card.addEventListener('click', () => this.loadSavedExplanation(card.dataset.id));
      });
      
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

  async loadSavedExplanation(explanationId) {
    try {
      const doc = await db.collection('code_explanations').doc(explanationId).get();
      if (doc.exists) {
        const data = doc.data();
        this.codeInput.value = data.code;
        this.languageSelect.value = data.language;
        this.updateLineNumbers();
        
        if (data.explanation) {
          this.displayExplanation(data.explanation);
          this.generateLineBreakdown(data.code);
          
          this.currentExplanation = {
            code: data.code,
            language: data.language,
            explanation: data.explanation,
            timestamp: data.timestamp ? data.timestamp.toDate() : new Date()
          };
          
          this.saveExplanationBtn.disabled = false;
          this.exportExplanationBtn.disabled = false;
        }
      }
    } catch (error) {
      console.error('Error loading saved explanation:', error);
      alert('Failed to load saved explanation');
    }
  }

  setLoading(button, isLoading) {
    if (isLoading) {
      button.classList.add('loading');
      button.disabled = true;
    } else {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the code explainer when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new CodeExplainer();
});