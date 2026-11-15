/** A burst's time is measured from the beginning of each emission cycle. */
export interface ParticleBurst {
  readonly time: number;
  readonly count: number;
}

export interface ParticleEmissionSchedule {
  readonly duration: number;
  readonly bursts: readonly ParticleBurst[];
  readonly loop?: boolean;
}

/** Advances an emitter's schedule independently of the lifetime of its particles. */
export class EmissionSchedule {
  private _schedule?: ParticleEmissionSchedule;
  private _bursts: ParticleBurst[] = [];
  private _elapsed = 0;
  private _started = false;

  get schedule(): ParticleEmissionSchedule | undefined {
    return this._schedule;
  }

  set schedule(value: ParticleEmissionSchedule | undefined) {
    if (value === undefined) {
      this._schedule = undefined;
      this._bursts = [];
      this.restart();
      return;
    }
    if (!Number.isFinite(value.duration) || value.duration <= 0) {
      throw new Error('Emission schedule duration must be finite and positive');
    }
    if (!Array.isArray(value.bursts)) {
      throw new Error('Emission schedule bursts must be an array');
    }
    const bursts = value.bursts.map((burst) => {
      if (!Number.isFinite(burst.time) || burst.time < 0 || burst.time >= value.duration) {
        throw new Error('Burst time must be within the emission cycle');
      }
      if (!Number.isInteger(burst.count) || burst.count < 0) {
        throw new Error('Burst count must be a nonnegative integer');
      }
      return Object.freeze({ time: burst.time, count: burst.count });
    });
    if (value.loop !== undefined && typeof value.loop !== 'boolean') {
      throw new Error('Emission schedule loop must be a boolean');
    }
    this._schedule = Object.freeze({ duration: value.duration, loop: value.loop ?? false, bursts: Object.freeze(bursts) });
    this._bursts = bursts.filter((burst) => burst.count > 0).sort((a, b) => a.time - b.time);
    this.restart();
  }

  restart(): void {
    this._elapsed = 0;
    this._started = false;
  }

  advance(elapsed: number): ParticleBurst[] {
    const schedule = this._schedule;
    if (!schedule || elapsed < 0 || !Number.isFinite(elapsed)) {
      return [];
    }
    const start = this._elapsed;
    const end = start + elapsed;
    const result: ParticleBurst[] = [];
    if (this._bursts.length === 0 || (!schedule.loop && start >= schedule.duration)) {
      this._elapsed = end;
      this._started = true;
      return result;
    }
    const firstCycle = schedule.loop ? Math.floor(start / schedule.duration) : 0;
    const lastCycle = schedule.loop ? Math.floor(end / schedule.duration) : 0;
    for (let cycle = firstCycle; cycle <= lastCycle; cycle++) {
      const origin = cycle * schedule.duration;
      for (const burst of this._bursts) {
        const time = origin + burst.time;
        if ((time > start || (!this._started && time === 0)) && time <= end) {
          result.push({ time: time - start, count: burst.count });
        }
      }
    }
    this._elapsed = end;
    this._started = true;
    return result;
  }
}
