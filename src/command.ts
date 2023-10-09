import yargs from 'yargs'

const argv = yargs(process.argv.slice(2))
  .command('* <src-dir>', 'generate <src-dir>.sorted directory')
  .help()
  .parseSync()

export default argv
