export function tokenVision(wrapped) {
  if (window[`${CONSTANTS.MODULE_ID}`] && game.user.isGM) {
    return false;
  }
  return wrapped();
}
