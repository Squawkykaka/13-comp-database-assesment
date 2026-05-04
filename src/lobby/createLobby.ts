let onevoneEl = document.querySelectorAll<HTMLInputElement>("[name=\"style_select\"]");
let createForm = document.querySelector<HTMLFormElement>("#lobbyCreateForm")!;
onevoneEl.forEach((el) =>
  el.addEventListener("change", () => {
    createForm.requestSubmit();
  }),
);
