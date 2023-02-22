import {
  Controller,
  Inject,
  CACHE_MANAGER,
  Body,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { Cache } from 'cache-manager';
import { v4 } from 'uuid';
import axios from 'axios'

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
      throw new UnauthorizedException('인증정보가 유효하지 않습니다.');
    }

    res.status(200).json({ status: 200, message: 'OK' });
  }

  @Post('/code')
  async checkCode(@Body() body: AuthBodyDto, @Res() res: Response) {
    const sessionId = this.uuid();

    if (body.code !== this.configService.get('ENTRY_CODE')) {
      throw new UnauthorizedException('인증정보가 유효하지 않습니다.');
    }

    await this.cacheManager.set(sessionId, 1);

    res.cookie('sessionId', sessionId, {
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.status(200).json({ status: 200, message: 'OK' });
  }

  @Post('/slack')
  async sendToSlack(@Body() body: string) {
    await axios.post(process.env.SLACK_WEB_HOOK_API, {
      text: body['text'],
      attachments: [
        {
            "fallback": "Image attachment",
            "image_url": "https://user-images.githubusercontent.com/74334399/220571577-7f772a9d-bc90-4a13-9abb-76625d1ab4c6.png",
            "color": "#36a64f",
            "title": "Latency 구간 별 정보",
            "text": "process"
        }
    ]
    });
  }
}

export default AuthController;
