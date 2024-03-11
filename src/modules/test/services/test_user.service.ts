import { SpeechClient } from "@google-cloud/speech";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import axios from "axios";
import { Model } from "mongoose";
import { BotService } from "../../../modules/bot/services/bot.service";
import { GptService } from "../../../modules/gpt/services/gpt.service";
import { FilterTestUserDTO, UpdateTestUserDTO, UserAnswer } from "../dtos/test_user.dto";
import {
  Junbro1016ResponseData,
  SpeakingResult,
  TestQuestionPart,
  TestStatus,
  TestType,
  WritingResult,
} from "../interfaces/test.interface.i";
import { TestQuestion } from "../schemas/test_question.schema";
import { TestUser, TestUserDocument } from "../schemas/test_user.schema";
import { TestQuestionService } from "./test_question.service";

@Injectable()
export class TestUserService {
  constructor(
    @InjectModel(TestUser.name)
    private testUserModel: Model<TestUserDocument>,

    private testQuestionService: TestQuestionService,
    private gptService: GptService,
    private botService: BotService
  ) {}

  /**
   * @author Tony Vu
   * @param createUser
   * @returns
   */
  async create(createUser): Promise<TestUser> {
    const createdUser = new this.testUserModel(createUser);
    return createdUser.save();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async remove(dataToSearch: any): Promise<any> {
    await this.testUserModel.deleteMany(dataToSearch);
  }

  /**
   * @author Tony Vu
   * @returns
   */
  async findAll(pattern?: any): Promise<TestUser[]> {
    return this.testUserModel.find(pattern).exec();
  }

  /**
   * @author Tony Vu
   * @param dataToSearch
   * @returns
   */
  async findOne(dataToSearch: any, isPopulate: boolean = false): Promise<TestUser> {
    if (isPopulate) {
      return await this.testUserModel
        .findOne(dataToSearch)
        .populate({
          path: "user_id",
          select:
            "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
        })
        .populate("test_id")
        .exec();
    } else return await this.testUserModel.findOne(dataToSearch).exec();
  }

  /**
   * @author Tony Vu
   * @param dataUpdate
   * @returns
   */
  async update(dataUpdate: any) {
    try {
      const dataReturn = await this.testUserModel.findOneAndUpdate(
        { _id: dataUpdate._id },
        { $set: dataUpdate },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (dataReturn._id) {
        return { ...dataReturn.toObject(), ...dataUpdate };
      } else {
        return dataReturn;
      }
    } catch (e) {
      return e;
    }
  }

  /**
   * @author Tony Vu
   * @param filter
   * @returns
   */
  public count = async (filter: FilterTestUserDTO) => {
    try {
      const condition = await this.getCondition(filter);
      if (JSON.stringify(condition) === JSON.stringify({})) {
        return this.testUserModel.estimatedDocumentCount();
      } else {
        return this.testUserModel.countDocuments(condition);
      }
    } catch (e) {
      return 0;
    }
  };

  /**
   * @author Tony Vu
   * @param sortBy
   * @returns
   */
  getSort(sortBy: any) {
    let sort = { priority: -1 };
    if (sortBy.createdAt) {
      sort = Object.assign(sort, { _id: sortBy.createdAt === "DESC" ? -1 : 1 });
    }
    if (sortBy.updatedAt) {
      sort = Object.assign(sort, { updatedAt: sortBy.updatedAt === "DESC" ? -1 : 1 });
    }
    return sort;
  }

  getCondition(filter: FilterTestUserDTO) {
    let condition: any = {};

    if (filter.user_id) {
      condition = Object.assign(condition, { user_id: filter.user_id });
    }

    if (filter.test_id) {
      condition = Object.assign(condition, { test_id: filter.test_id });
    }

    return condition;
  }

  async filter(
    filter: FilterTestUserDTO,
    sortBy: any,
    page: number,
    limit: number,
    projection: any = {}
  ): Promise<TestUser[]> {
    const condition = await this.getCondition(filter);
    let sortObject: any;
    if (sortBy) {
      sortObject = this.getSort(sortBy);
    }
    const dataReturn = await this.testUserModel
      .find(condition, projection)
      .populate({
        path: "user_id",
        select:
          "_id user_login display_name user_role user_status user_avatar user_avatar_thumbnail user_avatar_square last_active user_active official_status",
      })
      .populate("test_id")
      .sort(sortObject)
      .skip(limit * (page - 1))
      .limit(limit)
      .exec();
    return dataReturn;
  }

  async calculateUserBand(data: UpdateTestUserDTO): Promise<any> {
    const testQuestions = await this.testQuestionService.findAll({ test_id: data.test_id });
    const userAnswers = data.answers;

    const listeningQuestions = testQuestions.filter((question) => question.part === TestQuestionPart.LISTENING);
    const readingQuestions = testQuestions.filter((question) => question.part === TestQuestionPart.READING);
    const writingQuestions = testQuestions.filter((question) => question.part === TestQuestionPart.WRITING);
    const speakingQuestions = testQuestions.filter((question) => question.part === TestQuestionPart.SPEAKING);

    let listeningPoint = undefined;
    let readingPoint = undefined;
    let writingPoint = undefined;
    let speakingPoint = undefined;

    switch (data.type) {
      case TestType.LISTENING: {
        listeningPoint = this.getListeningBand(userAnswers, listeningQuestions);
        break;
      }
      case TestType.READING: {
        readingPoint = this.getReadingBand(userAnswers, readingQuestions);
        break;
      }
      case TestType.WRITING: {
        writingPoint = await this.getWritingBand(userAnswers, writingQuestions);
        break;
      }
      case TestType.SPEAKING: {
        speakingPoint = await this.getSpeakingBand(userAnswers, speakingQuestions);
        break;
      }
      case TestType.EXAM: {
        listeningPoint = this.getListeningBand(userAnswers, listeningQuestions);
        readingPoint = this.getReadingBand(userAnswers, readingQuestions);
        writingPoint = await this.getWritingBand(userAnswers, writingQuestions);
        speakingPoint = await this.getSpeakingBand(userAnswers, speakingQuestions);
        break;
      }
    }

    const totalPoint = [listeningPoint, readingPoint, writingPoint, speakingPoint].filter(
      (point) => point !== undefined
    ).length;
    let averageBand = 0;
    if (totalPoint > 0) {
      averageBand = (listeningPoint + readingPoint + writingPoint + speakingPoint) / totalPoint;
    }

    const band = this.getIELTSBandScore(averageBand);
    await this.update({
      _id: data._id,
      band,
      status: TestStatus.DONE,
    });
  }

  private getListeningBand(userAnswers: UserAnswer[], questions: TestQuestion[]): number {
    let amountOfCorrect = 0;
    for (const userAnswer of userAnswers) {
      const question = questions.find((question) => question.index === userAnswer.index);
      if (!question) continue;

      if (question.answer === userAnswer.answer) {
        amountOfCorrect = amountOfCorrect + 1;
      }
      userAnswer.correct_answer = question.answer;
    }

    return this.calculatingListeningBand(amountOfCorrect);
  }

  private calculatingListeningBand(amountOfCorrect: number): number {
    const bandScores = [
      { min: 0, max: 2, band: 0 },
      { min: 3, max: 4, band: 2.5 },
      { min: 5, max: 6, band: 3.0 },
      { min: 7, max: 9, band: 3.5 },
      { min: 10, max: 12, band: 4.0 },
      { min: 13, max: 15, band: 4.5 },
      { min: 16, max: 19, band: 5.0 },
      { min: 20, max: 22, band: 5.5 },
      { min: 23, max: 26, band: 6.0 },
      { min: 27, max: 29, band: 6.5 },
      { min: 30, max: 32, band: 7.0 },
      { min: 33, max: 34, band: 7.5 },
      { min: 35, max: 36, band: 8.0 },
      { min: 37, max: 38, band: 8.5 },
      { min: 39, max: 40, band: 9.0 },
    ];

    for (let i = 0; i < bandScores.length; i++) {
      if (amountOfCorrect >= bandScores[i].min && amountOfCorrect <= bandScores[i].max) {
        return bandScores[i].band;
      }
    }
  }

  private getReadingBand(userAnswers: UserAnswer[], questions: TestQuestion[]): number {
    let amountOfCorrect = 0;
    for (const userAnswer of userAnswers) {
      const question = questions.find((question) => question.index === userAnswer.index);
      if (!question) continue;

      if (question.answer === userAnswer.answer) {
        amountOfCorrect = amountOfCorrect + 1;
      }
      userAnswer.correct_answer = question.answer;
    }

    return this.calculatingReadingBand(amountOfCorrect);
  }

  private calculatingReadingBand(amountOfCorrect: number): number {
    const bandScores = [
      { min: 0, max: 2, band: 0 },
      { min: 3, max: 4, band: 2.5 },
      { min: 5, max: 6, band: 3.0 },
      { min: 7, max: 9, band: 3.5 },
      { min: 10, max: 12, band: 4.0 },
      { min: 13, max: 15, band: 4.5 },
      { min: 16, max: 19, band: 5.0 },
      { min: 20, max: 22, band: 5.5 },
      { min: 23, max: 26, band: 6.0 },
      { min: 27, max: 29, band: 6.5 },
      { min: 30, max: 32, band: 7.0 },
      { min: 33, max: 34, band: 7.5 },
      { min: 35, max: 36, band: 8.0 },
      { min: 37, max: 38, band: 8.5 },
      { min: 39, max: 40, band: 9.0 },
    ];

    for (let i = 0; i < bandScores.length; i++) {
      if (amountOfCorrect >= bandScores[i].min && amountOfCorrect <= bandScores[i].max) {
        return bandScores[i].band;
      }
    }
  }

  private async getWritingBand(userAnswers: UserAnswer[], questions: TestQuestion[]): Promise<number> {
    let result: WritingResult[] = [];
    for (const userAnswer of userAnswers) {
      const question = questions.find((question) => question.index === userAnswer.index);
      if (!question) continue;

      const data = await this.gptService.getWritingBandScore(question.question, userAnswer.answer);

      userAnswer.correct_answer = data;
      result.push(data);
    }

    return this.calculatingWritingBand(result);
  }

  private calculatingWritingBand(data: WritingResult[]): number {
    let totalBand = 0;

    if (data.length === 0) return totalBand;
    for (const datum of data) {
      const totalScore =
        (datum.coherence_and_cohesion +
          datum.grammatical_range_and_accuracy +
          datum.lexical_resource +
          datum.task_response) /
        4;
      totalBand += this.getIELTSBandScore(totalScore);
    }

    return this.getIELTSBandScore(totalBand / data.length);
  }

  private async getSpeakingBand(userAnswers: UserAnswer[], questions: TestQuestion[]): Promise<number> {
    let result: SpeakingResult[] = [];
    for (const userAnswer of userAnswers) {
      const question = questions.find((question) => question.index === userAnswer.index);
      if (!question) continue;

      const userSpeechText = await this.getTextFromSpeech(userAnswer.answer);
      const [lexical_and_grammatical_object, pronunciation, fluency_and_coherence] = await Promise.all([
        this.gptService.getSpeakingLexialResourceAndGrammaticalRangeCriteria(question.question, userSpeechText),
        this.getSpeakingPronounceCriteria(userAnswer.answer),
        this.getSpeakingFluencyAndCoherenceCriteria(userAnswer.answer),
      ]);

      let data: SpeakingResult = {
        lexical_resource: lexical_and_grammatical_object.lexical_resource,
        grammatical_range_and_accuracy: lexical_and_grammatical_object.grammatical_range_and_accuracy,
        pronunciation: pronunciation,
        fluency_and_coherence: fluency_and_coherence,
      };

      userAnswer.correct_answer = data;
      result.push(data);
    }
    return this.calculatingSpeakingBand(result);
  }

  private calculatingSpeakingBand(data: SpeakingResult[]): number {
    let totalBand = 0;

    if (data.length === 0) return totalBand;
    for (const datum of data) {
      const totalScore =
        (datum.fluency_and_coherence +
          datum.grammatical_range_and_accuracy +
          datum.lexical_resource +
          datum.pronunciation) /
        4;
      totalBand += this.getIELTSBandScore(totalScore);
    }

    return this.getIELTSBandScore(totalBand / data.length);
  }

  private async getSpeakingFluencyAndCoherenceCriteria(audioUrl: string): Promise<number> {
    try {
      const bufferData = await fetch(audioUrl).then((response) => {
        return response.arrayBuffer();
      });
      const data = await this.botService.getFluencyScore({
        audio_buffer: bufferData,
      });

      return this.calculateJunbro1016Score(data as any);
    } catch (e) {
      console.log(e.message);
      return 5;
    }
  }

  private async getSpeakingPronounceCriteria(audioUrl: string): Promise<number> {
    try {
      const bufferData = await fetch(audioUrl).then((response) => {
        return response.arrayBuffer();
      });
      const data = await this.botService.getPronounceScore({
        audio_buffer: bufferData,
      });

      return this.calculateJunbro1016Score(data as any);
    } catch (e) {
      console.log(e.message);
      return 5;
    }
  }

  private async calculateJunbro1016Score(data: Junbro1016ResponseData) {
    let score = 0;

    data.forEach((item) => {
      if (item.label === "good") {
        score += item.score * 9;
      } else if (item.label === "normal") {
        score += item.score * 6;
      } else if (item.label === "bad") {
        score += item.score * 3;
      }
    });

    return this.getIELTSBandScore(score);
  }

  private async getTextFromSpeech(audioUrl: string) {
    const client = new SpeechClient();

    // Fetch audio file from URL
    const response = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });
    const audioContent = response.data;

    // Configure audio settings
    const audio = {
      content: audioContent.toString("base64"),
    };

    const config = {
      encoding: "MP3",
      sampleRateHertz: 16000,
      languageCode: "en-US",
    };

    const request: any = {
      audio: audio,
      config: config,
    };

    try {
      const [response] = await client.recognize(request);
      const transcription = response.results.map((result) => result.alternatives[0].transcript).join("\n");
      return transcription;
    } catch (err) {
      console.error("Error transcribing:", err);
      throw err;
    }
  }

  private getIELTSBandScore(nonRoundedBand: number): number {
    if (nonRoundedBand <= 0 || nonRoundedBand >= 9) {
      return 0;
    }

    if (nonRoundedBand % 0.5 === 0) {
      return Number(nonRoundedBand.toFixed(1));
    } else {
      let lowerBand = Math.floor(nonRoundedBand * 2) / 2;
      let upperBand = Math.ceil(nonRoundedBand * 2) / 2;
      if (upperBand - nonRoundedBand < nonRoundedBand - lowerBand) {
        return Number(upperBand.toFixed(1));
      } else {
        return Number(lowerBand.toFixed(1));
      }
    }
  }
}
