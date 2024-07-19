import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, SignUpDto } from './dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { ERROR_MESSAGES } from './common/constants/error-messages';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { Role } from '@prisma/client';
import { EmailService } from './email/email.service';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone_number: number;
  role: Role;
}

@Injectable()
export class UsersService {
  constructor(
    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async signUp(signUpDto: SignUpDto, response: Response) {
    try {
      const { email, password, name, phone_number } = signUpDto;

      const user = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (user) {
        throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXIST);
      }

      const hashedPassword = await bcrypt.hash(
        password,
        parseInt(this.configService.get('SALT_ROUNDS')),
      );

      const createdUser = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          phone_number,
        },
      });

      const data = {
        id: createdUser.id,
        name,
        email,
        phone_number,
        role: createdUser.role,
      };

      const { token, activationCode } = await this.signToken(data);

      await this.emailService.sendEmail(
        createdUser,
        'Confirmation Email',
        activationCode,
      );

      return { token, response };
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ForbiddenException('Credentials taken');
      }
      if (error.code === 11000) {
        throw new ConflictException('Email is already in use');
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    return loginDto;
  }

  async signToken(payload: UserData) {
    const activationCode = Math.floor(100000 + Math.random() * 900000);
    const token = await this.jwtService.sign(payload);

    return { token, activationCode };
  }

  async findAll() {
    return this.prisma.user.findMany({});
  }
}
