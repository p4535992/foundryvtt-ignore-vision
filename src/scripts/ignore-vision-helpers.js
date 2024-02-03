import CONSTANTS from "./constants";

export class IgnoreVisionHelpers {
  static ignoreVisionToggle;

  static registerIgnoreVision() {
    // libWrapper.register(CONSTANTS.MODULE_ID, "SightLayer.prototype.tokenVision", tokenVision, "MIXED");
    libWrapper.register(
      CONSTANTS.MODULE_ID,
      "CanvasVisibility.prototype.tokenVision",
      IgnoreVisionHelpers.tokenVisionIgnoreVision,
      "MIXED"
    );
  }

  static getSceneControlButtonsIgnoreVision(controls) {
    if (!IgnoreVisionHelpers.ignoreVisionToggle) {
      IgnoreVisionHelpers.ignoreVisionToggle = {
        name: "ignoreVision",
        title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.toggle`),
        icon: "far fa-eye-slash",
        toggle: true,
        active: window[`${CONSTANTS.MODULE_ID}`],
        onClick: IgnoreVisionHelpers._handleToggleIgnoreVision,
        visible: game.user.isGM,
      };
    }
    const tokenControls = controls.find((group) => group.name === "token").tools;
    tokenControls.push(IgnoreVisionHelpers.ignoreVisionToggle);
  }

  static tokenVisionIgnoreVision(wrapped) {
    if (window[`${CONSTANTS.MODULE_ID}`] && game.user.isGM) {
      return false;
    }
    return wrapped();
  }

  static handleKeybindingIgnoreVision(value) {
    if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
      return false;
    }
    const newToggleState = !window[`${CONSTANTS.MODULE_ID}`];
    IgnoreVisionHelpers.ignoreVisionToggle.active = newToggleState;
    ui.controls.render();
    IgnoreVisionHelpers._handleToggleIgnoreVision(newToggleState);

    return true;
  }

  static _handleToggleIgnoreVision(toggled) {
    window[`${CONSTANTS.MODULE_ID}`] = toggled;
    canvas.effects.visibility.refresh();
  }
}
