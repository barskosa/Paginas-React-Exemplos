/**
 * Capturas reais da aplicação para o README. Não modifica o código de produção.
 *
 * 1. Inicie o projeto em outro terminal: npm.cmd run dev
 * 2. Disponibilize Playwright fora das dependências do projeto.
 * 3. Execute: node docs/capturar-telas.cjs
 *
 * Variáveis opcionais:
 * PLAYWRIGHT_MODULE = caminho absoluto do módulo playwright instalado fora do projeto.
 * EDGE_PATH = caminho do executável do Edge/Chromium; padrão: Edge no Windows.
 * CAPTURE_URL = endereço do Vite; padrão: http://127.0.0.1:5173/
 *
 * Exemplo no PowerShell, quando Playwright já existe em outra pasta:
 * $env:PLAYWRIGHT_MODULE = 'C:\caminho\node_modules\playwright'
 * node docs/capturar-telas.cjs
 *
 * A captura do modelo usa a entrada permanente modelo.html.
 * Nenhum CSS da aplicação é importado nessa página: o AppBase aparece como é.
 */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

let chromium;
try {
  ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright'));
} catch {
  console.error('Playwright não encontrado. Defina PLAYWRIGHT_MODULE com o caminho do módulo instalado fora deste projeto.');
  process.exit(1);
}

const destino = path.join(__dirname, 'imagens');
const endereco = new URL(process.env.CAPTURE_URL || 'http://127.0.0.1:5173/');
const navegador = process.env.EDGE_PATH || (process.platform === 'win32'
  ? 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
  : undefined);
const erros = [];
const capturas = [];
let browser;
let pagina;

function registrar(nome) {
  const arquivo = path.join(destino, nome);
  const png = fs.readFileSync(arquivo);
  const largura = png.readUInt32BE(16);
  const altura = png.readUInt32BE(20);
  const tamanho = Math.ceil(png.length / 1024);
  capturas.push({ nome, largura, altura, tamanhoKiB: tamanho });
  console.log(`${nome}: ${largura} x ${altura}, ${tamanho} KiB`);
}

// Fotografamos uma região real do navegador, sem alterar HTML ou estilos.
// O limite evita imagens enormes nas telas que exibem arquivos de código.
async function capturarSecao(nome, limiteAltura = 1100) {
  const secao = pagina.locator('.example-section');
  await secao.evaluate((elemento) => {
    window.scrollTo({ top: window.scrollY + elemento.getBoundingClientRect().top - 20, behavior: 'instant' });
  });
  await pagina.evaluate(() => document.fonts.ready);
  const area = await secao.boundingBox();
  assert.ok(area && area.width > 0 && area.height > 0, 'A seção do exemplo precisa estar visível.');
  const viewport = pagina.viewportSize();
  await pagina.screenshot({
    path: path.join(destino, nome),
    animations: 'disabled',
    clip: {
      x: Math.floor(area.x),
      y: Math.max(0, Math.floor(area.y)),
      width: Math.floor(area.width),
      height: Math.floor(Math.min(area.height, limiteAltura, viewport.height - Math.max(0, area.y))),
    },
  });
  registrar(nome);
}

// O modal é capturado dentro do viewport, com o fundo real da aplicação.
async function capturarJanela(nome) {
  await pagina.getByRole('dialog').waitFor();
  await pagina.screenshot({ path: path.join(destino, nome), animations: 'disabled' });
  registrar(nome);
}

async function abrir(id) {
  await pagina.locator(`.main-nav a[href="#${id}"]`).click();
  await pagina.locator(`.main-nav a[href="#${id}"][aria-current="page"]`).waitFor();
  await pagina.locator('.example-title h2').waitFor();
}

