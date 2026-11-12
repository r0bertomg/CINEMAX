const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults({ static: 'public' });
const porta = 3000;

server.use(middlewares);
server.use(router);

server.listen(porta, () => {
    console.log(`Servidor rodando em http://localhost:${porta}`);
});
