export interface PlacementQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  answerText: string;
  solution: string;
}

import { PERCENTAGES_QUESTIONS } from "./percentagesQuestions";

export { PERCENTAGES_QUESTIONS };

export const PROFIT_LOSS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. An article is purchased for Rs. 500 and sold for Rs. 600. What is the gain percentage?",
    options: ["a) 20%", "b) 25%", "c) 15%", "d) 10%"],
    correctIndex: 0,
    answerText: "a) 20%",
    solution: "Profit = Selling Price − Cost Price = 600 − 500 = Rs. 100.\nProfit Percentage = (Profit / Cost Price) × 100 = (100 / 500) × 100 = 20%.",
  },
  {
    id: 2,
    question: "2. If the cost price of 12 articles is equal to the selling price of 10 articles, what is the profit percentage?",
    options: ["a) 15%", "b) 20%", "c) 25%", "d) 30%"],
    correctIndex: 1,
    answerText: "b) 20%",
    solution: "Let Cost Price of 1 article = Re 1.\nCost Price of 10 articles = Rs 10.\nSelling Price of 10 articles = Cost Price of 12 articles = Rs 12.\nProfit on 10 articles = 12 − 10 = Rs 2.\nProfit % = (2 / 10) × 100 = 20%.",
  },
  {
    id: 3,
    question: "3. A man sells two wristwatches at Rs. 990 each. On one he gains 10% and on the other he loses 10%. What is his net gain or loss percentage?",
    options: ["a) 1% gain", "b) No gain no loss", "c) 1% loss", "d) 2% loss"],
    correctIndex: 2,
    answerText: "c) 1% loss",
    solution: "When two items are sold at the same selling price, one at x% gain and the other at x% loss, the transaction always results in a net loss.\nNet Loss % = (x² / 100)% = (10² / 100)% = 1% loss.",
  },
  {
    id: 4,
    question: "4. The marked price of a shirt is Rs. 800. If a discount of 15% is offered on it, what is the selling price?",
    options: ["a) Rs. 680", "b) Rs. 720", "c) Rs. 650", "d) Rs. 700"],
    correctIndex: 0,
    answerText: "a) Rs. 680",
    solution: "Discount Amount = 15% of 800 = (15 / 100) × 800 = Rs. 120.\nSelling Price = Marked Price − Discount = 800 − 120 = Rs. 680.",
  },
  {
    id: 5,
    question: "5. What is the single equivalent discount for two successive discounts of 20% and 10%?",
    options: ["a) 30%", "b) 25%", "c) 26%", "d) 28%"],
    correctIndex: 3,
    answerText: "d) 28%",
    solution: "Let initial price = 100.\nAfter 1st discount (20%): 100 × 0.80 = 80.\nAfter 2nd discount (10%): 80 × 0.90 = 72.\nTotal Discount = 100 − 72 = 28%.",
  },
  {
    id: 6,
    question: "6. A dishonest trader sells goods at cost price but uses a weight of 900 grams for a 1 kg weight. What is his profit percentage?",
    options: ["a) 10%", "b) 11 1/9%", "c) 12%", "d) 9 1/11%"],
    correctIndex: 1,
    answerText: "b) 11 1/9%",
    solution: "Profit % = [ (True Weight − False Weight) / False Weight ] × 100\n= [ (1000g − 900g) / 900g ] × 100 = (100 / 900) × 100 = 100 / 9 % = 11 1/9 %.",
  },
  {
    id: 7,
    question: "7. A sells a watch to B at 20% profit, and B sells it to C at 10% profit. If C pays Rs. 660 for it, how much did A pay for it?",
    options: ["a) Rs. 500", "b) Rs. 550", "c) Rs. 480", "d) Rs. 520"],
    correctIndex: 0,
    answerText: "a) Rs. 500",
    solution: "Let A's cost price = x.\nB's cost = 1.20x.\nC's cost = 1.20x × 1.10 = 1.32x.\nGiven 1.32x = 660 ⇒ x = 660 / 1.32 = Rs. 500.",
  },
  {
    id: 8,
    question: "8. By selling an item for Rs. 450, a shopkeeper incurs a loss of 10%. At what price should he sell it to gain 20%?",
    options: ["a) Rs. 550", "b) Rs. 580", "c) Rs. 600", "d) Rs. 640"],
    correctIndex: 2,
    answerText: "c) Rs. 600",
    solution: "Selling Price = 450 (Loss = 10%).\nCost Price = 450 / 0.90 = Rs. 500.\nTarget Selling Price (Gain = 20%) = 500 × 1.20 = Rs. 600.",
  },
  {
    id: 9,
    question: "9. By selling 33 meters of cloth, a merchant gains the selling price of 11 meters. What is his gain percentage?",
    options: ["a) 33.33%", "b) 50%", "c) 25%", "d) 40%"],
    correctIndex: 1,
    answerText: "b) 50%",
    solution: "Profit = Selling Price of 11m.\nProfit = SP of 33m − CP of 33m ⇒ SP of 11m = SP of 33m − CP of 33m\n⇒ CP of 33m = SP of 22m.\nGain % = (11 / 22) × 100 = 50%.",
  },
  {
    id: 10,
    question: "10. The profit earned when an article is sold for Rs. 780 is twice the loss incurred when it is sold for Rs. 600. Find the cost price.",
    options: ["a) Rs. 660", "b) Rs. 680", "c) Rs. 640", "d) Rs. 700"],
    correctIndex: 0,
    answerText: "a) Rs. 660",
    solution: "Let Cost Price = CP.\nProfit at Rs 780 = 780 − CP.\nLoss at Rs 600 = CP − 600.\nGiven: 780 − CP = 2 × (CP − 600) ⇒ 780 − CP = 2CP − 1200\n⇒ 3CP = 1980 ⇒ CP = Rs. 660.",
  },
];

