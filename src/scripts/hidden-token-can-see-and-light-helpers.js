import CONSTANTS from "./constants";

export class HiddenTokenCanSeeAndLightHelpers {
    static registerVisionSourceCalculation() {
        libWrapper.register(
            CONSTANTS.MODULE_ID,
            "Token.prototype._isVisionSource",
            function (wrapped) {
                const visible = wrapped();
                if (visible) {
                    return true;
                }

                // If setting is not enabled or token is not hidden, don't change the behavior
                if (!game.settings.get(CONSTANTS.MODULE_ID, "invisibleTokensCanSee") || !this.document.hidden) {
                    return false;
                }
                if (foundry.utils.isNewerVersion(game.version, 12)) {
                    if (!canvas.visibility.tokenVision || !this.hasSight || game.user.isGM) {
                        return false;
                    }
                } else {
                    if (!canvas.effects.visibility.tokenVision || !this.hasSight || game.user.isGM) {
                        return false;
                    }
                }
                return this.controlled || this.isOwner;
            },
            "WRAPPER",
        );

        // NON SERVE E VA IN CONFLITTO
        // libWrapper.register(
        //   CONSTANTS.MODULE_ID,
        //   "Token.prototype.isVisible",
        //   function (wrapped) {
        //     const visible = wrapped();
        //     if (visible) {
        //       return true;
        //     }

        //     // If setting is not enabled or token is not hidden, don't change the behavior
        //     if (!game.settings.get(CONSTANTS.MODULE_ID, "invisibleTokensCanSee") || !this.document.hidden) {
        //       return false;
        //     }
        //     return !game.user.isGM && (this.controlled || this.isOwner);
        //   },
        //   "WRAPPER"
        // );
    }

    static registerLightSourceCalculation() {
        libWrapper.register(
            CONSTANTS.MODULE_ID,
            "Token.prototype.emitsLight",
            function (wrapped) {
                const visible = wrapped();
                if (visible) {
                    return true;
                }

                // If setting is not enabled or token is not hidden, don't change the behavior
                if (!game.settings.get(CONSTANTS.MODULE_ID, "invisibleTokensEmitLight") || !this.document.hidden) {
                    return false;
                }
                let light = this.document.light;
                if (!(light.dim || light.bright)) {
                    return false;
                }
                const darkness = canvas.darknessLevel;
                return darkness.between(light.darkness.min, light.darkness.max);
            },
            "WRAPPER",
        );
    }
}
