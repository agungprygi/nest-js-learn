import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class User {
    @Field()
    id: number;

    @Field()
    username: string;

    @Field()
    email: string;

    @Field()
    hashedPassword: string;

    @Field()
    hashedRefreshToken: string;

    @Field()
    createdAt: Date;

    @Field()
    updatedAt: Date;
}
