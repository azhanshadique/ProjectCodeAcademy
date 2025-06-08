import { firebaseConfig } from "/src/scripts/init.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

class VisualDebugger {
  constructor() {
    this.code = '';
    this.lines = [];
    this.currentLine = 0;
    this.variables = new Map();
    this.callStack = [];
    this.heapMemory = new Map();
    this.output = [];
    this.isExecuting = false;
    this.executionHistory = [];
    this.currentStep = 0;
    
    this.initializeElements();
    this.bindEvents();
    this.loadExampleCode();
  }

  initializeElements() {
    this.codeInput = document.getElementById('codeInput');
    this.lineNumbers = document.getElementById('lineNumbers');
    this.languageSelect = document.getElementById('languageSelect');
    this.startBtn = document.getElementById('startExecution');
    this.stepBtn = document.getElementById('stepForward');
    this.backBtn = document.getElementById('stepBack');
    this.resetBtn = document.getElementById('resetExecution');
    this.loadExampleBtn = document.getElementById('loadExample');
    this.currentLineNumber = document.getElementById('currentLineNumber');
    this.speedSlider = document.getElementById('speedSlider');
    this.speedValue = document.getElementById('speedValue');
    this.variablesContainer = document.getElementById('variablesContainer');
    this.callStackContainer = document.getElementById('callStack');
    this.heapContainer = document.getElementById('heapMemory');
    this.outputContainer = document.getElementById('outputContainer');
    this.clearVariablesBtn = document.getElementById('clearVariables');
    this.clearOutputBtn = document.getElementById('clearOutput');
  }

  bindEvents() {
    this.codeInput.addEventListener('input', () => this.updateLineNumbers());
    this.codeInput.addEventListener('scroll', () => this.syncLineNumbers());
    
    this.startBtn.addEventListener('click', () => this.startExecution());
    this.stepBtn.addEventListener('click', () => this.stepForward());
    this.backBtn.addEventListener('click', () => this.stepBack());
    this.resetBtn.addEventListener('click', () => this.resetExecution());
    this.loadExampleBtn.addEventListener('click', () => this.loadExampleCode());
    
    this.speedSlider.addEventListener('input', (e) => {
      this.speedValue.textContent = e.target.value;
    });
    
    this.clearVariablesBtn.addEventListener('click', () => this.clearVariables());
    this.clearOutputBtn.addEventListener('click', () => this.clearOutput());
    
    this.languageSelect.addEventListener('change', () => this.loadExampleCode());
  }

  updateLineNumbers() {
    const lines = this.codeInput.value.split('\n');
    const lineNumbersHtml = lines.map((_, index) => 
      `<div class="line-number" data-line="${index + 1}">${index + 1}</div>`
    ).join('');
    this.lineNumbers.innerHTML = lineNumbersHtml;
  }

  syncLineNumbers() {
    this.lineNumbers.scrollTop = this.codeInput.scrollTop;
  }

  loadExampleCode() {
    const language = this.languageSelect.value;
    const examples = {
      javascript: `// Bubble Sort Example
function bubbleSort(arr) {
  let n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}

let numbers = [64, 34, 25, 12, 22, 11, 90];
console.log("Original array:", numbers);
let sorted = bubbleSort(numbers);
console.log("Sorted array:", sorted);`,
      
      python: `# Fibonacci Sequence
def fibonacci(n):
    if n <= 1:
        return n
    else:
        return fibonacci(n-1) + fibonacci(n-2)

# Calculate first 10 Fibonacci numbers
for i in range(10):
    result = fibonacci(i)
    print(f"F({i}) = {result}")`,
    
      java: `// Binary Search Example
public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int left = 0;
        int right = arr.length - 1;
        
        while (left <= right) {
            int mid = left + (right - left) / 2;
            
            if (arr[mid] == target) {
                return mid;
            }
            
            if (arr[mid] < target) {
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        
        return -1;
    }
    
    public static void main(String[] args) {
        int[] numbers = {2, 3, 4, 10, 40};
        int target = 10;
        int result = binarySearch(numbers, target);
        System.out.println("Element found at index: " + result);
    }
}`
    };

    this.codeInput.value = examples[language] || examples.javascript;
    this.updateLineNumbers();
    this.resetExecution();
  }

  startExecution() {
    this.code = this.codeInput.value;
    this.lines = this.code.split('\n');
    this.currentLine = 0;
    this.executionHistory = [];
    this.currentStep = 0;
    
    this.isExecuting = true;
    this.updateControlButtons();
    
    // Simulate parsing and execution preparation
    this.parseCode();
    this.highlightCurrentLine();
    this.saveExecutionState();
  }

