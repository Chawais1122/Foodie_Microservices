import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtVerifyOptions, TokenExpiredError } from '@nestjs/jwt';
import { ActivateUserDto, LoginDto, SignUpDto } from './dto';
import { PrismaService } from '../../../prisma/prisma.service';
import { ERROR_MESSAGES } from './common/constants/error-messages';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { EmailService } from './email/email.service';
import { TokenSender } from './common/utils/tokenSender';

interface UserData {
  name: string;
  email: string;
  phone_number: number;
  password: string;
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

      const existUser = await this.prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (existUser) {
        throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXIST);
      }

      const hashedPassword = await bcrypt.hash(
        password,
        parseInt(this.configService.get('SALT_ROUNDS')),
      );

      const user = {
        name,
        email,
        phone_number,
        password: hashedPassword,
      };

      const { token, activationCode } = await this.signToken(user);

      await this.emailService.sendEmail(
        user,
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

  async activateUser(activationUser: ActivateUserDto, response: Response) {
    try {
      const { activationToken, activationCode } = activationUser;

      const newUser: { user: UserData; activationCode: string } =
        this.jwtService.verify(activationToken, {
          secret: this.configService.get<string>('JWT_ACTIVATION_TOKEN_SECRET'),
        } as JwtVerifyOptions) as { user: UserData; activationCode: string };

      if (newUser.activationCode !== activationCode) {
        throw new BadRequestException(ERROR_MESSAGES.INVALID_ACTIVATION_CODE);
      }

      const { name, email, password, phone_number } = newUser.user;

      const existUser = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existUser) {
        throw new ConflictException(ERROR_MESSAGES.USER_ALREADY_EXIST);
      }

      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password,
          phone_number,
        },
      });

      return { user, response };
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(ERROR_MESSAGES.TOKEN_EXPIRED);
      }
      throw error;
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const { email, password } = loginDto;

      const user = await this.prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (user && (await this.comparePassword(password, user.password))) {
        const tokenSender = new TokenSender(
          this.configService,
          this.jwtService,
        );
        return tokenSender.sendToken(user);
      } else {
        throw new ForbiddenException(ERROR_MESSAGES.INVALID_CREDENTIALS);
      }
    } catch (error) {
      throw error;
    }
  }

  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async signToken(user: UserData) {
    const activationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    const token = await this.jwtService.sign(
      {
        user,
        activationCode,
      },
      {
        secret: this.configService.get<string>('JWT_ACTIVATION_TOKEN_SECRET'),
        expiresIn: this.configService.get('JWT_ACTIVATION_TOKEN_EXPIRE_IN'),
      },
    );

    return { token, activationCode };
  }

  async Logout(req: any) {
    req.user = null;
    req.refreshtoken = null;
    req.accesstoken = null;
    return { message: ERROR_MESSAGES.LOGOUT };
  }

  async getLoggedInUser(req: any) {
    const user = req.user;
    const refreshToken = req.refreshtoken;
    const accessToken = req.accesstoken;
    return { user, refreshToken, accessToken };
  }

  async findAll() {
    return this.prisma.user.findMany({});
  }
}
