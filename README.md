# Car Wash Front

Frontend da aplicação Car Wash, desenvolvido com React e Vite.

Este documento explica:

- quais tecnologias e bibliotecas o projeto utiliza;
- como instalar e executar o frontend;
- como executar um mock da API a partir de um arquivo OpenAPI (`openapi.yaml`);
- como configurar a URL da API;
- quais endpoints o frontend consome;
- quais partes ainda são mockadas no próprio frontend;
- como validar se a integração está funcionando.

## Pré-requisitos

Instale:

- Node.js, de preferência uma versão LTS atual;
- npm, instalado junto com o Node.js.

Verifique as versões:

```powershell
node --version
npm --version
```

O projeto não exige PHP, Composer, MySQL ou Laravel para rodar somente o frontend
com o mock da API.

## Bibliotecas utilizadas

As dependências estão no [package.json](./package.json).

### Dependências de execução

| Biblioteca | Uso |
| --- | --- |
| `react` | Construção dos componentes e telas |
| `react-dom` | Renderização da aplicação no navegador |
| `react-router-dom` | Navegação entre as páginas `/` e `/agendar` |
| `axios` | Chamadas HTTP para a API |
| `bootstrap` | Grid, formulários, modais e utilitários visuais |
| `react-icons` | Ícones dos serviços, botões e navegação |
| `sass` | Compilação dos estilos Bootstrap customizados |

### Dependências de desenvolvimento

| Biblioteca | Uso |
| --- | --- |
| `vite` | Servidor de desenvolvimento e build |
| `@vitejs/plugin-react` | Suporte do React no Vite |
| `eslint` | Análise estática e lint |
| `eslint-plugin-react-hooks` | Regras para Hooks do React |
| `eslint-plugin-react-refresh` | Validação do React Fast Refresh |
| `@eslint/js` | Configuração base do ESLint |
| `globals` | Globais de ambiente usadas pelo ESLint |
| `@types/react` | Tipos auxiliares do React |
| `@types/react-dom` | Tipos auxiliares do React DOM |

## Instalação do frontend

Na raiz do projeto:

```powershell
npm install
```

Esse comando instala as dependências definidas no `package.json`.

## Variáveis de ambiente

O frontend usa a variável `VITE_API_URL` para definir o endereço base da API.

O arquivo [.env.example](./.env.example) contém a configuração esperada:

```env
VITE_API_URL=http://127.0.0.1:4010
```

Crie ou confirme o arquivo `.env` na raiz:

```env
VITE_API_URL=http://127.0.0.1:4010
```

O arquivo `.env` é local e está no `.gitignore`. Não coloque senhas, tokens ou
outras credenciais nele.

Depois de alterar o `.env`, reinicie o Vite:

```powershell
npm run dev
```

## Como o frontend monta as URLs

As chamadas estão centralizadas em
[rotas-api.service.js](./src/shared/rotas_api/rotas-api.service.js):

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})
```

O serviço acrescenta o prefixo `/api` às rotas:

```js
api.get('/api/servicos')
api.post('/api/agendamentos', dadosAgendamento)
```

Com esta configuração:

```env
VITE_API_URL=http://127.0.0.1:4010
```

as URLs finais serão:

```text
GET  http://127.0.0.1:4010/api/servicos
POST http://127.0.0.1:4010/api/agendamentos
```

Não coloque `/api` no valor de `VITE_API_URL`, pois o serviço já acrescenta
esse prefixo.

## Executando o mock da API

Como o backend Laravel ainda não está disponível localmente, use o Prism para
subir um servidor mock a partir do contrato OpenAPI.

Você precisa de uma URL que aponte diretamente para o arquivo YAML. A URL de
visualização do GitHub com `/blob/` não funciona como documento raw.

### URL correta de um arquivo no GitHub

Formato de visualização, que não deve ser usado diretamente no Prism:

```text
https://github.com/usuario/repositorio/blob/main/docs/openapi.yaml
```

Formato raw, que pode ser usado:

```text
https://raw.githubusercontent.com/usuario/repositorio/main/docs/openapi.yaml
```

Observe que a URL raw não contém `/blob/`.

### Iniciando o Prism com uma URL raw

Na raiz do frontend, execute:

```powershell
npx @stoplight/prism-cli mock "URL_RAW_DO_OPENAPI" -p 4010
```

Exemplo:

```powershell
npx @stoplight/prism-cli mock "https://raw.githubusercontent.com/usuario/repositorio/main/docs/openapi.yaml" -p 4010
```

Se a URL for válida, mantenha esse terminal aberto. O Prism deve escutar em:

```text
http://127.0.0.1:4010
```

O `npx` pode baixar o Prism na primeira execução. Não é necessário adicionar o
Prism ao `package.json` para usar esse comando.

### Iniciando o Prism com um arquivo baixado

Se a URL raw não estiver acessível ou exigir autenticação, baixe o YAML:

```powershell
Invoke-WebRequest `
  -Uri "URL_RAW_DO_OPENAPI" `
  -OutFile ".\openapi.yaml"
