import { table } from 'table'
import Runner from './runner'

import configJSON from '../config/config.json'

(() => {
  const config = configJSON as SimulationOptions

  const {
    abandonSettings,
    simulations,
    simulationCount,
    slaIntervals
  } = config

  const runners: Array<Runner> = [] as Array<Runner>; 
  
  simulations.map(({name, callsPerHour, agentCount, averageWorkTime }) => {
    for (let i = 0; i < simulationCount; i++) {
      runners.push(new Runner({
        name: name,
        expectedCalls: callsPerHour,
        numberOfAgents: agentCount,
        averageHandleTime: averageWorkTime,
        abandonSettings
      }))
    }
  })

  let isRunning = true;
  while (isRunning) {
    for (const r of runners) {
      isRunning = isRunning && r.tick()
    }
  }

  const slaBrackets = slaIntervals.map(sla => ({seconds: sla}));

  const totalStats: Map<string, Array<RunnerStats>> = new Map();
  for (const r of runners) {
    const stats = r.getStats(slaBrackets);
    const { name } = stats;
    if (!totalStats.has(name)) {
      totalStats.set(name, [] as Array<RunnerStats>)
    }
    totalStats.get(name).push(stats)
  }

  const output = [ [
    'simulation',
    'total',
    'successful',
    'abandon',
    'avg WT',
  ] ]

  slaBrackets.map(({seconds}) => output[0].push(`${seconds}s`))

  for (const stats of totalStats) {
    const brackets = slaBrackets.reduce((a,c) => ({
      ...a,
      ['' + c.seconds]: [] 
    }), {} as Record<string, Array<number>>)

    stats[1].map(
      stat => stat.brackets.map(
        ({seconds, sla}) => brackets['' + seconds].push(sla)
      )
    );
    
    const total = stats[1].reduce((a, c) => a + c.totalCalls,0)
    const successful = stats[1].reduce((a, c) => a + c.calls.successful,0)
    const abandon = stats[1].reduce((a, c) => a + c.calls.abandonend,0)

    const totalAWT = stats[1].reduce((a, c) => a + c.calls.averageWaitTime,0)
    const averageAWT = totalAWT / stats[1].length;

    const d = [
      '' + stats[0],
      '' + total,
      '' + successful,
      '' + (abandon / total * 100).toFixed(2) + '%',
      '' + averageAWT.toFixed(2),
    ]

    slaBrackets.map(({seconds}) => d.push(
      '' + (brackets['' + seconds].reduce((a,c) => a + c, 0) / brackets['' + seconds].length * 100).toFixed(2) + '%'
    ));

    output.push(d)
  }

  console.log(table(output))
})()
