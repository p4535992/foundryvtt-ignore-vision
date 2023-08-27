export function registerNoTokenAnimation(tokenDoc, change, options) {
  if (game.settings.get(CONSTANTS.MODULE_NAME, "noTokenAnimationAsGM") && game.user.isGM) {
    options.animate = false;
  }
}
