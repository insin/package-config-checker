#!/usr/bin/env node

var path = require('path')

var chalk = require('chalk')
var cyan = chalk.cyan
var green = chalk.green
var red = chalk.red
var yellow = chalk.yellow
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
    f: 'files',
    h: 'help',
    r: 'recent'
  },
  boolean: ['files', 'help', 'recent']
})

if (args.help) {
  console.log([
    'Usage: ' + green('package-config-checker') + ' ' + yellow('<show>') + ' ' + cyan('[options]'),
    '',
    'Options:',
    '  ' + cyan('-h, --help') + '     display this help message',
    '  ' + cyan('-d, --depth') + '    max depth for checking dependency tree ' + cyan('(default: ∞)'),
    '',
    'Show:',
    '  ' + yellow('-f, --files') + '    show presence of files config or .npmignore',
    '  ' + yellow('-r, --recent') + '   show recently updated dependencies',
    '',
    pkg.name + '@' + pkg.version + ' ' + path.join(__dirname, '..')
  ].join('\n'))
  process.exit(0)
}

if (!args.files && !args.recent) {
  console.error("You haven't specified anything to show.")
  process.exit(1)
}

var readInstalledOptions = {
  log: debugLog
}

if (args.depth != null) {
  readInstalledOptions.depth = args.depth
}

readInstalled(process.cwd(), readInstalledOptions, function(err, json) {
  if (err) {
    console.error(red('Error reading installed packages: ' + err.message))
    console.error(err.stack)
    process.exit(1)
  }
  check(json, {}, '')
  if (args.recent) {
    publishTimes.sort().reverse()
    console.log([
      '10 most recently published packages:',
      '',
      publishTimes.slice(0, 10).join('\n')
    ].join('\n'))
  }
})

var publishTimes = []

function check(json, seen, prefix) {
  if (seen[json._id]) {
    return
  }

  if (json._npmOperationalInternal) {
    var published = /tgz_(\d+)_/.exec(json._npmOperationalInternal.tmp)[1]
    publishTimes.push(published + ' ' + json._id + ' - ' + new Date(Number(published)))
  }

  if (args.files) {
    if (json.files) {
      console.log(prefix + green(figures.tick + ' ' + json._id + ' [files]'))
    }
    else if (json.realPath && fileExists(path.join(json.realPath, '.npmignore'))) {
      console.log(prefix + green(figures.tick + ' ' + json._id + ' [.npmignore]'))
    }
    else {
      console.log(prefix + red(figures.cross + ' ' + json._id))
    }
  }

  seen[json._id] = true

  if (json.dependencies) {
    Object.keys(json.dependencies).forEach(function(name) {
      check(json.dependencies[name], seen, prefix + '  ')
    })
  }
}
