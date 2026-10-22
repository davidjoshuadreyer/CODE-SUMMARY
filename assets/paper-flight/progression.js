(() => {
  'use strict';
  const KEY = 'tesselate-paper-flight-v1';
  const LIMIT = 1e9;
  const clamp = (value, min, max, fallback = min) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback;
  const integer = (value, max = LIMIT) => Math.floor(clamp(value, 0, max));
  const config = value => ({
    wing: clamp(value?.wing, 0, 100, 50),
    balance: clamp(value?.balance, 0, 100, 50),
    trim: clamp(value?.trim, -6, 10, 2)
  });
  const goals = [
    {id:'coast', title:'Find your wings', description:'Fly 300 m in one throw.', reward:25, target:300, metric:d=>d.best},
    {id:'passage', title:'Across the passage', description:'Fly 600 m in one throw.', reward:45, target:600, metric:d=>d.best},
    {id:'horizon', title:'A new horizon', description:'Fly 1,000 m in one throw.', reward:70, target:1000, metric:d=>d.best},
    {id:'thermal', title:'Read the air', description:'Spend 3 seconds in thermals in one flight.', reward:35, target:3, metric:d=>d.stats.thermalTime},
    {id:'efficient', title:'A clean glide', description:'Fly 450 m without stalling.', reward:40, target:450, metric:d=>d.stats.efficientDistance},
    {id:'altitude', title:'Room to glide', description:'Reach 120 m above the waves.', reward:35, target:120, metric:d=>d.stats.maxHeight}
  ];

  function flightRecord(value = {}) {
    return {
      distance:integer(value.distance ?? value.x),
      time:clamp(value.time, 0, 3600),
      maxHeight:clamp(value.maxHeight, 0, 10000),
      maxSpeed:clamp(value.maxSpeed, 0, 1000),
      thermalTime:clamp(value.thermalTime, 0, 3600),
      stalls:integer(value.stalls, 10000), crashed:value.crashed===true,
      config:config(value.config),
      explorationBonus:integer(value.explorationBonus, 1000),
      discoveries:integer(value.discoveries, 5), kitesTagged:integer(value.kitesTagged, 5), ribbons:integer(value.ribbons,5),
      reward:integer(value.reward)
    };
  }

  function sanitize(value) {
    const v = value && typeof value === 'object' ? value : {};
    return {
      balance:integer(v.balance), best:integer(v.best),
      levels:[0, 1, 2].map(i => integer(v.levels?.[i], 8)),
      config:config(v.config), flights:integer(v.flights),
      history:Array.isArray(v.history) ? v.history.filter(item => item && typeof item === 'object').slice(0, 8).map(flightRecord) : [],
      completed:Array.isArray(v.completed) ? [...new Set(v.completed.filter(id => goals.some(goal => goal.id === id)))] : [],
      stats:{thermalTime:clamp(v.stats?.thermalTime, 0, 3600), efficientDistance:integer(v.stats?.efficientDistance), maxHeight:clamp(v.stats?.maxHeight, 0, 10000)}
    };
  }

  function load(storage) {
    let raw;
    try { raw = storage.getItem(KEY); } catch { return {data:sanitize(null), storageOK:false}; }
    // A malformed old save should recover gracefully; storage itself may still work.
    try { return {data:sanitize(JSON.parse(raw)), storageOK:true}; }
    catch { return {data:sanitize(null), storageOK:true}; }
  }

  function save(storage, data) {
    try { storage.setItem(KEY, JSON.stringify(sanitize(data))); return true; }
    catch { return false; }
  }

  function upgradeCost(data, i) {
    if (!Number.isInteger(i) || i < 0 || i > 2 || !data?.levels || data.levels[i] >= 8) return Infinity;
    return Math.round([22, 26, 24][i] * (1 + data.levels[i] * .55 + data.levels[i] ** 2 * .11));
  }

  function purchase(data, i) {
    const cost = upgradeCost(data, i);
    if (!Number.isFinite(cost) || !Number.isFinite(data.balance) || data.balance < cost || !Number.isInteger(data.levels[i]) || data.levels[i] < 0) return false;
    data.balance -= cost;
    data.levels[i]++;
    return true;
  }

  function contracts(data) {
    return goals.map(({metric, ...goal}) => ({...goal, done:data.completed.includes(goal.id), progress:data.completed.includes(goal.id) ? goal.target : Math.min(goal.target, metric(data))}));
  }

  function finish(data, flight) {
    const entry = flightRecord(flight);
    const previousBest = data.best;
    const record = entry.distance > previousBest;
    // Every experiment pays; a short flight can still buy the first upgrade.
    const baseReward = 24 + Math.floor(entry.distance / 12);
    data.best = Math.max(previousBest, entry.distance);
    data.flights++;
    data.stats.thermalTime = Math.max(data.stats.thermalTime, entry.thermalTime);
    data.stats.maxHeight = Math.max(data.stats.maxHeight, entry.maxHeight);
    if (entry.stalls === 0) data.stats.efficientDistance = Math.max(data.stats.efficientDistance, entry.distance);
    const bonuses = entry.explorationBonus ? [{label:'Exploration, kites & ribbons', reward:entry.explorationBonus}] : [];
    for (const goal of goals) {
      if (!data.completed.includes(goal.id) && goal.metric(data) >= goal.target) {
        data.completed.push(goal.id);
        bonuses.push({label:goal.title, reward:goal.reward});
      }
    }
    const reward = baseReward + bonuses.reduce((sum, bonus) => sum + bonus.reward, 0);
    data.balance = Math.min(LIMIT, data.balance + reward);
    entry.reward = reward;
    data.history.unshift(entry);
    data.history.length = Math.min(data.history.length, 8);
    return {reward, baseReward, bonuses, record, previousBest};
  }

  globalThis.FlightProgression = {load, save, upgradeCost, finish, purchase, contracts};
})();
