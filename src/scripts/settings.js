import CONSTANTS from "./constants.js";
import { handleGmVision, handleKeybinding, handleKeybindingGmVision } from "../module.js";
export const registerSettings = function () {
  game.settings.register(CONSTANTS.MODULE_NAME, "disableVisionOnDragAsGM", {
    name: `${CONSTANTS.MODULE_NAME}.setting.disableVisionOnDragAsGM.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.disableVisionOnDragAsGM.hint`,
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, "noTokenAnimationAsGM", {
    name: `${CONSTANTS.MODULE_NAME}.setting.noTokenAnimationAsGM.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.noTokenAnimationAsGM.hint`,
    scope: "world",
    config: true,
    default: false,
    type: Boolean,
  });

  // game.settings.register(MODULE_ID, SETTING_NAME, {
  // 	name: game.i18n.localize("NTVA.SettingName"),
  // 	hint: game.i18n.localize("NTVA.SettingHint"),
  // 	scope: "world",
  // 	type: String,
  // 	choices: {
  // 		foundry: game.i18n.localize("NTVA.SettingFoundry"),
  // 		disableAll: game.i18n.localize("NTVA.SettingDisableAll"),
  // 		disableGM: game.i18n.localize("NTVA.SettingDisableGM")
  // 	},
  // 	default: "foundry",
  // 	config: true,
  // 	onChange: (value) => {
  // 		parseSetting(value);
  // 	}
  // });

  game.settings.register(CONSTANTS.MODULE_NAME, "enableGmVision", {
    name: `${CONSTANTS.MODULE_NAME}.setting.enableGmVision.name`,
    hint: `${CONSTANTS.MODULE_NAME}.setting.enableGmVision.hint`,
    scope: "world",
    config: true,
    default: true,
    type: Boolean,
  });

  game.settings.register(CONSTANTS.MODULE_NAME, "activeGmVision", {
    name: "GM Vision",
    scope: "client",
    config: false,
    type: Boolean,
    default: false,
    onChange: handleGmVision,
    // onChange: (value) => {
    //   if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
    //     return;
    //   }

    //   activeGmVision = value;
    //   canvas.perception.update({ refreshVision: true }, true);
    //   ui.controls.initialize();
    // },
  });
};

export const registerKeyBindings = function () {
  game.keybindings.register(CONSTANTS.MODULE_NAME, "toggleVision", {
    name: `${CONSTANTS.MODULE_NAME}.keybinding.toggleVision.name`,
    name: `${CONSTANTS.MODULE_NAME}.keybinding.toggleVision.hint`,
    // editable: [{ key: "KeyI" }],
    // Ctrl + I
    editable: [{ key: "KeyI", modifiers: [KeyboardManager.MODIFIER_KEYS.CONTROL] }],
    restricted: true,
    onDown: handleKeybinding,
  });

  game.keybindings.register(CONSTANTS.MODULE_NAME, "activeGmVision", {
    name: "Toggle GM Vision",
    editable: [{ key: "KeyG", modifiers: [KeyboardManager.MODIFIER_KEYS.CONTROL] }],
    restricted: true,
    onDown: handleKeybindingGmVision,
    // onDown: () => {
    //   if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
    //     return;
    //   }

    //   game.settings.set(CONSTANTS.MODULE_NAME, "activeGmVision", !activeGmVision);

    //   return true;
    // },
  });
};
