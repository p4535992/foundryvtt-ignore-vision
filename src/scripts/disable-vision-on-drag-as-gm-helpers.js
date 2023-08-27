let isMouseDown = false;
let isTokenWithSight = false;

export function registerDisableVisionOnDragAsGM() {
  if (game.settings.get(CONSTANTS.MODULE_NAME, "disableVisionOnDragAsGM")) {
    libWrapper.register(CONSTANTS.MODULE_NAME, "Token.prototype._onDragLeftStart", onDragLeftStartHandler, "WRAPPER");

    libWrapper.register(CONSTANTS.MODULE_NAME, "Token.prototype._onDragLeftMove", onDragLeftMoveHandler, "WRAPPER");

    libWrapper.register(CONSTANTS.MODULE_NAME, "Token.prototype._onDragLeftDrop", onDragLeftDropHandler, "WRAPPER");

    libWrapper.register(CONSTANTS.MODULE_NAME, "Token.prototype._onDragLeftCancel", onDragLeftCancelHandler, "WRAPPER");
  }
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
