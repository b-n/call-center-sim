class Agent {

  private available: boolean = true

  constructor({}: AgentOptions) {
  
  }

  setAvailable(available: boolean) {
    this.available = available
  }

  isAvailable(): boolean {
    return this.available
  }
}

export default Agent
