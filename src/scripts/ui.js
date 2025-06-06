import { auth } from "./init.js";
import { getUserData } from "./auth.js";

const signinForm = document.getElementById("signin-form");
const signupForm = document.getElementById("signup-form");
const mainContainer = document.getElementById("main");

const closeSigninBtn = document.querySelector(".signin-form-close");
const closeSignupBtn = document.querySelector(".signup-form-close");

const signupBtn = document.getElementById("signup-button");
const signinBtn = document.getElementById("signin-button");

const signupHereBtn = document.getElementById("signup-here");
const signinHereBtn = document.getElementById("signin-here");

const userProfileBox = document.querySelector('.dropdown-profile-arrow');


// OPEN SIGNIN
signinBtn?.addEventListener("click", openSigninBox);
export async function openSigninBox() {
    signinForm.style.display = "flex";
    signinForm.style.animation = "slideFromTopToDown 0.5s ease forwards";
    mainContainer?.classList.add("showLoginBoxMain");
    signinForm?.classList.add("showLoginBox");
}

signinHereBtn?.addEventListener("click", () => {
    closeSignupBox();
    openSigninBox();
});

// OPEN SIGNUP
signupBtn?.addEventListener("click", openSignupBox);
export async function openSignupBox() {
    signupForm.style.display = "flex";
    signupForm.style.animation = "slideFromTopToDown 0.5s ease forwards";
    mainContainer?.classList.add("showLoginBoxMain");
    signupForm?.classList.add("showLoginBox");
}

signupHereBtn?.addEventListener("click", () => {
    closeSigninBox();
    openSignupBox();
});

// CLOSE SIGNIN
closeSigninBtn?.addEventListener("click", closeSigninBox);
export async function closeSigninBox() {
    document.getElementById("email").value = "";
    document.getElementById("password").value = "";

    signinForm.style.animation = "slideFromDownToTop 0.5s ease forwards";
    mainContainer?.classList.remove("showLoginBoxMain");
    setTimeout(() => {
        signinForm.style.display = "none";
    }, 300);
}

// CLOSE SIGNUP
closeSignupBtn?.addEventListener("click", closeSignupBox);
export async function closeSignupBox() {
    document.getElementById("signup-firstname").value = "";
    document.getElementById("signup-lastname").value = "";
    document.getElementById("signup-username").value = "";
    document.getElementById("signup-email").value = "";
    document.getElementById("signup-password").value = "";
    document.getElementById("confirm-password").value = "";
    signupForm.style.animation = "slideFromDownToTop 0.5s ease forwards";
    mainContainer?.classList.remove("showLoginBoxMain");
    setTimeout(() => {
        signupForm.style.display = "none";
    }, 300);
}



// SHOW PROFILE BOX
userProfileBox?.addEventListener("click", showProfileBox);
export async function showProfileBox() {
    if (document.querySelector('.user-profile-box').style.display == "flex") {
        document.querySelector('.user-profile-box').style.display = "none";
    }
    else {
        document.querySelector('.user-profile-box').style.display = "flex";
        const user = auth.currentUser;
        getUserData(user.uid, user.photoURL);
    }
}

// CLOSE PROFILE BOX
window.onclick = function (event) {
    if (!event.target.matches('.dropdown-profile-arrow') && !event.target.matches('.user-profile-box') && !event.target.matches('.user-profile-name-input') && !event.target.matches('.user-profile-email-input') && !event.target.matches('.user-profile-box') && !event.target.matches('.userprofile-signout-button') && !event.target.matches('.logout-icon')) {
        document.querySelector('.user-profile-box').style.display = "none";
    }
}

