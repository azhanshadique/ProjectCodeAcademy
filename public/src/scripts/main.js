import {
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
  writeUserData,
  getUserData,
  createUserData,
  ref,
  dbRealtime,
  get
} from "./auth.js";

import { closeSignupBox, openSigninBox, closeSigninBox, closeForgetBox } from "./ui.js";

document.addEventListener('DOMContentLoaded', function() {
  const scroll = new LocomotiveScroll({
    el: document.querySelector('#main'),
    smooth: true
  });
});


// DOM elements
const signinBtn = document.getElementById("login-btn");
const signupBtn = document.getElementById("signup-btn");
const signupFbBtn = document.getElementById("fb-signup-btn");
const fbBtn = document.getElementById("fb-login-btn");

const forgetBtn = document.getElementById("forget-btn");
const logoutBtn = document.getElementById("logout");

const courseAdder = document.querySelector('.course-adder');
const viewProfile = document.querySelector('.view-profile');

// SIGNIN
signinBtn?.addEventListener("click", () => {
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;

  if (email === "" || password === "") {
    alert("Please provide both Email and Password.");
  }
  else {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        if (user) {
          // Check if email is verified
          if (user.emailVerified) {
            alert("Signed In Successfully.");
            getUserData(user.uid, null); // Fetch user data
          } else {
            alert("Your email is not verified. Please verify your email before logging in.");
            logoutUser();
          }
        }
      })
      .catch((error) => {
        alert("Invalid credentials. Please try again.");
        console.error("Invalid login attempt:", error);
      });
  }
});


// SIGNUP
signupBtn?.addEventListener("click", () => {
  const firstname = document.querySelector('#signup-firstname').value;
  const lastname = document.querySelector('#signup-lastname').value;
  const username = document.querySelector('#signup-username').value;
  const email = document.querySelector('#signup-email').value;
  const password = document.querySelector('#signup-password').value;
  const confirm_password = document.querySelector('#confirm-password').value;

  if (firstname == "" || username == "" || email == "" || password == "" || confirm_password == "") {
    alert("Fill all the required fields.");
  }
  else if (password != confirm_password) {
    alert("Passwords does not match.");
  }
  else {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials.user;
        if (user) {
          const currentuser = {
            firstname: firstname,
            lastname: lastname,
            username: username,
            email: user.email,
            uid: user.uid,
          };

          // Write to Realtime Database
          writeUserData(user.uid, firstname, lastname, username, user.email);

          // Write to Firestore Database
          createUserData(user.uid, firstname, lastname, username, user.email);

          // Send Email Verification
          sendEmailVerification(user)
            .then(() => {
              alert("A verification email has been sent to your email address. Please verify before logging in.");
              console.log("Verification email sent.");
            })
            .catch((error) => {
              console.error("Error sending verification email:", error);
            });

          console.log("User Created Successfully");
          alert("Account Created Successfully. Please verify your email to Sign In.");
          closeSignupBox();
          openSigninBox();
          logoutUser(); // Log out the user until they verify their email
        }
        else {
          alert("Something went wrong. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error creating user:", error.message);
        alert("Error Signing Up now:" + error.message);
      });
  }
});


// GOOGLE
function GoogleSignIn() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider).then((result) => {
    // const credential = GoogleAuthProvider.credentialFromResult(result);
    // const token = credential.accessToken;
    const user = result.user;

    const currentuser = result._tokenResponse;
    const userRef = ref(dbRealtime, 'users/' + user.uid);
    get(userRef).then((snapshot) => {
      if (!snapshot.exists()) {
        writeUserData(user.uid, currentuser.firstName, currentuser.lastName, currentuser.displayName, currentuser.email);
        createUserData(user.uid, currentuser.firstName, currentuser.lastName, currentuser.displayName, currentuser.email);
        var uservalue = currentuser.displayName;
        document.getElementById('user-profile-name').style.width = ((uservalue.length + 3) * 8) + 'px';
        document.getElementById('user-profile-name').value = uservalue;
        document.getElementById('user-profile-email').style.width = ((currentuser.email.length + 1) * 8) + 'px';
        document.getElementById('user-profile-email').value = currentuser.email;
        document.querySelector('.user-image').src = currentuser.photoUrl;
      }
      else
        getUserData(user.uid, currentuser.photoUrl);
    })
  })
    .then(() => alert("Signed In Successfully."))
    .catch((error) => {
      console.log(error.message);
      alert("Google Sign-in failed: " + error.message);
    })
}

// Attach the same function to both buttons
document.getElementById("gmail-login-btn")?.addEventListener("click", GoogleSignIn);
document.getElementById("gmail-signup-btn")?.addEventListener("click", GoogleSignIn);


