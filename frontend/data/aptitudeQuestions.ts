export interface PlacementQuestion {
  id: number;
  question: string;
  options: string[];
  dbOptions?: any[];
}

import { PERCENTAGES_QUESTIONS } from "./percentagesQuestions";

export { PERCENTAGES_QUESTIONS };

export const PROFIT_LOSS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. An article is purchased for Rs. 500 and sold for Rs. 600. What is the gain percentage?",
    options: ["a) 20%", "b) 25%", "c) 15%", "d) 10%"],
  },
  {
    id: 2,
    question: "2. If the cost price of 12 articles is equal to the selling price of 10 articles, what is the profit percentage?",
    options: ["a) 15%", "b) 20%", "c) 25%", "d) 30%"],
  },
  {
    id: 3,
    question: "3. A man sells two wristwatches at Rs. 990 each. On one he gains 10% and on the other he loses 10%. What is his net gain or loss percentage?",
    options: ["a) 1% gain", "b) No gain no loss", "c) 1% loss", "d) 2% loss"],
  },
  {
    id: 4,
    question: "4. The marked price of a shirt is Rs. 800. If a discount of 15% is offered on it, what is the selling price?",
    options: ["a) Rs. 680", "b) Rs. 720", "c) Rs. 650", "d) Rs. 700"],
  },
  {
    id: 5,
    question: "5. What is the single equivalent discount for two successive discounts of 20% and 10%?",
    options: ["a) 30%", "b) 25%", "c) 26%", "d) 28%"],
  },
  {
    id: 6,
    question: "6. A dishonest trader sells goods at cost price but uses a weight of 900 grams for a 1 kg weight. What is his profit percentage?",
    options: ["a) 10%", "b) 11 1/9%", "c) 12%", "d) 9 1/11%"],
  },
  {
    id: 7,
    question: "7. A sells a watch to B at 20% profit, and B sells it to C at 10% profit. If C pays Rs. 660 for it, how much did A pay for it?",
    options: ["a) Rs. 500", "b) Rs. 550", "c) Rs. 480", "d) Rs. 520"],
  },
  {
    id: 8,
    question: "8. By selling an item for Rs. 450, a shopkeeper incurs a loss of 10%. At what price should he sell it to gain 20%?",
    options: ["a) Rs. 550", "b) Rs. 580", "c) Rs. 600", "d) Rs. 640"],
  },
  {
    id: 9,
    question: "9. By selling 33 meters of cloth, a merchant gains the selling price of 11 meters. What is his gain percentage?",
    options: ["a) 33.33%", "b) 50%", "c) 25%", "d) 40%"],
  },
  {
    id: 10,
    question: "10. The profit earned when an article is sold for Rs. 780 is twice the loss incurred when it is sold for Rs. 600. Find the cost price.",
    options: ["a) Rs. 660", "b) Rs. 680", "c) Rs. 640", "d) Rs. 700"],
  },
];

export const TIME_WORK_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. A can complete a piece of work in 10 days and B can complete it in 15 days. In how many days can both complete it working together?",
    options: ["a) 6 days", "b) 8 days", "c) 5 days", "d) 7.5 days"],
  },
  {
    id: 2,
    question: "2. A and B together can do a job in 12 days. A alone can do it in 20 days. How many days will B alone take to complete the job?",
    options: ["a) 25 days", "b) 30 days", "c) 24 days", "d) 36 days"],
  },
  {
    id: 3,
    question: "3. A is twice as efficient as B. Working together, they complete a work in 14 days. In how many days can A alone complete the work?",
    options: ["a) 28 days", "b) 42 days", "c) 21 days", "d) 35 days"],
  },
  {
    id: 4,
    question: "4. 12 men can complete a work in 8 days. How many men are required to complete the same work in 6 days?",
    options: ["a) 14 men", "b) 15 men", "c) 18 men", "d) 16 men"],
  },
  {
    id: 5,
    question: "5. Pipe A can fill a tank in 4 hours while Pipe B can fill it in 6 hours. If both pipes are opened together, how long will it take to fill the tank?",
    options: ["a) 2.4 hours", "b) 3 hours", "c) 2.5 hours", "d) 3.2 hours"],
  },
  {
    id: 6,
    question: "6. Pipe A can fill a cistern in 10 hours and Pipe B can empty the full cistern in 15 hours. If both are opened together, in how many hours will the cistern be full?",
    options: ["a) 25 hours", "b) 30 hours", "c) 20 hours", "d) 15 hours"],
  },
  {
    id: 7,
    question: "7. A can finish a work in 20 days. He worked at it for 5 days and then B finished the remaining work in 15 days. How long will B take to complete the whole work alone?",
    options: ["a) 20 days", "b) 25 days", "c) 18 days", "d) 24 days"],
  },
  {
    id: 8,
    question: "8. A and B can do a work in 12 days and 18 days respectively. They start working together, but A leaves after 3 days. In how many more days will B finish the remaining work?",
    options: ["a) 10.5 days", "b) 12 days", "c) 13.5 days", "d) 15 days"],
  },
];

