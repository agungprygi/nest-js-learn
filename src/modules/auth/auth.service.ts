import { Injectable } from '@nestjs/common';
import { SignUpInput } from './dto/sign-up.input';
import { SignInInput } from './dto/sign_in_input';
import { UpdateAuthInput } from './dto/update-auth.input';
import { DatabaseService } from '../../database/database.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signup(createAuthInput: SignUpInput) {
    const hashedPassword = await argon.hash(createAuthInput.password);
    const user = await this.databaseService.user.create({
      data: {
        username: createAuthInput.username,
        email: createAuthInput.email,
        hashedPassword,
      },
    });
    const accessToken = await this.createAccessToken(user.id, user.email);
    const refreshToken = await this.createRefreshToken(user.id, user.email, accessToken);
    await this.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, user };
  }

  async findAll() {
    return `This action returns all auth`;
  }

  async signIn(signInInput: SignInInput) {
    const user = await this.databaseService.user.findUnique({
      where: { email: signInInput.email },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const isPasswordValid = await argon.verify(user.hashedPassword, signInInput.password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }
    const accessToken = await this.createAccessToken(user.id, user.email);
    const refreshToken = await this.createRefreshToken(user.id, user.email, accessToken);
    await this.updateRefreshToken(user.id, refreshToken);
    return { accessToken, refreshToken, user };
  }

  async update(id: number, updateAuthInput: UpdateAuthInput) {
    return `This action updates a #${id} auth`;
  }

  async remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  async logout(userId: number) {
    await this.databaseService.user.updateMany({
      where: { 
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: { hashedRefreshToken: null },
    });
    return { loggedOut: true };
  }

  async createAccessToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: '1h',
    });
  }

  async createRefreshToken(userId: number, email: string, accessToken: string) {
    const payload = { sub: userId, email, accessToken };
    return this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hashedRefreshToken = await argon.hash(refreshToken);
    await this.databaseService.user.update({
      where: { id: userId },
      data: { hashedRefreshToken: hashedRefreshToken },
    });
  }

  async getNewTokens(userId: number, refreshToken: string) {
    const user = await this.databaseService.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User not found');
    }
    const isRefreshTokenValid = await argon.verify(user.hashedRefreshToken, refreshToken);
    if (!isRefreshTokenValid) {
      throw new Error('Invalid refresh token');
    }
    const accessToken = await this.createAccessToken(user.id, user.email);
    const newRefreshToken = await this.createRefreshToken(
      user.id,
      user.email,
      accessToken,
    );
    await this.updateRefreshToken(user.id, newRefreshToken);
    return { accessToken, refreshToken: newRefreshToken, user };
  }
}
