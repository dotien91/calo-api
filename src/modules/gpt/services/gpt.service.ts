import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class GptService {
  chatGPTKey = process.env.CHAT_GPT_KEY;
  chatGPTUrl = process.env.CHAT_GPT_URL;

  constructor() {}

  async isValidCommunity(content: string) {
    const data = JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Bạn kiểm tra giúp mình xem nội dung dưới đây có vi phạm qui tắc cộng đồng không? Tiêu chuẩn cộng đồng là tiêu chuẩn chung mà các mạng xã hội đã xây dựng như Facebook hoặc Reddit. Bạn có thể tham khảo thêm về tiêu chuẩn cộng đồng. Sau đây là nội dung: "${content}" Vui lòng hãy chỉ trả lời "Có" hoặc "Không". Kết quả trả về không được thêm bất kì ký tự hoặc câu nào khác hãy tập trung trả lời đúng hai kết quả là "Có" hoặc "Không"`,
        },
      ],
    });

    const config = {
      method: "post",
      url: this.chatGPTUrl,
      headers: {
        Authorization: `Bearer ${this.chatGPTKey}`,
        "Content-Type": "application/json",
      },
      data: data,
    };

    const dataReturn = await axios(config)
      .then(function (response) {
        return response?.data;
      })
      .catch(function (error) {
        return null;
      });

    if (dataReturn) return dataReturn?.choices[0]?.message?.content === "Không";
    return true;
  }
}
