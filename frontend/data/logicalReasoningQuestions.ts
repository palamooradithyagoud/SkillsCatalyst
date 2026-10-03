// SkillsCatalyst - Logical Reasoning Question Bank (Static Offline Fallback)
import { PlacementQuestion } from "./aptitudeQuestions";

export const NUMBER_SERIES_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?",
    options: ["a) (1/3)", "b) (1/8)", "c) (2/8)", "d) (1/16)"],
    correctIndex: 1,
    answerText: "b) (1/8)",
    solution: "Explanation: This is a simple division series; each number is one-half of the previous number. In other terms to say, the number is divided by 2 successively to get the next result. 4/2 = 2 2/2 = 1 1/2 = 1/2 (1/2)/2 = 1/4 (1/4)/2 = 1/8 and so on."
  },
  {
    id: 2,
    question: "2. Look at this series: 7, 10, 8, 11, 9, 12, ... What number should come next?",
    options: ["a) 7", "b) 10", "c) 12", "d) 13"],
    correctIndex: 1,
    answerText: "b) 10",
    solution: "Explanation: This is a simple alternating addition and subtraction series. In the first pattern, 3 is added; in the second, 2 is subtracted."
  },
  {
    id: 3,
    question: "3. Look at this series: 36, 34, 30, 28, 24, ... What number should come next?",
    options: ["a) 20", "b) 22", "c) 23", "d) 26"],
    correctIndex: 1,
    answerText: "b) 22",
    solution: "Explanation: This is an alternating number subtraction series. First, 2 is subtracted, then 4, then 2, and so on."
  },
  {
    id: 4,
    question: "4. Look at this series: 22, 21, 23, 22, 24, 23, ... What number should come next?",
    options: ["a) 22", "b) 24", "c) 25", "d) 26"],
    correctIndex: 2,
    answerText: "c) 25",
    solution: "Explanation: In this simple alternating subtraction and addition series; 1 is subtracted, then 2 is added, and so on."
  },
  {
    id: 5,
    question: "5. Look at this series: 53, 53, 40, 40, 27, 27, ... What number should come next?",
    options: ["a) 12", "b) 14", "c) 27", "d) 53"],
    correctIndex: 1,
    answerText: "b) 14",
    solution: "Explanation: In this series, each number is repeated, then 13 is subtracted to arrive at the next number."
  },
  {
    id: 6,
    question: "6. Look at this series: 21, 9, 21, 11, 21, 13, 21, ... What number should come next?",
    options: ["a) 14", "b) 15", "c) 21", "d) 23"],
    correctIndex: 1,
    answerText: "b) 15",
    solution: "Explanation: In this alternating repetition series, the random number 21 is interpolated every other number into an otherwise simple addition series that increases by 2, beginning with the number 9."
  },
  {
    id: 7,
    question: "7. Look at this series: 58, 52, 46, 40, 34, ... What number should come next?",
    options: ["a) 26", "b) 28", "c) 30", "d) 32"],
    correctIndex: 1,
    answerText: "b) 28",
    solution: "Explanation: This is a simple subtraction series. Each number is 6 less than the previous number."
  },
  {
    id: 8,
    question: "8. Look at this series: 3, 4, 7, 8, 11, 12, ... What number should come next?",
    options: ["a) 7", "b) 10", "c) 14", "d) 15"],
    correctIndex: 3,
    answerText: "d) 15",
    solution: "Explanation: This alternating addition series begins with 3; then 1 is added to give 4; then 3 is added to give 7; then 1 is added, and so on."
  },
  {
    id: 9,
    question: "9. Look at this series: 8, 22, 8, 28, 8, ... What number should come next?",
    options: ["a) 9", "b) 29", "c) 32", "d) 34"],
    correctIndex: 3,
    answerText: "d) 34",
    solution: "Explanation: This is a simple addition series with a random number, 8, interpolated as every other number. In the series, 6 is added to each number except 8, to arrive at the next number."
  },
  {
    id: 10,
    question: "10. Look at this series: 31, 29, 24, 22, 17, ... What number should come next?",
    options: ["a) 15", "b) 14", "c) 13", "d) 12"],
    correctIndex: 0,
    answerText: "a) 15",
    solution: "Explanation: This is a simple alternating subtraction series, which subtracts 2, then 5."
  },
  {
    id: 11,
    question: "11. Look at this series: 1.5, 2.3, 3.1, 3.9, ... What number should come next?",
    options: ["a) 4.2", "b) 4.4", "c) 4.7", "d) 5.1"],
    correctIndex: 2,
    answerText: "c) 4.7",
    solution: "Explanation: In this simple addition series, each number increases by 0.8."
  },
  {
    id: 12,
    question: "12. Look at this series: 14, 28, 20, 40, 32, 64, ... What number should come next?",
    options: ["a) 52", "b) 56", "c) 96", "d) 128"],
    correctIndex: 1,
    answerText: "b) 56",
    solution: "Explanation: This is an alternating multiplication and subtracting series: First, multiply by 2 and then subtract 8."
  },
  {
    id: 13,
    question: "13. Look at this series: 2, 4, 6, 8, 10, ... What number should come next?",
    options: ["a) 11", "b) 12", "c) 13", "d) 14"],
    correctIndex: 1,
    answerText: "b) 12",
    solution: "Explanation: This is a simple addition series. Each number increases by 2."
  },
  {
    id: 14,
    question: "14. Look at this series: 201, 202, 204, 207, ... What number should come next?",
    options: ["a) 205", "b) 208", "c) 210", "d) 211"],
    correctIndex: 3,
    answerText: "d) 211",
    solution: "Explanation: In this addition series, 1 is added to the first number; 2 is added to the second number; 3 is added to the third number; 4 is added to the fourth number; and go on."
  },
  {
    id: 15,
    question: "15. Look at this series: 544, 509, 474, 439, ... What number should come next?",
    options: ["a) 404", "b) 414", "c) 420", "d) 445"],
    correctIndex: 0,
    answerText: "a) 404",
    solution: "Explanation: This is a simple subtraction series. Each number is 35 less than the previous number."
  },
  {
    id: 16,
    question: "16. Look at this series: 80, 10, 70, 15, 60, ... What number should come next?",
    options: ["a) 20", "b) 25", "c) 30", "d) 50"],
    correctIndex: 0,
    answerText: "a) 20",
    solution: "Explanation: This is an alternating addition and subtraction series. In the first pattern, 10 is subtracted from each number to arrive at the next. In the second, 5 is added to each number to arrive at the next."
  },
  {
    id: 17,
    question: "17. Look at this series: 2, 6, 18, 54, ... What number should come next?",
    options: ["a) 108", "b) 148", "c) 162", "d) 216"],
    correctIndex: 2,
    answerText: "c) 162",
    solution: "Explanation: This is a simple multiplication series. Each number is 3 times more than the previous number."
  },
  {
    id: 18,
    question: "18. Look at this series: 5.2, 4.8, 4.4, 4, ... What number should come next?",
    options: ["a) 3", "b) 3.3", "c) 3.5", "d) 3.6"],
    correctIndex: 3,
    answerText: "d) 3.6",
    solution: "Explanation: In this simple subtraction series, each number decreases by 0.4."
  },
  {
    id: 19,
    question: "19. Look at this series: 8, 6, 9, 23, 87 , ... What number should come next?",
    options: ["a) 128", "b) 226", "c) 324", "d) 429"],
    correctIndex: 3,
    answerText: "d) 429",
    solution: "Explanation: 8 x 1 - 2 = 6 6 x 2 - 3 = 9 9 x 3 - 4 = 23 23 x 4 - 5 = 87 87 x 5 - 6 = 429 ..."
  },
  {
    id: 20,
    question: "20. 28 25 5 21 18 5 14",
    options: ["a) 11 5", "b) 10 7", "c) 11 8", "d) 5 10", "e) 10 5"],
    correctIndex: 0,
    answerText: "a) 11 5",
    solution: "Explanation: This is an alternating subtraction series with the interpolation of a random number, 5, as every third number. In the subtraction series, 3 is subtracted, then 4, then 3, and so on."
  },
  {
    id: 21,
    question: "21. 8 11 21 15 18 21 22",
    options: ["a) 25 18", "b) 25 21", "c) 25 29", "d) 24 21", "e) 22 26"],
    correctIndex: 1,
    answerText: "b) 25 21",
    solution: "Explanation: This is an alternating addition series, with a random number, 21, interpolated as every third number. The addition series alternates between adding 3 and adding 4. The number 21 appears after each number arrived at by adding 3."
  },
  {
    id: 22,
    question: "22. 9 16 23 30 37 44 51",
    options: ["a) 59 66", "b) 56 62", "c) 58 66", "d) 58 65", "e) 54 61"],
    correctIndex: 3,
    answerText: "d) 58 65",
    solution: "Explanation: Here is a simple addition series, which begins with 9 and adds 7."
  },
  {
    id: 23,
    question: "23. 2 8 14 20 26 32 38",
    options: ["a) 2 46", "b) 44 50", "c) 42 48", "d) 40 42", "e) 32 26"],
    correctIndex: 1,
    answerText: "b) 44 50",
    solution: "Explanation: This is a simple addition series, which begins with 2 and adds 6."
  },
  {
    id: 24,
    question: "24. 9 11 33 13 15 33 17",
    options: ["a) 19 33", "b) 33 35", "c) 33 19", "d) 15 33", "e) 19 21"],
    correctIndex: 0,
    answerText: "a) 19 33",
    solution: "Explanation: In this alternating repetition series, a random number, 33, is interpolated every third number into a simple addition series, in which each number increases by 2."
  },
  {
    id: 25,
    question: "25. 2 3 4 5 6 4 8",
    options: ["a) 9 10", "b) 4 8", "c) 10 4", "d) 9 4", "e) 8 9"],
    correctIndex: 3,
    answerText: "d) 9 4",
    solution: "Explanation: This is an alternating addition series with a random number, 4, interpolated as every third number. In the main series, 1 is added, then 2 is added, then 1, then 2, and so on."
  },
  {
    id: 26,
    question: "26. 17 17 34 20 20 31 23",
    options: ["a) 26 23", "b) 34 20", "c) 23 33", "d) 27 28", "e) 23 28"],
    correctIndex: 4,
    answerText: "e) 23 28",
    solution: "Explanation: This is an alternating subtraction series with repetition. There are two different patterns here. In the first, a number repeats itself; then 3 is added to that number to arrive at the next number, which also repeats. This gives the series 17, 17, 20, 20, 23, and so on. Every third number follows a second pattern, in which 3 is subtracted from each number to arrive at the next: 34, 31, 28."
  },
  {
    id: 27,
    question: "27. 6 20 8 14 10 8 12",
    options: ["a) 14 10", "b) 2 18", "c) 4 12", "d) 2 14", "e) 14 14"],
    correctIndex: 3,
    answerText: "d) 2 14",
    solution: "Explanation: This is an alternating addition and subtraction series. In the first pattern, 2 is added to each number to arrive at the next; in the alternate pattern, 6 is subtracted from each number to arrive at the next."
  },
  {
    id: 28,
    question: "28. 21 25 18 29 33 18",
    options: ["a) 43 18", "b) 41 44", "c) 37 18", "d) 37 41", "e) 38 41"],
    correctIndex: 3,
    answerText: "d) 37 41",
    solution: "Explanation: This is a simple addition series with a random number, 18, interpolated as every third number. In the series, 4 is added to each number except 18, to arrive at the next number."
  },
  {
    id: 29,
    question: "29. 75 65 85 55 45 85 35",
    options: ["a) 25 15", "b) 25 85", "c) 35 25", "d) 85 35", "e) 25 75"],
    correctIndex: 1,
    answerText: "b) 25 85",
    solution: "Explanation: This is a simple subtraction series in which a random number, 85, is interpolated as every third number. In the subtraction series, 10 is subtracted from each number to arrive at the next."
  },
  {
    id: 30,
    question: "30. 11 16 21 26 31 36 41",
    options: ["a) 47 52", "b) 46 52", "c) 45 49", "d) 46 51"],
    correctIndex: 3,
    answerText: "d) 46 51",
    solution: "Explanation: In this simple addition series, each number is 5 more than the previous number."
  },
  {
    id: 31,
    question: "31. 3 8 13 18 23 28 33",
    options: ["a) 39 44", "b) 38 44", "c) 38 43", "d) 37 42", "e) 33 38"],
    correctIndex: 2,
    answerText: "c) 38 43",
    solution: "Explanation: In this simple addition series, each number is 5 greater than the previous number."
  },
  {
    id: 32,
    question: "32. 84 78 72 66 60 54 48",
    options: ["a) 44 34", "b) 42 36", "c) 42 32", "d) 40 34", "e) 38 32"],
    correctIndex: 1,
    answerText: "b) 42 36",
    solution: "Explanation: In this simple subtraction series, each number is 6 less than the previous number."
  },
  {
    id: 33,
    question: "33. 20 20 17 17 14 14 11",
    options: ["a) 8 8", "b) 11 11", "c) 11 14", "d) 8 9", "e) 11 8"],
    correctIndex: 4,
    answerText: "e) 11 8",
    solution: "Explanation: This is a simple subtraction with repetition series. It begins with 20, which is repeated, then 3 is subtracted, resulting in 17, which is repeated, and so on."
  },
  {
    id: 34,
    question: "34. 61 57 50 61 43 36 61",
    options: ["a) 29 61", "b) 27 20", "c) 31 61", "d) 22 15", "e) 29 22"],
    correctIndex: 4,
    answerText: "e) 29 22",
    solution: "Explanation: This is an alternating repetition series, in which a random number, 61, is interpolated as every third number into an otherwise simple subtraction series. Starting with the second number, 57, each number (except 61) is 7 less than the previous number."
  },
  {
    id: 35,
    question: "35. 9 12 11 14 13 16 15",
    options: ["a) 14 13", "b) 18 21", "c) 14 17", "d) 12 13", "e) 18 17"],
    correctIndex: 4,
    answerText: "e) 18 17",
    solution: "Explanation: This is a simple alternating addition and subtraction series. First, 3 is added, then 1 is subtracted, then 3 is added, 1 subtracted, and so on."
  },
  {
    id: 36,
    question: "36. 4 8 22 12 16 22 20 24",
    options: ["a) 28 32", "b) 28 22", "c) 22 28", "d) 32 36", "e) 22 26"],
    correctIndex: 2,
    answerText: "c) 22 28",
    solution: "Explanation: This is an alternating repetition series, with a random number, 22, interpolated as every third number into an otherwise simple addition series. In the addition series, 4 is added to each number to arrive at the next number."
  },
  {
    id: 37,
    question: "37. 40 40 31 31 22 22 13",
    options: ["a) 13 4", "b) 13 5", "c) 4 13", "d) 9 4", "e) 4 4"],
    correctIndex: 0,
    answerText: "a) 13 4",
    solution: "Explanation: This is a subtraction series with repetition. Each number repeats itself and then decreases by 9."
  },
  {
    id: 38,
    question: "38. 1 10 7 20 13 30 19",
    options: ["a) 26 40", "b) 29 36", "c) 40 25", "d) 25 31", "e) 40 50"],
    correctIndex: 2,
    answerText: "c) 40 25",
    solution: "Explanation: Here, every other number follows a different pattern. In the first series, 6 is added to each number to arrive at the next. In the second series, 10 is added to each number to arrive at the next."
  },
  {
    id: 39,
    question: "39. 10 20 25 35 40 50 55",
    options: ["a) 70 65", "b) 60 70", "c) 60 75", "d) 60 65", "e) 65 70"],
    correctIndex: 4,
    answerText: "e) 65 70",
    solution: "Explanation: This is an alternating addition series, in which 10 is added, then 5, then 10, and so on."
  },
  {
    id: 40,
    question: "40. 42 40 38 35 33 31 28",
    options: ["a) 25 22", "b) 26 23", "c) 26 24", "d) 25 23", "e) 26 22"],
    correctIndex: 2,
    answerText: "c) 26 24",
    solution: "Explanation: This is an alternating subtraction series in which 2 is subtracted twice, then 3 is subtracted once, then 2 is subtracted twice, and so on."
  },
  {
    id: 41,
    question: "41. 6 10 14 18 22 26 30",
    options: ["a) 36 40", "b) 33 37", "c) 38 42", "d) 34 36", "e) 34 38"],
    correctIndex: 4,
    answerText: "e) 34 38",
    solution: "Explanation: This simple addition series adds 4 to each number to arrive at the next."
  },
  {
    id: 42,
    question: "42. 8 12 9 13 10 14 11",
    options: ["a) 14 11", "b) 15 12", "c) 8 15", "d) 15 19", "e) 8 5"],
    correctIndex: 1,
    answerText: "b) 15 12",
    solution: "Explanation: This is an alternating addition and subtraction series, in which the addition of 4 is alternated with the subtraction of 3."
  },
  {
    id: 43,
    question: "43. 36 31 29 24 22 17 15",
    options: ["a) 13 11", "b) 10 5", "c) 13 8", "d) 12 7", "e) 10 8"],
    correctIndex: 4,
    answerText: "e) 10 8",
    solution: "Explanation: This is an alternating subtraction series, which subtracts 5, then 2, then 5, and so on."
  },
  {
    id: 44,
    question: "44. 3 5 35 10 12 35 17",
    options: ["a) 22 35", "b) 35 19", "c) 19 35", "d) 19 24", "e) 22 24"],
    correctIndex: 2,
    answerText: "c) 19 35",
    solution: "Explanation: This is an alternating addition series, with a random number, 35, interpolated as every third number. The pattern of addition is to add 2, add 5, add 2, and so on. The number 35 comes after each \"add 2\" step/"
  },
  {
    id: 45,
    question: "45. 13 29 15 26 17 23 19",
    options: ["a) 21 23", "b) 20 21", "c) 20 17", "d) 25 27", "e) 22 20"],
    correctIndex: 1,
    answerText: "b) 20 21",
    solution: "Explanation: Here, there are two alternating patterns, with every other number following a different pattern. The first pattern begins with 13 and adds 2 to each number to arrive at the next; the alternating pattern begins with 29 and subtracts 3 each time."
  },
  {
    id: 46,
    question: "46. 14 14 26 26 38 38 50",
    options: ["a) 60 72", "b) 50 62", "c) 50 72", "d) 62 62", "e) 62 80"],
    correctIndex: 1,
    answerText: "b) 50 62",
    solution: "Explanation: In this simple addition with repetition series, each number in the series repeats itself, and then increases by 12 to arrive at the next number."
  },
  {
    id: 47,
    question: "47. 44 41 38 35 32 29 26",
    options: ["a) 24 21", "b) 22 19", "c) 23 19", "d) 29 32", "e) 23 20"],
    correctIndex: 4,
    answerText: "e) 23 20",
    solution: "Explanation: This is a simple subtraction series, in which 3 is subtracted from each number to arrive at the next."
  },
  {
    id: 48,
    question: "48. 34 30 26 22 18 14 10",
    options: ["a) 8 6", "b) 6 4", "c) 14 18", "d) 6 2", "e) 4 0"],
    correctIndex: 3,
    answerText: "d) 6 2",
    solution: "Explanation: This is a simple subtraction series, in which 4 is subtracted from each number to arrive at the next."
  },
  {
    id: 49,
    question: "49. 32 31 32 29 32 27 32",
    options: ["a) 25 32", "b) 31 32", "c) 29 32", "d) 25 30", "e) 29 30"],
    correctIndex: 0,
    answerText: "a) 25 32",
    solution: "Explanation: This is an alternating repetition series. The number 32 alternates with a series in which each number decreases by 2."
  },
  {
    id: 50,
    question: "50. 7 9 66 12 14 66 17",
    options: ["a) 19 66", "b) 66 19", "c) 19 22", "d) 20 66", "e) 66 20"],
    correctIndex: 0,
    answerText: "a) 19 66",
    solution: "Explanation: This is an alternating addition series with repetition, in which a random number, 66, is interpolated as every third number. The regular series adds 2, then 3, then 2, and so on, with 66 repeated after each \"add 2\" step."
  },
  {
    id: 51,
    question: "51. 3 8 10 15 17 22 24",
    options: ["a) 26 28", "b) 29 34", "c) 29 31", "d) 26 31", "e) 26 32"],
    correctIndex: 2,
    answerText: "c) 29 31",
    solution: "Explanation: This is an alternating addition series that adds 5, then 2, then 5, and so on."
  },
  {
    id: 52,
    question: "52. 4 7 26 10 13 20 16",
    options: ["a) 14 4", "b) 14 17", "c) 18 14", "d) 19 13", "e) 19 14"],
    correctIndex: 4,
    answerText: "e) 19 14",
    solution: "Explanation: Two patterns alternate here, with every third number following the alternate pattern. In the main series, beginning with 4, 3 is added to each number to arrive at the next. In the alternating series, beginning with 26, 6 is subtracted from each number to arrive at the next."
  },
  {
    id: 53,
    question: "53. 32 29 26 23 20 17 14",
    options: ["a) 11 8", "b) 12 8", "c) 11 7", "d) 32 29", "e) 10 9"],
    correctIndex: 0,
    answerText: "a) 11 8",
    solution: "Explanation: In this simple subtraction series, the numbers decrease by 3."
  },
  {
    id: 54,
    question: "54. 16 26 56 36 46 68 56",
    options: ["a) 80 66", "b) 64 82", "c) 66 80", "d) 78 68", "e) 66 82"],
    correctIndex: 2,
    answerText: "c) 66 80",
    solution: "Explanation: Here, every third number follows a different pattern from the main series. In the main series, beginning with 16, 10 is added to each number to arrive at the next. In the alternating series, beginning with 56, 12 is added to each number to arrive at the next."
  },
  {
    id: 55,
    question: "55. 2 44 4 41 6 38 8",
    options: ["a) 10 12", "b) 35 32", "c) 34 9", "d) 35 10", "e) 10 52"],
    correctIndex: 3,
    answerText: "d) 35 10",
    solution: "Explanation: Here, there are two alternating patterns, one addition and one subtraction. The first starts with 2 and increases by 2; the second starts with 44 and decreases by 3."
  },
  {
    id: 56,
    question: "56. 17 32 19 29 21 26 23",
    options: ["a) 25 25", "b) 20 22", "c) 23 25", "d) 25 22", "e) 27 32"],
    correctIndex: 2,
    answerText: "c) 23 25",
    solution: "Explanation: Here, there are two alternating patterns. The first begins with 17 and adds 2; the second begins with 32 and subtracts 3."
  },
  {
    id: 57,
    question: "57. 17 14 14 11 11 8 8",
    options: ["a) 8 5", "b) 5 2", "c) 8 2", "d) 5 5", "e) 5 8"],
    correctIndex: 3,
    answerText: "d) 5 5",
    solution: "Explanation: In this simple subtraction with repetition series, each number is repeated, then 3 is subtracted to give the next number, which is then repeated, and so on."
  },
  {
    id: 58,
    question: "58. 10 34 12 31 14 28 16",
    options: ["a) 25 18", "b) 30 13", "c) 19 26", "d) 18 20", "e) 25 22"],
    correctIndex: 0,
    answerText: "a) 25 18",
    solution: "Explanation: Two patterns alternate here. The first pattern begins with 10 and adds 2 to each number to arrive at the next; the alternating pattern begins with 34 and subtracts 3 each time."
  },
  {
    id: 59,
    question: "59. 11 14 14 17 17 20 20",
    options: ["a) 23 23", "b) 23 26", "c) 21 24", "d) 24 24", "e) 24 27"],
    correctIndex: 0,
    answerText: "a) 23 23",
    solution: "Explanation: This is a simple addition series with repetition. It adds 3 to each number to arrive at the next, which is repeated before 3 is added again."
  },
  {
    id: 60,
    question: "60. Look at this series: F2, __, D8, C16, B32, ... What number should fill the blank?",
    options: ["a) A16", "b) G4", "c) E4", "d) E3"],
    correctIndex: 2,
    answerText: "c) E4",
    solution: "Explanation: The letters decrease by 1; the numbers are multiplied by 2."
  },
  {
    id: 61,
    question: "61. Look at this series: 664, 332, 340, 170, ____, 89, ... What number should fill the blank?",
    options: ["a) 85", "b) 97", "c) 109", "d) 178"],
    correctIndex: 3,
    answerText: "d) 178",
    solution: "Explanation: This is an alternating division and addition series: First, divide by 2, and then add 8."
  },
  {
    id: 62,
    question: "62. Look at this series: V, VIII, XI, XIV, __, XX, ... What number should fill the blank?",
    options: ["a) IX", "b) XXIII", "c) XV", "d) XVII"],
    correctIndex: 3,
    answerText: "d) XVII",
    solution: "Explanation: This is a simple addition series; each number is 3 more than the previous number."
  },
  {
    id: 63,
    question: "63. Look at this series: 70, 71, 76, __, 81, 86, 70, 91, ... What number should fill the blank?",
    options: ["a) 70", "b) 71", "c) 80", "d) 96"],
    correctIndex: 0,
    answerText: "a) 70",
    solution: "Explanation: In this series, 5 is added to the previous number; the number 70 is inserted as every third number."
  },
  {
    id: 64,
    question: "64. Look at this series: 8, 43, 11, 41, __, 39, 17, ... What number should fill in the blank?",
    options: ["a) 8", "b) 14", "c) 43", "d) 44"],
    correctIndex: 1,
    answerText: "b) 14",
    solution: "Explanation: This is a simple alternating addition and subtraction series. The first series begins with 8 and adds 3; the second begins with 43 and subtracts 2."
  },
  {
    id: 65,
    question: "65. Look at this series: VI, 10, V, 11, __, 12, III, ... What number should fill the blank?",
    options: ["a) II", "b) IV", "c) IX", "d) 14"],
    correctIndex: 1,
    answerText: "b) IV",
    solution: "Explanation: This is an alternating addition and subtraction series. Roman numbers alternate with Arabic numbers. In the Roman numeral pattern, each number decreases by 1. In the Arabic numeral pattern, each number increases by 1."
  },
  {
    id: 66,
    question: "66. Look at this series: (1/9), (1/3), 1, ____ , 9, ... What number should fill the blank?",
    options: ["a) (2/3)", "b) 3", "c) 6", "d) 27"],
    correctIndex: 1,
    answerText: "b) 3",
    solution: "Explanation: This is a multiplication series; each number is 3 times the previous number."
  },
  {
    id: 67,
    question: "67. Look at this series: 83, 73, 93, 63, __, 93, 43, ... What number should fill the blank?",
    options: ["a) 33", "b) 53", "c) 73", "d) 93"],
    correctIndex: 1,
    answerText: "b) 53",
    solution: "Explanation: This is a simple subtraction series in which a random number, 93, is interpolated as every third number. In the subtraction series, 10 is subtracted from each number to arrive at the next."
  },
  {
    id: 68,
    question: "68. Look at this series: 15, __, 27, 27, 39, 39, ... What number should fill the blank?",
    options: ["a) 51", "b) 39", "c) 23", "d) 15"],
    correctIndex: 3,
    answerText: "d) 15",
    solution: "Explanation: In this simple addition with repetition series, each number in the series repeats itself, and then increases by 12 to arrive at the next number."
  },
  {
    id: 69,
    question: "69. Look at this series: 72, 76, 73, 77, 74, __, 75, ... What number should fill the blank?",
    options: ["a) 70", "b) 71", "c) 75", "d) 78"],
    correctIndex: 3,
    answerText: "d) 78",
    solution: "Explanation: This series alternates the addition of 4 with the subtraction of 3."
  },
  {
    id: 70,
    question: "70. Look at this series: J14, L16, __, P20, R22, ... What number should fill the blank?",
    options: ["a) S24", "b) N18", "c) M18", "d) T24"],
    correctIndex: 1,
    answerText: "b) N18",
    solution: "Explanation: In this series, the letters progress by 2, and the numbers increase by 2."
  },
  {
    id: 71,
    question: "71. Look at this series: 4, 7, 25, 10, __, 20, 16, 19, ... What number should fill the blank?",
    options: ["a) 13", "b) 15", "c) 20", "d) 28"],
    correctIndex: 0,
    answerText: "a) 13",
    solution: "Explanation: Two series alternate here, with every third number following a different pattern. In the main series, 3 is added to each number to arrive at the next. In the alternating series, 5 is subtracted from each number to arrive at the next."
  },
  {
    id: 72,
    question: "72. Look at this series: XXIV, XX, __, XII, VIII, ... What number should fill the blank?",
    options: ["a) XXII", "b) XIII", "c) XVI", "d) IV"],
    correctIndex: 2,
    answerText: "c) XVI",
    solution: "Explanation: This is a simple subtraction series; each number is 4 less than the previous number."
  },
  {
    id: 73,
    question: "73. Look at this series: 0.15, 0.3, ____, 1.2, 2.4, ... What number should fill the blank?",
    options: ["a) 4.8", "b) 0.006", "c) 0.6", "d) 0.9"],
    correctIndex: 2,
    answerText: "c) 0.6",
    solution: "Explanation: This is a simple multiplication series. Each number is 2 times greater than the previous number."
  },
  {
    id: 74,
    question: "74. Look at this series: U32, V29, __, X23, Y20, ... What number should fill the blank?",
    options: ["a) W26", "b) W17", "c) Z17", "d) Z26"],
    correctIndex: 0,
    answerText: "a) W26",
    solution: "Explanation: In this series, the letters progress by 1; the numbers decrease by 3."
  },
];

