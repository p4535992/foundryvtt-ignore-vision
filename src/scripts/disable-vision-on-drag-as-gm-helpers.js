import CONSTANTS from "./constants";

export class DisableVisionOnDragAsGMHelpers {
    static isMouseDown = false;
    static isTokenWithSight = false;

    static registerDisableVisionOnDragAsGM() {
        if (game.settings.get(CONSTANTS.MODULE_ID, "disableVisionOnDragAsGM")) {
            libWrapper.register(
                CONSTANTS.MODULE_ID,
                "Token.prototype._onDragLeftStart",
                DisableVisionOnDragAsGMHelpers._onDragLeftStartHandler,
                "WRAPPER",
            );

            libWrapper.register(
                CONSTANTS.MODULE_ID,
                "Token.prototype._onDragLeftMove",
                DisableVisionOnDragAsGMHelpers._onDragLeftMoveHandler,
                "WRAPPER",
            );

            libWrapper.register(
                CONSTANTS.MODULE_ID,
                "Token.prototype._onDragLeftDrop",
                DisableVisionOnDragAsGMHelpers._onDragLeftDropHandler,
                "WRAPPER",
            );

            libWrapper.register(
                CONSTANTS.MODULE_ID,
                "Token.prototype._onDragLeftCancel",
                DisableVisionOnDragAsGMHelpers._onDragLeftCancelHandler,
                "WRAPPER",
            );
        }
    }

    static async _onDragLeftStartHandler(wrapped, ...args) {
        if (!game.user.isGM || !canvas.scene.tokenVision) {
            return wrapped.apply(this, args);
        }

        DisableVisionOnDragAsGMHelpers.isMouseDown = true;

        //Check to see if any of the controlled tokens use sight
        //Check to see if any token is interactive
        for (let t of canvas.tokens.controlled) {
            if (t.interactive && t.document.sight.enabled) {
                DisableVisionOnDragAsGMHelpers.isTokenWithSight = true;
                break;
            }
        }

        return wrapped.apply(this, args);
    }

    static async _onDragLeftMoveHandler(wrapped, ...args) {
        if (
            !game.user.isGM ||
            !canvas.scene.tokenVision ||
            !DisableVisionOnDragAsGMHelpers.isMouseDown ||
            !DisableVisionOnDragAsGMHelpers.isTokenWithSight
        ) {
            return wrapped.apply(this, args);
        }

        canvas.scene.tokenVision = false;
        canvas.perception.refresh();

        return wrapped.apply(this, args);
    }

    static _endDragHandler() {
        if (!game.user.isGM || !DisableVisionOnDragAsGMHelpers.isMouseDown) {
            return;
        }
        DisableVisionOnDragAsGMHelpers.isMouseDown = false;

        if (DisableVisionOnDragAsGMHelpers.isTokenWithSight) {
            canvas.scene.tokenVision = true;
            canvas.perception.refresh();
            DisableVisionOnDragAsGMHelpers.isTokenWithSight = false;
        }
    }

    static async _onDragLeftDropHandler(wrapped, ...args) {
        DisableVisionOnDragAsGMHelpers._endDragHandler();
        return wrapped.apply(this, args);
    }

    static async _onDragLeftCancelHandler(wrapped, ...args) {
        DisableVisionOnDragAsGMHelpers._endDragHandler();
        return wrapped.apply(this, args);
    }
}
