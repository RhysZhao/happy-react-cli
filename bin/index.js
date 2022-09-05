#! /usr/bin/env node

const { program } = require('commander');
const chalk = require('chalk');
const create = require('../utils/create.js');
const figlet = require('figlet');

// 定义项目描述与帮助
program.name('happy-react-cli').description('a custom CLI to react').usage(`<command> [option]`).version(`1.0.0`);
program
  .command('init [project-name]')
  .description('init a new project')
  .option('-f, --force', 'overwrite target directory if it exists')
  .action((projectName, cmd) => {
    create({ projectName, ...cmd });
  });

program.on('--help', function () {
  console.log(
    '\r\n' +
      figlet.textSync('happy-react-cli', {
        font: 'Slant',
        horizontalLayout: 'default',
        verticalLayout: 'default',
        width: 80,
        whitespaceBreak: true
      })
  );
  console.log(`\nRun ${chalk.yellow('happy-react-cli <command> --help')} for detail usage of given command.`);
});
program.parse();
