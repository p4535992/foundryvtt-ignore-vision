import CONSTANTS from "./constants";

export function registerNoTokenAnimation(token, changes, data) {
  if (game.settings.get(CONSTANTS.MODULE_NAME, "noTokenAnimationAsGM") && game.user.isGM) {
    data.animate = false;
  }
}
