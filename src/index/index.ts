import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { AUTH } from "../firebase";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { userCollection } from "../firebase/user";

export async function signInGoogle() {
  const userCred = await signInWithPopup(AUTH, new GoogleAuthProvider());
  let ref = doc(userCollection, userCred.user.uid);

  let document = await getDoc(ref);
  let data = document.data();
  if (data === undefined) {
    console.log("MAKING DUMMY USER");
    await setDoc(ref.withConverter(null), {
      displayName: userCred.user.displayName ?? "TEST",
      joinDate: serverTimestamp(),
      quote: "",
      photoURL: userCred.user.photoURL,
    });
  }
}


onAuthStateChanged(AUTH, (user) => {
  let signupButtonEl = document.querySelector<HTMLButtonElement>("#signUp > button")!;

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
          console.log("There is no case handling this error. Please report to the admin");

          break;
      }
    }
  }
});
