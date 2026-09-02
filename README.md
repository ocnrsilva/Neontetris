# 🕹️ Neon Tetris

<div align="center">

![Neon Tetris Banner](https://raw.githubusercontent.com/onsilvabr/neon-tetris/main/public/favicon.svg)

### *Stacker competitivo de alta performance com física moderna SRS+, estética cyberpunk e resposta ultrarrápida.*

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker Ready](https://img.shields.io/badge/Docker-3006-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[🎮 Visão Geral](#-visão-geral) •
[✨ Funcionalidades](#-funcionalidades) •
[🕹️ Modos de Jogo](#️-modos-de-jogo) •
[⌨️ Controles](#️-controles) •
[🚀 Como Instalar e Rodar](#-como-instalar-e-rodar) •
[⚙️ Configurações & Handling](#️-configurações--handling-tetrio-style) •
[🛠️ Tecnologias](#️-tecnologias)

</div>

---

## 🎮 Visão Geral

O **Neon Tetris** é um jogo de empilhamento de blocos competitivo e moderno inspirado nas mecânicas precisas de títulos como **TETR.IO** e nas diretrizes oficiais dos stackers modernos. Construído com **React 19**, **TypeScript** e **Vite**, o jogo combina simulação física de sub-frames com uma interface visual reativa em neon cyberpunk e sintetizador sonoro via **Web Audio API**.

Projetado para jogadores casuais e competidores de alto nível, o jogo inclui suporte a **ARR/DAS instantâneo (0ms)**, tabela de **Wall Kicks SRS+**, rotação de **180°**, detecção completa de **T-Spins** (Mini, Single, Double, Triple) e telemetria ao vivo (**PPS**, **APM**, **KPP** e **Finesse**).

---

## ✨ Funcionalidades

- 🔄 **Super Rotation System (SRS+) & 180° Kicks**: Sistema completo de rotações horária, anti-horária e 180° com tabela estendida de *wall kicks* para tetrominós em espaços apertados.
- 📐 **Reconhecimento Oficial de T-Spin**: Algoritmo de 3 cantos (*3-corner rule*) com suporte a *T-Spin Mini* e validação de 5º kick.
- 🎲 **Gerador Randômico 7-Bag**: Distribuição justa e uniforme de peças sem repetições consecutivas que quebrem a estratégia.
- ⚡ **Handling Competitivo Totalmente Ajustável**:
  - **DAS** (*Delayed Auto Shift*): tempo de espera antes do movimento contínuo (ajustável de 50ms a 250ms).
  - **ARR** (*Auto Repeat Rate*): taxa de repetição horizontal (ajustável até **0ms** para teletransporte instantâneo).
  - **SDF** (*Soft Drop Factor*): fator de velocidade da queda suave, incluindo queda instantânea.
  - **DCD** (*DAS Cut Delay*) e **Lock Resets** (até 15 movimentos de reposicionamento no chão).
- 📊 **Telemetria e HUD em Tempo Real**:
  - **PPS** (*Pieces Per Second*): velocidade de colocação de peças.
  - **APM** (*Attacks Per Minute*): taxa de linhas enviadas por minuto.
  - **KPP** (*Keys Per Piece*): eficiência de comandos por bloco.
  - Contadores de **Combo** e bônus acumulativo **Back-to-Back (B2B)**.
- 🎵 **Áudio Sintetizado Dinâmico (Web Audio API)**:
  - Efeitos sonoros gerados por ondas sintetizadas em tempo real (sem dependência de arquivos MP3 externos pesados).
  - Escala harmônica dinâmica para sequências de combos e sub-grave tátil para *Hard Drops*.
- 📱 **Responsivo & Controles Mobile Touch**: Interface adaptada para desktop e dispositivos móveis com controles virtuais táteis e suporte nativo a Gamepads.
- 🐳 **Pronto para Docker**: Deploy conteinerizado multi-stage em Nginx servindo nativamente na porta `3006`.

---

## 🕹️ Modos de Jogo

| Modo | Objetivo | Destaque |
| :--- | :--- | :--- |
| ⚡ **40 Lines (Sprint)** | Limpar 40 linhas no menor tempo possível | Cronômetro com precisão de milissegundos e medidor de PPS para benchmark de velocidade. |
| 🔥 **Blitz** | Conquistar a maior pontuação em 2 minutos | Multiplicadores de nível a cada meta de linhas, sequência de B2B e combos decisivos. |
| 🏃 **Marathon** | Sobreviver e pontuar ao longo de 15 níveis | Aumento progressivo e implacável da gravidade a cada 10 linhas completadas. |
| 🧘 **Zen** | Prática livre e relaxada sem pressão de tempo | Ideal para treinar aberturas (*TKI*, *DT Cannon*, *MKO*), *downstacking* e *Perfect Clears*. |

---

## ⌨️ Controles

Os controles são pré-configurados com o padrão internacional competitivo e podem ser remapeados a qualquer momento no menu de configurações:

| Ação | Teclas Padrão | Alternativa |
| :--- | :--- | :--- |
| **Mover para Esquerda** | <kbd>←</kbd> (Seta Esquerda) | <kbd>A</kbd> |
| **Mover para Direita** | <kbd>→</kbd> (Seta Direita) | <kbd>D</kbd> |
| **Queda Suave (Soft Drop)** | <kbd>↓</kbd> (Seta Baixo) | <kbd>S</kbd> |
| **Queda Instantânea (Hard Drop)** | <kbd>Espaço</kbd> | <kbd>W</kbd> |
| **Girar Sentido Horário (CW)** | <kbd>↑</kbd> (Seta Cima) | <kbd>X</kbd> |
| **Girar Sentido Anti-Horário (CCW)** | <kbd>Z</kbd> | <kbd>Ctrl</kbd> |
| **Girar 180°** | <kbd>A</kbd> / <kbd>Shift</kbd> | <kbd>C</kbd> |
| **Guardar Peça (Hold)** | <kbd>C</kbd> | <kbd>Shift</kbd> |
| **Reiniciar Partida Rápida** | <kbd>R</kbd> | Botão de Interface |
| **Pausar** | <kbd>Esc</kbd> | <kbd>P</kbd> |

---

## 🚀 Como Instalar e Rodar

Você pode rodar o **Neon Tetris** localmente de duas formas simples: através do **Docker** (recomendado para produção e visualização direta na porta 3006) ou via **Node.js** em modo desenvolvimento.

### Opção 1: Via Docker / Docker Compose (Pronto na Porta 3006)

O repositório já inclui um `Dockerfile` multi-stage com Nginx otimizado e um arquivo `docker-compose.yml` mapeado para a porta **3006**.

#### Pré-requisitos:
- [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

#### Passos:
```bash
# 1. Clone o repositório
git clone https://github.com/onsilvabr/neon-tetris.git
cd neon-tetris

# 2. Inicie o container em segundo plano
docker compose up -d --build

# 3. Acesse o jogo no navegador:
# 👉 http://localhost:3006
```

Para parar a aplicação:
```bash
docker compose down
```

---

### Opção 2: Rodando Diretamente via Node.js

#### Pré-requisitos:
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- Gerenciador de pacotes `npm` ou `yarn`.

#### Passos:
```bash
# 1. Clone o repositório
git clone https://github.com/onsilvabr/neon-tetris.git
cd neon-tetris

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev

# 4. Acesse a URL indicada no terminal (geralmente http://localhost:3000 ou 5173)
```

#### Scripts Disponíveis no Projeto:
- `npm run dev`: Inicia o servidor Vite em modo de desenvolvimento com Hot Reload.
- `npm run build`: Compila o TypeScript e empacota os arquivos estáticos de produção na pasta `dist/`.
- `npm run preview`: Serve localmente o build de produção da pasta `dist/`.
- `npm run lint`: Valida tipos TypeScript sem emitir arquivos (`tsc --noEmit`).

---

## ⚙️ Configurações & Handling (TETR.IO Style)

No menu de configurações (ícone de engrenagem no cabeçalho), você pode calibrar a resposta mecânica de acordo com o seu estilo de jogo:

- **DAS (Delayed Auto Shift)**: Define o atraso em milissegundos antes que uma peça comece a se mover em velocidade contínua quando a tecla é mantida pressionada.
- **ARR (Auto Repeat Rate)**: Controla a velocidade de deslizamento horizontal. Ao definir como `0ms`, a peça se teletransporta instantaneamente para a borda desejada (*instant DAS*).
- **SDF (Soft Drop Factor)**: Define a taxa de aceleração da queda suave.
- **Lock Delay & Ghost**: Ajuste a visibilidade da peça fantasma (*ghost piece*), vibração de tela (*screen shake*) e volumes individuais de efeitos sonoros e trilha.

---

## 🛠️ Tecnologias

Este projeto foi construído com as melhores práticas de desenvolvimento web moderno:

- **Linguagem & Framework**: [React 19](https://react.dev/) com [TypeScript 5.8](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6.2](https://vitejs.dev/) para compilações ultrarrápidas
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) com paleta cyberpunk neon e animações CSS personalizadas
- **Ícones**: [Lucide React](https://lucide.dev/)
- **Efeitos de Vitória**: [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Áudio**: Web Audio API pura com osciladores senoidais, de onda quadrada e filtros de atenuação de frequências
- **Servidor & Deploy**: Dockerfile multi-stage com Nginx Alpine e compressão Gzip

---

## 📁 Estrutura do Projeto

```plaintext
neon-tetris/
├── public/
│   └── favicon.svg           # Ícone vetorial neon com T-Spin
├── components/
│   ├── GameBoard.tsx         # Renderização do tabuleiro e efeito de laser
│   ├── GameModeSelector.tsx  # Seletor dos modos 40L, Blitz, Marathon, Zen
│   ├── HoldDisplay.tsx       # Painel da peça guardada (Hold)
│   ├── QueueDisplay.tsx      # Fila de próximas 5 peças (Next Queue)
│   ├── StatsHUD.tsx          # Painel de métricas (PPS, APM, Linhas, Tempo)
│   ├── SettingsModal.tsx     # Calibração de DAS/ARR e remapeamento de teclas
│   ├── Overlay.tsx           # Telas de Countdown, Game Over, Pause e Vitória
│   └── MobileControls.tsx    # D-pad e botões táteis virtuais para celulares
├── hooks/
│   └── useGameLogic.ts       # Máquina de estados completa do jogo e física SRS+
├── utils/
│   ├── audio.ts              # Sintetizador procedural de áudio Web Audio API
│   └── srsKicks.ts           # Tabelas oficiais de Wall Kick (SRS e 180°)
├── types.ts                  # Tipagens do jogo, peças, matriz e ações
├── Dockerfile                # Build multi-stage Node -> Nginx
├── docker-compose.yml        # Configuração do container na porta 3006
├── nginx.conf                # Configuração do servidor web Nginx
└── index.html                # Entry point com fontes Orbitron e meta tags
```

---

## 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para obter mais detalhes.

<div align="center">
Desenvolvido com ⚡ paixão por jogos competitivos de bloco.
</div>
