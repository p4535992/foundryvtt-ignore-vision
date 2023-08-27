import { GMVisionDetectionFilter } from "./GMVisionDetectionFilter.js";
import CONSTANTS from "./constants.js";

let activeGmVision = false;

export function registerGmVision() {
  if (game.settings.get(CONSTANTS.MODULE_NAME, "enableGmVision") && !game.modules.get("gm-vision")?.active) {
    if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
      return;
    }

    activeGmVision = game.settings.get(CONSTANTS.MODULE_NAME, "activeGmVision");

    Hooks.on("getSceneControlButtons", (controls) => {
      const lighting = controls.find((c) => c.name === "lighting");

      if (!lighting) {
        return;
      }

      lighting.icon = activeGmVision ? "fa-solid fa-lightbulb" : "fa-regular fa-lightbulb";
    });

    Hooks.on("drawCanvasVisibility", (layer) => {
      layer.gmVision = layer.addChild(
        new PIXI.LegacyGraphics().beginFill(0xffffff).drawShape(canvas.dimensions.rect.clone()).endFill()
      );
      layer.gmVision.visible = false;
    });

    Hooks.on("sightRefresh", (layer) => {
      layer.gmVision.visible = activeGmVision;
      canvas.effects.illumination.filter.uniforms.gmVision = activeGmVision;
    });

    libWrapper.register(
      CONSTANTS.MODULE_NAME,
      "CanvasVisibility.prototype.restrictVisibility",
      function (wrapped) {
        for (const token of canvas.tokens.placeables) {
          token.gmVisible = false;
        }

        return wrapped();
      },
      libWrapper.WRAPPER,
      { perf_mode: libWrapper.PERF_FAST }
    );

    libWrapper.register(
      CONSTANTS.MODULE_NAME,
      "Token.prototype.isVisible",
      function (wrapped) {
        this.detectionFilter = undefined;
        this.gmVisible = false;

        const visible = wrapped();

        if (
          (activeGmVision && !visible) ||
          (this.document.hidden && canvas.effects.visionSources.some((s) => s.active))
        ) {
          this.detectionFilter = GMVisionDetectionFilter.instance;
          this.gmVisible = true;
        }

        // return visible || activeGmVision;

        // Invisible token can see feature...
        if (visible || activeGmVision) {
          return true;
        }

        // If setting is not enabled or token is not hidden, don't change the behavior
        if (!game.settings.get(CONSTANTS.MODULE_NAME, "invisibleTokensCanSee") || !this.document.hidden) {
          return false;
        }
        return !game.user.isGM && (this.controlled || this.isOwner);
      },
      libWrapper.WRAPPER,
      { perf_mode: libWrapper.PERF_FAST }
    );

    Hooks.on("canvasPan", (canvas, constrained) => {
      GMVisionDetectionFilter.instance.thickness = Math.max(2 * Math.abs(constrained.scale), 1);
    });

    VisualEffectsMaskingFilter.defaultUniforms.gmVision = false;
    VisualEffectsMaskingFilter.POST_PROCESS_TECHNIQUES.IGNORE_VISION_VARIANT_GM_VISION = {
      id: "IGNORE_VISION_VARIANT_GM_VISION",
      glsl: `if (gmVision) finalColor.rgb = sqrt(finalColor.rgb) * 0.5 + 0.5;`,
    };

    libWrapper.register(
      CONSTANTS.MODULE_NAME,
      "VisualEffectsMaskingFilter.fragmentHeader",
      function (wrapped, filterMode) {
        let header = wrapped(filterMode);

        if (filterMode === VisualEffectsMaskingFilter.FILTER_MODES.ILLUMINATION) {
          header += "\nuniform bool gmVision;\n";
        }

        return header;
      },
      libWrapper.WRAPPER
    );

    libWrapper.register(
      CONSTANTS.MODULE_NAME,
      "VisualEffectsMaskingFilter.fragmentShader",
      function (wrapped, filterMode, postProcessModes = []) {
        if (filterMode === VisualEffectsMaskingFilter.FILTER_MODES.ILLUMINATION) {
          postProcessModes = [...postProcessModes, "IGNORE_VISION_VARIANT_GM_VISION"];
        }

        return wrapped(filterMode, postProcessModes);
      },
      libWrapper.WRAPPER
    );

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

export function handleKeybindingGmVision(value) {
  if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
    return;
  }

  game.settings.set(CONSTANTS.MODULE_NAME, "activeGmVision", !activeGmVision);

  return true;
}

export function handleGmVision(value) {
  if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
    return;
  }
  activeGmVision = value;
  canvas.perception.update({ refreshVision: true }, true);
  ui.controls.initialize();
}
