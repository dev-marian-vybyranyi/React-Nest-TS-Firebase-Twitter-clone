import { Body, Controller, Post, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { SignInDto } from './dto/signIn.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: {
    uid: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.signup(createAuthDto);
  }

  @Post('google')
  googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return this.authService.googleLogin(googleLoginDto);
  }

  @Post('signin')
  signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Post('forgot-password')
  forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @UseGuards(AuthGuard)
  @Delete('delete')
  deleteAccount(@Req() req: RequestWithUser) {
    return this.authService.deleteUser(req.user.uid);
  }
}