export const LETTER_AND_SYMBOL_SERIES_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. SCD, TEF, UGH, ____, WKL",
    options: ["a) CMN", "b) UJI", "c) VIJ", "d) IJT"],
    correctIndex: 2,
    answerText: "c) VIJ",
    solution: "Explanation: There are two alphabetical series here. The first series is with the first letters only: STUVW. The second series involves the remaining letters: CD, EF, GH, IJ, KL."
  },
  {
    id: 2,
    question: "2. B2CD, _____, BCD4, B5CD, BC6D",
    options: ["a) B2C2D", "b) BC3D", "c) B2C3D", "d) BCD7"],
    correctIndex: 1,
    answerText: "b) BC3D",
    solution: "Explanation: Because the letters are the same, concentrate on the number series, which is a simple 2, 3, 4, 5, 6 series, and follows each letter in order."
  },
  {
    id: 3,
    question: "3. FAG, GAF, HAI, IAH, ____",
    options: ["a) JAK", "b) HAL", "c) HAK", "d) JAI"],
    correctIndex: 0,
    answerText: "a) JAK",
    solution: "Explanation: The middle letters are static, so concentrate on the first and third letters. The series involves an alphabetical order with a reversal of the letters. The first letters are in alphabetical order: F, G, H, I , J. The second and fourth segments are reversals of the first and third segments. The missing segment begins with a new letter."
  },
  {
    id: 4,
    question: "4. ELFA, GLHA, ILJA, _____, MLNA",
    options: ["a) OLPA", "b) KLMA", "c) LLMA", "d) KLLA"],
    correctIndex: 3,
    answerText: "d) KLLA",
    solution: "Explanation: The second and forth letters in the series, L and A, are static. The first and third letters consist of an alphabetical order beginning with the letter E."
  },
  {
    id: 5,
    question: "5. CMM, EOO, GQQ, _____, KUU",
    options: ["a) GRR", "b) GSS", "c) ISS", "d) ITT"],
    correctIndex: 2,
    answerText: "c) ISS",
    solution: "Explanation: The first letters are in alphabetical order with a letter skipped in between each segment: C, E, G, I, K. The second and third letters are repeated; they are also in order with a skipped letter: M, O, Q, S, U."
  },
  {
    id: 6,
    question: "6. ZA5, Y4B, XC6, W3D, _____",
    options: ["a) E7V", "b) V2E", "c) VE5", "d) VE7"],
    correctIndex: 3,
    answerText: "d) VE7",
    solution: "Explanation: There are three series to look for here. The first letters are alphabetical in reverse: Z, Y, X, W, V. The second letters are in alphabetical order, beginning with A. The number series is as follows: 5, 4, 6, 3, 7."
  },
  {
    id: 7,
    question: "7. QPO, NML, KJI, _____, EDC",
    options: ["a) HGF", "b) CAB", "c) JKL", "d) GHI"],
    correctIndex: 0,
    answerText: "a) HGF",
    solution: "Explanation: This series consists of letters in a reverse alphabetical order."
  },
  {
    id: 8,
    question: "8. JAK, KBL, LCM, MDN, _____",
    options: ["a) OEP", "b) NEO", "c) MEN", "d) PFQ"],
    correctIndex: 1,
    answerText: "b) NEO",
    solution: "Explanation: This is an alternating series in alphabetical order. The middle letters follow the order ABCDE. The first and third letters are alphabetical beginning with J. The third letter is repeated as a first letter in each subsequent three-letter segment."
  },
  {
    id: 9,
    question: "9. BCB, DED, FGF, HIH, ___",
    options: ["a) JKJ", "b) HJH", "c) IJI", "d) JHJ"],
    correctIndex: 0,
    answerText: "a) JKJ",
    solution: "Explanation: This series consists of a simple alphabetical order with the first two letters of all segments: B, C, D, E, F, G, H, I, J, K. The third letter of each segment is a repetition of the first letter."
  },
  {
    id: 10,
    question: "10. P5QR, P4QS, P3QT, _____, P1QV",
    options: ["a) PQW", "b) PQV2", "c) P2QU", "d) PQ3U"],
    correctIndex: 2,
    answerText: "c) P2QU",
    solution: "Explanation: The first two letters, PQ, are static. The third letter is in alphabetical order, beginning with R. The number series is in descending order beginning with 5."
  },
  {
    id: 11,
    question: "11. QAR, RAS, SAT, TAU, _____",
    options: ["a) UAV", "b) UAT", "c) TAS", "d) TAT"],
    correctIndex: 0,
    answerText: "a) UAV",
    solution: "Explanation: In this series, the third letter is repeated as the first letter of the next segment. The middle letter, A, remains static. The third letters are in alphabetical order, beginning with R."
  },
  {
    id: 12,
    question: "12. DEF, DEF2, DE2F2, _____, D2E2F3",
    options: ["a) DEF3", "b) D3EF3", "c) D2E3F", "d) D2E2F2"],
    correctIndex: 3,
    answerText: "d) D2E2F2",
    solution: "Explanation: In this series, the letters remain the same: DEF. The subscript numbers follow this series: 111, 112, 122, 222, 223, 233, 333, ..."
  },
  {
    id: 13,
    question: "13. Look at the pattern: In the first segment, the letter 'E' faces right, then down, then right. In the second segment, all letters face down. Following this alternating pattern, what direction must the letters face in the fourth segment?",
    options: ["a) Faces right", "b) Faces down", "c) Faces up", "d) Faces left"],
    correctIndex: 2,
    answerText: "c) Faces up",
    solution: "Explanation: This is an alternating series. In the first segment, the letter \"E\" faces right, then down, then right. In the second segment, the letters all face down. To follow this pattern, in the fourth segment, the letters must all face up."
  },
  {
    id: 14,
    question: "14. Look for the rule of opposites in this series of figures: The first and second segments are opposites of each other. The same applies for the third and fourth segments. Which figure correctly completes the pattern?",
    options: ["a) Identical figure", "b) Rotated 90 degrees", "c) Inverted shape", "d) Opposite figure"],
    correctIndex: 3,
    answerText: "d) Opposite figure",
    solution: "Explanation: Look for opposites in this series of figures. The first and second segments are opposites of each other. The same is true for the third and fourth segments."
  },
  {
    id: 15,
    question: "15. In each segment of this series, the figures alternate between one-half and one-fourth shaded. Which figure follows this shading pattern next?",
    options: ["a) Fully shaded", "b) Unshaded", "c) One-third shaded", "d) One-fourth shaded"],
    correctIndex: 3,
    answerText: "d) One-fourth shaded",
    solution: "Explanation: In each of the segments, the figures alternate between one-half and one-fourth shaded."
  },
];

