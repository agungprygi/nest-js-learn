import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { SignUpInput } from './dto/sign-up.input';
import { UpdateAuthInput } from './dto/update-auth.input';
import { SignInInput } from './dto/sign_in_input';
import { SignResponse } from './dto/sign-response';
import { LogoutResponse } from './dto/logout_response';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current_user.decorator';
import { CurrentUserId } from './decorators/current_user_id.decorator';
import { NewTokenResponse } from './dto/new_token_response';
import { RefreshAccessTokenGuard } from './guards/refreshAccessToken.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => SignResponse)
  async signup(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.authService.signup(signUpInput);
  }

  @Query(() => [Auth], { name: 'auth' })
  async findAll() {
    return this.authService.findAll();
  }

  @Public()
  @Mutation(() => SignResponse)
  async signIn(@Args('signInInput') signInInput: SignInInput) {
    return this.authService.signIn(signInInput);
  }

  @Mutation(() => Auth)
  async updateAuth(@Args('updateAuthInput') updateAuthInput: UpdateAuthInput) {
    return this.authService.update(updateAuthInput.id, updateAuthInput);
  }

  @Mutation(() => Auth)
  async removeAuth(@Args('id', { type: () => Int }) id: number) {
    return this.authService.remove(id);
  }

  @Mutation(() => LogoutResponse)
  async logout(@Args('userId', { type: () => Int }) userId: number) {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RefreshAccessTokenGuard)
  @Mutation(() => NewTokenResponse)
  async getNewTokens(
    @CurrentUserId() userId: number,
    @CurrentUser('refreshToken') refreshToken: string,
  ) {
    return this.authService.getNewTokens(userId, refreshToken);
  }
}
