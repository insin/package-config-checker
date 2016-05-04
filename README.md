# Package Config Checker

Checks if your npm dependencies (and transitive dependencies) have defined `package.json` [`files` config](https://docs.npmjs.com/files/package.json#files) or have an `.npmignore` for use when packaging, to avoid including unnecessary files.

Since npm automatically includes (`package.json`, `README` variants, `CHANGELOG` variants, `LICENSE` / `LICENCE`) and excludes (source control directories, `npm-debug.log`, `.DS_Store` for Macs) [certain files](https://docs.npmjs.com/files/package.json#files) when packaging, submitting Pull Requests to your dependencies to add a `files` whitelist to their `package.json` is a quick and easy way to reduce the size of your - and everybody else's - `npm install`.

## Usage

```
npm install -g package-config-checker
```
```
Usage: package-config-checker

Options:
  -h, --help     display this help message
  -d, --depth    max depth for checking dependency tree (default: ∞)
```

## Example Output

```
$ package-config-checker -d 0
```
![](example-output.png)

## MIT Licensed