export const VERBAL_CLASSIFICATION_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Which word does NOT belong with the others?",
    options: ["a) parsley", "b) basil", "c) dill", "d) mayonnaise"],
    correctIndex: 3,
    answerText: "d) mayonnaise",
    solution: "Explanation: Parsley, basil, and dill are types of herbs. Mayonnaise is not an herb."
  },
  {
    id: 2,
    question: "2. Which word does NOT belong with the others?",
    options: ["a) guitar", "b) flute", "c) violin", "d) cello"],
    correctIndex: 1,
    answerText: "b) flute",
    solution: "Explanation: The guitar, violin, and cello are stringed instruments; the flute is a wind instrument."
  },
  {
    id: 3,
    question: "3. Which word does NOT belong with the others?",
    options: ["a) tape", "b) twine", "c) cord", "d) yarn"],
    correctIndex: 0,
    answerText: "a) tape",
    solution: "Explanation: The yarn, twine, and cord are all used for tying. The tape is not used in the same way."
  },
  {
    id: 4,
    question: "4. Which word does NOT belong with the others?",
    options: ["a) book", "b) index", "c) glossary", "d) chapter"],
    correctIndex: 0,
    answerText: "a) book",
    solution: "Explanation: An index, glossary, and chapter are all parts of a book. Choice a does not belong because the book is the whole, not a part."
  },
  {
    id: 5,
    question: "5. Which word does NOT belong with the others?",
    options: ["a) wing", "b) fin", "c) beak", "d) rudder"],
    correctIndex: 2,
    answerText: "c) beak",
    solution: "Explanation: The wing, fin, and rudder are all parts of an airplane."
  },
  {
    id: 6,
    question: "6. Which word does NOT belong with the others?",
    options: ["a) acute", "b) right", "c) obtuse", "d) parallel"],
    correctIndex: 3,
    answerText: "d) parallel",
    solution: "Explanation: Acute, right, and obtuse are geometric terms describing particular angles. Parallel refers to two lines that never intersect."
  },
  {
    id: 7,
    question: "7. Which word does NOT belong with the others?",
    options: ["a) defendant", "b) prosecutor", "c) trial", "d) judge"],
    correctIndex: 2,
    answerText: "c) trial",
    solution: "Explanation: Defendant, prosecutor, and judge are all persons involved in a trial. A trial is not a person."
  },
  {
    id: 8,
    question: "8. Which word does NOT belong with the others?",
    options: ["a) area", "b) variable", "c) circumference", "d) quadrilateral"],
    correctIndex: 1,
    answerText: "b) variable",
    solution: "Explanation: Area, circumference, and quadrilateral are all terms used in the study of geometry. Variable is a term generally used in the study of algebra."
  },
];

