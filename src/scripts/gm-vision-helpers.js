import { HatchFilter } from "./HatchFilter.js";
import CONSTANTS from "./constants.js";

export class GmVisionHelpers {
    static activeGmVision = false;

    static registerGmVision() {
        if (game.settings.get(CONSTANTS.MODULE_ID, "enableGmVision") && !game.modules.get("gm-vision")?.active) {
            if (game.user.isGM || game.settings.get("core", "noCanvas")) {
                return;
            }

            GmVisionHelpers.activeGmVision = game.settings.get(CONSTANTS.MODULE_ID, "activeGmVision");

            Hooks.on("getSceneControlButtons", (controls) => {
                const lighting = controls.find((c) => c.name === "lighting");

                if (!lighting) {
                    return;
                }

                lighting.icon = GmVisionHelpers.activeGmVision ? "fa-solid fa-lightbulb" : "fa-regular fa-lightbulb";
            });

            Hooks.on("renderSceneControls", (app, html) => {
                const lighting = html[0].querySelector(`.scene-control[data-control="lighting"]`);

                if (!lighting) {
                    return;
                }

                lighting.addEventListener("contextmenu", (event) => {
                    event.preventDefault();
                    // MOD 4535992
                    const active = game.settings.get(CONSTANTS.MODULE_ID, "activeGmVision");
                    game.settings.set(CONSTANTS.MODULE_ID, "activeGmVision", !active);
                });
            });

            let revealFog;

            Hooks.on("drawCanvasVisibility", (layer) => {
                revealFog = layer.addChild(
                    new PIXI.LegacyGraphics().beginFill(0xffffff).drawShape(canvas.dimensions.rect.clone()).endFill(),
                );
                revealFog.visible = false;
            });

            Hooks.on("sightRefresh", (layer) => {
                revealFog.visible = GmVisionHelpers.activeGmVision;
                canvas.effects.illumination.filter.uniforms.gmVision = GmVisionHelpers.activeGmVision;
            });

            /*
            if (foundry.utils.isNewerVersion(11, game.version)) {
                libWrapper.register(
                    CONSTANTS.MODULE_ID,
                    "CanvasVisibility.prototype.restrictVisibility",
                    function (wrapped) {
                        for (const token of canvas.tokens.placeables) {
                            token.gmVisible = false;
                        }

                        return wrapped();
                    },
                    libWrapper.WRAPPER,
                    { perf_mode: libWrapper.PERF_FAST },
                );
            }

            libWrapper.register(
                CONSTANTS.MODULE_ID,
                "Token.prototype.isVisible",
                function (wrapped) {
                    this.detectionFilter = undefined;
                    this.gmVisible = false;

                    const visible = wrapped();

                    if (
                        (GmVisionHelpers.activeGmVision && !visible) || //  && active
                        (visible && this.document.hidden) // && canvas.effects.visionSources.some((s) => s.active))
                    ) {
                        // this.detectionFilter = GMVisionDetectionFilter.instance;
                        this.detectionFilter = hatchFilter;
                        this.gmVisible = true;
                        // return true;
                    }

                    this.gmVisible = false;

                    // return visible || GmVisionHelpers.activeGmVision;

                    // Invisible token can see feature...
                    if (visible || GmVisionHelpers.activeGmVision) {
                        return true;
                    }

                    // If setting is not enabled or token is not hidden, don't change the behavior
                    if (!game.settings.get(CONSTANTS.MODULE_ID, "invisibleTokensCanSee") || !this.document.hidden) {
                        return false;
                    }
                    return !game.user.isGM && (this.controlled || this.isOwner);
                },
                libWrapper.WRAPPER,
                { perf_mode: libWrapper.PERF_FAST },
            );
            */

            CONFIG.Token.objectClass = class extends CONFIG.Token.objectClass {
                // @override
                get isVisible() {
                    // Fixes #9521 in V10
                    this.detectionFilter = undefined;

                    const visible = super.isVisible;

                    // if (!visible && active || visible && this.document.hidden) {
                    //     this.detectionFilter = hatchFilter;

                    //     return true;
                    // }

                    if (
                        (GmVisionHelpers.activeGmVision && !visible) || //  && active
                        (visible && this.document.hidden) // && canvas.effects.visionSources.some((s) => s.active))
                    ) {
                        this.detectionFilter = hatchFilter;
                        // this.gmVisible = true;
                        return true;
                    }

                    // return visible;
                    // Invisible token can see feature...
                    if (visible || GmVisionHelpers.activeGmVision) {
                        return true;
                    }

                    // If setting is not enabled or token is not hidden, don't change the behavior
                    if (!game.settings.get(CONSTANTS.MODULE_ID, "invisibleTokensCanSee") || !this.document.hidden) {
                        return false;
                    }
                    return !game.user.isGM && (this.controlled || this.isOwner);
                }
            };

            const hatchFilter = HatchFilter.create();
            /*
            Hooks.on("canvasPan", (canvas, { x, y, scale }) => {
                const { width, height } = canvas.app.screen;
                hatchFilter.uniforms.origin.x = width / 2 - x * scale;
                hatchFilter.uniforms.origin.y = height / 2 - y * scale;
                hatchFilter.uniforms.thickness = (canvas.dimensions.size / 25) * scale;
            });
            */
            VisualEffectsMaskingFilter.defaultUniforms.gmVision = false;
            VisualEffectsMaskingFilter.POST_PROCESS_TECHNIQUES.IGNORE_VISION_VARIANT_GM_VISION = {
                id: "IGNORE_VISION_VARIANT_GM_VISION",
                glsl: `if (gmVision) finalColor.rgb = sqrt(finalColor.rgb) * 0.5 + 0.5;`,
            };

            /*
            libWrapper.register(
                CONSTANTS.MODULE_ID,
                "VisualEffectsMaskingFilter.fragmentHeader",
                function (wrapped, filterMode) {
                    let header = wrapped(filterMode);

                    if (filterMode === VisualEffectsMaskingFilter.FILTER_MODES.ILLUMINATION) {
                        header += "\nuniform bool gmVision;\n";
                    }

                    return header;
                },
                libWrapper.WRAPPER,
            );

            libWrapper.register(
                CONSTANTS.MODULE_ID,
                "VisualEffectsMaskingFilter.fragmentShader",
                function (wrapped, filterMode, postProcessModes = []) {
                    if (filterMode === VisualEffectsMaskingFilter.FILTER_MODES.ILLUMINATION) {
                        postProcessModes = [...postProcessModes, "IGNORE_VISION_VARIANT_GM_VISION"];
                    }

                    return wrapped(filterMode, postProcessModes);
                },
                libWrapper.WRAPPER,
            );
            */

            VisualEffectsMaskingFilter.fragmentHeader = ((wrapped) =>
                function (filterMode) {
                    let header = wrapped.call(this, filterMode);

                    if (filterMode === VisualEffectsMaskingFilter.FILTER_MODES.ILLUMINATION) {
                        header += "\nuniform bool gmVision;\n";
                    }

                    return header;
                })(VisualEffectsMaskingFilter.fragmentHeader);

            VisualEffectsMaskingFilter.fragmentShader = ((wrapped) =>
                function (filterMode, postProcessModes = []) {
                    if (filterMode === VisualEffectsMaskingFilter.FILTER_MODES.ILLUMINATION) {
                        postProcessModes = [...postProcessModes, "IGNORE_VISION_VARIANT_GM_VISION"];
                    }

                    return wrapped.call(this, filterMode, postProcessModes);
                })(VisualEffectsMaskingFilter.fragmentShader);

            // if (foundry.utils.isNewerVersion(game.version, 11)) {
            //   Hooks.once("setup", setup);
            // } else {
            //   Hooks.once("setup", () => {
            //     if (!game.settings.get("core", "noCanvas")) {
            //       Hooks.once("canvasInit", setup);
            //     }
            //   });
            // }
        }
    }

    static handleKeybindingGmVision(value) {
        if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
            return;
        }

        game.settings.set(CONSTANTS.MODULE_ID, "activeGmVision", !GmVisionHelpers.activeGmVision);

        return true;
    }

    static handleGmVision(value) {
        if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
            return;
        }
        GmVisionHelpers.activeGmVision = value;
        if (foundry.utils.isNewerVersion(game.version, 12)) {
            canvas.perception.update({ refreshVision: true });
        } else {
            canvas.perception.update({ refreshVision: true }, true);
        }
        ui.controls.initialize();
    }
}
