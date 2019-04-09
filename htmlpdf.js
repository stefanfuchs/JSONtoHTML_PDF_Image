let fs = require('fs');
let pdf = require('html-pdf');

const generateHtmlCode = (obj, number) => {
  // Foto, Bairro, nome, código, quartos, vagas estac, area, veja mais
  // foto.url, dadosImoveis.bairro, dadosImoveis.endereco, referencia, qtdeDormitorios, qtdeGaragem, metragem
  let refs = "refs";
  let code = `<head> <style>
  .imagem { width: 60%; overflow: hide; display: inline-block; margin-left: 5%; margin-top: 30px }
  img { max-width: 100%; max-height: 100% }
  .texto { width: 25%; display: inline-block; margin-left: 5% }
  </style> </head>` +  
  "<div>";
  for(let x=0;x<number;x++) {
    code = code + `<div> 
    <div class="imagem"><img src="`+obj.conteudo[x].foto.url+`" alt="`+obj.conteudo[x].descricao+`" /></div>
    <div class="texto"><h1>`+obj.conteudo[x].dadosImoveis.bairro+`</h1>
    `+ (obj.conteudo[x].dadosImoveis.Endereco ? "<p>"+obj.conteudo[x].dadosImoveis.Endereco+"</p>" : "") +`
    <h3>Referência: `+obj.conteudo[x].referencia+`</h3>

    `+  bedLine(obj.conteudo[x].qtdeDormitorios)+` 
    ` + carLine(obj.conteudo[x].qtdeGaragem) + //+ (obj.conteudo[x].qtdeGaragem ? "<h3>"+ obj.conteudo[x].qtdeGaragem +" vaga(s)</h3>" : "") +
     areaLine(obj.conteudo[x].metragem+1) +   // + (obj.conteudo[x].metragem>0 ? "<h3>"+ obj.conteudo[x].metragem +" m^2 privativos</h3>" : "") +  
    '<h2><a href="https://www.apolar.com.br/imoveis/'+obj.conteudo[x].referencia+'">Veja mais!</a></h2> </div>'+
    '</div>\n';
    refs = refs + " " + obj.conteudo[x].referencia;
  }

  code = code + "</div>";
  refs = refs +".html";
  fs.writeFileSync("files/"+refs, code);
  console.log("OK: " + refs + " created!");
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
  `<span style="font-family:'Segoe UI Symbol';color:black;font-size:1.5em;">&#x1f539; `+ numb +" m^2 privativos</span><br>"
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
  //" " + (numb>1 ? "vagas" : "vaga")
}

const createPdf = (html, options, fileName) => {
  pdf.create(html, options).toFile('./files/'+fileName+'.pdf', function(err, res) {
    if (err) return console.log(err);
    console.log("OK: " + res.filename + " created!");
    return res.filename;
  });
}

const htmlToPdf = (fileName) => {
  let html = fs.readFileSync('files/'+fileName, 'utf8');
  let options = { format: 'Letter' };
  return createPdf(html, options, fileName);
}

const htmlToImage = (filename) => {
 
  const puppeteer = require('puppeteer');
  const add = './files/'+filename;

  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
   
    var contentHtml = fs.readFileSync(add, 'utf8');
    await page. setContent(contentHtml);   
    //await page.goto(filename);
    await page.screenshot({path: add + '.png'});
  
    await browser.close();
  })().then(() => console.log("OK: " + add + ".png created!"))
  .catch(e => console.log(e));
  return add+".png";
}

const useLocalJson = () => {
// ensure dir
ensureDirSync("files");
// generates HTML using JSON file
const data = JSON.parse(fs.readFileSync("./exemplo_imoveis_apolar.json", "utf-8"));
const fileName = generateHtmlCode(data,2);
// uses generated HTML file to generate PDF file
htmlToPdf(fileName);
htmlToImage(fileName);
}

const useRemoteJson = (jsonFile) => {
// ensure dir
ensureDirSync("files");
// generates HTML using JSON file
const fileName = generateHtmlCode(JSON.parse(jsonFile),2);
// uses generated HTML file to generate PDF file
htmlToPdf(fileName);
return htmlToImage(fileName);
}

// Test function
useLocalJson();

module.exports = useRemoteJson;