```

Depois inicie o mock usando o arquivo:

```powershell
npx @stoplight/prism-cli mock ".\openapi.yaml" -p 4010
```

O arquivo `openapi.yaml` é apenas um arquivo local de apoio. Não é necessário
alterar o código React para usá-lo.

## Executando o frontend

Com o Prism rodando em um terminal, abra outro terminal na raiz do frontend:

```powershell
npm run dev
```

O Vite exibirá uma URL semelhante a:

```text
http://localhost:5173
```

Abra essa URL no navegador.

Fluxo recomendado:

1. Inicie o Prism na porta `4010`.
2. Confirme que a API responde.
3. Inicie o Vite.
4. Acesse a página principal.
5. Acesse `/agendar`.

## Testando a API antes do frontend

No PowerShell:

```powershell
Invoke-WebRequest `
  -Uri "http://127.0.0.1:4010/api/servicos" `
  -Headers @{ Accept = "application/json" }
```

Se o endpoint funcionar, deverá retornar uma resposta JSON.

Também é possível verificar se a porta está aberta:

```powershell
Test-NetConnection 127.0.0.1 -Port 4010
```

O resultado esperado é:

```text
TcpTestSucceeded : True
```

Se aparecer `False` ou `Connection refused`, o Prism não está rodando nessa
porta, foi encerrado ou está usando outra porta.

## Endpoints usados pelo frontend

As chamadas atuais ficam em
[rotas-api.service.js](./src/shared/rotas_api/rotas-api.service.js).

| Método | Endpoint | Uso |
| --- | --- | --- |
| `GET` | `/api/servicos` | Lista os serviços na página principal e no formulário |
| `POST` | `/api/agendamentos` | Envia os dados do formulário de agendamento |

### Formato esperado para serviços

O backend deve retornar um array de objetos semelhante a:

```json
[
  {
    "id": 1,
    "nome": "Lavagem de Muros e Paredes Externas",
    "descricao": "..."
  }
]
```

A página principal utiliza `id` e `nome`. Os ícones não vêm do backend: eles
ficam definidos no frontend em
[conteudoPaginaPrincipal.jsx](./src/features/componentesEspecificos/conteudoPaginaPrincipal.jsx),
por meio de um mapa entre o nome do serviço e o ícone correspondente.

Se surgir um nome de serviço que não esteja nesse mapa, o frontend usa um ícone
padrão.

### Limitação atual do mock

O Prism responde conforme os exemplos e schemas do OpenAPI. Ele não representa
um banco de dados real:

- não persiste serviços ou agendamentos;
- pode retornar sempre o mesmo exemplo;
- não cria usuários de verdade;
- não mantém uma sessão real;
- não substitui o backend Laravel.

Além disso, se `POST /api/agendamentos` existir apenas no contrato OpenAPI,
o Prism poderá simular a resposta, mas o backend real ainda precisará
implementar essa rota.

## Autenticação atual

O login atual é mockado no próprio frontend em
[authMock.service.js](./src/shared/auth/authMock.service.js). Ele usa
`sessionStorage` e não chama `/api/login`.

Usuários disponíveis para desenvolvimento:

```text
Administrador
Email: admin@carwash.com
Senha: admin123

