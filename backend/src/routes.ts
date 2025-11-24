import type { FastifyInstance } from 'fastify';
import { authRoutes } from './modules/auth/auth.routes.js';
import { fazendaRoutes } from './modules/fazendas/fazenda.routes.js';
import { animalRoutes } from './modules/animais/animal.routes.js';
import { pesagemRoutes } from './modules/pesagens/pesagem.routes.js';
import { loteRoutes } from './modules/lotes/lote.routes.js';
import { metricsRoutes } from './modules/metrics/metrics.routes.js';
import { paisRoutes } from './modules/pais/pais.routes.js';

import { despesaRoutes } from './modules/financeiro/routes.js';

export async function registerAllRoutes(app: FastifyInstance) {
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(fazendaRoutes, { prefix: '/api/v1' });
  await app.register(animalRoutes, { prefix: '/api/v1' });
  await app.register(pesagemRoutes, { prefix: '/api/v1' });
  await app.register(loteRoutes, { prefix: '/api/v1' });
  await app.register(metricsRoutes, { prefix: '/api/v1' });
  await app.register(paisRoutes, { prefix: '/api/v1' });
  await app.register(despesaRoutes, { prefix: '/api/v1/despesas' });
}



