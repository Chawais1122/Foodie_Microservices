import { Resolver, Mutation, Query, Args, Context } from '@nestjs/graphql';
import { User } from './entities';
import { UsersService } from './users.service';
import { SignUpDto } from './dto';
import { RegisterResponse } from './types';
import { Response } from 'express';

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

  @Query(() => [User], { name: 'users' })
  findAll() {
    return this.userService.findAll();
  }
}
