import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from '@nestjs/jwt';
import { ERROR_MESSAGES } from '../common/constants/error-messages';
import { PrismaService } from '../../../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const { req } = gqlContext.getContext();

    const accessToken = req.headers.accesstoken as string;
    const refreshToken = req.headers.refreshtoken as string;

    if (!accessToken || !refreshToken) {
      throw new UnauthorizedException(ERROR_MESSAGES.ACCESS_DENIED);
    }

    if (accessToken) {
      const decoded = this.jwtService.decode(accessToken);

      const expirationTime = decoded?.exp * 1000;

      if (expirationTime < Date.now()) {
        await this.updateAccessToken(req);
      }
    }

    return true;
  }

  private async updateAccessToken(req: any): Promise<void> {
    try {
      const refreshTokenData = req.headers.refreshtoken as string;

      const decoded = this.jwtService.decode(refreshTokenData);

      const expirationTime = decoded.exp * 1000;

      if (expirationTime < Date.now()) {
        throw new UnauthorizedException(ERROR_MESSAGES.ACCESS_DENIED);
      }

      const user = await this.prisma.user.findUnique({
        where: {
          id: decoded.id,
        },
      });

      const accessToken = this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRE_IN'),
        },
      );

      const refreshToken = this.jwtService.sign(
        {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        {
          secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
          expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRE_IN'),
        },
      );

      req.accesstoken = accessToken;
      req.refreshtoken = refreshToken;
      req.user = user;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
