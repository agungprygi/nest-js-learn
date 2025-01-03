import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NewTokenResponse {
  @Field(() => String)
  accessToken: string;
  @Field(() => String)
  refreshToken: string;
}
