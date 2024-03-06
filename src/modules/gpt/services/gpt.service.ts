import { Injectable } from "@nestjs/common";
import { HttpClientService } from "../../../base/http-client/http.base";
import { SpeakingResult, WritingResult } from "../../../modules/test/interfaces/test.interface.i";

@Injectable()
export class GptService {
  chatGPTKey = process.env.CHAT_GPT_KEY;
  chatGPTUrl = process.env.CHAT_GPT_URL;

  constructor(private httpService: HttpClientService) {}

  async isValidCommunity(content: string) {
    const body = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Bạn kiểm tra giúp mình xem nội dung dưới đây có vi phạm qui tắc cộng đồng không? Tiêu chuẩn cộng đồng là tiêu chuẩn chung mà các mạng xã hội đã xây dựng như Facebook hoặc Reddit. Bạn có thể tham khảo thêm về tiêu chuẩn cộng đồng. Sau đây là nội dung: "${content}" Vui lòng hãy chỉ trả lời "Có" hoặc "Không". Kết quả trả về không được thêm bất kì ký tự hoặc câu nào khác hãy tập trung trả lời đúng hai kết quả là "Có" hoặc "Không"`,
        },
      ],
    });

    const headers = {
      Authorization: `Bearer ${this.chatGPTKey}`,
      "Content-Type": "application/json",
    };

    const dataReturn = await this.httpService
      .post$(this.chatGPTUrl, body, headers)
      .then(function (response) {
        return response?.data;
      })
      .catch(function (error) {
        return null;
      });

    if (dataReturn) return dataReturn?.choices[0]?.message?.content === "Không";
    return true;
  }

  async getWritingBandScore(topic: string, essay: string): Promise<WritingResult> {
    const body = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `
          You're examiner of IELTS Writing Contest, please review my essay below
          The topic: ${topic}
          My essay: ${essay}
          Please return your review in json stringify of json below
          {
            task_response: number
            coherence_and_cohesion: number
            lexical_resource: number
            grammatical_range_and_accuracy: number
          }
          `,
        },
      ],
    });

    const headers = {
      Authorization: `Bearer ${this.chatGPTKey}`,
      "Content-Type": "application/json",
    };

    const dataReturn = await this.httpService
      .post$(this.chatGPTUrl, body, headers)
      .then(function (response) {
        return response?.data;
      })
      .catch(function (error) {
        return null;
      });

    if (dataReturn) return JSON.parse(dataReturn?.choices[0]?.message?.content);
    return null;
  }

  async getSpeakingLexialResourceAndGrammaticalRangeCriteria(topic: string, essay: string): Promise<SpeakingResult> {
    const body = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `
          You're examiner of IELTS Speaking Contest, please review my essay below
          The topic: ${topic}
          My speech: ${essay}
          Please return your review in json stringify of json below
          {
            fluency_and_coherence: 0 (const)
            lexical_resource: number
            grammatical_range_and_accuracy: number
            pronunciation: 0 (const)
          }
          `,
        },
      ],
    });

    const headers = {
      Authorization: `Bearer ${this.chatGPTKey}`,
      "Content-Type": "application/json",
    };

    const dataReturn = await this.httpService
      .post$(this.chatGPTUrl, body, headers)
      .then(function (response) {
        return response?.data;
      })
      .catch(function (error) {
        return null;
      });

    if (dataReturn) return JSON.parse(dataReturn?.choices[0]?.message?.content);
    return null;
  }
}
