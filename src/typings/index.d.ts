interface SimulationOptions {
  name: string
  simulations: [{
    name: string,
    callsPerHour: number
    agentCount: number
    averageWorkTime: number
  }]
  simulationCount: number
  abandonSettings: AbandonSettings
  slaIntervals: Array<number>
}

interface AbandonSettings {
  averageTimeToAbandon: number
  oneSigmaWidth: number
}

interface CallOptions extends AbandonSettings {
  expectedAHT: number
  startedAtTick: number
}

interface RunnerOptions {
  name: string
  averageHandleTime: number
  expectedCalls: number
  numberOfAgents: number
  abandonSettings: AbandonSettings
}

interface RunnerStats {
  name: string
  totalCalls: number
  calls: {
    successful: number,
    abandonend: number,
    averageWaitTime: number,
  }
  brackets: Array<SLABracketsResponse>
}

interface SLABrackets {
  seconds: number
}

interface SLABracketsResponse extends SLABrackets {
  totalCalls: number
  inBracket: number
  outBracket: number
  sla: number
}

interface AgentOptions {}
