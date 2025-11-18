import type { PrismaClient, Cargo } from '@prisma/client';

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findUserByEmail(email: string) {
    return this.prisma.usuario.findUnique({ 
      where: { email } 
    });
  }

  async findUserById(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        cargo: true, 
        contaId: true 
      },
    });
  }

  async createAccount(nome: string) {
    return this.prisma.conta.create({ 
      data: { nome } 
    });
  }

  async createUser(data: {
    nome: string;
    email: string;
    senhaHash: string;
    cargo: Cargo;
    contaId: string;
  }) {
    return this.prisma.usuario.create({
      data,
      select: { 
        id: true, 
        nome: true, 
        email: true, 
        cargo: true, 
        contaId: true 
      },
    });
  }
}
