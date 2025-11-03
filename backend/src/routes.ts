import type { FastifyInstance } from 'fastify';
import { registerAuthRoutes } from './modules/auth/routes.js';
import { registerFazendaRoutes } from './modules/fazendas/routes.js';
import { registerAnimalRoutes } from './modules/animais/routes.js';
import { registerPesagemRoutes } from './modules/pesagens/routes.js';
import { registerLoteRoutes } from './modules/lotes/routes.js';
import { registerMetricsRoutes } from './modules/metrics/routes.js';

export async function registerAllRoutes(app: FastifyInstance) {
  await app.register(registerAuthRoutes, { prefix: '/api/v1/auth' });
  await app.register(registerFazendaRoutes, { prefix: '/api/v1' });
  await app.register(registerAnimalRoutes, { prefix: '/api/v1' });
  await app.register(registerPesagemRoutes, { prefix: '/api/v1' });
  await app.register(registerLoteRoutes, { prefix: '/api/v1' });
  await app.register(registerMetricsRoutes, { prefix: '/api/v1' });
}


