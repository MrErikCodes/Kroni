import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { TodayTaskSchema } from '@kroni/shared';
import { ensureTodayCompletions, listTodayTasks } from '../../services/tasks.service.js';
import { UnauthorizedError } from '../../lib/errors.js';

export async function kidTodayRoutes(app: FastifyInstance): Promise<void> {
  const r = app.withTypeProvider<ZodTypeProvider>();
  r.get(
    '/api/kid/today',
    { preHandler: app.requireKid, schema: { response: { 200: z.array(TodayTaskSchema) } } },
    async (req) => {
      const kid = req.kid;
      if (!kid) throw new UnauthorizedError('kid missing');
      await ensureTodayCompletions(kid.id, kid.householdId);
      const list = await listTodayTasks(kid.id);
      return list as never;
    },
  );
}