export const TIME_WORK_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. A can complete a piece of work in 10 days and B can complete it in 15 days. In how many days can both complete it working together?",
    options: ["a) 6 days", "b) 8 days", "c) 5 days", "d) 7.5 days"],
    correctIndex: 0,
    answerText: "a) 6 days",
    solution: "A's 1-day work = 1/10. B's 1-day work = 1/15.\nCombined 1-day work = 1/10 + 1/15 = (3 + 2) / 30 = 5 / 30 = 1/6.\nTotal time taken together = 6 days.",
  },
  {
    id: 2,
    question: "2. A and B together can do a job in 12 days. A alone can do it in 20 days. How many days will B alone take to complete the job?",
    options: ["a) 25 days", "b) 30 days", "c) 24 days", "d) 36 days"],
    correctIndex: 1,
    answerText: "b) 30 days",
    solution: "(A + B)'s 1-day work = 1/12. A's 1-day work = 1/20.\nB's 1-day work = 1/12 − 1/20 = (5 − 3) / 60 = 2 / 60 = 1/30.\nB alone takes 30 days.",
  },
  {
    id: 3,
    question: "3. A is twice as efficient as B. Working together, they complete a work in 14 days. In how many days can A alone complete the work?",
    options: ["a) 28 days", "b) 42 days", "c) 21 days", "d) 35 days"],
    correctIndex: 2,
    answerText: "c) 21 days",
    solution: "Efficiency ratio A : B = 2 : 1.\nCombined efficiency = 2 + 1 = 3 units/day.\nTotal Work = 3 units/day × 14 days = 42 units.\nTime taken by A alone = Total Work / A's efficiency = 42 / 2 = 21 days.",
  },
  {
    id: 4,
    question: "4. 12 men can complete a work in 8 days. How many men are required to complete the same work in 6 days?",
    options: ["a) 14 men", "b) 15 men", "c) 18 men", "d) 16 men"],
    correctIndex: 3,
    answerText: "d) 16 men",
    solution: "Formula: M1 × D1 = M2 × D2\n12 × 8 = M2 × 6 ⇒ 96 = 6 × M2 ⇒ M2 = 96 / 6 = 16 men.",
  },
  {
    id: 5,
    question: "5. Pipe A can fill a tank in 4 hours while Pipe B can fill it in 6 hours. If both pipes are opened together, how long will it take to fill the tank?",
    options: ["a) 2.4 hours", "b) 3 hours", "c) 2.5 hours", "d) 3.2 hours"],
    correctIndex: 0,
    answerText: "a) 2.4 hours",
    solution: "A's rate = 1/4 tank/hr. B's rate = 1/6 tank/hr.\nCombined rate = 1/4 + 1/6 = 5/12 tank/hr.\nTime to fill = 12 / 5 = 2.4 hours (2 hours 24 minutes).",
  },
  {
    id: 6,
    question: "6. Pipe A can fill a cistern in 10 hours and Pipe B can empty the full cistern in 15 hours. If both are opened together, in how many hours will the cistern be full?",
    options: ["a) 25 hours", "b) 30 hours", "c) 20 hours", "d) 15 hours"],
    correctIndex: 1,
    answerText: "b) 30 hours",
    solution: "Net fill per hour = 1/10 − 1/15 = (3 − 2) / 30 = 1/30 cistern/hr.\nTime required to fill cistern = 30 hours.",
  },
  {
    id: 7,
    question: "7. A can finish a work in 20 days. He worked at it for 5 days and then B finished the remaining work in 15 days. How long will B take to complete the whole work alone?",
    options: ["a) 20 days", "b) 25 days", "c) 18 days", "d) 24 days"],
    correctIndex: 0,
    answerText: "a) 20 days",
    solution: "A's 5 days work = 5 / 20 = 1/4.\nRemaining work = 1 − 1/4 = 3/4.\nB completes 3/4 work in 15 days ⇒ B completes 1 full work in 15 × (4 / 3) = 20 days.",
  },
  {
    id: 8,
    question: "8. A and B can do a work in 12 days and 18 days respectively. They start working together, but A leaves after 3 days. In how many more days will B finish the remaining work?",
    options: ["a) 10.5 days", "b) 12 days", "c) 13.5 days", "d) 15 days"],
    correctIndex: 0,
    answerText: "a) 10.5 days",
    solution: "In 3 days, (A + B) work = 3 × (1/12 + 1/18) = 3 × (5 / 36) = 15 / 36 = 5 / 12.\nRemaining work = 1 − 5/12 = 7/12.\nTime taken by B for remaining work = (7/12) / (1/18) = (7/12) × 18 = 10.5 days.",
  },
];

