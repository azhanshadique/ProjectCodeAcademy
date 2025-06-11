import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { ref, get, set } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { auth, dbRealtime, dbFirestore } from "./init.js";


// Function to write general data to Realtime Database
export function writeUserData(userID, firstname, lastname, username, email) {
    set(ref(dbRealtime, 'users/' + userID), {
        firstname: firstname,
        lastname: lastname,
        username: username,
        email: email
    })
        .then(() => {
            console.log("Data written successfully to Realtime Database.");
        })
        .catch((error) => {
            console.error("Error writing data to Realtime Database:", error);
        });
}

// Function to write specific user data to Firestore
export function createUserData(userID, firstname, lastname, username, email) {
    const currentDate = new Date(); // Get the current timestamp as a Date object
    const formattedDate = currentDate.toISOString(); // Convert to ISO 8601 format (e.g., '2025-01-15T12:34:56.789Z')

    try {
        // Add detailed user data to Firestore
        setDoc(doc(dbFirestore, "users", userID), {
            firstname: firstname,
            lastname: lastname,
            username: username,
            email: email,
            createdDate: formattedDate,  // Created date in human-readable format
            updatedDate: formattedDate,  // Updated date in human-readable format
            solvedProblems: []           // Initialize solvedProblems as an empty array
        });
        console.log("User data written successfully to Firestore.");
    } catch (error) {
        console.error("Error writing user data to Firestore:", error);
    }
}

// Fetch and show profile data
export async function getUserData(uid, img_src) {
    const nameField = document.getElementById("user-profile-name");
    const emailField = document.getElementById("user-profile-email");
    const profileImg = document.querySelector(".user-image");

    const userRef = ref(dbRealtime, 'users/' + uid);


    get(userRef).then((snapshot) => {
        var uservalue = snapshot.val().firstname;
        uservalue = uservalue + " " + snapshot.val().lastname;
        // document.getElementById('user-profile-name').style.width = ((uservalue.length + 3) * 8) + 'px';
        document.getElementById('user-profile-name').style.width = '250px';
        document.getElementById('user-profile-name').value = uservalue;

        var useremail = snapshot.val().email;
        // document.getElementById('user-profile-email').style.width = ((useremail.length + 1) * 7) + 'px';
        document.getElementById('user-profile-email').style.width = '250px';
        document.getElementById('user-profile-email').value = useremail;

        if (img_src == null) {
            document.querySelector('.user-image').src = "/src/assets/images/user6.png";
        }
        else {
            document.querySelector('.user-image').src = img_src;
            document.querySelector('.user-image').srcset = img_src;
        }
        if (useremail === "azhan.shadique@gmail.com" || useremail === "zainmallickiphone@gmail.com") {
            document.querySelector('.course-adder').style.display = "flex";
        }

    }).catch((error) => {
        console.log("Failed to fetch user data:", error.message);
    })
}

export {
    auth,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    signInWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup,
    onAuthStateChanged,
    ref,
    dbRealtime,
    get
};
