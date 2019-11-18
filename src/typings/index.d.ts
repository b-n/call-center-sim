interface CallOptions {
  expectedAHT: number
  maxWaitTime: number
  startedAtTick: number
}

interface RunnerOptions {
  averageHandleTime: number
  expectedCalls: number
  numberOfAgents: number
}

interface RunnerStats {
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
