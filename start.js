#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import chalk from 'chalk';

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  infra: {
    command: 'docker',
    args: ['compose', '-f', 'docker-compose.yml', 'up', '-d', '--build'],
    cwd: path.join(__dirname, 'infra'),
  },
  infraDown: {
    command: 'docker',
    args: ['compose', '-f', 'docker-compose.yml', 'down', '--remove-orphans'],
    cwd: path.join(__dirname, 'infra'),
  },
  apiLogs: {
    command: 'docker',
    args: ['compose', '-f', 'docker-compose.yml', 'logs', '-f', 'api'],
    cwd: path.join(__dirname, 'infra'),
  },
  api: {
    url: 'http://localhost:3000/',
    timeout: 120000,
    retryInterval: 5000,
  },
  web: {
    command: 'npm',
    args: ['run', 'start'],
    cwd: path.join(__dirname, 'apps', 'web'),
  },
};

// --- Helper Functions ---

function startProcess(name, { command, args, cwd }, CtrC = true) {
  console.info(chalk.blue(`▶ Starting ${name}...`));
  const proc = spawn(command, args, { cwd, stdio: 'inherit', shell: true });
  proc.on('error', (err) => {
    console.error(chalk.red(`✖ Error starting ${name}:`), err);
    process.exit(1);
  });
  if (CtrC) {
    process.on('SIGINT', () => proc.kill());
  }
  return proc;
}

async function waitForApi() {
  console.info(chalk.yellow('Waiting for API to be ready...'));
  const start = Date.now();
  while (Date.now() - start < config.api.timeout) {
    try {
      await axios.get(config.api.url, { timeout: 3000 });
      console.info(chalk.green('✔ API is ready!'));
      return true;
    } catch (err) {
      await new Promise((r) => setTimeout(r, config.api.retryInterval));
    }
  }
  console.error(chalk.red('✖ Timeout waiting for API.'));
  return false;
}

function shutdown() {
  console.info(chalk.yellow('\nGracefully shutting down...'));
  spawn(config.infraDown.command, config.infraDown.args, {
    ...config.infraDown,
    stdio: 'ignore',
  });
  console.info(chalk.green('✔ Environment stopped.'));
  process.exit(0);
}

// --- Start Modes ---

async function startFullStack() {
  console.info(chalk.cyan('--- Starting Full Stack Environment ---'));
  startProcess('Infrastructure (Docker)', config.infra);

  const apiReady = await waitForApi();
  if (!apiReady) {
    shutdown();
    return;
  }

  startProcess('API Logs', config.apiLogs);
  startProcess('Web Frontend', config.web);

  process.on('SIGINT', shutdown);
  console.info(chalk.green('✔ Full Stack Environment is running. Press Ctrl+C to stop.'));
}

async function startApi() {
  console.info(chalk.cyan('--- Starting API Only Environment ---'));
  startProcess('Infrastructure (Docker)', config.infra);

  const apiReady = await waitForApi();
  if (!apiReady) {
    shutdown();
    return;
  }

  startProcess('API Logs', config.apiLogs, false);
  process.on('SIGINT', shutdown);
  console.info(chalk.green('✔ API Environment is running. Press Ctrl+C to stop.'));
}

function startWeb() {
  console.info(chalk.cyan('--- Starting Web Frontend Only ---'));
  startProcess('Web Frontend', config.web, false);
}

// --- Main Execution ---

async function main() {
  const mode = process.argv[2] || 'full';

  switch (mode) {
    case 'full':
      await startFullStack();
      break;
    case 'api':
      await startApi();
      break;
    case 'web':
      startWeb();
      break;
    default:
      console.error(chalk.red(`✖ Unknown mode: ${mode}`));
      console.info('Available modes: full, api, web');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error(chalk.red('An unexpected error occurred:'), err);
  shutdown();
});
