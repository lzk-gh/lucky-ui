import { readFileSync } from 'fs';
import { resolve } from 'path';
import pc from 'picocolors';

const msgPath = resolve(process.cwd(), process.argv[2]);
const msg = readFileSync(msgPath, 'utf-8').trim();

const releaseRE = /^v\d/;
const commitRE =
  /^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?: .{1,50}/;

if (!releaseRE.test(msg) && !commitRE.test(msg)) {
  console.log();
  console.error(
    `  ${pc.white(pc.bgRed(' ERROR '))} ${pc.red(
      'invalid commit message format.'
    )}\n\n` +
      pc.red(
        '  Proper commit message format is required for automated changelog generation. Examples:\n\n'
      ) +
      `    ${pc.green('feat(components): add new button component')}\n` +
      `    ${pc.green('fix(core): handle edge case')}\n` +
      `    ${pc.green('docs: update API documentation')}\n\n` +
      pc.red('  See .github/commit-convention.md for more details.\n')
  );
  process.exit(1);
}
