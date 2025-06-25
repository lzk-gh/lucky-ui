import { readFileSync } from 'fs';
import { resolve } from 'path';
import pc from 'picocolors';

// 处理命令行参数
const args = process.argv.slice(2);

// 显示帮助信息
if (args.includes('--help') || args.includes('-h') || args.length === 0) {
  console.log(`
${pc.bold(pc.blue('lucky ui 提交消息验证工具'))}

${pc.bold('用法:')}
  node scripts/verify-commit.js <commit-msg-file>

${pc.bold('参数:')}
  <commit-msg-file>  包含提交消息的文件路径

${pc.bold('示例:')}
  node scripts/verify-commit.js .git/COMMIT_EDITMSG

${pc.bold('支持的提交类型:')}
  ${pc.green('feat')}: 新功能
  ${pc.green('fix')}: 修复问题  
  ${pc.green('docs')}: 文档更新
  ${pc.green('style')}: 代码风格
  ${pc.green('refactor')}: 代码重构
  ${pc.green('perf')}: 性能优化
  ${pc.green('test')}: 测试相关
  ${pc.green('build')}: 构建系统
  ${pc.green('ci')}: CI/CD配置
  ${pc.green('chore')}: 项目维护
  ${pc.green('component')}: 组件相关 (lucky ui 特有)
  ${pc.green('theme')}: 主题系统 (lucky ui 特有)
  ${pc.green('release')}: 版本发布 (lucky ui 特有)

${pc.bold('提交消息格式:')}
  <type>(<scope>): <description>

${pc.bold('示例:')}
  ${pc.green('feat(button): 新增按钮加载状态支持')}
  ${pc.green('fix(input): 修复小程序环境下的焦点问题')}
  ${pc.green('docs(readme): 更新安装说明')}
`);
  process.exit(0);
}

// 获取提交消息文件路径
const msgPath = resolve(process.cwd(), args[0]);

