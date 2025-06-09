// const JUDGE0_BASE_URL = 'http://192.168.138.7:2358';
const JUDGE0_BASE_URL = 'http://192.168.187.7:2358';


// Outer horizontal split (left and right)
Split(['#split-0', '#split-1'], {
  sizes: [50, 50],
  minSize: 200,
  gutterSize: 6,
  direction: 'horizontal',
});

// Inner vertical split inside the right panel
Split(['#split-1-top', '#split-1-bottom'], {
  sizes: [50, 50],
  minSize: 100,
  gutterSize: 6,
  direction: 'vertical',
});

// Fullscreen toggle logic
let isFullScreen = false;

const fullscreenBtn = document.getElementById('fullscreen-btn');
const fullscreenIcon = document.getElementById('fullscreen-icon');

fullscreenBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    isFullScreen = true;
    fullscreenIcon.textContent = '🗗'; // exit icon
  } else {
    document.exitFullscreen();
    isFullScreen = false;
    fullscreenIcon.textContent = '🖵'; // fullscreen icon
  }
});

document.addEventListener('fullscreenchange', () => {
  isFullScreen = !!document.fullscreenElement;
  fullscreenIcon.textContent = isFullScreen ? '🗗' : '🖵';
});

const testcaseButtons = document.querySelectorAll('.testcase-button');
const exampleCards = document.querySelectorAll('.example-card[data-case]');

// Show case 1 by default on page load
exampleCards.forEach(card => {
  if (card.getAttribute('data-case') === '1') {
    card.classList.remove('hidden');
  } else {
    card.classList.add('hidden');
  }
});

