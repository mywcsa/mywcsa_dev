const test = require("node:test");
const assert = require("node:assert/strict");
const load = require("./load-typescript.cjs");
const { isPersalAuthorised } = load()("lib/personnel/authorisation.ts");
const tenant = "https://login.microsoftonline.com/12345678-1234-1234-1234-123456789abc/v2.0";
test("PERSAL denies missing configuration", () => {
 assert.equal(isPersalAuthorised("person@wcsports.co.za", tenant, undefined), false);
 assert.equal(isPersalAuthorised(undefined, tenant, "person@wcsports.co.za"), false);
});
test("PERSAL requires tenant-specific issuer", () => {
 assert.equal(isPersalAuthorised("person@wcsports.co.za","https://login.microsoftonline.com/common/v2.0","person@wcsports.co.za"),false);
});
test("PERSAL matches verified emails case-insensitively", () => {
 assert.equal(isPersalAuthorised(" PERSON@WCSports.co.za ",tenant,"other@wcsports.co.za,person@wcsports.co.za"),true);
 assert.equal(isPersalAuthorised("outsider@wcsports.co.za",tenant,"person@wcsports.co.za"),false);
});
