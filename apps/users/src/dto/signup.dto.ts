import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
} from 'class-validator';
import { ERROR_MESSAGES } from '../common/constants/error-messages';

@InputType()
export class SignUpDto {
  @Field()
  @IsNotEmpty({ message: `Name ${ERROR_MESSAGES.NOT_EMPTY}` })
  @IsString({ message: `Name ${ERROR_MESSAGES.MUST_STRING}` })
  name: string;

  @Field()
  @IsEmail({}, { message: ERROR_MESSAGES.EMAIL_INVALID_FORMAT })
  @IsNotEmpty({ message: `Email ${ERROR_MESSAGES.NOT_EMPTY}` })
  email: string;

  @Field()
  @IsNumber({}, { message: `Phone Number ${ERROR_MESSAGES.MUST_NUMBER}` })
  @IsNotEmpty({ message: `Number ${ERROR_MESSAGES.NOT_EMPTY}` })
  phone_number: number;

  @Field()
  @IsNotEmpty({ message: `Password ${ERROR_MESSAGES.NOT_EMPTY}` })
  @IsString({ message: `Password ${ERROR_MESSAGES.MUST_STRING}` })
  @Matches(
    /^(?=[A-Za-z0-9@#$%^&*()+!={}~`_\[\]\'\\/:;,.<>?~"|\-\[\]]+$)(?=.*[a-z])(?=.*[0-9])(?=.*[@#$%^&*()+!={}~`_\[\]\'\\/:;,.<>?~"|\-\[\]]).{8,}$/,
    {
      message: ERROR_MESSAGES.PASSWORD_INVALID_FORMAT,
    },
  )
  password: string;
}
