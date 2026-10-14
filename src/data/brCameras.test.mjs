import test from 'node:test';
import assert from 'node:assert/strict';
import {findPublicBrazilCameras} from './brCameras.js';
test('cameras SP são portais oficiais e sem stream inventado',()=>{
 const results=findPublicBrazilCameras('Av. Paulista, São Paulo, SP');
 assert.ok(results.some(x=>x.name.includes('Paulista')));
 assert.ok(results.every(x=>x.state==='SP'&&x.type==='portal'&&!x.streamUrl));
});
test('busca fora do estado não devolve câmeras de São Paulo',()=>{
 const results=findPublicBrazilCameras('Copacabana, Rio de Janeiro, RJ');
 assert.ok(results.every(x=>x.state==='RJ'));
});
