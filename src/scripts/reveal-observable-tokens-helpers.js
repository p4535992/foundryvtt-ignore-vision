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

            CONFIG.Token.objectClass =
                game.release.generation >= 12
                    ? class extends CONFIG.Token.objectClass {
                          /** @override */
                          get isVisible() {
                              if (
                                  canvas.scene.tokenVision &&
                                  !this.document.hidden &&
                                  !this.vision?.active &&
                                  this.actor?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)
                              ) {
                                  const { width, height } = this.getSize();
                                  const tolerance = Math.min(width, height) / 4;
                                  const visible = canvas.visibility.testVisibility(this.center, {
                                      tolerance,
                                      object: this,
                                  });

                                  this.detectionFilter = visible ? null : hatchFilter;

                                  return true;
                              }

                              return super.isVisible;
                          }
                      }
                    : class extends CONFIG.Token.objectClass {
                          /** @override */
                          get isVisible() {
                              if (
                                  canvas.scene.tokenVision &&
                                  !this.document.hidden &&
                                  !canvas.effects.visionSources.get(this.sourceId)?.active &&
                                  this.actor?.testUserPermission(game.user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)
                              ) {
                                  const tolerance = Math.min(this.w, this.h) / 4;
                                  const visible = canvas.effects.visibility.testVisibility(this.center, {
                                      tolerance,
                                      object: this,
                                  });

                                  this.detectionFilter = visible ? undefined : hatchFilter;

                                  return true;
                              }

                              return super.isVisible;
                          }
                      };

            const hatchFilter = HatchFilter.create();
        }
    }
}
