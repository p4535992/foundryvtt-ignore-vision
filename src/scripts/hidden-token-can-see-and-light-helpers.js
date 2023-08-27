import CONSTANTS from "./constants";

export function registerVisionSourceCalculation() {
  libWrapper.register(
    CONSTANTS.MODULE_NAME,
    "Token.prototype._isVisionSource",
    function (wrapped) {
      if (wrapped()) {
        return true;
      }

      // If setting is not enabled or token is not hidden, don't change the behavior
      if (!game.settings.get(CONSTANTS.MODULE_NAME, "invisibleTokensCanSee") || !this.document.hidden) {
        return false;
      }
      if (!canvas.effects.visibility.tokenVision || !this.hasSight || game.user.isGM) {
        return false;
      }
      return this.controlled || this.isOwner;
    },
    "WRAPPER"
  );

  libWrapper.register(
    CONSTANTS.MODULE_NAME,
    "Token.prototype.isVisible",
    function (wrapped) {
      if (wrapped()) {
        return true;
      }

      // If setting is not enabled or token is not hidden, don't change the behavior
      if (!game.settings.get(CONSTANTS.MODULE_NAME, "invisibleTokensCanSee") || !this.document.hidden) {
        return false;
      }
      return !game.user.isGM && (this.controlled || this.isOwner);
    },
    "WRAPPER"
  );
}

export function registerLightSourceCalculation() {
  libWrapper.register(
    CONSTANTS.MODULE_NAME,
    "Token.prototype.emitsLight",
    function (wrapped) {
      if (wrapped()) {
        return true;
      }

      // If setting is not enabled or token is not hidden, don't change the behavior
      if (!game.settings.get(CONSTANTS.MODULE_NAME, "invisibleTokensEmitLight") || !this.document.hidden) {
        return false;
      }
      let light = this.document.light;
      if (!(light.dim || light.bright)) {
        return false;
      }
      const darkness = canvas.darknessLevel;
      return darkness.between(light.darkness.min, light.darkness.max);
    },
    "WRAPPER"
  );
}
