let fs = require('fs');
let pdf = require('html-pdf');

// usage configurations
let imoveisNumb = 2;
const folderName = "imagesToClients";
let dataSource = "apolar";
let generatePDF = true;

// configuration setters
const setImoveisNumber = (number) => {
  imoveisNumb = number;
}
const setDataSource = (name) => {
  dataSource = name;
}
const setGeneratePdf = (bool) => {
  generatePDF = bool;
}

// data normalization function
const normalizeData = (obj, limit) => {
  switch (dataSource) {
    case "apolar":
      return normalizeApolarData(obj,limit);
    default:
      throw Error("ERROR: "+ datasource + " (datasource) data normalization function unregistered in JSONtoPNG.js");
  }

}

const normalizeApolarData = (obj, limit) => {
  let data = { imovel: {}};
  for (let x=0; x< obj.conteudo.length && x < limit; x++) {
    data.imovel[x] = {};
    data.imovel[x].fotoUrl = obj.conteudo[x].foto.url;
    data.imovel[x].descricao = obj.conteudo[x].descricao;
    data.imovel[x].bairro = obj.conteudo[x].dadosImoveis.bairro;
    data.imovel[x].endereco = obj.conteudo[x].dadosImoveis.Endereco;
    data.imovel[x].qtdeDormitorios = obj.conteudo[x].qtdeDormitorios;
    data.imovel[x].qtdeGaragem = obj.conteudo[x].qtdeGaragem;
    data.imovel[x].metragem = obj.conteudo[x].metragem;
    data.imovel[x].referencia = obj.conteudo[x].referencia;
  }
  return data;
}

// HTML code generation
const generateHtmlCode = (obj, number) => {
  // Foto, Bairro, nome, código, quartos, vagas estac, area, veja mais
  // foto.url, dadosImoveis.bairro, dadosImoveis.endereco, referencia, qtdeDormitorios, qtdeGaragem, metragem
  let refs = "refs";
  let code = `<!DOCTYPE html>
  <html><head> 
  <meta name="author" content="FireFly">
  <meta name="description" content="Arquivo de imoveis para envio a clientes">
  <style>
  .imagem { width: 60%; overflow: hide; display: inline-block; margin-left: 5%; margin-top: 12px }
  img { max-width: 100%; max-height: 100% }
  .texto { width: 25%; display: inline-block; margin-left: 5% }
  </style> </head>` +  
  "\n<body>";
  for(let x=0;x<number;x++) {
    code = code + `\n<div class="imovel"> 
    <div class="imagem"><img src="`+obj.imovel[x].fotoUrl+`" alt="`+obj.imovel[x].descricao+`" /></div>
    <div class="texto">
    <h1>`+obj.imovel[x].bairro+`</h1>
    `+ (obj.imovel[x].endereco ? "<p>"+obj.imovel[x].endereco+"</p>" : "") +`
    <h3>Referência: `+obj.imovel[x].referencia+`</h3>
    `+  bedLine(obj.imovel[x].qtdeDormitorios)+` 
    ` + carLine(obj.imovel[x].qtdeGaragem) + //+ (obj.conteudo[x].qtdeGaragem ? "<h3>"+ obj.conteudo[x].qtdeGaragem +" vaga(s)</h3>" : "") +
     areaLine(obj.imovel[x].metragem+1) +   // + (obj.conteudo[x].metragem>0 ? "<h3>"+ obj.conteudo[x].metragem +" m^2 privativos</h3>" : "") +  
    //'<h2><a href="https://www.apolar.com.br/imoveis/'+obj.imovel[x].referencia+'">Veja mais!</a></h2> '+
    '\n</div> </div>\n';
    refs = refs + " " + obj.imovel[x].referencia;
  }

  code = code + "</body>\n</html>";
  fs.writeFileSync(folderName + "/" +refs+".html", code);
  console.log("OK: " + refs+".html" + " created!");
  return refs;
}

const ensureDirSync = (dir) => {
  try {
    fs.mkdirSync(dir, { recursive: true })
  } catch (err) {
    if (err.code !== 'EEXIST') throw err
  }
}

const areaLine = (numb) => {
  return numb ? 
  `<span style="font-family:'Segoe UI Symbol';color:black;font-size:1.5em;">&#x1f539; `+ numb +" m² privativos</span><br>"
  : "";
}

const bedLine = (numb) => {
  const center = numb>1 ?
  numb+" dormitórios" :
  "1 dormitório";
  return `<span style="font-family:'Segoe UI Symbol';color:black;font-size:1.5em;">&#x1f3a6; ` + center + "</span><br>";
}

const carLine = (numb) => {
  return numb ? `<span style="font-family:'Segoe UI Symbol';color:black;font-size:1.5em;">
  &#x1F698; `+ numb + " " + (numb>1 ? "vagas" : "vaga") + ` 
  </span><br>` : "";
}

// PDF generation
const createPdf = (html, options, fileName) => {
  pdf.create(html, options).toFile('./'+folderName + '/'+fileName+'.pdf', function(err, res) {
    if (err) return console.log(err);
    console.log("OK: " + res.filename + " created!");
    return res.filename;
  });
}

const htmlToPdf = (fileName) => {
  if ( generatePDF ) {
    let html = fs.readFileSync(folderName + '/'+fileName+".html", 'utf8');
    let options = { format: 'Letter' };
    return createPdf(html, options, fileName);
  }
  return "pdf not generated";
}

// PNG image generation
const htmlToImage = (filename, imoveisNumber) => {
 
  const puppeteer = require('puppeteer');
  const add = './'+folderName +'/'+filename;

  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    var contentHtml = fs.readFileSync(add+".html", 'utf8');
    await page. setContent(contentHtml);   //await page.goto(filename);
    
    // Get the "viewport" of the page, as reported by the page.
  const dimensions = await page.evaluate(() => {
    return {
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
      deviceScaleFactor: window.devicePixelRatio
          };
    });
    dimensions.height = parseInt(imoveisNumber* 360);
    page.setViewport(dimensions);
    await page.screenshot({path: add + '.png'});
  
    await browser.close();
  })().then(() => console.log("OK: " + add + ".png created!"))
  .catch(e => console.log(e));
  return add+".png";
}


// high level functions (From JSON to HTML, PDF and PNG)
const useLocalJson = () => {
// ensure dir
ensureDirSync(folderName);
// generates HTML using JSON file
let data = JSON.parse(fs.readFileSync("./exemplo_imoveis_apolar.json", "utf-8"));
data = normalizeData(data, imoveisNumb);
const fileName = generateHtmlCode(data,imoveisNumb);
// uses generated HTML file to generate PDF file
htmlToPdf(fileName);
htmlToImage(fileName,imoveisNumb);
}

const useRemoteJson = (jsonFile) => {
// ensure dir
ensureDirSync(folderName);
// generates HTML using JSON file
let data = JSON.parse(jsonFile);
data = normalizeData(data, imoveisNumb);
const fileName = generateHtmlCode(data,imoveisNumb);
// uses generated HTML file to generate PDF file
htmlToPdf(fileName,imoveisNumb);
return htmlToImage(fileName);
}

// Test function
useLocalJson();

module.exports = { useRemoteJson, setImoveisNumber, setDataSource, setGeneratePdf };

