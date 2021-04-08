export default (version: string): string => `
Version: ${version}

Syntax: dotconfig <path to directory> [<options>]

Examples: dotconfig .
          dotconfig ./foo/bar

Options:
--help                Print documentation
-v, --version         Print version
`;
