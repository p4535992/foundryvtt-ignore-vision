import CONSTANTS from "./constants.js";

import { GmVisionHelpers } from "./gm-vision-helpers.js";
import { IgnoreVisionHelpers } from "./ignore-vision-helpers.js";

export const registerSettings = function () {
    game.settings.register(CONSTANTS.MODULE_ID, "disableVisionOnDragAsGM", {
        name: `${CONSTANTS.MODULE_ID}.setting.disableVisionOnDragAsGM.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.disableVisionOnDragAsGM.hint`,
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });

    game.settings.register(CONSTANTS.MODULE_ID, "noTokenAnimationAsGM", {
        name: `${CONSTANTS.MODULE_ID}.setting.noTokenAnimationAsGM.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.noTokenAnimationAsGM.hint`,
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

    game.settings.register(CONSTANTS.MODULE_ID, "enableGmVision", {
        name: `${CONSTANTS.MODULE_ID}.setting.enableGmVision.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.enableGmVision.hint`,
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });

    game.settings.register(CONSTANTS.MODULE_ID, "enableRevealObservableTokens", {
        name: `${CONSTANTS.MODULE_ID}.setting.enableRevealObservableTokens.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.enableRevealObservableTokens.hint`,
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });

    game.settings.register(CONSTANTS.MODULE_ID, "activeGmVision", {
        name: "GM Vision",
        hint: "GM Vision",
        scope: "client",
        config: false,
        type: Boolean,
        default: false,
        onChange: GmVisionHelpers.handleGmVision,
    });

    game.settings.register(CONSTANTS.MODULE_ID, "doNotRevealMyMap", {
        name: `${CONSTANTS.MODULE_ID}.setting.doNotRevealMyMap.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.doNotRevealMyMap.hint`,
        scope: "world",
        config: true,
        default: true,
        type: Boolean,
    });

    game.settings.register(CONSTANTS.MODULE_ID, "invisibleTokensCanSee", {
        name: `${CONSTANTS.MODULE_ID}.setting.invisibleTokensCanSee.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.invisibleTokensCanSee.hint`,
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });

    game.settings.register(CONSTANTS.MODULE_ID, "invisibleTokensEmitLight", {
        name: `${CONSTANTS.MODULE_ID}.setting.invisibleTokensEmitLight.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.invisibleTokensEmitLight.hint`,
        scope: "world",
        config: true,
        default: false,
        type: Boolean,
    });

    game.settings.register(CONSTANTS.MODULE_ID, "debug", {
        name: `${CONSTANTS.MODULE_ID}.setting.debug.name`,
        hint: `${CONSTANTS.MODULE_ID}.setting.debug.hint`,
        scope: "client",
        config: true,
        default: false,
        type: Boolean,
    });
};

export const registerKeyBindings = function () {
    game.keybindings.register(CONSTANTS.MODULE_ID, "toggleVision", {
        name: `${CONSTANTS.MODULE_ID}.keybinding.toggleVision.name`,
        hint: `${CONSTANTS.MODULE_ID}.keybinding.toggleVision.hint`,
        // editable: [{ key: "KeyI" }],
        // Ctrl + I
        editable: [{ key: "KeyI", modifiers: [KeyboardManager.MODIFIER_KEYS.CONTROL] }],
        restricted: true,
        onDown: IgnoreVisionHelpers.handleKeybindingIgnoreVision,
    });

    game.keybindings.register(CONSTANTS.MODULE_ID, "activeGmVision", {
        name: `${CONSTANTS.MODULE_ID}.keybinding.activeGmVision.name`,
        hint: `${CONSTANTS.MODULE_ID}.keybinding.activeGmVision.hint`,
        editable: [{ key: "KeyG", modifiers: [KeyboardManager.MODIFIER_KEYS.CONTROL] }],
        restricted: true,
        onDown: GmVisionHelpers.handleKeybindingGmVision,
        // onDown: () => {
        //   if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
        //     return;
        //   }

        //   game.settings.set(CONSTANTS.MODULE_ID, "activeGmVision", !activeGmVision);

        //   return true;
        // },
    });
};
