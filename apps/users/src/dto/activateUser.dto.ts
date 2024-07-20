import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { ERROR_MESSAGES } from '../common/constants/error-messages';

@InputType()
export class ActivateUserDto {
  @Field()
  @IsNotEmpty({ message: `Activation token ${ERROR_MESSAGES.NOT_EMPTY}` })
  @IsString({ message: `Activation token ${ERROR_MESSAGES.MUST_STRING}` })
  activationToken: string;

  @Field()
  @IsNotEmpty({ message: `Activation code ${ERROR_MESSAGES.NOT_EMPTY}` })
  @IsString({ message: `Activation code ${ERROR_MESSAGES.MUST_STRING}` })
  activationCode: string;
}