testcaseButtons.forEach(button => {
  button.addEventListener('click', () => {
    const selectedCase = button.getAttribute('data-case');
    
    exampleCards.forEach(card => {
      if (card.getAttribute('data-case') === selectedCase) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

const submitBtn = document.getElementById('submit-btn');
const outputDiv = document.getElementById('output');

// Define simple testcases
const testcases = [
  {
    input: "1 2 3 4",
    expected: "4 3 2 1"
  },
  {
    input: "2 7 10 9 8",
    expected: "8 9 10 7 2"
  }
  //ADD MORE TEST CASE HERE
];

submitBtn.addEventListener('click', async () => {
  const sourceCode = x + document.getElementById('code-editor').value.trim() + y;
  console.log(sourceCode);
  const languageId = document.getElementById('language-select').value;

  if (!sourceCode) {
    outputDiv.innerHTML = '<span style="color: red;">Please enter some code before submitting.</span>';
    return;
  }

  outputDiv.innerHTML = 'Running testcases...\n\n';

  for (let i = 0; i < testcases.length; i++) {
    const { input, expected } = testcases[i];
    outputDiv.innerHTML += `🔹 Testcase ${i + 1}:\nInput: ${input}\n`;

    const requestBody = {
      source_code: sourceCode,
      language_id: Number(languageId),
      stdin: input
    };

    try {
      const res = await fetch(`${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`, {
  	method: 'POST',
  	headers: { 'Content-Type': 'application/json' },
  	body: JSON.stringify(requestBody),
      });

      const data = await res.json();
      const actualOutput = (data.stdout || data.stderr || '').trim();

      if (actualOutput === expected.trim()) {
        outputDiv.innerHTML += `✅ Passed\n\n`;
      } else {
        outputDiv.innerHTML += `❌ Failed\nExpected: ${expected}\nGot: ${actualOutput}\n\n`;
      }

    } catch (err) {
      outputDiv.innerHTML += `❌ Error: Could not connect to Judge0\n\n`;
      console.error(err);
    }
  }
});

const javaFirst = `import java.util.*;

class Node {
    int val;
    Node next;
    Node(int val) {
        this.val = val;
    }
}

public class Main {
    static Node buildLinkedList(List<Integer> vals) {
        if (vals.isEmpty()) return null;
        Node head = new Node(vals.get(0));
        Node current = head;
        for (int i = 1; i < vals.size(); i++) {
            current.next = new Node(vals.get(i));
            current = current.next;
        }
        return head;
    }

    static void printLinkedList(Node head) {
        while (head != null) {
            System.out.print(head.val + " ");
            head = head.next;
        }
    }`;

const javaLast = `public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Integer> vals = new ArrayList<>();
        while (sc.hasNextInt()) {
            vals.add(sc.nextInt());
        }
        Node head = buildLinkedList(vals);
        head = reverseLinkedList(head);
        printLinkedList(head);
    }
}`;
const boilerplates = {
  63: `class Node {
    constructor(val) {
        this.val = val;
        this.next = null;
    }
}


function reverseLinkedList(head) {
    
   // YOUR CODE HERE
    
}

function buildLinkedList(vals) {
    if (vals.length === 0) return null;
    let head = new Node(vals[0]);
    let current = head;
    for (let i = 1; i < vals.length; i++) {
        current.next = new Node(vals[i]);
        current = current.next;
    }
    return head;
}

function printLinkedList(head) {
    let output = [];
    while (head !== null) {
        output.push(head.val);
        head = head.next;
    }
    console.log(output.join(' '));
}

let input = '';
process.stdin.on('data', chunk => {
    input += chunk;
});

process.stdin.on('end', () => {
    let vals = input.trim().split(/\\s+/).map(Number);
    let head = buildLinkedList(vals);
    head = reverseLinkedList(head);
    printLinkedList(head);
});
`,
  52: `#include <iostream>
#include <vector>
using namespace std;

struct Node {
    int val;
    Node* next;
    Node(int v): val(v), next(nullptr) {}
};

Node* reverseLinkedList(Node* head) {
    
    // YOUR CODE HERE    
}

Node* buildLinkedList(const vector<int>& vals) {
    if (vals.empty()) return nullptr;
    Node* head = new Node(vals[0]);
    Node* current = head;
    for (size_t i = 1; i < vals.size(); ++i) {
        current->next = new Node(vals[i]);
        current = current->next;
    }
    return head;
}

void printLinkedList(Node* head) {
    while (head != nullptr) {
        cout << head->val << " ";
        head = head->next;
    }
}

int main() {
    vector<int> vals;
    int x;
    while (cin >> x) {
        vals.push_back(x);
    }
    Node* head = buildLinkedList(vals);
    head = reverseLinkedList(head);
    printLinkedList(head);
    return 0;
}
`,
  54: `#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int val;
    struct Node* next;
} Node;

Node* reverseLinkedList(Node* head) {
   
   // YOUR CODE HERE
   
}

Node* buildLinkedList(int* vals, int size) {
    if (size == 0) return NULL;
    Node* head = malloc(sizeof(Node));
    head->val = vals[0];
    head->next = NULL;
    Node* current = head;
    for (int i = 1; i < size; i++) {
        Node* newNode = malloc(sizeof(Node));
        newNode->val = vals[i];
        newNode->next = NULL;
        current->next = newNode;
        current = newNode;
    }
    return head;
}

void printLinkedList(Node* head) {
    Node* current = head;
    while (current != NULL) {
        printf("%d ", current->val);
        current = current->next;
    }
}

int main() {
    int vals[105], n = 0;
    while (scanf("%d", &vals[n]) == 1) {
        n++;
    }
    Node* head = buildLinkedList(vals, n);
    head = reverseLinkedList(head);
    printLinkedList(head);
    return 0;
}
`,
  62: `
    static Node reverseLinkedList(Node head) {
        // YOUR CODE HERE
    }
`,
  71: `import sys

class Node:
    def __init__(self, val):
        self.val = val
        self.next = None

def reverseLinkedList(head):
    # YOUR CODE HERE
    
def build_linked_list(vals):
    if not vals:
        return None
    head = Node(vals[0])
    current = head
    for val in vals[1:]:
        current.next = Node(val)
        current = current.next
    return head

def print_linked_list(head):
    output = []
    while head:
        output.append(str(head.val))
        head = head.next
    print(" ".join(output))

vals = list(map(int, sys.stdin.read().strip().split()))
head = build_linked_list(vals)
head = reverseLinkedList(head)
print_linked_list(head)
`,
};


const languageSelect = document.getElementById('language-select');
const codeEditor = document.getElementById('code-editor');

languageSelect.addEventListener('change', () => {
  const langId = languageSelect.value;
  if (boilerplates[langId]) {
    codeEditor.value = boilerplates[langId];

    // Move cursor inside the placeholder comment to user code area
    const placeholder = 'Write your reverseLinkedList function here';
    const pos = codeEditor.value.indexOf(placeholder);
    if (pos !== -1) {
      const cursorPos = pos + placeholder.length + 1;
      codeEditor.focus();
      codeEditor.setSelectionRange(cursorPos, cursorPos);
    }
  } else {
    codeEditor.value = ''; // clear if no boilerplate
  }
});


// --- Add Tab key handler here ---
codeEditor.addEventListener('keydown', function(e) {
  if (e.key === 'Tab') {
    e.preventDefault();

    const start = this.selectionStart;
    const end = this.selectionEnd;

    // Insert 2 spaces or '\t' for actual tab
    const tab = '    ';

    this.value = this.value.substring(0, start) + tab + this.value.substring(end);
    this.selectionStart = this.selectionEnd = start + tab.length;
  }
});

// Trigger initial load on page load
languageSelect.dispatchEvent(new Event('change'));


