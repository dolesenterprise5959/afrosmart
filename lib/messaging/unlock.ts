// The call-unlock rule, isolated as a pure function so it can be unit-tested.
// A thread's call is unlocked once EVERY participant has sent at least one
// message (i.e. the buyer messaged and the seller replied).

export function isCallUnlocked(
  participants: string[],
  senderIds: Iterable<string>,
): boolean {
  if (participants.length === 0) return false;
  const senders = new Set(senderIds);
  return participants.every((p) => senders.has(p));
}
