import { Injectable } from "@nestjs/common";
import axios from 'axios';

import LatencyRequestDto from "@domain/latency.request.dto";
import SlackBuilder from "@strategy/slack.builder";
import CalculateLatency, { StreamOperationResult, OperationResult } from "@strategy/calculate.latency";
import TimeFormatter from "@strategy/time.formatter";

@Injectable()
class LatencyService {

  makeLine(operationResult: OperationResult, flag: string, padSize = 7) {
    const pad = (num: number | string, flag: string) => `${num}${flag}`.padStart(padSize, ' ');
    return (
      `평균: ${pad(operationResult.avg, flag)}, ` +
      `최소: ${pad(operationResult.min, flag)}, ` +
      `최대: ${pad(operationResult.max, flag)}\n`
      );
  }


  textFormat(operationResult: StreamOperationResult): string {
    return (
      '```' +
      `Total Data Size - ${this.makeLine(operationResult.totalDataSize, 'kb', 8)}` +
      `Total Latency   - ${this.makeLine(operationResult.totalLatency, 'ms', 8)}` +
      `Total FPS       - ${this.makeLine(operationResult.fps, 'fps', 8)}` +
      '\nLatency\n' +
      `1️⃣ - ${this.makeLine(operationResult.latency.input, 'ms')}` +
      `2️⃣ - ${this.makeLine(operationResult.latency.grpc, 'ms')}` +
      `3️⃣ - ${this.makeLine(operationResult.latency.inference, 'ms')}` +
      `4️⃣ - ${this.makeLine(operationResult.latency.output, 'ms')}` +
      `5️⃣ - ${this.makeLine(operationResult.latency.client, 'ms')}` +
      '\nData Size\n' +
      `Input  - ${this.makeLine(operationResult.dataSize.input, 'kb')}` +
      `Output - ${this.makeLine(operationResult.dataSize.output, 'kb')}` +
      '```'
    );
  }

  async sendSlack(latencyRequestDto: LatencyRequestDto) {
    const streamOperationResult = CalculateLatency.fromRequest(latencyRequestDto);
    const slackBuilder = new SlackBuilder({})
      .addBlock('header', { type: 'plain_text', text: 'E2E 테스트 로그', emoji: true })
      .addBlock('section', { type: 'mrkdwn', text: this.textFormat(streamOperationResult) })
      .addField('시작 시간', `${TimeFormatter.getTime(latencyRequestDto.startedAt)}`, false)
      .addField('총 테스트 시간', `${(latencyRequestDto.totalLatency / 1000).toFixed(2)}초`)
      .addField('설정된 FPS', `${latencyRequestDto.fixedFps}fps`);

    await axios.post(process.env.SLACK_WEB_HOOK_API, slackBuilder.toJSON());
  }
}

export default LatencyService;