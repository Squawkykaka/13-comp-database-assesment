import {
  GAME_MODES,
  GAME_STYLES,
  MULTIPLAYER_MODES,
} from "../models/gameSettings";

let createForm = document.querySelector<HTMLFormElement>("#lobbyCreateForm")!;
function renderOptions() {
  function mapStuff(
    list: Record<string, { display: string; description: string }>,
    nameId: string,
  ) {
    return Object.entries(list).map(
      ([id, name]) => `
      <input
        type="radio"
        name="${nameId}"
        value="${id}"
        id="${id}"
      />
      <label for="${id}">
        <div>
          <h3>${name.display}</h3>
          <p>${name.description}</p>
        </div>
      </label>`,
    );
  }

  let optionsFinal = `
    <div>
    ${mapStuff(GAME_MODES, "gameType")}
    </div>
    <div>
    ${mapStuff(MULTIPLAYER_MODES, "multiplayer")}
    </div>
    <div>
    ${mapStuff(GAME_STYLES, "style")}
    </div>
  `;

  createForm.innerHTML = optionsFinal;
}

renderOptions();

let onevoneEl = document.querySelectorAll<HTMLInputElement>('[name="style"]')
onevoneEl.forEach((el) =>
  el.addEventListener("change", () => {
    createForm.requestSubmit();
  }),
);
