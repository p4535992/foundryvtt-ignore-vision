import CONSTANTS from "./constants";

export class DoNotRevealMyMapHelpers {
  static registerDoNotRevealMyMap(token, changes, data) {
    if (game.settings.get(CONSTANTS.MODULE_ID, "doNotRevealMyMap")) {
      if ((changes?.x == token?.x && changes?.y == token?.y) || data.animate === false) {
        return;
      }

      let target = token._object.getCenter(changes?.x ?? token.x, changes?.y ?? token.y);
      if (token._object.checkCollision(target)) {
        data.animate = false;
      }

      if (!DoNotRevealMyMapHelpers._wallsBlockMovement(token, changes)) {
        return true;
      }
    }
  }

  /**
   * When checked, draggin tokens over scene walls will automatically force the token movement to be instant.
   * This setting helps GMs to not reveal map areas not meant to be seen by their players
   * (will not have any effect if the token movement animation is OFF).
   * @param {*} tdoc
   * @param {*} changes
   * @returns
   */
  static _wallsBlockMovement(tdoc, changes) {
    // if (!wallBlock) {
    //     return false;
    // }
    const sourceCenter = tdoc.object.center;
    const targetPos = { x: (changes.x ??= tdoc.x), y: (changes.y ??= tdoc.y) };
    const offset = { x: sourceCenter.x - tdoc.x, y: sourceCenter.y - tdoc.y };
    const targetCenter = { x: targetPos.x + offset.x, y: targetPos.y + offset.y };
    const ray = new Ray(sourceCenter, targetCenter);
    if (
      CONFIG.Canvas.polygonBackends.move.testCollision(ray.A, ray.B, {
        mode: "any",
        type: "move",
      })
    ) {
      return true;
    } else {
      return false;
    }
  }
}