Usuário normal
Email: usuario@carwash.com
Senha: usuario123
```

Essa autenticação serve apenas para testar a interface. Ela não deve ser usada
em produção, pois as credenciais ficam no código do navegador.

O backend documentado possui autenticação real com Sanctum, mas a integração
do token ainda precisa ser feita no frontend. Quando isso for implementado,
o fluxo deverá:

1. enviar `POST /api/login`;
2. guardar o token retornado;
3. enviar `Authorization: Bearer <token>` nas rotas protegidas;
4. chamar `POST /api/logout` ao sair;
5. tratar respostas `401`, `422` e `429`.

## Scripts disponíveis

### Desenvolvimento

```powershell
npm run dev
```

Inicia o Vite em modo de desenvolvimento.

### Lint

```powershell
npm run lint
```

Executa o ESLint em todo o projeto.

### Build

```powershell
npm run build
```

Gera a versão de produção na pasta `dist`.

### Preview do build

```powershell
npm run preview
```

Serve localmente o conteúdo já compilado de `dist`.

## Estrutura principal

```text
src/
├── features/
│   ├── componentesEspecificos/
│   │   ├── conteudoPaginaPrincipal.jsx
│   │   ├── conteudoPaginaFormulario.jsx
│   │   ├── modalLogin.jsx
│   │   ├── modalCadastro.jsx
│   │   └── modalConta.jsx
│   └── pages/
│       ├── paginaPrincipal.jsx
│       └── paginaFormulario.jsx
├── routes/
│   └── routes.jsx
├── shared/
│   ├── auth/
│   │   └── authMock.service.js
│   ├── componentes/
│   ├── rotas_api/
│   │   └── rotas-api.service.js
│   └── styles/
└── main.jsx
```

Rotas atuais:

```text
/         Página principal
/agendar Formulário de agendamento
```

## Problemas comuns

### `ERR_CONNECTION_REFUSED`

Significa que não há servidor escutando na URL configurada. Confira:

```powershell
Test-NetConnection 127.0.0.1 -Port 4010
```

Se falhar, inicie o Prism e deixe o processo aberto.

### Erro `Not Found` ao baixar o OpenAPI

Normalmente ocorre quando foi usada uma URL como:

```text
https://raw.githubusercontent.com/usuario/repositorio/blob/main/docs/openapi.yaml
```

Remova `/blob`:

```text
https://raw.githubusercontent.com/usuario/repositorio/main/docs/openapi.yaml
```

Também confirme se o repositório, branch e caminho do arquivo existem.

### O frontend não reconhece a mudança no `.env`

Pare e inicie o Vite novamente:

```powershell
npm run dev
```

As variáveis `VITE_*` são carregadas quando o Vite inicia.

### Erro de CORS

O mock Prism deve ser iniciado com CORS habilitado. O comando recomendado já
usa esse comportamento:

```powershell
npx @stoplight/prism-cli mock "URL_RAW_DO_OPENAPI" -p 4010
```

Se estiver usando o backend Laravel, a origem do Vite precisa estar liberada
no CORS do backend, normalmente:

```text
http://localhost:5173
```

e, dependendo da URL usada para abrir o frontend:

```text
http://127.0.0.1:5173
```

## Checklist rápido

```text
[ ] Node.js e npm instalados
[ ] npm install executado
[ ] .env criado com VITE_API_URL=http://127.0.0.1:4010
[ ] URL raw do openapi.yaml confirmada
[ ] Prism executando na porta 4010
[ ] GET /api/servicos respondendo JSON
[ ] Vite executando com npm run dev
[ ] Frontend aberto em http://localhost:5173
```
