// semver/_shared.ts
function compareNumber(a, b) {
  if (isNaN(a) || isNaN(b)) {
    throw new Error("Cannot semver_compare against non-numbers");
  }
  return a === b ? 0 : a < b ? -1 : 1;
}
function checkIdentifier(v1 = [], v2 = []) {
  if (v1.length && !v2.length) return -1;
  if (!v1.length && v2.length) return 1;
  return 0;
}
function compareIdentifier(v1 = [], v2 = []) {
  const length = Math.max(v1.length, v2.length);
  for (let i = 0; i < length; i++) {
    const a = v1[i];
    const b = v2[i];
    if (a === void 0 && b === void 0) return 0;
    if (b === void 0) return 1;
    if (a === void 0) return -1;
    if (typeof a === "string" && typeof b === "number") return 1;
    if (typeof a === "number" && typeof b === "string") return -1;
    if (a < b) return -1;
    if (a > b) return 1;
  }
  return 0;
}
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
var NUMERIC_IDENTIFIER_REGEXP = new RegExp(`^${NUMERIC_IDENTIFIER}$`);

// semver/semver_compare.ts
function semver_compare(version1, version2) {
  if (version1 === version2) return 0;
  return compareNumber(version1.major, version2.major) || compareNumber(version1.minor, version2.minor) || compareNumber(version1.patch, version2.patch) || checkIdentifier(version1.prerelease, version2.prerelease) || compareIdentifier(version1.prerelease, version2.prerelease);
}
export {
  semver_compare
};
