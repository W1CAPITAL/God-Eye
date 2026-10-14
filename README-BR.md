# God's Eye View · Brasil

Fork da ferramenta original [God's Eye View](https://github.com/bilawalsidhu/gods-eye-view), autoria de Bilawal Sidhu, licença MIT.

Esta versão prepara a interface Cesium/Vite para Vercel e adiciona pesquisa brasileira por CEP, rua, avenida, bairro, cidade e UF. CEPs apontam para uma área postal aproximada, nunca para a posição garantida de uma residência ou pessoa.

## Implantação

Conecte este repositório à Vercel (framework Vite, saída `dist`, comando `npm run build`, Node 24.x). `/api/geocode` responde buscas geográficas com prioridade ao Brasil e `/api/health` é a verificação básica. O geocoder usa Nominatim e requer respeito ao limite do serviço; para produção em escala configure `NOMINATIM_SEARCH_URL` com uma instância própria/licenciada.

**Limitação:** o original tem dezenas de proxies do servidor local Vite. Na Vercel, apenas as funções serverless efetivamente implementadas estarão disponíveis. Algumas camadas ao vivo podem exigir migração adicional. Não exponha a rota administrativa local de chaves.

Créditos e licença original devem ser mantidos. Consulte o arquivo `LICENSE` e `THIRD_PARTY_NOTICES.md` após a importação do código original.
