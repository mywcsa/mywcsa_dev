const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
module.exports = function loader(mocks = {}) {
  const cache = new Map();
  function load(filename) {
    filename = path.resolve(filename);
    if (cache.has(filename)) return cache.get(filename).exports;
    const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText;
    const loaded = new Module(filename, module);
    loaded.paths = module.paths;
    cache.set(filename, loaded);
    const original = loaded.require.bind(loaded);
    loaded.require = (name) => {
      if (name === "server-only") return {};
      if (name in mocks) return mocks[name];
      if (name.startsWith(".") || name.startsWith("@/")) {
        let target = name.startsWith("@/")
          ? path.resolve(name.slice(2))
          : path.resolve(path.dirname(filename), name);
        if (!path.extname(target)) target += ".ts";
        return load(target);
      }
      return original(name);
    };
    loaded._compile(compiled, filename);
    return loaded.exports;
  }
  return load;
};
