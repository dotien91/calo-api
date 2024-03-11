export enum TestQuestionType {
  TEXT = "text",
  DROP_DOWN = "dropdown",
  CHECK_BOX = "checkbox",
  AUDIO = "audio",
  WRAPPER = "wrapper",
  FILL = "fill",
}

export enum TestQuestionPart {
  LISTENING = "listening",
  READING = "reading",
  WRITING = "writing",
  SPEAKING = "speaking",
}

export enum TestStatus {
  PENDING = "pending",
  DONE = "done",
}

export interface WritingResult {
  task_response: number;
  coherence_and_cohesion: number;
  lexical_resource: number;
  grammatical_range_and_accuracy: number;
}

export interface SpeakingResult {
  fluency_and_coherence: number;
  lexical_resource: number;
  grammatical_range_and_accuracy: number;
  pronunciation: number;
}

export type Junbro1016ResponseData = Array<{
  score: number;
  label: string;
}>;

export enum TestType {
  EXAM = "exam",
  LISTENING = "listening",
  READING = "reading",
  WRITING = "writing",
  SPEAKING = "speaking",
}

