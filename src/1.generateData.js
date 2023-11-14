// Run this file first. It will generate a file with random order data.
import DraftLog from "draftlog";
import Event from "events";
import { performance } from "perf_hooks";
import { faker } from "@faker-js/faker";
import { config } from "./config.js";

const startTime = performance.now();

const parameters = {
  numberOfCustomers: 1_000,
  numberOfCategories: 10,
  numberOfOrders: 1_000,
};

const customers = [];
while (customers.length < parameters.numberOfCustomers) {
  const customer = faker.person.fullName();
  if (customers.includes(customer)) continue;
  customers.push(customer);
}

const categories = [];
while (categories.length < parameters.numberOfCategories) {
  const category = faker.commerce.department();
  if (categories.includes(category)) continue;
  categories.push(category);
}

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

async function* generateOrders() {
  for (let i = 0; i < parameters.numberOfOrders; i++) {
    const items = [];
    const numberOfItems = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numberOfItems; i++) {
      const item = {
        product: faker.commerce.productName(),
        quantity: Math.floor(Math.random() * 5) + 1,
        unitPrice: Number(faker.commerce.price()),
        category: categories[Math.floor(Math.random() * categories.length)],
      };
      items.push(item);
    }

    const orderTotal = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );

    const order = {
      customer: customers[Math.floor(Math.random() * customers.length)],
      date: faker.date.past(),
      orderTotal,
      items,
    };

    progress.emit("update", { ordersCount: i });

    yield order;
  }
}

// Create data folder if not exists
import fs from "fs";
if (!fs.existsSync(config.DATA_FOLDER)) {
  fs.mkdirSync(config.DATA_FOLDER);
}

// Write orders to file using Node.js streams
import { pipeline } from "stream/promises";
import { stringify } from "ndjson";
import { createWriteStream } from "fs";

const output = createWriteStream(config.ORDERS_FILE);
const serialize = stringify();
await pipeline(generateOrders, serialize, output);

const endTime = performance.now();
console.log(`Time taken: ${((endTime - startTime) / 1000).toFixed(2)}s`);
process.exit(0);
