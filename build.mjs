// Build one self-contained HTML file with embedded code, anonymous test data and actual supplied logos.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const read=p=>readFile(p,'utf8');
const css=await read('src/styles.css');
let core=await read('src/core.mjs'),imp=await read('src/importer.mjs'),app=await read('src/app.mjs');
core=core.replace(/^export /gm,'');imp=imp.replace(/^import .*;\s*$/gm,'').replace(/^export /gm,'');app=app.replace(/^import .*;\s*$/gm,'');
const demo=await read('src/demo-2025.json');
for(const [key,file] of [['fm','freshminds'],['ahm','ahm']]){
 const base64=(await readFile('src/assets/'+file+'.png')).toString('base64');
 app=app.replace("'./assets/"+file+".png'",JSON.stringify('data:image/png;base64,'+base64));
}
const code='const demo='+demo+';\n'+core+'\n'+imp+'\n'+app;
let html=await read('src/index.html');
html=html.replace('<link rel="stylesheet" href="./styles.css">','<style>'+css+'</style>');
html=html.replace('<script type="module" src="./app.mjs"></script>','<script type="module">'+code.replace(/<\/script/gi,'<\\/script')+'</script>');
await mkdir('dist',{recursive:true});await writeFile('dist/SFMDP_Leaderboard_Demo.html',html);console.log('Built standalone HTML (anonymous data, no external network requests).');
