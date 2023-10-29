import CONSTANTS from "./constants";

export function registerDoNotRevealMyMap(token, changes, data) {
  if (game.settings.get(CONSTANTS.MODULE_ID, "doNotRevealMyMap")) {
    if ((changes?.x == token?.x && changes?.y == token?.y) || data.animate === false) {
      return;
    }

    let target = token._object.getCenter(changes?.x ?? token.x, changes?.y ?? token.y);
    if (game.settings.get(CONSTANTS.MODULE_ID, "doNotRevealMyMap") && token._object.checkCollision(target)) {
      data.animate = false;
    }
  }
}
