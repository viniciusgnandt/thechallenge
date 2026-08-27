require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Challenge = require('./models/Challenge');
const Enrollment = require('./models/Enrollment');
const Post = require('./models/Post');

const CHECKIN_TEXTS = [
  'Mais um dia concluído, o corpo já agradece! 💪',
  'Difícil foi sair da cama, mas valeu a pena.',
  'Hoje o treino rendeu, sensação incrível.',
  'Suando a camisa e não parando por nada.',
  'Consistência é tudo. Bora pro próximo dia!',
  'Cansado mas feliz, missão do dia cumprida.',
  'Quem disse que ia ser fácil? Segui mesmo assim.',
];

const LEVEL_LABEL = { basico: 'Básico', intermediario: 'Intermediário', avancado: 'Avançado' };

function restTask(day, min) {
  return {
    day,
    title: `Dia ${day} - Descanso ativo / alongamento`,
    description: 'Grave um vídeo curto do seu alongamento e cole o link do YouTube.',
    activityType: 'video',
    validationType: 'video_link',
    restDay: true,
  };
}

function strengthTask(day, min) {
  return {
    day,
    title: `Dia ${day} - Treino de força`,
    description: `Suba um vídeo do treino (${min} min) e cole o link do YouTube.`,
    activityType: 'video',
    validationType: 'video_link',
    targetDurationMin: min,
  };
}

function walkTask(day, km) {
  return {
    day,
    title: `Dia ${day} - Caminhada`,
    description: `Caminhe pelo menos ${km} km. Validado automaticamente via Strava.`,
    activityType: 'caminhada',
    validationType: 'strava',
    targetDistanceKm: km,
  };
}

function runTask(day, km) {
  return {
    day,
    title: `Dia ${day} - Corrida`,
    description: `Corra pelo menos ${km} km. Validado automaticamente via Strava.`,
    activityType: 'corrida',
    validationType: 'strava',
    targetDistanceKm: km,
  };
}

function bikeTask(day, km) {
  return {
    day,
    title: `Dia ${day} - Bike`,
    description: `Pedale pelo menos ${km} km. Validado automaticamente via Strava.`,
    activityType: 'bike',
    validationType: 'strava',
    targetDistanceKm: km,
  };
}

// Gera as tarefas de um nível, com pesos configuráveis por tipo de desafio.
// weights: proporção de dias de cada tipo dentro de um ciclo de 7 dias.
function buildTasks(level, { durationDays, intensity, weights }) {
  const tasks = [];
  for (let day = 1; day <= durationDays; day++) {
    const cycle = day % 7;
    if (cycle === 0) {
      tasks.push(restTask(day));
    } else if (weights[cycle - 1] === 'forca') {
      tasks.push(strengthTask(day, intensity.min));
    } else if (weights[cycle - 1] === 'corrida') {
      tasks.push(runTask(day, intensity.run));
    } else if (weights[cycle - 1] === 'bike') {
      tasks.push(bikeTask(day, intensity.bike));
    } else {
      tasks.push(walkTask(day, intensity.walk));
    }
  }
  return tasks;
}

function levelsFor(durationDays, weights, intensityByLevel) {
  return ['basico', 'intermediario', 'avancado'].map((name) => ({
    name,
    label: LEVEL_LABEL[name],
    tasks: buildTasks(name, { durationDays, intensity: intensityByLevel[name], weights }),
  }));
}

const CHALLENGES = [
  {
    slug: 'desafio-100-dias',
    title: 'Desafio 100 Dias',
    description: 'Saia do sedentarismo e se supere em 100 dias de desafios progressivos e variados.',
    category: 'geral',
    icon: 'flame',
    durationDays: 100,
    weights: ['caminhada', 'corrida', 'forca', 'caminhada', 'corrida', 'forca'],
    intensity: {
      basico: { walk: 2, run: 1.5, bike: 5, min: 20 },
      intermediario: { walk: 4, run: 3, bike: 10, min: 35 },
      avancado: { walk: 6, run: 5, bike: 18, min: 50 },
    },
  },
  {
    slug: 'desafio-30-dias-cardio',
    title: 'Desafio 30 Dias de Cardio',
    description: 'Um mês para acelerar o coração: caminhada, corrida e treinos curtos de força.',
    category: 'cardio',
    icon: 'heart',
    durationDays: 30,
    weights: ['caminhada', 'caminhada', 'corrida', 'forca', 'caminhada', 'corrida'],
    intensity: {
      basico: { walk: 2, run: 1, bike: 4, min: 15 },
      intermediario: { walk: 3.5, run: 2.5, bike: 8, min: 25 },
      avancado: { walk: 5, run: 4, bike: 14, min: 40 },
    },
  },
  {
    slug: 'desafio-forca-total',
    title: 'Desafio Força Total',
    description: '45 dias focados em treino de força, com cardio leve para recuperação ativa.',
    category: 'forca',
    icon: 'barbell',
    durationDays: 45,
    weights: ['forca', 'caminhada', 'forca', 'forca', 'caminhada', 'forca'],
    intensity: {
      basico: { walk: 2, run: 1, bike: 4, min: 20 },
      intermediario: { walk: 3, run: 2, bike: 8, min: 35 },
      avancado: { walk: 4, run: 3, bike: 12, min: 55 },
    },
  },
  {
    slug: 'desafio-pedal-60-dias',
    title: 'Desafio Pedal 60 Dias',
    description: 'Dois meses na bike: evolua sua resistência com pedaladas progressivas.',
    category: 'bike',
    icon: 'bicycle',
    durationDays: 60,
    weights: ['bike', 'caminhada', 'bike', 'forca', 'bike', 'corrida'],
    intensity: {
      basico: { walk: 2, run: 1.5, bike: 6, min: 20 },
      intermediario: { walk: 3, run: 3, bike: 14, min: 30 },
      avancado: { walk: 4, run: 5, bike: 25, min: 45 },
    },
  },
];

