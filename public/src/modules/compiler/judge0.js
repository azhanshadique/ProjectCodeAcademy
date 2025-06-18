// Judge0 API Integration

// API Configuration
const JUDGE0_API_CONFIG = {
  host: 'judge0-ce.p.rapidapi.com',
  key: '43c9203bb9msh5b7929b546b2220p1e0216jsn2f65f906b0cb'
};

// Function to execute code using Judge0 API
export function executeCodeUsingJudge0(code, languageId, input, callback) {
  // Create payload for Judge0 API
  const payload = {
    source_code: code,
    language_id: languageId,
    stdin: input
  };
  
  // Send to Judge0 API
  fetch('https://judge0-ce.p.rapidapi.com/submissions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Host': JUDGE0_API_CONFIG.host,
      'X-RapidAPI-Key': JUDGE0_API_CONFIG.key
    },
    body: JSON.stringify(payload)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (!data || !data.token) {
      throw new Error('Invalid response from Judge0 API: No submission token received');
    }
    
    const token = data.token;
    
    // Check submission status after a short delay
    setTimeout(() => {
      checkSubmissionStatus(token, callback);
    }, 2000);
  })
  .catch(error => {
    console.error('Error executing code:', error);
    callback({
      success: false,
      error: 'Error executing code: ' + error.message
    });
  });
}

// Function to check submission status
function checkSubmissionStatus(token, callback) {
  fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`, {
    method: 'GET',
    headers: {
      'X-RapidAPI-Host': JUDGE0_API_CONFIG.host,
      'X-RapidAPI-Key': JUDGE0_API_CONFIG.key
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    if (!data || !data.status) {
      throw new Error('Invalid response from Judge0 API: No status received');
    }
    
    if (data.status.id <= 2) {
      // Status is in queue or processing, check again
      setTimeout(() => {
        checkSubmissionStatus(token, callback);
      }, 1000);
      return;
    }
    
    // Process execution result
    const result = processExecutionResult(data);
    callback(result);
  })
  .catch(error => {
    console.error('Error checking submission:', error);
    callback({
      success: false,
      error: 'Error checking submission: ' + error.message
    });
  });
}

// Function to process execution result
function processExecutionResult(data) {
  if (!data || !data.status) {
    return {
      success: false,
      error: 'Invalid execution result received'
    };
  }

  const result = {
    success: data.status.id === 3, // Accepted
    status: data.status,
    stdout: data.stdout || '',
    stderr: data.stderr || '',
    compile_output: data.compile_output || '',
    time: data.time,
    memory: data.memory
  };
  
  if (data.status.id === 3) {
    // Accepted
    result.output = data.stdout || 'Program executed successfully with no output.';
  } else if (data.status.id === 4) {
    // Wrong Answer
    result.error = data.stdout || 'Program executed, but produced wrong answer.';
  } else if (data.status.id === 5) {
    // Time Limit Exceeded
    result.error = 'Time limit exceeded.';
  } else if (data.status.id === 6) {
    // Compilation Error
    result.error = 'Compilation Error:\n' + (data.compile_output || 'Unknown compilation error.');
  } else if (data.status.id >= 7 && data.status.id <= 12) {
    // Runtime Error
    result.error = 'Runtime Error:\n' + (data.stderr || 'Unknown runtime error.');
  } else {
    // Other error
    result.error = `Error: ${data.status.description}\n${data.stderr || ''}`;
  }
  
  return result;
}

// Language IDs for Judge0 API
export const judge0LanguageIds = {
  c: 50,        // C (GCC 9.2.0)
  cpp: 54,      // C++ (GCC 9.2.0)
  java: 62,     // Java (OpenJDK 13.0.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  python: 71    // Python (3.8.1)
};

// Default code templates for different languages
export const codeTemplates = {
  c: '#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}',
  cpp: '#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  javascript: '// Welcome to the CodeAcademy Code Editor\n// Start writing your JavaScript code here\n\nfunction greet(name) {\n    return `Hello, ${name}!`;\n}\n\nconsole.log(greet("Coder"));',
  python: '# Welcome to the CodeAcademy Code Editor\n# Start writing your Python code here\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Coder"))'
};