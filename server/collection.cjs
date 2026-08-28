const fs = require("node:fs");
const path = require("node:path");

const collectionDirectory = path.resolve(__dirname, "..", "collection");

const findFiles = (directory, fileName) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return findFiles(entryPath, fileName);
    return entry.name === fileName ? [entryPath] : [];
  });

const escapeRegularExpression = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const loadRoutes = (directory = collectionDirectory) =>
  findFiles(directory, "index.bru")
    .map((requestFile) => {
      const source = fs.readFileSync(requestFile, "utf8");
      const request = source.match(
        /^(get|post|put|patch|delete)\s*\{[\s\S]*?^\s*url:\s*\{\{base_url\}\}([^\r\n]*)/im,
      );
      if (!request) return null;

      const method = request[1].toUpperCase();
      const routePath = request[2].split("?")[0];
      const parameterNames = [];
      const patternParts = routePath.split(/(\{\{[^}]+\}\})/g).map((part) => {
        const parameter = part.match(/^\{\{([^}]+)\}\}$/);
        if (!parameter) return escapeRegularExpression(part);
        parameterNames.push(parameter[1]);
        return "([^/]+)";
      });
      const responseFiles = Object.fromEntries(
        fs
          .readdirSync(path.dirname(requestFile))
          .filter((name) => /^\d{3}\.json$/.test(name))
          .map((name) => [
            Number(name.slice(0, 3)),
            path.join(path.dirname(requestFile), name),
          ]),
      );
      const successStatus =
        Object.keys(responseFiles)
          .map(Number)
          .find((status) => status < 300) ?? 200;

      return {
        method,
        parameterNames,
        path: routePath,
        pattern: new RegExp(`^${patternParts.join("")}/?$`),
        requiresAuth: /auth:\s*bearer/i.test(source),
        responseFiles,
        successStatus,
        systemAdminOnly:
          /Requires an authenticated (?:`SYSTEM_ADMIN`|system administrator)|Only `SYSTEM_ADMIN`/i.test(
            source,
          ),
      };
    })
    .filter(Boolean)
    .sort(
      (left, right) =>
        left.parameterNames.length - right.parameterNames.length ||
        right.path.length - left.path.length,
    );

const readExample = (route, status) => {
  const responseFile = route.responseFiles[status];
  if (!responseFile) return null;
  return {
    body: JSON.parse(fs.readFileSync(responseFile, "utf8")),
    source: path.relative(collectionDirectory, responseFile),
  };
};

module.exports = { loadRoutes, readExample };
