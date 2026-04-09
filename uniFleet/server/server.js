
const http = require('http');
const app = require('./src/app');
const { initSocket } = require('./src/sockets/socketHandler');
require('dotenv').config();

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ UniFleet server running on http://localhost:${PORT}`);
});