export const TIME_SPEED_DISTANCE_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Convert a speed of 72 km/h into meters per second (m/s).",
    options: ["a) 20 m/s", "b) 25 m/s", "c) 18 m/s", "d) 15 m/s"],
    correctIndex: 0,
    answerText: "a) 20 m/s",
    solution: "Conversion formula: Speed in m/s = Speed in km/h × (5 / 18).\n72 × (5 / 18) = 4 × 5 = 20 m/s.",
  },
  {
    id: 2,
    question: "2. A car travels a distance at 60 km/h and returns the same distance at 40 km/h. What is the average speed of the car for the entire journey?",
    options: ["a) 50 km/h", "b) 48 km/h", "c) 45 km/h", "d) 52 km/h"],
    correctIndex: 1,
    answerText: "b) 48 km/h",
    solution: "Average Speed formula for equal distances = (2 × S1 × S2) / (S1 + S2)\n= (2 × 60 × 40) / (60 + 40) = 4800 / 100 = 48 km/h.",
  },
  {
    id: 3,
    question: "3. A train 200 meters long passes a telegraph pole in 10 seconds. Find the speed of the train in km/h.",
    options: ["a) 60 km/h", "b) 64 km/h", "c) 72 km/h", "d) 80 km/h"],
    correctIndex: 2,
    answerText: "c) 72 km/h",
    solution: "Speed = Distance / Time = 200m / 10s = 20 m/s.\nSpeed in km/h = 20 × (18 / 5) = 72 km/h.",
  },
  {
    id: 4,
    question: "4. A train 150 meters long crosses a platform 250 meters long in 20 seconds. What is the speed of the train in m/s?",
    options: ["a) 20 m/s", "b) 25 m/s", "c) 15 m/s", "d) 18 m/s"],
    correctIndex: 0,
    answerText: "a) 20 m/s",
    solution: "Total Distance = Length of Train + Length of Platform = 150 + 250 = 400 meters.\nSpeed = Total Distance / Time = 400 / 20 = 20 m/s.",
  },
  {
    id: 5,
    question: "5. Two trains of lengths 100m and 120m are running in opposite directions at speeds of 40 km/h and 32 km/h respectively. In how much time will they completely pass each other?",
    options: ["a) 8 seconds", "b) 10 seconds", "c) 12 seconds", "d) 11 seconds"],
    correctIndex: 3,
    answerText: "d) 11 seconds",
    solution: "Total Distance = 100 + 120 = 220 meters.\nRelative Speed (Opposite Directions) = 40 + 32 = 72 km/h = 72 × (5 / 18) = 20 m/s.\nTime taken = Total Distance / Relative Speed = 220 / 20 = 11 seconds.",
  },
  {
    id: 6,
    question: "6. The speed of a boat in still water is 10 km/h and the speed of the stream is 2 km/h. How long will it take to travel 24 km downstream?",
    options: ["a) 3 hours", "b) 2 hours", "c) 2.4 hours", "d) 1.8 hours"],
    correctIndex: 1,
    answerText: "b) 2 hours",
    solution: "Downstream Speed = Boat Speed + Stream Speed = 10 + 2 = 12 km/h.\nTime = Distance / Downstream Speed = 24 / 12 = 2 hours.",
  },
  {
    id: 7,
    question: "7. A person covers a certain distance in 4 hours traveling at a speed of 15 km/h. If he increases his speed to 20 km/h, how long will he take to cover the same distance?",
    options: ["a) 3 hours", "b) 2.5 hours", "c) 3.5 hours", "d) 2 hours"],
    correctIndex: 0,
    answerText: "a) 3 hours",
    solution: "Distance = Speed × Time = 15 × 4 = 60 km.\nNew Time = Distance / New Speed = 60 / 20 = 3 hours.",
  },
];

