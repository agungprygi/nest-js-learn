import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { DatabaseService } from './database/database.service';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard } from './modules/auth/guards/accessToken.guard';
@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [],
  providers: [DatabaseService, { provide: APP_GUARD, useClass: AccessTokenGuard }],
})
export class AppModule {}
