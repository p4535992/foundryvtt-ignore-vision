import CONSTANTS from "./constants";

export class NoTokenAnimationClassHelpers {
  static registerNoTokenAnimation(token, changes, data) {
    if (game.settings.get(CONSTANTS.MODULE_ID, "noTokenAnimationAsGM") && game.user.isGM) {
      data.animate = false;
    }
  }
}