export const ESSENTIAL_PART_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. harvest",
    options: ["a) autumn", "b) stockpile", "c) tractor", "d) crop"],
    correctIndex: 3,
    answerText: "d) crop",
    solution: "Explanation: To harvest something, one must have a crop, which is the essential element for this item. Autumn (choice a) is not the only time crops are harvested. There may not be enough of a crop to stockpile (choice b), and you can harvest crops without a tractor (choice c)."
  },
  {
    id: 2,
    question: "2. desert",
    options: ["a) cactus", "b) arid", "c) oasis", "d) flat"],
    correctIndex: 1,
    answerText: "b) arid",
    solution: "Explanation: A desert is an arid tract of land. Not all deserts are flat (choice d). Not all deserts have cacti or oases (choices a and c)."
  },
  {
    id: 3,
    question: "3. book",
    options: ["a) fiction", "b) pages", "c) pictures", "d) learning"],
    correctIndex: 1,
    answerText: "b) pages",
    solution: "Explanation: The necessary part of a book is its pages; there is no book without pages. Not all books are fiction (choice a), and not all books have pictures (choice c). Learning (choice d) may or may not take place with a book"
  },
  {
    id: 4,
    question: "4. language",
    options: ["a) tongue", "b) slang", "c) writing", "d) words"],
    correctIndex: 3,
    answerText: "d) words",
    solution: "Explanation: Words are a necessary part of language. Slang is not necessary to language (choice b). Not all languages are written (choice c). Not all languages are spoken (choice a)."
  },
  {
    id: 5,
    question: "5. school",
    options: ["a) student", "b) report card", "c) test", "d) learning"],
    correctIndex: 0,
    answerText: "a) student",
    solution: "Explanation: Without students, a school cannot exist; therefore, students are the essential part of schools. The other choices may be related, but they are not essential."
  },
  {
    id: 6,
    question: "6. pain",
    options: ["a) cut", "b) burn", "c) nuisance", "d) hurt"],
    correctIndex: 3,
    answerText: "d) hurt",
    solution: "Explanation: Pain is suffering or hurt, so choice d is the essential element. Without hurt, there is no pain. A cut (choice a) or a burn (choice b) may cause pain, but so do many other types of injury. A nuisance (choice c) is an annoyance that may or may not cause pain."
  },
  {
    id: 7,
    question: "7. gala",
    options: ["a) celebration", "b) tuxedo", "c) appetizer", "d) orator"],
    correctIndex: 0,
    answerText: "a) celebration",
    solution: "Explanation: A gala indicates a celebration, the necessary element here. A tuxedo (choice b) is not required garb at a gala, nor is an appetizer (choice c). A gala may be held without the benefit of anyone speaking (choice d)."
  },
  {
    id: 8,
    question: "8. monopoly",
    options: ["a) corrupt", "b) exclusive", "c) rich", "d) gigantic"],
    correctIndex: 1,
    answerText: "b) exclusive",
    solution: "Explanation: The essential part of a monopoly is that it involves exclusive ownership or control."
  },
  {
    id: 9,
    question: "9. guitar",
    options: ["a) band", "b) teacher", "c) songs", "d) strings"],
    correctIndex: 3,
    answerText: "d) strings",
    solution: "Explanation: A guitar does not exist without strings, so strings are an essential part of a guitar. A band is not necessary to a guitar (choice a). Guitar playing can be learned without a teacher (choice b). Songs are byproducts of a guitar (choice c)."
  },
  {
    id: 10,
    question: "10. election",
    options: ["a) president", "b) voter", "c) November", "d) nation"],
    correctIndex: 1,
    answerText: "b) voter",
    solution: "Explanation: An election does not exist without voters. The election of a president (choice a) is a byproduct. Not all elections are held in November (choice c), nor are they nationwide (choice d)."
  },
  {
    id: 11,
    question: "11. shoe",
    options: ["a) sole", "b) leather", "c) laces", "d) walking"],
    correctIndex: 0,
    answerText: "a) sole",
    solution: "Explanation: All shoes have a sole of some sort.Not all shoes are made of leather (choice b); nor do they all have laces (choice c).Walking (choice d) is not essential to a shoe."
  },
  {
    id: 12,
    question: "12. swimming",
    options: ["a) pool", "b) bathing suit", "c) water", "d) life jacket"],
    correctIndex: 2,
    answerText: "c) water",
    solution: "Explanation: Water is essential for swimming-without water, there is no swimming. The other choices are things that may or may not be present."
  },
  {
    id: 13,
    question: "13. lightning",
    options: ["a) electricity", "b) thunder", "c) brightness", "d) rain"],
    correctIndex: 0,
    answerText: "a) electricity",
    solution: "Explanation: Lightning is produced from a discharge of electricity, so electricity is essential. Thunder and rain are not essential to the production of lightning (choices b and d). Brightness may be a byproduct of lightning, but it is not essential (choice c)."
  },
  {
    id: 14,
    question: "14. ovation",
    options: ["a) outburst", "b) bravo", "c) applause", "d) encore"],
    correctIndex: 2,
    answerText: "c) applause",
    solution: "Explanation: An ovation is prolonged, enthusiastic applause, so applause is necessary to an ovation. An outburst (choice a) may take place during an ovation; \"bravo\" (choice b) may or may not be uttered; and an encore (choice d) would take place after an ovation."
  },
  {
    id: 15,
    question: "15. bonus",
    options: ["a) reward", "b) raise", "c) cash", "d) employer"],
    correctIndex: 0,
    answerText: "a) reward",
    solution: "Explanation: A bonus is something given or paid beyond what is usual or expected, so reward is the essential element. A bonus may not involve a raise in pay or cash (choices b and c), and it may be received from someone other than an employer (choice d)."
  },
  {
    id: 16,
    question: "16. antique",
    options: ["a) rarity", "b) artifact", "c) aged", "d) prehistoric"],
    correctIndex: 2,
    answerText: "c) aged",
    solution: "Explanation: An antique is something that belongs to, or was made in, an earlier period. It may or may not be a rarity (choice a), and it does not have to be an artifact, an object produced or shaped by human craft (choice b). An antique is old but does not have to be prehistoric (choice d)."
  },
  {
    id: 17,
    question: "17. culture",
    options: ["a) civility", "b) education", "c) agriculture", "d) customs"],
    correctIndex: 3,
    answerText: "d) customs",
    solution: "Explanation: A culture is the behavior pattern of a particular population, so customs are the essential element. A culture may or may not be civil or educated (choices a and b). A culture may be an agricultural society (choice c), but this is not the essential element."
  },
  {
    id: 18,
    question: "18. knowledge",
    options: ["a) school", "b) teacher", "c) textbook", "d) learning"],
    correctIndex: 3,
    answerText: "d) learning",
    solution: "Explanation: Knowledge is understanding gained through experience or study, so learning is the essential element. A school (choice a) is not necessary for learning or knowledge to take place, nor is a teacher or a textbook (choices b and c)."
  },
  {
    id: 19,
    question: "19. domicile",
    options: ["a) tenant", "b) dwelling", "c) kitchen", "d) house"],
    correctIndex: 1,
    answerText: "b) dwelling",
    solution: "Explanation: A domicile is a legal residence, so dwelling is the essential component for this item. You do not need a tenant (choice a) in the domicile, nor do you need a kitchen (choice c). A house (choice d) is just one form of a domicile (which could also be a tent, hogan, van, camper, motor home, apartment, dormitory, etc.)."
  },
  {
    id: 20,
    question: "20. vertebrate",
    options: ["a) backbone", "b) reptile", "c) mammal", "d) animal"],
    correctIndex: 0,
    answerText: "a) backbone",
    solution: "Explanation: All vertebrates have a backbone. Reptiles (choice b) are vertebrates, but so are many other animals. Mammals (choice c) are vertebrates, but so are birds and reptiles. All vertebrates (choice d) are animals, but not all animals are vertebrates."
  },
  {
    id: 21,
    question: "21. itinerary",
    options: ["a) map", "b) route", "c) travel", "d) guidebook"],
    correctIndex: 1,
    answerText: "b) route",
    solution: "Explanation: An itinerary is a proposed route of a journey. A map (choice a) is not necessary to have a planned route. Travel (choice c) is usually the outcome of an itinerary, but not always. A guidebook (choice d) may be used to plan the journey but is not essential."
  },
  {
    id: 22,
    question: "22. orchestra",
    options: ["a) violin", "b) stage", "c) musician", "d) soloist"],
    correctIndex: 2,
    answerText: "c) musician",
    solution: "Explanation: An orchestra is a large group of musicians, so musicians are essential. Although many orchestras have violin sections, violins aren't essential to an orchestra (choice a). Neither a stage (choice b) nor a soloist (choice d) is necessary."
  },
  {
    id: 23,
    question: "23. facsimile",
    options: ["a) picture", "b) image", "c) mimeograph", "d) copier"],
    correctIndex: 1,
    answerText: "b) image",
    solution: "Explanation: A facsimile must involve an image of some sort. The image or facsimile need not, however, be a picture (choice a). A mimeograph and a copier machine (choices c and d) are just a two of the ways that images may be produced, so they do not qualify as the essential element for this item."
  },
  {
    id: 24,
    question: "24. provisions",
    options: ["a) groceries", "b) supplies", "c) gear", "d) caterers"],
    correctIndex: 1,
    answerText: "b) supplies",
    solution: "Explanation: Provisions imply the general supplies needed, so choice b is the essential element. The other choices are byproducts, but they are not essential."
  },
  {
    id: 25,
    question: "25. sustenance",
    options: ["a) nourishment", "b) water", "c) grains", "d) menu"],
    correctIndex: 0,
    answerText: "a) nourishment",
    solution: "Explanation: Sustenance is something, especially food, that sustains life or health, so nourishment is the essential element.Water and grains (choices b and c) are components of nourishment, but other things can be taken in as well. A menu (choice d) may present a list of foods, but it is not essential to sustenance."
  },
  {
    id: 26,
    question: "26. infirmary",
    options: ["a) surgery", "b) disease", "c) patient", "d) receptionist"],
    correctIndex: 2,
    answerText: "c) patient",
    solution: "Explanation: An infirmary is a place that takes care of the infirm, sick, or injured.Without patients, there is no infirmary. Surgery (choice a) may not be required for patients. A disease (choice b) is not necessary because the infirmary may only see patients with injuries. A receptionist (choice d) would be helpful but not essential."
  },
  {
    id: 27,
    question: "27. purchase",
    options: ["a) trade", "b) money", "c) bank", "d) acquisition"],
    correctIndex: 3,
    answerText: "d) acquisition",
    solution: "Explanation: A purchase is an acquisition of something. A purchase may be made by trade (choice a) or with money (choice b), so those are not essential elements. A bank (choice c) may or may not be involved in a purchase."
  },
  {
    id: 28,
    question: "28. dimension",
    options: ["a) compass", "b) ruler", "c) inch", "d) measure"],
    correctIndex: 3,
    answerText: "d) measure",
    solution: "Explanation: A dimension is a measure of spatial content. A compass (choice a) and ruler (choice b) may help determine the dimension, but other instruments may also be used, so these are not the essential element here. An inch (choice c) is only one way to determine a dimension."
  },
  {
    id: 29,
    question: "29. wedding",
    options: ["a) love", "b) church", "c) ring", "d) marriage"],
    correctIndex: 3,
    answerText: "d) marriage",
    solution: "Explanation: A wedding results in a joining, or a marriage, so choice d is the essential element. Love (choice a) usually precedes a wedding, but it is not essential. A wedding may take place anywhere, so a church (choice b) is not required. A ring (choice c) is often used in a wedding, but it is not necessary."
  },
  {
    id: 30,
    question: "30. faculty",
    options: ["a) buildings", "b) textbooks", "c) teachers", "d) meetings"],
    correctIndex: 2,
    answerText: "c) teachers",
    solution: "Explanation: A faculty consists of a group of teachers and cannot exist without them. The faculty may work in buildings (choice a), but the buildings aren't essential. They may use textbooks (choice b) and attend meetings (choice d), but these aren't essential either."
  },
  {
    id: 31,
    question: "31. recipe",
    options: ["a) desserts", "b) directions", "c) cookbook", "d) utensils"],
    correctIndex: 1,
    answerText: "b) directions",
    solution: "Explanation: A recipe is a list of directions to make something. Recipes may be used to prepare desserts (choice a), among other things. One does not need a cookbook (choice c) to have a recipe, and utensils (choice d) may or may not be used to make a recipe."
  },
  {
    id: 32,
    question: "32. autograph",
    options: ["a) athlete", "b) actor", "c) signature", "d) pen"],
    correctIndex: 2,
    answerText: "c) signature",
    solution: "Explanation: Without a signature, there is no autograph. Athletes and actors (choices a and b) may sign autographs, but they are not essential. An autograph can be signed with something other than a pen (choice d)."
  },
  {
    id: 33,
    question: "33. cage",
    options: ["a) enclosure", "b) prisoner", "c) animal", "d) zoo"],
    correctIndex: 0,
    answerText: "a) enclosure",
    solution: "Explanation: A cage is meant to keep something surrounded, so enclosure is the essential element. A prisoner (choice b) or an animal (choice c) are two things that may be kept in cages, among many other things. A zoo (choice d) is only one place that has cages."
  },
  {
    id: 34,
    question: "34. champion",
    options: ["a) running", "b) swimming", "c) winning", "d) speaking"],
    correctIndex: 2,
    answerText: "c) winning",
    solution: "Explanation: Without a first-place win, there is no champion, so winning is essential. There may be champions in running, swimming, or speaking, but there are also champions in many other areas."
  },
  {
    id: 35,
    question: "35. saddle",
    options: ["a) horse", "b) seat", "c) stirrups", "d) horn"],
    correctIndex: 1,
    answerText: "b) seat",
    solution: "Explanation: A saddle is something one uses to sit on an animal, so it must have a seat (choice b). A saddle is often used on a horse (choice a), but it may be used on other animals. Stirrups (choice c) are often found on a saddle but may not be used. A horn (choice d) is found on Western saddles, but not English saddles, so it is not the essential element here."
  },
  {
    id: 36,
    question: "36. dome",
    options: ["a) rounded", "b) geodesic", "c) governmental", "d) coppery"],
    correctIndex: 0,
    answerText: "a) rounded",
    solution: "Explanation: A dome is a large rounded roof or ceiling, so being rounded is essential to a dome. A geodesic dome (choice b) is only one type of dome. Some, but not all domes, have copper roofs (choice d). Domes are often found on government buildings (choice c), but domes exist in many other places."
  },
  {
    id: 37,
    question: "37. glacier",
    options: ["a) mountain", "b) winter", "c) prehistory", "d) ice"],
    correctIndex: 3,
    answerText: "d) ice",
    solution: "Explanation: A glacier is a large mass of ice and cannot exist without it. A glacier can move down a mountain, but it can also move across a valley or a plain, which rules out choice a. Glaciers exist in all seasons, which rules out choice b. There are many glaciers in the world today, which rules out choice c."
  },
  {
    id: 38,
    question: "38. directory",
    options: ["a) telephone", "b) listing", "c) computer", "d) names"],
    correctIndex: 1,
    answerText: "b) listing",
    solution: "Explanation: A directory is a listing of names or things, so (choice b) is the essential element. A telephone (choice a) often has a directory associated with it, but it is not essential. A computer (choice c) uses a directory format to list files, but it is not required.Names (choice d) are often listed in a directory, but many other things are listed in directories, so this is not the essential element."
  },
  {
    id: 39,
    question: "39. contract",
    options: ["a) agreement", "b) document", "c) written", "d) attorney"],
    correctIndex: 0,
    answerText: "a) agreement",
    solution: "Explanation: An agreement is necessary to have a contract. A contract may appear on a document (choice b), but it is not required. A contract may be oral as well as written, so choice c is not essential. A contract can be made without an attorney (choice d)."
  },
  {
    id: 40,
    question: "40. hurricane",
    options: ["a) beach", "b) cyclone", "c) damage", "d) wind"],
    correctIndex: 3,
    answerText: "d) wind",
    solution: "Explanation: A hurricane cannot exist without wind. A beach is not essential to a hurricane (choice a). A hurricane is a type of cyclone, which rules out (choice b). Not all hurricanes cause damage (choice c)."
  },
  {
    id: 41,
    question: "41. town",
    options: ["a) residents", "b) skyscrapers", "c) parks", "d) libraries"],
    correctIndex: 0,
    answerText: "a) residents",
    solution: "Explanation: Residents must be present in order to have a town. A town may be too small to have skyscrapers (choice b). A town may or may not have parks (choice c) and libraries (choice d), so they are not the essential elements."
  },
  {
    id: 42,
    question: "42. vibration",
    options: ["a) motion", "b) electricity", "c) science", "d) sound"],
    correctIndex: 0,
    answerText: "a) motion",
    solution: "Explanation: Something cannot vibrate without creating motion, so motion is essential to vibration."
  },
];

