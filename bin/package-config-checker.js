#!/usr/bin/env node

var path = require('path')

var chalk = require('chalk')
var cyan = chalk.cyan
var green = chalk.green
var red = chalk.red
var debug = require('debug')
var fileExists = require('file-exists')
var figures = require('figures')
var parseArgs = require('minimist')
var readInstalled = require('read-installed')

var pkg = require('../package.json')

var debugLog = debug('package-config-checker:log')

var args = parseArgs(process.argv.slice(2), {
  alias: {
    d: 'depth',
    h: 'help',
    b: 'bad-only'
  },
  boolean: ['help', 'bad-only']
})

if (args.help) {
  console.log([
    'Usage: ' + green('package-config-checker'),
    '',
    'Options:',
    '  ' + cyan('-h, --help') + '     display this help message',
    '  ' + cyan('-d, --depth') + '    max depth for checking dependency tree ' + cyan('(default: ∞)'),
    '  ' + cyan('-b, --bad-only') + ' only show bad configured packages',
    '',
    pkg.name + '@' + pkg.version + ' ' + path.join(__dirname, '..')
  ].join('\n'))
  process.exit(0)
}

var readInstalledOptions = {
  log: debugLog
}

if (args.depth != null) {
  readInstalledOptions.depth = args.depth
}

readInstalled(process.cwd(), readInstalledOptions, function(err, json) {
  if (err) {
    console.error(chalk.red('Error reading installed packages: ' + err.message))
    console.error(err.stack)
    process.exit(1)
  }
  check(json, {}, '')
})

function check(json, seen, prefix) {
  if (seen[json._id]) {
    return
  }

  var msg = ''
  if (json.files) {
    msg = prefix + chalk.green(figures.tick + ' ' + json._id + ' [files]')
  }
  else if (fileExists(path.join(json.path, '.npmignore'))) {
    msg = prefix + chalk.green(figures.tick + ' ' + json._id + ' [.npmignore]')
  }
  else {
    msg = prefix + chalk.red(figures.cross + ' ' + json._id)
  }

  if (args['bad-only']) {
    if (msg.indexOf(figures.cross) != -1) {
      console.log(msg);
    }
  } else {
    console.log(msg);
  }

  seen[json._id] = true

  Object.keys(json.dependencies).forEach(function(name) {
    check(json.dependencies[name], seen, prefix + '  ')
  })
}
