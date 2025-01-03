import { InputType, Int, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';
@InputType()
export class SignUpInput {
    @IsNotEmpty()
    @IsString()
    @Field()
    username: string;

    @IsNotEmpty()
    @IsEmail()
    @Field()
    email: string;

    @IsNotEmpty()
    @IsString()
    @Field()
    password: string;
}