export const ANALOGIES_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Odometer is to mileage as compass is to",
    options: ["a) speed", "b) hiking", "c) needle", "d) direction"],
    correctIndex: 3,
    answerText: "d) direction",
    solution: "Explanation: An odometer is an instrument used to measure mileage. A compass is an instrument used to determine direction. Choices a, b, and c are incorrect because none is an instrument."
  },
  {
    id: 2,
    question: "2. Marathon is to race as hibernation is to",
    options: ["a) winter", "b) bear", "c) dream", "d) sleep"],
    correctIndex: 3,
    answerText: "d) sleep",
    solution: "Explanation: A marathon is a long race and hibernation is a lengthy period of sleep. The answer is not choice a or b because even though a bear and winter are related to hibernation, neither completes the analogy. (Choice c) is incorrect because sleep and dream are not synonymous."
  },
  {
    id: 3,
    question: "3. Window is to pane as book is to",
    options: ["a) novel", "b) glass", "c) cover", "d) page"],
    correctIndex: 3,
    answerText: "d) page",
    solution: "Explanation: A window is made up of panes, and a book is made up of pages. The answer is not (choice a) because a novel is a type of book. The answer is not (choice b) because glass has no relationship to a book. (Choice c) is incorrect because a cover is only one part of a book; a book is not made up of covers."
  },
  {
    id: 4,
    question: "4. Cup is to coffee as bowl is to",
    options: ["a) dish", "b) soup", "c) spoon", "d) food"],
    correctIndex: 1,
    answerText: "b) soup",
    solution: "Explanation: Coffee goes into a cup and soup goes into a bowl. Choices a and c are incorrect because they are other utensils. The answer is not choice d because the word food is too general."
  },
  {
    id: 5,
    question: "5. Yard is to inch as quart is to",
    options: ["a) gallon", "b) ounce", "c) milk", "d) liquid"],
    correctIndex: 1,
    answerText: "b) ounce",
    solution: "Explanation: A yard is a larger measure than an inch (a yard contains 36 inches). A quart is a larger measure than an ounce (a quart contains 32 ounces). Gallon (choice a) is incorrect because it is larger than a quart. Choices c and d are incorrect because they are not units of measurement."
  },
  {
    id: 6,
    question: "6. Elated is to despondent as enlightened is to",
    options: ["a) aware", "b) ignorant", "c) miserable", "d) tolerant"],
    correctIndex: 1,
    answerText: "b) ignorant",
    solution: "Explanation: Elated is the opposite of despondent; enlightened is the opposite of ignorant."
  },
  {
    id: 7,
    question: "7. Optimist is to cheerful as pessimist is to",
    options: ["a) gloomy", "b) mean", "c) petty", "d) helpful"],
    correctIndex: 0,
    answerText: "a) gloomy",
    solution: "Explanation: An optimist is a person whose outlook is cheerful. A pessimist is a person whose outlook is gloomy. The answer is not (choice b) because a pessimist does not have to be mean. (Choices c) and d are incorrect because neither adjective describes the outlook of a pessimist."
  },
  {
    id: 8,
    question: "8. Reptile is to lizard as flower is to",
    options: ["a) petal", "b) stem", "c) daisy", "d) alligator"],
    correctIndex: 2,
    answerText: "c) daisy",
    solution: "Explanation: A lizard is a type of reptile; a daisy is a type of flower. Choices a and b are incorrect because a petal and a stem are parts of a flower, not types of flowers. (Choice d) is incorrect because an alligator is another type of reptile, not a type of flower."
  },
  {
    id: 9,
    question: "9. Play is to actor as concert is to",
    options: ["a) symphony", "b) musician", "c) piano", "d) percussion"],
    correctIndex: 1,
    answerText: "b) musician",
    solution: "Explanation: An actor performs in a play. A musician performs at a concert. Choices a, c, and d are incorrect because none is people who perform."
  },
  {
    id: 10,
    question: "10. Sponge is to porous as rubber is to",
    options: ["a) massive", "b) solid", "c) elastic", "d) inflexible"],
    correctIndex: 2,
    answerText: "c) elastic",
    solution: "Explanation: A sponge is a porous material. Rubber is an elastic material. (Choice a) is incorrect because rubber would not generally be referred to as massive. The answer is not (choice b) because even though rubber is a solid, its most noticeable characteristic is its elasticity. Choice d is incorrect because rubber has flexibility."
  },
  {
    id: 11,
    question: "11. Careful is to cautious as boastful is to",
    options: ["a) arrogant", "b) humble", "c) joyful", "d) suspicious"],
    correctIndex: 0,
    answerText: "a) arrogant",
    solution: "Explanation: Careful and cautious are synonyms (they mean the same thing). Boastful and arrogant are also synonyms. The answer is not (choice b) because humble means the opposite of boastful. The answer is not choice c or d because neither means the same as boastful."
  },
  {
    id: 12,
    question: "12. Pen is to poet as needle is to",
    options: ["a) thread", "b) button", "c) sewing", "d) tailor"],
    correctIndex: 3,
    answerText: "d) tailor",
    solution: "Explanation: A pen is a tool used by a poet. A needle is a tool used by a tailor. The answer is not choice a, b, or c because none is a person and therefore cannot complete the analogy."
  },
  {
    id: 13,
    question: "13. Secretly is to openly as silently is to",
    options: ["a) scarcely", "b) impolitely", "c) noisily", "d) quietly"],
    correctIndex: 2,
    answerText: "c) noisily",
    solution: "Explanation: Secretly is the opposite of openly, and silently is the opposite of noisily. Choices a and b are clearly not the opposites of silently. (Choice d) means the same thing as silently."
  },
  {
    id: 14,
    question: "14. Embarrassed is to humiliated as frightened is to",
    options: ["a) terrified", "b) agitated", "c) courageous", "d) reckless"],
    correctIndex: 0,
    answerText: "a) terrified",
    solution: "Explanation: If someone has been humiliated, they have been greatly embarrassed. If someone is terrified, they are extremely frightened. The answer is not choice b because an agitated person is not necessarily frightened. Choices c and d are incorrect because neither word expresses a state of being frightened."
  },
  {
    id: 15,
    question: "15. Pride is to lion as shoal is to",
    options: ["a) teacher", "b) student", "c) self-respect", "d) fish"],
    correctIndex: 3,
    answerText: "d) fish",
    solution: "Explanation: A group of lions is called a pride. A group of fish swim in a shoal. Teacher (choice a) and student (choice b) refer to another meaning of the word school. The answer is not (choice c) because self-respect has no obvious relationship to this particular meaning of school."
  },
  {
    id: 16,
    question: "16. Artist is to painting as senator is to",
    options: ["a) attorney", "b) law", "c) politician", "d) constituents"],
    correctIndex: 1,
    answerText: "b) law",
    solution: "Explanation: An artist makes paintings; a senator makes laws. The answer is not choice a because an attorney does not make laws and a senator is not an attorney. Choice c is incorrect because a senator is not a politician. Constituents (choice d) is also incorrect because a senator serves his or her constituents."
  },
  {
    id: 17,
    question: "17. Exercise is to gym as eating is to",
    options: ["a) food", "b) dieting", "c) fitness", "d) restaurant"],
    correctIndex: 3,
    answerText: "d) restaurant",
    solution: "Explanation: A gym is a place where people exercise. A restaurant is a place where people eat. Food (choice a) is not the answer because it is something people eat, not a place or location where they eat. The answer is not choice b or c because neither represents a place where people eat."
  },
  {
    id: 18,
    question: "18. Candid is to indirect as honest is to",
    options: ["a) frank", "b) wicked", "c) truthful", "d) untruthful"],
    correctIndex: 3,
    answerText: "d) untruthful",
    solution: "Explanation: Candid and indirect refer to opposing traits. Honest and untruthful refer to opposing traits. The answer is not choice a because frank means the same thing as candid.Wicked (choice b) is incorrect because even though it refers to a negative trait, it does not mean the opposite of honest. (Choice c) is incorrect because truthful and honest mean the same thing."
  },
  {
    id: 19,
    question: "19. Guide is to direct as reduce is to",
    options: ["a) decrease", "b) maintain", "c) increase", "d) preserve"],
    correctIndex: 0,
    answerText: "a) decrease",
    solution: "Explanation: Guide and direct are synonyms, and reduce and decrease are synonyms. The answer is not choice b or d because neither means the same as reduce. (Choice c) is incorrect because increase is the opposite of reduce."
  },
  {
    id: 20,
    question: "20. Oar is to rowboat as foot is to",
    options: ["a) running", "b) sneaker", "c) skateboard", "d) jumping"],
    correctIndex: 2,
    answerText: "c) skateboard",
    solution: "Explanation: An oar puts a rowboat into motion. A foot puts a skateboard into motion. The answer is not choice a because running is not an object that is put into motion by a foot. Sneaker (choice b) is incorrect because it is something worn on a foot. Jumping (choice d) is incorrect because although you do need feet to jump, jumping is not an object that is put into motion by means of a foot."
  },
  {
    id: 21,
    question: "21. Complete the analogy: Hand is to ring as head is to",
    options: ["a) cap", "b) necklace", "c) earring", "d) glove"],
    correctIndex: 0,
    answerText: "a) cap",
    solution: "Explanation: Hand is to ring as head is to cap. A ring is worn on a person's hand; a cap is worn on a person's head."
  },
  {
    id: 22,
    question: "22. Complete the analogy: A can of paint is to a paintbrush as a spool of thread is to a",
    options: ["a) cloth", "b) scissors", "c) thimble", "d) sewing needle"],
    correctIndex: 3,
    answerText: "d) sewing needle",
    solution: "Explanation: A can of paint is to a paintbrush as a spool of thread is to a sewing needle. This is a relationship of function. Both show the tool needed to perform a task."
  },
  {
    id: 23,
    question: "23. Complete the analogy: A snow-capped mountain is to a crocodile as a cactus is to a",
    options: ["a) starfish", "b) camel", "c) scorpion", "d) lizard"],
    correctIndex: 0,
    answerText: "a) starfish",
    solution: "Explanation: A snow-capped mountain is to a crocodile as a cactus is to a starfish. This relationship shows an opposition. The crocodile does NOT belong on the mountain; the starfish does NOT belong in the desert."
  },
  {
    id: 24,
    question: "24. Complete the analogy: A palm tree is to a pine tree as a bathing suit is to a",
    options: ["a) jacket", "b) parka", "c) sweater", "d) scarf"],
    correctIndex: 1,
    answerText: "b) parka",
    solution: "Explanation: A palm tree is to a pine tree as a bathing suit is to a parka. This relationship shows an opposite warm to cold. Palm trees grow in warm climates and pine trees grow in cold climates. Bathing suits are worn in warm weather; parkas are worn in cold weather."
  },
  {
    id: 25,
    question: "25. Complete the analogy: A T-shirt is to a pair of shoes as a chest of drawers is to a",
    options: ["a) table", "b) couch", "c) bed", "d) lamp"],
    correctIndex: 1,
    answerText: "b) couch",
    solution: "Explanation: A T-shirt is to a pair of shoes as a chest of drawers is to a couch. The relationship shows to which group something belongs. The T-shirt and shoes are both articles of clothing; the chest and couch are both pieces of furniture."
  },
  {
    id: 26,
    question: "26. Complete the analogy: A hose is to a firefighter as a needle is to a",
    options: ["a) hospital", "b) medicine", "c) syringe", "d) nurse"],
    correctIndex: 3,
    answerText: "d) nurse",
    solution: "Explanation: Hose is to firefighter as needle is to nurse. This relationship shows the tools of the trade. A hose is a tool used by a firefighter; a needle is a tool used by a nurse."
  },
  {
    id: 27,
    question: "27. Complete the analogy: A pyramid is to a triangle as a cube is to a",
    options: ["a) square", "b) circle", "c) polygon", "d) sphere"],
    correctIndex: 0,
    answerText: "a) square",
    solution: "Explanation: Pyramid is to triangle as cube is to square. This relationship shows dimension. The triangle shows one dimension of the pyramid; the square is one dimension of the cube."
  },
  {
    id: 28,
    question: "28. Complete the analogy: A tree is to a leaf as a bird is to a",
    options: ["a) nest", "b) wing", "c) beak", "d) feather"],
    correctIndex: 3,
    answerText: "d) feather",
    solution: "Explanation: Tree is to leaf as bird is to feather. This relationship shows part to whole. The leaf is a part of the tree; the feather is a part of the bird."
  },
  {
    id: 29,
    question: "29. candle lamp floodlight hut cottage ?",
    options: ["a) tent", "b) city", "c) dwelling", "d) house"],
    correctIndex: 3,
    answerText: "d) house",
    solution: "Explanation: Above the line, the relationship shows a progression of sources of light. The relationship below the line shows a progression of types of housing, from smallest to largest. (Choice a) is incorrect because a tent is smaller than a house. Choices b and c are wrong because they are not part of the progression."
  },
  {
    id: 30,
    question: "30. daisy flower plant bungalow house ?",
    options: ["a) building", "b) cottage", "c) apartment", "d) city"],
    correctIndex: 0,
    answerText: "a) building",
    solution: "Explanation: Above the line, the relationship is as follows: A daisy is a type of flower, and a flower is a type of plant. Below the line, the relationship is as follows: A bungalow is a type of house, and a house is a type of building."
  },
  {
    id: 31,
    question: "31. palette easel brush textbook lesson plan ?",
    options: ["a) artist", "b) teacher", "c) report card", "d) paint"],
    correctIndex: 2,
    answerText: "c) report card",
    solution: "Explanation: The objects above the line are all things used by an artist. The objects below the line are all things used by a teacher."
  },
  {
    id: 32,
    question: "32. rule command dictate doze sleep ?",
    options: ["a) snore", "b) govern", "c) awaken", "d) hibernate"],
    correctIndex: 3,
    answerText: "d) hibernate",
    solution: "Explanation: The words above the line show a continuum: Command is more extreme than rule, and dictate is more extreme than command. Below the line, the continuum is as follows: Sleep is more than doze, and hibernate is more than sleep. The other choices are not related in the same way."
  },
  {
    id: 33,
    question: "33. apples fruit supermarket novel book ?",
    options: ["a) bookstore", "b) magazine", "c) vegetable", "d) shopping"],
    correctIndex: 0,
    answerText: "a) bookstore",
    solution: "Explanation: The relationship above the line is as follows; apples are a kind of fruit; fruit is sold in a supermarket. Below the line, the relationship is: a novel is a kind of book; books are sold in a bookstore."
  },
  {
    id: 34,
    question: "34. ant fly bee hamster squirrel ?",
    options: ["a) spider", "b) mouse", "c) rodent", "d) cat"],
    correctIndex: 1,
    answerText: "b) mouse",
    solution: "Explanation: The three above the line are all insects. The hamster and squirrel are rodents, so the correct choice is b because the mouse is also a rodent. The other three choices are not rodents."
  },
  {
    id: 35,
    question: "35. carpenter saw nails pediatrician stethoscope ?",
    options: ["a) thermometer", "b) baby", "c) doctor", "d) illness"],
    correctIndex: 0,
    answerText: "a) thermometer",
    solution: "Explanation: In the relationship above the line, the saw and the nails are tools a carpenter uses. In the relationship below the line, the stethoscope and thermometer are tools a pediatrician uses."
  },
  {
    id: 36,
    question: "36. tadpole frog amphibian lamb sheep ?",
    options: ["a) animal", "b) wool", "c) farm", "d) mammal"],
    correctIndex: 3,
    answerText: "d) mammal",
    solution: "Explanation: The tadpole is a young frog; frogs are amphibians. The lamb is a young sheep; sheep are mammals. Animal (choice a) is incorrect because it is too large a grouping: Animals include insects, birds, mammals, reptiles, and amphibians. Choices b and c are incorrect because they are not part of the progression."
  },
  {
    id: 37,
    question: "37. table wood oak shirt cloth ?",
    options: ["a) sewing", "b) dress", "c) cotton", "d) tree"],
    correctIndex: 2,
    answerText: "c) cotton",
    solution: "Explanation: A table made of wood could come from an oak tree. A shirt made of cloth could come from a cotton plant. Choice a looks like a reasonable answer if you apply the same sentence: \"A shirt made of cloth could come from sewing.\" But this is not the same relationship as the one above the line. The oak and the cotton are both materials used to make the table and the shirt."
  },
  {
    id: 38,
    question: "38. snow mountain ski warmth lake ?",
    options: ["a) sand", "b) swim", "c) sunburn", "d) vacation"],
    correctIndex: 1,
    answerText: "b) swim",
    solution: "Explanation: The relationship above the line is that snow on a mountain creates conditions for skiing. Below the line, the relationship is that warmth at a lake creates conditions for swimming."
  },
  {
    id: 39,
    question: "39. walk skip run toss pitch ?",
    options: ["a) swerve", "b) hurl", "c) jump", "d) dance"],
    correctIndex: 1,
    answerText: "b) hurl",
    solution: "Explanation: Walk, skip, and run represent a continuum of movement: Skipping is faster than walking; running is faster than skipping. Below the line, the continuum is about throwing: Pitch is faster than toss; hurl is faster than pitch."
  },
  {
    id: 40,
    question: "40. meal banquet feast shelter palace ?",
    options: ["a) mansion", "b) hallway", "c) protection", "d) haven"],
    correctIndex: 0,
    answerText: "a) mansion",
    solution: "Explanation: A banquet and a feast are both large meals; a palace and a mansion are both large places of shelter."
  },
  {
    id: 41,
    question: "41. honeybee angel bat kangaroo rabbit ?",
    options: ["a) mermaid", "b) possum", "c) grasshopper", "d) sprinter"],
    correctIndex: 2,
    answerText: "c) grasshopper",
    solution: "Explanation: The honeybee, angel, and bat all have wings; they are capable of flying. The kangaroo, rabbit, and grasshopper are all capable of hopping."
  },
  {
    id: 42,
    question: "42. fence wall boundary path alley ?",
    options: ["a) ramp", "b) passageway", "c) airfield", "d) pedestrian"],
    correctIndex: 1,
    answerText: "b) passageway",
    solution: "Explanation: A fence and a wall mark a boundary. A path and an alley mark a passageway."
  },
  {
    id: 43,
    question: "43. BINDING : BOOK",
    options: ["a) criminal : gang", "b) display : museum", "c) artist : carpenter", "d) nail : hammer", "e) frame : picture"],
    correctIndex: 4,
    answerText: "e) frame : picture",
    solution: "Explanation: A binding surrounds a book; a frame surrounds a picture."
  },
  {
    id: 44,
    question: "44. EXPLORE : DISCOVER",
    options: ["a) read : skim", "b) research : learn", "c) write : print", "d) think : relate", "e) sleep : wake"],
    correctIndex: 1,
    answerText: "b) research : learn",
    solution: "Explanation: One explores to discover; one researches to learn."
  },
  {
    id: 45,
    question: "45. SIAMESE : CAT",
    options: ["a) type : breed", "b) dog : puppy", "c) mark : spot", "d) romaine : lettuce", "e) collar : leash"],
    correctIndex: 3,
    answerText: "d) romaine : lettuce",
    solution: "Explanation: Siamese is a kind of cat; romaine is a kind of lettuce."
  },
  {
    id: 46,
    question: "46. FINCH : BIRD",
    options: ["a) frog :toad", "b) elephant : reptile", "c) Dalmatian : dog", "d) collie : marsupial", "e) ant : ladybug"],
    correctIndex: 2,
    answerText: "c) Dalmatian : dog",
    solution: "Explanation: A finch is a type of bird; a Dalmatian is a type of dog."
  },
  {
    id: 47,
    question: "47. PETAL : FLOWER",
    options: ["a) salt : pepper", "b) tire : bicycle", "c) base : ball", "d) sandals : shoes", "e) puppy : dog"],
    correctIndex: 1,
    answerText: "b) tire : bicycle",
    solution: "Explanation: A petal is a part of a flower; a tire is a part of a bicycle."
  },
  {
    id: 48,
    question: "48. COTTON : BALE",
    options: ["a) butter : churn", "b) wine : ferment", "c) grain : shock", "d) curd : cheese", "e) beef : steak"],
    correctIndex: 2,
    answerText: "c) grain : shock",
    solution: "Explanation: Upon harvesting, cotton is gathered into bales; grain is gathered into shocks."
  },
  {
    id: 49,
    question: "49. ELEPHANT : PACHYDERM",
    options: ["a) mantis : rodent", "b) poodle : feline", "c) kangaroo : marsupial", "d) zebra : horse", "e) tuna : mollusk"],
    correctIndex: 2,
    answerText: "c) kangaroo : marsupial",
    solution: "Explanation: An elephant is a pachyderm; a kangaroo is a marsupial."
  },
  {
    id: 50,
    question: "50. PSYCHOLOGIST : NEUROSIS",
    options: ["a) ophthalmologist : cataract", "b) dermatologist : fracture", "c) infant : pediatrician", "d) rash : orthopedist", "e) oncologist : measles"],
    correctIndex: 0,
    answerText: "a) ophthalmologist : cataract",
    solution: "Explanation: A psychologist treats a neurosis; an ophthalmologist treats a cataract."
  },
  {
    id: 51,
    question: "51. PASTORAL : RURAL",
    options: ["a) metropolitan : urban", "b) harvest : autumn", "c) agrarian : benevolent", "d) sleepy : nocturnal", "e) wild : agricultural"],
    correctIndex: 0,
    answerText: "a) metropolitan : urban",
    solution: "Explanation: Pastoral describes rural areas; metropolitan describes urban areas."
  },
  {
    id: 52,
    question: "52. TAILOR : SUIT",
    options: ["a) scheme : agent", "b) edit : manuscript", "c) revise : writer", "d) mention : opinion", "e) implode : building"],
    correctIndex: 1,
    answerText: "b) edit : manuscript",
    solution: "Explanation: To tailor a suit is to alter it; to edit a manuscript is to alter it."
  },
  {
    id: 53,
    question: "53. PEDAL : BICYCLE",
    options: ["a) inch : yardstick", "b) walk : skip", "c) tire : automobile", "d) buckle : belt", "e) oar : canoe"],
    correctIndex: 4,
    answerText: "e) oar : canoe",
    solution: "Explanation: A pedal propels a bicycle; an oar propels a canoe."
  },
  {
    id: 54,
    question: "54. DIVISION : SECTION",
    options: ["a) layer : tier", "b) tether : bundle", "c) chapter : verse", "d) riser : stage", "e) dais : speaker"],
    correctIndex: 0,
    answerText: "a) layer : tier",
    solution: "Explanation: Division and section are synonyms; layer and tier are synonyms."
  },
  {
    id: 55,
    question: "55. DEPRESSED : SAD",
    options: ["a) neat : considerate", "b) towering : cringing", "c) rapid : plodding", "d) progressive : regressive", "e) exhausted : tired"],
    correctIndex: 4,
    answerText: "e) exhausted : tired",
    solution: "Explanation: Depressed is an intensification of sad; exhausted is an intensification of tired."
  },
  {
    id: 56,
    question: "56. BRISTLE : BRUSH",
    options: ["a) arm : leg", "b) stage : curtain", "c) recline : chair", "d) key : piano", "e) art : sculpture"],
    correctIndex: 3,
    answerText: "d) key : piano",
    solution: "Explanation: A bristle is a part of a brush; a key is a part of a piano."
  },
  {
    id: 57,
    question: "57. RAIN : DRIZZLE",
    options: ["a) swim :dive", "b) hop : shuffle", "c) juggle : bounce", "d) walk : run", "e) run : jog"],
    correctIndex: 4,
    answerText: "e) run : jog",
    solution: "Explanation: To drizzle is to rain slowly; to jog is to run slowly."
  },
  {
    id: 58,
    question: "58. PULSATE : THROB",
    options: ["a) walk : run", "b) tired : sleep", "c) examine : scrutinize", "d) ballet : dancer", "e) find : lose"],
    correctIndex: 2,
    answerText: "c) examine : scrutinize",
    solution: "Explanation: Pulsate and throb are synonyms, as are examine and scrutinize."
  },
  {
    id: 59,
    question: "59. FISH : SHOAL",
    options: ["a) wolf : pack", "b) elephant : jungle", "c) beagle : clan", "d) herd : peacock", "e) cow : farm"],
    correctIndex: 0,
    answerText: "a) wolf : pack",
    solution: "Explanation: A group of fish is a shoal; a group of wolves is a pack."
  },
  {
    id: 60,
    question: "60. ODOMETER : DISTANCE",
    options: ["a) scale : weight", "b) length : width", "c) inch : foot", "d) mileage : speed", "e) area : size"],
    correctIndex: 0,
    answerText: "a) scale : weight",
    solution: "Explanation: Scale - A measuring instrument for weighing; shows amount of mass. An odometer measures distance; a scale measures weight."
  },
  {
    id: 61,
    question: "61. WAITRESS : RESTAURANT",
    options: ["a) doctor : diagnosis", "b) actor : role", "c) driver : truck", "d) teacher : school", "e) author : book"],
    correctIndex: 3,
    answerText: "d) teacher : school",
    solution: "Explanation: A waitress works in a restaurant; a teacher works in a school."
  },
  {
    id: 62,
    question: "62. SKEIN : YARN",
    options: ["a) squeeze : lemon", "b) fire : coal", "c) ream : paper", "d) tree : lumber", "e) plow : acre"],
    correctIndex: 2,
    answerText: "c) ream : paper",
    solution: "Explanation: A skein is a quantity of yarn; a ream is a quantity of paper."
  },
  {
    id: 63,
    question: "63. MONK : DEVOTION",
    options: ["a) maniac : pacifism", "b) explorer : contentment", "c) visionary : complacency", "d) rover : wanderlust", "e) philistine : culture"],
    correctIndex: 3,
    answerText: "d) rover : wanderlust",
    solution: "Explanation: Devotion is characteristic of a monk; wanderlust is characteristic of a rover."
  },
  {
    id: 64,
    question: "64. SLAPSTICK : LAUGHTER",
    options: ["a) fallacy : dismay", "b) genre : mystery", "c) satire : anger", "d) mimicry : tears", "e) horror : fear"],
    correctIndex: 4,
    answerText: "e) horror : fear",
    solution: "Explanation: Slapstick results in laughter; horror results in fear."
  },
  {
    id: 65,
    question: "65. VERVE : ENTHUSIASM",
    options: ["a) loyalty : duplicity", "b) devotion : reverence", "c) intensity : color", "d) eminence : anonymity", "e) generosity : elation"],
    correctIndex: 1,
    answerText: "b) devotion : reverence",
    solution: "Explanation: Verve and enthusiasm are synonyms; devotion and reverence are synonyms."
  },
  {
    id: 66,
    question: "66. SPY : CLANDESTINE",
    options: ["a) accountant : meticulous", "b) furrier : rambunctious", "c) lawyer : ironic", "d) shepherd : garrulous", "e) astronaut : opulent"],
    correctIndex: 0,
    answerText: "a) accountant : meticulous",
    solution: "Explanation: A spy acts in a clandestine manner; an accountant acts in a meticulous manner."
  },
  {
    id: 67,
    question: "67. COBBLER : SHOE",
    options: ["a) jockey : horse", "b) contractor : building", "c) mason : stone", "d) cowboy : boot", "e) potter : paint"],
    correctIndex: 1,
    answerText: "b) contractor : building",
    solution: "Explanation: A cobbler makes and repairs shoes; a contractor builds and repairs buildings."
  },
  {
    id: 68,
    question: "68. UMBRAGE : OFFENSE",
    options: ["a) confusion : penance", "b) infinity : meaning", "c) decorum : decoration", "d) elation : jubilance", "e) outrage : consideration"],
    correctIndex: 3,
    answerText: "d) elation : jubilance",
    solution: "Explanation: Umbrage and offense are synonyms; elation and jubilance are synonyms."
  },
  {
    id: 69,
    question: "69. DIRGE : FUNERAL",
    options: ["a) chain : letter", "b) bell : church", "c) telephone : call", "d) jingle : commercial", "e) hymn : concerto"],
    correctIndex: 3,
    answerText: "d) jingle : commercial",
    solution: "Explanation: A dirge is a song used at a funeral; a jingle is a song used in a commercial."
  },
  {
    id: 70,
    question: "70. DOMINANCE : HEGEMONY",
    options: ["a) romance : sympathy", "b) furtherance : melancholy", "c) independence : autonomy", "d) tolerance : philanthropy", "e) recompense : hilarity"],
    correctIndex: 2,
    answerText: "c) independence : autonomy",
    solution: "Explanation: Hegemony means dominance; autonomy means independence."
  },
  {
    id: 71,
    question: "71. PHOBIC : FEARFUL",
    options: ["a) finicky : thoughtful", "b) cautious : emotional", "c) envious : desiring", "d) shy : familiar", "e) asinine : silly"],
    correctIndex: 4,
    answerText: "e) asinine : silly",
    solution: "Explanation: To be phobic is to be extremely fearful; to be asinine is to be extremely silly."
  },
  {
    id: 72,
    question: "72. FERAL : TAME",
    options: ["a) rancid : rational", "b) repetitive : recurrent", "c) nettlesome : annoying", "d) repentant : honorable", "e) ephemeral : immortal"],
    correctIndex: 4,
    answerText: "e) ephemeral : immortal",
    solution: "Explanation: Feral and tame are antonyms; ephemeral and immortal are antonyms."
  },
  {
    id: 73,
    question: "73. METAPHOR : SYMBOL",
    options: ["a) pentameter : poem", "b) rhythm : melody", "c) nuance : song", "d) slang : usage", "e) analogy : comparison"],
    correctIndex: 4,
    answerText: "e) analogy : comparison",
    solution: "Explanation: A metaphor is a symbol; an analogy is a comparison."
  },
  {
    id: 74,
    question: "74. INTEREST : OBSESSION",
    options: ["a) mood : feeling", "b) weeping : sadness", "c) dream : fantasy", "d) plan : negation", "e) highlight : indication"],
    correctIndex: 2,
    answerText: "c) dream : fantasy",
    solution: "Explanation: Obsession is a greater degree of interest; fantasy is a greater degree of dream."
  },
  {
    id: 75,
    question: "75. CONDUCTOR : ORCHESTRA",
    options: ["a) jockey : mount", "b) thrasher : hay", "c) driver : tractor", "d) skipper : crew", "e) painter : house"],
    correctIndex: 3,
    answerText: "d) skipper : crew",
    solution: "Explanation: A conductor leads an orchestra; a skipper leads a crew."
  },
  {
    id: 76,
    question: "76. FROND : PALM",
    options: ["a) quill : porcupine", "b) blade : evergreen", "c) scale : wallaby", "d) tusk : alligator", "e) blade : fern"],
    correctIndex: 0,
    answerText: "a) quill : porcupine",
    solution: "Explanation: A palm (tree) has fronds; a porcupine has quills."
  },
  {
    id: 77,
    question: "77. SOUND : CACOPHONY",
    options: ["a) taste : style", "b) touch : massage", "c) smell : stench", "d) sight : panorama", "e) speech : oration"],
    correctIndex: 2,
    answerText: "c) smell : stench",
    solution: "Explanation: A cacophony is an unpleasant sound; a stench is an unpleasant smell."
  },
  {
    id: 78,
    question: "78. AERIE : EAGLE",
    options: ["a) capital : government", "b) bridge : architect", "c) unit : apartment", "d) kennel : veterinarian", "e) house : person"],
    correctIndex: 4,
    answerText: "e) house : person",
    solution: "Explanation: An aerie is where an eagle lives; a house is where a person lives."
  },
  {
    id: 79,
    question: "79. PROFESSOR : ERUDITE",
    options: ["a) aviator : licensed", "b) inventor : imaginative", "c) procrastinator : conscientious", "d) overseer : wealthy", "e) moderator : vicious"],
    correctIndex: 1,
    answerText: "b) inventor : imaginative",
    solution: "Explanation: Being erudite is a trait of a professor; being imaginative is a trait of an inventor."
  },
  {
    id: 80,
    question: "80. DELTOID : MUSCLE",
    options: ["a) radius : bone", "b) brain : nerve", "c) tissue : organ", "d) blood : vein", "e) scalpel : incision"],
    correctIndex: 0,
    answerText: "a) radius : bone",
    solution: "Explanation: The deltoid is a muscle; the radius is a bone."
  },
  {
    id: 81,
    question: "81. JAUNDICE : LIVER",
    options: ["a) rash : skin", "b) dialysis : kidney", "c) smog : lung", "d) valentine : heart", "e) imagination : brain"],
    correctIndex: 0,
    answerText: "a) rash : skin",
    solution: "Explanation: Jaundice is an indication of a liver problem; rash is an indication of a skin problem."
  },
  {
    id: 82,
    question: "82. CONVICTION : INCARCERATION",
    options: ["a) reduction : diminution", "b) induction : amelioration", "c) radicalization : estimation", "d) marginalization : intimidation", "e) proliferation : alliteration"],
    correctIndex: 0,
    answerText: "a) reduction : diminution",
    solution: "Explanation: A conviction results in incarceration; a reduction results in diminution."
  },
  {
    id: 83,
    question: "83. DEPENDABLE : CAPRICIOUS",
    options: ["a) fallible : cantankerous", "b) erasable : obtuse", "c) malleable : limpid", "d) capable : inept", "e) incorrigible : guilty"],
    correctIndex: 3,
    answerText: "d) capable : inept",
    solution: "Explanation: Dependable and capricious are antonyms; capable and inept are antonyms."
  },
];

