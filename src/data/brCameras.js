/** Verified PUBLIC authority directories. Records are named catalog entries, NOT direct video streams. */
const CET='https://cameras.cetsp.com.br/View/Cam.aspx';
const DER='https://dersp.der.sp.gov.br/WebSite/Servicos/ServicosOnline/CamerasOnlineMapa.aspx';
const camera=(id,name,words)=>({id,state:'SP',city:'São Paulo',name,street:words,url:CET,type:'catalog-entry',agency:'CET-SP',publicDirectory:true,coordinatesVerified:false});
export const BRAZIL_CAMERA_SOURCES=Object.freeze([
 {id:'cet-sp',state:'SP',city:'São Paulo',name:'CET · catálogo de câmeras da capital',street:'sao paulo capital',url:CET,type:'regional-directory',agency:'CET-SP',publicDirectory:true},
 {id:'der-sp',state:'SP',city:'Estado de São Paulo',name:'DER-SP · câmeras rodoviárias',street:'rodovia estradas sao paulo',url:DER,type:'regional-directory',agency:'DER-SP',publicDirectory:true},
 camera('cet-ascendino','Ascendino Reis × Rua Pedro de Toledo','ascendino reis pedro de toledo'),
 camera('cet-brasil-brigadeiro','Avenida Brasil × Av. Brigadeiro Luís Antônio','avenida brasil brigadeiro luis antonio'),
 camera('cet-brasil-schaumann','Avenida Brasil × Av. Henrique Schaumann','avenida brasil henrique schaumann'),
 camera('cet-brigadeiro-santos','Av. Brigadeiro Luís Antônio × Al. Santos','brigadeiro luis antonio alameda santos'),
 camera('cet-cidade-jardim','Av. Cidade Jardim × Av. Nove de Julho','cidade jardim nove julho'),
 camera('cet-consolacao','Rua da Consolação × Rua Caio Prado','consolacao caio prado'),
 camera('cet-helio','Av. Hélio Pellegrino × Rua Diogo Jácome','helio pellegrino diogo jacome'),
 camera('cet-ibirapuera','Av. Ibirapuera × Rua Ipê','ibirapuera ipe'),
 camera('cet-iguatemi','Av. Iguatemi × Av. Brigadeiro Faria Lima','iguatemi brigadeiro faria lima'),
 camera('cet-paulista-brigadeiro','Av. Paulista × Av. Brigadeiro Luís Antônio','paulista brigadeiro luis antonio'),
 camera('cet-paulista-consolacao','Av. Paulista × Metrô Consolação','paulista consolacao'),
 {id:'bh-sumob',state:'MG',city:'Belo Horizonte',name:'SUMOB · câmeras de trânsito na área central',street:'belo horizonte centro',url:'https://portalsumob.pbh.gov.br/',type:'regional-directory',agency:'Prefeitura de Belo Horizonte',publicDirectory:true},
 {id:'rj-cor',state:'RJ',city:'Rio de Janeiro',name:'COR.Rio · informações e acesso pelo aplicativo oficial',street:'rio de janeiro cameras cor rio',url:'https://cor.rio/',type:'regional-directory',agency:'Prefeitura do Rio de Janeiro',publicDirectory:true}
]);
export function normalizeBrText(value) {
 return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,' ').replace(/\s+/g,' ').trim();
}
const STOPWORDS=new Set(['rua','avenida','av','praca','bairro','cidade','estado','brasil','sao','paulo','rio','janeiro','belo','horizonte','rodovia']);
export function cityCameraRegion(query){
 const s=' '+normalizeBrText(query)+' ';
 if(/\b(sao paulo|sp)\b/.test(s)||/\b(paulista|pinheiros|ibirapuera|consolacao|faria lima|tiete|jardins|vila mariana|morumbi|itaquera|santana|santo amaro)\b/.test(s))return 'SP';
 if(/\b(rio de janeiro|rj|copacabana|ipanema|barra da tijuca)\b/.test(s))return 'RJ';
 if(/\b(belo horizonte|mg|savassi)\b/.test(s))return 'MG';
 return null;
}
export function findPublicBrazilCameras(query) {
 const search=normalizeBrText(query),region=cityCameraRegion(query);
 if(!search||!region)return [];
 const candidates=BRAZIL_CAMERA_SOURCES.filter(record=>record.state===region);
 const tokens=search.split(' ').filter(word=>word.length>=3&&!STOPWORDS.has(word));
 const detailed=candidates.filter(record=>record.type==='catalog-entry').map(record=>({
   record, matches:tokens.filter(token=>normalizeBrText(record.street+' '+record.name).split(' ').includes(token)).length
 })).filter(entry=>tokens.length===0||entry.matches>0).sort((a,b)=>b.matches-a.matches).map(entry=>entry.record);
 return [...candidates.filter(record=>record.type==='regional-directory'),...detailed];
}
