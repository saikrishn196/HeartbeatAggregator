const fs = require('fs');
const heartRateData = JSON.parse(fs.readFileSync('heartrate.json', 'utf-8'));
const aggregatedData = heartRateData.reduce((result, measurement) => {
  const date = measurement.timestamps.startTime.substring(0, 10);
  const aggregation = result.find(item => item.date === date);
  if (aggregation) {
    aggregation.min = Math.min(aggregation.min, measurement.beatsPerMinute);
    aggregation.max = Math.max(aggregation.max, measurement.beatsPerMinute);
    aggregation.bps.push(measurement.beatsPerMinute);
    aggregation.latestDataTimestamp = measurement.timestamps.endTime > aggregation.latestDataTimestamp
      ? measurement.timestamps.endTime
      : aggregation.latestDataTimestamp;
  } else {
    result.push({
      date,
      min: measurement.beatsPerMinute,
      max: measurement.beatsPerMinute,
      bps: [measurement.beatsPerMinute],
      latestDataTimestamp: measurement.timestamps.endTime,
    });
  }
  return result;
}, []);
aggregatedData.forEach(aggregation => {
  const sortedBPMs = aggregation.bps.sort((a, b) => a - b);
  const mid = Math.floor(sortedBPMs.length / 2);
  aggregation.median = sortedBPMs.length % 2 === 0
    ? (sortedBPMs[mid] + sortedBPMs[mid - 1]) / 2
    : sortedBPMs[mid];
  delete aggregation.bps;
});
fs.writeFileSync('output.json', JSON.stringify(aggregatedData, null, 2));