export const TIME_SPEED_DISTANCE_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Convert a speed of 72 km/h into meters per second (m/s).",
    options: ["a) 20 m/s", "b) 25 m/s", "c) 18 m/s", "d) 15 m/s"],
  },
  {
    id: 2,
    question: "2. A car travels a distance at 60 km/h and returns the same distance at 40 km/h. What is the average speed of the car for the entire journey?",
    options: ["a) 50 km/h", "b) 48 km/h", "c) 45 km/h", "d) 52 km/h"],
  },
  {
    id: 3,
    question: "3. A train 200 meters long passes a telegraph pole in 10 seconds. Find the speed of the train in km/h.",
    options: ["a) 60 km/h", "b) 64 km/h", "c) 72 km/h", "d) 80 km/h"],
  },
  {
    id: 4,
    question: "4. A train 150 meters long crosses a platform 250 meters long in 20 seconds. What is the speed of the train in m/s?",
    options: ["a) 20 m/s", "b) 25 m/s", "c) 15 m/s", "d) 18 m/s"],
  },
  {
    id: 5,
    question: "5. Two trains of lengths 100m and 120m are running in opposite directions at speeds of 40 km/h and 32 km/h respectively. In how much time will they completely pass each other?",
    options: ["a) 8 seconds", "b) 10 seconds", "c) 12 seconds", "d) 11 seconds"],
  },
  {
    id: 6,
    question: "6. The speed of a boat in still water is 10 km/h and the speed of the stream is 2 km/h. How long will it take to travel 24 km downstream?",
    options: ["a) 3 hours", "b) 2 hours", "c) 2.4 hours", "d) 1.8 hours"],
  },
  {
    id: 7,
    question: "7. A person covers a certain distance in 4 hours traveling at a speed of 15 km/h. If he increases his speed to 20 km/h, how long will he take to cover the same distance?",
    options: ["a) 3 hours", "b) 2.5 hours", "c) 3.5 hours", "d) 2 hours"],
  },
];

export const PROBABILITY_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. A fair coin is tossed once. What is the probability of getting a Head?",
    options: ["a) 1/2", "b) 1/4", "c) 3/4", "d) 1/3"],
  },
  {
    id: 2,
    question: "2. Two fair dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on both dice is 7?",
    options: ["a) 1/12", "b) 1/6", "c) 5/36", "d) 1/4"],
  },
  {
    id: 3,
    question: "3. A card is drawn at random from a well-shuffled deck of 52 playing cards. What is the probability that the card drawn is a King?",
    options: ["a) 1/52", "b) 1/26", "c) 1/13", "d) 4/13"],
  },
  {
    id: 4,
    question: "4. A bag contains 4 red balls and 6 black balls. If one ball is drawn at random, what is the probability that it is a red ball?",
    options: ["a) 2/5", "b) 3/5", "c) 1/2", "d) 4/5"],
  },
  {
    id: 5,
    question: "5. Two fair coins are tossed. What is the probability of getting at least one Head?",
    options: ["a) 1/4", "b) 1/2", "c) 2/3", "d) 3/4"],
  },
  {
    id: 6,
    question: "6. What is the probability of drawing a Spade or an Ace from a standard pack of 52 cards?",
    options: ["a) 15/52", "b) 4/13", "c) 17/52", "d) 5/13"],
  },
];

export const PERMUTATIONS_COMBINATIONS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. In how many different ways can the letters of the word 'LEADER' be arranged?",
    options: ["a) 360", "b) 720", "c) 180", "d) 240"],
  },
  {
    id: 2,
    question: "2. In how many ways can a committee of 3 persons be chosen from a group of 5 persons?",
    options: ["a) 15", "b) 10", "c) 20", "d) 12"],
  },
  {
    id: 3,
    question: "3. How many 3-digit numbers can be formed using the digits 1, 2, 3, 4, 5 without repetition?",
    options: ["a) 120", "b) 24", "c) 60", "d) 48"],
  },
  {
    id: 4,
    question: "4. Out of 7 consonants and 4 vowels, how many 5-letter words can be formed consisting of 3 consonants and 2 vowels?",
    options: ["a) 210", "b) 2100", "c) 5040", "d) 25200"],
  },
  {
    id: 5,
    question: "5. How many handshakes take place at a party of 10 people where each person shakes hands with every other person exactly once?",
    options: ["a) 45", "b) 90", "c) 50", "d) 100"],
  },
  {
    id: 6,
    question: "6. In how many ways can 5 people sit around a circular table?",
    options: ["a) 120", "b) 24", "c) 60", "d) 48"],
  },
];

// ====================================================================
// LOGICAL REASONING QUESTION BANKS
// ====================================================================

export const BLOOD_RELATIONS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Pointing to a photograph of a boy, Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
    options: ["a) Brother", "b) Father", "c) Uncle", "d) Cousin"],
  },
  {
    id: 2,
    question: "2. If A + B means A is the brother of B; A - B means A is the sister of B and A × B means A is the father of B. Which of the following means that C is the son of M?",
    options: ["a) M - N × C + F", "b) F - C + N × M", "c) N + M - F × C", "d) M × N - C + F"],
  },
  {
    id: 3,
    question: "3. Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
    options: ["a) Mother", "b) Sister", "c) Daughter", "d) Grandmother"],
  },
];

