import { createUser, type UserSignup } from "./firebase";
import "./style.css";

declare global {
  interface Document {
    getElementById<T extends HTMLElement>(id: string): T | null;
  }
}

const signupForm = document.getElementById<HTMLFormElement>("signupForm");
const loginForm = document.getElementById<HTMLFormElement>("loginForm");
const authStatusElement =document.getElementById<HTMLHeadingElement>("authStatus");

formListener(signupForm!, async (formData) => {
  try {
    await createUser(formData as unknown as UserSignup);
  } catch (error) {
    authStatusElement!.innerText = error as string;
  }
});
formListener(loginForm!, (formData) => {
  console.log(formData);
});

function formListener(
  form: HTMLFormElement,
  toRun: (formData: FormData, event: SubmitEvent) => void,
) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    let formData = new FormData(form);
    toRun(formData, event);
  });
}
