import { GoogleSignIn, FacebookSignIn, SignInWithEmail, SignUpWithEmail, SignoutUser, HandleForgotPassword } from "./main.js";
import { openSigninBox, openSignupBox, openForgetBox, closeSigninBox, closeSignupBox, closeForgetBox, showProfileBox } from "./ui.js";

window.addEventListener('pageshow', function () {
  const includes = document.querySelectorAll('[data-include]');
  let loadedCount = 0;

  includes.forEach(el => {
    fetch(el.getAttribute('data-include'))
      .then(res => res.text())
      .then(data => {
        el.innerHTML = data;
        loadedCount++;

        // After navbar loads, call nav highlight
        if (el.getAttribute('data-include').includes("navbar")) {
          highlightCurrentNav();
        }

        // After auth-forms load, rebind login/signup events
        // if (el.getAttribute('data-include').includes("auth-forms")) {
        //   bindAuthEventListeners();
        // }
        if (loadedCount === includes.length) {
          initAuthForms(); // Attach only when DOM is ready
        }
      });
  });
});



function initAuthForms() {
  // OPEN FORM TRIGGERS
  document.getElementById("signin-button")?.addEventListener("click", openSigninBox);
  document.getElementById("signup-button")?.addEventListener("click", openSignupBox);
  document.getElementById("forget-link")?.addEventListener("click", () => {
        closeSigninBox(); openForgetBox(); 
  });
  document.getElementById("gmail-login-btn")?.addEventListener("click", GoogleSignIn);
  document.getElementById("gmail-signup-btn")?.addEventListener("click", GoogleSignIn);
  document.getElementById("fb-login-btn")?.addEventListener("click", FacebookSignIn);
  document.getElementById("fb-signup-btn")?.addEventListener("click", FacebookSignIn);
  document.getElementById("login-btn")?.addEventListener("click", SignInWithEmail);
  document.getElementById("signup-btn")?.addEventListener("click", SignUpWithEmail);
  document.getElementById("forget-btn")?.addEventListener("click", HandleForgotPassword);
  document.getElementById("logout")?.addEventListener("click", SignoutUser);

  // SWITCH BETWEEN FORMS
  document.getElementById("signup-here")?.addEventListener("click", () => {
    closeSigninBox();
    openSignupBox();
  });

  document.getElementById("signin-here")?.addEventListener("click", () => {
    closeSignupBox();
    openSigninBox();
  });

  document.getElementById("forget-signin-here")?.addEventListener("click", () => {
    closeForgetBox();
    openSigninBox();
  });

  // CLOSE FORM BUTTONS
  document.querySelector(".signin-form-close")?.addEventListener("click", closeSigninBox);
  document.querySelector(".signup-form-close")?.addEventListener("click", closeSignupBox);
  document.querySelector(".forget-form-close")?.addEventListener("click", closeForgetBox);

  // PROFILE ACTIONS
  document.querySelector(".dropdown-profile-arrow")?.addEventListener("click", showProfileBox);

  // OUTSIDE CLICK TO CLOSE PROFILE BOX
  window.addEventListener("click", (event) => {
    if (
      !event.target.matches('.dropdown-profile-arrow') &&
      !event.target.closest('.user-profile-box')
    ) {
      document.querySelector(".user-profile-box")?.style.setProperty('display', 'none');
    }
  });

  // Logout button
  document.getElementById("logout")?.addEventListener("click", SignoutUser);

  // Extra (optional): Navigate to profile or add course
  document.querySelector(".view-profile")?.addEventListener("click", () => {
    window.location.href = "/public/src/modules/progress/index.html";
  });

  document.querySelector(".course-adder")?.addEventListener("click", () => {
    window.location.href = "/public/src/modules/problemadder/index.html";
  });
}


function highlightCurrentNav() {
    const path = window.location.pathname;

    const cleanPath = path.replace(/\/(index\.html)?$/, '').replace(/\/public\/?/, '').replace(/\/#$/, '/');

    // Remove old highlight first
    document.querySelectorAll('.nav-link')?.forEach(link => link.classList.remove('current-nav'));

    if (cleanPath === '' || cleanPath === '/') {
        document.getElementById("home-page")?.classList.add("current-nav");
    } else if (path.includes("resources")) {
        document.getElementById("resource-page")?.classList.add("current-nav");
    } else if (path.includes("compiler")) {
        document.getElementById("compiler-page")?.classList.add("current-nav");
    } else if (path.includes("about")) {
        document.getElementById("about-page")?.classList.add("current-nav");
    } else if (path.includes("contact")) {
        document.getElementById("contact-page")?.classList.add("current-nav");
    } else if (path.includes("codeexplainer")) {
        document.getElementById("code-explainer")?.classList.add("current-nav");
    } else if (path.includes("challenges")) {
        document.getElementById("challenges")?.classList.add("current-nav");
    }
}