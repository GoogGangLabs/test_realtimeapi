import { Body, Controller, Post } from "@nestjs/common";

import LatencyService from "@service/latency.service";
import LatencyRequestDto from "@domain/latency.request.dto";

@Controller('latency')
class LatencyController {
  constructor(private readonly latencyService: LatencyService) {}

  @Post('/slack')
  async sendToSlack(@Body() body: LatencyRequestDto) {
    await this.latencyService.sendSlack(body);
  }
}

export default LatencyController;