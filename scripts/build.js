const { rollup } = require('rollup');
const chalk = require('chalk');
const Stats = require('./stats');
const rollupConfig = require('./rollup.config');

async function build(rollupResult, options) {
  console.log(`${chalk.bgYellow.black(' BUILDING ')} ${options.file}`);
  try {
    await rollupResult.write(options);
  } catch (error) {
    console.log(`${chalk.bgRed.black(' OH NOES! ')} ${options.file}\n`);
    handleRollupError(error);
    throw error;
  }
  console.log(`${chalk.bgGreen.black(' COMPLETE ')} ${options.file}\n`);
}

function handleRollupError(error) {
  loggedErrors.add(error);
  if (!error.code) {
    console.error(error);
    return;
  }
  console.error(
    `\x1b[31m-- ${error.code}${error.plugin ? ` (${error.plugin})` : ''} --`
  );
  console.error(error.message);
  const { file, line, column } = error.loc;
  if (file) {
    // This looks like an error from Rollup, e.g. missing export.
    // We'll use the accurate line numbers provided by Rollup but
    // use Babel code frame because it looks nicer.
    const rawLines = fs.readFileSync(file, 'utf-8');
    // column + 1 is required due to rollup counting column start position from 0
    // whereas babel-code-frame counts from 1
    const frame = codeFrame(rawLines, line, column + 1, {
      highlightCode: true,
    });
    console.error(frame);
  } else {
    // This looks like an error from a plugin (e.g. Babel).
    // In this case we'll resort to displaying the provided code frame
    // because we can't be sure the reported location is accurate.
    console.error(error.codeFrame);
  }
}

async function buildEverything() {
  try {
    const result = await rollup(rollupConfig.rollupInputConfig);
    await Promise.all(
      rollupConfig.bundles.map(async bundle => {
        await build(result, bundle);
      })
    );
  } catch (error) {
    console.log(`${chalk.bgRed.black(' SOMETHING WENT WRONG ')}\n`);
    handleRollupError(error);
    throw error;
  }

  console.log(Stats.printResults());
  Stats.saveResults();
}

buildEverything();
