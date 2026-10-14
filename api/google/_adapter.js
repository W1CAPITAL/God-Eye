import {googlePlacesContextProxy} from '../../server/providers/places/google.js';
const routes=new Map();
googlePlacesContextProxy().configureServer({middlewares:{use(path,handler){routes.set(path,handler);}}});
export function runOfficialGooglePlaces(route,req,res){
 const fn=routes.get('/api/google/'+route);
 if(!fn){res.statusCode=404;res.end('Not found');return;}
 return fn(req,res);
}
