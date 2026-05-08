let onevoneEl = document.querySelectorAll<HTMLInputElement>("[name=\"style\"]");
let createForm = document.querySelector<HTMLFormElement>("#lobbyCreateForm")!;
onevoneEl.forEach((el) =>
  el.addEventListener("change", () => {
    createForm.requestSubmit();
  }),
);
