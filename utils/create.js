/*
 * Author  rhys.zhao
 * Date  2022-09-02 13:22:04
 * LastEditors  rhys.zhao
 * LastEditTime  2022-09-05 15:54:14
 * Description 创建项目
 */

const { resolve } = require('path');
const fs = require('fs-extra'); // 文件IO工具
const inquirer = require('inquirer'); // 交互式问答工具
const chalk = require('chalk'); // 控制台彩色字体工具
const ora = require('ora'); // 控制台loading工具
const downloadGitRepo = require('download-git-repo'); // 下载模板工具

const { getGitUser, runCmd } = require('./common.js');

// 模板地址, 可配置自己的脚手架模板
const repoMap = {
  webpack: 'github:github.com:RhysZhao/react-router-v6-demo',
  vite: 'github:github.com:RhysZhao/react-router-v6-demo'
};

module.exports = async function ({ projectName, force }) {
  // 项目名称为空，提示输入项目名称
  if (!projectName) {
    const res = await inquirer.prompt([
      {
        type: 'input',
        name: 'projectName',
        message: '请输入你的项目名称:',
        default: 'my-project'
      }
    ]);
    projectName = res.projectName;
  }

  const cwd = process.cwd();
  const targetDir = resolve(cwd, `${projectName}`);

  // 创建项目已存在，提示是否覆盖
  if (fs.existsSync(targetDir)) {
    if (force) {
      await fs.remove(targetDir);
    } else {
      const { isOverwrite } = await inquirer.prompt([
        {
          type: 'list',
          name: 'isOverwrite',
          message: '项目目录已存在。是否覆盖？',
          choices: [
            { name: '是', value: true },
            { name: '否', value: false }
          ]
        }
      ]);
      if (isOverwrite) {
        await fs.remove(targetDir);
      } else {
        console.log('已取消创建项目, 请修改项目名称并重试');
        return;
      }
    }
  }

  // 提示用户选择模板、安装工具
  const { templateType, installTool } = await inquirer.prompt([
    {
      type: 'list',
      name: 'templateType',
      message: '请选择项目模板:',
      default: 'webpack',
      choices: Object.keys(repoMap)
    },
    {
      type: 'list',
      name: 'installTool',
      message: '请选择安装方式:',
      default: 'cnpm',
      choices: ['cnpm', 'npm', 'yarn', 'pnpm']
    }
  ]);
  const repoUrl = repoMap[templateType];

  // 下载模板
  try {
    const spinner = ora();
    spinner.start('正在下载模板...');

    await downloadGitRepo(repoUrl, targetDir, async () => {
      spinner.succeed('模板下载完成');

      // 修改package.json里面的信息，项目名称与作者
      try {
        spinner.start('正在修改package.json...');
        const { name } = await getGitUser();
        const package = require(targetDir + '/package.json');
        package.name = projectName;
        package.author = name;
        fs.writeJSONSync(resolve(targetDir, 'package.json'), package, {
          spaces: 2
        });
        spinner.succeed('package.json修改完成');
      } catch (err) {
        spinner.fail('修改package.json失败');
        console.log(err);
      }

      // 安装依赖
      const installCmd =
        installTool === 'cnpm' ? 'npm install --registry=https://registry.npm.taobao.org' : `${installTool} install`;
      try {
        spinner.start('正在安装依赖...');
        await runCmd(`cd ${projectName} && ${installCmd}`);
        spinner.succeed('依赖安装完成');
        console.log(`请运行 ${chalk.yellow(`cd ${projectName} && npm start`)}  启动项目吧！`);
      } catch (err) {
        spinner.fail('依赖安装失败');
        console.log('请运行如下命令手动安装：\n');
        console.log(`${chalk.yellow(`cd ${projectName} && ${installCmd}`)}`);
      }
    });
  } catch (err) {
    spinner.fail('模板下载失败');
    console.log(err);
  }
};
