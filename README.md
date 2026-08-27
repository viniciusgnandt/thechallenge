# TheChallenge

App de desafios de 100 dias para tirar as pessoas do sedentarismo — níveis Básico/Intermediário/Avançado,
validação de caminhada/corrida/bike via Strava, provas em vídeo (link do YouTube) para os demais exercícios,
ranking, medalha e certificado ao concluir.

Estrutura igual à do `pertodemim`: `backend` (Node/Express/Mongoose), `frontend` (React + Vite) e `mobile` (Expo + expo-router).
Usa o mesmo cluster MongoDB do pertodemim, em outra base (`theChallenge`).

## Backend

```bash
cd backend
npm install
cp .env.example .env   # já vem com a mesma MONGODB_URI do pertodemim, base theChallenge
npm run seed            # cria o admin (admin@thechallenge.app / admin123) e o "Desafio 100 Dias" com os 3 níveis
npm run dev
```

API sobe em `http://localhost:3002`.

### Strava (opcional para o MVP, mas necessário para caminhada/corrida/bike)
1. Crie um app em https://www.strava.com/settings/api
2. Preencha `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET` e `STRAVA_REDIRECT_URI` no `.env`.
3. O usuário conecta a conta pela tela de Perfil (web) ou aba Perfil (mobile).

## Frontend (web)

```bash
cd frontend
npm install
npm run dev
```

Sobe em `http://localhost:5174`, já com proxy de `/api` para o backend.

## Mobile (Expo)

```bash
cd mobile
npm install
cp .env.example .env   # aponta para o backend local
npm start
```

## Como funciona a validação de cada dia

- **Strava** (caminhada, corrida, bike): o usuário conecta a conta Strava; ao clicar em "Sincronizar Strava"
  na tela de progresso, o backend busca as atividades recentes e casa automaticamente com os dias pendentes
  que batem tipo/distância/duração mínima.
- **Vídeo** (força, alongamento etc.): o usuário sobe o vídeo no YouTube (não listado, por exemplo) e cola o
  link. Fica pendente até um admin aprovar em `/admin` (web).
- **Check-in**: dias simples que só pedem confirmação por honestidade — aprovados na hora.

## Próximos passos sugeridos
- Pagamento (Pix/cartão) — hoje é marcado manualmente pelo admin (`PATCH /api/admin/enrollments/:id/payment`).
- Emissão real do PDF do certificado (hoje só marca `certificateIssued`/`medalIssued` no banco).
- Ajustar a progressão de intensidade em `backend/src/seed.js` (função `buildTasks`) — está com uma lógica
  simples de exemplo alternando caminhada/corrida-bike/vídeo/descanso.