export const ARTIFICIAL_LANGUAGE_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Here are some words translated from an artificial language. gorblflur means fan belt pixngorbl means ceiling fan arthtusl means tile roof Which word could mean \"ceiling tile\"?",
    options: ["a) gorbltusl", "b) flurgorbl", "c) arthflur", "d) pixnarth"],
    correctIndex: 3,
    answerText: "d) pixnarth",
    solution: "Explanation: Gorbl means fan; flur means belt; pixn means ceiling; arth means tile; and tusl means roof. Therefore, pixnarth is the correct choice."
  },
  {
    id: 2,
    question: "2. Here are some words translated from an artificial language. hapllesh means cloudburst srenchoch means pinball resbosrench means ninepin Which word could mean \"cloud nine\"?",
    options: ["a) leshsrench", "b) ochhapl", "c) haploch", "d) haplresbo"],
    correctIndex: 3,
    answerText: "d) haplresbo",
    solution: "Explanation: Hapl means cloud; lesh means burst; srench means pin; och means ball; and resbo means nine. Leshsrench (choice a) doesn't contain any of the words needed for cloud nine. We know that och means ball, so that rules out choices b and c. When you combine hapl (cloud) with resbo (nine), you get the correct answer"
  },
  {
    id: 3,
    question: "3. Here are some words translated from an artificial language. agnoscrenia means poisonous spider delanocrenia means poisonous snake agnosdeery means brown spider Which word could mean \"black widow spider\"?",
    options: ["a) deeryclostagnos", "b) agnosdelano", "c) agnosvitriblunin", "d) trymuttiagnos"],
    correctIndex: 2,
    answerText: "c) agnosvitriblunin",
    solution: "Explanation: In this language, the noun appears first and the adjectives follow. Since agnos means spider and should appear first, choices a and d can be ruled out. Choice b can be ruled out because delano means snake."
  },
  {
    id: 4,
    question: "4. Here are some words translated from an artificial language. moolokarn means blue sky wilkospadi means bicycle race moolowilko means blue bicycle Which word could mean \"racecar\"?",
    options: ["a) wilkozwet", "b) spadiwilko", "c) moolobreil", "d) spadivolo"],
    correctIndex: 3,
    answerText: "d) spadivolo",
    solution: "Explanation: From wilkospadi, you can determine that wilko means bicicyle and spadi means race. Therefore, the first part of the word that means racecar should begin with spadi. That limits your choices to b and d. Choice b, spadiwilko, is incorrect because we have already determined that wilkomeans bicycle. Therefore, the answer must be choice d, spadivolo."
  },
  {
    id: 5,
    question: "5. Here are some words translated from an artificial language. migenlasan means cupboard lasanpoen means boardwalk cuopdansa means pullman Which word could mean \"walkway\"?",
    options: ["a) poenmigen", "b) cuopeisel", "c) lasandansa", "d) poenforc"],
    correctIndex: 3,
    answerText: "d) poenforc",
    solution: "Explanation: Migen means cup; lasan means board; poen means walk; cuop means pull; and dansa means man. The only possible choices, then, are choices a and d. Choice a can be ruled out because migen means cup."
  },
  {
    id: 6,
    question: "6. Here are some words translated from an artificial language. godabim means kidney stones romzbim means kidney beans romzbako means wax beans Which word could mean \"wax statue\"?",
    options: ["a) godaromz", "b) lazbim", "c) wasibako", "d) romzpeo"],
    correctIndex: 2,
    answerText: "c) wasibako",
    solution: "Explanation: In this language, the adjective follows the noun. From godabim and romzbim, you can determine that bim means kidney. From romzbim and romzbako, you can determine that romz means beans. Therefore, bako means wax. Because the adjective wax must come after the noun in this language, wasibako is the only choice."
  },
  {
    id: 7,
    question: "7. Here are some words translated from an artificial language. granamelke means big tree pinimelke means little tree melkehoon means tree house Which word could mean \"big house\"?",
    options: ["a) granahoon", "b) pinishur", "c) pinihoon", "d) melkegrana"],
    correctIndex: 0,
    answerText: "a) granahoon",
    solution: "Explanation: Grana means big;melkemeans tree; pini means little; hoonmeans house. Therefore, granahoon means big house."
  },
  {
    id: 8,
    question: "8. Here are some words translated from an artificial language. daftafoni means advisement imodafta means misadvise imolokti means misconduct Which word could mean \"statement\"?",
    options: ["a) kratafoni", "b) kratadafta", "c) loktifoni", "d) daftaimo"],
    correctIndex: 0,
    answerText: "a) kratafoni",
    solution: "Explanation: Dafta means advise; foni is the same as the suffix -ment; imo is the same as the prefix mis-; lokti means conduct. Since the only word in the answer choices that hasn't been defined is krata, it is reasonable to assume that krata means state. Therefore, kratafoni is the only choice that could mean statement."
  },
  {
    id: 9,
    question: "9. Here are some words translated from an artificial language. lelibroon means yellow hat plekafroti means flower garden frotimix means garden salad Which word could mean \"yellow flower\"?",
    options: ["a) lelifroti", "b) lelipleka", "c) plekabroon", "d) frotibroon"],
    correctIndex: 1,
    answerText: "b) lelipleka",
    solution: "Explanation: Leli means yellow; broon means hat; pleka means flower; froti means garden; mix means salad. Therefore, lelipleka means yellow flower."
  },
  {
    id: 10,
    question: "10. Here are some words translated from an artificial language. myncabel means saddle horse conowir means trail ride cabelalma means horse blanket Which word could mean \"horse ride\"?",
    options: ["a) cabelwir", "b) conocabel", "c) almamyn", "d) conoalma"],
    correctIndex: 0,
    answerText: "a) cabelwir",
    solution: "Explanation: Myn means saddle; cabel means horse; cono means trail; and wir means ride. Therefore, cabelwir is the correct answer."
  },
  {
    id: 11,
    question: "11. Here are some words translated from an artificial language. dionot means oak tree blyonot means oak leaf blycrin means maple leaf Which word could mean \"maple syrup\"?",
    options: ["a) blymuth", "b) hupponot", "c) patricrin", "d) crinweel"],
    correctIndex: 2,
    answerText: "c) patricrin",
    solution: "Explanation: In this language, the adjective follows the noun. From dionot and blyonot, you can determine that 'onot' means oak. From blyonot and blycrin, you can determine that bly means leaf. Therefore, crin means maple. Because the adjective maple comes after the noun, patricrin is the only possible choice."
  },
  {
    id: 12,
    question: "12. Here are some words translated from an artificial language. tamceno means sky blue cenorax means blue cheese aplmitl means star bright Which word could mean \"bright sky\"?",
    options: ["a) cenotam", "b) mitltam", "c) raxmitl", "d) aplceno"],
    correctIndex: 1,
    answerText: "b) mitltam",
    solution: "Explanation: Tam means sky; ceno means blue; rax means cheese; apl means star; and mitl means bright. So, mitltam means bright sky."
  },
  {
    id: 13,
    question: "13. Here are some words translated from an artificial language. gemolinea means fair warning gerimitu means report card gilageri means weather report Which word could mean \"fair weather\"?",
    options: ["a) gemogila", "b) gerigeme", "c) gemomitu", "d) gerimita"],
    correctIndex: 0,
    answerText: "a) gemogila",
    solution: "Explanation: Gemo means fair; linea means warning; geri means report;mitumeans card; and gilameans weather. Thus, gemogila is the correct choice."
  },
  {
    id: 14,
    question: "14. Here are some words translated from an artificial language. slar means jump slary means jumping slarend means jumped Which word could mean \"playing\"?",
    options: ["a) clargslarend", "b) clargy", "c) ellaclarg", "d) slarmont"],
    correctIndex: 1,
    answerText: "b) clargy",
    solution: "Explanation: According to this language, slar means jump. The suffix -ing is represented by -y. Since choice b is the only one that ends in the letter y, this is the only possible option."
  },
  {
    id: 15,
    question: "15. Here are some words translated from an artificial language. jalkamofti means happy birthday moftihoze means birthday party mentogunn means goodness Which word could mean \"happiness\"?",
    options: ["a) jalkagunn", "b) mentohoze", "c) moftihoze", "d) hozemento"],
    correctIndex: 0,
    answerText: "a) jalkagunn",
    solution: "Explanation: Jalka means happy;moftimeans birthday; hoze means party; mento means good; and gunn means the suffix \u00e2\u20ac\u201cness. We know the answer must include the suffix \u00e2\u20ac\u201cness. The only choice that uses that suffix is choice a."
  },
  {
    id: 16,
    question: "16. Here are some words translated from an artificial language. plekapaki means fruitcake pakishillen means cakewalk treftalan means buttercup Which word could mean \"cupcake\"?",
    options: ["a) shillenalan", "b) treftpleka", "c) pakitreft", "d) alanpaki"],
    correctIndex: 3,
    answerText: "d) alanpaki",
    solution: "Explanation: Pleka means fruit; paki means cake; shillen means walk; treftmeans butter; and alanmeans cup. Therefore, alanpaki means cupcake."
  },
  {
    id: 17,
    question: "17. Here are some words translated from an artificial language. malgauper means peach cobbler malgaport means peach juice moggagrop means apple jelly Which word could mean \"apple juice\"?",
    options: ["a) moggaport", "b) malgaauper", "c) gropport", "d) moggagrop"],
    correctIndex: 0,
    answerText: "a) moggaport",
    solution: "Explanation: Malga means peach; uper means cobbler; port means juice; mogga means apple; and grop means jelly. Therefore, moggaport means apple juice."
  },
  {
    id: 18,
    question: "18. Here are some words translated from an artificial language. peslligen means basketball court ligenstrisi means courtroom oltaganti means placement test Which word could mean \"guest room\"?",
    options: ["a) peslstrisi", "b) vosefstrisi", "c) gantipesl", "d) oltastrisi"],
    correctIndex: 1,
    answerText: "b) vosefstrisi",
    solution: "Explanation: Pesl means basketball; ligen means court; strisi means room; olta means placement; and ganti means test. Because strisimeans room, it must be present in the answer, so that rules out choice c. Choices a and d are incorrect because pesl means basketball and olta means placement. That leaves choice b as the only possible answer."
  },
  {
    id: 19,
    question: "19. Here are some words translated from an artificial language. mallonpiml means blue light mallontifl means blueberry arpantifl means raspberry Which word could mean \"lighthouse\"?",
    options: ["a) tiflmallon", "b) pimlarpan", "c) mallonarpan", "d) pimldoken"],
    correctIndex: 3,
    answerText: "d) pimldoken",
    solution: "Explanation: Mallon means blue; pimlmeans light; tifl means berry; and arpan means \"rasp\" in raspberry. The word piml, which means light, is required for the word lighthouse. That rules out choices a and c. Arpan in choice b means \"rasp\", so that rules out choice b. That leaves choice d the only possible answer."
  },
  {
    id: 20,
    question: "20. Here are some words translated from an artificial language. briftamint means militant uftonel means occupied uftonalene means occupation Which word could mean \"occupant\"?",
    options: ["a) elbrifta", "b) uftonamint", "c) elamint", "d) briftalene"],
    correctIndex: 1,
    answerText: "b) uftonamint",
    solution: "Explanation: Brift means the root word mili\u00e2\u20ac\u201c; the suffix amint means the same as the English suffix \u00e2\u20ac\u201ctant; the root word ufton\u00e2\u20ac\u201c means occupy; el means the suffix \u00e2\u20ac\u201cied of occupied; and alene means the suffix \u00e2\u20ac\u201ction. (Because ufton means occupy, choices a, c, and d can be easily ruled out.)"
  },
  {
    id: 21,
    question: "21. Here are some words translated from an artificial language. morpirquat means birdhouse beelmorpir means bluebird beelclak means bluebell Which word could mean \"houseguest\"?",
    options: ["a) morpirhunde", "b) beelmoki", "c) quathunde", "d) clakquat"],
    correctIndex: 2,
    answerText: "c) quathunde",
    solution: "Explanation: Morpir means bird; quat means house; beel means blue; clak means bell. Choice c, which begins with quat, is the only possible option."
  },
  {
    id: 22,
    question: "22. Here are some words translated from an artificial language. relftaga means carefree otaga means careful fertaga means careless Which word could mean \"aftercare\"?",
    options: ["a) zentaga", "b) tagafer", "c) tagazen", "d) relffer"],
    correctIndex: 2,
    answerText: "c) tagazen",
    solution: "Explanation: In this language, the root word taga, which means care, follows the affix (relf, o\u00e2\u20ac\u201c, or fer\u00e2\u20ac\u201c). Therefore, in the word aftercare, the root word and the affix would be reversed in the artificial language. The only choice, then, is tagazen, because tagafer would mean less care."
  },
  {
    id: 23,
    question: "23. Here are some words translated from an artificial language. aptaose means first base eptaose means second base lartabuk means ballpark Which word could mean \"baseball\"?",
    options: ["a) buklarta", "b) oseepta", "c) bukose", "d) oselarta"],
    correctIndex: 3,
    answerText: "d) oselarta",
    solution: "Explanation: Apta means first; ose means base; epta means second; larta means ball; and buk means park. Thus, oselarta means baseball."
  },
  {
    id: 24,
    question: "24. Here are some words translated from an artificial language. krekinblaf means workforce dritakrekin means groundwork krekinalti means workplace Which word could mean \"someplace\"?",
    options: ["a) moropalti", "b) krekindrita", "c) altiblaf", "d) dritaalti"],
    correctIndex: 0,
    answerText: "a) moropalti",
    solution: "Explanation: Krekin means work; blaf means force; drita means ground; and alti means place. Drita means ground, so that rules out choices b and d. Choice c isn't correct because blaf means force. That leaves choice a as the only possible answer."
  },
];