  parseCode() {
    // Simple parsing for demonstration
    // In a real implementation, this would use a proper parser
    this.variables.clear();
    this.callStack = [];
    this.heapMemory.clear();
    this.output = [];
    
    // Add main function to call stack
    this.callStack.push({
      name: 'main',
      line: 1,
      variables: new Map()
    });
    
    this.updateDisplays();
  }

  stepForward() {
    if (this.currentLine < this.lines.length) {
      this.executeCurrentLine();
      this.currentLine++;
      this.currentStep++;
      this.highlightCurrentLine();
      this.saveExecutionState();
      this.updateDisplays();
    }
    
    if (this.currentLine >= this.lines.length) {
      this.completeExecution();
    }
  }

  stepBack() {
    if (this.currentStep > 0) {
      this.currentStep--;
      this.restoreExecutionState(this.currentStep);
      this.updateDisplays();
    }
  }

  executeCurrentLine() {
    const line = this.lines[this.currentLine].trim();
    
    if (!line || line.startsWith('//') || line.startsWith('#')) {
      return; // Skip empty lines and comments
    }
    
    // Simulate variable assignments and operations
    this.simulateLineExecution(line);
  }

  simulateLineExecution(line) {
    // Simple simulation for demonstration
    // Variable declaration/assignment
    if (line.includes('=') && !line.includes('==') && !line.includes('!=')) {
      const parts = line.split('=');
      if (parts.length === 2) {
        const varName = parts[0].trim().replace(/let |const |var |int |String /, '');
        const value = parts[1].trim().replace(/;/, '');
        
        // Simulate different data types
        let parsedValue = value;
        if (value.includes('[') && value.includes(']')) {
          parsedValue = `Array: ${value}`;
        } else if (!isNaN(value)) {
          parsedValue = `Number: ${value}`;
        } else if (value.includes('"') || value.includes("'")) {
          parsedValue = `String: ${value}`;
        }
        
        this.variables.set(varName, {
          value: parsedValue,
          type: this.getVariableType(value),
          line: this.currentLine + 1
        });
      }
    }
    
    // Function calls
    if (line.includes('console.log') || line.includes('print') || line.includes('System.out.println')) {
      const output = this.extractOutputValue(line);
      this.output.push({
        line: this.currentLine + 1,
        value: output,
        timestamp: new Date().toLocaleTimeString()
      });
    }
    
    // Loop detection
    if (line.includes('for') || line.includes('while')) {
      this.callStack.push({
        name: `Loop (line ${this.currentLine + 1})`,
        line: this.currentLine + 1,
        variables: new Map()
      });
    }
    
    // Function definition
    if (line.includes('function') || line.includes('def ') || line.includes('public static')) {
      const funcName = this.extractFunctionName(line);
      this.callStack.push({
        name: funcName,
        line: this.currentLine + 1,
        variables: new Map()
      });
    }
  }

  getVariableType(value) {
    if (value.includes('[') && value.includes(']')) return 'Array';
    if (value.includes('{') && value.includes('}')) return 'Object';
    if (!isNaN(value)) return 'Number';
    if (value.includes('"') || value.includes("'")) return 'String';
    if (value === 'true' || value === 'false') return 'Boolean';
    return 'Unknown';
  }

