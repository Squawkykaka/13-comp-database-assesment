import { EVENT_BUS } from "../../models/eventBus";
import {
  GAME_MODES,
  GAME_STYLES,
  MULTIPLAYER_MODES,
} from "../../models/gameSettings";
import { isOneOf } from "../lobby";


export function renderOptionsUI() {
  const gameTypeEl = document.querySelector<HTMLSelectElement>("#gameType")!;
  const multiplayerEl = document.querySelector<HTMLSelectElement>("#multiplayer")!;
  const gameStyleEl = document.querySelector<HTMLSelectElement>("#gameStyle")!;

  function renderSection(
    list: Record<string, { display: string; description: string }>,
  ) {
    return Object.entries(list).map(
      ([id, settings]) => `
      <option value="${id}">${settings.display}</option>
    `,
    );
  }

  gameTypeEl.innerHTML = renderSection(GAME_MODES).toString();
  multiplayerEl.innerHTML = renderSection(MULTIPLAYER_MODES).toString();
  gameStyleEl.innerHTML = renderSection(GAME_STYLES).toString();

  function emitSettingsChange() {
    if (
      isOneOf(gameTypeEl.value, GAME_MODES) &&
      isOneOf(multiplayerEl.value, MULTIPLAYER_MODES) &&
      isOneOf(gameStyleEl.value, GAME_STYLES)
    ) {
      EVENT_BUS.publish("lobby.settings_change", {
        settings: {
          gameType: gameTypeEl.value,
          multiplayer: multiplayerEl.value,
          style: gameStyleEl.value,
        },
      });
    }
  }

  gameTypeEl.addEventListener("change", emitSettingsChange);
  multiplayerEl.addEventListener("change", emitSettingsChange);
  gameStyleEl.addEventListener("change", emitSettingsChange);

  EVENT_BUS.subscribe("game.begin", (_) => {
    gameTypeEl.disabled = true;
    multiplayerEl.disabled = true;
    gameStyleEl.disabled = true;
  });
  // EVENT_BUS.subscribe("reset", (_) => {
  //   gameTypeEl.disabled = false;
  //   multiplayerEl.disabled = false;
  //   gameStyleEl.disabled = false;
  // });

  EVENT_BUS.subscribe("lobby.settings_change", (event) => {
    const { gameType, multiplayer, style } = event.settings;
      gameTypeEl.value = gameType;
      multiplayerEl.value = multiplayer;
      gameStyleEl.value = style;
  });
}
