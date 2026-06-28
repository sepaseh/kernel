# Local IRANSansX fonts

IRANSansX font binaries are not committed because their public redistribution license is unclear.

To enable the font locally:

1. Obtain a valid IRANSansX license.
2. Copy the licensed `.woff2` or `.woff` files into this directory.
3. Add matching `@font-face` rules in `src/styles/iransans.css`.

The app already keeps `"IRANSansX"` first in the global font stack, so the UI falls back safely until local font files are configured.
