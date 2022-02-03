import fs from "fs";
import path from "path";
import { Remarkable } from "remarkable";
let md = new Remarkable();
import { JSDOM } from "jsdom";
import fetch from 'node-fetch';

// Verificando si la ruta existe
//let rutaPrueba= "C:/Users/cteja/Desktop/lim016/proyectos/Md_Links/LIM016-md-links/prueba_gnral";
let ruta= process.argv[2];
const rutaExiste= fs.existsSync(ruta); //se utiliza el método sincrono para buscar la ruta
if (fs.existsSync(ruta)){
    //console.log("La ruta existe",);
}else{
    //console.error("La ruta no existe");
}
// Convertir la ruta relativa a absoluta
const convRutaAbsol= (ruta) =>{
    if (path.isAbsolute(ruta)){
    
        return ruta;
    }else{
        return path.resolve(ruta);
    }
}

const rutaConvertida=convRutaAbsol(process.argv[2]); // convierte a ruta absoluta
//console.log(process.argv); // se muestra la ruta que se encuentre en el índice 2 

//se va leer el directorio para identificar si es una carpeta 
const identCarpeta = (ruta) => {
    return fs.lstatSync(ruta).isDirectory()
}
//console.log(identCarpeta(process.argv[2]));

//recorrer archivos
const recorroArchivo = (ruta) =>{
    return fs.statSync(ruta).isFile()
}
//console.log(recorroArchivo(process.argv[2]));

//Recorrer la carpeta e identificar archivos md
const recorCarp= (ruta)=> {
    let arrayArchMd =[];
    if (identCarpeta(ruta)){
        const leerCarpeta = fs.readdirSync (ruta);  //lee los archivos que están dentro del directorio
        leerCarpeta.forEach((archivo) => {
            const rutaListaArch = path.join (ruta,archivo); //conecta las rutas y asocia de forma inteligente las separaciones entre las carpetas "/"
        if (identCarpeta(rutaListaArch)) {
            arrayArchMd=arrayArchMd.concat(recorCarp(rutaListaArch)); 
        }
        if (path.extname(rutaListaArch)===".md")  { 
            arrayArchMd.push(rutaListaArch);
        }

        });
    }
    else{
        arrayArchMd.push(ruta); // retorna el nombre del archivo
    }  
    return arrayArchMd; //devuelve el array con el resultado ya sea directorio o archivo
}
//console.log(recorCarp(convRutaAbsol(process.argv[2])))

/*convertir un archivo md a html*/

const obtenerLinks = (rutaConvertida)=> {
    //console.log(rutaConvertida);
    const leerArch= fs.readFileSync(rutaConvertida, 'utf-8');
    const archFormatoHtml =md.render(leerArch);
    //console.log("Devuelve el archivo en html",archFormatoHtml);
    const documentDom= new JSDOM(archFormatoHtml);
    const arrayEtiquetas= documentDom.window.document.querySelectorAll("a");
    let arrayLinks =[];
    //console.log(arrayEtiquetas);
    arrayEtiquetas.forEach(etiqueta =>{
        //console.log(etiqueta.toString());
        arrayLinks.push({
            href:etiqueta.toString(),
            text:(etiqueta.textContent).slice(0,50),
            file: rutaConvertida
        });
    });
    return ("devuelve un array con los links",arrayLinks);
}

/* Leer archivos desde el directorio---
Recorriendo los archivos de un directorio y extrayendo los links*/
const arrayObjetLinksDirec= (rutas) =>{
     let arrayObjeLinks = [];
     rutas.forEach((e)=>{
         arrayObjeLinks.push(obtenerLinks(e));

     });
     return arrayObjeLinks.flat();
 };
 //console.log (arrayObjetLinksDirec(recorCarp(process.argv[2])));

/*Peticiones http utilizando promesas*/
const httpStatus = (arrayObjetos) => {
    //console.log("devuelve el array de Links",arrayObjetos);
    const arrayStatusLinks= arrayObjetos.map((e) =>{ // se recorre el objeto
    return fetch(e.href)
      .then((res) =>({
           href:e.href,
           text:e.text,
           file:e.file,
           status: res.status,
           Message: res.status >= 200 && res.status < 300 ? "Ok" : "Fail", // uso de operadores ternarios
        
        }))

       .catch((err)=>({
           href: e.href,
           text: e.text.slice(0, 50),
           file: e.file,
           status: err,
           Message: "Fail",
       }))
    });
    return Promise.all(arrayStatusLinks);
    };
    httpStatus(arrayObjetLinksDirec(recorCarp(process.argv[2]))).then((res) => console.log(res)).catch((err)=>
    console.log(error));
    /*const array =[
    {
        href: "https://nodejs.org/es/",
        text: "Node.js",
        file: "/Users/cteja/Desktop/lim016/proyectos/Md_Links/LIM016-MD-LINKS/prueba_gnral/archivo1.md",
      },
      {
        href: "https://developers.google.com/v8/",
        text: "motor de JavaScript V8 de Chrome",
        file: "/Users/cteja/Desktop/lim016/proyectos/Md_Links/LIM016-MD-LINKS/prueba_gnral/archivo1.md",
      },
      {
        href: "https://www.lego.com/es-es/404",
        text: "enlace fallado",
        file: "/Users/cteja/Desktop/lim016/proyectos/Md_Links/LIM016-MD-LINKS/prueba_gnral/archivo1.md",
      },
      {
        href: "https://www.pipsnacks.com/404",
        text: " enlaces rotos",
        file: "/Users/cteja/Desktop/lim016/proyectos/Md_Links/LIM016-MD-LINKS/prueba_gnral/archivo1.md",
      },
    ];*/

      