const DEMO_USERS = [
  { name: 'Bianca Souza', city: 'São Paulo, SP', completedRatio: 0.92, level: 'avancado' },
  { name: 'Carlos Menezes', city: 'Rio de Janeiro, RJ', completedRatio: 0.81, level: 'avancado' },
  { name: 'Fernanda Lima', city: 'Belo Horizonte, MG', completedRatio: 0.74, level: 'intermediario' },
  { name: 'Ricardo Alves', city: 'Curitiba, PR', completedRatio: 0.68, level: 'intermediario' },
  { name: 'Juliana Costa', city: 'Porto Alegre, RS', completedRatio: 0.55, level: 'intermediario' },
  { name: 'Marcos Pereira', city: 'Salvador, BA', completedRatio: 0.47, level: 'basico' },
  { name: 'Patrícia Gomes', city: 'Fortaleza, CE', completedRatio: 0.33, level: 'basico' },
  { name: 'Thiago Rocha', city: 'Recife, PE', completedRatio: 0.21, level: 'basico' },
  { name: 'Vinicius Nandi', city: 'Florianópolis, SC', completedRatio: 0.15, level: 'basico' },
];

// Cria atletas fictícios já inscritos com progresso variado, só para popular o ranking na demo.
async function seedDemoUsers() {
  const challenges = await Challenge.find({ active: true });
  if (challenges.length === 0) return;

  for (const def of DEMO_USERS) {
    const email = `${def.name.toLowerCase().replace(/[^a-z]+/g, '.')}@demo.thechallenge.app`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: def.name,
        email,
        password: 'demo1234',
        city: def.city,
        role: 'athlete',
        subscription: { status: 'active', plan: 'avista', activatedAt: new Date() },
      });
    }

    for (const challenge of challenges) {
      const levelData = challenge.levels.find((l) => l.name === def.level);
      const totalDays = levelData?.tasks?.length || challenge.durationDays;
      const completedDays = Math.round(totalDays * def.completedRatio);
      const isCompleted = completedDays >= totalDays;

      const enrollment = await Enrollment.findOneAndUpdate(
        { user: user._id, challenge: challenge._id },
        {
          $setOnInsert: { user: user._id, challenge: challenge._id, level: def.level },
          $set: {
            completedDays,
            status: isCompleted ? 'completed' : 'active',
            completedAt: isCompleted ? new Date() : undefined,
            medalIssued: isCompleted,
            certificateIssued: isCompleted,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Gera os posts de checkin dos últimos dias (para popular o feed/timeline)
      const alreadyHasPosts = await Post.exists({ enrollment: enrollment._id, type: 'checkin' });
      if (!alreadyHasPosts && completedDays > 0) {
        const postsToCreate = Math.min(completedDays, 6);
        for (let i = 0; i < postsToCreate; i++) {
          const day = completedDays - i;
          const createdAt = new Date(Date.now() - i * 1000 * 60 * 60 * (6 + Math.random() * 10));
          await Post.create({
            user: user._id,
            challenge: challenge._id,
            enrollment: enrollment._id,
            day,
            type: 'checkin',
            text: `${CHECKIN_TEXTS[(day + i) % CHECKIN_TEXTS.length]} (Dia ${day} do ${challenge.title})`,
            createdAt,
            updatedAt: createdAt,
          });
        }
      }

      if (isCompleted) {
        const alreadyHasMedalPost = await Post.exists({ enrollment: enrollment._id, type: 'medal' });
        if (!alreadyHasMedalPost) {
          await Post.create({
            user: user._id,
            challenge: challenge._id,
            enrollment: enrollment._id,
            type: 'medal',
            text: `Concluiu o ${challenge.title} (nível ${def.level})! 🏅`,
          });
        }
      }
    }
  }
  console.log(`Ranking simulado com ${DEMO_USERS.length} atletas fictícios.`);
}

async function seed() {
  const adminEmail = 'admin@thechallenge.app';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: 'admin123',
      role: 'admin',
      subscription: { status: 'active', plan: 'avista', activatedAt: new Date() },
    });
    console.log(`Admin criado: ${adminEmail} / senha: admin123`);
  }

  for (const def of CHALLENGES) {
    const levels = levelsFor(def.durationDays, def.weights, def.intensity);
    const existing = await Challenge.findOne({ slug: def.slug });
    if (existing) {
      existing.levels = levels;
      existing.title = def.title;
      existing.description = def.description;
      existing.category = def.category;
      existing.icon = def.icon;
      existing.durationDays = def.durationDays;
      await existing.save();
      console.log('Desafio atualizado:', def.slug);
    } else {
      await Challenge.create({
        title: def.title,
        slug: def.slug,
        description: def.description,
        category: def.category,
        icon: def.icon,
        durationDays: def.durationDays,
        levels,
      });
      console.log('Desafio criado:', def.slug);
    }
  }

  await seedDemoUsers();

  console.log('Seed finalizado.');
}

module.exports = { seed, buildTasks };

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thechallenge')
    .then(() => seed())
    .then(() => mongoose.disconnect())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
