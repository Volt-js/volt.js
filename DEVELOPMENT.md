# Development Guide

Este guia explica como desenvolver e testar a CLI do Volt.js localmente.

## 🚀 Setup do Ambiente de Desenvolvimento

### 1. Instalar Dependências

```bash
# Na raiz do monorepo
cd "C:\Users\ander\Desktop\src\volt.js"
npm install

# Build inicial
npm run build
```

### 2. Setup da CLI para Desenvolvimento

```bash
# Na pasta da CLI
cd packages/cli

# Link globalmente para usar em qualquer lugar
npm link

# Agora você pode usar 'volt' em qualquer diretório
volt init my-test-app
```

## 🧪 Como Testar Localmente

### Método 1: Build e Link (Recomendado para testes gerais)

```bash
# Na raiz do monorepo
npm run build

# Na pasta da CLI
cd packages/cli
npm link

# Testar em um diretório temporário
mkdir ../../../temp-tests
cd ../../../temp-tests

# Criar projetos teste
volt init test-project
```

### Método 2: Executar Diretamente com tsx (Melhor para debug)

```bash
# Na pasta da CLI
cd packages/cli

# Executar comando init diretamente
npx tsx src/bin.ts init my-test-app

# Com flags específicas
npx tsx src/bin.ts init my-drizzle-app --database=postgresql --orm=drizzle
```

## 🔄 Testando Diferentes Configurações

### NextJS + Drizzle + ShadCN

```bash
npx tsx src/bin.ts init test-nextjs \
  --template=starter-nextjs \
  --database=postgresql \
  --orm=drizzle \
  --ui=shadcn
```

### Express + Prisma + Styled Components

```bash
npx tsx src/bin.ts init test-express \
  --template=starter-express-rest-api \
  --database=mysql \
  --orm=prisma \
  --styling=styled-components
```

### Vite + Drizzle + Tailwind

```bash
npx tsx src/bin.ts init test-vite \
  --template=starter-bun-react-app \
  --database=sqlite \
  --orm=drizzle \
  --styling=tailwind
```

### Modo Interativo (Sem Flags)

```bash
# Testa todos os prompts interativos
npx tsx src/bin.ts init test-interactive
```

## 🔍 Verificação de Funcionalidades

### 1. Verificar Dependências Geradas

```bash
# Após gerar um projeto
cd test-project

# Verificar dependencies no package.json
grep -A 20 '"dependencies"' package.json
grep -A 10 '"devDependencies"' package.json

# Verificar scripts gerados
grep -A 10 '"scripts"' package.json
```

### 2. Verificar Schemas Gerados

```bash
# Para Drizzle
ls -la src/db/
cat src/db/schema.ts
cat drizzle.config.ts

# Para Prisma  
ls -la prisma/
cat prisma/schema.prisma
```

### 3. Verificar Configurações de Styling

```bash
# Se ShadCN foi selecionado
ls -la components/ui/  # Deve ser criado
grep "tailwindcss" package.json  # Deve estar presente

# Se Tailwind sem ShadCN
test -f tailwind.config.js && echo "Tailwind config exists"

# Se Styled Components
grep "styled-components" package.json
```

## 🧰 Comandos de Debug

### Debug Apenas os Prompts

```bash
# Criar arquivo de teste rápido
echo 'import { runSetupPrompts } from "./src/adapters/setup/prompts.js"
runSetupPrompts("./test-project").then(console.log)' > debug-prompts.mjs

node debug-prompts.mjs
```

### Debug Geração de Dependências

```bash
# Testar função getAllDependencies
echo 'import { getAllDependencies } from "./src/adapters/setup/features.js"
const result = getAllDependencies(["store", "logging"], "postgresql", "drizzle", "tailwind", true)
console.log(JSON.stringify(result, null, 2))' > debug-deps.mjs

node debug-deps.mjs
```

### Verificar TypeScript

```bash
# Na pasta da CLI
npx tsc --noEmit
```

## ✅ Fluxo Completo de Teste

```bash
# 1. Gerar projeto teste
npx tsx src/bin.ts init full-test \
  --database=postgresql \
  --orm=drizzle \
  --ui=shadcn

# 2. Entrar no projeto
cd full-test

# 3. Instalar dependências
npm install

# 4. Verificar se database scripts funcionam
npm run db:generate

# 5. Tentar rodar o projeto
npm run dev
```

## 🐛 Troubleshooting

### Erro de Link Global

```bash
# Remover link antigo
npm unlink -g @volt.js/cli

# Recriar link
cd packages/cli
npm link
```

### Problemas de TypeScript

```bash
# Limpar e rebuildar
npm run clean
npm run build
```

### Dependências Não Instaladas

```bash
# Na raiz do monorepo
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Cenários de Teste Principais

1. **ORM Selection**: Verificar se Drizzle e Prisma geram estruturas corretas
2. **ShadCN Integration**: Confirmar que auto-seleciona Tailwind
3. **Styling Options**: Testar styled-components, emotion, tailwind
4. **Conditional Prompts**: ORM só aparece se database !== 'none'
5. **Dependencies**: Verificar se todas as deps são instaladas corretamente
6. **Configuration Summary**: Verificar se o summary mostra informações corretas

---

💡 **Dica**: Para desenvolvimento ativo, use o Método 2 (tsx direto) pois não precisa rebuild a cada mudança.