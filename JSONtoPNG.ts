let fs = require('fs');//import fs from "fs";
let pdf = require('html-pdf');//import pdf from "html-pdf";

export default class JSONtoPNG {
 
  private generatePDF: boolean;
  private imoveisNumb: number;
  private folderName: string;
  private dataSource: string;

  constructor(generatePdf: boolean = true, imoveisNumb1: number = 2, folderName1: string = "imagesToClients", dataSource1: string = "apolar") {
    // usage configurations
    this.generatePDF = generatePdf;
    this.imoveisNumb = imoveisNumb1;
    this.folderName = folderName1;
    this.dataSource = dataSource1;
  }

  // configuration setters
  public setImoveisNumber = (number: number) => {
    this.imoveisNumb = number;
  }
  public setDataSource = (name: string) => {
    this.dataSource = name;
  }
  public setGeneratePdf = (bool: boolean) => {
    this.generatePDF = bool;
  }

  // data normalization function
  public normalizeData = (obj: any, limit: number) => {
    switch (this.dataSource) {
      case "apolar":
        return this.normalizeApolarData(obj,limit);
      default:
        throw Error("ERROR: "+ this.dataSource + " (datasource) data normalization function unregistered in JSONtoPNG.js");
    }

  }

  private normalizeApolarData = (obj: any, limit: number) => {
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
  private generateHtmlCode = (obj: any, numbr: number) => {
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
    for(let x=0;x<numbr;x++) {
      code = code + `\n<div class="imovel"> 
      <div class="imagem"><img src="`+obj.imovel[x].fotoUrl+`" alt="`+obj.imovel[x].descricao+`" /></div>
      <div class="texto">
      <h1>`+obj.imovel[x].bairro+`</h1>
      `+ (obj.imovel[x].endereco ? "<p>"+obj.imovel[x].endereco+"</p>" : "") +`
      <h3>Referência: `+obj.imovel[x].referencia+`</h3>
      `+  this.bedLine(obj.imovel[x].qtdeDormitorios)+` 
      ` + this.carLine(obj.imovel[x].qtdeGaragem) + //+ (obj.conteudo[x].qtdeGaragem ? "<h3>"+ obj.conteudo[x].qtdeGaragem +" vaga(s)</h3>" : "") +
      this.areaLine(obj.imovel[x].metragem+1) +   // + (obj.conteudo[x].metragem>0 ? "<h3>"+ obj.conteudo[x].metragem +" m^2 privativos</h3>" : "") +  
      //'<h2><a href="https://www.apolar.com.br/imoveis/'+obj.imovel[x].referencia+'">Veja mais!</a></h2> '+
      '\n</div> </div>\n';
      refs = refs + " " + obj.imovel[x].referencia;
    }

    code = code + "</body>\n</html>";
    fs.writeFileSync(this.folderName + "/" +refs+".html", code);
    console.log("OK: " + refs+".html" + " created!");
    return refs;
  }

  public ensureDirSync = (dir: string) => {
    try {
      fs.mkdirSync(dir, { recursive: true })
    } catch (err) {
      if (err.code !== 'EEXIST') throw err
    }
  }

  private areaLine = (numb: number) => {
    return numb ? 
    `<span style="font-family:'Segoe UI Symbol';color:black;font-size:1.5em;">&#x1f539; `+ numb +" m² privativos</span><br>"
    : "";
  }

  private bedLine = (numb: number) => {
    const center = numb>1 ?
    numb+" dormitórios" :
    "1 dormitório";
    return `<span style="font-family:'Segoe UI Symbol';color:black;font-size:1.5em;">&#x1f3a6; ` + center + "</span><br>";
  }

  private carLine = (numb: number) => {
    return numb ? `<span style="font-family:'Segoe UI Symbol';color:black;font-size:1.5em;">
    &#x1F698; `+ numb + " " + (numb>1 ? "vagas" : "vaga") + ` 
    </span><br>` : "";
  }

  // PDF generation
  private createPdf = (html: string, options, fileName: string) => {
    pdf.create(html, options).toFile('./'+this.folderName + '/'+fileName+'.pdf', function(err, res) {
      if (err) return console.log(err);
      console.log("OK: " + res.filename + " created!");
      return res.filename;
    });
  }

  private htmlToPdf = (fileName: string) => {
    if ( this.generatePDF ) {
      let html = fs.readFileSync(this.folderName + '/'+fileName+".html", 'utf8');
      let options = { format: 'Letter' };
      return this.createPdf(html, options, fileName);
    }
    return "pdf not generated";
  }

  // PNG image generation
  private htmlToImage = (filename: string, imoveisNumber: number) => {
  
    const puppeteer = require('puppeteer');
    const add = './'+this.folderName +'/'+filename;

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
      dimensions.height = imoveisNumber * 360;
      page.setViewport(dimensions);
      await page.screenshot({path: add + '.png'});
    
      await browser.close();
    })().then(() => console.log("OK: " + add + ".png created!"))
    .catch(e => console.log(e));
    return add+".png";
  }


  // high level functions (From JSON to HTML, PDF and PNG)
  public useLocalJson = () => {
  // ensure dir
  this.ensureDirSync(this.folderName);
  // generates HTML using JSON file
  let data = JSON.parse(fs.readFileSync("./exemplo_imoveis_apolar.json", "utf-8"));
  data = this.normalizeData(data, this.imoveisNumb);
  const fileName = this.generateHtmlCode(data,this.imoveisNumb);
  // uses generated HTML file to generate PDF file
  this.htmlToPdf(fileName);
  this.htmlToImage(fileName, this.imoveisNumb);
  }

  public useRemoteJson = (jsonFile) => {
  // ensure dir
  this.ensureDirSync(this.folderName);
  // generates HTML using JSON file
  let data = JSON.parse(jsonFile);
  data = this.normalizeData(data, this.imoveisNumb);
  const fileName = this.generateHtmlCode(data,this.imoveisNumb);
  // uses generated HTML file to generate PDF file
  this.htmlToPdf(fileName);
  return this.htmlToImage(fileName, this.imoveisNumb);
  }

}