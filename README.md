# PSI Analytics 🩺

Dashboard de análise psiquiátrica para serviços de saúde mental, fornecendo insights clínicos baseados em dados de pacientes.

## 📊 Funcionalidades

- **Dashboard Principal**: Visualização completa de métricas e indicadores
- **Análise de Reinternações**: Monitoramento de readmissões e padrões
- **Análise de Tendências**: Identificação de trends e comportamentos
- **Exportação de Dados**: Relatórios em PDF e outros formatos
- **Informações do Serviço**: Detalhes sobre o perfil assistencial

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: shadcn/ui + Radix UI + Tailwind CSS
- **Backend**: Supabase (PostgreSQL)
- **Estado**: TanStack Query (React Query)
- **Roteamento**: React Router v6
- **Gráficos**: Recharts
- **Formulários**: React Hook Form + Zod

## 🚀 Como executar

### Pré-requisitos
- Node.js e npm instalados ([instalar com nvm](https://github.com/nvm-sh/nvm#installing-and-updating))

### Passos

```bash
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Entre no diretório do projeto
cd psi-lauro

# 3. Instale as dependências
npm install

# 4. Execute o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:8080`

## 📁 Estrutura do Projeto

```
src/
├── pages/              # Páginas principais
│   ├── Dashboard.tsx   # Dashboard principal
│   ├── Reinternacoes.tsx # Análise de reinternações
│   ├── Tendencias.tsx  # Análise de tendências
│   ├── Exportar.tsx    # Exportação de dados
│   └── SobreServico.tsx # Informações do serviço
├── components/         # Componentes reutilizáveis
│   ├── dashboard/      # Componentes específicos do dashboard
│   └── ui/            # Biblioteca de componentes UI
├── integrations/       # Integração com Supabase
├── hooks/             # Hooks customizados
└── lib/               # Funções utilitárias
```

## 📋 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento (porta 8080)
- `npm run build` - Build de produção
- `npm run build:dev` - Build de desenvolvimento
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executar ESLint

## 🔒 Segurança

Este projeto lida com dados sensíveis de saúde. Certifique-se de:
- Configurar adequadamente as políticas RLS do Supabase
- Implementar autenticação e autorização adequadas
- Seguir as práticas de segurança para dados médicos

## 📝 Licença

Este projeto é destinado ao uso interno em serviços de saúde mental.