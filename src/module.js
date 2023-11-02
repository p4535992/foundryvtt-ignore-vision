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
import { registerNoTokenAnimation } from "./scripts/no-token-animation-helpers.js";
import { tokenVision } from "./scripts/ignore-vision-helpers.js";

let ignoreVisionToggle;

Hooks.once("init", () => {
  window[`${CONSTANTS.MODULE_ID}`] = false;

  registerSettings();
  registerKeyBindings();

  // libWrapper.register(CONSTANTS.MODULE_ID, "SightLayer.prototype.tokenVision", tokenVision, "MIXED");
  libWrapper.register(CONSTANTS.MODULE_ID, "CanvasVisibility.prototype.tokenVision", tokenVision, "MIXED");

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
      title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.toggle`),
      icon: "far fa-eye-slash",
      toggle: true,
      active: window[`${CONSTANTS.MODULE_ID}`],
      onClick: handleToggle,
      visible: game.user.isGM,
    };
  }
  const tokenControls = controls.find((group) => group.name === "token").tools;
  tokenControls.push(ignoreVisionToggle);
});

Hooks.on("preUpdateToken", (token, changes, data) => {
  registerDoNotRevealMyMap(token, changes, data);
  registerNoTokenAnimation(token, changes, data);
});

export function handleKeybinding(value) {
  if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
    return false;
  }
  const newToggleState = !window[`${CONSTANTS.MODULE_ID}`];
  ignoreVisionToggle.active = newToggleState;
  ui.controls.render();
  handleToggle(newToggleState);

  return true;
}

function handleToggle(toggled) {
  window[`${CONSTANTS.MODULE_ID}`] = toggled;
  canvas.effects.visibility.refresh();
}
