import bcrypt from 'bcryptjs';
import type { AuthRepository } from '../repositories/auth.repository';
import type { RegisterDto } from '../dtos/register.dto';
import type { LoginDto } from '../dtos/login.dto';

export class AuthService {
  constructor(private authRepository: AuthRepository) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.authRepository.findUserByEmail(dto.email);
    
    if (existingUser) {
      throw {
        statusCode: 409,
        code: 'CONFLICT',
        message: 'Email já cadastrado',
      };
    }

    const accountName = dto.contaNome || `${dto.nome} - Conta`;
    const account = await this.authRepository.createAccount(accountName);

    const hashedPassword = await bcrypt.hash(dto.senha, 10);

    const user = await this.authRepository.createUser({
      nome: dto.nome,
      email: dto.email,
      senhaHash: hashedPassword,
      cargo: 'ADMIN',
      contaId: account.id,
    });

    return { user };
  }

  async login(dto: LoginDto) {
    const user = await this.authRepository.findUserByEmail(dto.email);

    if (!user) {
      throw {
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Credenciais inválidas',
      };
    }

    const isPasswordValid = await bcrypt.compare(dto.senha, user.senhaHash);

    if (!isPasswordValid) {
      throw {
        statusCode: 401,
        code: 'UNAUTHORIZED',
        message: 'Credenciais inválidas',
      };
    }

    return {
      userId: user.id,
      contaId: user.contaId,
      cargo: user.cargo,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        contaId: user.contaId,
      },
    };
  }

  async getUserProfile(userId: string) {
    const user = await this.authRepository.findUserById(userId);

    if (!user) {
      throw {
        statusCode: 404,
        code: 'NOT_FOUND',
        message: 'Usuário não encontrado',
      };
    }

    return { user };
  }
}
