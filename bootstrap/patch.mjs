import fs from 'node:fs';
const load = (p) => fs.readFileSync(p, 'utf8');
const save = (p, v) => fs.writeFileSync(p, v);
const file = 'src/search/defaults.js';
let defaults = load(file);
if (!defaults.includes("from './brazilGeocoder.js'")) {
  const before = "import { createCepGeocoder } from './cepGeocoder.js';";
  if (!defaults.includes(before)) throw new Error('CEP source changed upstream');
  defaults = defaults.replace(before, before + "\nimport { createBrazilGeocoder } from './brazilGeocoder.js';");
  const source = 'createCepGeocoder({ fetchImpl, endpoint: endpoints.cep }),';
  if (!defaults.includes(source)) throw new Error('CEP provider changed upstream');
  defaults = defaults.replace(source, source + '\n      createBrazilGeocoder({ fetchImpl }),');
  save(file, defaults);
}
let html = load('index.html');
html = html.replace('<html lang="en">', '<html lang="pt-BR">').replace("<title>God's Eye View</title>", "<title>God's Eye View · Brasil</title>");
save('index.html', html);
let ignored = load('.gitignore');
for (const pattern of ['.vercel/', '.env.production', '.env.local']) if (!ignored.includes(pattern)) ignored += '\n' + pattern;
save('.gitignore', ignored);
const pkg = JSON.parse(load('package.json'));
pkg.description = 'God’s Eye View — inteligência geoespacial com buscas por CEP e ruas do Brasil.';
pkg.scripts['test:br'] = 'node --test src/search/brazilGeocoder.test.mjs src/search/cepGeocoder.test.mjs';
save('package.json', JSON.stringify(pkg, null, 2) + '\n');
let readme = load('README.md');
if (!readme.includes('## Implantação brasileira na Vercel')) readme += '\n\n## Implantação brasileira na Vercel\n\nConsulte [README-BR.md](README-BR.md) para pesquisas de endereços, requisitos e limitações das APIs na Vercel. Projeto original por Bilawal Sidhu, licença MIT.\n';
save('README.md', readme);
console.log('Brazil adaptation installed.');