export const SEATING_ARRANGEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. A, B, C, D, E, F and G are sitting in a straight line facing North. E sits 4th to the right of G. C is an immediate neighbor of E and D. F sits 3rd to the left of C. Who is sitting at the extreme right end?",
    options: ["a) E", "b) C", "c) D", "d) B"],
  },
  {
    id: 2,
    question: "2. Five friends P, Q, R, S, and T are sitting in a circle facing the center. R is sitting to the immediate left of S. T is sitting between P and S. Who is sitting to the immediate right of R?",
    options: ["a) Q", "b) P", "c) S", "d) T"],
  },
];

export const CODING_DECODING_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. In a certain code language, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in that same code?",
    options: ["a) EOJDJEFM", "b) EOJDEJFM", "c) MFEJDJOE", "d) EJOJEFDM"],
  },
  {
    id: 2,
    question: "2. If 'LIGHT' is coded as 'MJHIU', how is 'FLAME' coded?",
    options: ["a) GMBNF", "b) GMBND", "c) GNCNE", "d) GLBNF"],
  },
];

export const SYLLOGISMS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Statements: All cats are dogs. All dogs are birds. Conclusions: I. All cats are birds. II. Some birds are cats.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Both I and II follow"],
  },
  {
    id: 2,
    question: "2. Statements: Some books are pens. No pen is a pencil. Conclusions: I. Some books are not pencils. II. Some pens are books.",
    options: ["a) Only I follows", "b) Only II follows", "c) Both I and II follow", "d) Neither follows"],
  },
];

export const PUZZLES_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Four people A, B, C, D have four different professions: Doctor, Engineer, Lawyer, Teacher. A is neither a Doctor nor a Lawyer. B is an Engineer. C is not a Doctor. Who is the Doctor?",
    options: ["a) A", "b) B", "c) C", "d) D"],
  },
];

// ====================================================================
// VERBAL ABILITY QUESTION BANKS
// ====================================================================

export const GRAMMAR_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Identify the grammatically correct sentence:",
    options: [
      "a) Neither of the candidates have submitted their resume.",
      "b) Neither of the candidates has submitted his resume.",
      "c) Neither of candidates were submitting resume.",
      "d) Neither candidate have submitted resumes."
    ],
  },
  {
    id: 2,
    question: "2. Choose the correct preposition: 'She has been working here _____ 2018.'",
    options: ["a) for", "b) since", "c) from", "d) in"],
  },
];

export const READING_COMPREHENSION_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Passage: 'Artificial Intelligence is revolutionizing modern education by providing personalized learning experiences. Adaptive platforms analyze student performance in real-time to tailor lesson plans.' What is the primary benefit of AI in education mentioned?",
    options: [
      "a) Replacing human teachers",
      "b) Providing personalized learning experiences",
      "c) Reducing school infrastructure costs",
      "d) Automating grading completely"
    ],
  },
];

export const VOCABULARY_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Select the synonym of 'EPHEMERAL':",
    options: ["a) Eternal", "b) Transient", "c) Substantial", "d) Permanent"],
  },
  {
    id: 2,
    question: "2. Select the antonym of 'METICULOUS':",
    options: ["a) Careless", "b) Thorough", "c) Precise", "d) Diligent"],
  },
];

export const SENTENCE_CORRECTION_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Correct the underlined phrase: 'He is one of those men who is never satisfied.'",
    options: [
      "a) is never satisfied",
      "b) are never satisfied",
      "c) was never satisfied",
      "d) has never been satisfied"
    ],
  },
];

export const QUANTITATIVE_APTITUDE_MAP: Record<string, PlacementQuestion[]> = {
  "Percentages": PERCENTAGES_QUESTIONS,
  "Profit & Loss": PROFIT_LOSS_QUESTIONS,
  "Time & Work": TIME_WORK_QUESTIONS,
  "Time, Speed & Distance": TIME_SPEED_DISTANCE_QUESTIONS,
  "Probability": PROBABILITY_QUESTIONS,
  "Permutations & Combinations": PERMUTATIONS_COMBINATIONS_QUESTIONS,
  "Blood Relations": BLOOD_RELATIONS_QUESTIONS,
  "Seating Arrangement": SEATING_ARRANGEMENT_QUESTIONS,
  "Coding-Decoding": CODING_DECODING_QUESTIONS,
  "Syllogisms": SYLLOGISMS_QUESTIONS,
  "Puzzles": PUZZLES_QUESTIONS,
  "Grammar": GRAMMAR_QUESTIONS,
  "Reading Comprehension": READING_COMPREHENSION_QUESTIONS,
  "Vocabulary": VOCABULARY_QUESTIONS,
  "Sentence Correction": SENTENCE_CORRECTION_QUESTIONS,
};
