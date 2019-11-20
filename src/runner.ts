import Call from './call'
import Agent from './agent'

class Runner {

  public name: string

  private abandonSettings: AbandonSettings
  private expectedCalls: number
  private averageHandleTime: number
  private maxTicks: number = 3600

  private calls: Array<Call> = []
  private agents: Array<Agent> = []
  private totalTicks: number = 0
  
  constructor({
    name,
    expectedCalls,
    averageHandleTime,
    numberOfAgents,
    abandonSettings,
  }: RunnerOptions) {
    this.name = name
    this.abandonSettings = abandonSettings
    this.expectedCalls = expectedCalls
    this.averageHandleTime = averageHandleTime
    for (let i = 0; i < numberOfAgents; i++) {
      this.agents.push(new Agent({}))
    }
  }

  tick(): boolean {
    this.totalTicks++

    const waitingCalls: Array<Call> = this.calls.filter(call => call.isWaiting())

    //Routing
    if (waitingCalls.length > 0) {
      const availableAgents: Array<Agent> = this.agents.filter(agent => agent.isAvailable())

      while (waitingCalls.length > 0 && availableAgents.length > 0) {
        const call = waitingCalls.shift()
        call.setAgent(availableAgents.pop())
      }
    }

    //New Call?
    const remainingCalls = this.expectedCalls - this.calls.length
    const remainingTicks = this.maxTicks - this.totalTicks
    const nextCallProbability = remainingCalls / remainingTicks
    if (Math.random() < nextCallProbability) {
      this.calls.push(new Call({
        ...this.abandonSettings,
        startedAtTick: this.totalTicks,
        expectedAHT: this.averageHandleTime,
      }))
    }

    this.calls.map(call => call.tick())
    return this.totalTicks < this.maxTicks
  }

  getStats(brackets: Array<SLABrackets>): RunnerStats {
    //default Brackets
    
    const bracketResults = brackets.map(bracket => ({
      ...bracket,
      totalCalls: this.calls.length,
      inBracket: 0,
      outBracket: 0,
      sla: 0,
    }))

    const callResults = {
      successful: 0,
      abandonend: 0,
      totalWaitTime: 0,
      averageWaitTime: 0,
    }

    this.calls.map(call => {
      if (call.isSuccessful()) {
        callResults.successful++
        callResults.totalWaitTime += call.getWaitTime()
        bracketResults.map(bracket => {
          if (call.getWaitTime() <= bracket.seconds) {
            bracket.inBracket += 1;
          }
          else {
            bracket.outBracket += 1;
          }
          return bracket;
        })
      }
      if (call.isAbandonend()) callResults.abandonend++
    });

    callResults.averageWaitTime = callResults.totalWaitTime / callResults.successful

    return {
      name: this.name,
      totalCalls: this.calls.length,
      calls: callResults,
      brackets: bracketResults.map(bracket => ({
        ...bracket,
        sla: (+bracket.inBracket / +bracket.totalCalls)
      }))
    }
  }
}

export default Runner
