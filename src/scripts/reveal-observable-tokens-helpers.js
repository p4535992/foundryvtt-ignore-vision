import { HatchFilter } from "./HatchFilter.js";
import CONSTANTS from "./constants.js";

export class RevealObservableTokensHelpers {
    static registerRevealObservableTokens() {
        if (
            game.settings.get(CONSTANTS.MODULE_ID, "enableRevealObservableTokens") &&
            !game.modules.get("reveal-observable-tokens")?.active
        ) {
            if (game.user.isGM || game.settings.get("core", "noCanvas")) {
                return;
            }

            const testVisiblity = foundry.utils.isNewerVersion(game.version, 12)
                ? (token) => {
                      const { width, height } = token.getSize();
                      const tolerance = Math.min(width, height) / 4;

                      return canvas.visibility.testVisibility(token.center, { tolerance, object: token });
                  }
                : (token) => {
                      const tolerance = Math.min(token.w, token.h) / 4;
                      if (foundry.utils.isNewerVersion(game.version, 12)) {
                          return canvas.visibility.testVisibility(token.center, { tolerance, object: token });
                      } else {
                          return canvas.effects.visibility.testVisibility(token.center, { tolerance, object: token });
                      }
                  };

            CONFIG.Token.objectClass = class extends CONFIG.Token.objectClass {
                /** @override */
                get isVisible() {
                    if (
                        canvas.scene.tokenVision &&
                        !this.document.hidden &&
                        this.actor?.testUserPermission(game.user, "OBSERVER") &&
                        !canvas.effects.visionSources.get(this.sourceId)?.active
                    ) {
                        this.detectionFilter = undefined;

                        if (!testVisiblity(this)) {
                            this.detectionFilter = hatchFilter;
                        }

                        return true;
                    }

                    return super.isVisible;
                }
            };

            const hatchFilter = HatchFilter.create();
        }
    }
}