export const PROBABILITY_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. A fair coin is tossed once. What is the probability of getting a Head?",
    options: ["a) 1/2", "b) 1/4", "c) 3/4", "d) 1/3"],
    correctIndex: 0,
    answerText: "a) 1/2",
    solution: "Sample Space S = {H, T} ⇒ n(S) = 2.\nFavorable Event E = {H} ⇒ n(E) = 1.\nProbability P(E) = n(E) / n(S) = 1/2.",
  },
  {
    id: 2,
    question: "2. Two fair dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on both dice is 7?",
    options: ["a) 1/12", "b) 1/6", "c) 5/36", "d) 1/4"],
    correctIndex: 1,
    answerText: "b) 1/6",
    solution: "Total possible outcomes n(S) = 6 × 6 = 36.\nFavorable outcomes for sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) ⇒ n(E) = 6.\nProbability = 6 / 36 = 1/6.",
  },
  {
    id: 3,
    question: "3. A card is drawn at random from a well-shuffled deck of 52 playing cards. What is the probability that the card drawn is a King?",
    options: ["a) 1/52", "b) 1/26", "c) 1/13", "d) 4/13"],
    correctIndex: 2,
    answerText: "c) 1/13",
    solution: "Total cards n(S) = 52.\nNumber of Kings n(E) = 4.\nProbability = 4 / 52 = 1/13.",
  },
  {
    id: 4,
    question: "4. A bag contains 4 red balls and 6 black balls. If one ball is drawn at random, what is the probability that it is a red ball?",
    options: ["a) 2/5", "b) 3/5", "c) 1/2", "d) 4/5"],
    correctIndex: 0,
    answerText: "a) 2/5",
    solution: "Total balls = 4 + 6 = 10.\nNumber of red balls = 4.\nProbability = 4 / 10 = 2/5.",
  },
  {
    id: 5,
    question: "5. Two fair coins are tossed. What is the probability of getting at least one Head?",
    options: ["a) 1/4", "b) 1/2", "c) 2/3", "d) 3/4"],
    correctIndex: 3,
    answerText: "d) 3/4",
    solution: "Sample space S = {HH, HT, TH, TT} ⇒ n(S) = 4.\nFavorable outcomes (at least 1 head) = {HH, HT, TH} ⇒ n(E) = 3.\nProbability = 3 / 4.",
  },
  {
    id: 6,
    question: "6. What is the probability of drawing a Spade or an Ace from a standard pack of 52 cards?",
    options: ["a) 15/52", "b) 4/13", "c) 17/52", "d) 5/13"],
    correctIndex: 1,
    answerText: "b) 4/13",
    solution: "Spades = 13, Aces = 4. (Ace of Spades is counted in both).\nFavorable cards = 13 + 4 − 1 = 16.\nProbability = 16 / 52 = 4/13.",
  },
];

