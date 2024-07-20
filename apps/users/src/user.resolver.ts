import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { ActivateUserDto, LoginDto, SignUpDto } from './dto';
import {
  ActivationResponse,
  LoginResponse,
  LogoutResposne,
  RegisterResponse,
} from './types';
import { Response } from 'express';
import { AuthGuard } from './guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { User } from './entities';

@Resolver('User')
export class UserResolver {
  constructor(private readonly userService: UsersService) {}

  @Mutation(() => RegisterResponse)
  signUp(
    @Args('signUpInput') signUpDto: SignUpDto,
    @Context() context: { res: Response },
  ) {
    return this.userService.signUp(signUpDto, context.res);
  }

  @Mutation(() => ActivationResponse)
  async activateUser(
    @Args('activationDto') activationDto: ActivateUserDto,
    @Context() context: { res: Response },
  ): Promise<ActivationResponse> {
    return await this.userService.activateUser(activationDto, context.res);
  }

  @Mutation(() => LoginResponse)
  async login(@Args('loginDto') loginDto: LoginDto): Promise<LoginResponse> {
    return await this.userService.login(loginDto);
  }

  @Query(() => LogoutResposne)
  @UseGuards(AuthGuard)
  async logOutUser(@Context() context: { req: Request }) {
    return this.userService.Logout(context.req);
  }

  @Query(() => LoginResponse)
  @UseGuards(AuthGuard)
  async getLoggedInUser(@Context() context: { req: Request }) {
    return await this.userService.getLoggedInUser(context.req);
  }

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.userService.findAll();
  }
}
