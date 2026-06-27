export type Question = {
  id: string;
  name: string | null;
  question: string;
  created_at: string;
  selected: boolean;
  position: number | null;
};

export type QuestionPatch = {
  id: string;
  selected: boolean;
  position: number | null;
};
