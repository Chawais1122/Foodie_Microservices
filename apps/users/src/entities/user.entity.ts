import { Field, ObjectType } from '@nestjs/graphql';
import { Avatar } from './avatar.entity';

@ObjectType()
export class User {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  password: string;

  @Field()
  phone_number: number;

  @Field(() => Avatar, { nullable: true })
  avatar?: Avatar | null;

  @Field()
  created_at: Date;

  @Field()
  updated_at: Date;
}
