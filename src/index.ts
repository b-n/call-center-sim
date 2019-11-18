import { table } from 'table'
import Runner from './runner'

const totalRunners = 2000;

(() => {
  const runners: Array<Runner> = [] as Array<Runner>; 
  for (let i = 0; i < totalRunners; i++) {
    runners.push(new Runner({
      expectedCalls: 10 + (Math.floor(i / 500)) * 10,
      averageHandleTime: 600,
      numberOfAgents: 5,
    }))
  }

  let isRunning = true;
  while (isRunning) {
    for (const r of runners) {
      isRunning = isRunning && r.tick()
    }
  }

  const slaBrackets = [
    { seconds: 20 },
    { seconds: 40 },
    { seconds: 60 },
    { seconds: 120 },
  ];

  const totalStats: Map<number, Array<RunnerStats>> = new Map();
  for (const r of runners) {
    const stats = r.getStats(slaBrackets);
    const { totalCalls } = stats;
    if (!totalStats.has(totalCalls)) {
      totalStats.set(totalCalls, [] as Array<RunnerStats>)
    }
    totalStats.get(totalCalls).push(stats)
  }

  const output = [ [
    'calls/hr',
    'total',
    'successful',
    'abandon',
    'avg AWT',
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
