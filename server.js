import { SimpleServer } from '@zooduck/simple-server';

const server = new SimpleServer({ staticPath: 'docs' });

server.start();
