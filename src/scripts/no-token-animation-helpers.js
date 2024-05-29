import CONSTANTS from "./constants";

export class NoTokenAnimationClassHelpers {
    static registerNoTokenAnimationPreUpdateToken(token, changes, data, userId) {
        if (game.settings.get(CONSTANTS.MODULE_ID, "noTokenAnimationAsGM") && game.user.isGM) {
            data.animate = false;
        }
    }
}
