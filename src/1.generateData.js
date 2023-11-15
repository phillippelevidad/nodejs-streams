// Run this file first. It will generate a file with random order data.
// -----

import DraftLog from "draftlog";
import Event from "events";
import fs from "fs";
import { performance } from "perf_hooks";
import { pipeline } from "stream/promises";
import { faker } from "@faker-js/faker";
import { stringify } from "ndjson";
import { config } from "./config.js";

const parameters = {
  numberOfCustomers: 1_000,
  numberOfCategories: 10,
  numberOfProducts: 100,
  numberOfOrders: 1_000_000,
};

const startTime = performance.now();

// Create data folder if not exists
if (!fs.existsSync(config.DATA_FOLDER)) {
  fs.mkdirSync(config.DATA_FOLDER);
}

// Generate a pool of customers
const customers = [];
while (customers.length < parameters.numberOfCustomers) {
  const customer = faker.person.fullName();
  if (customers.includes(customer)) continue;
  customers.push(customer);
}

// Generate a pool of categories
const categories = [];
while (categories.length < parameters.numberOfCategories) {
  const category = faker.commerce.department();
  if (categories.includes(category)) continue;
  categories.push(category);
}

// Generate a pool of products
const products = [];
while (products.length < parameters.numberOfProducts) {
  const product = faker.commerce.productName();
  if (products.includes(product)) continue;
  products.push(product);
}

// Use an Event for reporting progress
const progress = new Event();
DraftLog(console).addLineListener(process.stdin);
const print = console.draft("Initializing...");
progress.on("update", ({ ordersCount }) => {
  if (ordersCount === parameters.numberOfOrders) {
    print("Done!");
    return;
  }
  const threshold = Math.floor(parameters.numberOfOrders / 10);
  if (ordersCount % threshold === 0) {
    print(`${ordersCount} orders generated`);
    return;
  }
});

// Generate orders using a generator function
// The fact that it's a generator function helps peformance
// because it doesn't need to keep all orders in memory
async function* generateOrders() {
  for (let i = 0; i < parameters.numberOfOrders; i++) {
    const items = [];
    const numberOfItems = getRandom(1, 3);
    for (let i = 0; i < numberOfItems; i++) {
      const item = {
        product: products[getRandom(0, products.length - 1)],
        quantity: getRandom(1, 5),
        unitPrice: getRandom(100, 600),
        category: categories[getRandom(0, categories.length - 1)],
      };
      items.push(item);
    }

    const orderTotal = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );

    const order = {
      customer: customers[getRandom(0, customers.length - 1)],
      date: faker.date.past(),
      orderTotal,
      items,
    };

    progress.emit("update", { ordersCount: i });

    yield order;
  }
}

// Other steps of the processing pipeline
const serialize = stringify();
const output = fs.createWriteStream(config.ORDERS_FILE);

// Create a pipeline that will generate orders, serialize them to NDJSON
// and write them to the output file. This is a very efficient way of
// processing large amounts of data. Each order is processed as soon as
// it's generated, without having to accumulate all orders in memory.
await pipeline(generateOrders, serialize, output);

const endTime = performance.now();
console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)}s`);
process.exit(0);

function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
