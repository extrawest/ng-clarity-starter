import { execSync } from 'child_process';
import fs from 'fs';
import * as readline from 'readline';

const REQUIRED_NODEJS_MAJOR_VERSION = 'v18';
const GIT_REGEX = new RegExp(
  /((http|git|ssh|http(s)|file|\/?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:/\-~]+)(\.git)(\/)?/
);
const GA_REGEX = new RegExp(/G-[A-Z0-9]+/);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const executeCommandInTerminal = (command) => {
  console.log(`Starting ${command}...`);

  execSync(command, { stdio: 'inherit' });
};

const removeDir = (path) => {
  console.log(`Removing ${path}...`);

  fs.rmSync(path, { recursive: true, force: true });
};

const completeScript = () => {
  console.log('Configuration has been completed.');

  // Replace npm start script with ng serve
  const packageJson = fs.readFileSync('package.json', 'utf8');
  const packageJsonLines = packageJson.split('\n');
  packageJsonLines.map((line) => {
    if (line.includes('node first-config.js')) {
      return line.replace('node first-config.js', 'ng serve');
    }

    return line;
  });
  fs.writeFileSync('package.json', packageJsonLines.join('\n'));

  // Commit changes
  executeCommandInTerminal('git commit -m "Initial commit"');

  process.exit(0);
};

console.log('Checking you Node.js version...');

if (process.version.split('.')[0] !== REQUIRED_NODEJS_MAJOR_VERSION) {
  console.log(`Error! Please install Node.js ${REQUIRED_NODEJS_MAJOR_VERSION}!`);
  process.exit(1);
}

console.log('This is config script for the first initialization of new a project.');

rl.question(
  'Give me a link to you repository.\nFor example: https://github.com/extrawest/new-clarity-project.git\nYour link: ',
  (answer) => {
    if (!answer || !GIT_REGEX.test(answer)) {
      console.log('Process interrupted.\nYour git link is not valid!');

      process.exit(1);
    }

    const gitLink = answer;

    // Remove config dirs
    removeDir('.vscode');
    removeDir('.idea');
    removeDir('.angular');

    // Install modules
    executeCommandInTerminal('npm install');

    // Remove current git dir
    removeDir('.git');

    // Init new Git repo
    executeCommandInTerminal('git init && git add .');

    // Add remote
    executeCommandInTerminal(`git remote add origin ${gitLink}`);
  }
);

rl.question(
  'Do you want to use Google Analytics for this project? If so, paste here your Google Analytics ID (ex.: G-12345678): ',
  (answer) => {
    if (!answer || !GA_REGEX.test(answer)) completeScript();

    // Install GA package
    executeCommandInTerminal('npm install ngx-google-analytics --save');

    // Add GA to main.ts
    const mainTs = fs.readFileSync('src/main.ts', 'utf8');
    const mainTsLines = mainTs.split('\n');
    mainTsLines.map((line) => {
      if (line === '') {
        return `import { GoogleAnalyticsService } from 'ngx-google-analytics';\n`;
      }

      if (line.includes('importProvidersFrom(BrowserModule)')) {
        return `${line}\nimportProvidersFrom(NgxGoogleAnalyticsModule.forRoot('${answer}')),`;
      }

      return line;
    });
    fs.writeFileSync('src/main.ts', mainTsLines.join('\n'));

    completeScript();
  }
);
