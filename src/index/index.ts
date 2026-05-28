import { onAuthStateChanged } from "firebase/auth";
import { AUTH, signInGoogle } from "../firebase";
function setupSigninButton() {
  let signupButtonEl = document.querySelector<HTMLButtonElement>("#signUp > button");
  let signupSection = document.querySelector<HTMLButtonElement>("#signUp");
  let errorTextEl = document.querySelector<HTMLButtonElement>("#signUp > p");
  signupButtonEl.onclick = async () => {
    try {
      await signInGoogle();
      signupButtonEl.disabled = true;
    } catch (error) {
      console.log(error);
      
      // TODO: make more of these cases
      switch (error.code) {
        default:
          console.log(error);
          console.log(
            "There is no case handling this error. Please report to the admin",
          );

          break;
      }
    }
  };

  onAuthStateChanged(AUTH, (user) => {
    if (user === null) {
      signupSection.hidden = false;
    } else {
      signupSection.hidden = true;
    }
  })
}

window.addEventListener("DOMContentLoaded", () => {
  setupSigninButton();
});
