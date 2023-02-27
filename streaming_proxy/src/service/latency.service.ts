import { Injectable } from "@nestjs/common";
import axios from 'axios';

import LatencyRequestDto from "@domain/latency.request.dto";
import SlackBuilder from "@strategy/slack.builder";
import CalculateLatency, { StreamOperationResult, OperationResult } from "@strategy/calculate.latency";
import TimeFormatter from "@strategy/time.formatter";

@Injectable()
class LatencyService {

  makeLine(operationResult: OperationResult, flag = 'ms') {
    const pad = (num: number | string) => `${num}`.padStart(6, ' ');
    return (
      `평균: ${pad(operationResult.avg)}${flag}, ` +
      `최소: ${pad(operationResult.min)}${flag}, ` +
      `최대: ${pad(operationResult.max)}${flag}\n`
      );
  }


  textFormat(operationResult: StreamOperationResult): string {
    return (
      '```' +
      `Total Latency   - ${this.makeLine(operationResult.totalLatency)}` +
      `Total Data Size - ${this.makeLine(operationResult.totalLatency)}` +
      `FPS             - ${this.makeLine(operationResult.fps)}` +
      '\n\nLatency\n' +
      `1️⃣ - ${this.makeLine(operationResult.latency.input)}` +
      `2️⃣ - ${this.makeLine(operationResult.latency.grpc)}` +
      `3️⃣ - ${this.makeLine(operationResult.latency.inference)}` +
      `4️⃣ - ${this.makeLine(operationResult.latency.output)}` +
      `5️⃣ - ${this.makeLine(operationResult.latency.client)}` +
      '\n\nData Size\n' +
      `Input  - ${this.makeLine(operationResult.dataSize.input)}` +
      `Output - ${this.makeLine(operationResult.dataSize.output)}` +
      '```'
    );
  }

  async sendSlack(latencyRequestDto: LatencyRequestDto) {
    const streamOperationResult = CalculateLatency.fromRequest(latencyRequestDto);
    const slackBuilder = new SlackBuilder({})
      .addBlock('header', { type: 'plain_text', text: 'E2E 테스트 로그', emoji: true })
      .addBlock('section', { type: 'mrkdwn', text: this.textFormat(streamOperationResult) })
      .addField('시작 시간', `${TimeFormatter.getTime(latencyRequestDto.startedAt)}`, false)
      .addField('총 테스트 시간', `${latencyRequestDto.totalLatency}ms`)
      .addField('설정된 FPS', `${latencyRequestDto.fixedFps}fps`);

    await axios.post(process.env.SLACK_WEB_HOOK_API, slackBuilder.toJSON());
  }
}

export default LatencyService;