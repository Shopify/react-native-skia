// The entry point for `@Shopify/react-native-skia/web`
// A version of RN Skia that requires no Webpack override
// The `lib/web/pure` file gets generated at build time
// using `bun build.ts`

// For maximum backwards compatibility, not using "exports" field
// and using a commonjs export
module.exports = require("./lib/web/pure");
