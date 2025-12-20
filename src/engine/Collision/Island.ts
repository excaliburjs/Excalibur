import type { BodyConfig } from './Index';
import { CollisionType, type BodyComponent, type CollisionContact } from './Index';

export class Island {
  bodies: BodyComponent[] = [];
  contacts: CollisionContact[] = [];
  isSleeping = false;
  constructor(public config: BodyConfig) {}
  wake() {
    this.isSleeping = false;
    for (const body of this.bodies) {
      body.wake();
    }
  }

  sleep() {
    this.isSleeping = true;
    for (const body of this.bodies) {
      body.sleep();
    }
  }

  updateSleepState(elapsed: number) {
    let islandHasMotion = false;
    let allBodiesCanSleep = true;

    for (const body of this.bodies) {
      body.updateMotion(elapsed);

      if (!body.canFallAsleep) {
        allBodiesCanSleep &&= false;
      }
      if (body.canWakeUp) {
        islandHasMotion ||= true;
      }
    }

    // Wake entire island if ANY body has motion
    if (islandHasMotion) {
      this.wake();

      // Put entire island to sleep if ALL bodies are below threshold
    } else if (allBodiesCanSleep) {
      let minSleepTime = Infinity;
      for (const body of this.bodies) {
        minSleepTime = Math.min(minSleepTime, body.sleepTime);
      }

      // Only sleep if the ENTIRE island has been still long enough
      if (minSleepTime > this.config.sleepTimeThreshold) {
        this.sleep();
      }
    }
  }
}

export function buildContactIslands(config: BodyConfig, bodies: BodyComponent[], contacts: CollisionContact[]): Island[] {
  // Union-find to group connected bodies
  const parent = new Map<BodyComponent, BodyComponent>();

  function find(body: BodyComponent) {
    if (!parent.has(body)) {
      parent.set(body, body);
    }
    if (parent.get(body) !== body) {
      parent.set(body, find(parent.get(body)));
    }
    return parent.get(body);
  }

  function union(bodyA: BodyComponent, bodyB: BodyComponent) {
    const rootA = find(bodyA);
    const rootB = find(bodyB);
    if (rootA !== rootB) {
      parent.set(rootA, rootB);
    }
  }

  const bodyToContacts = new Map<BodyComponent, CollisionContact[]>();
  // Connect bodies through contacts
  for (const contact of contacts) {
    if (contact.bodyA.collisionType === CollisionType.Active && contact.bodyB.collisionType === CollisionType.Active) {
      union(contact.bodyA, contact.bodyB);
    }

    if (!bodyToContacts.has(contact.bodyA)) {
      bodyToContacts.set(contact.bodyA, []);
    }

    if (!bodyToContacts.has(contact.bodyB)) {
      bodyToContacts.set(contact.bodyB, []);
    }

    if (contact.bodyA.collisionType === CollisionType.Active) {
      bodyToContacts.get(contact.bodyA).push(contact);
    }

    if (contact.bodyB.collisionType === CollisionType.Active) {
      bodyToContacts.get(contact.bodyB).push(contact);
    }
  }

  // Group bodies by island
  const islandMap = new Map<BodyComponent, BodyComponent[]>();
  for (const body of bodies) {
    if (body.collisionType !== CollisionType.Active) {
      continue;
    }
    const root = find(body);
    if (!islandMap.has(root)) {
      islandMap.set(root, []);
    }
    islandMap.get(root).push(body);
  }

  return Array.from(islandMap.values()).map((bodies) => {
    const island = new Island(config);
    island.bodies = bodies;
    bodies.forEach((b) => (b.island = island));
    island.contacts = Array.from(new Set(bodies.flatMap((b) => bodyToContacts.get(b))));
    return island;
  });
}
