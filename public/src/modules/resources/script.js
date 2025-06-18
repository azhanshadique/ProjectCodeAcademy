import { firebaseConfig } from "../../scripts/init.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const highlightColor = "#FE320A";
const baseColor = "#333333";

// Toggle Dropdown
window.toggleDropdown = function (id) {
  // now it's global
  const dropdown = document.getElementById(id);
  dropdown.classList.toggle('hidden'); // Toggle hidden class

  // Update the dropdown arrow for the clicked header
  const button = dropdown.previousElementSibling.querySelector('.dropdown-btn');

  // button.textContent = button.textContent === "▶" ? "▼" : "▶";
  button.textContent = button.textContent === "📁" ? "📂" : "📁";

  

  // Fetch problems if the dropdown is opened
  if (!dropdown.classList.contains('hidden') && id === 'lec1-content') {
      fetchProblems('Array', 'lec1-content');

  } else if (!dropdown.classList.contains('hidden') && id === 'lec2-content') {
      fetchProblems('Tree', 'lec2-content');

  } else if (!dropdown.classList.contains('hidden') && id === 'lec3-content') {
    fetchProblems('Linked List', 'lec3-content');
  } else if (!dropdown.classList.contains('hidden') && id === 'lec4-content') {
    fetchProblems('Stack & Queue', 'lec4-content');
  } else if (!dropdown.classList.contains('hidden') && id === 'lec5-content') {
    fetchProblems('Recursion', 'lec5-content');
  } else if (!dropdown.classList.contains('hidden') && id === 'lec6-content') {
    fetchProblems('BST', 'lec6-content');
  } else if (!dropdown.classList.contains('hidden') && id === 'lec7-content') {
    fetchProblems('Greedy Algo', 'lec7-content');
  } else if (!dropdown.classList.contains('hidden') && id === 'lec8-content') {
    fetchProblems('DP', 'lec8-content');
  } else if (!dropdown.classList.contains('hidden') && id === 'lec9-content') {
    fetchProblems('String', 'lec9-content');
  } else if (!dropdown.classList.contains('hidden') && id === 'lec10-content') {
    fetchProblems('Graph', 'lec10-content');
  }
};

// Fetch Problems from Firestore
async function fetchProblems(category, contentId) {
    const container = document.getElementById(contentId);
    container.innerHTML = ''; // Clear previous content
    try {
        const querySnapshot = await db
            .collection('problems')
            .where('category', '==', category)
            .orderBy('order')
            .get();

        const user = firebase.auth().currentUser;
        let solvedProblems = [];

        if (user) {
            // Fetch the solved problems of the logged-in user
            const userDoc = await db.collection('users').doc(user.uid).get();
            solvedProblems = userDoc.exists ? userDoc.data().solvedProblems || [] : [];
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            data.id = doc.id; // Ensure problemData.id is always available
            const topicElement = createTopicElement(data, solvedProblems);
            container.appendChild(topicElement);
        });
    } catch (error) {
        console.error('Error fetching problems:', error);
    }
}
  
