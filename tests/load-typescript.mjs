import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';

// Load the real implementation with explicit dependency replacements, without Next's runtime.
export function loadTypescript(relativePath, replacements = {}) {
  const file = new URL(`../${relativePath}`, import.meta.url);
  const require = createRequire(file);
  const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  });
  const exports = {};
  new Function('require', 'exports', outputText)(
    name => Object.hasOwn(replacements, name) ? replacements[name] : require(name),
    exports,
  );
  return exports;
}
