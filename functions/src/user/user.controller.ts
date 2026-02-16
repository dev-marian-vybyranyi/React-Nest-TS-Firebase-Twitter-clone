import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { RequestWithUser } from '../types/auth';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @UseGuards(FirebaseAuthGuard)
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  @UseGuards(FirebaseAuthGuard)
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.uid !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.userService.updateUser(id, updateUserDto);
  }
}
