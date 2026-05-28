import { onAuthStateChanged, signOut } from "firebase/auth";
import { AUTH } from "../firebase";
import { FirebaseError } from "firebase/app";
import { signInGoogle } from "../firebase/user";

onAuthStateChanged(AUTH, (user) => {
  let signupButtonEl =
    document.querySelector<HTMLButtonElement>("#signUp > button")!;

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
      };
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
