import type { Group } from 'three';
/** Live scene objects, kept outside serializable UI state. */
export const partRegistry = new Map<string, Group>();
