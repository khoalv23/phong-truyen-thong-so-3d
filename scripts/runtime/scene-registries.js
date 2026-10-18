/** Runtime registration functions keep builder code independent of global arrays. */
export function registerInteractive(context, object) {
  context.interactive.push(object);
  return object;
}

export function registerRoomOnlyVisibility(context, entry) {
  context.roomOnlyVisibilityGroups.push(entry);
  return entry;
}

export function registerProximityIcon(context, entry) {
  context.expertProximityIcons.push(entry);
  return entry;
}

export function registerTurntable(context, entry) {
  context.spinningTurntables.push(entry);
  return entry;
}
