const { Expo } = require('expo-server-sdk');

const expo = new Expo();

// Envia uma push notification para um usuário, se ele tiver um token salvo.
// Funciona com o Expo Go em desenvolvimento sem precisar de build/EAS.
async function sendPush(user, { title, body, data }) {
  if (!user?.pushToken || !Expo.isExpoPushToken(user.pushToken)) return;
  try {
    await expo.sendPushNotificationsAsync([{ to: user.pushToken, sound: 'default', title, body, data }]);
  } catch (err) {
    console.error('Erro ao enviar push:', err.message);
  }
}

module.exports = { sendPush };
