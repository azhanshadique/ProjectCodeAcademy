/*
  Dynamic Real-World Challenges
  - Fetch challenge list from OpenAI (JSON)
  - Render in existing HTML structure
  - Run submitted code via Judge0
  - No hardcoded challenges
*/

const API_KEYS = {
  openai: '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',
  judge0: '43c9203bb9msh5b7929b546b2220p1e0216jsn2f65f906b0cb'
};

// Selectors matching original HTML structure
const challengesGrid = document.getElementById('challengesGrid');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const challengeModal = document.getElementById('challengeModal');
const closeModalBtn = document.getElementById('closeModal');
const challengeTitle = document.getElementById('challengeTitle');
const challengeDifficulty = document.getElementById('challengeDifficulty');
const challengeCategory = document.getElementById('challengeCategory');
const challengeDescription = document.getElementById('challengeDescription');
const challengeRequirements = document.getElementById('challengeRequirements');
const challengeExamples = document.getElementById('challengeExamples');
const challengeHints = document.getElementById('challengeHints');
const startChallengeBtn = document.getElementById('startChallenge');
const solutionModal = document.getElementById('solutionModal');
const closeSolutionBtn = document.getElementById('closeSolutionModal');
const solutionContent = document.getElementById('solutionContent');

// Global state
let challenges = [];
let visibleCount = 6;

// Fetch challenges from OpenAI
async function fetchChallenges() {
  const prompt = `
Generate a JSON array of at least 12 coding challenges. Each should include:
- "id": unique number
- "title": concise title
- "difficulty": one of "Beginner", "Intermediate", "Advanced"
- "category": one of "Web Development", "Data Structures", "Algorithms", "System Design", "Data Science"
- "description": a short description of the real-world problem
- "requirements": array of likely requirements or tasks
- "examples": array of example code snippets or scenarios
- "hints": array of hints
Return ONLY valid JSON.
`;
  let text = '';
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':'application/json',
        'Authorization': `Bearer ${API_KEYS.openai}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role:'user', content: prompt }]
      })
    });
    if (!response.ok) throw new Error(response.statusText);
    const data = await response.json();
    text = data.choices?.[0]?.message?.content || '';
  } catch (e) {
    console.error('OpenAI fetch error', e);
    return;
  }

  // 1) Remove Markdown code fences
  text = text.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();

  // 2) Extract the JSON array substring
  const match = text.match(/\[.*\]/s);
  if (!match) {
    console.error('No JSON array found in response');
    return;
  }
  const jsonStr = match[0];

  // 3) Parse it safely
  try {
    challenges = JSON.parse(jsonStr);
  } catch (e) {
    console.error('JSON parse error', e);
  }
}


// Render challenges in grid
function renderGrid() {
  challengesGrid.innerHTML = '';
  challenges.slice(0, visibleCount).forEach(ch => {
    const card = document.createElement('div');
    card.className = 'challenge-card';
    card.innerHTML = `
      <h3>${ch.title}</h3>
      <p>${ch.difficulty} | ${ch.category}</p>
    `;
    card.addEventListener('click', () => openModal(ch));
    challengesGrid.appendChild(card);
  });
  // loadMoreBtn.style.display = visibleCount < challenges.length ? 'block' : 'none';
}

// Open modal
function openModal(ch) {
  challengeTitle.textContent = ch.title;
  challengeDifficulty.textContent = ch.difficulty;
  challengeCategory.textContent = ch.category;
  challengeDescription.textContent = ch.description;
  challengeRequirements.innerHTML = ch.requirements.map(req => `<li>${req}</li>`).join('');
  challengeExamples.innerHTML = ch.examples.map(ex => `<pre>${ex}</pre>`).join('');
  challengeHints.innerHTML = ch.hints.map(h => `<li>${h}</li>`).join('');
  challengeModal.classList.add('open');
}

// Close modal
closeModalBtn.addEventListener('click', () => challengeModal.classList.remove('open'));
closeSolutionBtn.addEventListener('click', () => solutionModal.classList.remove('open'));

// Load more
loadMoreBtn.addEventListener('click', async () => {
  // visibleCount += 6;
  await fetchChallenges();
  renderGrid();
});

// On start
document.addEventListener('DOMContentLoaded', async () => {
  await fetchChallenges();
  renderGrid();
});