  extractOutputValue(line) {
    const match = line.match(/["'`]([^"'`]*)["'`]/) || line.match(/\(([^)]*)\)/);
    return match ? match[1] : 'Output';
  }

  extractFunctionName(line) {
    if (line.includes('function')) {
      const match = line.match(/function\s+(\w+)/);
      return match ? match[1] : 'Anonymous Function';
    }
    if (line.includes('def ')) {
      const match = line.match(/def\s+(\w+)/);
      return match ? match[1] : 'Python Function';
    }
    if (line.includes('public static')) {
      const match = line.match(/public static.*?(\w+)\s*\(/);
      return match ? match[1] : 'Java Method';
    }
    return 'Function';
  }

  highlightCurrentLine() {
    // Remove previous highlights
    const lineNumbers = this.lineNumbers.querySelectorAll('.line-number');
    lineNumbers.forEach(ln => ln.classList.remove('line-highlight'));
    
    // Highlight current line
    if (this.currentLine < lineNumbers.length) {
      lineNumbers[this.currentLine].classList.add('line-highlight');
    }
    
    this.currentLineNumber.textContent = this.currentLine + 1;
  }

  saveExecutionState() {
    this.executionHistory[this.currentStep] = {
      currentLine: this.currentLine,
      variables: new Map(this.variables),
      callStack: [...this.callStack],
      heapMemory: new Map(this.heapMemory),
      output: [...this.output]
    };
  }

  restoreExecutionState(step) {
    const state = this.executionHistory[step];
    if (state) {
      this.currentLine = state.currentLine;
      this.variables = new Map(state.variables);
      this.callStack = [...state.callStack];
      this.heapMemory = new Map(state.heapMemory);
      this.output = [...state.output];
      this.highlightCurrentLine();
    }
  }

  updateDisplays() {
    this.updateVariablesDisplay();
    this.updateCallStackDisplay();
    this.updateHeapDisplay();
    this.updateOutputDisplay();
  }

  updateVariablesDisplay() {
    if (this.variables.size === 0) {
      this.variablesContainer.innerHTML = '<div class="no-variables">No variables to display</div>';
      return;
    }
    
    let html = '';
    this.variables.forEach((variable, name) => {
      html += `
        <div class="variable-item">
          <div class="variable-name">${name}<span class="variable-type">(${variable.type})</span></div>
          <div class="variable-value">${variable.value}</div>
        </div>
      `;
    });
    
    this.variablesContainer.innerHTML = html;
  }

  updateCallStackDisplay() {
    if (this.callStack.length === 0) {
      this.callStackContainer.innerHTML = '<div class="no-variables">Empty call stack</div>';
      return;
    }
    
    let html = '';
    this.callStack.forEach((frame, index) => {
      html += `
        <div class="stack-frame">
          ${frame.name} (line ${frame.line})
        </div>
      `;
    });
    
    this.callStackContainer.innerHTML = html;
  }

  updateHeapDisplay() {
    if (this.heapMemory.size === 0) {
      this.heapContainer.innerHTML = '<div class="no-variables">No heap objects</div>';
      return;
    }
    
    let html = '';
    this.heapMemory.forEach((obj, id) => {
      html += `
        <div class="heap-object">
          Object ${id}: ${obj.type}
        </div>
      `;
    });
    
    this.heapContainer.innerHTML = html;
  }

  updateOutputDisplay() {
    if (this.output.length === 0) {
      this.outputContainer.innerHTML = '<div class="no-output">No output yet</div>';
      return;
    }
    
    let html = '';
    this.output.forEach(output => {
      html += `
        <div class="output-line">
          [Line ${output.line}] ${output.value} <span style="color: var(--gray); font-size: 0.8em;">(${output.timestamp})</span>
        </div>
      `;
    });
    
    this.outputContainer.innerHTML = html;
  }

  resetExecution() {
    this.isExecuting = false;
    this.currentLine = 0;
    this.currentStep = 0;
    this.variables.clear();
    this.callStack = [];
    this.heapMemory.clear();
    this.output = [];
    this.executionHistory = [];
    
    // Remove line highlights
    const lineNumbers = this.lineNumbers.querySelectorAll('.line-number');
    lineNumbers.forEach(ln => ln.classList.remove('line-highlight'));
    
    this.currentLineNumber.textContent = '-';
    this.updateControlButtons();
    this.updateDisplays();
  }

  completeExecution() {
    this.isExecuting = false;
    this.updateControlButtons();
    
    // Save execution session to Firebase if user is authenticated
    this.saveExecutionSession();
  }

  updateControlButtons() {
    this.startBtn.disabled = this.isExecuting;
    this.stepBtn.disabled = !this.isExecuting || this.currentLine >= this.lines.length;
    this.backBtn.disabled = !this.isExecuting || this.currentStep === 0;
    this.resetBtn.disabled = !this.isExecuting && this.currentLine === 0;
  }

  clearVariables() {
    this.variables.clear();
    this.updateVariablesDisplay();
  }

  clearOutput() {
    this.output = [];
    this.updateOutputDisplay();
  }

  async saveExecutionSession() {
    const user = firebase.auth().currentUser;
    if (!user) return;
    
    try {
      await db.collection('debugger_sessions').add({
        userId: user.uid,
        code: this.code,
        language: this.languageSelect.value,
        totalSteps: this.currentStep,
        variablesUsed: Array.from(this.variables.keys()),
        outputLines: this.output.length,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      console.log('Execution session saved successfully');
    } catch (error) {
      console.error('Error saving execution session:', error);
    }
  }
}

// Initialize the debugger when the page loads
document.addEventListener('DOMContentLoaded', () => {
  new VisualDebugger();
});