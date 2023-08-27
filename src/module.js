import CONSTANTS from "./scripts/constants.js";
import { registerKeyBindings, registerSettings } from "./scripts/settings.js";
import { error } from "./scripts/lib.js";
import {
  registerLightSourceCalculation,
  registerVisionSourceCalculation,
} from "./scripts/hidden-token-can-see-and-light-helpers.js";
import { registerGmVision } from "./scripts/gm-vision-helpers.js";
import { registerDisableVisionOnDragAsGM } from "./scripts/disable-vision-on-drag-as-gm-helpers.js";
import { registerDoNotRevealMyMap } from "./scripts/do-not-reveal-my-map-helpers.js";

let ignoreVisionToggle;

Hooks.once("init", () => {
  window.ignoreVision = false;

  registerSettings();
  registerKeyBindings();

  // libWrapper.register(CONSTANTS.MODULE_NAME, "SightLayer.prototype.tokenVision", tokenVision, "MIXED");
  libWrapper.register(CONSTANTS.MODULE_NAME, "CanvasVisibility.prototype.tokenVision", tokenVision, "MIXED");

  registerDisableVisionOnDragAsGM();
});

Hooks.once("setup", () => {
  registerGmVision();

  registerVisionSourceCalculation();
  registerLightSourceCalculation();
});

Hooks.once("ready", () => {
  // Do anything once the module is ready
  if (!game.modules.get("lib-wrapper")?.active && game.user?.isGM) {
    let word = "install and activate";
    if (game.modules.get("lib-wrapper")) word = "activate";
    throw error(`Requires the 'libWrapper' module. Please ${word} it.`);
  }
  // if (!game.modules.get("socketlib")?.active && game.user?.isGM) {
  //   let word = "install and activate";
  //   if (game.modules.get("socketlib")) word = "activate";
  //   throw error(`Requires the 'socketlib' module. Please ${word} it.`);
  // }
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (!ignoreVisionToggle) {
    ignoreVisionToggle = {
      name: "ignoreVision",
      title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.toggle`),
      icon: "far fa-eye-slash",
      toggle: true,
      active: ignoreVision,
      onClick: handleToggle,
      visible: game.user.isGM,
    };
  }
  const tokenControls = controls.find((group) => group.name === "token").tools;
  tokenControls.push(ignoreVisionToggle);
});

Hooks.on("preUpdateToken", (token, changes, data) => {
  registerDoNotRevealMyMap(token, changes, data);
});

export function handleKeybinding(value) {
  if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
    return false;
  }
  const newToggleState = !ignoreVision;
  ignoreVisionToggle.active = newToggleState;
  ui.controls.render();
  handleToggle(newToggleState);

  return true;
}

function handleToggle(toggled) {
  ignoreVision = toggled;
  canvas.effects.visibility.refresh();
}

function tokenVision(wrapped) {
  if (ignoreVision && game.user.isGM) {
    return false;
  }
  return wrapped();
}
