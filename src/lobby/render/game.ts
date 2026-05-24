import { EVENT_BUS } from "../../models/eventBus";

let boardEl = document.querySelector<HTMLDivElement>("#gameBoard");

EVENT_BUS.subscribe("lobby.settings_change", settings => {
    boardEl.innerHTML = ``;

    switch (settings.settings.gameType) {
        case "original":
            for (let i = 0; i < 9; i++) {
                let buttonEl = document.createElement("button");
                buttonEl.disabled = true;
                // buttonEl.textContent = `TEST`
                boardEl.appendChild(buttonEl)
            }
            break;
    
        default:
            break;
    }
})