export const MATCHING_DEFINITIONS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Applying for Seasonal Employment occurs when a person requests to be considered for a job that is dependent on a particular season or time of year. Which situation below is the best example of Applying for Seasonal Employment?",
    options: ["a) The ski instructors at Top of the Peak Ski School work from December through March.", "b) Matthew prefers jobs that allow him to work outdoors.", "c) Lucinda makes an appointment with the beach resort restaurant manager to interview for the summer waitressing position that was advertised in the newspaper.", "d) Doug's ice cream shop stays open until 11 p.m. during the summer months."],
    correctIndex: 2,
    answerText: "c) Lucinda makes an appointment with the beach resort restaurant manager to interview for the summer waitressing position that was advertised in the newspaper.",
    solution: "Explanation: Although the ski instructors at Top of the Peak Ski School do work seasonally, choice a does not describe anyone applying for seasonal employment. In choice b, the statement that Matthew likes to work outdoors tells us nothing about seasonal employment or someone applying for it. And although choice d describes a business with seasonal hours, it does not describe a person applying for seasonal work. Choice c, on the other hand, very specifically depicts a person, Lucinda, who is applying for a job as a summer waitress at a beach resort, which is dependent upon a particular season of the year."
  },
  {
    id: 2,
    question: "2. Violating an Apartment Lease occurs when a tenant does something prohibited by the legally binding document that he or she has signed with a landlord. Which situation below is the best example of Violating an Apartment Lease?",
    options: ["a) Tim has decided to move to another city, so he calls his landlord to tell him that he is not interested in renewing his lease when it expires next month.", "b) Valerie recently lost her job and, for the last three months, has neglected to pay her landlord the monthly rent they agreed upon in writing when she moved into her apartment eight months ago.", "c) Mark writes a letter to his landlord that lists numerous complaints about the apartment he has agreed to rent for two years.", "d) Leslie thinks that her landlord is neglecting the building in which she rents an apartment. She calls her attorney to ask for advice."],
    correctIndex: 1,
    answerText: "b) Valerie recently lost her job and, for the last three months, has neglected to pay her landlord the monthly rent they agreed upon in writing when she moved into her apartment eight months ago.",
    solution: "Explanation: Valerie signed a legally binding document that requires her to pay a monthly rent for her apartment and she has failed to do this for the last three months. Therefore, she has violated her apartment lease."
  },
  {
    id: 3,
    question: "3. An Informal Gathering occurs when a group of people get together in a casual, relaxed manner. Which situation below is the best example of an Informal Gathering?",
    options: ["a) The book club meets on the first Thursday evening of every month.", "b) After finding out about his promotion, Jeremy and a few coworkers decide to go out for a quick drink after work.", "c) Mary sends out 25 invitations for the bridal shower she is giving for her sister.", "d) Whenever she eats at the Mexican restaurant, Clara seems to run into Peter."],
    correctIndex: 1,
    answerText: "b) After finding out about his promotion, Jeremy and a few coworkers decide to go out for a quick drink after work.",
    solution: "Explanation: After getting some good news, Jeremy and a few friends casually get together for a drink after work, thereby having an informal gathering. Choices a and c describe more formal types of gatherings. Choice d describes a chance or coincidental kind of meeting."
  },
  {
    id: 4,
    question: "4. People speculate when they consider a situation and assume something to be true based on inconclusive evidence. Which situation below is the best example of Speculation ?",
    options: ["a) Francine decides that it would be appropriate to wear jeans to her new office on Friday after reading about \"Casual Fridays\" in her employee handbook.", "b) Mary spends thirty minutes sitting in traffic and wishes that she took the train instead of driving.", "c) After consulting several guidebooks and her travel agent, Jennifer feels confident that the hotel she has chosen is first-rate.", "d) When Emily opens the door in tears, Theo guesses that she's had a death in her family."],
    correctIndex: 3,
    answerText: "d) When Emily opens the door in tears, Theo guesses that she's had a death in her family.",
    solution: "Explanation: This is the only situation in which someone makes an assumption that is not based on conclusive evidence. Choices a and c reflect situations in which assumptions are made based on evidence. In choice b, Mary is not assuming anything to be true. She is simply wishing that she'd made a different decision."
  },
  {
    id: 5,
    question: "5. Posthumous Publication occurs when a book is published after the author's death. Which situation below is the best example of Posthumous Publication ?",
    options: ["a) Richard's illness took his life before he was able to enjoy the amazing early reviews of his novel.", "b) Melissa's publisher cancels her book contract after she fails to deliver the manuscript on time.", "c) Clarence never thought he'd live to see the third book in his trilogy published.", "d) Elizabeth is honored with a prestigious literary award for her writing career and her daughter accepts the award on behalf of her deceased mother."],
    correctIndex: 0,
    answerText: "a) Richard's illness took his life before he was able to enjoy the amazing early reviews of his novel.",
    solution: "Explanation: Although choice d also mentions a writer who has died, it does not state that one of the writer's books was published after her death, only that she received an award. Choice a states that Richard wasn't around to see the early reviews of his novel, therefore implying that Richard died before the book was published. The other two options depict living writers."
  },
  {
    id: 6,
    question: "6. A Guarantee is a promise or assurance that attests to the quality of a product that is either (1) given in writing by the manufacturer or (2) given verbally by the person selling the product. Which situation below is the best example of a Guarantee?",
    options: ["a) Melissa purchases a DVD player with the highest consumer ratings in its category.", "b) The salesperson advises Curt to be sure that he buys an air conditioner with a guarantee.", "c) The local auto body shop specializes in refurbishing and selling used cars.", "d) Lori buys a used digital camera from her coworker who says that she will refund Lori's money if the camera's performance is not of the highest quality."],
    correctIndex: 3,
    answerText: "d) Lori buys a used digital camera from her coworker who says that she will refund Lori's money if the camera's performance is not of the highest quality.",
    solution: "Explanation: Choices a, b, and c do not describe situations in which a product is guaranteed. Only choice d reflects a situation in which a seller attests to the quality of a product by giving the buyer a promise or assurance about its quality."
  },
  {
    id: 7,
    question: "7. The rules of baseball state that a batter Legally Completes His Time at Bat when he is put out or becomes a base runner. Which situation below is the best example of a batter Legally Completing His Time at Bat?",
    options: ["a) Jared's blooper over the head of the short-stop puts him in scoring position.", "b) The umpire calls a strike, even though the last pitch was way outside.", "c) The pitcher throws his famous knuckleball, Joe swings and misses, and the umpire calls a strike.", "d) The count is two balls and two strikes as Mario waits for the next pitch."],
    correctIndex: 0,
    answerText: "a) Jared's blooper over the head of the short-stop puts him in scoring position.",
    solution: "Explanation: The fact that Jared is in scoring position due to his blooper indicates that he has hit the ball and is now a base runner; therefore, he has legally completed his time at bat. Choices b and c both describe situations in which a strike is called, but they do not state that the batter has been put out or that he is now a base runner. Choice d describes a situation in which the batter, Mario, is still at the plate waiting for the next pitch."
  },
  {
    id: 8,
    question: "8. Erratic Behavior occurs when an individual acts in a manner that lacks consistency, regularity, and uniformity. Which situation below is the best example of Erratic Behavior?",
    options: ["a) Julia cannot contain her anger whenever the subject of local politics is discussed.", "b) Martin has just been told that he is being laid off. Before leaving his supervisor's office, he punches a hole in the door.", "c) Rhonda has visited the dealership several times, but she still cannot decide which car to buy.", "d) In the past month, Jeffrey, who has been a model employee for three years, has repeatedly called in sick, forgotten important meetings, and been verbally abusive to colleagues."],
    correctIndex: 3,
    answerText: "d) In the past month, Jeffrey, who has been a model employee for three years, has repeatedly called in sick, forgotten important meetings, and been verbally abusive to colleagues.",
    solution: "Explanation: Jeffrey's recent behavior is clearly inconsistent and irregular."
  },
  {
    id: 9,
    question: "9. A Tiebreaker is an additional contest or period of play designed to establish a winner among tied contestants. Which situation below is the best example of a Tiebreaker?",
    options: ["a) At halftime, the score is tied at 28.", "b) Mary and Megan have each scored three goals in the game.", "c) The referee tosses a coin to decide which team will have possession of the ball first.", "d) The Sharks and the Bears each finished with 14 points, and they are now battling it out in a five-minute overtime."],
    correctIndex: 3,
    answerText: "d) The Sharks and the Bears each finished with 14 points, and they are now battling it out in a five-minute overtime.",
    solution: "Explanation: This is the only choice that indicates that an additional period of play is taking place to determine the winner of a game that ended in a tie."
  },
  {
    id: 10,
    question: "10. In the Maple Hill school district, a Five-Day Suspension occurs when a student is not permitted to attend school for five days for (1) physically assaulting another student, a teacher, or a school employee or (2) willfully destructing or defacing school property. Which situation below is the best example of a Five-Day Suspension?",
    options: ["a) Lillian gets caught cheating on a math test for the second time and is suspended from school.", "b) Marc is asked to leave the classroom due to his constant disruptions.", "c) Franny uses spray paint to write derogatory comments on the locker room wall and she is given a suspension.", "d) Ms. Farmer tells her class that students who fail the midterm exam will be expected to stay after school for tutoring help."],
    correctIndex: 2,
    answerText: "c) Franny uses spray paint to write derogatory comments on the locker room wall and she is given a suspension.",
    solution: "Explanation: Although choices a and c both describe suspensions, only choice c describes a suspension that is the result of one of the two scenarios given in the definition of a five-day suspension (physical assault or destructing or defacing school property). Therefore, we can assume that Franny's suspension, which is the result of spray painting school property, will be a five-day suspension. Since the definition doesn't provide any information about suspensions for cheating, we can assume that Lillian's suspension does not fall into the five-day suspension category."
  },
  {
    id: 11,
    question: "11. It is appropriate to compensate someone if you have damaged his or her property in some way. This is called Restitution. Which situation below is the best example of Restitution?",
    options: ["a) Jake borrows Leslie's camera and the lens shatters when it falls on the ground because he fails to zipper the case.When Jake returns the camera, he tells Leslie that he will pay for the repair.", "b) Rebecca borrows her neighbor's car, and when she returns it, the gas tank is practically empty. She apologizes profusely and tells her neighbor she will be more considerate the next time.", "c) Aaron asks Tom to check in on his apartment while he is out of town. When Tom arrives, he discovers that a pipe has burst and there is a considerable amount of water damage. He calls a plumber to repair the pipe.", "d) Lisa suspects that the pothole in her company's parking lot caused her flat tire. She tells her boss that she thinks the company should pay for the repair."],
    correctIndex: 0,
    answerText: "a) Jake borrows Leslie's camera and the lens shatters when it falls on the ground because he fails to zipper the case.When Jake returns the camera, he tells Leslie that he will pay for the repair.",
    solution: "Explanation: Jake damaged Leslie's camera while it was in his possession and he has agreed to compensate Leslie for the cost of the repair."
  },
  {
    id: 12,
    question: "12. Reentry occurs when a person leaves his or her social system for a period of time and then returns. Which situation below best describes Reentry ?",
    options: ["a) When he is offered a better paying position, Jacob leaves the restaurant he manages to manage a new restaurant on the other side of town.", "b) Catherine is spending her junior year of college studying abroad in France.", "c) Malcolm is readjusting to civilian life after two years of overseas military service.", "d) After several miserable months, Sharon decides that she can no longer share an apartment with her roommate Hilary."],
    correctIndex: 2,
    answerText: "c) Malcolm is readjusting to civilian life after two years of overseas military service.",
    solution: "Explanation: Malcolm is the only person returning to a social system that he has been away from for an extended period of time."
  },
  {
    id: 13,
    question: "13. Embellishing the Truth occurs when a person adds fictitious details or exaggerates facts or true stories. Which situation below is the best example of Embellishing the Truth?",
    options: ["a) Isabel goes to the theater, and the next day, she tells her coworkers she thought the play was excellent.", "b) The realtor describes the house, which is eleven blocks away from the ocean, as prime waterfront property.", "c) During the job interview, Fred, who has been teaching elementary school for ten years, describes himself as a very experienced teacher.", "d) The basketball coach says it is likely that only the most talented players will get a college scholarship."],
    correctIndex: 1,
    answerText: "b) The realtor describes the house, which is eleven blocks away from the ocean, as prime waterfront property.",
    solution: "Explanation: The realtor is using a clear exaggeration when she states that a house which is eleven blocks away from the ocean is prime waterfront property."
  },
  {
    id: 14,
    question: "14. Establishing a Power of Attorney occurs when a legal document is created that gives one individual the authority to act for another. Which situation below is the best example of Establishing a Power of Attorney?",
    options: ["a) Louise is selling her house and she hires a lawyer to review the contract.", "b) Simone's mother can no longer get to the bank to cash her checks and make deposits, so she has taken legal steps to enable Simone to do these things for her.", "c) Jack's father is elderly and Jack thinks he is no longer able to make decisions for himself.", "d) At her daughter's urging, Mrs.Lenox opens up a retirement account with the local bank."],
    correctIndex: 1,
    answerText: "b) Simone's mother can no longer get to the bank to cash her checks and make deposits, so she has taken legal steps to enable Simone to do these things for her.",
    solution: "Explanation: Simone's mother has taken legal steps to allow another person to act on her behalf. Therefore, this is the only choice that indicates that a power of attorney has been established."
  },
];