export const PERMUTATIONS_COMBINATIONS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. In how many different ways can the letters of the word 'LEADER' be arranged?",
    options: ["a) 360", "b) 720", "c) 180", "d) 240"],
    correctIndex: 0,
    answerText: "a) 360",
    solution: "Word 'LEADER' contains 6 letters: L, E, A, D, E, R.\nLetter E repeats twice.\nNumber of arrangements = 6! / 2! = 720 / 2 = 360.",
  },
  {
    id: 2,
    question: "2. In how many ways can a committee of 3 persons be chosen from a group of 5 persons?",
    options: ["a) 15", "b) 10", "c) 20", "d) 12"],
    correctIndex: 1,
    answerText: "b) 10",
    solution: "Combination formula ⁿCᵣ = n! / (r! × (n−r)!).\n⁵C₃ = 5! / (3! × 2!) = (5 × 4) / 2 = 10.",
  },
  {
    id: 3,
    question: "3. How many 3-digit numbers can be formed using the digits 1, 2, 3, 4, 5 without repetition?",
    options: ["a) 120", "b) 24", "c) 60", "d) 48"],
    correctIndex: 2,
    answerText: "c) 60",
    solution: "Permutation formula ⁿPᵣ = 5 × 4 × 3 = 60.",
  },
  {
    id: 4,
    question: "4. Out of 7 consonants and 4 vowels, how many 5-letter words can be formed consisting of 3 consonants and 2 vowels?",
    options: ["a) 210", "b) 2100", "c) 5040", "d) 25200"],
    correctIndex: 3,
    answerText: "d) 25200",
    solution: "Selecting 3 consonants from 7 = ⁷C₃ = 35.\nSelecting 2 vowels from 4 = ⁴C₂ = 6.\nSelected 5 letters can be arranged in 5! = 120 ways.\nTotal words = 35 × 6 × 120 = 25,200.",
  },
  {
    id: 5,
    question: "5. How many handshakes take place at a party of 10 people where each person shakes hands with every other person exactly once?",
    options: ["a) 45", "b) 90", "c) 50", "d) 100"],
    correctIndex: 0,
    answerText: "a) 45",
    solution: "Handshakes = ¹⁰C₂ = (10 × 9) / 2 = 45.",
  },
  {
    id: 6,
    question: "6. In how many ways can 5 people sit around a circular table?",
    options: ["a) 120", "b) 24", "c) 60", "d) 48"],
    correctIndex: 1,
    answerText: "b) 24",
    solution: "Circular Permutations formula = (n − 1)! = (5 − 1)! = 4! = 24.",
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
    correctIndex: 1,
    answerText: "b) Father",
    solution: "Suresh's mother's only son is Suresh himself. So the boy is Suresh's son. Thus, Suresh is the boy's father.",
  },
  {
    id: 2,
    question: "2. If A + B means A is the brother of B; A - B means A is the sister of B and A × B means A is the father of B. Which of the following means that C is the son of M?",
    options: ["a) M - N × C + F", "b) F - C + N × M", "c) N + M - F × C", "d) M × N - C + F"],
    correctIndex: 3,
    answerText: "d) M × N - C + F",
    solution: "M × N = M is father of N. N - C = N is sister of C. C + F = C is brother of F. Hence C is male, child of M. Thus C is son of M.",
  },
  {
    id: 3,
    question: "3. Pointing to a man, a woman said, 'His mother is the only daughter of my mother.' How is the woman related to the man?",
    options: ["a) Mother", "b) Sister", "c) Daughter", "d) Grandmother"],
    correctIndex: 0,
    answerText: "a) Mother",
    solution: "Woman's mother's only daughter is the woman herself. So the man's mother is the woman. Thus, the woman is his mother.",
  },
];

