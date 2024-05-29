import CONSTANTS from "./constants";

export class IgnoreVisionHelpers {
    static ignoreVisionEnable = false;
    static ignoreVisionToggle;

    static registerIgnoreVision() {
        // libWrapper.register(CONSTANTS.MODULE_ID, "SightLayer.prototype.tokenVision", tokenVision, "MIXED");
        libWrapper.register(
            CONSTANTS.MODULE_ID,
            "CanvasVisibility.prototype.tokenVision",
            IgnoreVisionHelpers.tokenVisionIgnoreVision,
            "MIXED",
        );
    }

    static getSceneControlButtonsIgnoreVision(controls) {
        if (!IgnoreVisionHelpers.ignoreVisionToggle) {
            IgnoreVisionHelpers.ignoreVisionToggle = {
                name: "ignoreVision",
                title: game.i18n.localize(`${CONSTANTS.MODULE_ID}.toggle`),
                icon: "far fa-eye-slash",
                toggle: true,
                active: IgnoreVisionHelpers.ignoreVisionEnable,
                onClick: IgnoreVisionHelpers._handleToggleIgnoreVision,
                visible: game.user.isGM,
            };
        }
        const tokenControls = controls.find((group) => group.name === "token").tools;
        tokenControls.push(IgnoreVisionHelpers.ignoreVisionToggle);
    }

    static tokenVisionIgnoreVision(wrapped) {
        if (IgnoreVisionHelpers.ignoreVisionEnable && game.user.isGM) {
            return false;
        }
        return wrapped();
    }

    static handleKeybindingIgnoreVision(value) {
        if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
            return false;
        }
        const newToggleState = !IgnoreVisionHelpers.ignoreVisionEnable;
        IgnoreVisionHelpers.ignoreVisionToggle.active = newToggleState;
        ui.controls.render();
        IgnoreVisionHelpers._handleToggleIgnoreVision(newToggleState);

        return true;
    }

    static _handleToggleIgnoreVision(toggled) {
        IgnoreVisionHelpers.ignoreVisionEnable = toggled;
        if (foundry.utils.isNewerVersion(game.version, 12)) {
            canvas.visibility.refresh();
        } else {
            canvas.effects.visibility.refresh();
        }
    }
}
