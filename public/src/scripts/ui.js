import { auth } from "./init.js";
import { getUserData } from "./auth.js";

const signInForm = document.getElementById("signin-form");
const signUpForm = document.getElementById("signup-form");
const forgetForm = document.getElementById("forget-form");
const mainContainer = document.getElementById("main");

const closeSigninBtn = document.querySelector(".signin-form-close");
const closeSignupBtn = document.querySelector(".signup-form-close");
const closeForgetBtn = document.querySelector(".forget-form-close");

const signupBtn = document.getElementById("signup-button");
const signinBtn = document.getElementById("signin-button");

const signupHereBtn = document.getElementById("signup-here");
const signinHereBtn = document.getElementById("signin-here");
const forgetSigninHereBtn = document.getElementById("forget-signin-here");

const userProfileBox = document.querySelector('.dropdown-profile-arrow');
const forgetBtn = document.getElementById("forget-link");


// OPEN SIGNIN
signinBtn?.addEventListener("click", openSigninBox);
export async function openSigninBox() {
    signInForm.style.display = "flex";
    signInForm.style.animation = "slideFromTopToDown 0.5s ease forwards";
    mainContainer?.classList.add("showLoginBoxMain");
    signInForm?.classList.add("showLoginBox");
}

signinHereBtn?.addEventListener("click", () => {
    closeSignupBox();
    openSigninBox();
});

forgetSigninHereBtn?.addEventListener("click", () => {
    closeForgetBox();
    openSigninBox();
});

// OPEN SIGNUP
signupBtn?.addEventListener("click", openSignupBox);
export async function openSignupBox() {
    signUpForm.style.display = "flex";
    signUpForm.style.animation = "slideFromTopToDown 0.5s ease forwards";
    mainContainer?.classList.add("showLoginBoxMain");
    signUpForm?.classList.add("showLoginBox");
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

    if(signInForm) signInForm.style.animation = "slideFromDownToTop 0.5s ease forwards";
    mainContainer?.classList.remove("showLoginBoxMain");
    setTimeout(() => {
      if(signInForm) signInForm.style.display = "none";
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
    if (signUpForm) signUpForm.style.animation = "slideFromDownToTop 0.5s ease forwards";
    mainContainer?.classList.remove("showLoginBoxMain");
    setTimeout(() => {
      if(signUpForm) signUpForm.style.display = "none";
    }, 300);
}

// OPEN FORGET PASSWORD 
forgetBtn?.addEventListener("click", () => {
    console.log("forgot password");
    closeSigninBox();
    openForgetBox();
});
export async function openForgetBox() {
    forgetForm.style.display = "flex";
    forgetForm.style.animation = "slideFromTopToDown 0.5s ease forwards";
    mainContainer?.classList.add("showLoginBoxMain");
    forgetForm?.classList.add("showLoginBox");
}

// CLOSE FORGET PASSWORD 
closeForgetBtn?.addEventListener("click", closeForgetBox);
export async function closeForgetBox() {
    document.getElementById("forget-email").value = "";
    // document.getElementById("password").value = "";

    if(forgetForm) forgetForm.style.animation = "slideFromDownToTop 0.5s ease forwards";
    mainContainer?.classList.remove("showLoginBoxMain");
    setTimeout(() => {
      if(forgetForm) forgetForm.style.display = "none";
    }, 300);
    openSigninBox();
}

// SHOW PROFILE BOX
userProfileBox?.addEventListener("click", showProfileBox);
export async function showProfileBox() {
    if(document.querySelector('.user-profile-box').style.display == "flex") {
        document.querySelector('.user-profile-box').style.display = "none";
    }
    else {
        document.querySelector('.user-profile-box').style.display = "flex";
        const user = auth.currentUser;
        getUserData(user.uid, user.photoURL);
    }
}

// CLOSE PROFILE BOX
window.onclick = function(event) {
    if (!event.target.matches('.dropdown-profile-arrow') && !event.target.matches('.user-profile-box') && !event.target.matches('.user-profile-name-input') && !event.target.matches('.user-profile-email-input')  && !event.target.matches('.user-profile-box') && !event.target.matches('.userprofile-signout-button') && !event.target.matches('.logout-icon')) {
        document.querySelector('.user-profile-box').style.display = "none";
    }
}

console.log(window.location.pathname);
if (window.location.pathname.includes("public")) {
    document.getElementById("home-page").classList.add("current-nav");
}
else if (window.location.pathname.includes("/")) {
    document.getElementById("home-page").classList.add("current-nav");
}
else if (window.location.pathname.includes("resources")) {
    document.getElementById("resource-page").classList.add("current-nav");
}
else if (window.location.pathname.includes("OnlineCompiler")) {
    document.getElementById("compiler-page").classList.add("current-nav");
}
else if (window.location.pathname.includes("about")) {
    document.getElementById("about-page").classList.add("current-nav");
}
else if (window.location.pathname.includes("contact")) {
    document.getElementById("contact-page").classList.add("current-nav");
}