// Create Topic Element with Difficulty
function createTopicElement(problemData, solvedProblems) {
    const topic = document.createElement('div');
    topic.classList.add('topic');
    // topic.style.position = "relative";
    const user = firebase.auth().currentUser;

    // Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `topic-${problemData.id}`;
    checkbox.checked = solvedProblems.includes(problemData.id); // Mark if solved
    checkbox.disabled = !user; // Disable if no user is logged in
    
    checkbox.addEventListener('change', async (event) => {
        if (!user) {
            alert('You must be logged in to track progress.');
            return;
        }
        const userId = user.uid;
        const userDocRef = db.collection('users').doc(userId);

        try {
            if (!problemData.id) {
                console.error('Problem ID is undefined.');
                alert('Error: Problem ID is missing.');
                return;
            }

            if (event.target.checked) {
              await userDocRef.set({
                  solvedProblems: firebase.firestore.FieldValue.arrayUnion(problemData.id),
              }, { merge: true });
          } else {
              await userDocRef.set({
                  solvedProblems: firebase.firestore.FieldValue.arrayRemove(problemData.id),
              }, { merge: true });
          }
          
        } catch (error) {
            console.error('Error updating solved problems:', error);
        }
    });

    topic.appendChild(checkbox);

    // Label
    const label = document.createElement('label');
    
    label.htmlFor = `topic-${problemData.id}`;
    label.textContent = problemData.title;
    topic.appendChild(label);

    // Difficulty
    const difficulty = document.createElement('span');
    difficulty.style.textAlign = "center";

    // difficulty.style.cssText = " text-align: center;padding-right: 50px; ";

    difficulty.classList.add('difficulty');
    difficulty.textContent = problemData.difficulty || 'Unknown';
    if (problemData.difficulty === 'Easy') {
        difficulty.style.color = 'green';
    } else if (problemData.difficulty === 'Medium') {
        difficulty.style.color = 'orange';
    } else if (problemData.difficulty === 'Hard') {
        difficulty.style.color = 'red';
    }
    topic.appendChild(difficulty);

    // Links container
    const links = document.createElement('div');
    links.classList.add('links');


    // Practice link
    const practiceLink = document.createElement('a');
    // practiceLink.style = "padding-right: 20px, padding-left: 50px"
    practiceLink.style = `
      padding-left: 50px;
      padding-right: 30px;
      font-size: 16px;
      font-weight: bold;
      font-family: 'Inter';

    `;
    // practiceLink.style.color = "#333333";
    practiceLink.href = problemData.link || '#';
    practiceLink.target = '_blank';
    practiceLink.title = "Practice";
    // practiceLink.textContent = '📝 Practice';
    practiceLink.innerHTML = '<img alt="leetcode" loading="lazy" width="24" height="24" decoding="async" data-nimg="1" class="w-6" src="../../assets/images/leetcode_light.png" style="color: transparent; vertical-align: middle;""></img>';
    practiceLink.textContent = "</>";
    links.appendChild(practiceLink);


    // YouTube search link
    const youtubeLink = document.createElement('a');
    youtubeLink.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(problemData.title)}`;
    youtubeLink.textContent = '▶︎';
    youtubeLink.style = `
      padding-right: 30px;
      font-size: 20px;
      line-height: 1;
      display: inline-block;
    `;
    youtubeLink.title = "Videos";
    // youtubeLink.innerHTML = '<svg width="24" height="20" viewBox="0 0 26 20" fill="none" xmlns="http://www.w3.org/2000/svg alt="YouTube" style="height: 16px; vertical-align: middle;"><path d="M10.4 14.403L17.147 10.3651L10.4 6.3272V14.403ZM25.428 3.86409C25.597 4.49669 25.714 5.34465 25.792 6.42142C25.883 7.49819 25.922 8.4269 25.922 9.23448L26 10.3651C26 13.3127 25.792 15.4797 25.428 16.8661C25.103 18.0774 24.349 18.8581 23.179 19.1946C22.568 19.3696 21.45 19.4907 19.734 19.5715C18.044 19.6657 16.497 19.706 15.067 19.706L13 19.7868C7.553 19.7868 4.16 19.5715 2.821 19.1946C1.651 18.8581 0.897 18.0774 0.572 16.8661C0.403 16.2335 0.286 15.3855 0.208 14.3087C0.117 13.232 0.0779999 12.3033 0.0779999 11.4957L0 10.3651C0 7.41743 0.208 5.25043 0.572 3.86409C0.897 2.65273 1.651 1.87207 2.821 1.53558C3.432 1.36061 4.55 1.23947 6.266 1.15871C7.956 1.0645 9.503 1.02412 10.933 1.02412L13 0.943359C18.447 0.943359 21.84 1.15871 23.179 1.53558C24.349 1.87207 25.103 2.65273 25.428 3.86409Z" fill="#FF0000"></path></svg> ';
    youtubeLink.target = '_blank';
    links.appendChild(youtubeLink);

    
    // Article link
    const articleLink = document.createElement('a');
    articleLink.href = '#';
    articleLink.style = `
      padding-right: 30px;
      font-size: 20px;
      line-height: 1;
      display: inline-block;
      color: #333333;
    `;
    articleLink.title = "Article";
    // articleLink.textContent = '📄';
  
    articleLink.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#00BCD4" viewBox="0 0 256 256" alt="YouTube" style="height: 20px; vertical-align: middle;"><path d="M208,32H48A16,16,0,0,0,32,48V208a16,16,0,0,0,16,16H156.69A15.86,15.86,0,0,0,168,219.31L219.31,168A15.86,15.86,0,0,0,224,156.69V48A16,16,0,0,0,208,32ZM48,48H208V152H160a8,8,0,0,0-8,8v48H48ZM196.69,168,168,196.69V168Z"></path></svg>';
    // articleLink.target = '_blank';
    articleLink.onclick = () => generateArticle(problemData.title);
    links.appendChild(articleLink);
    
    topic.appendChild(links);
    return topic;
}

// Generaate Article
// async function generateArticle(problemTitle) {
//     const apiKey = "AIzaSyCNOwZ57YqeMfoL76lUeCusGWUWnKouQ5w"; // ⚠️ Never expose this in production
//     const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

//     const payload = {
//         contents: [
//             {
//                 role: "user",
//                 parts: [
//                     {
//                         text: `Write an article on the topic: "${problemTitle}". The article should explain the topic in detail and provide examples.`
//                     }
//                 ]
//             }
//         ]
//     };

//     try {
//         const response = await fetch(url, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(payload)
//         });

//         const data = await response.json();

//         if (!response.ok || data.error) {
//             console.error("Gemini API Error:", data);
//             alert(`Gemini API Error: ${data.error?.message || "Unknown error"}`);
//             return;
//         }

//         const article = data.candidates?.[0]?.content?.parts?.[0]?.text;

//         if (article) {
//             // Save article to localStorage and redirect
//             localStorage.setItem("generatedArticle", article);
//             localStorage.setItem("articleTitle", problemTitle);
//             window.location.href = "./article.html"; // ← Make sure this page exists
//         } else {
//             alert("No article could be generated. Please try again later.");
//         }
//     } catch (error) {
//         console.error("Error generating article with Gemini:", error);
//         alert(`Error occurred: ${error.message}`);
//     }
// }
  

async function generateArticle(problemTitle) {
    const loader = document.getElementById('loader');
    loader.style.display = 'flex'; // 👈 Show loader

    const apiKey = "AIzaSyCNOwZ57YqeMfoL76lUeCusGWUWnKouQ5w";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    {
                        text: `Write an article on the topic: "${problemTitle}". The article should explain the topic in detail and provide examples.`
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            console.error("Gemini API Error:", data);
            alert(`Gemini API Error: ${data.error?.message || "Unknown error"}`);
            return;
        }

        const article = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (article) {
            localStorage.setItem("generatedArticle", article);
            localStorage.setItem("articleTitle", problemTitle);
            window.location.href = "./article.html"; // ✅ redirect
        } else {
            alert("No article could be generated. Please try again later.");
        }
    } catch (error) {
        console.error("Error generating article with Gemini:", error);
        alert(`Error occurred: ${error.message}`);
    } finally {
        loader.style.display = 'none'; // 👈 Hide loader if something fails
    }
}


function showSubCourse() {
  if( document.querySelector('.sub-course').style.display == "flex") {

    // Reset all items
    const subCourseItems = document.querySelectorAll('.sub-course-content-list');
    subCourseItems.forEach(el => {
      el.style.color = ""; // Reset color
      el.querySelector('div').style.color = baseColor;
      el.querySelector('.sub-course-folder-icon').style.display = "flex";
      el.querySelector('.sub-course-openfolder-icon').style.display = "none";
      document.querySelectorAll('.dropdown-content').forEach(drop => {
        const button = drop.previousElementSibling?.querySelector('.dropdown-btn');
        if (button) {
          button.textContent = "📁"; // Always reset to collapsed state
        }
      });
    });
  
    document.querySelector('.course-box').style.display = "flex";
    document.querySelector('.resource-title').style.display = "flex";

    document.querySelector('.sub-course').style.display = "none";
    document.querySelector('.course-header-icon').style.color = baseColor;

    document.querySelector('.sub-course-content').style.display = "none";
    document.querySelector('.sub-course-forward-icon').style.display = "flex";
    document.querySelector('.sub-course-downward-icon').style.display = "none";


    document.querySelectorAll('.dropdown-content').forEach(drop =>
        drop.classList.add('hidden'));

  }
  else {
    document.querySelector('.sub-course').style.display = "flex";
    document.querySelector('.course-header-icon').style.color = highlightColor;
  }
  
}
// // const sub_course = document.querySelector('.course-header');
const courseHeader =  document.querySelector('.course-header');
if(courseHeader) courseHeader.addEventListener('click',showSubCourse);

function showSubCourseArrow() {
  
  if( document.querySelector('.sub-course-content').style.display == "flex") {
    document.querySelector('.sub-course-content').style.display = "none";
    document.querySelector('.sub-course-forward-icon').style.display = "flex";
    document.querySelector('.sub-course-downward-icon').style.display = "none";
    // document.querySelector('.sub-course-forward-icon').style.color = baseColor;
    // toggleDropdown('lec1-content');
  }
  else {
    document.querySelector('.sub-course-content').style.display = "flex";
    document.querySelector('.sub-course-forward-icon').style.display = "none";
    document.querySelector('.sub-course-downward-icon').style.display = "flex";
    document.querySelector('.sub-course-downward-icon').style.color = highlightColor;
    
  }

}
// const sub_course_arrow = document.querySelector('.sub-course');
const subCourse =  document.querySelector('.sub-course');
if(subCourse) subCourse.addEventListener('click',showSubCourseArrow);


function courseBox() {
  document.querySelector('.course-box').style.display = "none";
  document.querySelector('.resource-title').style.display = "none";

  document.querySelector('.sub-course').style.display = "flex";
  document.querySelector('.course-header-icon').style.color = highlightColor;
  
  document.querySelector('.sub-course-content').style.display = "flex";
  document.querySelector('.sub-course-forward-icon').style.display = "none";
  document.querySelector('.sub-course-downward-icon').style.display = "flex";
  document.querySelector('.sub-course-downward-icon').style.color = highlightColor;

  document.querySelector('.dropdown-content').classList.toggle('hidden');
}
// const course_box = document.querySelector('.course-box');
document.querySelector('.course-box').addEventListener('click',courseBox);




const map = {
  'Array': 'lec1-content',
  'Tree': 'lec2-content',
  'Linked List': 'lec3-content',
  'Stack': 'lec4-content',
  'Queue': 'lec4-content',
  'Recursion': 'lec5-content',
  'Binary Search Tree': 'lec6-content',
  'Graph': 'lec10-content',
  'Greedy Algorithm': 'lec7-content',
  'Dynamic Programing': 'lec8-content',
  'String': 'lec9-content'
};

const subCourseItems = document.querySelectorAll('.sub-course-content-list');

subCourseItems.forEach(item => {
  item.addEventListener('click', () => {

    const text = item.querySelector('div')?.textContent.trim();
    const id = map[text] || 'lec1-content';

    const isOpen = item.querySelector('.sub-course-openfolder-icon').style.display === "flex";

    if (isOpen) {
      // Collapse item
      toggleDropdown(id);
      item.style.color = baseColor;
      item.querySelector('div').style.color = baseColor;
      item.querySelector('.sub-course-folder-icon').style.display = "flex";
      item.querySelector('.sub-course-openfolder-icon').style.display = "none";
      
      // reset the dropdown button
      const button = document.getElementById(id)?.previousElementSibling?.querySelector('.dropdown-btn');
      if (button) button.textContent = "📁";
      return;
      
    }
    // Reset all items
    // subCourseItems.forEach(el => {
    //   // el.style.color = ""; // Reset color
    //   // el.querySelector('div').style.color = baseColor;
    //   // el.querySelector('.sub-course-folder-icon').style.display = "flex";
    //   // el.querySelector('.sub-course-openfolder-icon').style.display = "none";
    //   document.querySelectorAll('.dropdown-content').forEach(drop => {
    //     drop.classList.add('hidden');
    //     const button = drop.previousElementSibling?.querySelector('.dropdown-btn');
    //     if (button) {
    //       button.textContent = "📁"; // Always reset to collapsed state
    //     }
    //   });
    // });

    document.querySelector('.dropdown-content').classList.add('hidden');
    courseBox();
    toggleDropdown(id);

    item.style.color = highlightColor;
    item.querySelector('div').style.color = highlightColor;
    item.querySelector('.sub-course-folder-icon').style.display = "none";
    item.querySelector('.sub-course-openfolder-icon').style.display = "flex";
 
    // document.querySelector('.course-box').style.display = "none";
    // document.querySelector('.resource-title').style.display = "none";

  });
});


document.querySelectorAll('.lecture-header').forEach(header => {
  header.addEventListener('click', function(e) {
    const lectureTitle = e.currentTarget.querySelector('.lecture-title')?.textContent.trim();
    highlightLeftSidebarFromLecture(lectureTitle);
  });
});

function highlightLeftSidebarFromLecture(title) {
  const subCourseItems = document.querySelectorAll('.sub-course-content-list');

  subCourseItems.forEach(item => {
    const label = item.querySelector('div')?.textContent.trim();
    const folderIcon = item.querySelector('.sub-course-folder-icon');
    const openFolderIcon = item.querySelector('.sub-course-openfolder-icon');
    if (label === title) {
      if(openFolderIcon.style.display == "flex") {
        item.querySelector('div').style.color = baseColor;
        item.style.color = baseColor;
        folderIcon.style.display = "flex";
        openFolderIcon.style.display = "none";
      }
      else {
        item.querySelector('div').style.color = highlightColor;
        item.style.color = highlightColor;
        folderIcon.style.display = "none";
        openFolderIcon.style.display = "flex";
      }
      
    } 
  });
}

