import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { AUTH } from "../firebase";
import { FirebaseError } from "firebase/app";
function setupSigninButton() {
  let signupButtonEl =
    document.querySelector<HTMLButtonElement>("#signUp > button")!;

  onAuthStateChanged(AUTH, (user) => {
    try {
      if (user === null) {
        signupButtonEl.innerText = "Sign In";
        signupButtonEl.onclick = async () => {
          await signInGoogle();
        };
      } else {
        signupButtonEl.innerText = "Sign Out";
        signupButtonEl.onclick = async () => {
          await signOut(AUTH);
        }
      }
    } catch (error) {
      if (error instanceof FirebaseError) {
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
    }
  });
}


async function signInGoogle() {
  await signInWithPopup(AUTH, new GoogleAuthProvider())
}

window.addEventListener("DOMContentLoaded", () => {
  setupSigninButton();
});