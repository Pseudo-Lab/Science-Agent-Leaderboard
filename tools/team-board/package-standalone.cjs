const fs=require('node:fs'),path=require('node:path');
if(!process.argv[2])throw Error('Output HTML path is required');
let html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
html=html.replace('<link rel="stylesheet" href="style.css">',()=>'<style>'+fs.readFileSync(path.join(__dirname,'style.css'),'utf8')+'</style>');
for(const file of ['board-core.js','app.js'])html=html.replace(`<script src="${file}"></script>`,()=>'<script>'+fs.readFileSync(path.join(__dirname,file),'utf8').replace(/<\/script/gi,'<\\/script')+'</script>');
fs.writeFileSync(process.argv[2],html);console.log('Standalone board written.');
