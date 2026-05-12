import { EVENT_BUS } from "../models/eventBus";
import type { LobbySettings } from "../models/gameSettings";

export default class DataStore {
    private $settings: LobbySettings;

    public get settings(): LobbySettings {
        return this.$settings;
    }

    constructor() {
        EVENT_BUS.subscribe("lobby.settings.update", event => {
            this.$settings = event.settings;
        });
    }
}