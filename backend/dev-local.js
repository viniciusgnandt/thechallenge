// Script temporário SOMENTE para testar localmente neste sandbox, onde a porta do
// MongoDB Atlas está bloqueada. Sobe um MongoDB em memória e inicia o servidor nele.
// Não usar em produção — apague este arquivo quando terminar de testar aqui.
require('dotenv').config();
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { seed } = require('./src/seed');

async function run() {
  const mongod = await MongoMemoryServer.create({ instance: { dbName: 'theChallenge' } });
  process.env.MONGODB_URI = mongod.getUri();
  console.log('Mongo em memória rodando em', process.env.MONGODB_URI);

  await mongoose.connect(process.env.MONGODB_URI);
  await seed();
  await mongoose.disconnect();

  require('./src/server.js');
}

run();
