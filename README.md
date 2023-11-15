# Node.js Streams Demo Project

## Overview

This demo project is designed as a learning tool for understanding and utilizing Node.js streams. It focuses on two primary applications:

1. **Data Generation**: Utilizing streams to generate a large data file efficiently.
1. **Report Generation**: Demonstrating how to process data and generate a report without consuming excessive memory.

Both applications should run in a matter of seconds and be very memory efficient. On my machine, the Data Generation app took about 14s seconds to generate 1M lines into a ~280mb file, and the Report Generation app took under 3s to generate an aggregated report from the generated file.

The project is structured with simplicity and clarity in mind, making it ideal for exploring Node.js' stream processing. Each app serves a specific purpose in the demonstration of stream capabilities.

## Features

- **Efficient Data Handling**: Learn how to handle large volumes of data efficiently with minimal memory footprint.
- **Hands-On Examples**: The project includes practical examples showing the generation of a large data set and subsequent report generation.
- **Configurable Settings:** A configuration file allows for easy adjustments to the project's functionality without altering the core codebase.

## Getting Started

To get started with this project:

1. Ensure you have Node.js 18+ installed on your system
1. Clone or download this project to your local machine
1. Run npm install from within the project directory to install dependencies
1. Run `npm run data` to run the Data Generation app and generate the data file
1. Run `npm run report` to run the Report Generation app and generate the report file
1. Explore the `orders.ndjson` and `report.json` under the new `./data` folder

> PS. I've included smaller `orders.ndjson` and `report.json` for you to see what is generated without having to download and execute the source code.

## Learning Resources

For those new to Node.js or stream processing, here are some recommended resources to enhance your understanding:

- [Node.js Official Documentation](https://nodejs.org/en/docs/)
- [Stream Handbook](https://github.com/JasonGhent/stream-handbook-epub)
- [Node.js Streams: Everything You Need to Know](https://www.freecodecamp.org/news/node-js-streams-everything-you-need-to-know-c9141306be93/)
