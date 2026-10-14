import test from 'node:test';
import assert from 'node:assert/strict';
import {BRAZIL_CAMERA_SOURCES,cityCameraRegion,findPublicBrazilCameras} from './brCameras.js';

test('câmeras públicas em SP correspondem à rua pesquisada ou ao catálogo estadual',()=>{
 assert.equal(cityCameraRegion('Av Paulista, São Paulo SP'),'SP');
 const result=findPublicBrazilCameras('Av. Paulista, São Paulo, SP');
 assert.ok(result.some(x=>x.name.includes('Paulista')));
 assert.ok(result.every(x=>x.state==='SP' && x.publicDirectory && !x.streamUrl));
 assert.ok(result.every(x=>x.type==='catalog-entry'||x.type==='regional-directory'));
});
test('não apresenta via distante como câmera próxima nem troca de estado',()=>{
 const results=findPublicBrazilCameras('Rua das Orquídeas, São Paulo SP');
 assert.ok(results.some(x=>x.id==='cet-sp'));
 assert.equal(results.filter(x=>x.type==='catalog-entry').length,0);
 assert.ok(findPublicBrazilCameras('Copacabana, Rio de Janeiro RJ').every(x=>x.state==='RJ'));
 assert.deepEqual(findPublicBrazilCameras('Rua Sem Nome, Tóquio'),[]);
});
test('somente fontes oficiais auditáveis, sem stream particular',()=>{
 assert.ok(BRAZIL_CAMERA_SOURCES.every(x=>x.publicDirectory && /^https:\/\//.test(x.url)));
 assert.ok(BRAZIL_CAMERA_SOURCES.every(x=>!x.streamUrl));
});
