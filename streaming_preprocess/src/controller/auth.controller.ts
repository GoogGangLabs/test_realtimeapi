import {
  Controller,
  Inject,
  CACHE_MANAGER,
  Body,
  Get,
  Post,
  Req,
  Res,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Cache } from 'cache-manager';
import { v4 } from 'uuid';

import AuthBodyDto from '@domain/auth.body.dto';

@Controller('/auth')
class AuthController {
  constructor(
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {}

  private uuid = () => {
    const tokens = v4().split('-');
    return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
  };

  @Get('/code')
  async checkSessionId(@Req() req: Request, @Res() res: Response) {
    const sessionId = req.cookies['sessionId'];
    const sessionValue = await this.cacheManager.get(sessionId);

    if (!sessionId || !sessionValue) {
      throw new UnauthorizedException();
    }

    res.status(200).json({ status: 200, message: 'OK' });
  }

  @Post('/code')
  async checkCode(@Body() body: AuthBodyDto, @Res() res: Response) {
    const sessionId = this.uuid();

    if (body.code !== this.configService.get('ENTRY_CODE')) {
      throw new ForbiddenException('인증정보가 유효하지 않습니다.');
    }

    await this.cacheManager.set(sessionId, 1);

    res.cookie('sessionId', sessionId, {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.status(200).json({ status: 200, message: 'OK' });
  }
}

export default AuthController;