async function executar() {
  fs.mkdirSync(destino, { recursive: true });
  browser = await chromium.launch({ headless: true, executablePath: navegador });
  const contexto = await browser.newContext({ viewport: { width: 1440, height: 1400 }, deviceScaleFactor: 1 });
  pagina = await contexto.newPage();
  pagina.on('pageerror', (erro) => erros.push(erro.message));
  await pagina.goto(endereco.href, { waitUntil: 'networkidle' });
  await pagina.getByRole('heading', { name: 'Biblioteca de estudo', exact: true }).waitFor();

  await capturarSecao('01-catalogo.png', 1230);
  await pagina.getByRole('searchbox', { name: 'Buscar na biblioteca' }).fill('#001');
  await pagina.getByRole('combobox', { name: 'Categoria', exact: true }).selectOption('frontend');
  await pagina.getByRole('checkbox', { name: 'Somente disponíveis' }).check();
  assert.equal(await pagina.locator('.catalog-card').count(), 1);
  await capturarSecao('02-filtros.png', 950);

  await pagina.getByRole('button', { name: 'Limpar filtros', exact: true }).first().click();
  await pagina.getByRole('button', { name: 'Exibir em tabela' }).click();
  await capturarSecao('03-tabela.png', 1050);

  await pagina.getByRole('searchbox', { name: 'Buscar na biblioteca' }).fill('#001');
  await pagina.getByRole('button', { name: 'Detalhes de React na prática' }).click();
  await capturarJanela('04-detalhes.png');
  await pagina.getByRole('button', { name: 'Fechar janela', exact: true }).click();

  await pagina.getByRole('button', { name: 'Limpar filtros', exact: true }).first().click();
  await pagina.getByRole('combobox', { name: 'Categoria', exact: true }).selectOption('dados');
  await pagina.getByRole('heading', { name: 'Nenhum item por aqui', exact: true }).waitFor();
  await capturarSecao('05-sem-resultados.png', 1000);

  await abrir('cadastro');
  await capturarSecao('06-cadastro.png', 1100);
  await pagina.getByRole('button', { name: 'Adicionar item', exact: true }).click();
  assert.equal(await pagina.locator('[aria-invalid="true"]').count(), 4);
  await capturarSecao('07-validacao.png', 1100);

  await pagina.getByRole('button', { name: 'Editar React na prática', exact: true }).click();
  await pagina.getByRole('textbox', { name: 'Nome', exact: true }).fill('React na prática — revisão');
  await capturarSecao('08-edicao.png', 1100);
  await pagina.getByRole('button', { name: 'Cancelar edição', exact: true }).click();
  await pagina.getByRole('button', { name: 'Excluir React na prática', exact: true }).click();
  await capturarJanela('09-exclusao.png');
  await pagina.getByRole('dialog').getByRole('button', { name: 'Cancelar', exact: true }).click();

  await abrir('relacionamentos');
  await capturarSecao('10-relacionamentos.png', 1100);
  await pagina.getByRole('combobox', { name: 'Coleção', exact: true }).selectOption('interfaces');
  await capturarSecao('11-referencia-ausente.png', 1100);
  await pagina.getByRole('combobox', { name: 'Coleção', exact: true }).selectOption('minha-selecao');
  await capturarSecao('12-colecao-vazia.png', 1000);

  await abrir('carregamento');
  await pagina.locator('.fetch-list li').first().waitFor();
  await capturarSecao('13-fetch-sucesso.png', 1100);

  // Seguramos a resposta real por pelo menos 1,2 segundo e até concluir a foto.
  // Assim o indicador representa uma requisição em andamento, não uma montagem.
  let liberarResposta;
  const capturaConcluida = new Promise((resolve) => { liberarResposta = resolve; });
  await pagina.route('**/dados-exemplo.json', async (route) => {
    await Promise.all([capturaConcluida, new Promise((resolve) => setTimeout(resolve, 1200))]);
    await route.continue();
  });
  await pagina.getByRole('button', { name: 'Carregar novamente', exact: true }).click();
  await pagina.getByRole('heading', { name: 'Carregando dados…', exact: true }).waitFor();
  await capturarSecao('14-fetch-carregando.png', 1100);
  liberarResposta();
  await pagina.locator('.fetch-list li').first().waitFor();
  await pagina.unroute('**/dados-exemplo.json');

  await pagina.getByRole('button', { name: 'Simular erro', exact: true }).click();
  await pagina.getByRole('alert').waitFor();
  await capturarSecao('15-fetch-erro.png', 1100);

  await abrir('guia');
  await capturarSecao('17-guia.png', 1230);

  await pagina.setViewportSize({ width: 390, height: 1100 });
  await abrir('catalogo');
  await pagina.locator('.example-section').evaluate((elemento) => elemento.scrollIntoView({ block: 'start', behavior: 'instant' }));
  await pagina.screenshot({ path: path.join(destino, '18-mobile.png'), animations: 'disabled' });
  registrar('18-mobile.png');
  await pagina.setViewportSize({ width: 1440, height: 1400 });

  // A página permanente renderiza o AppBase real, sem CSS do caderno.
  const modelo = await contexto.newPage();
  modelo.on('pageerror', (erro) => erros.push(erro.message));
  await modelo.setViewportSize({ width: 1200, height: 800 });
  await modelo.goto(new URL('modelo.html', endereco).href, { waitUntil: 'networkidle' });
  await modelo.getByRole('heading', { name: 'Meu catálogo', exact: true }).waitFor();
  assert.equal(await modelo.locator('li').count(), 12);
  await modelo.screenshot({ path: path.join(destino, '19-modelo-minimo.png'), animations: 'disabled' });
  registrar('19-modelo-minimo.png');
  await modelo.close();

  // A marcação é feita pela interface e conferida depois de recarregar a página.
  // A imagem mostra o filtro ativo; o reload anterior confirma a persistência.
  await pagina.getByRole('searchbox', { name: 'Buscar na biblioteca' }).fill('#001');
  await pagina.getByRole('button', { name: 'Adicionar aos favoritos: React na prática', exact: true }).click();
  await pagina.reload({ waitUntil: 'networkidle' });
  assert.deepEqual(await pagina.evaluate(() => JSON.parse(localStorage.getItem('react-consulta:favoritos'))), [1]);
  await pagina.getByRole('searchbox', { name: 'Buscar na biblioteca' }).fill('#001');
  await pagina.getByRole('checkbox', { name: /Meus favoritos/ }).check();
  assert.equal(await pagina.getByRole('button', { name: 'Remover dos favoritos: React na prática', exact: true }).getAttribute('aria-pressed'), 'true');
  await capturarSecao('20-favoritos.png', 1000);

  // Fonte por último: a captura reflete o arquivo real no momento da execução.
  await pagina.getByRole('button', { name: 'Código-fonte', exact: true }).click();
  await pagina.getByRole('combobox', { name: 'Arquivo para consultar e copiar', exact: true }).selectOption('./examples/Catalogo.jsx');
  await capturarSecao('16-codigo.png', 1230);

  // O menu agora também oferece a demonstração isolada do modelo mínimo.
  await abrir('modelo');
  await pagina.frameLocator('iframe[title="Demonstração do modelo mínimo"]')
    .getByRole('heading', { name: 'Meu catálogo', exact: true }).waitFor();
  await pagina.evaluate(() => window.scrollTo(0, 0));
  await pagina.screenshot({ path: path.join(destino, '21-modelo-menu.png'), fullPage: true, animations: 'disabled' });
  registrar('21-modelo-menu.png');

  assert.deepEqual(erros, [], 'As capturas não devem conter erros JavaScript.');
  assert.equal(capturas.length, 21);
  console.log(`Concluído: ${capturas.length} imagens reais, sem erros JavaScript. Destino: docs/imagens/`);
}

executar().catch((erro) => {
  console.error(erro);
  process.exitCode = 1;
}).finally(async () => {
  if (browser) await browser.close();
});
