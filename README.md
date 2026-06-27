# Celebra Teen Perguntas

Aplicação web para receber perguntas pelo QR Code, selecionar perguntas na área administrativa e exibir uma pergunta por vez no telão.

## Rotas

- `/` - pagina publica do QR Code.
- `/admin` - área administrativa protegida por senha simples.
- `/apresentacao` - modo telão com tela de espera e navegação por setas.

## Banco de dados

O projeto usa Supabase pelo backend do Next.js.

1. Crie um projeto no Supabase.
2. Rode o SQL em `supabase/schema.sql` no SQL Editor.
3. Copie `.env.example` para `.env.local`.
4. Preencha:

```bash
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
ADMIN_PASSWORD=uma-senha-forte
```

Use a `service_role key` apenas em variáveis server-side no Vercel. Ela não é enviada para o navegador.

## Desenvolvimento

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`.

## Deploy na Vercel

1. Envie o projeto para um repositorio Git.
2. Importe na Vercel.
3. Configure as mesmas variáveis do `.env.local` em Project Settings > Environment Variables.
4. Faça o deploy.

## Uso no evento

1. Gere um QR Code apontando para a URL publica do deploy.
2. Abra `/admin`, digite a senha e selecione as perguntas.
3. Ordene usando os botões de subir e baixar.
4. Clique em `Iniciar apresentação`.
5. No telão, use seta direita para começar/avançar e seta esquerda para voltar.