export const SEATING_ARRANGEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. A, B, C, D, E, F and G are sitting in a straight line facing North. E sits 4th to the right of G. C is an immediate neighbor of E and D. F sits 3rd to the left of C. Who is sitting at the extreme right end?",
    options: ["a) E", "b) C", "c) D", "d) B"],
    correctIndex: 3,
    answerText: "d) B",
    solution: "Arrangement from Left to Right: G, A, F, E, C, D, B. B sits at the extreme right end.",
  },
  {
    id: 2,
    question: "2. Five friends P, Q, R, S, and T are sitting in a circle facing the center. R is sitting to the immediate left of S. T is sitting between P and S. Who is sitting to the immediate right of R?",
    options: ["a) Q", "b) P", "c) S", "d) T"],
    correctIndex: 0,
    answerText: "a) Q",
    solution: "Circle clockwise from P: P, T, S, R, Q. To the immediate right of R is Q.",
  },
];

export const CODING_DECODING_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. In a certain code language, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in that same code?",
    options: ["a) EOJDJEFM", "b) EOJDEJFM", "c) MFEJDJOE", "d) EJOJEFDM"],
    correctIndex: 0,
    answerText: "a) EOJDJEFM",
    solution: "Reverse the letters of COMPUTER → RETUPMOC, then add +1 to middle letters except first & last. Reverse MEDICINE → ENICIDEM → E (N+1=O) (I+1=J) (C+1=D) (I+1=J) (D+1=E) (E+1=F) M = EOJDJEFM.",
  },
  {
    id: 2,
    question: "2. If 'LIGHT' is coded as 'MJHIU', how is 'FLAME' coded?",
    options: ["a) GMBNF", "b) GMBND", "c) GNCNE", "d) GLBNF"],
    correctIndex: 0,
    answerText: "a) GMBNF",
    solution: "Each letter is shifted by +1 (L→M, I→J, G→H, H→I, T→U). F→G, L→M, A→B, M→N, E→F = GMBNF.",
  },
];

