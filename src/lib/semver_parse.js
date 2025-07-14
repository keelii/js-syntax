// semver/_shared.ts
var NUMERIC_IDENTIFIER = "0|[1-9]\\d*";
var NON_NUMERIC_IDENTIFIER = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
var VERSION_CORE = `(?<major>${NUMERIC_IDENTIFIER})\\.(?<minor>${NUMERIC_IDENTIFIER})\\.(?<patch>${NUMERIC_IDENTIFIER})`;
var PRERELEASE_IDENTIFIER = `(?:${NUMERIC_IDENTIFIER}|${NON_NUMERIC_IDENTIFIER})`;
var PRERELEASE = `(?:-(?<prerelease>${PRERELEASE_IDENTIFIER}(?:\\.${PRERELEASE_IDENTIFIER})*))`;
var BUILD_IDENTIFIER = "[0-9A-Za-z-]+";
var BUILD = `(?:\\+(?<buildmetadata>${BUILD_IDENTIFIER}(?:\\.${BUILD_IDENTIFIER})*))`;
var FULL_VERSION = `v?${VERSION_CORE}${PRERELEASE}?${BUILD}?`;
var FULL_REGEXP = new RegExp(`^${FULL_VERSION}$`);
var COMPARATOR = "(?:<|>)?=?";
var WILDCARD_IDENTIFIER = `x|X|\\*`;
var XRANGE_IDENTIFIER = `${NUMERIC_IDENTIFIER}|${WILDCARD_IDENTIFIER}`;
var XRANGE = `[v=\\s]*(?<major>${XRANGE_IDENTIFIER})(?:\\.(?<minor>${XRANGE_IDENTIFIER})(?:\\.(?<patch>${XRANGE_IDENTIFIER})${PRERELEASE}?${BUILD}?)?)?`;
var OPERATOR_XRANGE_REGEXP = new RegExp(
  `^(?<operator>~>?|\\^|${COMPARATOR})\\s*${XRANGE}$`
);
var COMPARATOR_REGEXP = new RegExp(
  `^(?<operator>${COMPARATOR})\\s*(${FULL_VERSION})$|^$`
);
function isValidNumber(value) {
  return typeof value === "number" && !Number.isNaN(value) && (!Number.isFinite(value) || 0 <= value && value <= Number.MAX_SAFE_INTEGER);
}
var MAX_LENGTH = 256;
var NUMERIC_IDENTIFIER_REGEXP = new RegExp(`^${NUMERIC_IDENTIFIER}$`);
function parsePrerelease(prerelease) {
  return prerelease.split(".").filter(Boolean).map((id) => {
    if (NUMERIC_IDENTIFIER_REGEXP.test(id)) {
      const number = Number(id);
      if (isValidNumber(number)) return number;
    }
    return id;
  });
}
function parseBuild(buildmetadata) {
  return buildmetadata.split(".").filter(Boolean);
}
function parseNumber(input, errorMessage) {
  const number = Number(input);
  if (!isValidNumber(number)) throw new TypeError(errorMessage);
  return number;
}

// semver/parse.ts
function parse(value) {
  if (typeof value !== "string") {
    throw new TypeError(
      `Cannot parse version as version must be a string: received ${typeof value}`
    );
  }
  if (value.length > MAX_LENGTH) {
    throw new TypeError(
      `Cannot parse version as version length is too long: length is ${value.length}, max length is ${MAX_LENGTH}`
    );
  }
  value = value.trim();
  const groups = value.match(FULL_REGEXP)?.groups;
  if (!groups) throw new TypeError(`Cannot parse version: ${value}`);
  const major = parseNumber(
    groups.major,
    `Cannot parse version ${value}: invalid major version`
  );
  const minor = parseNumber(
    groups.minor,
    `Cannot parse version ${value}: invalid minor version`
  );
  const patch = parseNumber(
    groups.patch,
    `Cannot parse version ${value}: invalid patch version`
  );
  const prerelease = groups.prerelease ? parsePrerelease(groups.prerelease) : [];
  const build = groups.buildmetadata ? parseBuild(groups.buildmetadata) : [];
  return { major, minor, patch, prerelease, build };
}
export {
  parse
};
