/** Public official camera directories. Portals are not invented live stream URLs. */
const CET='https://cameras.cetsp.com.br/View/Cam.aspx';
export const BRAZIL_CAMERA_SOURCES=Object.freeze([
  {id:'cet-sp',state:'SP',city:'São Paulo',name:'CET São Paulo — câmeras de trânsito',url:CET,type:'portal',agency:'CET-SP',street:'capital, principais avenidas'},
  {id:'der-sp',state:'SP',city:'São Paulo',name:'DER-SP — câmeras das rodovias',url:'https://dersp.der.sp.gov.br/WebSite/Servicos/ServicosOnline/CamerasOnlineMapa.aspx',type:'portal',agency:'DER-SP',street:'rodovias de São Paulo'},
  {id:'cet-paulista-consolacao',state:'SP',city:'São Paulo',name:'Av. Paulista × Metrô Consolação',url:CET,type:'portal',agency:'CET-SP',street:'paulista consolacao'},
  {id:'cet-paulista-brigadeiro',state:'SP',city:'São Paulo',name:'Av. Paulista × Av. Brigadeiro Luís Antônio',url:CET,type:'portal',agency:'CET-SP',street:'paulista brigadeiro luis antonio'},
  {id:'cet-ibirapuera',state:'SP',city:'São Paulo',name:'Av. Ibirapuera × Rua Ipê',url:CET,type:'portal',agency:'CET-SP',street:'ibirapuera ipe'},
  {id:'cet-consolacao',state:'SP',city:'São Paulo',name:'Rua da Consolação × Rua Caio Prado',url:CET,type:'portal',agency:'CET-SP',street:'consolacao caio prado'},
  {id:'cet-faria-lima',state:'SP',city:'São Paulo',name:'Av. Brigadeiro Faria Lima (Iguatemi)',url:CET,type:'portal',agency:'CET-SP',street:'faria lima iguatemi'},
  {id:'cet-cidade-jardim',state:'SP',city:'São Paulo',name:'Av. Cidade Jardim × Av. Nove de Julho',url:CET,type:'portal',agency:'CET-SP',street:'cidade jardim nove julho'},
  {id:'cet-reboucas',state:'SP',city:'São Paulo',name:'CET — rede de câmeras de Rebouças e região',url:CET,type:'portal',agency:'CET-SP',street:'reboucas'},
  {id:'bh-sumob',state:'MG',city:'Belo Horizonte',name:'SUMOB — câmeras e situação de trânsito',url:'https://portalsumob.pbh.gov.br/',type:'portal',agency:'Prefeitura de Belo Horizonte',street:'centro'},
  {id:'rj-cor',state:'RJ',city:'Rio de Janeiro',name:'COR.Rio — serviço de câmeras públicas',url:'https://carioca.rio/termos/camera/?temas=transito',type:'portal',agency:'Prefeitura do Rio de Janeiro',street:'cidade'}
]);
export function normalizeBrText(value) {
 return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^\p{L}\p{N}]/gu,' ').replace(/\s+/g,' ').trim();
}
export function findPublicBrazilCameras(q) {
 const search=normalizeBrText(q);
 const sp=/(?:sao paulo|sp|paulista|pinheiros|ibirapuera|consolacao|faria lima|tiete|centro|jardins|vila mariana|morumbi|itaquera|santana|santo amaro)/.test(search);
 const rj=/(?:rio de janeiro|rj|copacabana|ipanema|barra da tijuca)/.test(search);
 const mg=/(?:belo horizonte|mg|contagem|savassi)/.test(search);
 const states=new Set();
 if(sp)states.add('SP');
 if(rj)states.add('RJ');
 if(mg)states.add('MG');
 const candidates=BRAZIL_CAMERA_SOURCES.filter(x=>!states.size||states.has(x.state));
 // Name-match first, but also include relevant regional camera portals.
 const tokens=search.split(' ').filter(w=>w.length>3 && !['paulo','brasil','avenida','bairro','cidade','estado'].includes(w));
 return candidates.map(x=>{
    const combined=normalizeBrText(x.name+' '+x.street+' '+x.city);
    const matches=tokens.filter(t=>combined.includes(t)).length;
    return {...x, relevance:matches};
 }).sort((a,b)=>b.relevance-a.relevance||((a.type==='portal')?-1:1));
}
