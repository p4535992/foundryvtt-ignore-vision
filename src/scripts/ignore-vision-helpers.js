import CONSTANTS from "./constants";

let ignoreVisionToggle;

export function getSceneControlButtonsIgnoreVision(controls) {
  if (!ignoreVisionToggle) {
    ignoreVisionToggle = {
      name: "ignoreVision",
      title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.toggle`),
      icon: "far fa-eye-slash",
      toggle: true,
      active: window[`${CONSTANTS.MODULE_ID}`],
      onClick: _handleToggleIgnoreVision,
      visible: game.user.isGM,
    };
  }
  const tokenControls = controls.find((group) => group.name === "token").tools;
  tokenControls.push(ignoreVisionToggle);
}

export function tokenVisionIgnoreVision(wrapped) {
  if (window[`${CONSTANTS.MODULE_ID}`] && game.user.isGM) {
    return false;
  }
  return wrapped();
}

export function handleKeybindingIgnoreVision(value) {
  if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
    return false;
  }
  const newToggleState = !window[`${CONSTANTS.MODULE_ID}`];
  ignoreVisionToggle.active = newToggleState;
  ui.controls.render();
  _handleToggleIgnoreVision(newToggleState);

  return true;
}

function _handleToggleIgnoreVision(toggled) {
  window[`${CONSTANTS.MODULE_ID}`] = toggled;
  canvas.effects.visibility.refresh();
}