export const MAKING_JUDGMENTS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Eileen is planning a special birthday dinner for her husband's 35th birthday. She wants the evening to be memorable, but her husband is a simple man who would rather be in jeans at a baseball game than in a suit at a fancy restaurant. Which restaurant below should Eileen choose?",
    options: ["a) Alfredo's offers fine Italian cuisine and an elegant Tuscan decor. Patrons will feel as though they've spent the evening in a luxurious Italian villa.", "b) Pancho's Mexican Buffet is an all-you-can-eat family style smorgasbord with the best tacos in town.", "c) The Parisian Bistro is a four-star French restaurant where guests are treated like royalty. Chef Dilbert Olay is famous for his beef bourguignon.", "d) Marty's serves delicious, hearty meals in a charming setting reminiscent of a baseball clubhouse in honor of the owner,Marty Lester, a former major league baseball all-star."],
    correctIndex: 3,
    answerText: "d) Marty's serves delicious, hearty meals in a charming setting reminiscent of a baseball clubhouse in honor of the owner,Marty Lester, a former major league baseball all-star.",
    solution: "Explanation: Since Eileen's husband does not enjoy fancy restaurants, choices a and c can be ruled out. Choice b, although casual, doesn't sound as though it would be the kind of special and memorable evening that Eileen is looking for. Choice d, which is owned by a former baseball star and is described as \"charming\" and \"reminiscent of a baseball clubhouse\", sounds perfect for Eileen's husband, who is described as a baseball fan and a man with simple tastes."
  },
  {
    id: 2,
    question: "2. The film director wants an actress for the lead role of Lucy who perfectly fits the description that appears in the original screenplay. He is not willing to consider actresses who do not resemble the character as she is described in the screenplay, no matter how talented they are. The screenplay describes Lucy as an average-sized, forty something redhead, with deep brown eyes, very fair skin, and a brilliant smile. The casting agent has four actresses in mind. Actress #1 is a stunning red-haired beauty who is 5'9\" and in her mid-twenties. Her eyes are brown and she has an olive complexion. Actress #2 has red hair, big brown eyes, and a fair complexion. She is in her mid-forties and is 5'5\". Actress #3 is 5'4\" and of medium build. She has red hair, brown eyes, and is in her early forties. Actress #4 is a blue-eyed redhead in her early thirties. She's of very slight build and stands at 5'.",
    options: ["a) 1, 2", "b) 2, 3", "c) 1, 4", "d) 2, 4"],
    correctIndex: 1,
    answerText: "b) 2, 3",
    solution: "Explanation: Actresses #2 and #3 possess most of the required traits. They both have red hair and brown eyes, are average-sized, and are in their forties. Actress #1 is very tall and is only in her mid-twenties. She also has an olive complexion. Actress #4 is of very slight build and is in her early thirties. She also has blue eyes."
  },
  {
    id: 3,
    question: "3. The school principal has received complaints from parents about bullying in the school yard during recess. He wants to investigate and end this situation as soon as possible, so he has asked the recess aides to watch closely. Which situation should the recess aides report to the principal?",
    options: ["a) A girl is sitting glumly on a bench reading a book and not interacting with her peers.", "b) Four girls are surrounding another girl and seem to have possession of her backpack.", "c) Two boys are playing a one-on-one game of basketball and are arguing over the last basket scored.", "d) Three boys are huddled over a handheld video game, which isn't supposed to be on school grounds."],
    correctIndex: 1,
    answerText: "b) Four girls are surrounding another girl and seem to have possession of her backpack.",
    solution: "Explanation: Seeing four girls surrounding another girl, while in possession of her backpack, is the most suspicious of the incidents described."
  },
  {
    id: 4,
    question: "4. Mrs. Carson took a taxi to meet her three friends for lunch. They were waiting for her outside the restaurant when she pulled up in the car. She was so excited to see her friends that she left her tote bag in the taxi. As the taxi pulled away, she and her friends took notice of the license plate number so they would be able to identify the car when they called the taxi company. #1: The four women seem to agree that the plate starts out with the letter J. #2: Three of them agree that the plate ends with 12L. #3: Three of them think that the second letter is X, and a different three think that the third letter is K. The four license plate numbers below represent what each of the four women thinks she saw. Which one is most likely the license plate number of the taxi?",
    options: ["a) JXK 12L", "b) JYK 12L", "c) JXK 12I", "d) JXX 12L"],
    correctIndex: 0,
    answerText: "a) JXK 12L",
    solution: "Explanation: The four women seem to agree that the plate starts out with the letter J. Three of them agree that the plate ends with 12L. Three of them think that the second letter is X, and three think that the third letter is K. The plate JXK 12L satisfies all these agreements."
  },
];

export const LOGICAL_REASONING_MAP: Record<string, PlacementQuestion[]> = {
  "Number Series": NUMBER_SERIES_QUESTIONS,
  "Letter and Symbol Series": LETTER_AND_SYMBOL_SERIES_QUESTIONS,
  "Verbal Classification": VERBAL_CLASSIFICATION_QUESTIONS,
  "Essential Part": ESSENTIAL_PART_QUESTIONS,
  "Analogies": ANALOGIES_QUESTIONS,
  "Artificial Language": ARTIFICIAL_LANGUAGE_QUESTIONS,
  "Matching Definitions": MATCHING_DEFINITIONS_QUESTIONS,
  "Making Judgments": MAKING_JUDGMENTS_QUESTIONS,
};
