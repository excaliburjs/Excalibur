export type MaybeKnownComponent<Component, TKnownComponents> = Component extends TKnownComponents ? Component : Component | undefined;
