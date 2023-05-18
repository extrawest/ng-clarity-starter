const execSync = require('child_process').execSync;
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const REQUIRED_NODEJS_MAJOR_VERSION = 'v18';
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
  // Replace npm start script with ng serve
  const packageJson = fs.readFileSync('package.json', 'utf8');
  let packageJsonLines = packageJson.split('\n');
  packageJsonLines = packageJsonLines.map((line) => {
    if (line.includes('node first-config.js')) {
      console.log('replacing line in package.json...');
      return line.replace('node first-config.js', 'ng serve');
    }

    return line + '\n';
  });
  console.log(packageJsonLines);
  fs.writeFileSync('package.json', packageJsonLines.join(''));

  // Commit changes
  executeCommandInTerminal('git commit -m "Initial commit" --quiet');

  console.log('Configuration has been completed.');
  process.exit(0);
};

if (process.version.split('.')[0] !== REQUIRED_NODEJS_MAJOR_VERSION) {
  console.log(`Error! Please install Node.js ${REQUIRED_NODEJS_MAJOR_VERSION}!`);
  process.exit(1);
}

console.log('This is config script for the first initialization of new a project.');

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

rl.question(
  'Do you want to use Google Analytics for this project? If so, paste here your Google Analytics ID (ex.: G-12345678): ',
  (answer) => {
    if (!answer || !GA_REGEX.test(answer)) completeScript();

    // Install GA package
    executeCommandInTerminal('npm install ngx-google-analytics --save');

    // Add GA to main.ts
    const mainTs = fs.readFileSync('src/main.ts', 'utf8');
    let mainTsLines = mainTs.split('\r');
    mainTsLines = mainTsLines.map((line) => {
      if (line.includes('import { appRoutes }')) {
        return `${line}\nimport { GoogleAnalyticsModule } from 'ngx-google-analytics';\r`;
      }

      if (line.includes('importProvidersFrom(BrowserModule)')) {
        return `${line}\n    importProvidersFrom(NgxGoogleAnalyticsModule.forRoot('${answer}')),\r`;
      }

      return line + '\n';
    });
    fs.writeFileSync(path.join(__dirname, 'src', 'main.ts'), mainTsLines.join(''), { flag: 'r+' });

    completeScript();
  }
);
