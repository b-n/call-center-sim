import Agent from './agent'

class Call {

  private inProgress: boolean = true
  private onCall: boolean = false
  private abandonend: boolean = false
  private totalTicks: number = 0
  private timeToAbandon: number = 0
  private successful: boolean = false
  private agent: Agent
  private waitTime: number = 0

  private expectedAHT: number
  private maxWaitTime: number
  private startedAtTick: number
  
  constructor({
    expectedAHT,
    maxWaitTime,
    startedAtTick,
  }: CallOptions) {
    this.expectedAHT = expectedAHT
    this.maxWaitTime = maxWaitTime + (randn_bm() * 120)
    this.startedAtTick = startedAtTick
  }

  tick() {
    if (!this.inProgress) return
    this.totalTicks++

    if (!this.onCall) {
      this.waitTime++;
      if (this.totalTicks > this.maxWaitTime) {
        this.abandonend = true
        this.inProgress = false
        this.timeToAbandon = this.totalTicks
        return
      }
    }

    if (this.onCall && this.totalTicks > this.expectedAHT) {
      this.inProgress = false
      this.agent.setAvailable(true)
    }
  }

  setAgent(agent: Agent) {
    this.agent = agent 
    this.onCall = true
    this.waitTime = this.totalTicks
    this.successful = true
    this.agent.setAvailable(false)
  }

  isWaiting() { return this.inProgress && !this.onCall }
  isOnCall() { return this.onCall }
  isAbandonend() { return this.abandonend }
  isSuccessful() { return this.successful }
  getTimeToAbandon() { return this.timeToAbandon }
  getWaitTime() { return this.waitTime }
  getStartedAtTick() { return this.startedAtTick }
}

// Standard Normal variate using Box-Muller transform.
const randn_bm = (): number => {
    var u = 0, v = 0;
    while(u === 0) u = Math.random();
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

export default Call;
