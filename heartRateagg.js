const fs = require('fs');

// Read and parse the input JSON file
const heartRateData = JSON.parse(fs.readFileSync('heartrate.json', 'utf-8'));

// Perform aggregation using reduce()
const aggregatedData = heartRateData.reduce((result, measurement) => {
  // Extract the date from the startTime
  const date = measurement.timestamps.startTime.substring(0, 10);

  // Check if aggregation entry already exists for the date
  const aggregation = result.find(item => item.date === date);

  if (aggregation) {
    // Update the existing aggregation entry
    aggregation.min = Math.min(aggregation.min, measurement.beatsPerMinute);
    aggregation.max = Math.max(aggregation.max, measurement.beatsPerMinute);
    aggregation.bps.push(measurement.beatsPerMinute);
    aggregation.latestDataTimestamp = measurement.timestamps.endTime > aggregation.latestDataTimestamp
      ? measurement.timestamps.endTime
      : aggregation.latestDataTimestamp;
  } else {
    // Create a new aggregation entry
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

// Calculate the median for each aggregation entry
aggregatedData.forEach(aggregation => {
  const sortedBPMs = aggregation.bps.sort((a, b) => a - b);
  const mid = Math.floor(sortedBPMs.length / 2);
  aggregation.median = sortedBPMs.length % 2 === 0
    ? (sortedBPMs[mid] + sortedBPMs[mid - 1]) / 2
    : sortedBPMs[mid];
  delete aggregation.bps;
});

// Write the aggregated data to the output JSON file
fs.writeFileSync('output.json', JSON.stringify(aggregatedData, null, 2));