export const SYLLOGISMS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Statements: All cats are dogs. All dogs are birds. Conclusions: I. All cats are birds. II. Some birds are cats.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Both I and II follow",
    solution: "All Cats ⊂ Dogs ⊂ Birds. Therefore, All Cats are Birds (I holds) and Some Birds are Cats (II holds). Both follow.",
  },
  {
    id: 2,
    question: "2. Statements: Some books are pens. No pen is a pencil. Conclusions: I. Some books are not pencils. II. Some pens are books.",
    options: ["a) Only I follows", "b) Only II follows", "c) Both I and II follow", "d) Neither follows"],
    correctIndex: 2,
    answerText: "c) Both I and II follow",
    solution: "Books that are pens cannot be pencils, so Some books are not pencils (I holds). Some pens are books is the converse of Some books are pens (II holds). Both follow.",
  },
];

export const PUZZLES_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Four people A, B, C, D have four different professions: Doctor, Engineer, Lawyer, Teacher. A is neither a Doctor nor a Lawyer. B is an Engineer. C is not a Doctor. Who is the Doctor?",
    options: ["a) A", "b) B", "c) C", "d) D"],
    correctIndex: 3,
    answerText: "d) D",
    solution: "B = Engineer. A cannot be Doctor/Lawyer, so A = Teacher. C is not Doctor, so C = Lawyer. Therefore, D must be the Doctor.",
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
    correctIndex: 1,
    answerText: "b) Neither of the candidates has submitted his resume.",
    solution: "'Neither' takes a singular verb ('has') and singular pronoun ('his'). Option b is grammatically correct.",
  },
  {
    id: 2,
    question: "2. Choose the correct preposition: 'She has been working here _____ 2018.'",
    options: ["a) for", "b) since", "c) from", "d) in"],
    correctIndex: 1,
    answerText: "b) since",
    solution: "'Since' denotes a specific starting point in time (2018). 'For' denotes a duration.",
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
    correctIndex: 1,
    answerText: "b) Providing personalized learning experiences",
    solution: "The passage explicitly states that AI is revolutionizing education by 'providing personalized learning experiences'.",
  },
];

export const VOCABULARY_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Select the synonym of 'EPHEMERAL':",
    options: ["a) Eternal", "b) Transient", "c) Substantial", "d) Permanent"],
    correctIndex: 1,
    answerText: "b) Transient",
    solution: "'Ephemeral' means lasting for a very short time (transient / short-lived).",
  },
  {
    id: 2,
    question: "2. Select the antonym of 'METICULOUS':",
    options: ["a) Careless", "b) Thorough", "c) Precise", "d) Diligent"],
    correctIndex: 0,
    answerText: "a) Careless",
    solution: "'Meticulous' means showing great attention to detail. The opposite is 'Careless'.",
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
    correctIndex: 1,
    answerText: "b) are never satisfied",
    solution: "The relative pronoun 'who' refers to the plural antecedent 'men', so the verb must be plural: 'are never satisfied'.",
  },
];

export const QUANTITATIVE_APTITUDE_MAP: Record<string, PlacementQuestion[]> = {
  // Quantitative Aptitude
  "Percentages": PERCENTAGES_QUESTIONS,
  "Profit & Loss": PROFIT_LOSS_QUESTIONS,
  "Time & Work": TIME_WORK_QUESTIONS,
  "Time, Speed & Distance": TIME_SPEED_DISTANCE_QUESTIONS,
  "Probability": PROBABILITY_QUESTIONS,
  "Permutations & Combinations": PERMUTATIONS_COMBINATIONS_QUESTIONS,

  // Logical Reasoning
  "Blood Relations": BLOOD_RELATIONS_QUESTIONS,
  "Seating Arrangement": SEATING_ARRANGEMENT_QUESTIONS,
  "Coding-Decoding": CODING_DECODING_QUESTIONS,
  "Syllogisms": SYLLOGISMS_QUESTIONS,
  "Puzzles": PUZZLES_QUESTIONS,

  // Verbal Ability
  "Grammar": GRAMMAR_QUESTIONS,
  "Reading Comprehension": READING_COMPREHENSION_QUESTIONS,
  "Vocabulary": VOCABULARY_QUESTIONS,
  "Sentence Correction": SENTENCE_CORRECTION_QUESTIONS,
};

