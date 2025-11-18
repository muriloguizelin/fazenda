import type { FastifyRequest, FastifyReply } from 'fastify';
import type { JwtPayload } from '../types/jwt-payload.type';

export async function authMiddleware(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const authorization = req.headers.authorization;
  
  if (!authorization) {
    return reply.code(401).send({ 
      error: { 
        code: 'UNAUTHORIZED', 
        message: 'Token ausente' 
      } 
    });
  }

  const token = authorization.replace('Bearer ', '');
  
  try {
    const decoded = req.server.jwt.verify(token) as JwtPayload;
    req.user = decoded;
  } catch {
    return reply.code(401).send({ 
      error: { 
        code: 'UNAUTHORIZED', 
        message: 'Token inválido' 
      } 
    });
  }
}

export function requireRole(...allowedRoles: string[]) {
  return async (req: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!req.user) {
      return reply.code(401).send({ 
        error: { 
          code: 'UNAUTHORIZED', 
          message: 'Autenticação necessária' 
        } 
      });
    }

    if (!allowedRoles.includes(req.user.cargo)) {
      return reply.code(403).send({ 
        error: { 
          code: 'FORBIDDEN', 
          message: 'Sem permissão para esta operação' 
        } 
      });
    }
  };
}


