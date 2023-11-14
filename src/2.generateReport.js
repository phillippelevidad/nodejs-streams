import fs, { createWriteStream } from "fs";
import { config } from "./config.js";

// Check if orders file exists
// ===========================

if (!fs.existsSync(config.ORDERS_FILE)) {
  console.error(`Orders file not found: ${config.ORDERS_FILE}`);
  console.error("Please run `npm run data` first");
  process.exit(1);
}

// Process orders
// ==============

import { performance } from "perf_hooks";
import { pipeline } from "stream/promises";
import split from "split2";

const startTime = performance.now();

const report = {
  grandTotal: 0,
  customers: {},
  months: {},
  categories: {},
};

const input = fs.createReadStream(config.ORDERS_FILE);

const splitAndParse = split(JSON.parse);

async function* aggregate(stream) {
  for await (const data of stream) {
    report.grandTotal += data.orderTotal;

    report.customers[data.customer] =
      (report.customers[data.customer] ?? 0) + data.orderTotal;

    report.months[data.date.slice(0, 7)] =
      (report.months[data.date.slice(0, 7)] ?? 0) + data.orderTotal;

    for (const item of data.items) {
      report.categories[item.category] =
        (report.categories[item.category] ?? 0) +
        item.quantity * item.unitPrice;
    }
  }

  yield JSON.stringify(report, null, 2);
}

const output = createWriteStream(config.REPORT_FILE);

await pipeline(input, splitAndParse, aggregate, output);

const endTime = performance.now();
console.log(`Report written to ${config.REPORT_FILE}`);
console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)}s`);
process.exit(0);
