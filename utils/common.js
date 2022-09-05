/*
 * Author  rhys.zhao
 * Date  2022-09-02 16:12:59
 * LastEditors  rhys.zhao
 * LastEditTime  2022-09-05 15:40:07
 * Description 公共方法
 */

const childProcess = require('child_process');

// 运行shell命令
const runCmd = (cmd) => {
  return new Promise((resolve, reject) => {
    childProcess.exec(cmd, (err, ...arg) => {
      if (err) return reject(err);
      return resolve(...arg);
    });
  });
};

// 获取当前用户信息
const getGitUser = () => {
  return new Promise(async (resolve) => {
    const user = {};
    try {
      const name = await runCmd('git config user.name');
      const email = await runCmd('git config user.email');
      // 移除结尾的换行符
      if (name) user.name = name.replace(/\n/g, '');
      if (email) user.email = `<${email || ''}>`.replace(/\n/g, '');
    } catch (error) {
      console.error('获取用户Git信息失败');
      reject(error);
    } finally {
      resolve(user);
    }
  });
};

module.exports = { runCmd, getGitUser };
