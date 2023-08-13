import CONSTANTS from "./scripts/constants.js";
import { registerKeyBindings, registerSettings } from "./scripts/settings.js";
import { GMVisionDetectionFilter } from "./scripts/GMVisionDetectionFilter.js";

let isMouseDown = false;
let isTokenWithSight = false;
let ignoreVisionToggle;
let activeGmVision = false;

Hooks.once("init", () => {
  window.ignoreVision = false;
  activeGmVision = false;

  registerSettings();
  registerKeyBindings();

  // libWrapper.register(CONSTANTS.MODULE_NAME, "SightLayer.prototype.tokenVision", tokenVision, "MIXED");
  libWrapper.register(CONSTANTS.MODULE_NAME, "CanvasVisibility.prototype.tokenVision", tokenVision, "MIXED");

  if (game.settings.get(CONSTANTS.MODULE_NAME, "disableVisionOnDragAsGM")) {
    libWrapper.register(CONSTANTS.MODULE_NAME, "Token.prototype._onDragLeftStart", onDragLeftStartHandler, "WRAPPER");

    libWrapper.register(CONSTANTS.MODULE_NAME, "Token.prototype._onDragLeftMove", onDragLeftMoveHandler, "WRAPPER");

    libWrapper.register(CONSTANTS.MODULE_NAME, "Token.prototype._onDragLeftDrop", onDragLeftDropHandler, "WRAPPER");

    libWrapper.register(CONSTANTS.MODULE_NAME, "Token.prototype._onDragLeftCancel", onDragLeftCancelHandler, "WRAPPER");
  }
});

Hooks.once("setup", () => {
  if (game.settings.get(CONSTANTS.MODULE_NAME, "enableGmVision")) {
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

        return visible || activeGmVision;
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
});

Hooks.once("ready", () => {
  // DO NOTHING
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (!ignoreVisionToggle) {
    ignoreVisionToggle = {
      name: "ignoreVision",
      title: game.i18n.localize(`${CONSTANTS.MODULE_NAME}.toggle`),
      icon: "far fa-eye-slash",
      toggle: true,
      active: ignoreVision,
      onClick: handleToggle,
      visible: game.user.isGM,
    };
  }
  const tokenControls = controls.find((group) => group.name === "token").tools;
  tokenControls.push(ignoreVisionToggle);
});

Hooks.on("preUpdateToken", (tokenDoc, change, options) => {
  if (game.settings.get(CONSTANTS.MODULE_NAME, "noTokenAnimationAsGM") && game.user.isGM) {
    options.animate = false;
  }
});

export function handleKeybinding(value) {
  if (!game.user.isGM || game.settings.get("core", "noCanvas")) {
    return false;
  }
  const newToggleState = !ignoreVision;
  ignoreVisionToggle.active = newToggleState;
  ui.controls.render();
  handleToggle(newToggleState);

  return true;
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

function handleToggle(toggled) {
  ignoreVision = toggled;
  canvas.effects.visibility.refresh();
}

function tokenVision(wrapped) {
  if (ignoreVision && game.user.isGM) {
    return false;
  }
  return wrapped();
}

async function onDragLeftStartHandler(wrapped, ...args) {
  if (!game.user.isGM || !canvas.scene.tokenVision) {
    return wrapped.apply(this, args);
  }

  isMouseDown = true;

  //Check to see if any of the controlled tokens use sight
  //Check to see if any token is interactive
  for (let t of canvas.tokens.controlled) {
    if (t.interactive && t.document.sight.enabled) {
      isTokenWithSight = true;
      break;
    }
  }

  return wrapped.apply(this, args);
}

async function onDragLeftMoveHandler(wrapped, ...args) {
  if (!game.user.isGM || !canvas.scene.tokenVision || !isMouseDown || !isTokenWithSight) {
    return wrapped.apply(this, args);
  }

  canvas.scene.tokenVision = false;
  canvas.perception.refresh();

  return wrapped.apply(this, args);
}

function endDragHandler() {
  if (!game.user.isGM || !isMouseDown) {
    return;
  }
  isMouseDown = false;

  if (isTokenWithSight) {
    canvas.scene.tokenVision = true;
    canvas.perception.refresh();
    isTokenWithSight = false;
  }
}

async function onDragLeftDropHandler(wrapped, ...args) {
  endDragHandler();
  return wrapped.apply(this, args);
}

async function onDragLeftCancelHandler(wrapped, ...args) {
  endDragHandler();
  return wrapped.apply(this, args);
}