// FACEBOOK
function FacebookSignIn() {
  const provider = new FacebookAuthProvider();
  signInWithPopup(auth, provider).then((result) => {
    // const credential = FacebookAuthProvider.credentialFromResult(result);
    // const token = credential.accessToken;
    const user = result.user;

    const currentuser = result._tokenResponse;
    const userRef = ref(dbRealtime, 'users/' + user.uid);
    get(userRef).then((snapshot) => {
      if (!snapshot.exists()) {
        writeUserData(user.uid, currentuser.firstName, currentuser.lastName, currentuser.displayName, currentuser.email);
        createUserData(user.uid, currentUser.firstName, currentUser.lastName, currentUser.displayName, currentUser.email);
        var uservalue = currentuser.displayName;
        document.getElementById('user-profile-name').style.width = ((uservalue.length + 3) * 8) + 'px';
        document.getElementById('user-profile-name').value = uservalue;
        document.getElementById('user-profile-email').style.width = ((snapshot.val().email.length + 1) * 8) + 'px';
        document.getElementById('user-profile-email').value = currentuser.email;
        document.querySelector('.user-image').src = currentuser.photoUrl;

      }
      else
        getUserData(user.uid, currentuser.photoUrl);
    })
  })
  .then(() => alert("Signed up with Facebook!"))
  .catch((error) => {
    console.log(error.message);
    alert("Facebook Sign-in failed: " + error.message);
  })
}

document.getElementById("fb-login-btn")?.addEventListener("click", FacebookSignIn);
document.getElementById("signup-fb-login-btn")?.addEventListener("click", FacebookSignIn);

// fbBtn?.addEventListener("click", () => {
//   const provider = new FacebookAuthProvider();
//   signInWithPopup(auth, provider)
//     .then(() => alert("Signed up with Facebook!"))
//     .catch((error) => alert("Facebook Sign-up failed: " + error.message));
// });
// signupFbBtn?.addEventListener("click", () => {
//   const provider = new FacebookAuthProvider();
//   signInWithPopup(auth, provider)
//     .then(() => alert("Signed up with Facebook!"))
//     .catch((error) => alert("Facebook Sign-up failed: " + error.message));
// });


// FORGET PASSWORD
forgetBtn?.addEventListener("click", () => {
  const email = document.getElementById("forget-email").value;
  closeForgetBox();
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Reset email sent!"))
    .catch((error) => alert(error.message));
});

// LOGOUT
logoutBtn?.addEventListener("click", () => {
  signOut(auth).then(() => {
    document.querySelector('#main').classList.remove('showLoginBoxMain');

    // document.querySelector('.user-profile').style.display = "none";
    // document.querySelector('.nav-list2').style.display = "flex";

    document.querySelector(".user-profile").style.visibility = "hidden";
    document.querySelector(".nav-list2").style.visibility = "visible";

    document.getElementById('user-profile-name').value = "";
    document.querySelector('.user-image').src = null;
    document.getElementById('user-profile-email').value = "";
    document.querySelector('.user-profile-box').style.display = "none";
    document.querySelector('.course-adder').style.display = "none";
    window.location.href = "/public/index.html";
  })
    .then(() => alert("Signed Out Successfully."))
    .catch((error) => {
      console.log(error.message);
      alert("Sign Out failed: " + error.message);
    })
});

function logoutUser() {
  signOut(auth).then(() => {
    document.querySelector('#main').classList.remove('showLoginBoxMain');
    // document.querySelector('.user-profile').style.display = "none";
    // document.querySelector('.nav-list2').style.display = "flex";

    document.querySelector(".user-profile").style.visibility = "hidden";
    document.querySelector(".nav-list2").style.visibility = "visible";

    document.getElementById('user-profile-name').value = "";
    document.querySelector('.user-image').src = null;
    document.getElementById('user-profile-email').value = "";
    document.querySelector('.user-profile-box').style.display = "none";
    document.querySelector('.course-adder').style.display = "none";
    // window.history.go(-10);

  })
    .catch((error) => {
      console.log(error.message);
      alert("Sign Out failed: " + error.message);
    })
}

// AUTH STATE
onAuthStateChanged(auth, (user) => {
  if (user) {
    // document.querySelector(".user-profile").style.display = "flex";
    // document.querySelector(".nav-list2").style.display = "none";
    document.querySelector(".nav-list2").style.visibility = "hidden";
    document.querySelector(".user-profile").style.visibility = "visible";

    closeSigninBox();
    closeSignupBox();

    getUserData(user.uid, user.photoURL);
  } else {
    document.querySelector(".user-profile-box").style.display = "none";
    document.querySelector(".user-profile").style.visibility = "hidden";
    document.querySelector(".nav-list2").style.visibility = "visible";
  }
});

courseAdder?.addEventListener("click", () => {
  window.location.href = "/src/modules/problemadder/index.html";
});

viewProfile?.addEventListener("click", () => {
  window.location.href = "/src/modules/progress/index.html";
});

// document.addEventListener('DOMContentLoaded', function() {
//   var loader = document.querySelector("#loader")
//   setTimeout(function () {
//       loader.style.top = "-100%"
//   }, 4200)
// });

// document.addEventListener('DOMContentLoaded', async function (event) {
//   event.preventDefault();
// });