// 检查文件是否存在
try {
  const msg = readFileSync(msgPath, 'utf-8').trim();

  // 发布版本的正则表达式
  const releaseRE = /^v\d/;

  // lucky ui 项目的提交消息正则表达式
  const commitRE =
    /^(revert: )?(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert|component|theme|release)(\(.+\))?: .{1,72}/;

  // lucky ui 允许的 type 列表
  const allowedTypes = [
    'feat', // 新功能
    'fix', // 修复问题
    'docs', // 文档更新
    'style', // 代码风格（格式化、ESLint修复等）
    'refactor', // 代码重构
    'perf', // 性能优化
    'test', // 测试相关
    'build', // 构建系统
    'ci', // CI/CD配置
    'chore', // 项目维护
    'revert', // 回滚提交
    // lucky ui 特定类型
    'component', // 组件相关
    'theme', // 主题系统
    'release', // 版本发布
  ];

  // lucky ui 允许的 scope 列表
  const allowedScopes = [
    // 包结构
    'core',
    'components',
    'icons',
    'theme',
    'utils',
    // 具体组件
    'button',
    'input',
    'card',
    'modal',
    'table',
    'form',
    'tabs',
    'toast',
    'dialog',
    'layout',
    'menu',
    'dropdown',
    'pagination',
    'upload',
    'datepicker',
    'select',
    'checkbox',
    'radio',
    'switch',
    'slider',
    'rate',
    'avatar',
    'badge',
    'tag',
    'progress',
    'skeleton',
    'empty',
    'result',
    // 开发环境
    'playground',
    'docs',
    'build',
    'ci',
    'deps',
    'test',
  ];

  // 详细验证函数
  function validateCommitMessage(message) {
    // 检查是否是发布版本
    if (releaseRE.test(message)) {
      return { valid: true };
    }

    // 基础格式检查
    if (!commitRE.test(message)) {
      return {
        valid: false,
        error: 'invalid_format',
        message: '提交消息格式不正确',
      };
    }

    // 解析提交消息
    const match = message.match(/^(revert: )?(\w+)(\(([^)]+)\))?: (.+)/);
    if (!match) {
      return {
        valid: false,
        error: 'parse_error',
        message: '无法解析提交消息',
      };
    }

    const [, revertPrefix, type, , scope, description] = match;

    // 验证 type
    if (!allowedTypes.includes(type)) {
      return {
        valid: false,
        error: 'invalid_type',
        type,
        message: `无效的提交类型: ${type}`,
      };
    }

    // 验证 scope（如果存在）
    if (scope && !allowedScopes.includes(scope)) {
      return {
        valid: false,
        error: 'invalid_scope',
        scope,
        message: `无效的作用域: ${scope}`,
      };
    }

    // 验证描述长度
    if (description.length > 72) {
      return {
        valid: false,
        error: 'too_long',
        message: `描述过长 (${description.length}/72 字符)`,
      };
    }

    if (description.length < 1) {
      return {
        valid: false,
        error: 'too_short',
        message: '描述不能为空',
      };
    }

    return { valid: true };
  }

  // 验证提交消息
  const validation = validateCommitMessage(msg);

  if (!validation.valid) {
    console.log();
    console.error(
      `  ${pc.white(pc.bgRed(' ERROR '))} ${pc.red(validation.message)}\n`
    );

    // 根据错误类型显示不同的帮助信息
    switch (validation.error) {
      case 'invalid_format':
        console.error(
          pc.red('  提交消息必须遵循约定式提交格式:\n\n') +
            `    ${pc.green('<type>(<scope>): <description>')}\n\n` +
            pc.red('  示例:\n') +
            `    ${pc.green('feat(button): 新增按钮加载状态支持')}\n` +
            `    ${pc.green('fix(input): 修复小程序环境下的焦点问题')}\n` +
            `    ${pc.green('docs(readme): 更新安装说明')}\n`
        );
        break;

      case 'invalid_type':
        console.error(
          pc.red(`  无效的提交类型: ${pc.yellow(validation.type)}\n\n`) +
            pc.red('  允许的类型:\n') +
            `    ${pc.green('feat')}: 新功能\n` +
            `    ${pc.green('fix')}: 修复问题\n` +
            `    ${pc.green('docs')}: 文档更新\n` +
            `    ${pc.green('style')}: 代码风格\n` +
            `    ${pc.green('refactor')}: 代码重构\n` +
            `    ${pc.green('perf')}: 性能优化\n` +
            `    ${pc.green('test')}: 测试相关\n` +
            `    ${pc.green('build')}: 构建系统\n` +
            `    ${pc.green('ci')}: CI/CD配置\n` +
            `    ${pc.green('chore')}: 项目维护\n` +
            `    ${pc.green('component')}: 组件相关 (lucky ui 特有)\n` +
            `    ${pc.green('theme')}: 主题系统 (lucky ui 特有)\n` +
            `    ${pc.green('release')}: 版本发布 (lucky ui 特有)\n`
        );
        break;

      case 'invalid_scope':
        console.error(
          pc.red(`  无效的作用域: ${pc.yellow(validation.scope)}\n\n`) +
            pc.red('  常用作用域:\n') +
            `    ${pc.cyan('组件')}: button, input, card, modal, table, form...\n` +
            `    ${pc.cyan('模块')}: core, components, icons, theme, utils\n` +
            `    ${pc.cyan('环境')}: playground, docs, build, ci, test\n\n` +
            pc.red('  示例:\n') +
            `    ${pc.green('feat(button): 新增按钮组件')}\n` +
            `    ${pc.green('fix(core): 修复组件注册问题')}\n` +
            `    ${pc.green('docs(playground): 更新演示页面')}\n`
        );
        break;

      case 'too_long':
        console.error(
          pc.red('  提交描述过长，请保持在72个字符以内\n\n') +
            pc.red('  当前长度: ') +
            pc.yellow(`${msg.split(': ')[1]?.length || 0}/72`) +
            '\n\n' +
            pc.red('  建议:\n') +
            `    • 使用简洁明了的描述\n` +
            `    • 详细信息可以在提交正文中说明\n` +
            `    • 避免冗余的词汇\n`
        );
        break;

      case 'too_short':
        console.error(
          pc.red('  提交描述不能为空\n\n') +
            pc.red('  示例:\n') +
            `    ${pc.green('feat(button): 新增按钮组件')}\n` +
            `    ${pc.green('fix(input): 修复焦点问题')}\n`
        );
        break;

      default:
        console.error(
          pc.red('  提交消息格式不正确\n\n') +
            pc.red('  请查看项目的提交规范文档获取更多信息\n')
        );
    }

    process.exit(1);
  }

  // 验证通过，显示成功信息
  console.log(`${pc.green('✓')} ${pc.gray('提交消息格式正确')}`);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.error(`${pc.red('错误:')} 找不到文件: ${msgPath}`);
    console.error(
      `${pc.gray('用法:')} node scripts/verify-commit.js <commit-msg-file>`
    );
    console.error(`${pc.gray('帮助:')} node scripts/verify-commit.js --help`);
  } else {
    console.error(`${pc.red('错误:')} ${error.message}`);
  }
  process.exit(1);
}
