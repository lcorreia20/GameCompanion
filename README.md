# GameCompanion

Aplicação web estática em React, TypeScript e Vite para consultar o guia regional de **Phantom Blade Zero (PS5)** em português brasileiro. Catálogo fundamentado em fontes citadas, com 36 troféus e 9 etapas de roteiro. Os registros seletivos de itens relevantes **não** representam todas as 564 localizações do guia de 100%; algumas dessas localizações podem ser necessárias para troféus. Sem contas, servidor de dados ou sincronização: o progresso fica no `localStorage` do navegador. Exporte um backup JSON antes de limpar os dados do navegador ou trocar de aparelho.

**Fonte verificada em 01/11/2026:** [página oficial PlayStation Brasil](https://www.playstation.com/pt-br/games/phantom-blade-zero/) — plataforma PS5, lançamento em 29/10/2026, distribuidora S-GAME Publishing e interface em português brasileiro. A fonte não foi usada para inferir troféus, missões, coletáveis, requisitos ou itens perdíveis. Arte ilustrativa original da interface não representa a capa oficial.

**Fontes do guia consultadas em 01/11/2026:** [PowerPyx — troféus e roteiro](https://www.powerpyx.com/phantom-blade-zero-trophy-guide-roadmap/), [final verdadeiro](https://www.powerpyx.com/phantom-blade-zero-true-ending-guide/) e [coletáveis](https://www.powerpyx.com/phantom-blade-zero-collectibles-guide-100-completion/), além dos guias individuais das nove áreas referenciados em `src/data/games/phantom-blade-zero/sources.ts`. Dificuldade e duração são **estimativas de terceiro**, não valores oficiais. Divergências de nomes, contagem de regiões e tesouros estão registradas em `metadata.ts`; não inferimos condições ausentes.

**Progresso antigo:** o adaptador em `src/repositories/local.ts` lê a chave v1 sem apagá-la, preserva o valor bruto original antes da primeira gravação v2 e continua aceitando backups JSON v1. Marcações dos exemplos antigos permanecem recuperáveis, mas nunca se transformam automaticamente em troféus reais nem entram na barra da platina. O esquema de progresso (`schemaVersion`) e o conteúdo (`contentVersion`) têm versões independentes.

Projeto Vite executado com Node.js 22 em Docker rootless. As dependências npm são instaladas **no contêiner**, sem Node/npm no host. O projeto precisa conter `package.json`, `package-lock.json` e os scripts `dev` e `build`.

## Desenvolvimento local na LAN

Pré-requisitos: Docker rootless e plugin Compose disponíveis ao usuário, interface `enp2s0` com IP `192.168.1.112/24`, porta **TCP 5181** livre. Confirme novamente IP e disponibilidade da porta antes de iniciar: a configuração não se ajusta automaticamente se o IP mudar.

```sh
cd /home/devadmin/projects/gamecompanion
ip -4 -o addr show scope global
ss -H -ltn '( sport = :5181 )'
docker --context rootless compose --env-file /dev/null config
docker --context rootless compose --env-file /dev/null up --build -d
docker --context rootless compose --env-file /dev/null logs -f web
```

O Vite escuta em `0.0.0.0:5173` **somente dentro do contêiner**; o host vincula `192.168.1.112:5181/tcp`. Teste `http://192.168.1.112:5181/` em outro dispositivo da LAN. Parar sem remover dados: `docker --context rootless compose --env-file /dev/null down` (nunca usar `down -v`). Para verificar tipos e build sem gravar na árvore montada somente para leitura, execute `docker --context rootless compose --env-file /dev/null run --rm --no-deps web sh -c 'node_modules/.bin/tsc --noEmit -p tsconfig.app.json && node_modules/.bin/tsc --noEmit -p tsconfig.node.json && node_modules/.bin/vite build --config /app/node_modules/.vite-local/vite.config.ts --outDir /tmp/dist'`; o resultado temporário é removido com o contêiner. Para testes: `docker --context rootless compose --env-file /dev/null run --rm --no-deps web npm test -- --config /app/node_modules/.vite-local/vite.config.ts`. O script `npm run build` usa `tsc -b`, que pode gravar arquivos incrementais no projeto e, por isso, deve rodar apenas em ambiente gravável, como o GitHub Actions. `compose run` não publica a porta por padrão. A opção `--env-file /dev/null` evita o carregamento automático de arquivos `.env` pelo Compose.

O volume nomeado `gamecompanion_node_modules` armazena dependências e a cópia temporária da configuração Vite; `npm ci` reinstala dependências conforme o lockfile a cada inicialização. O entrypoint copia a versão atual de `vite.config.ts` para esse volume gravável, onde Vite/Vitest podem criar seus arquivos `.timestamp` sem tocar no projeto. Mudanças na configuração exigem reiniciar o contêiner (`docker --context rootless compose --env-file /dev/null restart web`); alterações normais no código continuam disponíveis para o Vite. A árvore do projeto é montada somente para leitura. Não coloque credenciais no diretório do projeto: o bind mount expõe seu conteúdo ao contêiner. O contexto de build é limitado a `.github/docker` para não enviar a árvore do projeto ao daemon Docker. Limites do serviço: 1 CPU, 768 MiB RAM, 128 processos, sem capabilities, usuário `node`; npm usa tmpfs em `/tmp` limitado a 128 MiB. Ajustes de recursos, se necessários, devem ser feitos conscientemente no Compose.

Para conferir navegação, persistência, console e ausência de rolagem horizontal em celular, tablet e desktop com Chromium isolado (servidor já iniciado), rode opcionalmente:

```sh
docker --context rootless run --rm --ipc=host -v "$PWD:/app:ro" -v /tmp/opencode:/tmp/opencode:rw -w /app mcr.microsoft.com/playwright:v1.58.2-noble sh -c 'npm install --prefix /tmp/browser --no-audit --no-fund playwright@1.58.2 && NODE_PATH=/tmp/browser/node_modules node tests/browser-smoke.cjs'
```

As capturas da execução ficam em `/tmp/opencode/gamecompanion-{mobile,tablet,desktop}.png`; não entram no repositório. Se o IP LAN mudar, ajuste `GAMECOMPANION_URL` no ambiente do contêiner e a porta publicada em `compose.yaml`.

**Segurança de rede:** vincular a um IP LAN não comprova restrição de origem nem impede acesso pela internet caso exista encaminhamento no roteador. Esta configuração não modifica firewall, roteador ou Ubuntu. Antes de qualquer disponibilização, valide a política de firewall/rede com o responsável; se precisar de alteração administrativa, solicite autorização específica e não contorne bloqueios. Não há banco nem interface administrativa publicada.

## GitHub Pages (publicação opcional)

O workflow `.github/workflows/pages.yml` é **manual** (`workflow_dispatch`) e não publica nada enquanto não for acionado no repositório remoto. Depois de autorizado explicitamente a disponibilizar publicamente: mantenha o lockfile versionado, configure **Settings → Pages → Build and deployment → GitHub Actions** no repositório, execute **Actions → Publicar no GitHub Pages → Run workflow** e confira o endereço retornado pela execução. O build usa `npm ci`, `npm run build` e base `/<nome-do-repositorio>/`, para um site de projeto em Pages; domínio personalizado ou repositório `*.github.io` exige adaptar a base. O artifact publicado é `dist/`. GitHub Pages é público: não inclua segredos no código estático nem em variáveis de build.
