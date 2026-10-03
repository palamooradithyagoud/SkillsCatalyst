// SkillsCatalyst - Complete Logical Reasoning Question Bank (1,197 Questions Offline Fallback)
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
    solution: "Explanation: The four women seem to agree that the plate starts out with the letter J. Three of them agree that the plate ends with 12L. Three of them think that the second letter is X, and a different three think that the third letter is K. The plate description that has all of these common elements is \"Option A\"."
  },
  {
    id: 5,
    question: "5. Zachary has invited his three buddies over to watch the basketball game on his wide-screen television. They are all hungry, but no one wants to leave to get food. Just as they are arguing about who should make the food run, a commercial comes on for a local pizze-ria that delivers. The phone number flashes on the screen briefly and they all try to remember it. By the time Zachary grabs a pen and paper, each of them recollects a different number. #1: All of the men agree that the first three numbers are 995. #2: Three of them agree that the fourth number is 9. #3: Three agree that the fifth number is 2. #4: Three agree that the sixth number is 6; three others agree that the seventh number is also 6. Which of the numbers is most likely the telephone number of the pizzeria?",
    options: ["a) 995-9266", "b) 995-9336", "c) 995-9268", "d) 995-8266"],
    correctIndex: 0,
    answerText: "a) 995-9266",
    solution: "Explanation: All of the men agree that the first three numbers are 995. Three of them agree that the fourth number is 9. Three agree that the fifth number is 2. Three agree that the sixth number is 6; three others agree that the seventh number is also 6. \"Option A\" is the best choice because it is made up of the numbers that most of the men agree they saw."
  },
  {
    id: 6,
    question: "6. Mark is working with a realtor to find a location for the toy store he plans to open in his town. He is looking for a place that is either in, or not too far from, the center of town and one that would attract the right kind of foot traffic. Which of the following locations should Mark's realtor call to his attention?",
    options: ["a) a storefront in a new high-rise building near the train station in the center of town whose occupants are mainly young, childless professionals who use the train to commute to their offices each day.", "b) a little shop three blocks away from the town's main street, located across the street from an elementary school and next door to an ice cream store", "c) a stand-alone storefront on a quiet residential street ten blocks away from the town's center", "d) a storefront in a small strip mall located on the outskirts of town that is also occupied by a pharmacy and a dry cleaner"],
    correctIndex: 1,
    answerText: "b) a little shop three blocks away from the town's main street, located across the street from an elementary school and next door to an ice cream store",
    solution: "Explanation: This option is both near the center of town and in a location (near a school and an ice cream store) where children and their parents are sure to be around. This is the only option that meets both of Mark's requirements."
  },
  {
    id: 7,
    question: "7. The neighborhood block association has received many complaints about people knocking on doors and soliciting money for an unknown charity organization even though door-to-door solicitation is prohibited by local laws. Three residents have provided descriptions of individuals who have come to their door asking for money. Solicitor #1 is a white male, 20-25 years old, 5'9\", 145 pounds, with very short brown hair. He was wearing a dark blue suit and carrying a brown leather briefcase. Solicitor #2 is a white male, 25-30 years old, 6'2\", 200 pounds, with a shaved-head. He was wearing a red T-shirt and jeans. Solicitor #3 is a white male, approximately 23 years old, 5'10\", slight build, with short brown hair. He was wearing a blue suit. Three days after the block association meet- ing, a resident noticed a man knocking on doors in the neighborhood and phoned the police to report the illegal activity. This solic- itor was described as follows: Solicitor #4 is a white male, 22 years old, 140 pounds, about 5'10\", with short brown hair. He was carrying a briefcase and wearing a dark suit. Based on this description, which of the three solicitations was also likely carried out by Solicitor #4?",
    options: ["a) #1, #2, and #3", "b) #1, but not #2 and #3", "c) #1 and #3, but not #2", "d) #1 and #2, but not #3"],
    correctIndex: 2,
    answerText: "c) #1 and #3, but not #2",
    solution: "Explanation: The solicitor described as #2 has a shaved head and is much taller and heavier than the solicitors described as #1 and #3. Therefore, choices a and d, which include #2, can be ruled out. Solicitors #1, #3, and #4 have such similar descriptions that the correct answer is clearly choice c."
  },
  {
    id: 8,
    question: "8. Rita, an accomplished pastry chef who is well known for her artistic and exquisite wedding cakes, opened a bakery one year ago and is surprised that business has been so slow. A consultant she hired to conduct market research has reported that the local population doesn't think of her shop as one they would visit on a daily basis but rather a place they'd visit if they were celebrating a special occasion. Which of the following strategies should Rita employ to increase her daily business?",
    options: ["a) making coupons available that entitle the coupon holder to receive a 25% discount on wedding, anniversary, or birthday cakes", "b) exhibiting at the next Bridal Expo and having pieces of one of her wedding cakes available for tasting", "c) placing a series of ads in the local newspaper that advertise the wide array of breads", "d) moving the bakery to the other side of town"],
    correctIndex: 2,
    answerText: "c) placing a series of ads in the local newspaper that advertise the wide array of breads",
    solution: "Explanation: This is the only option that would encourage people to think of the bakery as a shop they would visit regularly and not just on special occasions."
  },
  {
    id: 9,
    question: "9. Dr. Miller has a busy pediatric dentistry practice and she needs a skilled, reliable hygienist to keep things running smoothly. The last two people she hired were recommended by top dentists in the area, but they each lasted less than one month. She is now in desperate need of a hygienist who can competently handle the specific challenges of her practice. Which one of the following candidates should Dr. Miller consider most seriously?",
    options: ["a) Marilyn has been a hygienist for fifteen years, and her current employer, who is about to retire, says she is the best in the business. The clientele she has worked with consists of some of the wealthiest and most powerful citizens in the county.", "b) Lindy recently graduated at the top of her class from one of the best dental hygiene programs in the state. Prior to becoming a dental hygienist, Lindy spent two years working in a day care center.", "c) James has worked as a dental hygienist for three years in a public health clinic. He is very interested in securing a position in a private dental office.", "d) Kathy is an experienced and highly recommended dental hygienist who is also finishing up a degree in early childhood education, which she hopes will get her a job as a preschool teacher. She is eager to find a job in a pediatric practice, since she has always wanted to work with children."],
    correctIndex: 1,
    answerText: "b) Lindy recently graduated at the top of her class from one of the best dental hygiene programs in the state. Prior to becoming a dental hygienist, Lindy spent two years working in a day care center.",
    solution: "Explanation: The situation described indicates that Dr. Miller's practice presents some specific challenges, namely that it is a busy environment with a child clientele. There is also some indication that even highly recommended, experienced hygienists might not be cut out for Dr. Miller's office. There is nothing to suggest that Marilyn (choice a) or James (choice c) would be a good fit for Dr.Miller's practice. Kathy (choice d) has experience and she is also interested in working with children. However, the fact that she hopes to become a preschool teacher in the not-too-distant future indicates that she might not be the kind of committed, long-term employee that Dr. Miller needs. Lindy (choice b), with her hands-on experience working with children as well as a degree from a prestigious dental hygiene program, is the most attractive candidate for the position based on the situation described"
  },
  {
    id: 10,
    question: "10. Mrs. Jansen recently moved to Arizona. She wants to fill her new backyard with flowering plants. Although she is an experienced gardener, she isn't very well-versed in what plants will do well in the Arizona climate. Also, there is a big tree in her backyard making for shady conditions and she isn't sure what plants will thrive without much direct sunlight. Her favorite gardening catalog offers several backyard seed packages. Which one should Mrs. Jansen choose?",
    options: ["a) The Rainbow Collection is ideal for North-east gardens. It includes a variety of colorful perennials that thrive in cool, moist conditions.", "b) The Greenhouse Collection will blossom year after year if planted in brightly lit locations and watered regularly.", "c) The Treehouse Collection will provide lush green plants with delicate colorful flowers that thrive in shady and partially shady locations.", "d) The Oasis Collection includes a variety of perennials that thrive in dry climates and bright sunlight."],
    correctIndex: 2,
    answerText: "c) The Treehouse Collection will provide lush green plants with delicate colorful flowers that thrive in shady and partially shady locations.",
    solution: "Explanation: The Treehouse Collection is the only package that can thrive in shady locations. Choice a requires a Northeastern climate. Choices b and d require bright sunlight."
  },
];

export const VERBAL_REASONING_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Vincent has a paper route. Each morning, he delivers 37 newspapers to customers in his neighborhood. It takes Vincent 50 minutes to deliver all the papers. If Vincent is sick or has other plans, his friend Thomas, who lives on the same street, will sometimes deliver the papers for him.",
    options: ["a) Vincent and Thomas live in the same neighborhood.", "b) It takes Thomas more than 50 minutes to deliver the papers.", "c) It is dark outside when Vincent begins his deliveries.", "d) Thomas would like to have his own paper route."],
    correctIndex: 0,
    answerText: "a) Vincent and Thomas live in the same neighborhood.",
    solution: "Explanation: The fact that Vincent and Thomas live on the same street indicates that they live in the same neighborhood. There is no support for any of the other choices."
  },
  {
    id: 2,
    question: "2. The Pacific yew is an evergreen tree that grows in the Pacific Northwest. The Pacific yew has a fleshy, poisonous fruit. Recently, taxol, a substance found in the bark of the Pacific yew, was discovered to be a promising new anticancer drug.",
    options: ["a) Taxol is poisonous when taken by healthy people.", "b) Taxol has cured people from various diseases.", "c) People should not eat the fruit of the Pacific yew.", "d) The Pacific yew was considered worthless until taxol was discovered."],
    correctIndex: 2,
    answerText: "c) People should not eat the fruit of the Pacific yew.",
    solution: "Explanation: Given the information presented, the only statement that could be considered true is that the fruit should not be eaten because it is poisonous. There is no support that taxol is poisonous or that taxol has cured anyone (choices a and b). There is no support for choice d."
  },
  {
    id: 3,
    question: "3. Erin is twelve years old. For three years, she has been asking her parents for a dog. Her parents have told her that they believe a dog would not be happy in an apartment, but they have given her permission to have a bird. Erin has not yet decided what kind of bird she would like to have.",
    options: ["a) Erin's parents like birds better than they like dogs.", "b) Erin does not like birds.", "c) Erin and her parents live in an apartment.", "d) Erin and her parents would like to move."],
    correctIndex: 2,
    answerText: "c) Erin and her parents live in an apartment.",
    solution: "Explanation: Since Erin's parents think a dog would not be happy in an apartment, we can reasonably conclude that the family lives in an apartment. We do not know if Erin's parents dislike dogs (choice a) or if Erin dislikes birds (choice b).There is no support for choice d."
  },
  {
    id: 4,
    question: "4. Tim's commute never bothered him because there were always seats available on the train and he was able to spend his 40 minutes comfortably reading the newspaper or catching up on paperwork. Ever since the train schedule changed, the train has been extremely crowded, and by the time the doors open at his station, there isn't a seat to be found.",
    options: ["a) Tim would be better off taking the bus to work.", "b) Tim's commute is less comfortable since the train schedule changed.", "c) Many commuters will complain about the new train schedule.", "d) Tim will likely look for a new job closer to home."],
    correctIndex: 1,
    answerText: "b) Tim's commute is less comfortable since the train schedule changed.",
    solution: "Explanation: The passage tells us that Tim's commute didn't bother him because he was always able to sit down and comfortably read or do paperwork. Therefore, it is reasonable to assume that Tim's commute has become less comfortable since the schedule change, because it is very crowded and he can no longer find a seat. There is no information given that supports choices a, c, and d."
  },
  {
    id: 5,
    question: "5. When they heard news of the hurricane, Maya and Julian decided to change their vacation plans. Instead of traveling to the island beach resort, they booked a room at a fancy new spa in the mountains. Their plans were a bit more expensive, but they'd heard wonderful things about the spa and they were relieved to find availability on such short notice.",
    options: ["a) Maya and Julian take beach vacations every year.", "b) The spa is overpriced.", "c) It is usually necessary to book at least six months in advance at the spa.", "d) Maya and Julian decided to change their vacation plans because of the hurricane."],
    correctIndex: 3,
    answerText: "d) Maya and Julian decided to change their vacation plans because of the hurricane.",
    solution: "Explanation: The first sentence makes this statement true. There is no support for choice a. The passage tells us that the spa vacation is more expensive than the island beach resort vacation, but that doesn't necessarily mean that the spa is overpriced; therefore, choice b cannot be supported. And even though the paragraph says that the couple was relieved to find a room on short notice, there is no information to support choice c, which says that it is usually necessary to book at the spa at least six months in advance."
  },
  {
    id: 6,
    question: "6. Ten new television shows appeared during the month of September. Five of the shows were sitcoms, three were hour-long dramas, and two were news-magazine shows. By January, only seven of these new shows were still on the air. Five of the shows that remained were sitcoms.",
    options: ["a) Only one of the news-magazine shows remained on the air.", "b) Only one of the hour-long dramas remained on the air.", "c) At least one of the shows that was cancelled was an hour-long drama.", "d) Television viewers prefer sitcoms over hour-long dramas."],
    correctIndex: 2,
    answerText: "c) At least one of the shows that was cancelled was an hour-long drama.",
    solution: "Explanation: If there were seven shows left and five were sitcoms, this means that only two of the shows could possibly be dramas. Choices a and b may be true, but there is no evidence to indicate this as fact. The fact that all of the sitcoms remained does not necessarily mean that viewers prefer sitcoms (choice d)."
  },
  {
    id: 7,
    question: "7. On weekends, Mr. Sanchez spends many hours working in his vegetable and flower gardens. Mrs. Sanchez spends her free time reading and listening to classical music. Both Mr. Sanchez and Mrs. Sanchez like to cook.",
    options: ["a) Mr. Sanchez enjoys planting and growing vegetables.", "b) Mr. Sanchez does not like classical music.", "c) Mrs. Sanchez cooks the vegetables that Mr. Sanchez grows.", "d) Mrs. Sanchez enjoys reading nineteenth century novels."],
    correctIndex: 0,
    answerText: "a) Mr. Sanchez enjoys planting and growing vegetables.",
    solution: "Explanation: Because Mr. Sanchez spends many hours during the weekend working in his vegetable garden, it is reasonable to suggest that he enjoys this work. There is no information to suggest that he does not like classical music. Although Mrs. Sanchez likes to cook, there is nothing that indicates she cooks vegetables (choice c). Mrs. Sanchez likes to read, but there is no information regarding the types of books she reads (choice d)."
  },
  {
    id: 8,
    question: "8. Georgia is older than her cousin Marsha. Marsha's brother Bart is older than Georgia. When Marsha and Bart are visiting with Georgia, all three like to play a game of Monopoly. Marsha wins more often than Georgia does.",
    options: ["a) When he plays Monopoly with Marsha and Georgia, Bart often loses.", "b) Of the three, Georgia is the oldest.", "c) Georgia hates to lose at Monopoly.", "d) Of the three, Marsha is the youngest."],
    correctIndex: 3,
    answerText: "d) Of the three, Marsha is the youngest.",
    solution: "Explanation: If Georgia is older than Marsha and Bart is older than Georgia, then Marsha has to be the youngest of the three. Choice b is clearly wrong because Bart is the oldest. There is no information in the paragraph to support either choice a or choice c."
  },
  {
    id: 9,
    question: "9. Sara lives in a large city on the East Coast. Her younger cousin Marlee lives in the Mid-west in a small town with fewer than 1,000 residents. Marlee has visited Sara several times during the past five years. In the same period of time, Sara has visited Marlee only once.",
    options: ["a) Marlee likes Sara better than Sara likes Marlee.", "b) Sara thinks small towns are boring.", "c) Sara is older than Marlee.", "d) Marlee wants to move to the East Coast."],
    correctIndex: 2,
    answerText: "c) Sara is older than Marlee.",
    solution: "Explanation: Since the paragraph states that Marlee is the younger cousin, Sara must be older than Marlee. There is no information to support the other choices."
  },
];

export const LOGICAL_PROBLEMS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Tanya is older than Eric. Cliff is older than Tanya. Eric is older than Cliff. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 1,
    answerText: "b) false",
    solution: "Explanation: Because the first two statements are true, Eric is the youngest of the three, so the third statement must be false."
  },
  {
    id: 2,
    question: "2. Blueberries cost more than strawberries. Blueberries cost less than raspberries. Raspberries cost more than strawberries and blueberries. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: Because the first two statements are true, raspberries are the most expensive of the three."
  },
  {
    id: 3,
    question: "3. All the trees in the park are flowering trees. Some of the trees in the park are dogwoods. All dogwoods in the park are flowering trees. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: All of the trees in the park are flowering trees, So all dogwoods in the park are flowering trees."
  },
  {
    id: 4,
    question: "4. Mara runs faster than Gail. Lily runs faster than Mara. Gail runs faster than Lily. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 1,
    answerText: "b) false",
    solution: "Explanation: We know from the first two statements that Lily runs fastest. Therefore, the third statement must be false."
  },
  {
    id: 5,
    question: "5. Apartments in the Riverdale Manor cost less than apartments in The Gaslight Commons. Apartments in the Livingston Gate cost more than apartments in the The Gaslight Commons. Of the three apartment buildings, the Livingston Gate costs the most. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: Since the Gaslight Commons costs more than the Riverdale Manor and the Livingston Gate costs more than the Gaslight Commons, it is true that the Livingston Gate costs the most."
  },
  {
    id: 6,
    question: "6. The Kingston Mall has more stores than the Galleria. The Four Corners Mall has fewer stores than the Galleria. The Kingston Mall has more stores than the Four Corners Mall. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: From the first two statements, you know that the Kingston Mall has the most stores, so the Kingston Mall would have more stores than the Four Corners Mall."
  },
  {
    id: 7,
    question: "7. All the tulips in Zoe's garden are white. All the pansies in Zoe's garden are yellow. All the flowers in Zoe's garden are either white or yellow If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 2,
    answerText: "c) uncertain",
    solution: "Explanation: The first two statements give information about Zoe's tulips and pansies. Information about any other kinds of flowers cannot be determined."
  },
  {
    id: 8,
    question: "8. During the past year, Josh saw more movies than Stephen. Stephen saw fewer movies than Darren. Darren saw more movies than Josh. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 2,
    answerText: "c) uncertain",
    solution: "Explanation: Because the first two sentences are true, both Josh and Darren saw more movies than Stephen. However, it is uncertain as to whether Darren saw more movies than Josh."
  },
  {
    id: 9,
    question: "9. Rover weighs less than Fido. Rover weighs more than Boomer. Of the three dogs, Boomer weighs the least. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: According to the first two statements, Fido weighs the most and Boomer weighs the least."
  },
  {
    id: 10,
    question: "10. All the offices on the 9th floor have wall-to-wall carpeting. No wall-to-wall carpeting is pink. None of the offices on the 9th floor has pink wall-to-wall carpeting. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: If no wall-to-wall carpeting is pink and all the offices have wall-to-wall carpeting, none of the offices has pink wall-to-wall carpeting."
  },
  {
    id: 11,
    question: "11. Class A has a higher enrollment than Class B. Class C has a lower enrollment than Class B. Class A has a lower enrollment than Class C. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 1,
    answerText: "b) false",
    solution: "Explanation: From the first two statements, we know that of the three classes, Class A has the highest enrollment, so the third statement must be false."
  },
  {
    id: 12,
    question: "12. A fruit basket contains more apples than lemons. There are more lemons in the basket than there are oranges. The basket contains more apples than oranges. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: There are fewer oranges than either apples or lemons, so the statement is true. Easy method: (Try this method to solve without any confusion) 1. A fruit basket contains more apples than lemons = App > Lem 2. There are more lemons in the basket than there are oranges = Lem > Org Now, Combine the above two results: App > Lem > Org 3. The basket contains more apples than oranges (App > ... > Org) = Yes. Therefore, the given 3rd statement is true."
  },
  {
    id: 13,
    question: "13. The Shop and Save Grocery is south of Greenwood Pharmacy. Rebecca's house is northeast of Greenwood Pharmacy. Rebecca's house is west of the Shop and Save Grocery. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 1,
    answerText: "b) false",
    solution: "Explanation: Because the first two statements are true, Rebecca's house is also northeast of the Shop and Save Grocery, which means that the third statement is false."
  },
  {
    id: 14,
    question: "14. Joe is younger than Kathy. Mark was born after Joe. Kathy is older than Mark. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: Joe is younger than Kathy and older than Mark, so Mark must be younger than Kathy."
  },
  {
    id: 15,
    question: "15. On the day the Barton triplets are born, Jenna weighs more than Jason. Jason weighs less than Jasmine. Of the three babies, Jasmine weighs the most. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 2,
    answerText: "c) uncertain",
    solution: "Explanation: We only know that Jasmine weighs more than Jason. There is no way to tell whether Jasmine also weighs more than Jenna."
  },
  {
    id: 16,
    question: "16. The temperature on Monday was lower than on Tuesday. The temperature on Wednesday was lower than on Tuesday. The temperature on Monday was higher than on Wednesday If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 2,
    answerText: "c) uncertain",
    solution: "Explanation: We know from the first two statements that Tuesday had the highest temperature, but we cannot know whether Monday's temperature was higher than Wednesday's"
  },
  {
    id: 17,
    question: "17. Oat cereal has more fiber than corn cereal but less fiber than bran cereal. Corn cereal has more fiber than rice cereal but less fiber than wheat cereal. Of the three kinds of cereal, rice cereal has the least amount of fiber. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: From the first statement, we know that bran cereal has more fiber than both oat cereal and corn cereal. From the second statement, we know that rice cereal has less fiber than both corn and wheat cereals. Therefore, rice cereal has the least amount of fiber."
  },
  {
    id: 18,
    question: "18. Martina is sitting in the desk behind Jerome. Jerome is sitting in the desk behind Bryant. Bryant is sitting in the desk behind Martina. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 1,
    answerText: "b) false",
    solution: "Explanation: Given the information in the first two statements, Bryant is sitting in front of both Jerome and Martina, so the third statement must be false."
  },
  {
    id: 19,
    question: "19. Battery X lasts longer than Battery Y. Battery Y doesn't last as long as Battery Z. Battery Z lasts longer than Battery X. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 2,
    answerText: "c) uncertain",
    solution: "Explanation: The first two statements indicate that Battery Y lasts the least amount of time, but it cannot be determined if Battery Z lasts longer than Battery X."
  },
  {
    id: 20,
    question: "20. Spot is bigger than King and smaller than Sugar. Ralph is smaller than Sugar and bigger than Spot. King is bigger than Ralph. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 1,
    answerText: "b) false",
    solution: "Explanation: Spot is bigger than King, and Ralph is bigger than Spot. Therefore, King must be smaller than Ralph."
  },
  {
    id: 21,
    question: "21. Middletown is north of Centerville. Centerville is east of Penfield. Penfield is northwest of Middletown. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 1,
    answerText: "b) false",
    solution: "Explanation: Because the first two statements are true, Penfield is west of Centerville and southwest of Middletown. Therefore, the third statement is false."
  },
  {
    id: 22,
    question: "22. All spotted Gangles have long tails. Short-haired Gangles always have short tails. Long-tailed Gangles never have short hair. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 2,
    answerText: "c) uncertain",
    solution: "Explanation: We know only that long-tailed Gangles have spots. We cannot know for certain if long-tailed Gangles also have short hair."
  },
  {
    id: 23,
    question: "23. All Lamels are Signots with buttons. No yellow Signots have buttons. No Lamels are yellow. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: We know that there are Signots with buttons, or Lamels, and that there are yellow Signots, which have no buttons. Therefore, Lamels do not have buttons and cannot be yellow."
  },
  {
    id: 24,
    question: "24. The hotel is two blocks east of the drugstore. The market is one block west of the hotel. The drugstore is west of the market. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: The market is one block west of the hotel. The drugstore is two blocks west of the hotel, so the drugstore is west of the market."
  },
  {
    id: 25,
    question: "25. A toothpick is useful. Useful things are valuable. A toothpick is valuable. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: To the extent that a toothpick is useful, it has value."
  },
  {
    id: 26,
    question: "26. Tom puts on his socks before he puts on his shoes. He puts on his shirt before he puts on his jacket. Tom puts on his shoes before he puts on his shirt. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 2,
    answerText: "c) uncertain",
    solution: "Explanation: There is not enough information to verify the third statement."
  },
  {
    id: 27,
    question: "27. Three pencils cost the same as two erasers. Four erasers cost the same as one ruler. Pencils are more expensive than rulers. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 1,
    answerText: "b) false",
    solution: "Explanation: Rulers are the most expensive item."
  },
  {
    id: 28,
    question: "28. Taking the train across town is quicker than taking the bus. Taking the bus across town is slower than driving a car. Taking the train across town is quicker than driving a car. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 2,
    answerText: "c) uncertain",
    solution: "Explanation: Both the car and the train are quicker than the bus, but there is no way to make a comparison between the train and the car."
  },
  {
    id: 29,
    question: "29. Cloudy days tend to be more windy than sunny days. Foggy days tend to be less windy than cloudy days. Sunny days tend to be less windy than foggy days. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 2,
    answerText: "c) uncertain",
    solution: "Explanation: Cloudy days are the most windy, but there is not enough information to compare the wind on the foggy days with the wind on the sunny days."
  },
  {
    id: 30,
    question: "30. At a parking lot, a sedan is parked to the right of a pickup and to the left of a sport utility vehicle. A minivan is parked to the left of the pickup. The minivan is parked between the pickup and the sedan. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 1,
    answerText: "b) false",
    solution: "Explanation: This is the order of the cars from left to right: minivan, pickup, sedan, sport utility vehicle."
  },
  {
    id: 31,
    question: "31. The bookstore has a better selection of postcards than the newsstand does. The selection of postcards at the drugstore is better than at the bookstore. The drugstore has a better selection of postcards than the bookstore or the newsstand. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 0,
    answerText: "a) true",
    solution: "Explanation: Of the three, the drugstore has the best selection of postcards."
  },
  {
    id: 32,
    question: "32. A jar of jelly beans contains more red beans than green. There are more yellow beans than red. The jar contains fewer yellow jelly beans than green ones. If the first two statements are true, the third statement is",
    options: ["a) true", "b) false", "c) uncertain"],
    correctIndex: 1,
    answerText: "b) false",
    solution: "Explanation: The first two statements indicate there are more yellow jelly beans than red and green."
  },
  {
    id: 33,
    question: "33. Fact 1: All dogs like to run. Fact 2: Some dogs like to swim. Fact 3: Some dogs look like their masters. If the first three statements are facts, which of the following statements must also be a fact? I: All dogs who like to swim look like their masters. II: Dogs who like to swim also like to run. III: Dogs who like to run do not look like their masters.",
    options: ["a) I only", "b) II only", "c) II and III only", "d) None of the statements is a known fact."],
    correctIndex: 1,
    answerText: "b) II only",
    solution: "Explanation: Statement II is the only true statement. Since all dogs like to run, then the ones who like to swim also like to run. There is no support for statement I or statement III."
  },
  {
    id: 34,
    question: "34. Fact 1: Jessica has four children Fact 2: Two of the children have blue eyes and two of the children have brown eyes. Fact 3: Half of the children are girls. If the first three statements are facts, which of the following statements must also be a fact? I: At least one girl has blue eyes. II: Two of the children are boys. III: The boys have brown eyes.",
    options: ["a) I only", "b) II only", "c) II and III only", "d) None of the statements is a known fact."],
    correctIndex: 1,
    answerText: "b) II only",
    solution: "Explanation: Since one-half of the four children are girls, two must be boys. It is not clear which children have blue or brown eyes."
  },
  {
    id: 35,
    question: "35. Fact 1: All drink mixes are beverages. Fact 2: All beverages are drinkable. Fact 3: Some beverages are red. If the first three statements are facts, which of the following statements must also be a fact? I: Some drink mixes are red. II: All beverages are drink mixes. III: All red drink mixes are drinkable.",
    options: ["a) I and II only", "b) II only", "c) I and III only", "d) III only", "e) None of the statements is a known fact."],
    correctIndex: 3,
    answerText: "d) III only",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 36,
    question: "36. Fact 1: All chickens are birds. Fact 2: Some chickens are hens. Fact 3: Female birds lay eggs. If the first three statements are facts, which of the following statements must also be a fact? I: All birds lay eggs. II: Some Hens are birds. III: Some chickens are not hens.",
    options: ["a) I only", "b) II only", "c) II and III only", "d) None of the statements is a known fact."],
    correctIndex: 2,
    answerText: "c) II and III only",
    solution: "Explanation: The first statement cannot be true because only female birds lay eggs. Statement II is true because some hens are chickens and all chickens are birds. Statement III is also true because if only some chickens are hens, then some must not be hens."
  },
  {
    id: 37,
    question: "37. Fact 1: All hats have brims. Fact 2: There are black hats and blue hats. Fact 3: Baseball caps are hats. If the first three statements are facts, which of the following statements must also be a fact? I: All caps have brims. II: Some baseball caps are blue. III: Baseball caps have no brims.",
    options: ["a) I only", "b) II only", "c) II and III only", "d) None of the statements is a known fact."],
    correctIndex: 3,
    answerText: "d) None of the statements is a known fact.",
    solution: "Explanation: All baseball caps have brims, since baseball caps are hats (Fact 3) and all hats have brims (Fact 1). This rules out statement III, but it doesn't follow that all caps, a category that may include caps that are not baseball caps, have brims (statement I). Statement II cannot be confirmed, either, since it is possible, given the information, that all baseball caps are black."
  },
  {
    id: 38,
    question: "38. Fact 1: Eyeglass frames cost between $35 and $350. Fact 2: Some eyeglass frames are made of titanium. Fact 3: Some eyeglass frames are made of plastic. If the first three statements are facts, which of the following statements must also be a fact? I: Titanium eyeglass frames cost more than plastic frames. II: Expensive eyeglass frames last longer than cheap frames. III: Only a few eyeglass frames cost less than $35.",
    options: ["a) I only", "b) II only", "c) II and III only", "d) None of the statements is a known fact."],
    correctIndex: 3,
    answerText: "d) None of the statements is a known fact.",
    solution: "Explanation: There is no information in the facts to support statements I or II. Statement III is clearly wrong because, according to Fact 1, no frames cost less than $35."
  },
  {
    id: 39,
    question: "39. Fact 1: Most stuffed toys are stuffed with beans. Fact 2: There are stuffed bears and stuffed tigers. Fact 3: Some chairs are stuffed with beans. If the first three statements are facts, which of the following statements must also be a fact? I: Only children's chairs are stuffed with beans. II: All stuffed tigers are stuffed with beans. III: Stuffed monkeys are not stuffed with beans.",
    options: ["a) I only", "b) II only", "c) II and III only", "d) None of the statements is a known fact."],
    correctIndex: 3,
    answerText: "d) None of the statements is a known fact.",
    solution: "Explanation: None of the three statements is supported by the known facts."
  },
  {
    id: 40,
    question: "40. Fact 1: Mary said, \"Ann and I both have cats.\" Fact 2: Ann said, \"I don't have a cat.\" Fact 3: Mary always tells the truth, but Ann sometimes lies. If the first three statements are facts, which of the following statements must also be a fact? I: Ann has a cat. II: Mary has a cat. III: Ann is lying.",
    options: ["a) I only", "b) II only", "c) I and II only", "d) All the statements are facts."],
    correctIndex: 3,
    answerText: "d) All the statements are facts.",
    solution: "Explanation: If Mary always tells the truth, then both Ann and Mary have cats (statements I and II), and Ann is lying (statement III). So all the statements are facts."
  },
  {
    id: 41,
    question: "41. Fact 1: Pictures can tell a story. Fact 2: All storybooks have pictures. Fact 3: Some storybooks have words. If the first three statements are facts, which of the following statements must also be a fact? I: Pictures can tell a story better than words can. II: The stories in storybooks are very simple. III: Some storybooks have both words and pictures.",
    options: ["a) I only", "b) II only", "c) III only", "d) None of the statements is a known fact."],
    correctIndex: 2,
    answerText: "c) III only",
    solution: "Explanation: Statements I and II are not supported by the facts. Statement III is true because if all story-books have pictures and only some have words, then some storybooks have both words and pictures."
  },
  {
    id: 42,
    question: "42. Fact 1: Some pens don't write. Fact 2: All blue pens write. Fact 3: Some writing utensils are pens. If the first three statements are facts, which of the following statements must also be a fact? I: Some writing utensils don't write. II: Some writing utensils are blue. III: Some blue writing utensils don't write.",
    options: ["a) I only", "b) I and II only", "c) II and III only", "d) None of the statements is a known fact."],
    correctIndex: 1,
    answerText: "b) I and II only",
    solution: "Explanation: Since some pens don't write, some writing utensils don't write (statement I). Since there are blue pens and since pens are writing utensils, some writing utensils are blue (statement II). There is not enough information to support statement III."
  },
  {
    id: 43,
    question: "43. Fact 1: Islands are surrounded by water. Fact 2: Maui is an island. Fact 3: Maui was formed by a volcano. If the first three statements are facts, which of the following statements must also be a fact? I: Maui is surrounded by water. II: All islands are formed by volcanoes. III: All volcanoes are on islands.",
    options: ["a) I only", "b) II only", "c) II and III only", "d) None of the statements is a known fact."],
    correctIndex: 0,
    answerText: "a) I only",
    solution: "Explanation: Since Maui is an island and islands are surrounded by water,Maui must be surrounded by water. There is not enough information to support statements II and III."
  },
  {
    id: 44,
    question: "44. Fact 1: Robert has four vehicles. Fact 2: Two of the vehicles are red. Fact 3: One of the vehicles is a minivan. If the first three statements are facts, which of the following statements must also be a fact? I: Robert has a red minivan. II: Robert has three cars. III: Robert's favorite color is red.",
    options: ["a) I only", "b) II only", "c) II and III only", "d) None of the statements is a known fact."],
    correctIndex: 3,
    answerText: "d) None of the statements is a known fact.",
    solution: "Explanation: There is not enough information to support any of the statements. Robert is known to have a minvan, but it is not known which of his vehicles is red. Robert may have a pickup or sport utility vehicle, so the second statement cannot be supported. There is no way to know if Robert's favorite color is red (statement III)."
  },
  {
    id: 45,
    question: "45. Four defensive football players are chasing the opposing wide receiver, who has the ball. Calvin is directly behind the ball carrier. Jenkins and Burton are side by side behind Calvin. Zeller is behind Jenkins and Burton. Calvin tries for the tackle but misses and falls. Burton trips. Which defensive player tackles the receiver?",
    options: ["a) Burton", "b) Zeller", "c) Jenkins", "d) Calvin"],
    correctIndex: 2,
    answerText: "c) Jenkins",
    solution: "Explanation: After all the switching was done, Jenkins was directly behind the receiver. Calvin and Burton had fallen. Zeller remained in the rear."
  },
  {
    id: 46,
    question: "46. A four-person crew from Classic Colors is painting Mr. Field's house. Michael is painting the front of the house. Ross is in the alley behind the house painting the back. Jed is painting the window frames on the north side, Shawn is on the south. If Michael switches places with Jed, and Jed then switches places with Shawn, where is Shawn?",
    options: ["a) in the alley behind the house", "b) on the north side of the house", "c) in front of the house", "d) on the south side of the house"],
    correctIndex: 2,
    answerText: "c) in front of the house",
    solution: "Explanation: After all the switches were made, Shawn is in front of the house. Ross is in the alley behind the house,Michael is on the north side, and Jed is on the south."
  },
  {
    id: 47,
    question: "47. In a four-day period Monday through Thursday each of the following temporary office workers worked only one day, each a different day. Ms. Johnson was scheduled to work on Monday, but she traded with Mr. Carter, who was originally scheduled to work on Wednesday. Ms. Falk traded with Mr. Kirk, who was originally scheduled to work on Thursday. After all the switching was done, who worked on Tuesday?",
    options: ["a) Mr. Carter", "b) Ms. Falk", "c) Ms. Johnson", "d) Mr. Kirk"],
    correctIndex: 3,
    answerText: "d) Mr. Kirk",
    solution: "Explanation: After all the switches were made, Mr. Kirk worked on Tuesday. Mr. Carter worked on Monday,Ms. Johnson on Wednesday, and Ms. Falk on Thursday."
  },
  {
    id: 48,
    question: "48. Four people witnessed a mugging. Each gave a different description of the mugger. Which description is probably right?",
    options: ["a) He was average height, thin, and middle-aged.", "b) He was tall, thin, and middle-aged.", "c) He was tall, thin, and young.", "d) He was tall, of average weight, and middle-aged."],
    correctIndex: 1,
    answerText: "b) He was tall, thin, and middle-aged.",
    solution: "Explanation: Tall, thin, and middle-aged are the elements of the description repeated most often and are therefore the most likely to be accurate."
  },
  {
    id: 49,
    question: "49. Ms. Forest likes to let her students choose who their partners will be; however, no pair of students may work together more than seven class periods in a row. Adam and Baxter have studied together seven class periods in a row. Carter and Dennis have worked together three class periods in a row. Carter does not want to work with Adam. Who should be assigned to work with Baxter?",
    options: ["a) Carter", "b) Adam", "c) Dennis", "d) Forest"],
    correctIndex: 0,
    answerText: "a) Carter",
    solution: "Explanation: Baxter should be assigned to study with Carter. Baxter cannot be assigned with Adam, because they have already been together for seven class periods. If Baxter is assigned to work with Dennis, that would leave Adam with Carter, but Carter does not want to work with Adam."
  },
  {
    id: 50,
    question: "50. At the baseball game, Henry was sitting in seat 253. Marla was sitting to the right of Henry in seat 254. In the seat to the left of Henry was George. Inez was sitting to the left of George. Which seat is Inez sitting in?",
    options: ["a) 251", "b) 254", "c) 255", "d) 256"],
    correctIndex: 0,
    answerText: "a) 251",
    solution: "Explanation: If George is sitting at Henry's left, George's seat is 252. The next seat to the left, then, is 251."
  },
  {
    id: 51,
    question: "51. As they prepare for the state championships, one gymnast must be moved from the Level 2 team to the Level 1 team. The coaches will move the gymnast who has won the biggest prize and who has the most experience. In the last competition, Roberta won a bronze medal and has competed seven times before. Jamie has won a silver medal and has competed fewer times than Roberta. Beth has won a higher medal than Jamie and has competed more times than Roberta. Michele has won a bronze medal, and it is her third time competing. Who will be moved to the Level 1 team?",
    options: ["a) Roberta", "b) Beth", "c) Michele", "d) Jamie"],
    correctIndex: 1,
    answerText: "b) Beth",
    solution: "Explanation: Beth won the biggest prize, described as a higher medal than Jamie's, which we've been told was a silver medal. Roberta and Michele both won bronze medals, which are lower ranking medals than silver. Beth is also described as having competed more times than Roberta who has competed seven times. Jamie is described as having competed fewer times than Roberta, and Michele has competed three times. Therefore, Beth has competed more times than the others and has won the biggest prize to date."
  },
  {
    id: 52,
    question: "52. Four friends in the sixth grade were sharing a pizza. They decided that the oldest friend would get the extra piece. Randy is two months older than Greg, who is three months younger than Ned. Kent is one month older than Greg. Who should get the extra piece of pizza?",
    options: ["a) Randy", "b) Greg", "c) Ned", "d) Kent"],
    correctIndex: 2,
    answerText: "c) Ned",
    solution: "Explanation: If Randy is two months older than Greg, then Ned is three months older than Greg and one month older than Randy. Kent is younger than both Randy and Ned. Ned is the oldest."
  },
  {
    id: 53,
    question: "53. The high school math department needs to appoint a new chairperson, which will be based on seniority. Ms. West has less seniority than Mr. Temple, but more than Ms. Brody. Mr. Rhodes has more seniority than Ms. West, but less than Mr. Temple. Mr. Temple doesn't want the job. Who will be the new math department chairperson?",
    options: ["a) Mr. Rhodes", "b) Mr. Temple", "c) Ms.West", "d) Ms. Brody"],
    correctIndex: 0,
    answerText: "a) Mr. Rhodes",
    solution: "Explanation: Mr. Temple has the most seniority, but he does not want the job. Next in line is Mr. Rhodes, who has more seniority than Ms. West or Ms. Brody."
  },
  {
    id: 54,
    question: "54. Danielle has been visiting friends in Ridge-wood for the past two weeks. She is leaving tomorrow morning and her flight is very early. Most of her friends live fairly close to the airport. Madison lives ten miles away. Frances lives five miles away, Samantha, seven miles. Alexis is farther away than Frances, but closer than Samantha. Approximately how far away from the airport is Alexis?",
    options: ["a) nine miles", "b) seven miles", "c) eight miles", "d) six miles"],
    correctIndex: 3,
    answerText: "d) six miles",
    solution: "Explanation: Alexis is farther away than Frances, who is five miles away, and closer than Samantha, who is seven miles away."
  },
  {
    id: 55,
    question: "55. Nurse Kemp has worked more night shifts in a row than Nurse Rogers, who has worked five. Nurse Miller has worked fifteen night shifts in a row, more than Nurses Kemp and Rogers combined. Nurse Calvin has worked eight night shifts in a row, less than Nurse Kemp. How many night shifts in a row has Nurse Kemp worked?",
    options: ["a) eight", "b) nine", "c) ten", "d) eleven"],
    correctIndex: 1,
    answerText: "b) nine",
    solution: "Explanation: Nurse Kemp has worked more shifts in a row than Nurse Calvin; therefore, Kemp has worked more than eight shifts. The number of Kemp's shifts plus the number of Rogers's shifts (five) cannot equal fifteen or more, the number of Miller's shifts. Therefore, Kemp has worked nine shifts in a row (5 + 9 = 14)."
  },
  {
    id: 56,
    question: "56. Children are in pursuit of a dog whose leash has broken. James is directly behind the dog. Ruby is behind James. Rachel is behind Ruby. Max is ahead of the dog walking down the street in the opposite direction. As the children and dog pass, Max turns around and joins the pursuit. He runs in behind Ruby. James runs faster and is alongside the dog on the left. Ruby runs faster and is alongside the dog on the right. Which child is directly behind the dog?",
    options: ["a) James", "b) Ruby", "c) Rachel", "d) Max"],
    correctIndex: 3,
    answerText: "d) Max",
    solution: "Explanation: After all the switches were made,Max is directly behind the dog, James is alongside the dog on the left, Ruby is alongside the dog on the right, and Rachel is behind Max."
  },
];

export const LOGICAL_GAMES_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Who is the secretary?",
    options: ["a) Enid", "b) David", "c) Cheryl", "d) Bert", "e) Alice"],
    correctIndex: 4,
    answerText: "e) Alice",
    solution: "Explanation: Cheryl cannot be the secretary, since she's the CEO, nor can Enid, because she drives a green car, and the secretary drives a yellow car. David's, the purple car, is in the last space. Alice is the secretary, because her car is parked next to David's, which is where the secretary's car is parked."
  },
  {
    id: 2,
    question: "2. Who is the CEO ?",
    options: ["a) Alice", "b) Bert", "c) Cheryl", "d) David", "e) Enid"],
    correctIndex: 2,
    answerText: "c) Cheryl",
    solution: "Explanation: The CEO drives a red car and parks in the first space. Enid drives a green car; Bert's car is not in the first space; David's is not in the first space, but the last. Alice's car is parked next to David's, so Cheryl is the CEO."
  },
  {
    id: 3,
    question: "3. What color is the vice president's car?",
    options: ["a) green", "b) yellow", "c) blue", "d) purple", "e) red"],
    correctIndex: 0,
    answerText: "a) green",
    solution: "Explanation: The vice president's car cannot be red, because that is the CEO's car, which is in the first space. Nor can it be purple, because that is the treasurer's car, which is in the last space, or yellow, because that is the secretary's. The president's car must be blue, because it is parked between a red car (in the first space) and a green car, which must be the vice president's."
  },
  {
    id: 4,
    question: "4. Which city got the most rain?",
    options: ["a) Last Stand", "b) Mile City", "c) New Town", "d) Olliopolis", "e) Polberg"],
    correctIndex: 0,
    answerText: "a) Last Stand",
    solution: "Explanation: Olliopolis got 44 inches of rain. Last Stand got more rain than that, so it got 65 inches, which is the most."
  },
  {
    id: 5,
    question: "5. How much rain did Mile City get?",
    options: ["a) 12 inches", "b) 27 inches", "c) 32 inches", "d) 44 inches", "e) 65 inches"],
    correctIndex: 1,
    answerText: "b) 27 inches",
    solution: "Explanation: Olliopolis got 44 inches of rain, Last Stand got 65, and Polberg got 12. New Town is in the mountains, and the city in the mountains got 32 inches of rain. Therefore, Mile City got 27."
  },
  {
    id: 6,
    question: "6. Which city is in the desert ?",
    options: ["a) Last Stand", "b) Mile City", "c) New Town", "d) Olliopolis", "e) Polberg"],
    correctIndex: 4,
    answerText: "e) Polberg",
    solution: "Explanation: The city that got the least rain is in the desert. New Town is in the mountains. Last Stand got more rain than Olliopolis, so it cannot be the city with the least rain; also,Mile City cannot be the city with the least rain. Olliopolis got 44 inches of rain. Therefore, Polberg is in the desert and got 12 inches of rain."
  },
  {
    id: 7,
    question: "7. Where is Olliopolis located?",
    options: ["a) the mountains", "b) the coast", "c) in a valley", "d) the desert", "e) the forest"],
    correctIndex: 2,
    answerText: "c) in a valley",
    solution: "Explanation: Olliopolis got 44 inches of rain, so it is not in the desert or the forest. The city in the mountains got 32 inches of rain; the coast 27. Therefore, Olliopolis is in a valley."
  },
  {
    id: 8,
    question: "8. What task does Terry do on Wednesday?",
    options: ["a) vacuuming", "b) dusting", "c) mopping", "d) sweeping", "e) laundry"],
    correctIndex: 3,
    answerText: "d) sweeping",
    solution: "Explanation: Terry does not dust, mop, do laundry, or vacuum. Therefore, Terry does the sweeping on Wednesday."
  },
  {
    id: 9,
    question: "9. What day does Uma do her task?",
    options: ["a) Monday", "b) Tuesday", "c) Wednesday", "d) Thursday", "e) Friday"],
    correctIndex: 3,
    answerText: "d) Thursday",
    solution: "Explanation: Uma does the mopping, which is done on Thursday."
  },
  {
    id: 10,
    question: "10. What task does Vernon do?",
    options: ["a) vacuuming", "b) dusting", "c) mopping", "d) sweeping", "e) laundry"],
    correctIndex: 4,
    answerText: "e) laundry",
    solution: "Explanation: Vernon does not vacuum, dust, or sweep. Randy does the vacuuming, Sally does the dusting, Terry does the sweeping\u00e2\u20ac\u201dleaving laundry and mopping for Uma and Vernon. Uma does not do laundry; therefore, she must mop, and Vernon does the laundry."
  },
  {
    id: 11,
    question: "11. What day is the vacuuming done?",
    options: ["a) Friday", "b) Monday", "c) Tuesday", "d) Wednesday", "e) Thursday"],
    correctIndex: 1,
    answerText: "b) Monday",
    solution: "Explanation: Dusting is on Tuesday, sweeping is on Wednesday, mopping is on Thursday, and laundry is on Friday. Therefore, the vacuuming is done on Monday."
  },
  {
    id: 12,
    question: "12. When does Sally do the dusting?",
    options: ["a) Friday", "b) Monday", "c) Tuesday", "d) Wednesday", "e) Thursday"],
    correctIndex: 2,
    answerText: "c) Tuesday",
    solution: "Explanation: Dusting must be done on Tuesday, Wednesday, or Thursday. However, the mopping is done on Thursday, and Terry does his task on Wednesday. Therefore, Sally does the dusting on Tuesday."
  },
];

export const ANALYZING_ARGUMENTS_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. One New York publisher has estimated that 50,000 to 60,000 people in the United States want an anthology that includes the complete works of William Shakespeare. And what accounts for this renewed interest in Shakespeare? As scholars point out, his psychological insights into both male and female characters are amazing even today. This paragraph best supports the statement that",
    options: ["a) Shakespeare's characters are more interesting than fictional characters today.", "b) people even today are interested in Shakespeare's work because of the characters.", "c) academic scholars are putting together an anthology of Shakespeare's work.", "d) New Yorkers have a renewed interested in the work of Shakespeare.", "e) Shakespeare was a psychiatrist as well as a playwright."],
    correctIndex: 1,
    answerText: "b) people even today are interested in Shakespeare's work because of the characters.",
    solution: "Explanation: The last sentence in the paragraph clearly gives support for the idea that the interest in Shakespeare is due to the development of his characters. Choice a is incorrect because the writer never makes this type of comparison. Choice c is wrong because even though scholars are mentioned in the paragraph, there is no indication that the scholars are compiling the anthology. Choice d is wrong because there is no support to show that most New Yorkers are interested in this work. There is no support for choice e either."
  },
  {
    id: 2,
    question: "2. One of the warmest winters on record has put consumers in the mood to spend money. Spending is likely to be the strongest in thirteen years. During the month of February, sales of existing single-family homes hit an annual record rate of 4.75 million. This paragraph best supports the statement that",
    options: ["a) consumer spending will be higher thirteen years from now than it is today.", "b) more people buy houses in the month of February than in any other month.", "c) during the winter months, the prices of single-family homes are the lowest.", "d) there were about 4 million homes for sale during the month of February.", "e) warm winter weather is likely to affect the rate of home sales."],
    correctIndex: 4,
    answerText: "e) warm winter weather is likely to affect the rate of home sales.",
    solution: "Explanation: This is clearly the best answer because the paragraph directly states that warm weather affects consumers inclination to spend. It furthers states that the sales of single-family homes was at an all-time high. There is no support for choice a or c. Choice b is wrong because even though there were high sales for a particular February, this does not mean that sales are not higher in other months. Choice d presents a misleading figure of 4 million. The paragraph states that the record of 4.75 million was at an annual, not a monthly, rate."
  },
  {
    id: 3,
    question: "3. Generation Xers are those people born roughly between 1965 and 1981. As employees, Generation Xers tend to be more challenged when they can carry out tasks independently. This makes Generation Xers the most entrepreneurial generation in history. This paragraph best supports the statement that Generation Xers",
    options: ["a) work harder than people from other generations.", "b) have a tendency to be self-directed workers", "c) have an interest in making history", "d) tend to work in jobs that require risk-taking behavior.", "e) like to challenge their bosses work attitudes."],
    correctIndex: 1,
    answerText: "b) have a tendency to be self-directed workers",
    solution: "Explanation: The support for choice b is given in the second sentence of the paragraph. Generation Xers like to work independently, which means they are self-directed. No support is given for either choice a or choice c. Choice d is not related to the paragraph. Although the paragraph mentions that Generation Xers like to be challenged, it does not say they like to challenge their bosses attitudes; therefore, choice e can be ruled out."
  },
  {
    id: 4,
    question: "4. If you're a fitness walker, there is no need for a commute to a health club. Your neighborhood can be your health club. You don't need a lot of fancy equipment to get a good workout either. All you need is a well-designed pair of athletic shoes. This paragraph best supports the statement that",
    options: ["a) fitness walking is a better form of exercise than weight lifting.", "b) a membership in a health club is a poor investment.", "c) walking outdoors provides a better workout than walking indoors.", "d) fitness walking is a convenient and valuable form of exercise.", "e) poorly designed athletic shoes can cause major foot injuries."],
    correctIndex: 3,
    answerText: "d) fitness walking is a convenient and valuable form of exercise.",
    solution: "Explanation: By stating that fitness walking does not require a commute to a health club, the author stresses the convenience of this form of exercise. The paragraph also states that fitness walking will result in a good workout. Choice a is incorrect because no comparison to weight lifting is made. Choice b may seem like a logical answer, but the paragraph only refers to people who are fitness walkers, so for others, a health club might be a good investment. Choice c is not in the passage. Although choice e seems logical, the paragraph does not indicate that the wrong shoes will produce major injuries."
  },
  {
    id: 5,
    question: "5. In the past, consumers would rarely walk into an ice cream store and order low-fat ice cream. But that isn't the case today. An increasing health consciousness combined with a much bigger selection of tasty low-fat foods in all categories has made low-fat ice cream a very profitable item for ice cream store owners. This paragraph best supports the statement that",
    options: ["a) low-fat ice cream produces more revenue than other low-fat foods.", "b) ice cream store owners would be better off carrying only low-fat ice cream.", "c) ice cream store owners no longer think that low-fat ice cream is an unpopular item.", "d) low-fat ice cream is more popular than other kinds of ice cream.", "e) consumers are fickle and it is impossible to please them"],
    correctIndex: 2,
    answerText: "c) ice cream store owners no longer think that low-fat ice cream is an unpopular item.",
    solution: "Explanation: This choice is supported as the best answer because the paragraph indicates that low-fat ice cream was once an unpopular item, but now, because consumers are more health conscious and because there is a wider array of tasty low-fat foods, low-fat ice cream is a profitable item for ice cream store owners. There is no indication that choices a, b, d,or e are true based on the information given."
  },
  {
    id: 6,
    question: "6. Today's high school students spend too much time thinking about trivial and distracting matters such as fashion. Additionally, they often dress inappropriately on school grounds. Rather than spending time writing another detailed dress policy, we should make school uniforms mandatory. If students were required to wear uniforms, it would increase a sense of community and harmony in our schools and it would instill a sense of discipline in our students. Another positive effect would be that teachers and administrators would no longer have to act as clothing police, freeing them up to focus on more important issues. This paragraph best supports the statement that",
    options: ["a) inappropriate clothing leads to failing grades.", "b) students who wear school uniforms get into better colleges.", "c) teachers and administrators spend at least 25% of their time enforcing the dress code.", "d) students are not interested in being part of a community", "e) school uniforms should be compulsory for high school students."],
    correctIndex: 4,
    answerText: "e) school uniforms should be compulsory for high school students.",
    solution: "Explanation: The support for choice e is in the third sentence \"we should make school uniforms mandatory\". There is no evidence provided to support choices a, b, and d. And although we know that teachers and administrators are spending some of their time enforcing dress code, the paragraph does not quantify how much of their time is spent that way, so there is no support for choice c."
  },
  {
    id: 7,
    question: "7. The criminal justice system needs to change. The system could be more just if it allowed victims the opportunity to confront the person who has harmed them. Also, mediation between victims and their offenders would give the offenders a chance to apologize for the harm they have done. This paragraph best supports the statement that victims of a crime should",
    options: ["a) learn to forgive their offenders.", "b) have the right to confront their offenders.", "c) learn the art of mediation.", "d) insist that their offenders be punished.", "e) have the right to impose a sentence on their offenders."],
    correctIndex: 1,
    answerText: "b) have the right to confront their offenders.",
    solution: "Explanation: This answer is clearly stated in the first sentence of the paragraph. There is no support in the passage for choices a, d,or e. As for choice c, although mediation is mentioned, the statement does not indicate that victims should be the mediators."
  },
  {
    id: 8,
    question: "8. A few states in this country are considering legislation that would prohibit schools from using calculators before the sixth grade. Other states take a different position. Some states are insisting on the purchase of graphing calculators for every student in middle school. This paragraph best supports the statement that in this country",
    options: ["a) there are at least two opinions about the use of calculators in schools.", "b) calculators are frequently a detriment to learning math.", "c) state legislators are more involved in education than ever before.", "d) the price of graphing calculators is less when schools buy in bulk.", "e) the argument against calculators in schools is unfounded."],
    correctIndex: 0,
    answerText: "a) there are at least two opinions about the use of calculators in schools.",
    solution: "Explanation: The paragraph clearly states that there are two differing opinions with regard to the use of calculators in the classroom. Although some people may believe that choice b is true, the paragraph does not indicate this. Choice c has no relation to the paragraph. Choice d makes logical sense, but the paragraph says nothing about cost. Choice e is an opinion that is not given in the paragraph."
  },
  {
    id: 9,
    question: "9. Today's workforce has a new set of social values. Ten years ago, a manager who was offered a promotion in a distant city would not have questioned the move. Today, a manager in that same situation might choose family happiness instead of career advancement. This paragraph best supports the statement that",
    options: ["a) most managers are not loyal to the corporations for which they work.", "b) businesses today do not understand their employees needs.", "c) employees social values have changed over the past ten years.", "d) career advancement is not important to today's business managers.", "e) companies should require their employees to accept promotions."],
    correctIndex: 2,
    answerText: "c) employees social values have changed over the past ten years.",
    solution: "Explanation: A change in employee social values over the past ten years is implied in the whole paragraph, but particularly in the first sentence. Choice a is incorrect because the loyalty of the managers to their corporations is never discussed. There is no support for choice b. In choice d, perhaps career advancement is less important than it once was, but the paragraph does not indicate that advancement is unimportant to managers. Choice e is an opinion that is not supported."
  },
  {
    id: 10,
    question: "10. It is well known that the world urgently needs adequate distribution of food, so that everyone gets enough. Adequate distribution of medicine is just as urgent. Medical expertise and medical supplies need to be redistributed throughout the world so that people in emerging nations will have proper medical care. This paragraph best supports the statement that",
    options: ["a) the majority of the people in the world have never been seen by a doctor.", "b) food production in emerging nations has slowed during the past several years.", "c) most of the world's doctors are selfish about giving time and money to the poor.", "d) the medical-supply industry should step up production of its products.", "e) many people who live in emerging nations are not receiving proper medical care"],
    correctIndex: 4,
    answerText: "e) many people who live in emerging nations are not receiving proper medical care",
    solution: "Explanation: This answer is implied by the statement that redistribution is needed so that people in emerging nations can have proper medical care. Choices a, b, and c are not mentioned in the passage. Choice d is also incorrect, the passage indicates that the distribution of medicine, not its production, is inadequate."
  },
  {
    id: 11,
    question: "11. Yoga has become a very popular type of exercise, but it may not be for everyone. Before you sign yourself up for a yoga class, you need to examine what it is you want from your fitness routine. If you're looking for a high-energy, fast-paced aerobic workout, a yoga class might not be your best choice. This paragraph best supports the statement that",
    options: ["a) yoga is more popular than high-impact aerobics.", "b) before embarking on a new exercise regimen, you should think about your needs and desires.", "c) yoga is changing the world of fitness in major ways", "d) yoga benefits your body and mind", "e) most people think that yoga isn't a rigorous form of exercise."],
    correctIndex: 1,
    answerText: "b) before embarking on a new exercise regimen, you should think about your needs and desires.",
    solution: "Explanation: The second sentence points out that people should examine what they want from a fitness routine before signing up for a new exercise class. There is no evidence to support choice a. Choice c might sound reasonable due to the fact that the paragraph tells us that yoga has become very popular, but this statement is not supported by the information provided in the paragraph. Choices d and e are also not supported since the paragraph doesn't tell us whether yoga is good for both body and mind or what people think about it."
  },
  {
    id: 12,
    question: "12. Human technology developed from the first stone tools about two and a half million years ago. At the beginning, the rate of development was slow. Hundreds of thousands of years passed without much change. Today, new technologies are reported daily on television and in newspapers. This paragraph best supports the statement that",
    options: ["a) stone tools were not really technology.", "b) stone tools were in use for two and a half million years", "c) there is no way to know when stone tools first came into use.", "d) In today's world, new technologies are constantly being developed", "e) none of the latest technologies is as significant as the development of stone tools."],
    correctIndex: 3,
    answerText: "d) In today's world, new technologies are constantly being developed",
    solution: "Explanation: The last sentence states that new technologies are reported daily, and this implies that new technologies are being constantly developed. There is no support for choice a.With regard to choice b, stone tools were first used two and a half million years ago, but they were not neessarily in use all that time. Choice c is clearly wrong since the paragraph states when stone tools first came into use. Although some may agree that choice e is true, the author of the paragraph does not give support for this opinion."
  },
  {
    id: 13,
    question: "13. Mathematics allows us to expand our consciousness. Mathematics tells us about economic trends, patterns of disease, and the growth of populations. Math is good at exposing the truth, but it can also perpetuate misunderstandings and untruths. Figures have the power to mislead people. This paragraph best supports the statement that",
    options: ["a) the study of mathematics is dangerous.", "b) words are more truthful than figures.", "c) the study of mathematics is more important than other disciplines.", "d) the power of numbers is that they cannot lie.", "e) figures are sometimes used to deceive people."],
    correctIndex: 4,
    answerText: "e) figures are sometimes used to deceive people.",
    solution: "Explanation: This answer is clearly stated in the last sentence of the paragraph. Choice a can be ruled out because there is no support to show that studying math is dangerous. Words are not mentioned in the passage, which rules out choice b. Choice d is a contradiction to the information in the passage. There is no support for choice c."
  },
  {
    id: 14,
    question: "14. In the 1966 Supreme Court decision Miranda v. Arizona, the court held that before the police can obtain statements from a person subjected to an interrogation, the person must be given a Miranda warning. This warning means that a person must be told that he or she has the right to remain silent during the police interrogation. Violation of this right means that any statement that the person makes is not admissible in a court hearing. This paragraph best supports the statement that",
    options: ["a) police who do not warn persons of their Miranda rights are guilty of a crime.", "b) a Miranda warning must be given before a police interrogation can begin.", "c) the police may no longer interrogate persons suspected of a crime unless a lawyer is present.", "d) the 1966 Supreme Court decision in Miranda should be reversed", "e) persons who are interrogated by police should always remain silent until their lawyer comes"],
    correctIndex: 1,
    answerText: "b) a Miranda warning must be given before a police interrogation can begin.",
    solution: "Explanation: This answer is clearly supported in the second sentence. Nothing in the paragraph suggests that it is a crime not to give a Miranda warning, so choice a is incorrect. Choice c is also wrong because police may interrogate as long as a warning is given. There is no support given for either choice d or e."
  },
  {
    id: 15,
    question: "15. During colonial times in America, juries were encouraged to ask questions of the parties in the courtroom. The jurors were, in fact, expected to investigate the facts of the case themselves. If jurors conducted an investigation today, we would throw out the case. This paragraph best supports the statement that",
    options: ["a) juries are less important today than they were in colonial times.", "b) jurors today are less interested in court cases than they were in colonial times.", "c) courtrooms today are more efficient than they were in colonial times.", "d) jurors in colonial times were more informed than jurors today.", "e) the jury system in America has changed since colonial times."],
    correctIndex: 4,
    answerText: "e) the jury system in America has changed since colonial times.",
    solution: "Explanation: The paragraph focuses on the idea that the jury system is different from what it was in colonial times. There is no support given for choices a, b, and c. Choice d is incorrect because, even though jurors in colonial times were expected to investigate and ask questions, this does not necessarily mean that they were more informed than today's jurors."
  },
  {
    id: 16,
    question: "16. There are no effective boundaries when it comes to pollutants. Studies have shown that toxic insecticides that have been banned in many countries are riding the wind from countries where they remain legal. Compounds such as DDT and toxaphene have been found in remote places like the Yukon and other Arctic regions. This paragraph best supports the statement that",
    options: ["a) toxic insecticides such as DDT have not been banned throughout the world.", "b) more pollutants find their way into polar climates than they do into warmer areas", "c) studies have proven that many countries have ignored their own antipollution laws.", "d) DDT and toxaphene are the two most toxic insecticides in the world.", "e) even a worldwide ban on toxic insecticides would not stop the spread of DDT pollution."],
    correctIndex: 0,
    answerText: "a) toxic insecticides such as DDT have not been banned throughout the world.",
    solution: "Explanation: The support for this choice is in the second sentence, which states that in some countries, toxic insecticides are still legal. Choice b is incorrect because even though polar regions are mentioned in the paragraph, there is no support for the idea that warmer regions are not just as affected. There is no support for choice c. Choice d can be ruled out because there is nothing to indicate that DDT and toxaphene are the most toxic. Choice e is illogical."
  },
  {
    id: 17,
    question: "17. The Fourth Amendment to the Constitution protects citizens against unreasonable searches and seizures. No search of a person's home or personal effects may be conducted without a written search warrant issued on probable cause. This means that a neutral judge must approve the factual basis justifying a search before it can be conducted. This paragraph best supports the statement that the police cannot search a person's home or private papers unless they have",
    options: ["a) legal authorization", "b) direct evidence of a crime.", "c) read the person his or her constitutional rights.", "d) a reasonable belief that a crime has occurred.", "e) requested that a judge be present."],
    correctIndex: 0,
    answerText: "a) legal authorization",
    solution: "Explanation: The second and third sentence combine to give support to choice a. The statement stresses that there must be a judge's approval (i.e., legal authorization) before a search can be conducted. Choices b and d are wrong because it is not enough for the police to have direct evidence or a reasonable belief\u00e2\u20ac\u201da judge must authorize the search for it to be legal. Choices c and e are not mentioned in the passage."
  },
  {
    id: 18,
    question: "18. Obesity is a serious problem in this country. Research suggests that obesity can lead to a number of health problems including diabetes, asthma, and heart disease. Recent research has even indicated that there may be a relationship between obesity and some types of cancer. Major public health campaigns that increase awareness and propose simple lifestyle changes that will, with diligence and desire, eliminate or least mitigate the incidence of obesity are a crucial first step in battling this critical problem. This paragraph best supports the statement that",
    options: ["a) public health campaigns that raise consciousness and propose lifestyle changes are a productive way to fight obesity.", "b) obesity is the leading cause of diabetes in our country.", "c) people in our country watch too much television and do not exercise enough.", "d) a decline in obesity would radically decrease the incidence of asthma.", "e) fast-food restaurants and unhealthy school lunches contribute greatly to obesity."],
    correctIndex: 0,
    answerText: "a) public health campaigns that raise consciousness and propose lifestyle changes are a productive way to fight obesity.",
    solution: "Explanation: The support for this choice is in the last sentence, which states that major public health campaigns that increase awareness and propose lifestyle changes are important in our fight against obesity. Choice b can be ruled out because although the paragraph states that obesity can lead to diabetes, it doesn't tell us that it is the leading cause of this disease. Choices c and e might sound reasonable and true, but they are not supported in the paragraph. And although we are told that obesity has been connected to asthma, this fact is not quantified in any way, so choice d is also not supported by the information given."
  },
  {
    id: 19,
    question: "19. Critical reading is a demanding process. To read critically, you must slow down your reading and, with pencil in hand, perform specific operations on the text. Mark up the text with your reactions, conclusions, and questions. When you read, become an active participant. This paragraph best supports the statement that",
    options: ["a) critical reading is a slow, dull, but essential process", "b) the best critical reading happens at critical times in a person's life.", "c) readers should get in the habit of questioning the truth of what they read.", "d) critical reading requires thoughtful and careful attention.", "e) critical reading should take place at the same time each day."],
    correctIndex: 3,
    answerText: "d) critical reading requires thoughtful and careful attention.",
    solution: "Explanation: This answer is implied by the whole paragraph. The author stresses the need to read critically by performing thoughtful and careful operations on the text. Choice a is incorrect because the author never says that reading is dull. Choices b, c, and e are not supported by the paragraph."
  },
  {
    id: 20,
    question: "20. Walk into any supermarket or pharmacy and you will find several shelves of products designed to protect adults and children from the sun. Additionally, a host of public health campaigns have been created, including National Skin Cancer Awareness Month, that warn us about the sun's damaging UV rays and provide guidelines about protecting ourselves. While warnings about the sun's dangers are frequent, a recent survey found that fewer than half of all adults adequately protect themselves from the sun. This paragraph best supports the statement that",
    options: ["a) children are better protected from the sun's dangerous rays than adults", "b) sales of sun protection products are at an all-time high.", "c) adults are not heeding the warnings about the dangers of sun exposure seriously enough.", "d) more adults have skin cancer now than ever before", "e) there is not enough information disseminated about the dangers of sun exposure."],
    correctIndex: 2,
    answerText: "c) adults are not heeding the warnings about the dangers of sun exposure seriously enough.",
    solution: "Explanation: The last sentence gives direct support for this response. Although children might be better protected from the sun than adults, the paragraph does not specifically cite statistics about children, so we can't know for sure, ruling out choice a. There is no evidence provided in the paragraph to support choices b and d. Choice e is incorrect since the last sentence tells us that warnings about the sun's dangers are frequent."
  },
  {
    id: 21,
    question: "21. For too long, school cafeterias, in an effort to provide food they thought would be appetizing to young people, mimicked fast-food restaurants, serving items such as burgers and fries, pizza, hot dogs, and fried chicken. School districts nationwide are now addressing this trend by incorporating some simple and inexpensive options that will make cafeteria lunches healthier while still appealing to students. This paragraph best supports the statement that",
    options: ["a) school cafeterias have always emphasized nutritional guidelines over any other considerations.", "b) young people would rather eat in a school cafeteria than a local fast-food restaurant.", "c) school lunch menus are becoming healthier due to major new initiatives on the part of school districts.", "d) it is possible to make school lunches both healthier and appealing without spending a great deal of money and undertaking a radical transformation.", "e) vegetarian lunch options would greatly improve the nutritional value of the school lunch program."],
    correctIndex: 3,
    answerText: "d) it is possible to make school lunches both healthier and appealing without spending a great deal of money and undertaking a radical transformation.",
    solution: "Explanation: The final sentence of the paragraph supports choice d. The other choices are not supported by the passage. Choice c may seem correct at first, but the paragraph states that the new initiatives are simple and inexpensive, not major. Choice e might seem to represent a truth, but vegetarian options are not discussed in this paragraph."
  },
  {
    id: 22,
    question: "22. Forest fires feed on decades-long accumulations of debris and leap from the tops of young trees into the branches of mature trees. Fires that jump from treetop to treetop can be devastating. In old-growth forests, however, the shade of mature trees keeps thickets of small trees from sprouting, and the lower branches of mature trees are too high to catch the flames. This paragraph best supports the statement that",
    options: ["a) forest fire damage is reduced in old-growth forests.", "b) small trees should be cut down to prevent forest fires.", "c) mature trees should be thinned out to prevent forest fires", "d) forest fires do the most damage in old-growth forests.", "e) old-growth forests have a larger accumulation of forest debris."],
    correctIndex: 0,
    answerText: "a) forest fire damage is reduced in old-growth forests.",
    solution: "Explanation: The last sentence provides direct support for choice a. The author never suggests that any trees should be cut down or thinned out, which eliminates choices b and c. Choice d contradicts the author's opinion. The author suggests that old growth forests have less debris, which rules out choice e."
  },
  {
    id: 23,
    question: "23. During the last six years, the number of practicing physicians has increased by about 20%. During the same time period, the number of healthcare managers has increased by more than 600%. These percentages mean that many doctors have lost the authority to make their own schedules, determine the fees that they charge, and decide on prescribed treatments. This paragraph best supports the statement that doctors",
    options: ["a) resent the interference of healthcare managers.", "b) no longer have adequate training.", "c) care a great deal about their patients.", "d) are less independent than they used to be.", "e) are making a lot less money than they used to make."],
    correctIndex: 3,
    answerText: "d) are less independent than they used to be.",
    solution: "Explanation: The author of this statement suggests that doctors are less independent. The author stresses that many doctors have lost authority. There is no support for the opinion that doctors resent the healthcare managers, however which rules out choice a. The doctors training is never mentioned (choice b). Doctors may care about their patients (choice c), but this information is not part of the paragraph. Choice e is not mentioned."
  },
  {
    id: 24,
    question: "24. By the time they reach adulthood, most people can perform many different activities involving motor skills. Motor skills involve such diverse tasks as riding a bicycle, threading a needle, and cooking a dinner. What all these activities have in common is their dependence on precision and timing of muscular movement. This paragraph best supports the statement that",
    options: ["a) most adults have not refined their motor skills.", "b) all adults know how to ride a bicycle.", "c) refined motor skills are specifically limited to adults.", "d) children perform fewer fine motor activities in a day than adults do.", "e) threading a needle is a precise motor skill."],
    correctIndex: 4,
    answerText: "e) threading a needle is a precise motor skill.",
    solution: "Explanation: The second sentence states that threading a needle involves motor skill. The other choices are not in the paragraph."
  },
  {
    id: 25,
    question: "25. Most Reality TV centers on two common motivators: fame and money. The shows transform waitresses, hairdressers, investment bankers, counselors, and teachers, to name a few, from obscure figures to house-hold names. A lucky few successfully parlay their fifteen minutes of fame into celebrity. The luckiest stars of Reality TV also reap huge financial rewards for acts including eating large insects, marrying someone they barely know, and revealing their innermost thoughts to millions of people. This paragraph best supports the statement that",
    options: ["a) the stars of Reality TV are interested in being rich and famous.", "b) Reality TV is the best thing that has happened to network television in a long time.", "c) for Reality TV stars, fame will last only as long as their particular television show.", "d) traditional dramas and sitcoms are being replaced by Reality TV programming at an alarming rate.", "e) Reality TV shows represent a new wave of sensationalistic, low quality programming."],
    correctIndex: 0,
    answerText: "a) the stars of Reality TV are interested in being rich and famous.",
    solution: "Explanation: This is expressed in the first sentence. Choices b, d, and e are not supported by the passage. Choice c is incorrect because the paragraph states that some Reality TV stars manage to parlay their fifteen minutes of fame into celebrity."
  },
  {
    id: 26,
    question: "26. The image of a knitter as an older woman sitting in a comfortable, old-fashioned living room with a basket of yarn at her feet and a bun in her hair is one of the past. As knitting continues to become more popular and increasingly trendy, it is much more difficult to describe the average knitter. Knitters today might be 18, 28, 40, or 65. They might live in a big urban center and take classes in a knit- ting shop that doubles as a caf\u00c3\u00a9 or they may gather in suburban coffee shops to support one another in knitting and other aspects of life. They could be college roommates knitting in their dorm room or two senior citizens knitting in a church hall. Even men are getting in the act. It would be incredibly difficult to come up with an accurate profile of a contemporary knitter to replace that image of the old woman with the basket of yarn! This paragraph best supports the statement that",
    options: ["a) people are returning to knitting in an attempt to reconnect with simpler times.", "b) knitting is now more of a group activity, as opposed to an individual hobby.", "c) creating an accurate profile of a particular type of person depends on the people in this group having traits and characteristics in common.", "d) today's knitters are much less accomplished than knitters of the past.", "e) young people are turning to knitting in record numbers."],
    correctIndex: 2,
    answerText: "c) creating an accurate profile of a particular type of person depends on the people in this group having traits and characteristics in common.",
    solution: "Explanation: The statement that it is difficult to create an accurate profile of a contemporary knitter comes immediately after a discussion about how different today's knitters are from one another and from knitters of the past. Choices a and d are not supported by the paragraph. Although the paragraph does discuss knitting done in group settings, it does not specifically say that more of today's knitting is done in groups; therefore, choice b is incorrect. Young people may be turning to knitting in record numbers, but again, that statement is not verified by the information provided in the paragraph, so choice e must be ruled out as well."
  },
  {
    id: 27,
    question: "27. Close-up images of Mars by the Mariner 9 probe indicated networks of valleys that looked like the stream beds on Earth. These images also implied that Mars once had an atmosphere that was thick enough to trap the sun's heat. If this were true, something happened to Mars billions of years ago that stripped away the planet's atmosphere. This paragraph best supports the statement that",
    options: ["a) Mars now has little or no atmosphere.", "b) Mars once had a thicker atmosphere than Earth does.", "c) the Mariner 9 probe took the first pictures of Mars.", "d) Mars is closer to the sun than Earth is.", "e) Mars is more mountainous than Earth is."],
    correctIndex: 0,
    answerText: "a) Mars now has little or no atmosphere.",
    solution: "Explanation: The paragraph states that Mars once had a thick atmosphere, but that it was stripped away. The other choices, true or not, cannot be found in the passage."
  },
  {
    id: 28,
    question: "28. Originating in the 1920s, the Pyramid scheme is one of the oldest con games going. Honest people are often pulled in, thinking the scheme is a legitimate investment enterprise. The first customer to \"fall for\" the Pyramid scheme will actually make big money and will therefore persuade friends and relatives to join also. The chain then continues with the con artist who originated the scheme pocketing, rather than investing, the money. Finally, the pyramid collapses, but by that time, the scam artist will usually have moved out of town, leaving no forwarding address. This paragraph best supports the statement that",
    options: ["a) it is fairly easy to spot a Pyramid scheme in the making.", "b) he first customer of a Pyramid scheme is the most gullible.", "c) the people who set up Pyramid schemes are able to fool honest people.", "d) the Pyramid scheme had its heyday in the 1920s, but it's making a comeback.", "e) the Pyramid scheme got its name from its structure."],
    correctIndex: 2,
    answerText: "c) the people who set up Pyramid schemes are able to fool honest people.",
    solution: "Explanation: The fact that the Pyramid scheme is set up by a con artist suggests that the honest people who invest have been fooled. Choices a and b are contradicted in the passage. The paragraph says that the Pyramid scheme originated in the 1920s, but does not say it had its heyday then; thus, choice d is incorrect. Choice e is a fact, but it is not mentioned in the passage."
  },
  {
    id: 29,
    question: "29. Which of the following is similar to the argument made by the speaker?",
    options: ["a) The rich should not be allowed to \"buy\" politicians, so the Congress should enact campaign finance reform.", "b) The idea of freedom of religion also means the right not to participate in religion, so mandated school prayer violates freedom of religion.", "c) The Constitution guarantees freedom to own property, so taxes should be illegal.", "d) Convicted felons should not have their convictions overturned on a technicality.", "e) In order to understand what may be constitutional today, one needs to look at what the laws were when the Constitution was enacted."],
    correctIndex: 1,
    answerText: "b) The idea of freedom of religion also means the right not to participate in religion, so mandated school prayer violates freedom of religion.",
    solution: "Explanation: This is the best choice because it relates to a situation where a proposed law would actually violate the part of the Constitution it is intended to protect."
  },
  {
    id: 30,
    question: "30. Which of the following, if true, would weaken the speaker's argument?",
    options: ["a) An action is not considered a part of freedom of speech.", "b) People who burn the flag usually commit other crimes as well.", "c) The flag was not recognized by the government until 1812.", "d) State flags are almost never burned", "e) Most people are against flag burning."],
    correctIndex: 0,
    answerText: "a) An action is not considered a part of freedom of speech.",
    solution: "Explanation: If an action is not included under freedom of speech, the speaker's main argument is incorrect."
  },
  {
    id: 31,
    question: "31. Which of the following best expresses the main point of the passage?",
    options: ["a) Only veterans care about the flag-burning issue.", "b) Flag burning almost never happens, so outlawing it is a waste of time.", "c) Flag burning will be a very important issue in the next election.", "d) To outlaw flag burning is to outlaw what the flag represents.", "e) Burning the flag should only be illegal when it is done in foreign countries."],
    correctIndex: 3,
    answerText: "d) To outlaw flag burning is to outlaw what the flag represents.",
    solution: "Explanation: The speaker maintains that to burn a flag is an act of freedom of speech, which is among the things the flag represents."
  },
  {
    id: 32,
    question: "32. Which of the following, if true, would strengthen the speaker's argument?",
    options: ["a) studies showing computers are expensive", "b) research on the effect of computer games on children", "c) examples of high school students who use computers improperly", "d) proof that the cost of computers is coming down", "e) evidence that using computers makes learning to read difficult"],
    correctIndex: 4,
    answerText: "e) evidence that using computers makes learning to read difficult",
    solution: "Explanation: This evidence would back up the speaker's contention that young students should learn the basics before learning computers. Choices a and d, which are both about cost, would have no effect on the argument. Choices b and c are too vague."
  },
  {
    id: 33,
    question: "33. Which of the following, if true, would weaken the speaker's argument?",
    options: ["a) a demonstration that computers can be used to teach reading and arithmetic", "b) analysis of the cost-effectiveness of new computers versus repairing old computers", "c) examples of adults who do not know how to use computers", "d) recent grade reports of students in the computer classes", "e) a visit to a classroom where computers are being used"],
    correctIndex: 0,
    answerText: "a) a demonstration that computers can be used to teach reading and arithmetic",
    solution: "Explanation: If computers enhance the learning of arithmetic and reading, the speaker's argument is not as strong."
  },
  {
    id: 34,
    question: "34. Which of the following methods of argument is used in the previous passage?",
    options: ["a) a specific example that illustrates the speaker's point", "b) attacking the beliefs of those who disagree with the speaker", "c) relying on an analogy to prove the speaker's point", "d) displaying statistics that back up the speaker's point", "e) comparing different methods of learning"],
    correctIndex: 2,
    answerText: "c) relying on an analogy to prove the speaker's point",
    solution: "Explanation: The speaker uses analogies to compare crawling with learning arithmetic and reading and to compare walking with using a computer. The speaker is making the point that, in both cases, a child needs to learn one before learning the other."
  },
  {
    id: 35,
    question: "35. What is the point at issue between Quinn and Dakota?",
    options: ["a) whether sixteen-year-olds should be required to take drivers education before being issued a license", "b) whether schools ought to provide drivers education to fourteen- and fifteen-year-old students", "c) whether the standards for issuing drivers licenses should become more stringent", "d) whether sixteen-year-olds are prepared to drive in today's traffic conditions", "e) whether parents are able to do a good job teaching their children to drive"],
    correctIndex: 3,
    answerText: "d) whether sixteen-year-olds are prepared to drive in today's traffic conditions",
    solution: "Explanation: The speakers support their arguments in different ways, but both are concerned with whether sixteen-year-olds should continue to be allowed to receive drivers licenses."
  },
  {
    id: 36,
    question: "36. On what does Quinn rely in making her argument?",
    options: ["a) statistics", "b) emotion", "c) fairness", "d) anecdotes", "e) actualities"],
    correctIndex: 2,
    answerText: "c) fairness",
    solution: "Explanation: Quinn discusses the fairness of changing the law and raising the age at which one can receive a driver's license. Emotion (choice b) may be involved, but the argument relies on the fairness issue."
  },
  {
    id: 37,
    question: "37. On what does Dakota rely in making her argument?",
    options: ["a) statistics", "b) emotion", "c) fairness", "d) anecdotes", "e) actualities"],
    correctIndex: 4,
    answerText: "e) actualities",
    solution: "Explanation: Dakota discusses the actualities of increased traffic and the decline in the teaching of drivers education. She doesn't use statistics (choice a). Her argument is not emotion filled, which rules out choice b. She doesn't mention fairness (choice c) and doesn't tell stories about specific situations (choice d)."
  },
];

export const STATEMENT_AND_ASSUMPTION_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Statement: \"You are hereby appointed as a programmer with a probation period of one year and your performance will be reviewed at the end of the period for confirmation.\" - A line in an appointment letter. Assumptions: The performance of an individual generally is not known at the time of appointment offer. Generally an individual tries to prove his worth in the probation period.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The performance of the individual has to be tested over a span of time as the statement mentions. So, I is implicit. The statement mentions that the individual's worth shall be reviewed (during probation period) before confirmation. So, II is also implicit."
  },
  {
    id: 2,
    question: "2. Statement: It is desirable to put the child in school at the age of 5 or so. Assumptions: At that age the child reaches appropriate level of development and is ready to learn. The schools do not admit children after six years of age.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Since the statement talks of putting the child in school at the age of 5, it means that the child is mentally prepared for the same at this age. So, I is implicit. But nothing about admission after 6 years of age is mentioned in the statement. So, II is not implicit."
  },
  {
    id: 3,
    question: "3. Statement: \"In order to bring punctuality in our office, we must provide conveyance allowance to our employees.\" - In charge of a company tells Personnel Manager. Assumptions: Conveyance allowance will not help in bringing punctuality. Discipline and reward should always go hand in hand.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Assumption I goes against the statement. So, it is not implicit. The allowance will serve as a reward to the employees and shall provoke them to come on time. So, II is implicit."
  },
  {
    id: 4,
    question: "4. Statement: Unemployment allowance should be given to all unemployed Indian youth above 18 years of age. Assumptions: There are unemployed youth in India who needs monetary support. The government has sufficient funds to provide allowance to all unemployed youth.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: I directly follows from the statement and so is implicit. Also, the statement is a suggestion and does not tell about a government policy or its position of funds. So, II is not implicit."
  },
  {
    id: 5,
    question: "5. Statement: \"If you trouble me, I will slap you.\" - A mother warns her child. Assumptions: With the warning, the child may stop troubling her. All children are basically naughty.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The mother warns her child with the expectation that he would stop troubling her. So, I is implicit. The general nature of children cannot be derived from the statement. So, II is not implicit."
  },
  {
    id: 6,
    question: "6. Statement: The State government has decided to appoint four thousand primary school teachers during the next financial year. Assumptions: There are enough schools in the state to accommodate four thousand additional primary school teachers. The eligible candidates may not be interested to apply as the government may not finally appoint such a large number of primary school teachers.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Such decisions as given in the statement are taken only after taking the existing vacancies into consideration. So, I implicit while II isn't."
  },
  {
    id: 7,
    question: "7. Statement: A warning in a train compartment - \"To stop train, pull chain. Penalty for improper use Rs. 500.\" Assumptions: Some people misuse the alarm chain. On certain occasions, people may want to stop a running train.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, the penalty is imposed to prevent people from misusing the alarm chain. This means that some people misuse it. So, I is implicit. The alarm chain is provided to stop the running train in times of urgency. So, II is also implicit."
  },
  {
    id: 8,
    question: "8. Statement: If it is easy to become an engineer, I don't want to be an engineer. Assumptions: An individual aspires to be professional. One desires to achieve a thing which is hard earned.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Clearly, nothing is mentioned about the professional nature of the job. So, I is not implicit. The statement hints that one rejects a thing that is easy to achieve. So, II is implicit."
  },
  {
    id: 9,
    question: "9. Statement: The concession in rail fares for the journey to hill stations has been cancelled because it is not needed for people who can spend their holidays there. Assumptions: Railways should give concession only to needy persons. Railways should not encourage people to spend their holidays at hill stations.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement mentions that concessions should not be given to people who can afford to spend holidays in hill stations. This means they should be given only to needy persons. So, I is implicit. But, II does not follow from the statement and is not implicit."
  },
  {
    id: 10,
    question: "10. Statement: \"The bridge was built at the cost of Rs. 128 crores and even civil bus service is not utilizing it, what a pity to see it grossly underutilized.\" - A citizen's view on a new flyover linking east and west sides of a suburb. Assumptions: The building of such bridges does not serve any public objective. There has to be some accountability and utility of money spent on public projects.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Clearly, the statement expresses grave concern over a newly-built flyover not being utilized by public. This implies that such projects need to be taken up only after working out their utility and that the huge expenditure incurred on building such structures is worthwhile only if they prove useful for the public. Thus, only II is implicit."
  },
  {
    id: 11,
    question: "11. Statement: The Government has decided to levy 2 percent on the tax amount payable for funding drought relief programmes. Assumptions: The Government does not have sufficient money to fund drought relief programmes. The amount collected by way of surcharge may be adequate to fund these drought relief programmes.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since a surcharge has been levied to fund drought relief programmes, it follows that the Government does not have sufficient money for the same. So, I is implicit. Besides, the percentage of surcharge must have been decided after studying the expected inflow in relation to amount of funds required. So, II is also implicit."
  },
  {
    id: 12,
    question: "12. Statement: Detergents should be used to clean clothes. Assumptions: Detergents form more lather. Detergents help to dislodge grease and dirt.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Nothing is mentioned about lather formation by the detergent. So, I is not implicit. Also, detergents should be used as they clean clothes better and more easily. So, II is implicit."
  },
  {
    id: 13,
    question: "13. Statement: It will be a substantial achievement in the field of education if one provides one school for every village in our country and enforce attendance. Assumptions: Children in villages do not attend school regularly. Providing school to every village is desirable.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement lays stress on enforcing attendance. This implies that children in villages do not attend school regularly. So, I is implicit. Besides, the statement calls 'one school for every village' a 'substantial achievement'. So, II is also implicit."
  },
  {
    id: 14,
    question: "14. Statement: The government has decided to disinvest large chunk of its equity in select public sector undertakings for a better fiscal management. Assumptions: The amount generated out of the disinvestment process may reduce substantially the mounting fiscal deficits. There will be enough demand in the market for the shares of these undertakings.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The fact given in I directly follows from the phrase '..... for a better fiscal management' in the statement. So, I is implicit. However, the public response to the new policy cannot be ascertained. So, II is not implicit."
  },
  {
    id: 15,
    question: "15. Statement: Never before such a lucid book was available on the topic. Assumptions: Some other books were available on this topic. You can write lucid books on very few topics.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: It follows from the statement that books on this topic were available before also but they were not 'lucid'. So, I is implicit. But a general comment as II cannot be made from the given statement. So, II is not implicit."
  },
  {
    id: 16,
    question: "16. Statement: Please do not use lift while going down - an instruction on the top floor of a five-storey building. Assumptions: While going down, the lift is unable to carry any load. Provision of lift is a matter of facility and not of right.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement requests people not to use lift while moving down. This implies that the lift may be used to move up and the request has been made so that more people can use the lift for ascending which would otherwise cause more physical stress than going down the stairs. So, only II is implicit."
  },
  {
    id: 17,
    question: "17. Statement: \"I have not received telephone bills for nine months inspite of several complaints\" - A telephone customer's letter to the editor of a daily Assumptions: Every customer has a right to get bills regularly from the telephone company. The customer's complaints point to defect in the services which are expected to be corrected.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The customer's eagerness to get the bills makes I implicit. Besides, the customer has written to the editor to bring the malfunctioning of the department to public notice. So, II is also implicit."
  },
  {
    id: 18,
    question: "18. Statement: \"This drink can be had either as it is, or after adding ice to it.\" - An advertisement. Assumptions: People differ in their preferences. Some people will get attracted to the drink as it can be had as it is.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The advertisement tells the different ways in which the drink can be had. This means that different people prefer to have it in a different way and that some people would prefer it only because it can be taken in a particular manner. So, both I and II are implicit."
  },
  {
    id: 19,
    question: "19. Statement: Government has permitted unaided colleges to increase their fees. Assumptions: Unaided colleges are in financial difficulties. Aided colleges do not need to increase fees.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Unaided colleges have been allowed to increase their fees. This means that they are in financial difficulties. So, I is implicit. Nothing is mentioned about the aided colleges. So, II is not implicit."
  },
  {
    id: 20,
    question: "20. Statement: Be humble even after being victorious. Assumptions: Many people are humble after being victorious. Generally people are not humble.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Clearly, nothing is mentioned about the nature of the people. So, I is not implicit. Also, the statement gives an advice of being humble even after being victorious. This means that generally people are not humble. So, II is implicit."
  },
  {
    id: 21,
    question: "21. Statement: The government has decided to pay compensation to the tune of Rs. 1 lakh to the family members of those who are killed in railway accidents. Assumptions: The government has enough funds to meet the expenses due to compensation. There may be reduction in incidents of railway accidents in near future.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, the amount of compensation must have been decided keeping in mind the monetary position of the Government. So, I is implicit. However, nothing can be said about the frequency of railway accidents in future. So, II is not implicit."
  },
  {
    id: 22,
    question: "22. Statement: Films have become indispensable for the entertainment of people. Assumptions: Films are the only media of entertainment. People enjoy films.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: 'Films are indispensable' does not mean that they are the only means of entertainment. So, I is not implicit. Clearly, II follows from the statement. So, it is implicit."
  },
  {
    id: 23,
    question: "23. Statement: Of all the newspapers published in Mumbai, readership of the \"Times\" is the largest in the Metropolis. Assumptions: 'Times' is not popular in mofussil areas. 'Times' has the popular feature of cartoons on burning social and political issues.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: Neither the volume of readership of the 'Times' in areas other than the Metropolis nor the reason for its huge acclamation is evident from the statement So, neither I nor II is implicit."
  },
  {
    id: 24,
    question: "24. Statement: Apart from the entertainment value of television, its educational value cannot be ignored. Assumptions: People take television to be a means of entertainment only. The educational value of television is not realised properly.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement makes the first assumption clear though educational value is not to be ignored. So, I is implicit. That the educational value must not be ignored also shows that educational value is not realised properly. So, II is also implicit."
  },
  {
    id: 25,
    question: "25. Statement: Children are influenced more by their teachers nowadays. Assumptions: The children consider teachers as their models. A large amount of children's time is spent in school.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, it is because children consider teachers as their model that they are more influenced by them. So, I is implicit. It is not necessary that the children are influenced by teachers because they spend much time in school. So, II is not implicit."
  },
  {
    id: 26,
    question: "26. Statement: You know that your suit is excellent when people ask about your tailor who tailored the suit. Assumptions: People do not ask about your tailor if your suit is not good. The people want to know the criterion of an excellent suit.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement mentions that if the people ask about the tailor, your suit is good. This means that people ask only in the situation when the thing is good. So, I is implicit. The criteria of an excellent suit is not mentioned. So, II is not implicit."
  },
  {
    id: 27,
    question: "27. Statement: His recent investment in the shares of Company A is only a gamble. Assumptions: He may incur loss on his investment. He may gain from his investment.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 2,
    answerText: "c) Either I or II is implicit",
    solution: "Explanation: The use of the world 'gamble' indicates that he may either gain or lose in the deal."
  },
  {
    id: 28,
    question: "28. Statement: Why don't you go to the court if the employer does not pay you the Provident Fund contribution? Assumptions: Courts can intervene in matters of dispute between employer and employees. It is obligatory for the employer to pay the Provident Fund contribution to the employees.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, the statement encourages one to go to court to get his Provident Fund from his employer. This implies that the issue comes under the jurisdiction of courts and that it is the right of the employee to claim his Provident Fund. So, both I and II are implicit."
  },
  {
    id: 29,
    question: "29. Statement: 'Double your money in five months.' - An advertisement. Assumptions: The assurance is not genuine. People want their money to grow.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The truth or falsity of the promise made in the statement cannot be judged. So, I is not implicit. Since the concerned firm advertises with the assurance that money can be doubled quickly by investing with it, so II is implicit."
  },
  {
    id: 30,
    question: "30. Statement: The education of a student at collegiate level, not taking into account maintenance expenses, costs four hundred rupees a year. Collegiate education is thus drawing heavily upon the national resources of an impoverished community. So college education should be restricted to a brilliant few. Assumptions: Our resources are very limited. Only a few students should be admitted to the colleges.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The use of the words 'impoverished community' in the statement makes I implicit while the phrase 'college education should be restricted to a brilliant few' makes II implicit."
  },
  {
    id: 31,
    question: "31. Statement: A's advice to B - \"Go to Jammu via Amritsar - the shortest route\". Assumptions: B wishes to go to Jammu. A gives advice to everybody.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: A has advised B the route to Jammu. This means that B wishes to go to Jammu. So, I is implicit. The statement mentions only A's advice to B. So, II is not implicit."
  },
  {
    id: 32,
    question: "32. Statement: All existing inequalities can be reduced, if not utterly eradicated, by action of governments or by revolutionary change of government. Assumptions: Inequality is a man-made phenomenon. No person would voluntarily part with what he possesses.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Since inequality can be reduced, it means that it is not natural but created. So, I is implicit. Nothing is mentioned about people's response. So, II is not implicit."
  },
  {
    id: 33,
    question: "33. Statement: The campaign of 'Keep your city clean' started by the Civil Council did not evoke any response from the citizens. Assumptions: People do not desire to keep their city clean. The Civil Council has failed in its campaign.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: According to the statement, the campaign did not get any response from citizens. This means that people are not interested in keeping the city clean and the campaign has failed. So, both I and II are implicit."
  },
  {
    id: 34,
    question: "34. Statement: The district administration has issued a circular to all the farmers under its jurisdiction advising them for not using pesticides indiscriminately as it may pollute the ground water. Assumptions: People may stop using ground water if the farmers continue to use pesticides indiscriminately. Farmers may refrain from using pesticides indiscriminately.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The district administration has issued a circular to make the farmers aware of hazards that indiscriminate use of pesticides poses to ground water and plead them to refrain from the same. So, II is implicit. However, I cannot be assumed from the given statement and so it is not implicit."
  },
  {
    id: 35,
    question: "35. Statement: The coffee powder of company X is quite better in taste than the much advertised coffee of company Y. Assumptions: If your product is not good, your spend more on advertisement. Some people are tempted to buy a product by the advertisement.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Since the statement holds the product of company X more superior in quality than that of Y which spends more on advertisement, so I is not implicit. According to the statement, the product of company Y is more known because of more advertisement. So, II is implicit."
  },
  {
    id: 36,
    question: "36. Statement: Of all the radio sets manufactured in India, the 'X' brand has the largest sale. Assumptions: The sale of all the radio sets manufactured in India is known. The manufacturing of no other radio set in India is as large as 'X' brand radio.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, the comparison could not be made without knowing the sale of all the radio sets. So, I is implicit. The statement mentions only that the sale is largest and nothing is mentioned about the manufacture. So, II is not implicit."
  },
  {
    id: 37,
    question: "37. Statement: \"You should not grant him leave in this week due to exigency of work.\" - A supervisor advises the administrative officer. Assumptions: Request for leave can be turned down also. The supervisor has reviewed the work required to be done during the said period.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The advice is given to turn down the request for leave. So, I is implicit. The mention of the 'exigency of work' makes II implicit."
  },
  {
    id: 38,
    question: "38. Statement: Like a mad man, I decided to follow him. Assumptions: I am not a mad man. I am a mad man.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 2,
    answerText: "c) Either I or II is implicit",
    solution: "Explanation: The words 'Like a mad man' show that either a person is really mad or he is not mad but acted like mad. So, either I or II is implicit."
  },
  {
    id: 39,
    question: "39. Statement: The first step in treating addicts is to re-establish their lost ties, for which a continuous personal attention should be paid to the addicts under treatment. Assumptions: Addicts under treatment respond better when shown personal interest. Addiction and strained relationships are intimately connected.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, treatment of addiction requires personal attention as the first step. So, I is implicit. Also, since intimacy and personal attention are required to treat addicts, it implies that addiction arises out of frustration due to strained relationships. So, II is also implicit."
  },
  {
    id: 40,
    question: "40. Statement: Beware of dogs, our dogs do not bark, but they are trained to distinguish between genuine guests and intruders. Assumptions: Barking dogs bite rarely. Our dogs could be dangerous for intruders.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement clearly warns the visitors to beware of dogs as they are trained to welcome the guests and intruders differently. So, II is implicit. I is vague and hence, it is not implicit."
  },
  {
    id: 41,
    question: "41. Statement: Because of the large number of potholes in road X, reaching airport in time has become difficult. Assumptions: Reaching airport in time may not be always necessary. There is no other convenient road to the airport.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement presents the issue of 'not reaching airport in time' as a problem. This means that reaching airport in time is necessary. So, I is not implicit. Besides, it is mentioned that reaching airport in time has become difficult due to large number of potholes in road X. This implies that road X is the only possible way. So, II is implicit."
  },
  {
    id: 42,
    question: "42. Statement: Safety and health practices in many Indian companies are well below the international standards. Assumptions: International standards of health and safety are ideal and unrealistic. Indian organizations do not consider safety and health management as their prime social responsibility.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement talks about the safety and health practices in Indian companies being far below international standards. It is clearly a criticism of Indian organizations not paying considerable attention to these aspects. So, II is implicit. The international standards demand perfection and are, in no way, non-achievable. So, I is not implicit."
  },
  {
    id: 43,
    question: "43. Statement: Greater public participation results in good civic governance. - Statement of Municipal Commissioner of City A. Assumptions: The municipal office is not competent to effect good civic administration. Good civic governance is a matter of collective will and effort of the people and administration.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement stresses on the fact that though civic governance is the task of the municipal body, but all the tasks done come out to be more fruitful if the general public lends a helping hand in the same. So, only II is implicit."
  },
  {
    id: 44,
    question: "44. Statement: The regulatory authority has set up a review committee to find out the reasons for unstable stock prices. Assumptions: The investors may regain confidence in stock market by this decision. The review committee has the expertise to find out the causes for volatility in the stock market.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, I mentions the aim for which the step talked about in the statement, has been undertaken while II mentions the essential requirement for it. So, both I and II are implicit."
  },
  {
    id: 45,
    question: "45. Statement: Please note that the company will provide accommodation to only outside candidates if selected.' - A condition in an advertisement. Assumptions: The local candidates would be having some other arrangement for their stay. The company plans to select only local candidates.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement mentions that the company intends to provide accommodation only to outside candidates. This means that local candidates would have to arrange accommodation on their own and that the company may select local as well as outside candidates. Thus, only I is implicit."
  },
  {
    id: 46,
    question: "46. Statement: Cases of food poisoning due to consumption of liquor are increasing in rural areas. Assumptions: Percentage of people consuming liquor is more in rural areas. There are many unauthorized spurious liquor shops in the rural areas.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement talks of number of cases of food poisoning due to consumption of liquor and not of the number of cases consuming liquor. So, I is not implicit. Besides, the statement indicates that people in rural areas are getting spurious or low-grade liquor and no check is being kept on shops selling liquor there. So, II is implicit."
  },
  {
    id: 47,
    question: "47. Statement: Lack of stimulation in the first four or five years of life can have adverse consequences. Assumptions: A great part of the development of observed intelligence occurs in the earliest years of life 50 percent of the measurable intelligence at age of 17 is already predictable by the age of four.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The lacking in first four or five years can be adverse because it is the main period of development. So, I is implicit. Since nothing is mentioned about the predictability of intelligence, II is not implicit."
  },
  {
    id: 48,
    question: "48. Statement: The X-Airlines has decided to increase the passenger fare by 15 percent with immediate effect. Assumptions: The demand for seats of X-Airlines may remain unchanged even after the hike of fare. Other airline companies may also hike the passenger fares.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, such decisions are taken only after making sure that it will not affect the company's business adversely. So, I is implicit. However, the impact of this increase on other airlines cannot be ascertained. So, II is not implicit."
  },
  {
    id: 49,
    question: "49. Statement: Shalini made an application to the bank for a loan of Rs. 1,80,000 by mortgaging her house to the bank and promised to repay it within five years. Assumptions: The bank has a practice of granting loans for Rs. 1,00,000 and above. The bank accepts house as collateral security against such loans.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The fact that Shalini has applied for a loan of Rs. 1,80,000 implies that the bank can grant a loan above Rs. 1,00,000. So, I is implicit. II also follows directly from the statement and so is implicit."
  },
  {
    id: 50,
    question: "50. Statement: Many historians have done more harm than good by distorting truth. Assumptions: People believe what is reported by the historians. Historians are seldom expected to depict the truth.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The fact that historians have done harm by distorting truth, means that people believe what is reported by the historians. So, I is implicit. II does not follow from the statement and so is not implicit."
  },
  {
    id: 51,
    question: "51. Statement: \"As there is a great demand, every person seeking tickets of the programme will be given only five tickets.\" Assumptions: The organizers are not keen on selling the tickets. No one is interested in getting more than five tickets.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: Clearly, the organisers are adopting this policy not to reduce the sale but to cope up with great demand so that everyone can get the ticket. So, I is not implicit. Also, due to great demand, the maximum number of tickets one person can get has been reduced to five. So, II is also not implicit."
  },
  {
    id: 52,
    question: "52. Statement: \"Computer education should start at schools itself.\" Assumptions: Learning computers is easy. Computer education fetches jobs easily.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, computer education can be started at the school level only if it is easy. So, I is implicit. In the statement, nothing is mentioned about the link between jobs and computer education. So, II is not implicit."
  },
  {
    id: 53,
    question: "53. Statement: If he is intelligent, he will pass the examination. Assumptions: To pass, he must be intelligent. He will pass the examination.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement mentions that he will pass if he is intelligent. So, I is implicit. Further, this means that it is not necessary that he will pass. So, II is not implicit."
  },
  {
    id: 54,
    question: "54. Statement: Today I must satisfy myself only by looking at a pink headed duck in an encyclopaedia. Assumptions: Pink headed ducks are as good as extinct now. People refer to encyclopaedia to know only about things which do not exist now.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Since the narrator talks of satisfying himself by just looking at a picture in encyclopaedia, it means that pink headed ducks are not to be seen alive. So, I is implicit. But II does not follow from the statement and is not implicit."
  },
  {
    id: 55,
    question: "55. Statement: The organization should promote employees on the basis of merit alone and not on the basis of length of service or seniority. Assumptions: Length of service or seniority does not alone reflect merit of an employee. It is possible to determine and measure merit of an employee.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement stresses on the need to award promotion to a person who has been displaying remarkable talent and performing extraordinarily for the organisation rather than the one who has been working steadily for the organisation since long. Thus, length of service does not alone prove a man worthy. His talent and his performance are the criteria to be considered. So, both I and II are implicit."
  },
  {
    id: 56,
    question: "56. Statement: \"But out of A, B, C and D products, you buy B which alone is based on the international technology.\"- A shopkeeper tells a customer. Assumptions: The customers normally accept the recommendation of the shopkeeper. Use of international technology is supposed to ensure better quality standards.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The shopkeeper tells the customer the merits and demerits of various products, thus making it easy for him to choose. So, I is implicit. Since the shopkeeper stresses on buying B because it is based on international technology, so II is also implicit."
  },
  {
    id: 57,
    question: "57. Statement: \"If you want to give any advertisement, give it in the newspaper X.\" - A tells B. Assumptions: B wants to publicise his products. Newspaper X has a wide circulation.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The word 'If in the statement shows that B may or may not want to publicise his products. So I is not implicit. It is advised that advertisements be given in newspaper X. This means that X will help advertise better i.e., it has wider circulation. So, II is implicit."
  },
  {
    id: 58,
    question: "58. Statement: Kartik left for Delhi on Tuesday by train to attend a function to be held on Friday at his uncle's house in Delhi. Assumptions: Kartik may reach Delhi on Wednesday. Kartik may reach Delhi before Friday.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Clearly, it cannot be deduced as to which day Kartik would reach Delhi. But Kartik has left for Delhi to attend a function to be held on Friday. So, he must have planned his journey to reach Delhi before Friday. Thus, only II is implicit."
  },
  {
    id: 59,
    question: "59. Statement: \"Avon Cycles - Fast, easy to ride, impressive, reliable, crafted and up-to-date automation.\" - An advertisement. Assumptions: There is no other cycle with any of these features. People do not bother about the cost.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: The advertisement is for Avon cycles and nothing about the cost or the features of other brands of cycles, is mentioned. So, neither I nor II is implicit."
  },
  {
    id: 60,
    question: "60. Statement: \"Private property, trespassers will be prosecuted\" - A notice on a plot of land. Assumptions: The passerby may read the notice and may not trespass. The people are scared of prosecution.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Any notice is displayed assuming that people will read the notice and also follow the content of the notice. So, I is implicit. Besides, the notice threatens any trespassers to be prosecuted. So, II is also implicit."
  },
  {
    id: 61,
    question: "61. Statement: Without reforming the entire administrative system, we cannot eradicate corruption and prejudice from the society. Assumptions: The existence of corruption and prejudice is good. There is enough flexibility to change the administrative system.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement talks of eradicating corruption and prejudice from the society, which indicates that these aspects are undesirable. So, I is not implicit. Besides, the statement mentions about reforming the administrative system. So, II is implicit."
  },
  {
    id: 62,
    question: "62. Statement: The civic authority has advised the residents in the area to use mosquito repellents or sleep inside nets as large number of people are suffering from malaria. Assumptions: Local residents have enough money to arrange for the repellents or nets. People may ignore and continue to get mosquito bites as they have other pressing needs.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The civic authority has advised residents to keep away from mosquitoes to avert the risk of malaria. Such an advice would surely be adhered to by the people. So, II is not implicit. Besides, it has been advised to use mosquito repellents or nets. This means that people can afford to buy the same. So, I is implicit."
  },
  {
    id: 63,
    question: "63. Statement: Vitamin E tablets improve circulation, keep your complexion in a glowing condition. Assumptions: People like a glowing complexion. Complexion becomes dull in the absence of circulation.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Generally, only that good feature of a product is highlighted which people crave for. So, I is implicit. Since complexion glows if circulation is improved, so II is also implicit."
  },
  {
    id: 64,
    question: "64. Statement: \"Ensure a good Slight's sleeps for your family with safe and effective X mosquito coil.\" - An advertisement. Assumptions: X mosquito coil is better than any other mosquito coil. A good night's sleep is desirable.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement mentions the good qualities of X coil but this does not mean it is the best. So, I is not implicit. Besides, an advertisement highlights the feature which is desirable by customers and can lure them. So, II is implicit."
  },
  {
    id: 65,
    question: "65. Statement: \"Please do not wait for me, I may be late, start taking lunch as soon as the guests arrive. - A message from a Director of a Company to his office managers. Assumptions: Keeping guests waiting is not desirable. Lunch may not be ready in time.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, the Director instructs his managers not to keep the guests waiting because of him and to proceed with lunch soon after their arrival. This implies that lunch would be ready in time. So, only I is implicit."
  },
  {
    id: 66,
    question: "66. Statement: If you have any problems, bring them to me. Assumptions: You have some problems. I can solve any problem.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The word 'If shows that 'you' do not necessarily have problems. So, I is not implicit. Also, the statement states that problems will be solved by 'me'. So II is implicit."
  },
  {
    id: 67,
    question: "67. Statement: A sentence in the letter to the candidates called for written examination - 'You have to bear your expenses on travel etc'. Assumptions: If not clarified all the candidates may claim reimbursement of expenses. Many organizations reimburse expenses on travel to candidates called for written examination.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, not mentioning the condition may provoke all the candidates to demand their claim. So, I is implicit. The condition is mentioned because some companies do reimburse the travel expenses. So, II is also implicit."
  },
  {
    id: 68,
    question: "68. Statement: The State Government has abolished the scheme of providing concessional air ticket to students. Assumptions: Students will not travel by air in future. The students who resort to travel by air can bear the expenses of air ticket.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The scheme has been abolished not to discourage the students from travelling by air but keeping in mind that the abolition of scheme won't stop them from travelling by air. So, only II is implicit."
  },
  {
    id: 69,
    question: "69. Statement: \"To buy a X - T.V, contact Y - the sole agent of X-T.V.\" - An advertisement. Assumptions: People generally prefer to buy T.V. through sole agent. The T.V. producing companies do not sell their products directly.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: The advertisement persuades the people to meet the sole agent Y to buy X-T. V. This does not mean that the people prefer to buy TV. through the sole agent or that the TV. companies only sell their products through the sole agents. So, both I and II are not implicit."
  },
  {
    id: 70,
    question: "70. Statement: Why don't you invite Anthony for the Christmas party this year? Assumptions: Anthony is not from the same city. Unless invited Anthony will not attend the party.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Anthony's place of living is not mentioned in the statement. So, I is not implicit. Assumption II follows from the statement and so it is implicit."
  },
  {
    id: 71,
    question: "71. Statement: Sachin wrote to his brother at Bangalore to collect personally the application form from the University for the Post-graduation Course in Mathematics. Assumptions: The University may issue application forms to a person other than the prospective student. Sachin's brother may receive the letter well before the last date of collecting application forms.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since Sachin has asked his brother to collect the form, it is evident that the university may issue the form to anybody and that Sachin's brother would receive the letter before the last date of collecting the forms. So, both I and II are implicit."
  },
  {
    id: 72,
    question: "72. Statement: \"Apply nets on windows to prevent the entrance of mosquitoes in the house.\" Assumptions: The entering of mosquitoes from entrances other than windows is desirable. Nets are not available to apply on doors.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: The statement talks of a way to keep mosquitoes away. This means that entry of mosquitoes in the house is not desirable. So, I is not implicit. Besides, the statement advises using nets on windows. So, nothing about the use of nets on doors, can be deduced. Thus, II is also not implicit."
  },
  {
    id: 73,
    question: "73. Statement: Among all the articles, the prices of personal computers show the highest decline from June 2005 to December 2005. Assumptions: Comparative prices of all the articles in June and December 2005 were available. Prices of personal computers were higher in the first six months than the last six months of 2005.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since prices of personal computers show the highest decline among all the articles, it implies that the comparative prices of all the articles was known. So, I is implicit. Also, it being given that prices of computers showed decline during the last six months, it means that they were higher in the first six months. So, II is implicit."
  },
  {
    id: 74,
    question: "74. Statement: Most people who stop smoking gain weight. Assumptions: If one stops smoking, one will gain weight. If one does not stop smoking, one will not gain weight.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: The statement talks of most people' and not 'all'. So, I is not necessarily true. Thus, I is not implicit. The condition, if one does not stop smoking, cannot be deduced from the statement. So, II is also not implicit."
  },
  {
    id: 75,
    question: "75. Statement: Please consult us before making any decision on investment. Assumptions: You may take a wrong decision if you don't consult us. It is important to take a right decision.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, the statement was spoken for fear that the other person may take a wrong decision. So, I is implicit. Again, the statement confirms that it is important to take the right decision. So, II is also implicit."
  },
  {
    id: 76,
    question: "76. Statement: The Parent Teacher Association (PTA) of a school has informed the Principal that they will not send their children to the school unless the school - authority reduces the fees with immediate effect. Assumptions: Majority of the parents may agree with the PTA and may not send their wards with the school The school authority may accede to the demand of the PTA and reduce the fees.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The PTA is an association which would surely reflect the parents' interests and act to get them fulfilled. So, both I and II are implicit."
  },
  {
    id: 77,
    question: "77. Statement: \"Those who are appearing for this examination for the first time should be helped in filling up the form.\" - An instruction to invigilating staff. Assumptions: The form is somewhat complicated. Candidates can appear more than once for this examination.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement mentions that only those students are to be helped who are filling up the form for the first time. This does not mean that the form is complicated/So, I is not implicit. However, II follows from the statement and so is implicit."
  },
  {
    id: 78,
    question: "78. Statement: Success is how much a person bounces up after hitting the bottom. Assumptions: Success requires conscious efforts without being discouraged by failure. Failure cannot be considered an acceptable thing.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement defines 'Success' as 'bouncing up'. This means that success can be achieved by striving hard to touch the top, without being harassed by any of the hurdles which come in the way. So, I is implicit. The fact in II cannot be assumed from the given statement."
  },
  {
    id: 79,
    question: "79. Statement: The company has the right to reject any application form without furnishing any reason while sorting the list of candidates for interview - A condition mentioned in the employment notice. Assumptions: It is desirable to call only eligible candidates for interview. The company believes in following impartial practice in all its functions.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: . Since the statement talks of the company short-listing the candidates to be called for interview, so I is implicit. However, nothing can be deduced about whether the company would make a partial or fair selection of candidates. So, II is not implicit."
  },
  {
    id: 80,
    question: "80. Statement: The government has set up a fact finding mission to look into the possible reasons for the recent violence in the area. Assumptions: The mission may be able to come up with credible information about the incidents. The people in the area may cooperate with the mission and come forward to give detailed information related to the incidents.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, the plan of the government is to work out the causes for spread of violence and then take adequate steps to uproot them. So, I is implicit. Besides, this step of the government is for the welfare of the general public only. So, II is also implicit."
  },
  {
    id: 81,
    question: "81. Statement: I cannot contact you on phone from Karshik. Assumptions: Telephone facility is not available at Karshik. Nowadays it is difficult to contact on phone.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement indicates the impossibility of phone contact from Karshik. Thus, the fact in I may be assumed from the given statement. So, I is implicit However, II indicates difficulty, not the impossibility of contact as is indicated in the statement. So, II is not implicit."
  },
  {
    id: 82,
    question: "82. Statement: I have written several letters to the branch manager regarding my account in the bank but did not receive any reply so far. Assumptions: Branch manager is expected to read letters received from the customer. Branch manager is expected to reply to the letters received from the customers.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since both I and II follow from the given statement, so both are implicit."
  },
  {
    id: 83,
    question: "83. Statement: \"Use our product to improve memory of our child. It is based on natural herbs and has no harmful side effects.\" - An advertisement of a pharmaceutical company. Assumptions: People generally opt for a medical product which is useful and has no harmful side effects. Improving memory of child is considered as important by many parents.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: An advertisement highlights only those features of a product, which are liked by people and are also desirable. So, both I and II are implicit."
  },
  {
    id: 84,
    question: "84. Statement: \"If I am not well you will have to go for the meeting.\" - A manager tells his subordinate. Assumptions: It is not necessary that only manager level personnel attend the meeting. If the manager is well, he would himself like to go for the meeting.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, the subordinate can attend the meeting as told by the Manager only when there is no inhibition. So, I is implicit. The subordinate is told to go only in case when the Manager is not well. This also shows the urgency to attend the meeting. So, II is also implicit."
  },
  {
    id: 85,
    question: "85. Statement: The Principal instructed all the teachers to be careful in class because some students may disturb other students. Assumptions: The teachers will handle the situation properly and they will point out the naughty students. The students will welcome the decision of the Principal.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, teachers have been instructed to maintain discipline in the class and point out the naughty students who do not let other students study. So, I is implicit. Besides, the implementation of the instructions would surely help good students to concentrate on their studies and ensure a good working atmosphere in the class. So, II is also implicit."
  },
  {
    id: 86,
    question: "86. Statement: The present examination system needs overhauling thoroughly. Assumptions: The present examination system is obsolete. Overhauling results in improvement.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The 'thorough' overhauling is needed only in case of an obsolete system. So, I is implicit. Overhauling is done for improvement. So, II is also implicit."
  },
  {
    id: 87,
    question: "87. Statement: Read this book to get detailed and most comprehensive information on this issue. Assumptions: The person who wants this information can read. There are other books available on this issue.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, I directly follows from the statement. So, I is implicit. Also, according to the statement, this particular book gives 'most comprehensive' information on the issue. So, it can be assumed that other books are also available on this topic. Thus, II is also implicit."
  },
  {
    id: 88,
    question: "88. Statement: Traffic jams on most of the roads in the city have become a regular feature during monsoon. Assumptions: Material used for road construction cannot withstand the fury of monsoon resulting into innumerable pot holes on the roads. Number of vehicles coming on the roads is much more in monsoon as compared to other seasons.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, the problem of traffic jams arises during monsoons not because of increased number of vehicles but due to slow movement of traffic on account of bad roads. So, only I is implicit."
  },
  {
    id: 89,
    question: "89. Statement: 'Guests should be provided lunch.' - A tells B. Assumptions: Unless told, lunch may not be provided. Guests will stay during lunch time.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since both I and II follow from the statement, so both are implicit."
  },
  {
    id: 90,
    question: "90. Statement: The city bus transport corporation has decided to change routes of three buses plying between paints A and B in the city to make them economically viable. Assumptions: These buses may get more passengers on the revised routes. Many people residing on the old routes may not avail bus services.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement mentions that the routes have been so changed as to make them economically viable. This means that new stoppages have been so selected as to cater to a larger number of people than before. So, I is implicit. Further, the people already travelling by these buses would not be devoid of the same and they would also get the facility in their vicinity, be it the same bus or another one. So, II is not implicit."
  },
  {
    id: 91,
    question: "91. Statement: The patient's condition would improve after operation. Assumptions: The patient can be operated upon in this condition. The patient cannot be operated upon in this condition.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The fact that patient's condition would improve after the operation clearly implies that the patient can be operated upon in this condition. So, I is implicit."
  },
  {
    id: 92,
    question: "92. Statement: Provide mid-day meals to the children in primary schools to increase the number of students attending schools. Assumptions: Mid-day meals will attract the children to the schools. Those children who are otherwise deprived of good food will attend the schools.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Providing mid-day meals would attract more number of children as an added privilege and not because the children are deprived of good meals at home. So, only I is implicit."
  },
  {
    id: 93,
    question: "93. Statement: This year most of the shops and departmental stores are offering prizes and discounts on purchases to attract customers. Assumptions: The shops and departmental stores have so far earned a lot of profit, so now they have started sharing it with the customers. Lots of goods are available but the sale is not shooting up. There is no cheer for the customers.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: That someone has earned a lot is no reason to share the profit margin with the customers. So, I is not implicit. Clearly, the offers have been announced to attract more customers and boost up the sale. So, II is implicit."
  },
  {
    id: 94,
    question: "94. Statement: In case of any difficulty about this case, you may contact our company's lawyer. Assumptions: Each company has a lawyer of its own. The company's lawyer is thoroughly briefed about this case.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: No decision can be made regarding other companies. So, I is not implicit. Since one is advised to contact the company's lawyer in case of any problem, it means that the lawyer is fully acquainted with the case. So, II is implicit."
  },
  {
    id: 95,
    question: "95. Statement: Imprisonment for 27 years made Nelson Mandela, the President. Assumptions: Only who will be imprisoned for 27 years will become the President. To become the President, imprisonment is a qualification.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: The statement implies that it was not 'literally' imprisonment, but Nelson Mandela's dedicated service to the nation and his struggle for freedom despite various hardships that won him the desired public appeal to be elected the President. So, neither I nor II is implicit."
  },
  {
    id: 96,
    question: "96. Statement: Nobody can predict as to how long our country would take to contain the unfortunate and disastrous terrorist activities. Assumptions: It is impossible to put on end to terrorist activities Efforts to control the terrorist activities are on.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement expresses concern over the issue as to when our country would be able to curb terrorism completely. This means that efforts are on and it is quite possible to put an end to terrorist activities although it could take longer. So, only II is implicit."
  },
  {
    id: 97,
    question: "97. Statement: The management of XYZ Pvt. Ltd. asked the workers' union to call off strike immediately otherwise the management would be forced to close down the factory. Assumptions: No alternative other than closing down the factory is left for the management of XYZ Pvt. Ltd Such threat may have some effect on the workers' union.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Such a warning is usually given to the workers to threaten them that they would lose their job and income forever if they didn't mend their ways. So, only II is implicit."
  },
  {
    id: 98,
    question: "98. Statement: The end of a financial year is the ideal time to take a look at the performance of various companies. Assumptions: All the companies take such a review at the end of a financial year. The performance data of various companies is available.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since both I and II follow from the given statement, so both are implicit."
  },
  {
    id: 99,
    question: "99. Statement: The party president has directed that no member of the party will give press briefing or interviews to governments and private T.V. channels about the discussion in scheduled meeting of the party. Assumptions: Party members will observe this directive of the president. The general public will not come to know about the happenings in the scheduled meeting of the party.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, the party president lays down the policies for its members. So, I is implicit. Also, when no party member would publicly reveal the happenings in the meeting, nobody will come to know. So, II is also implicit."
  },
  {
    id: 100,
    question: "100. Statement: \"To keep myself up-to-date, I always listen to 9.00 p.m. news on radio.\"- A candidate tells the interview board. Assumptions: The candidate does not read newspaper. Recent news is broadcast only on radio.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: The candidate listens to news on the radio does not mean that he does not read newspaper or that radio is the only source of recent news. So, neither I nor II is implicit."
  },
  {
    id: 101,
    question: "101. Statement: The entire north India, including Delhi and the neighbouring states remained 'powerless' the whole day of 19th December as the northern grid supplying electricity to the seven states collapsed yet again. Assumptions: The northern grid had collapsed earlier. The grid system of providing electricity to a group of states is an ineffective type of power supply system.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement mentions that the northern grid collapsed 'yet again'. This means that it had collapsed earlier also. So, I is implicit. Also, the statement talks of a particular fault in the system but does not condemn the grid system. So, II is not implicit."
  },
  {
    id: 102,
    question: "102. Statement: Believe me, I have read it in newspaper X. Assumptions: Newspaper X gives reliable information/news. I am reporting exactly as it is given in newspaper X.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The narrator in the statement clearly insists on the reliability of the fact that what he said, he had read it in newspaper X, and not on the truth of what he said. So, only II is implicit"
  },
  {
    id: 103,
    question: "103. Statement: Many people have expressed surprise as the princess has broken the royal tradition of marriage by choosing a commoner as her life partner. Assumptions: People expect royal families to observe customs and traditions. People still value 'purity of royal blood' and 'status' when it comes to a marriage of members of royal family.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since the princess' step has been taken by surprise, it is evident that she was not expected to marry a commoner but a person of equivalent 'status*. So, both I and II are implicit."
  },
  {
    id: 104,
    question: "104. Statement: Highly brilliant and industrious students do not always excel in the written examination. Assumptions: The written examination is good mainly for mediocre students. The brilliant and industrious students cannot always write good answers in the exam",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: II explains the fact given in the statement and so is implicit. Nothing about 'mediocre students' is mentioned in or can be deduced from the given statement. So, I is not implicit."
  },
  {
    id: 105,
    question: "105. Statement: All the employees are notified that the organisation will provide transport facilities at half cost from the nearby railway station to the office except those who have been provided with travelling allowance. Assumptions: Most of the employees will travel by the office transport. Those who are provided with travelling allowance will not read such notice.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The facility given by the office shall be an added privilege and many employees will avail of the same. So, I is implicit. Also, the statement 'All the employees are notified.....' implies that the notice is for all the employees. So, II is not implicit."
  },
  {
    id: 106,
    question: "106. Statement: The government has decided to hold the employers responsible for deducting tax at source for all its employees. Assumptions: The employers may still not arrange to deduct tax at source for its employees. The employees may not allow the employers to deduct tax at source.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: Such decisions are implemented by the government as laws, which are binding on both the employers and the employees. So, neither I nor II is implicit."
  },
  {
    id: 107,
    question: "107. Statement: Whenever you have any doubt on this subject, you may refer to the book by Enn and Enn. Assumptions: The book by Enn and Enn is available. There is no other book on this subject.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The recommendation of the book by Enn and Enn implies that it is available. So, I is implicit. Also, the book has been referred to as a good one, but this does not mean that no other books are available on the subject. So, II is not implicit."
  },
  {
    id: 108,
    question: "108. Statement: I can take you quickly from Kanpur to Lucknow by my cab but then you must pay me double the normal charges, Assumptions: Normally, it will take more time to reach Lucknow from Kanpur. People want to reach quickly but they will not pay extra money for it.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Since the narrator asks for double charges to take the person quickly to Lucknow, it implies that normally it takes more time to reach Lucknow. So, I is implicit. Since one demands extra charges to reach the destination earlier than usual, the person in need would have to pay accordingly. So, II is not implicit."
  },
  {
    id: 109,
    question: "109. Statement: \"I would like to study the impact of pay revision on job satisfaction of employees.\" - A tells B. Assumptions: Job satisfaction can be measured. A has necessary competence to undertake such study.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, A wishes to study the degree of effect of pay revision on job satisfaction of employees. This means that job satisfaction can be measured and A is capable of making such a study. So, both I and II are implicit."
  },
  {
    id: 110,
    question: "110. Statement: \"In the recently imposed war, global public opinion was dishonoured by the economically strong and scientifically advanced superpower.\" Assumptions: Superpowers need not take any heed of global public opinion. Global public opinion must have been against the imposition of war.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Since discard of public opinion has invited concern, it means that superpowers too are expected to heed public opinion. So, I is not implicit. Also, the statement mentions that war has been imposed and public opinion dishonoured. This implies that global public opinion was against the war. So, II is implicit."
  },
  {
    id: 111,
    question: "111. Statement: How is it that the village is not shown in this so-called official map of this district? Assumptions: The official district map is expected to show all the villages of that district. This is not an authentic and official map.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement expresses a doubt at the non-depiction of the village in a map which was said to be an 'official' one. So, both I and II are implicit."
  },
  {
    id: 112,
    question: "112. Statement: The cost of living has gone up in India. Assumptions: The price of essential commodities has gone up in recent times. Many luxury goods are available in plenty in the country.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The cost of living is directly associated with the prices of essential commodities. So, I is implicit. II denotes an essential consequence of rise in cost of living. So, II is also implicit."
  },
  {
    id: 113,
    question: "113. Statement: No budgetary provision for the purpose of appointing additional faculty would be made in the context of institute's changed financial priorities. Assumptions: Appointment of faculty requires funds. There are areas other than appointment of faculty which require more financial attention.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The phrase 'budgetary provision for the purpose of appointing additional faculty' makes I implicit. Also, since no budgetary provision was provided for appointment of faculty in view of certain changed financial priorities, it means that some other issues require more financial attention. So, II is also implicit."
  },
  {
    id: 114,
    question: "114. Statement: The economic condition of the country has gone from bad to worse. Assumptions: The government has failed to tackle economic problems. People are not cooperating with the government.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement implies that the existing economic problems have worsened. So, I is implicit. Nothing about the people's attitude is mentioned. So, II is not implicit."
  },
  {
    id: 115,
    question: "115. Statement: Science is a sort of news agency comparable in principle to other new agencies. But this news agency gives us information which is reliable to an extraordinary high degree due to elaborate techniques of verification and its capacity to survive centuries. So, science should be read with as much interest as we read news. Assumptions: Science encourages investigative spirit. People read news out of interest.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement mentions that science is reliable as facts can be verified by investigation. So, I is implicit. II follows directly from the last sentence in the statement and so it is also implicit."
  },
  {
    id: 116,
    question: "116. Statement: Deepak has a large collection of books and he keeps on purchasing new books to add to his collection. Assumptions: Deepak loves and cares for books. Deepak has read each and every book that he has purchased.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement clearly reflects Deepak's exceptional interest in books. So, I is implicit. However, how many books of his collection he has gone through, cannot be deduced from the statement. Thus, II is not implicit."
  },
  {
    id: 117,
    question: "117. Statement: An advertisement in a newspaper - \"Wanted unmarried, presentable, matriculate girls between 18 and 21, able to speak fluently in English to be taken as models.\" Assumptions: Fluency in English is a pre-requisite for good performance as a model. Height does not matter in performing as a model.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: 'Fluency in English' is a condition mentioned for girls to be taken as models. So, I is implicit. Since nothing is mentioned about the height, so II is not implicit."
  },
  {
    id: 118,
    question: "118. Statement: There has been a remarkable increase in the air traffic in India during the past few years. Assumptions: Travelling by air has become a status symbol now. Large numbers of peoples are able to afford air travel now.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement indicates that the number of people travelling by air has increased in the recent years. This clearly implies that large number of people can now afford air travel. So, only II is implicit."
  },
  {
    id: 119,
    question: "119. Statement: \"Blue tie would help us identify our staff from others.\" - A suggestion in a company. Assumptions: The company needs to identify its staff. Blue tie is the latest fashion.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, the suggestion is given for providing a method of identification. This means that the staff needs to be identified. So, I is implicit. The statement does not mention anything about the fashion. So, II is not implicit."
  },
  {
    id: 120,
    question: "120. Statement: A's advice to B - \"If you want to study Accounts, join Institute Y.\" Assumptions: Institute Y provides good Accounts education. B listens to As advice.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, A advises B to join Y because it provides good Accounts education. So, I is implicit. It is not mentioned whether B listens to A's advice or not. So, II is not implicit."
  },
  {
    id: 121,
    question: "121. Statement: \"You must learn to refer to dictionary if you want to become a good writer.\" - A advises B. Assumptions: Only writers refer to the dictionary. All writers, good or bad, refer to the dictionary.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: It does not follow from the statement that only writers and nobody else refers to the dictionary. Also, nothing is mentioned about bad writers. So, neither I nor II is implicit."
  },
  {
    id: 122,
    question: "122. Statement: It is through participative management policy alone that indiscipline in our industries can be contained and a quality of life ensured to the worker. Assumptions: Quality of life in our industries is better. Indiscipline results in poor quality of life.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement mentions that participative management policy 'will' provide quality life to the workers. So, I is not implicit. Clearly, the statement mentions that participative management will contain the indiscipline and ensure quality life to workers. So, II is implicit."
  },
  {
    id: 123,
    question: "123. Statement: A line in an advertisement in a newspaper - \"You really get your money's worth when you buy from our shop.\" Assumptions: Other shops price goods above their worth. People want full value for their money.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Clearly, the advertisement mentions nothing about the prices of goods in the various shops. So, I is not implicit. The advertisement is given keeping in mind the desire of the people to get full value of their money. So, II is implicit."
  },
  {
    id: 124,
    question: "124. Statement: The next meeting of the Governing Board of the Institute will be held after one year. Assumptions: The Institute will remain in function after one year. The Governing Board will be dissolved after one year.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: That the meeting of the Governing Board will be held after one year means the Institute will be functioning at that time. So, I is implicit. The Board cannot be dissolved at the time\" when its meeting starts. So, II is not implicit."
  },
  {
    id: 125,
    question: "125. Statement: Municipal Corporation has decided to ban the entry of vehicles from sub-urban areas to the main city through main routes during peak hours to avoid traffic congestion. Assumptions: The people of sub-urban areas should not bring their vehicles during peak hours. There is no traffic congestion by the vehicles of people residing in the main city.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: It is mentioned that entry only through main routes has been banned. So, I is not implicit. Besides, the entry has been banned to reduce the volume of traffic on roads and ease congestion. It could only be done at the entrances to the city and not within the city itself. So, congestion by the city vehicles is unavoidable. Hence, II is also not implicit."
  },
  {
    id: 126,
    question: "126. Statement: A good book, even if costly, is sold. Assumptions: Some books are better than others. Most of the books are costly.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement talks about a 'good' book. This means that some books may not be good. So, I is implicit. The words 'if costly' show that most books are not costly. So, II is not implicit."
  },
  {
    id: 127,
    question: "127. Statement: World Health Organisation has decided to double its assistance to various health programmes in India as per-capita expenditure on health in India is very low compared to many other countries. Assumptions: The enhanced assistance may substantially increase the per-capita expenditure on health in India and bring it on par with other countries. The Government funding is less than adequate to provide medical facilities in India.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The fact that WHO has extended its assistance to India implies that government funding here is not adequate. So, II is implicit. Besides, WHO has decided to provide assistance to health programmes in India keeping in mind the considerably low per-capita expenditure on health. So, I is also implicit."
  },
  {
    id: 128,
    question: "128. Statement: The President assured the people that elections will be held here after every five years, Assumptions: People are afraid that the elections may not be held at all. People are afraid that the elections may not be held after five years.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 2,
    answerText: "c) Either I or II is implicit",
    solution: "Explanation: Clearly, the statement is made to eliminate the fear of the people that the elections may not be held at all or they may not be held after five years. So, either I or II is implicit."
  },
  {
    id: 129,
    question: "129. Statement: Interview conducted for selecting people for jobs should measure personality characteristics of candidates. Assumptions: Performance on job depends on personality characteristics. Personality characteristics can be measured in interview.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: According to the statement, the personality characteristics of candidates should be essentially measured in interviews before selection for jobs. So, both I and II are implicit.\""
  },
  {
    id: 130,
    question: "130. Statement: A Notice Board at a ticket window: Please come in queue.' Assumptions: Unless instructed people will not form queue. People any way want to purchase tickets.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The instructions have been given so that people willing to buy tickets may not form a crowd. So, I is implicit. Also, it is clear that people would purchase the tickets even after following the given instructions. So, II is also implicit."
  },
  {
    id: 131,
    question: "131. Statement: Children, who get encouragement, usually perform better. - A note by the Principal to the parents. Assumptions: Some parents do not encourage children. Parents may follow Principal's advice.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement talks of the performance of children who get encouragement. It means that there are some children who are not encouraged. So, I is implicit. Also, the Principal notifies to the parents that encouragement helps children improve their performance, with the hope that they too would encourage their children. So, II is also implicit,"
  },
  {
    id: 132,
    question: "132. Statement: \"According to me, you should get your child examined by a specialist doctor.\" - A tells B. Assumptions: Specialist doctors are able to diagnose better than ordinary doctors. B will certainly not agree with A's advice.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The advice particularly mentions 'a specialist doctor' and not simply 'doctor'. So, I is implicit, B's response to A's advice cannot be deduced from the given statement. So, II is not implicit."
  },
  {
    id: 133,
    question: "133. Statement: The government is making efforts to boost tourism in State X. Assumptions: Tourism in State X dropped following political unrest. Special discounts in the air fare have been announced.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: Efforts are being made to boost tourism does not mean that tourism has dropped. So, I is not implicit. Also, the statement mentions nothing about discounts in air fare. So, II is also not implicit."
  },
  {
    id: 134,
    question: "134. Statement: \"Best way to solve this problem of workers' dissatisfaction is to offer them cash rewards. If this type of incentive can solve the problem in CIDCO Company then why not here.\" - A Personnel Manager tells the Chairman of a company. Assumptions: The reason for workers' dissatisfaction in both the companies was similar. Monetary incentives have universal appeal.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since the policy is expected to work just because it turned out fruitful in another company, it is evident that the problem in both companies was similar and monetary incentives always motivate workers. So, both I and II are implicit."
  },
  {
    id: 135,
    question: "135. Statement: Do not copy our software without our permission - A notice. Assumptions: It is possible to copy the software. Such warning will have some effect.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since the notice warns one against copying software without permission, it is evident that software can be copied. So, I is implicit. Also, the warning is given with the motive that no one dares to copy the software. So, II is also implicit."
  },
  {
    id: 136,
    question: "136. Statement: Retired persons should not be appointed for executive posts in other organisations. Assumptions: Retired persons may lack the zeal and commitment to carry out executive's work. Retired persons do not take interest in the work and welfare of the new organisation.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: Since both I and II do not follow from the statement, so neither of them is implicit."
  },
  {
    id: 137,
    question: "137. Statement: \"In my absence, I request you to look after the affairs of our company.\" - B tells C. Assumptions: C may not accept the request of B. C has the expertise to handle the affairs of the company.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: C's response to B's request cannot be deduced from the statement. So, I is not implicit. Also, B wishes to authorise C to look after the company in his absence. This means that C is capable of handling the affairs. So, II is implicit."
  },
  {
    id: 138,
    question: "138. Statement: An announcement: Passengers in their own interest are advised to fasten their seat belts while seated in the trolley of the ropeway. Assumptions: People are always careful about their own safety. Unless advised, passengers might not use the seat belts.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The stress on 'in their own interest' in the statement indicates that people should use seat belts for their own safety. So, I is implicit. Besides, the announcement has been made to caution passengers to be careful if they want to enjoy a safe ride. So, II is also implicit."
  },
  {
    id: 139,
    question: "139. Statement: \"Banking services are fine tuned to meet growing business needs,\" - An advertisement. Assumptions: Banking is a part of business activity Industrialists prefer better banking services.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: According to the statement, banking is associated with business activity. So, I is implicit. Banking is adjusted in a way to promote business needs. This means that business is promoted by better banking. So, II is also implicit."
  },
  {
    id: 140,
    question: "140. Statement: The 'M' Cooperative Housing Society has put up a notice at its gate those sales persons are not allowed inside the society. Assumptions: All the sales persons will stay away from the 'M' Cooperative Housing Society. The security guard posted at the gate may be able to stop the sales persons entering the society.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since both the assumptions follow from the given statement, so both I and II are implicit."
  },
  {
    id: 141,
    question: "141. Statement: What a fool I am to rely on trickster like Shaleen ! Assumptions: Shaleen is unreliable. I am a fool.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Since one condemns oneself to rely on Shaleen, so I is implicit. The statement mentions that it was foolish to rely on Shaleen. So, the person is a fool. Thus, II is implicit."
  },
  {
    id: 142,
    question: "142. Statement: The multinational fast food chains are opening up a large number of Plus Coffee Shops with piped modern music in different cities of India and these are serving various breakfast (snax) with coffee. Assumptions: A large number of persons may become regular customers of these coffee shops. The people will like to enjoy the comfortable environment while drinking coffee with snax.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The concept of Plus Coffee Shops has been attracted to draw in more customers by providing a calm, soothing, musical environment along with a wide variety of breakfast. So, both I and II are implicit."
  },
  {
    id: 143,
    question: "143. Statement: Market trends are changing continuously and with increasing competitiveness, the consumer's demands with respect to the prices and quality are gradually increasing. Assumptions: The consumers did not care for the prices and quality earlier. Market competitiveness is not favourable for the consumers.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: The statement talks of 'increasing demands' of consumers. It does not imply that consumers were indifferent to price and quality earlier. So, I is not implicit. Besides, the statement mentions I that increasing competitiveness has made available to consumers a wide variety of options which has led them to comparing things and choosing the one which best suits their requirements and budget. They are thus getting better 'value for their money'. So, II is also not implicit."
  },
  {
    id: 144,
    question: "144. Statement: The school authorities have decided to increase the number of students in each classroom to seventy from the next academic session to bridge the gap between the income and the expenditure to a large extent. Assumptions: The income generated by way of fees of the additional students will be sufficient enough to bridge the gap. The school will get all the additional students in each class from the next academic session.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, increasing the number of children in each class would increase the income and reduce the expenditure per child. But the response to the school's decision cannot be deduced. So, only I is implicit."
  },
  {
    id: 145,
    question: "145. Statement: The General Administration Department has issued a circular to all the employees informing them that henceforth the employees can avail their lunch break at any of the half-hour slots between 1.00 p.m. and 2.30 p.m. Assumptions: The employees may welcome the decision and avail lunch break at different time's slots. There may not be any break in the work of the organization as the employees will have their lunch break at different time slots.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The employees' reaction to the new decision cannot be deduced from the statement. So, I is not implicit. However, II denotes the most probable consequence of the new decision. So, II is implicit."
  },
  {
    id: 146,
    question: "146. Statement: Lock your valuables in a cupboard and call everybody gentleman. Assumptions: Valuables locked in cupboard cannot be stolen. Stealing is a crime.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement points out that a person who keeps his things locked away shall feel that every person is good because he has no danger for his things. So, I is implicit. The statement mentions nothing about the lawful nature of the act of stealing. So, II is not implicit,"
  },
  {
    id: 147,
    question: "147. Statement: \"The function will start at 3 P.M. You are requested to take your seats before 3 P.M.\" - Last sentence in an invitation card. Assumptions: If the invitee is not in his seat before 3 P.M., the function will not start. Function will start as scheduled.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: It is mentioned that the function will start at 3 RM. and not that the invitees will be waited for. So, I is not implicit and only II is implicit."
  },
  {
    id: 148,
    question: "148. Statement: The two countries have signed a fragile pact, but the vital sovereignty issue remains unresolved. Assumptions: The two countries cannot have permanent peace pact. The two countries may become hostile again after a short spell of time.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: From the fact that the present pact is not a lasting one, the possibility of a permanent pact cannot be ruled out. So, I is not implicit. The statement mentions that the present pact is a 'fragile' one and the vital sovereignty issue still remains unresolved. So the same issue may rise again in the future. Thus, II is implicit."
  },
  {
    id: 149,
    question: "149. Statement: Government aided schools should have uniformity in charging various fees. Assumptions: The Government's subsidy comes from the money collected by way of taxes from people. The Government while giving subsidy may have stipulated certain uniform conditions regarding fees.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Nothing about the source of Government's subsidy can be deduced from the statement. So, I is not implicit. However, II follows from the statement and so it is implicit."
  },
  {
    id: 150,
    question: "150. Statement: Sachin's mother instructed him to return home by train if it rains heavily. Assumptions: Sachin may not be able to decide himself if it rains heavily. The trains may ply even if it rains heavily.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Sachin's mother has instructed him as a matter of caution and out of care for her child, and not because Sachin himself would not be able to decide. So, I is not implicit. Besides, Sachin's mother instructs him to take to train journey in case it rains heavily. So, II is implicit."
  },
  {
    id: 151,
    question: "151. Statement: \"Please put more people on the job to make up for the delay.\" Assumptions: Delay is inevitable in most jobs. Output will increase with more number of people on the job.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The advice tells to 'make up for the delay' showing that delay is not to be done. So, I is not implicit. Since increase in number of people will make up for the delay, it means the output will increase with this increase in number. So, II is implicit."
  },
  {
    id: 152,
    question: "152. Statement: In spite of less than normal rainfall in the catchment areas during the first two months of monsoon of the lakes supplying water to the city the authority has not yet affected any cut in the water supply to the city. Assumptions: The rainfall during the remaining part of the monsoon may be adequate for normal water supply. The present water level of the lakes supplying water to the city may be adequate for normal supply.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement clearly indicates that at present the water level of the lakes is adequate. There is nothing of a shortage to induce a cut in water supply and still there is time to wait and watch the performance of rains during the remaining monsoon period. So, both I and II are implicit."
  },
  {
    id: 153,
    question: "153. Statement: If you are an engineer, we have a challenging job for you. Assumptions: We need an engineer. You are an engineer.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, job is offered to an engineer. This means that he is needed. So, I is implicit. The word 'If' in the statement makes II not implicit."
  },
  {
    id: 154,
    question: "154. Statement: In spite of poor services, the commutators have not complained against it. Assumptions: Generally people do not tolerate poor services. Complaints sometimes improve services.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement expresses an expectation of complaints from the people against poor services. So, I is implicit. But the effect of complaints cannot be deduced. So, II is not implicit."
  },
  {
    id: 155,
    question: "155. Statement: In Bombay, railway trains are indispensable for people in the suburbs to reach their places of work on time. Assumptions: Railway trains are the only mode of transport available in the suburbs of Bombay. Only railway trains run punctually.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: That the railway trains are indispensable for people to reach the place on time does not mean that there are no other means of transport but shows that trains alone run on time. So, I is not implicit and only II is implicit."
  },
  {
    id: 156,
    question: "156. Statement: The government has decided to reduce its subsidy on LPG; however the subsidy on kerosene remains unchanged. Assumptions: Those people who buy LPG can afford to purchase LPG for a higher price. Many people may stop buying LPG and instead use kerosene.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, the decision has been taken keeping in mind that the section of people using LPG can afford to pay a slightly higher price. The government does not want to affect the weakest sections who still use kerosene. So, only I is implicit, while II is not."
  },
  {
    id: 157,
    question: "157. Statement: It is not true that the mightiest superpower always wins wars and gets accolades from other countries. Assumptions: Winners are sometimes admired and appreciated. Winners are occasionally criticized.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement mentions that superpowers do win wars but their victory is not always applauded, but sometimes criticized as well in case the victory is an act of oppression of the weaker nation, and is not backed by a reasonable cause. So, both I and II are implicit."
  },
  {
    id: 158,
    question: "158. Statement: To investigate the murder of the lone resident of a flat, the police interrogated the domestic servant, the watchman of the multi-storeyed buildings and the liftman. Assumptions: The domestic servant, watchman and the liftman can give a clue about the suspected murder. Generally in such cases the persons known to the resident are directly or indirectly involved in the murder.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, in such cases, the police interrogates the domestic servant, watchman and liftman to work out the sequence of events just before the murder by tracing the persons who had come to meet the victim. So, I is implicit However, it is erroneous to assume that persons known to the victim are generally involved in the murder. So, II is not implicit."
  },
  {
    id: 159,
    question: "159. Statement: The integrated steel plants in India would no longer have to depend on imports for continuous casting refractories. Assumptions: Continuous casting refractories are needed by India. Continuous casting refractories are in demand.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement mentions the self-sufficiency of India in continuous casting refractories. This means that they are needed in the country. So, I is implicit. Since continuous casting refractories are needed in integrated steel plants, it means they are in demand. So, II is implicit."
  },
  {
    id: 160,
    question: "160. Statement: The office building needs repairing just as urgently as it needs internal as well as external painting. Assumptions: Efficiency of people working in the office cannot be improved unless office building is repaired. Repairing and painting of office building require funds.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: Clearly, nothing can be deduced regarding the effect of repairs of office building on efficiency of workers, or the requirement of funds for repairs, from the given statement. So, neither I nor II is implicit."
  },
  {
    id: 161,
    question: "161. Statement: The private bus service in the city has virtually collapsed because of the ongoing strike of its employees. Assumptions: Going on strikes has become the right of every employee. People no more require the services of private bus operators.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: Since both the assumptions do not follow from the given statement, so neither I nor II is implicit."
  },
  {
    id: 162,
    question: "162. Statement: Neither fascism nor communism has any chance of succeeding in America. Assumptions: American people are strongly in favour of preserving the rights of the individual. Americans have so far not suffered any pangs of poverty or deprivation.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, fascism and communism are against the preservation of individual rights. So, I is implicit. Nothing is mentioned about the economic condition of America. So, II is not implicit."
  },
  {
    id: 163,
    question: "163. Statement: Amongst newspapers, I always read the National Times. Assumptions: The National Times gives very comprehensive news. Some people prefer other newspapers.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement does not mention any quality of the National Times. So, I is not implicit. According to the statement, amongst all newspapers, the narrator reads the National Times. This means that some people read other newspapers. So, II is implicit."
  },
  {
    id: 164,
    question: "164. Statement: \"Get rid of your past for future, get our new generation fridge at a discount in exchange of old\"- An advertisement. Assumptions: The sales of the new fridge may increase in the coming months. People prefer to exchange future with past.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, the scheme would encourage those owning an old fridge to go for a new one at a reasonable price without the hassles of disposing off the old one. So, I is implicit. Besides, an advertisement highlights that which appeals to masses and which customers crave for. So, II is also implicit."
  },
  {
    id: 165,
    question: "165. Statement: The higher echelons of any organization are expected to be models of observational learning and should not be considered as merely sources of reward and punishments. Assumptions: Employees are likely to be sensitive enough to learn by observing the behaviour of their bosses. Normally bosses are considered as sources of reward and punishment.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement advises people not to consider their bosses as mere 'supervisors' to control and assess their acts, but as 'models' to imitate in their working. So, both I and II are implicit."
  },
  {
    id: 166,
    question: "166. Statement: The new education policy envisages major modifications in the education system. Assumptions: Present education system is inconsistent with national needs. Present education system needs change.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, modifications are made in present system finding that it was inconsistent with the needs and required to be changed. So, both I and II are implicit."
  },
  {
    id: 167,
    question: "167. Statement: \"Fly X airways whenever you decide to go places. Our fares are less than train fares.\"- An advertisement. Assumptions: People prefer to travel by air when the fares are reasonable. The fares of other airlines are costlier than those of X airways.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The advertisement highlights the fact that fares of X airways are less than train fares. This implies that people would prefer to travel by air rather than by train if they do not have to pay extra for it. So I is implicit. Besides, this feature also reveals that fares of X airways are lower than those of other airlines. So, II is also implicit."
  },
  {
    id: 168,
    question: "168. Statement: \"The programme will start at 6 p.m. but you can come there up to 7 p.m. or so and still there is no problem.\" Assumptions: The programme will continue even after 7 p.m. The programme may not even start by that time.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement mentions that there is no problem if one comes upto 7 p.m. also. This means that the programme will continue even after 7 p.m. So, I is implicit. Also, it is clearly mentioned that the programme will start at 6 p.m. So, II is not implicit."
  },
  {
    id: 169,
    question: "169. Statement: An advertisement: If you want to follow the footprints of an ideal leader, wear 'X' brand of shoes. Assumptions: Most people like to become ideal leaders. One can't become ideal leader unless one wears X brand of shoes.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, the advertisement mentioned here is merely a catchy slogan, and attempt has been made to touch the deep desire of the masses to draw their attention towards the product. So, only I is implicit."
  },
  {
    id: 170,
    question: "170. Statement: The improvement in the quality of T.V. programmes will lead to increase in the sales of T.V. Assumptions: T.V. is a good entertainment medium. The quality of T.V, programmes has improved recently.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The improvement in quality of programmes will increase the sale shows that it is in great use. So, I is implicit. Nothing is mentioned of recent changes. So, II is not implicit."
  },
  {
    id: 171,
    question: "171. Statement: With a sense of sincerity, quality teachers can improve the society. Assumptions: Quality teachers are sincere. Sincerity in teaching pays.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: The statement emphasises that quality teachers can help reform society if they are sincere enough in teaching. This implies that quality teachers may or may not be sincere. So, I is not implicit. However, II directly follows from the statement and so it is implicit."
  },
  {
    id: 172,
    question: "172. Statement: The head of the organization congratulated the entire staff in his speech for their sincere effort to bring down the deficit and urged them to give their best for attaining a more profitable position in future. Assumptions: The employees may get motivated and maintain and if possible enhance their present level of work. The employees may now relax and slow down in their day to day work as there is no immediate threat of huge deficit.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The appreciation received from the head of the organization would surely motivate the employees to keep up their spirits and strive hard for the progress of the organization. So, only I is implicit."
  },
  {
    id: 173,
    question: "173. Statement: Money is the root cause of all the problems in a family. Assumptions: Every problem is caused by something. There are always some problems in a family.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: The statement mentions the cause of family problems and does not deal with all the problems. So, I is not implicit. Also, it is mentioned that money is the cause of family problems. But this does not mean that problems always exist in a family. So, II is also not implicit."
  },
  {
    id: 174,
    question: "174. Statement: An advertisement: \"Our shoes are for the rich.\" Assumptions: Many people like to be labelled as rich. One can't become rich unless one has that brand of shoes.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement stresses on the point that this particular brand of shoes is worn by affluent and upper-class people as they are good-quality shoes. And an advertisement highlights the feature which most people desire. So, I is implicit. But it doesn't mean that one has to have those shoes to be called 'rich'. So, II is not implicit."
  },
  {
    id: 175,
    question: "175. Statement: In view of the violent situation due to students' agitation the state government has decided to close down all the educational institutions in the state for two weeks with immediate effect. Assumptions: The students' agitation may subside after two weeks. The students may not find a place to come further and continue agitation after the closure of the educational institutions.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, in such situations, closure is followed so as to prevent any untoward incident and with the hope that the stipulated time of closure is sufficient to settle the agitation by mutual talks or by adopting pressure tactics, as the agitators have no grounds to vent their anger due to closure of institutions. So, both I and II are implicit."
  },
  {
    id: 176,
    question: "176. Statement: The taste of food contributes to the intake of nourishment which is essential for the survival of human beings. Assumptions: Human beings take food for the enjoyment of its taste. Human beings experience the taste of food.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: It is mentioned that nourishment is essential for survival. So, this is the basic cause of intake of food. Hence, I is not implicit. Since taste of food affects the intake of nourishment, it means that human beings are affected by taste. So, II is implicit."
  },
  {
    id: 177,
    question: "177. Statement: The economic prosperity of any nation is dependent on the quality of its human resources. Assumptions: It is possible to measure the quality of human resources of a nation. Achieving economic prosperity is a cherished goal of every nation.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: I follows from the statement and so is implicit. But the status of economic prosperity as a nation's goal is not discussed in the statement. So, II is not implicit."
  },
  {
    id: 178,
    question: "178. Statement: \"Two months ago, it was announced that Central Government pensioners would get dearness relief with immediate effect but till date, banks have not credited the arrears.\" - A statement from a Pensioners' Forum. Assumptions: Most of the banks normally take care of the pensioners. Two months time is sufficient for the government machinery to move and give effect to pensioners.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: I is vague and so it is not implicit. The statement expresses grave concern over the pensioners not having received clearness relief even two months after the implementation of the policy. This implies that two months' time is sufficient and it's already too late. So, II is implicit."
  },
  {
    id: 179,
    question: "179. Statement: \"If it does not rain throughout this month, most farmers would be in trouble this year.\" Assumptions: Timely rain is essential for farming. Most farmers are generally dependent on rains.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: It is mentioned that farmers will be in trouble without rain. This means that timely rain is essential. Also, it shows that farmers are dependent on rain. So, both I and II are implicit."
  },
  {
    id: 180,
    question: "180. Statement: Equality of income throughout a community is the essential condition for maximising the total utility which the total income available could confer on the members of that community. Assumptions: If extra income were taken from the rich and given to the poor, the total utility experienced by the community would increase. Equal pay for equal work.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The total utility can be maximised by equality of income throughout the community, i.e., by giving extra income from the rich to the poor. So, I is implicit. Also, II pertains to economic right and is not concerned with equality of income throughout the community. So, it is not implicit."
  },
  {
    id: 181,
    question: "181. Statement: \"Present day education is in shambles and the country is going to the dogs.\" Assumptions: A good education system is essential for the well-being of a nation. A good education alone is sufficient for the well-being of a nation.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: Clearly, the statement mentions the degradation of the country with the disruption of the education system. So, I is implicit, However, it does not mean that education alone is sufficient and no other factor is responsible for the well being of the nation. So, II is not implicit."
  },
  {
    id: 182,
    question: "182. Statement: If the city bus which runs between Ram Nagar and Sant Colony is extended to Vasant Vihar, it will be convenient. - Appeal of residents of Ram Nagar to the city bus company. Assumptions: The convenience of the city bus company is much more important than the needs of the consumers. The city bus company is indifferent to the aspirations of the residents of Sant Colony.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: Clearly, the city bus company is meant to provide bus services according to the needs of the local residents and not as per their own convenience. So, I is not implicit. Again, the statement talks of an appeal of a resident of Ram/Nagar. So, nothing can be said about the company's response to appeals of the Residents of Sant Colony. So, II is also not implicit."
  },
  {
    id: 183,
    question: "183. Statement: If Rajan has finished reading the instructions, then let him begin the activities accordingly. Assumptions: Rajan would understand the instructions. Rajan is capable of performing the activities.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: According to the statement, Rajan can begin the activities according to the instructions. So, both I and II are implicit."
  },
  {
    id: 184,
    question: "184. Statement: The civic authority appealed to the people for reduction in usage of water as there may be an acute shortage during the coming weeks. Assumptions: There will be no rain in recent future. The people are ready to follow the advice of the civic authority.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Clearly, I is not directly related to the issue in the given statement and so it is not implicit. The civic authority makes an appeal to the people with the hope that it would surely be attended to by the people. So, II is implicit."
  },
  {
    id: 185,
    question: "185. Statement: \"Everyone desires to buy a personal computer\", statement of a college student. Assumptions: Personal computers are not a need but a luxury. Use of personal computers improves quality of skill.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: Nothing about the need or utility of personal computers can be deduced from the given statement. So, neither I nor II is implicit."
  },
  {
    id: 186,
    question: "186. Statement: \"It has become a necessity to computerize all the functions of our Institute to maintain the present position.\" - A statement of the Director of XYZ Institute. Assumptions: Unless computerized, the Institute will fall behind the race. The functions of the Institute are too complex to be handled manually.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The Director asserts that computerization is essential to maintain the present state of affairs in future. This means that the Institute will lag behind in the absence of computerisation. This in turn implies that the functions of the Institute are too cumbersome and time-consuming and can be handled in time only through computers. So, both I and II are implicit."
  },
  {
    id: 187,
    question: "187. Statement: The product X that you have asked for is not with us but can be made available against firm order from you. Assumptions: The product X is not in great demand. The product X is out of stock as new model is coming up.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 0,
    answerText: "a) Only assumption I is implicit",
    solution: "Explanation: The statement mentions that the seller does not keep product X in ready stock and intends to provide the same only against a confirmed order from the customer. So, I is implicit However, II appears to be vague in this context."
  },
  {
    id: 188,
    question: "188. Statement: \"X air-conditioner - the largest selling name with the largest range.\" - An advertisement. Assumptions: X air-conditioner is the only one with wide variations. There is a demand of air-conditioners in the market.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Clearly, the advertisement does not mention the word 'only' i.e. other air-conditioners may also have wide variations. So, I is not implicit. Also, the advertisement is given so that the people know about that which they demand. So, II is implicit."
  },
  {
    id: 189,
    question: "189. Statement: Ministry has announced an economic package to support the voluntary organisations. - An official notice, Assumptions: Voluntary organisations do not need such support. Government was not supporting the voluntary organisations earlier.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Since the Ministry has decided to support the voluntary organisations, it is quite probable that they are in need of it. So, I is not implicit. Further, since the economic package for the voluntary organisations has been announced recently, it can be assumed that no such support was given to them earlier. So, II is implicit."
  },
  {
    id: 190,
    question: "190. Statement: \"Though the candidates have been instructed to bring pencils, yet provide some pencils with each invigilator.\" - An instruction to test administration staff. Assumptions: Pencils are in short supply. All the candidates will bring the pencil.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is implicit",
    solution: "Explanation: Nothing about the availability of pencils is mentioned in the statement. So, I is not implicit. Also, in the statement, the staff has been instructed to provide pencils with each invigilator. This means that despite being instructed, all the candidates might not bring the pencil. So, II is also not implicit."
  },
  {
    id: 191,
    question: "191. Statement: \"If you want timely completion of work, provide independent cabins,\" - An employee tells the Director of a Company. Assumptions: There are not enough cabins. Others' presence hinders timely completion of work.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement clearly hints at the need for cabins. So, I is implicit. Since independent cabins are expected to improve efficiency, it means that others' presence hinders work. So, II is also implicit."
  },
  {
    id: 192,
    question: "192. Statement: No regular funds have been provided for welfare activities in this year's budget of the factory. Assumptions: The factory does not desire to carry out welfare this year. Budgetary provision is necessary for carrying put welfare activities.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The non-provision of funds for welfare activities in the budget clearly indicates the factory's intention to not carry out such activities in the current year. So, I is implicit. Also, welfare activities cannot be carried out in organisations without the allocation of funds for the same in the budget. So, II is also implicit."
  },
  {
    id: 193,
    question: "193. Statement: The host in one of the popular T.V. programmes announced that the channel will contact the viewers between 9.00 a.m. to 6.00 p.m. on weekdays and the lucky ones will be given fabulous prizes. Assumptions: The people may remain indoors to receive the phone call. More people may start watching the programme.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, the organisers of the programme have adopted the viewer interaction scheme and announced prizes for some lucky viewers so that more people are enticed into staying at home and viewing the programme. So, both I and II are implicit."
  },
  {
    id: 194,
    question: "194. Statement: The electric supply corporation has decided to open a few more collection centres in the business district area. Assumptions: The people in the area may welcome the decision. Henceforth there may be less time required by the customers for paying electricity bill.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: Clearly, more collection centres would enable the common people to pay their bills easily, conveniently and quickly and this would cause them to welcome the idea. So, both I and II are implicit."
  },
  {
    id: 195,
    question: "195. Statement: \"A visit of school children to forest to widen their knowledge of natural resources has been arranged.\" - A notice in the school. Assumptions: Forests are full of natural resources. Children are likely to learn from their interaction with the new environment.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The forests shall be visited to increase the knowledge of natural resources. This means that forests abound in natural resources. So, I is implicit. The children are being taken to forests to help them learn more practically. So, II is also implicit."
  },
  {
    id: 196,
    question: "196. Statement: There is no reason to rule out the possibility of life on Mars. Therefore the exploration of that planet has to be undertaken. Assumptions: There is life on Mars. The search for life is the sufficient reason for space exploration.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: According to the statement, the possibility of life on Mars cannot be ruled out. So, I is implicit. Also, the statement mentions that the planet should be explored to probe for any life present. So, II is also implicit."
  },
  {
    id: 197,
    question: "197. Statement: Use PVC pipes which have 10 years longer life to any other. Assumptions: People prefer only those pipes which are durable. Other pipes are not durable.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 1,
    answerText: "b) Only assumption II is implicit",
    solution: "Explanation: Clearly, nothing is mentioned about the choice of the people. It is simply an advice. So, I is not implicit. Clearly, the other pipes are not as durable as the PVC pipes. So, II is implicit."
  },
  {
    id: 198,
    question: "198. Statement: The Union Government has decided to withdraw existing tax relief on various small savings schemes in a phased manner to augment its tax collection. Assumptions: People may still continue to keep money in small savings schemes and also pay taxes. The total tax collection may increase substantially.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The statement mentions that withdrawing tax relief on small savings schemes would help increase tax collection. This implies that the government would then earn tax on income derived from small savings schemes. So, I is implicit. Besides, II follows directly from the statement and so it is also implicit."
  },
  {
    id: 199,
    question: "199. Statement: Read this notice before entering the club. Assumptions: People are literate. No blind person comes to the club.",
    options: ["a) Only assumption I is implicit", "b) Only assumption II is implicit", "c) Either I or II is implicit", "d) Neither I nor II is implicit", "e) Both I and II are implicit"],
    correctIndex: 4,
    answerText: "e) Both I and II are implicit",
    solution: "Explanation: The notice is meant for the people to read. So, it is assumed that the people are literate and I is implicit. Since the notice is to be read by everyone entering the club, so it is assumed that no blind person comes to the club. Thus, II is implicit."
  },
  {
    id: 200,
    question: "200. Statement: \"Wanted a two bedroom flat in the court area for immediate possession.\" - An advertisement. Assumptions: Flats are available in court area. Some people will respond to the advertisement. It is a practice to give such an advertisement.",
    options: ["a) All are implicit", "b) Only II is implicit", "c) None is implicit", "d) Only I and II are implicit", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II is implicit",
    solution: "Explanation: The advertisement depicts only the requirement, not the availability of flats in court area. So, I is not implicit. Such advertisements are given with the expectation of a response which can make such a flat available. So, II is implicit. Assumption III does not follow from the statement and so is not implicit."
  },
  {
    id: 201,
    question: "201. Statement: This book is so prepared that even a layman can study science in the absence of a teacher. Assumptions: A layman wishes to study science without a teacher. A teacher may not always be available to teach science. A layman generally finds it difficult to learn science on its own.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II and III are implicit",
    solution: "Explanation: Clearly, the statement is made to impress the usefulness of the book. It does not mention the desire of a layman. So, I is not implicit. Also, the book is intended to guide one when a teacher is not available. So, both II and III are implicit."
  },
  {
    id: 202,
    question: "202. Statement: \"We do not want you to see our product on newspaper, visit our shop to get a full view.\" - An advertisement. Assumptions: People generally decide to purchase any product after seeing the name in the advertisement. Uncommon appeal may attract the customers. People may come to see the product.",
    options: ["a) None is implicit", "b) Only I and II are implicit", "c) Only II and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only II and III are implicit",
    solution: "Explanation: It can be inferred from the statement that people also like to see a product before buying. So, I is not implicit. Also, the statement is just an attempt to arouse the people to come and see the shop. So, both II and III are implicit."
  },
  {
    id: 203,
    question: "203. Statement: There is big boom in drug business and a number of jhuggi-jhopari dwellers in Delhi can be seen pedalling with small pouches of smack and brown sugar. Assumptions: Drug addiction is increasing in the country, specially in the capital. All the big dons involved in the smuggling of drugs live in jhuggi-jhopari areas. Most of the jhuggi-jhopari dwellers would do anything for money.",
    options: ["a) Only I is implicit", "b) Only II is implicit", "c) Only III is implicit", "d) Only I and III are implicit", "e) Either I or III is implicit"],
    correctIndex: 3,
    answerText: "d) Only I and III are implicit",
    solution: "Explanation: The statement talks of boom in drug business and cites examples from the capital city. This makes I implicit. Further, it is given that most jhuggi-jhopari dwellers are seen to indulge in transactions of drug pouches. This implies that they give in to their lust for money quite easily and do not hesitate to get involved in illegal activities for the same. So, III is implicit while II is not."
  },
  {
    id: 204,
    question: "204. Statement: \"X-chocolate is ideal as a gift for someone you love.\" - An advertisement. Assumptions: People generally give gifts to loved ones. Such advertisements generally influence people. Chocolate can be considered as a gift item.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All are implicit",
    solution: "Explanation: Clearly, all the three directly follow from the given statement."
  },
  {
    id: 205,
    question: "205. Statement: \"Fly with us and experience the pleasure of flying.\"- An advertisement by an airlines. Assumptions: More passengers may be attracted to travel by the airline after reading the advertisement. People generally may prefer an enjoyable flight. Other airlines may not be offering the same facilities.",
    options: ["a) None is implicit", "b) Only I is implicit", "c) Only II is implicit", "d) Only II and III are implicit", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Clearly, the advertisement is meant to lure the passengers into travelling by the airline. So, I is implicit. Also, the advertisement promises an enjoyable flight. So, II is also implicit. The facilities offered by other airlines cannot be ascertained from the statement. So, III is not implicit."
  },
  {
    id: 206,
    question: "206. Statement: Bombay people were spellbound, mesmerized and got mad when they saw the famous pop-singer Michael Jackson's hi-tech pulsating megawatt performance. Assumptions: When a show is accompanied with latest technology, it has a magical effect. Bombay people were never impressed with performances by Indian musicians. Michael Jackson is a super singer.",
    options: ["a) Only I is implicit", "b) Only II is implicit", "c) Only I and III are implicit", "d) Either II or III is implicit", "e) Only II and III are implicit"],
    correctIndex: 2,
    answerText: "c) Only I and III are implicit",
    solution: "Explanation: The use of the words 'hi-tech pulsating mega-watt performance' in the statement makes I implicit. Nothing is mentioned about the performances of Indian musicians. So, II is not implicit. The facts that Michael Jackson is a pop-singer and his performance left people spellbound make III implicit."
  },
  {
    id: 207,
    question: "207. Statement: The residents of the locality wrote a letter to the Corporation requesting to restore normalcy in the supply of drinking water immediately as the supply at present is just not adequate. Assumptions: The Corporation may not take any action on the letter. The municipality has enough water to meet the demand. The water supply to the area was adequate in the past.",
    options: ["a) Only I and III are implicit", "b) Only II is implicit", "c) Only II and III are implicit", "d) Only III is implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only III is implicit",
    solution: "Explanation: The Corporation's response to the letter cannot be deduced from the statement. So, I is not implicit. The municipality's position in regard to water supply is also not mentioned. So, II is also not implicit. Since the residents talk of 'restoring' normalcy, it means that water supply was adequate in the past. So, III is implicit."
  },
  {
    id: 208,
    question: "208. Statement: \"We have the distinction of being the only company in India as well as the second in the world to have won an ISO 9002 certification in our line of business.\" - Statement of Company X's Chairman. Assumptions: There were not many companies in the line of business of Company X. Getting ISO 9002 in the line of business of Company X is not easy. The Company X desires to expand its business.",
    options: ["a) Only I is implicit", "b) Only II is implicit", "c) Only III is implicit", "d) Only II and III are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only II and III are implicit",
    solution: "Explanation: The statement mentions that there are only two companies in this line of business which are ISO 9002 certified. But nothing about the total number of companies in this line can be deduced. So, I is not implicit. Also, had it been easy to get ISO 9002 certification, there would have been a large number of ISO 9002 companies. So, II is implicit. Also, the company must have reached up to such high international standards to make its mark in its line of business. So, III is also implicit."
  },
  {
    id: 209,
    question: "209. Statement: \"I want to present a book on techniques of yoga to Ajay on his birthday.\"- A tells B. Assumptions: A will be invited by Ajay on his birthday. The person, to whom the book is to be presented, is not keeping good health. Book is an acceptable gift for birthday.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) None is implicit", "e) All are implicit"],
    correctIndex: 2,
    answerText: "c) Only I and III are implicit",
    solution: "Explanation: Since A has decided to gift a book to Ajay on his birthday, it is quite evident that he will be invited by Ajay and that a book is an acceptable gift. So, both I and III are implicit. Nothing about the state of health of the person can be deduced from the statement. So, II is not implicit."
  },
  {
    id: 210,
    question: "210. Statement: Let us increase the taxes to cover the deficit. Assumptions: The present taxes are very low. Deficit in a budget is not desirable. If the taxes are not increased, the deficit cannot be met.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II and III are implicit",
    solution: "Explanation: Clearly, the statement shows that the present taxes are not sufficient to meet the deficit but they may still be high. So, I is not implicit. Since the statement talks of covering the deficit, so II is implicit. Also, the taxes are increased to meet the deficit. So, III is also implicit."
  },
  {
    id: 211,
    question: "211. Statement: \"We must introduce objective type tests to improve our examinations for admission to MBA.\" - The Chairman of the Admission Committee tells the Committee. Assumptions: The admission at present is directly through the interview. The Admission Committee is desirous of improving the admission examinations. The Chairman himself is an MBA.",
    options: ["a) Only I and III are implicit", "b) Only II is implicit", "c) Only I and II are implicit", "d) Only I is implicit", "e) None is implicit"],
    correctIndex: 1,
    answerText: "b) Only II is implicit",
    solution: "Explanation: Nothing about the present method of admission or the qualification of the Chairman is mentioned in the statement. So, neither I nor III is implicit. Assumption II directly follows from the statement. So, II is implicit."
  },
  {
    id: 212,
    question: "212. Statement: Use 'X' brand shoes. These are durable and available in all sizes. - An advertisement in the newspaper A. Assumptions: Normally people like durable shoes. Very few people read advertisement in a newspaper. Very few people read the newspaper A.",
    options: ["a) None is implicit", "b) Only I and II are implicit", "c) Only I, and either II or III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Any advertisement highlights only the desirable qualities of the product. So, I is implicit. The 'X' brand has advertised its product in newspaper A. This implies that a large section of people reads advertisements in newspapers and that newspaper A too has a wide circulation. So, neither II nor III is implicit."
  },
  {
    id: 213,
    question: "213. Statement: The State Government has unilaterally increased by five percent octroi on all commodities entering into the state without seeking approval of the Central Government. Assumptions: The State Government may be able to implement its decision. The Central Government may agree to support the State Government's decision. The State Government may be able to earn considerable amount through the additional octroi.",
    options: ["a) None is implicit", "b) Only I and II are implicit", "c) All are implicit", "d) Only II and III are implicit", "e) None of these"],
    correctIndex: 2,
    answerText: "c) All are implicit",
    solution: "Explanation: Since the State Government has increased the octroi, so I is implicit. Since the decision has been taken without the approval of the Central Government, it implies that Central Government would not confront the new policy. So, II is implicit. Since octroi is collected by the state on all commodities entering the state, so III is also implicit."
  },
  {
    id: 214,
    question: "214. Statement: In the recently held All India Commerce Conference the session on 'Management of Service Sector in India' surprisingly attracted large number of participants and also received a very good media coverage in the leading newspapers. Assumptions: People were not expecting such an encouraging response for service sector. Service sector is not managed properly in India. Media is always very positive towards service sector.",
    options: ["a) None is implicit", "b) Only I is implicit", "c) All are implicit", "d) Only II and III are implicit", "e) Only either I or III is implicit"],
    correctIndex: 1,
    answerText: "b) Only I is implicit",
    solution: "Explanation: Since the response was 'surprising', so I is implicit. Nothing about the real management of service sector can be deduced from the statement. So, II is not implicit. Also, the statement talks of the media's response to only a particular session on service sector and not all in general. So, III is also not implicit."
  },
  {
    id: 215,
    question: "215. Statement: \"If you are intelligent, we are the right people for improving your performance.\" - An advertisement of a coaching institute. Assumptions: Brilliant students prefer to join coaching classes. Coaching classes help the students to improve their performance. No other institute provides such coaching.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I and II are implicit",
    solution: "Explanation: Since the advertisement invites 'Intelligent' students by promising them an improved performance through their exceptional coaching, so both I and II are implicit. However, nothing can be assumed about other institutes as the given advertisement talks of only a particular institute. So, III is not implicit."
  },
  {
    id: 216,
    question: "216. Statement: The Reserve Bank of India has directed the banks to refuse fresh loans to major defaulters. Assumptions: The banks may still give loans to the defaulters. The defaulters may repay the earlier loan to get fresh loan. The banks may recover the bad loans through such harsh measures.",
    options: ["a) None is implicit", "b) Only I and II are implicit", "c) All are implicit", "d) Only II and III are implicit", "e) None of these"],
    correctIndex: 2,
    answerText: "c) All are implicit",
    solution: "Explanation: Clearly, loans to only major defaulters is being refused. So, the banks may still give loans to some defaulters. Thus, I is implicit. Also, the RBI's decision is a measure to recover the previous loans, since one would have to clear the old debts so as to get a fresh loan. So, both II and III are also implicit."
  },
  {
    id: 217,
    question: "217. Statement: We must be prepared to face any eventuality and all the assignments must be completed as per their schedule - Director tells the Faculty members. Assumptions: There is possibility of any serious eventuality. Dates are fixed for all the assignments. Faculty members are supposed to complete all the assignments.",
    options: ["a) None is implicit", "b) Only I is implicit", "c) Duly II and III are implicit", "d) Only III is implicit", "e) All are implicit"],
    correctIndex: 4,
    answerText: "e) All are implicit",
    solution: "Explanation: Since the Director talks of being prepared to face any eventuality, so I is implicit. It is mentioned that a schedule for completing the assignments has been drawn up. So, II is implicit. The fact that the statement is directed to all the faculty members makes III implicit."
  },
  {
    id: 218,
    question: "218. Statement: An advertisement of Bank X - \"Want to open a bank account! Just dial our 'home service' and we will come at your doorsteps.\" Assumptions: No other bank makes available service at the doorstep of the customer. People may choose Bank X for their financial transactions. Nowadays banking has become very competitive.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All are implicit",
    solution: "Explanation: The advertisement seeks to attract people to open their account in Bank X by promising them service at their doorstep. Since home service' has been used as a tool for earning clientage, so I is implicit. Also, the advertisement seeks to impress upon the people's minds how simple it has become to open an account. This may attract more account holders to Bank X. So, II is implicit. Further, providing banking services at home means that banking has become so competitive that door-to-door service is being provided by the Bank to attract people. Hence, III is also implicit."
  },
  {
    id: 219,
    question: "219. Statement: \"Do not lean out of the moving train.\" - A warning in the railway compartment. Assumptions: Such warnings will have some effect. Leaning out of a moving train is dangerous. It is the duty of railway authorities to take care of passengers' safety.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only II is implicit", "d) Only I and III are implicit", "e) All are implicit"],
    correctIndex: 4,
    answerText: "e) All are implicit",
    solution: "Explanation: The warning against leaning out of moving train is made to heed against the dangers involved. So, both I and II are implicit. Since the warning has been put up in the railway compartment, so III is also implicit."
  },
  {
    id: 220,
    question: "220. Statement: Tender specification will not be issued to the firms where there is 25% or more default in supplies against earlier purchase orders placed on them' - Condition of a Company X inviting tenders for the purchase of material. Assumptions: The Company X will be watching the quality of performance of its suppliers. This time the firms should keep the percentage of default as less as possible. The Company X expects quality and professional approach from its suppliers.",
    options: ["a) Only I is implicit", "b) Only II is implicit", "c) Either II or III is implicit", "d) Only III is implicit", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Since Company X intends to invite tenders only from those companies which have not been defaulters earlier, so both I and III are implicit. Besides, to have long term business relations with Company X, every firm needs to perform well in its supplies. So, II is also implicit."
  },
  {
    id: 221,
    question: "221. Statement: Items in big showrooms in main markets are costlier than similar items in small shops. Assumptions: Items in small shops are never reliable. Persons managing big showrooms are cheats. Maintenance of big showrooms is an expensive affair in itself; hence the prices are a little higher.",
    options: ["a) None is implicit", "b) Only I is implicit", "c) Only II is implicit", "d) Only III is implicit", "e) Either II or III is implicit"],
    correctIndex: 3,
    answerText: "d) Only III is implicit",
    solution: "Explanation: Clearly, only III defines the correct essence of the statement and hence is implicit."
  },
  {
    id: 222,
    question: "222. Statement: India's economic growth has come at a terrible price of increased industrial and vehicular pollution. Assumptions: Pollution is a part of industrial society. Indian economic growth is based on only industrial growth. A country desires economic growth with manageable side effects.",
    options: ["a) Only I is implicit", "b) Only II is implicit", "c) Only III is implicit", "d) Only I and III are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only I and III are implicit",
    solution: "Explanation: The statement mentions that India had to pay the price of increased pollution level to earn its economic growth. So, both I and III are implicit. However, this does not imply that only industrial growth has brought about India's economic growth. So, II is not implicit."
  },
  {
    id: 223,
    question: "223. Statement: The Government of India has set up one-stop facilitation counters manned by trained staff for attending to various needs of the foreign tourists at all the international airports. Assumptions: There is adequate trained staff available to man these counters in shifts. The services provided by these counters will help boosting inflow of foreign tourists. Majority of the foreign tourists need variety of services when they reach India.",
    options: ["a) Only I and II are implicit", "b) Only III is implicit", "c) Only II and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All are implicit",
    solution: "Explanation: Since the Government has already set up such counters, it implies that they have adequate staff to handle the same. So, I is implicit. Besides, such counters have been set up to make the foreign tourists feel at home when they visit our country. So, this will surely be an advantage to foreign tourists. This also implies that foreign tourists do need such services. Hence, both II and III are also implicit."
  },
  {
    id: 224,
    question: "224. Statement: \"Work hard to be successful in the examinations.\" - A advises B. Assumptions: Assumptions: B listens to As advice. Passing the examination is desirable. Hard practice leads to success.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II and III are implicit",
    solution: "Explanation: Whether B listens to A's advice or not, is not given in the statement So, I is not implicit. The advice is given on the behaviour that should be followed to pass the examination. This shows the necessity to pass the examination. So, II is implicit Passing the examination is a form of success to be attained by hard practice. So, III is also implicit."
  },
  {
    id: 225,
    question: "225. Statement: \"Join X-tuition classes for sure success. Excellent teaching by excellent teachers is our strength.\" - An advertisement. Assumptions: Sure success is desirable. Students expect sure success when they join any tuition class. Just having excellent teachers does not ensure success.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) Only II is implicit", "e) All are implicit"],
    correctIndex: 0,
    answerText: "a) Only I and II are implicit",
    solution: "Explanation: The advertisement seeks to attract the students by promising them sure success. So, both I and II are implicit. Assumption III does not follow from the statement and so is not implicit."
  },
  {
    id: 226,
    question: "226. Statement: Wars must be discouraged vehemently even though majority of the victims might have been a nuisance to peace loving people. Assumptions: Wars kill majority of wicked people. Innocent people are also killed in wars. Vehement opposition to wars may have some desirable impact.",
    options: ["a) Only I and II are implicit", "b) Only III is implicit", "c) Only III, and either I or II are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All are implicit",
    solution: "Explanation: The statement mentions that'.....majority of the victims might have been a nuisance to peace loving people. This implies that majority of the victims are wicked people though some victims are innocent people too. So, both I and II are implicit. Further, the statement advocates vehement opposition of wars. So, III is also implicit."
  },
  {
    id: 227,
    question: "227. Statement: \"If you are beautiful, we will catch your beauty. If you are not, we will make you beautiful.\" - An advertisement of a photo studio. Assumptions: How to look beautiful is a problem of youngsters. A photograph can be beautiful even if a person is not. People like to be considered beautiful.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only III is implicit", "d) Only I and III are implicit", "e) All are implicit"],
    correctIndex: 1,
    answerText: "b) Only II and III are implicit",
    solution: "Explanation: Clearly, the advertisement is meant for people of all age groups and so assuming a fact only in relation to youngsters is vague. So, I is not implicit. Also, the studio promises to make those people 'beautiful' who are not. This makes II implicit. Further, the advertisement is meant for persons who desire to be beautiful. So, III is implicit."
  },
  {
    id: 228,
    question: "228. Statement: In view of the recent spurt in sugar prices in the open market, the government has asked the dealers to release a vast quantity of imported sugar in the open market. Assumptions: The dealers will follow the government directive. The sugar prices will come down. The price of indigenous sugar will remain unchanged.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) None is implicit", "e) All are implicit"],
    correctIndex: 0,
    answerText: "a) Only I and II are implicit",
    solution: "Explanation: The government's decision is clearly a measure to increase supply and control rates. So, both I and II are implicit, while III is not."
  },
  {
    id: 229,
    question: "229. Statement: During pre-harvest kharif season, the government has decided to release vast quantity of food grains from FCI. Assumptions: There may be a shortage of food grains in the market during this season. The kharif crop may be able to replenish the stock of FCI. There may be a demand from the farmers to procure kharif crop immediately after harvest.",
    options: ["a) All are implicit", "b) Only II and III are implicit", "c) None is implicit", "d) Only I and II are implicit", "e) None of these"],
    correctIndex: 0,
    answerText: "a) All are implicit",
    solution: "Explanation: Assumptions I and II provide the most probable reasons for the step taken by the government. So, both I and II are implicit. Since the foodgrains have been released during pre-harvest kharif season, it is evident that the next kharif crop would replenish the stock. So, III is also implicit."
  },
  {
    id: 230,
    question: "230. Statement: The simplest and the most cost-effective way to upgrade your home Exchange your old furniture and get 25% to 33% off on the new furniture.' - An advertisement of a furniture company. Assumptions: Nowadays, there is no demand for furniture products unless some attractive scheme is offered. Some customers always desire to have best quality and do not bother either for cost or for convenience. Some customers want to keep their home up-to-date with reasonable cost and with less hassles.",
    options: ["a) Only I is implicit", "b) Only II is implicit", "c) Only III is implicit", "d) Only I and II are implicit", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only III is implicit",
    solution: "Explanation: The advertisement has put forward an exchange offer does not imply that there is no demand for furniture products without an offer. So, I is not implicit. Since the advertisement highlights both 'simplest' and 'cost-effective', so II is not implicit. Further, the advertisement mentions that people can buy new furniture at discounted price without the hassles of disposing off the old one. Hence, only III is implicit."
  },
  {
    id: 231,
    question: "231. Statement: Everybody loves reading adventure stories. Assumptions: Adventure stories are the only reading material. Nobody loves reading any other material. All are literate.",
    options: ["a) None is implicit", "b) Only I and II are implicit", "c) All are implicit", "d) Only II and III are implicit", "e) None of these"],
    correctIndex: 0,
    answerText: "a) None is implicit",
    solution: "Explanation: The statement mentions that adventure stories are liked by everybody. This does not mean that there is no other reading material or nobody loves reading any other material. So, neither I nor II is implicit. Besides, 'everybody' in the statement stands for 'all literate people' and not for 'all people'. So, III is also not implicit."
  },
  {
    id: 232,
    question: "232. Statement: Delink degrees with jobs. Then, boys will think twice before joining colleges. Assumptions: Boys join college education for getting jobs. A degree is of no use for getting a job. Girls do not try for jobs.",
    options: ["a) Only I is implicit", "b) Only I and II are implicit", "c) Only II and III are implicit", "d) Only I and III are implicit", "e) All are implicit"],
    correctIndex: 0,
    answerText: "a) Only I is implicit",
    solution: "Explanation: The statement mentions that if the degrees have no connection with jobs, boys will consider and reconsider whether they should join college. So, I is implicit. In the present system, degrees are not delinked with jobs. This means that job is not available without degrees. So, II is not implicit. Nothing about the girls is mentioned in the statement. So, III is also not implicit."
  },
  {
    id: 233,
    question: "233. Statement: In spite of the heavy rains the traffic has not been disrupted this year. Assumptions: The traffic is disrupted in rainy seasons only. Rains do not affect traffic movement. Adequate precautions were taken for traffic management during rainy season.",
    options: ["a) Only I is implicit", "b) Only I and II are implicit", "c) Only III is implicit", "d) Only II and III are implicit", "e) None is implicit"],
    correctIndex: 2,
    answerText: "c) Only III is implicit",
    solution: "Explanation: The statement expresses surprise at the traffic situation remaining normal even after rains. This means that rains affect traffic. So, II is not implicit. But this does not mean that only rains affect traffic. So, I is also not implicit. Since the traffic was not affected during rains as expected, so III is implicit."
  },
  {
    id: 234,
    question: "234. Statement: The company has decided to increase the price of all its products to tackle the precarious financial position. Assumptions: The company may be able to wipe out the entire losses incurred earlier by this decision. The buyers may continue to buy its products even after the increase. The company has adequate resources to continue production for few more months.",
    options: ["a) Only I and III are implicit", "b) Only II is implicit", "c) Only II and III are implicit", "d) None is implicit", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I and III are implicit",
    solution: "Explanation: It is mentioned that the company has taken the decision to make up for the financial deficit. So, I is implicit. The response of the buyers to the increased prices cannot be deduced from the statement. So, II is not implicit. Since the company seeks to improve its financial position by increasing the prices of its products, so III is also implicit."
  },
  {
    id: 235,
    question: "235. Statement: In order to reduce the gap between income and expenditure, the company has decided to increase the price of its product from next month. Assumptions: The rate will remain more or less same after the increase. The expenditure will more or less remain the same in near future. The rival companies will also increase the price of the similar product.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only III is implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Clearly, the company intends to reduce the gap between income and expenditure by increasing the price of its product i.e. by keeping the expenditure unaltered and increasing the income only. So, II is implicit while I is not. However, the rival companies may or may not follow the same pursuit. So, III is not implicit."
  },
  {
    id: 236,
    question: "236. Statement: 'Several labour and industrial courts in this State have no proper premises. Vacancies of judges and stenos are kept pending.' - A statement of a retired judge of State X. Assumptions: Adequate number of staff and judges helps in the smooth functioning of the industrial and labour courts. The State is not bothered about the condition of the labour and industrial courts. Physical facilities of an office help in increasing efficiency of its employees.",
    options: ["a) Only I and III are implicit", "b) Only II is implicit", "c) Only II and III are implicit", "d) All I, II and III are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All I, II and III are implicit",
    solution: "Explanation: The statement expresses grave concern over the lack of proper premises and inadequate staff in labour and industrial courts. This implies that adequate staff is a must to serve the purpose of these courts and a proper office only can ensure their smooth functioning. So, both I and III are implicit. The lack of facilities to the courts also indicates the state's negligent attitude to the condition of the courts. So, II is also implicit."
  },
  {
    id: 237,
    question: "237. Statement: \"A rare opportunity to be a professional while you are at home.\" - An advertisement for computer literate housewives by a computer company. Assumptions: Some housewives simultaneously desire to become professional. Computer industry is growing at a fast pace. It is possible to be a professional as well as a housewife.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) Only II is implicit", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only I and III are implicit",
    solution: "Explanation: Clearly, a company would highlight only that feature in its advertisement which people crave for and which it can make possible. So, both I and III are implicit. Nothing can be deduced about the growth of computer industry. So, II is not implicit."
  },
  {
    id: 238,
    question: "238. Statement: Pramod decided to get the railway reservation in May, for the journey he wants to make in July, to Madras. Assumptions: The railways issues reservations two months in advance. There are more than one trains to Madras. There will be vacancy in the desired class.",
    options: ["a) Only I is implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I is implicit",
    solution: "Explanation: Clearly, since Pramod decides to get the reservation in May for the journey in July, so I is implicit. The number of trains to Madras or the position of vacancies in different classes cannot be deduced from the given statement. So, neither II nor III is implicit."
  },
  {
    id: 239,
    question: "239. Statement: \"To make the company commercially viable, there is an urgent need to prune the staff strength and borrow money from the financial institutions.\" - Opinion of a consultant. Assumptions: The financial institutions lend money for such proposals. The product of the company has a potential market. The employees of the company are inefficient.",
    options: ["a) None is implicit", "b) All are implicit", "c) Only I and II are implicit", "d) Only II and III are implicit", "e) Only I and III are implicit"],
    correctIndex: 2,
    answerText: "c) Only I and II are implicit",
    solution: "Explanation: Since the consultant talks of borrowing money from financial institutions, so I is implicit. That the owners wish to make the company 'commercially viable' makes II implicit. Also, it is mentioned that staff strength is to be reduced to make the company 'commercially viable'. So, III is not implicit."
  },
  {
    id: 240,
    question: "240. Statement: The Central Government has directed the State Governments to reduce government expenditure in view of the serious resource crunch and it may not be able to sanction any additional grant to the states for the next six months. Assumptions: The State Governments are totally dependent on Central Government for its expenditures. The Central Government has reviewed the expenditure account of the State Government. The State Governments will abide by the directive.",
    options: ["a) None is implicit", "b) Only II and III are implicit", "c) Only III is implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II and III are implicit",
    solution: "Explanation: Nothing about the sources of income of the State Governments is mentioned in the statement. So, I is not implicit. Since the Central Government has directed the State Governments to reduce expenditure, so II is implicit. Further, since the Central Government has refused any further grant to the State Governments for the next six months, it is quite clear that these Governments will abide by the directive. So, III is also implicit."
  },
  {
    id: 241,
    question: "241. Statement: These apples are too cheap to be good. Assumptions: When the apple crop is abundant, the prices go down. The lower the selling price, the inferior is the quality of the commodity. Very cheap apples are also good.",
    options: ["a) None is implicit", "b) Only I and III are implicit", "c) Only II is implicit", "d) Only II and III are implicit", "e) All are implicit"],
    correctIndex: 2,
    answerText: "c) Only II is implicit",
    solution: "Explanation: It is mentioned that the apples are so cheap that they cannot be good. This means that the prices of good apples are never too low and that very cheap apples are never good. So, neither I nor III is implicit. Assumption II clearly follows from the statement that apples are of inferior quality because they are cheap. So, it is implicit."
  },
  {
    id: 242,
    question: "242. Statement: \"All are cordially invited to attend the entertainment programme. It is free.\" - An announcement in a newspaper. Assumptions: People generally do not go to entertainment programmes which are free. Some people, though interested in entertainment programmes, cannot afford purchasing the tickets. Generally, a free entertainment programme is of a good quality.",
    options: ["a) Only I is implicit", "b) Only I and II are implicit", "c) Only II is implicit", "d) Only II and III are implicit", "e) Only I and III are implicit"],
    correctIndex: 2,
    answerText: "c) Only II is implicit",
    solution: "Explanation: Since the announcement invites the people to the programme saying that it is free, so I is not implicit while II follows. The quality of the programme is not being talked about in the statement. So, III is not implicit."
  },
  {
    id: 243,
    question: "243. Statement: Ravi decided to leave office at 4.00 p.m. to catch a flight to Bangalore departing at 6.00 p.m. Assumptions: The flight to Bangalore may be delayed. He may be able to reach airport well before 6.00 p.m. He may get adequate time to search for a vehicle to go to the airport.",
    options: ["a) None is implicit", "b) Only II is implicit", "c) Only II and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only II and III are implicit",
    solution: "Explanation: I cannot be assumed from the given statement and so it is not implicit. Also, knowing that his flight is scheduled to depart at 6 p.m., Ravi would leave accordingly, keeping enough time to search for a vehicle and to reach the airport well before time. So, both II and III are implicit."
  },
  {
    id: 244,
    question: "244. Statement: \"Put. a notice on the board that all the employees should come on time to office.\" - An officer tells his assistant. Assumptions: All the employees come late. Employees read such notice on the board. Employees will follow the instructions.",
    options: ["a) Only I and II are implicit", "b) Only III is implicit", "c) Only II and III are implicit", "d) Only I and III are implicit", "e) All are implicit"],
    correctIndex: 2,
    answerText: "c) Only II and III are implicit",
    solution: "Explanation: The notice directs all the employees to come on time. This does not mean that all of them come late. So, I is not implicit. Since the officer orders the assistant to put the notice on the board, it is evident that the employees read such notice on the board. So, II is implicit. Also, the employees have to comply with the orders of the officer. So, III is implicit."
  },
  {
    id: 245,
    question: "245. Statement: The professor announced in the class that the next periodical examination will be held on 15th of the next month. Assumptions: All the students may appear in the examination. The college will remain open on 15th of the next month. The students can study till 15th of the next month to pass the examination.",
    options: ["a) Only I and II are implicit", "b) Only II is implicit", "c) Only II and III are implicit", "d) Only III is implicit", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only II and III are implicit",
    solution: "Explanation: The statement mentions only the schedule of the examination. But this doesn't ensure full attendance of students on that day. However, this implies that the college will remain open on the date of examination to hold the same and that the students can study till that date to pass the examination. Hence, only II and III are implicit, while I is not."
  },
  {
    id: 246,
    question: "246. Statement: The situation of this area still continues to be tense and out of control. People are requested to be in their homes only. Assumptions: There had been some serious incidents. People will not go to the office. Normalcy will be restored shortly.",
    options: ["a) Only I is implicit", "b) Only I and II are implicit", "c) None is implicit", "d) Only I and III are implicit", "e) All are implicit"],
    correctIndex: 1,
    answerText: "b) Only I and II are implicit",
    solution: "Explanation: The statement mentions that situation in the area is tense. So, I is implicit. Since people have been requested not to go out and remain in homes for safety, so II is implicit. It cannot be inferred when the normalcy will be restored. So, III is not implicit."
  },
  {
    id: 247,
    question: "247. Statement: \"Television X - the neighbour's envy, the owner's pride\" - A T.V. advertisement. Assumptions: Catchy slogans appeal to people. People are envious of their neighbours superior possessions. People want to be envied by their neighbours.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I and II are implicit",
    solution: "Explanation: Clearly, both I and II directly follow from the statement. Also, it is clear that people wish to buy a thing which they can be proud of. So, III is not implicit."
  },
  {
    id: 248,
    question: "248. Statement: Keeping in view the financial constraints, the management institution has decided to charge at the time of providing employment in various organisations, a placement fee of Rs. 25000 from the organisations in which the student will be provided the employment. Assumptions: It will help in increasing the demand of the students belonging to the management institution. The amount collected in this way will be purposeful. It may be possible that the organisation providing employment may select less number of students in future.",
    options: ["a) None is implicit", "b) Only I is implicit", "c) Only I and II are implicit", "d) Only II and III are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only II and III are implicit",
    solution: "Explanation: Since the management has imposed a fee of Rs. 25000 for the employment of each student by the organisation, so III is implicit while I is not. Since the statement mentions that the fee is being charged to cover up the financial constraint, so II is implicit."
  },
  {
    id: 249,
    question: "249. Statement: \"Z-T.V, the only T.V. which gives the viewers a chance to watch two programmes simultaneously.\" - An advertisement. Assumptions: Sale of Z-T.V will increase because of the advertisement. Some people may be influenced by the advertisement and buy Z-T.V. The sale of Z-T.V. may be on the downward trend.",
    options: ["a) None is implicit", "b) All are implicit", "c) Only I and II are implicit", "d) Only II and III are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only II and III are implicit",
    solution: "Explanation: The effect of the advertisement cannot be deduced. So, I is not implicit. However, the advertisement is given so as to influence people and encourage them to buy Z-T.V. So, II is implicit. Also, it is quite possible that the sale of Z-T.V. is declining, which has provoked the company owners to advertise for their products. So, III is implicit."
  },
  {
    id: 250,
    question: "250. Statement: \"As our business is expanding, we need to appoint more staff.\" Owner of a company informs his staff. Assumptions: The present staff is not competent. More staff will further expand the business. Suitable persons to be taken as staff will be available.",
    options: ["a) None is implicit", "b) Only I is implicit", "c) Only II is implicit", "d) Only III is implicit", "e) All are implicit"],
    correctIndex: 3,
    answerText: "d) Only III is implicit",
    solution: "Explanation: The statement mentions that the present staff is insufficient, not incompetent. So, I is not implicit. Also, the purpose for appointing more staff is to control the expanding business, not to expand it further. So, II is not implicit. Since the company owner talks of appointing more staff, so III is implicit."
  },
  {
    id: 251,
    question: "251. Statement: The address of the Principal to the students, \"Dear students, if you want a healthy mind, listen to music.\" Assumptions: Normally students like to follow good advice. It is desirable to develop a healthy mind. It is the duty of the Principal to advise the students.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) None is implicit", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I and II are implicit",
    solution: "Explanation: The Principal has advised the students regarding their welfare. This implies that students like to follow good advice. So, I is implicit. Since the Principal stresses on having 'a healthy mind', it implies that students desire for the same. So, II is implicit. However, the Principal has given the advice out of deep concern for his students and not because it is his duty. So, III is not implicit."
  },
  {
    id: 252,
    question: "252. Statement: The national air carrier has decided to start a weekly air service from town A to town B. Assumptions: There will be enough passengers to make the operation economically viable. Other carriers may not start such service. The people staying around these towns can afford the cost of air travel.",
    options: ["a) Only I is implicit", "b) Only I and II are implicit", "c) Only II and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: The firm has decided to start the air service. This implies that there are enough passengers and people in towns A and B can afford to travel by air. So, I and III are implicit. Assumption II is vague and so it is not implicit."
  },
  {
    id: 253,
    question: "253. Statement: 'Move into the upper echelons without paying a steep price - Book a luxurious flat with us'. An advertisement of a construction company for its prestigious project. Assumptions: It is possible to join the select band of rich people by hard work. Staying in luxury without paying steep price is the criterion of upper crust of the society. Booking a luxurious flat is very easy now.",
    options: ["a) None is implicit", "b) Only II is implicit", "c) Only III is implicit", "d) Only II and III are implicit", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only III is implicit",
    solution: "Explanation: The statement advocates that a person can upgrade to a high life style by paying a low price to book a luxurious, upper-class flat. S6, III is implicit, However, nothing about the nature of the upper-class or the ways of becoming rich can be assumed from the given statement. So, neither I nor II is implicit."
  },
  {
    id: 254,
    question: "254. Statement: The school authority decided to open a summer school this year in the school compound for the students in the age range of 7 - 14 years. Assumptions: All the students will attend the summer school. All the parents will prefer to remain in the city than going out of town for enabling their children to attend the summer school. Those who cannot afford to go out of station will send their children to summer school.",
    options: ["a) None is implicit", "b) Only II is implicit", "c) Only II and III are implicit", "d) Only III is implicit", "e) All are implicit"],
    correctIndex: 0,
    answerText: "a) None is implicit",
    solution: "Explanation: The statement talks of the policy of opening a summer school. But the response of the children and their parents cannot be deduced from it. So, none is implicit."
  },
  {
    id: 255,
    question: "255. Statement: The university Authority has decided to decentralize conduct of terminal examinations and give this responsibility to each college for its students to avoid delay in declaration of results. Assumptions: The colleges are equipped to carry out this responsibility. There may not be uniformity in evaluation standard across the colleges. The students may welcome this new development.",
    options: ["a) None is implicit", "b) Only I and II are implicit", "c) Only II and III are implicit", "d) Only I and III are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only I and III are implicit",
    solution: "Explanation: The university must have taken this decision keeping in mind the efficiency of the colleges. So, I is implicit II is vague and is not implicit. The statement mentions that the new policy would help avoid delay in declaration of results. So, III is also implicit."
  },
  {
    id: 256,
    question: "256. Statement: Ten candidates, who were on the waiting list, could finally be admitted to the course. Assumptions: Wait-listed candidates do not ordinarily get admission. A large number of candidates were on the waiting list. The number of candidates to be admitted is small.",
    options: ["a) None is implicit", "b) Only I and II are implicit", "c) Only II and III are implicit", "d) Only I and III are implicit", "e) All are implicit"],
    correctIndex: 0,
    answerText: "a) None is implicit",
    solution: "Explanation: Since the wait-listed candidates have been admitted, so I is not implicit. Also, nothing about the number of candidates on the waiting list or the number to be admitted can be deduced from the statement. So, neither II nor III is implicit."
  },
  {
    id: 257,
    question: "257. Statement: The successful man has the ability to judge himself correctly. Assumptions: Inability to judge correctly causes failure. To judge others is of no use to a successful man. The successful man cannot make a wrong judgement.",
    options: ["a) None is implicit", "b) All are implicit", "c) Only I and II are implicit", "d) Only II and III are implicit", "e) Only I and III are implicit"],
    correctIndex: 1,
    answerText: "b) All are implicit",
    solution: "Explanation: Assumptions I and III directly follow from the statement and so both are implicit. Also, the basic quality of a successful man is that he can judge himself. This means that he need not judge others. So, II is also implicit."
  },
  {
    id: 258,
    question: "258. Statement: A State Government suspended two additional district judges. Assumptions: They were negligent in discharging duties. There was a charge of misconduct against them. The government officials were biased against them.",
    options: ["a) None is implicit", "b) Either I or II is implicit", "c) Any one of the three is implicit", "d) Only I and III are implicit", "e) Either I or III is implicit"],
    correctIndex: 1,
    answerText: "b) Either I or II is implicit",
    solution: "Explanation: A person holding an office is generally suspended on charges of misconduct or negligence of duty. So, either I or II is implicit. III seems to be vague and so it is not implicit."
  },
  {
    id: 259,
    question: "259. Statement: Bill Clinton is the second democrat to be re-elected as President of America, the other being the legendary Roosevelt. Assumptions: Clinton has the same qualities that Roosevelt had. The majority of people in America have faith in Clinton. The election campaign of Clinton's rivals was not impressive.",
    options: ["a) Only I is implicit", "b) Only II is implicit", "c) Only III is implicit", "d) Either I or III is implicit", "e) Either II or III is implicit"],
    correctIndex: 1,
    answerText: "b) Only II is implicit",
    solution: "Explanation: The statement simply mentions that Clinton and Roosevelt were the only two persons who were re-elected as President of America. But this does not imply that they were liked by the public for the same reasons or qualities. So, I is not implicit. However, it is clear that that majority of people adore Clinton. So, II is implicit. Nothing about the reasons of Clinton's victory or the election campaign of Clinton's rivals can be assumed from the given statement. So, III is not implicit."
  },
  {
    id: 260,
    question: "260. Statement: \"If you are a mechanical engineer, we want you as our supervisor.\" - An advertisement by Company X. Assumptions: Mechanical engineers are expected to be better performers by Company X. The Company X needs supervisors. Mechanical engineers may get attracted and apply to Company X.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All are implicit",
    solution: "Explanation: Clearly, the company lends more importance to mechanical engineers. This shows that they are believed to perform better. So, I is implicit. Also, the advertisement is given because the company needs supervisors. So, II is implicit. Further, the advertisement is meant to attract only mechanical engineers for the vacancy in company X. Hence, III is also implicit."
  },
  {
    id: 261,
    question: "261. Statement: \"Use Riya cold cream for fair complexion.\" - An advertisement. Assumptions: People like to use cream for fair complexion. People are easily fooled. People respond to advertisements.",
    options: ["a) Only I is implicit", "b) Only I and II are implicit", "c) Only II is implicit", "d) Only I and III are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only I and III are implicit",
    solution: "Explanation: Assumption I follows from the statement and so it is implicit. II is vague and so it is not implicit. Also, advertisements are given with the hope that people would know the qualities of the product and buy it. So, III is implicit."
  },
  {
    id: 262,
    question: "262. Statement: Quality of life of a person is not dependent only on his wealth. Assumptions: The aim of most people is just to acquire more wealth. There are some factors other than wealth which contribute to the quality of life. Wealth does not contribute to the quality of life at all.",
    options: ["a) Only I is implicit", "b) Only I and II are implicit", "c) Only II is implicit", "d) Only II and III are implicit", "e) Only I and III are implicit"],
    correctIndex: 2,
    answerText: "c) Only II is implicit",
    solution: "Explanation: Clearly, I does not follow from the statement. So, it is not implicit. The statement mentions that quality of life does not depend only on wealth. This means that there are some other factors as well, which govern the quality of life. But this does not imply that wealth does not contribute at all. So, II is implicit while III is not."
  },
  {
    id: 263,
    question: "263. Statement: The civic authority has decided that all the factories located inside the city limits be shifted outside to reduce the level of environmental pollution in the city. Assumptions: The pollution level in the city in future may reduce after these factories are shifted outside the city limit. Enough usable land is available outside the city limit for these factories. Many of these factories may shift to some other smaller towns to remain profitable.",
    options: ["a) Only I is implicit", "b) Only I and II are implicit", "c) Only II is implicit", "d) Only II and III are implicit", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only I and II are implicit",
    solution: "Explanation: I directly follows from the statement and so is implicit. The decision to shift factories on the outskirts of the city must have been taken after taking into account the availability of land there So, II is implicit. Nothing can be assumed as to what strategy would the factory owners adopt in future. So, III is not implicit."
  },
  {
    id: 264,
    question: "264. Statement: State Council For Teacher Education (SCTE) has laid down guidelines in respect of minimum qualifications for a person to be employed as a teacher in universities or in recognised institutions. Assumptions: The authorities will now appoint only qualified teachers. Only qualified people will apply for the teaching post. SCTE decides all the norms of educational qualifications for teaching faculty.",
    options: ["a) None is implicit", "b) Only I is implicit", "c) Only I and II are implicit", "d) Only I and III are implicit", "e) All are implicit"],
    correctIndex: 4,
    answerText: "e) All are implicit",
    solution: "Explanation: Since the SCTE has laid down the necessary qualifications for a person to be employed as a teacher in all universities and institutions, so all are implicit."
  },
  {
    id: 265,
    question: "265. Statement: Considering the tickets sold during the last seven days, the circus authorities decided to continue the show for another fortnight which includes two weekends. Assumptions: People may not turn up on weekdays. The average number of people who will be visiting circus will be more or less same as that of the last seven days. There may not be enough response at other places.",
    options: ["a) All are implicit", "b) None is implicit", "c) Only II is implicit", "d) Only I and II are implicit", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only II is implicit",
    solution: "Explanation: Clearly, the fortnight would include weekdays also. So, I is not implicit. Also, the authorities decided to continue the show with the hope that people would visit the circus in the same numbers as they had done in the last seven days. So, II is implicit. III is vague and so is not implicit."
  },
  {
    id: 266,
    question: "266. Statement: Give this packet to Mr. X at his residence and return immediately. In case you are likely to be late inform me - Mr. A tells his clerk. Assumptions: The clerk never informs about his late coming. The clerk may not obey Mr. As instructions. The clerk may not inform his late coming unless instructed.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) Only III is implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only III is implicit",
    solution: "Explanation: Clearly, the statement is merely a reminder. So, I is not implicit. Besides, the clerk is expected to execute his boss' order. So, II is not implicit. Also, a hunch that the clerk may not inform about his late coming has led Mr. A to instruct the clerk to do so. So, III is implicit."
  },
  {
    id: 267,
    question: "267. Statement: An advertisement: Now you can own a new car in just Rs. 1,999 per month. Assumptions: People aspire for owning a car. People do not want to buy used cars. Most people can afford to pay Rs. 1,999 per month for a new car.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All are implicit",
    solution: "Explanation: The advertisement has been given seeing the demand for cars. So, I is implicit. The advertisement stresses on 'owning a new car'. This implies that people would prefer to buy a new car rather than a used one, provided it suits their budget. So, II is implicit. The words 'just Rs. 1,999 per month' in the statement make III implicit."
  },
  {
    id: 268,
    question: "268. Statement: The company has recently announced a series of incentives to the employees who are punctual and sincere. Assumptions: Those who are not punctual at present may get motivated by the announcement. The productivity of the company may increase. The profit earned by the company may be more than the amount to be spent for the incentive programmes.",
    options: ["a) Only I and II are implicit", "b) None is implicit", "c) Only II and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I and II are implicit",
    solution: "Explanation: Announcing incentives for punctual and sincere employees would surely motivate more and more employees to be punctual, and this will ensure productivity. So, both I and II are implicit. However, the statement does not give any information about the profit earned by the company. So, III is not implicit."
  },
  {
    id: 269,
    question: "269. Statement: The economic condition continues to be critical even after a good harvest season. Assumptions: The economic condition was not critical before the harvest season. The economic condition could not have improved without a good harvest season. The economic condition was expected to improve after a good harvest season.",
    options: ["a) Only I and II are implicit", "b) Only II is implicit", "c) Only II and III are implicit", "d) Only III is implicit", "e) Only I and III are implicit"],
    correctIndex: 3,
    answerText: "d) Only III is implicit",
    solution: "Explanation: It is mentioned that 'the economic condition continues to be critical'. This means that it was critical before the harvest season also. So, I is not implicit. Also, the statement does not imply that only a good harvest season could improve the economic condition. So, II is not implicit. However, since a surprise has been expressed over the condition being critical even after a good harvest season, it means that it was expected to improve after a good harvest season. So, III is implicit."
  },
  {
    id: 270,
    question: "270. Statement: The X passenger car manufacturing company announced a sharp reduction in the prices of its luxury cars. Assumptions: There may be an increase in the sale of luxury cars of Company X. The other such car manufacturers may also reduce their prices. The competitor companies may not reduce their prices.",
    options: ["a) Only I is implicit", "b) Only I and II are implicit", "c) None is implicit", "d) Only I and III are implicit", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: The reduction in prices is clearly a step to promote sales of the company. So, I is implicit. However, other companies may or may not follow the same pursuit. So, either II or III is implicit."
  },
  {
    id: 271,
    question: "271. Statement: \"Buy pure and natural honey of company X.\" - An advertisement in a newspaper. Assumptions: Artificial honey can be prepared. People do not mind paying more for pure and natural honey. No other company supplies pure honey.",
    options: ["a) Only I is implicit", "b) Only I and II are implicit", "c) Only I and III are implicit", "d) All are implicit", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I is implicit",
    solution: "Explanation: Artificial honey can be made. That is why the word 'natural' needs to be mentioned in the advertisement. So, I is implicit. No comparison is made of the prices of natural and artificial honey. So, II is not implicit. Nothing about the quality of honey of other companies can be deduced. So, III is also not implicit."
  },
  {
    id: 272,
    question: "272. Statement: Unable to manage with the present salary, Arun has decided to join another company. Assumptions: The new company has better work environment. The present company offers moderate pay packets. The new company offers higher salary to all its employees.",
    options: ["a) None is implicit", "b) Only II is implicit", "c) All are implicit", "d) Only II and III are implicit", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II is implicit",
    solution: "Explanation: Nothing about the environment in the new company is mentioned in the statement. So, I is not implicit. Since Arun is not satisfied with the present Salary, it is evident that the present company offers moderate pay packets. So, II is implicit. The statement talks only of Arun and not all the employees of the new company. So, III is not implicit."
  },
  {
    id: 273,
    question: "273. Statement: The employees association has appealed to the Managers of Company Z to introduce written examinations for clerical cadre recruitment to prevent selection of incompetent persons. Assumptions: So far the Company Z used to select candidates without conducting a written examination. A written examination can help to identify competent persons. At higher level, written examination may not be of much use.",
    options: ["a) Only I and II are implicit", "b) Only II and III are implicit", "c) Only I and III are implicit", "d) Only III is implicit", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I and II are implicit",
    solution: "Explanation: An appeal has been made to 'introduce' written examination. This means that so far written examination was not conducted. So, I is implicit. II follows directly from the statement and so it is implicit. However, nothing can be deduced about the mode of selection at higher level. So, III is not implicit."
  },
  {
    id: 274,
    question: "274. Statement: To improve the employment situation in India, there is a need to recast the present educational system towards implementation of scientific discoveries in daily life. Assumptions: The students after completing such education may be able to earn their livelihood. This may bring meaning of education in the minds of the youth. The state may earn more revenue as more and more people will engage themselves in self-employment.",
    options: ["a) None is implicit", "b) Only I and II are implicit", "c) Only III is implicit", "d) Only I and III are implicit", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only I and II are implicit",
    solution: "Explanation: The statement mentions that such education can improve employment situation. So, both I and II are implicit. Nothing about the aspect of revenue collection is mentioned in the statement. So, III is not implicit."
  },
];

export const COURSE_OF_ACTION_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Statement: A large number of people in ward X of the city are diagnosed to be suffering from a fatal malaria type. Courses of Action: The city municipal authority should take immediate steps to carry out extensive fumigation in ward X. The people in the area should be advised to take steps to avoid mosquito bites.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, prevention from mosquitoes and elimination of mosquitoes are two ways to prevent malaria. So, both the courses follow."
  },
  {
    id: 2,
    question: "2. Statement: Severe drought is reported to have set in several parts of the country. Courses of Action: Government should immediately make arrangement for providing financial assistance to those affected. Food, water and fodder should immediately be sent to all these areas to save the people and cattle.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: In the break-out of a natural calamity, the basic duty of the government becomes to provide the basic amenities essential to save the lives of people and cattle. Providing financial assistance to all would put undue burden on the country's resources. So, only II follows."
  },
  {
    id: 3,
    question: "3. Statement: Since its launching in 1981, Vayudoot has so far accumulated losses amounting to Rs 153 crore. Courses of Action: Vayudoot should be directed to reduce wasteful expenditure and to increase passenger fare. An amount of about Rs 300 crore should be provided to Vayudoot to make the airliner economically viable.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, for better economic gain, losses should be reduced and income increased. So, only course I follows."
  },
  {
    id: 4,
    question: "4. Statement: Exporters in the capital are alleging that commercial banks are violating a Reserve Bank of India directive to operate a post shipment export credit denominated in foreign currency at international rates from January this year. Courses of Action: The officers concerned in the commercial banks are to be suspended. The RBI should be asked to stop giving such directives to commercial banks.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The statement mentions that the commercial banks violate a directive issued by the RBI. The remedy is only to make the banks implement the Act. So, none of the courses follows."
  },
  {
    id: 5,
    question: "5. Statement: A large number of people die every year due to drinking polluted water during the summer. Courses of Action: The government should make adequate arrangements to provide safe drinking water to all its citizens. The people should be educated about the dangers of drinking polluted water.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The situation demands creating awareness among people about the dangers of drinking polluted water so that they themselves refrain from the same, and at the same time taking steps to provide safe drinking water. So, both the courses follow."
  },
  {
    id: 6,
    question: "6. Statement: Most of those who study in premier engineering colleges in India migrate to developed nations for better prospects in their professional pursuits. Courses of Action: All the students joining these colleges should be asked to sign a bond at the time of admission to the effect that they will remain in India at least for ten years after they complete education. All those students who desire to settle in the developed nations should be asked to pay entire cost of their education which the government subsidises.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, no student can be bound to live and work in the country against his wish. So, I does not follow. However, it is quite right to recover the extra benefits awarded to students if they do not serve their own country. So, II follows."
  },
  {
    id: 7,
    question: "7. Statement: There is an unprecedented increase in migration of villagers to urban areas as repeated crop failure has put them into precarious financial situation. Courses of Action: The villagers should be provided with alternate source of income in their villages which will make them stay put. The migrated villagers should be provided with jobs in the urban areas to help them survive.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, increased migration would add to the burden on city's infrastructure. So, attempts should be made to make the villagers feel comfortable in the villages itself. So, only course I follows."
  },
  {
    id: 8,
    question: "8. Statement: As stated in the recent census report the female to male ratio is alarmingly low. Courses of Action: The government should conduct another census to verify the results. The government should immediately issue orders to all the departments to encourage people to improve the ratio.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: A census is always conducted with the utmost precision, leaving chances of only negligible differences. So, I does not follow. Further, the ratio can be improved by creating awareness among the masses and abolishing female foeticide. Thus, only course II follows."
  },
  {
    id: 9,
    question: "9. Statement: Four districts in State A have been experiencing severe drought for the last three years resulting into exodus of people from these districts. Courses of Action: The government should immediately start food for work programme in the district to put a halt to the exodus. The government should make since efforts to provide drinking/potable water to these districts",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The exodus can be stopped by providing the people conditions conducive to living. So, both the courses follow."
  },
  {
    id: 10,
    question: "10. Statement: If the retired Professors of the same Institutes are also invited to deliberate on restructuring of the organisation, their contribution may be beneficial to the Institute. Courses of Action: Management may seek opinion of the employees before calling retired professors. Management should involve experienced people for the systematic restructuring of the organisation.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, the statement stresses that the contribution of retired Professors shall be beneficial. This means that these people's experience regarding working of the organisation is helpful. So, only course II follows."
  },
  {
    id: 11,
    question: "11. Statement: The sale of a particular product has gone down considerably causing great concern to the company. Courses of Action: The company should make a proper study of rival products in the market. The price of the product should be reduced and quality improved.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, a study of rival products in the market will help assess the cause for the lowering down of sales and then a suitable action can be taken. Thus, only I follow."
  },
  {
    id: 12,
    question: "12. Statement: The Asian Development Bank has approved a $285 million loan to finance a project to construct coal ports by Paradip and Madras Port Trusts. Courses of Action: India should use financial assistance from other international financial organisations to develop such ports in other places. India should not seek such financial assistance from the international financial agencies.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, such projects shall be an asset and a source of income to the country later on. So, course I shall follow."
  },
  {
    id: 13,
    question: "13. Statement: Doordarshan is concerned about the quality of its programmes particularly in view of stiff competition it is facing from STAR and other satellite TV channels and is contemplating various measures to attract talent for its programmes. Courses of Action: In an effort to attract talent, the Doordarshan has decided to revise its fee structure for the artists. The fee structure should not be revised until other electronic media also revise it.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, the decision to revise its fee structure for artists is taken by Doordarshan as a remedy to the challenging problem that had arisen before it. It cannot wait till other media take action. So, only course I follows."
  },
  {
    id: 14,
    question: "14. Statement: The Minister said that the teachers are still not familiarised with the need, importance and meaning of population education in the higher education system. They are not even clearly aware about their role and responsibilities in the population education programme. Courses of Action: Population education programme should be included in the college curriculum. Orientation programme should be conducted for teachers on population education",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, the statement stresses on teachers' lack of awareness and knowledge in population education and as such the best remedy would be to guide them in this field through orientation programmes. So, only course II follows."
  },
  {
    id: 15,
    question: "15. Statement: A recent study shows that children below five die in the cities of the developing countries mainly from diarrhoea and parasitic intestinal worms. Courses of Action: Governments of the developing countries should take adequate measures to improve the hygienic conditions in the cities. Children below five years in the cities of the developing countries need to be kept under periodic medical check-up.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, the two diseases mentioned are caused by unhygienic conditions. So, improving the hygienic conditions is a step towards their eradication. Also, periodic medical check-up will help timely detection of the disease and hence a proper treatment. So, both I and II follow."
  },
  {
    id: 16,
    question: "16. Statement: The kharif crops have been affected by the insects for consecutive three years in the district and the farmers harvested less than fifty percent of produce during these years. Courses of Action: The farmers should seek measures to control the attack of insects to protect their crops next year. The Government should increase the support price of kharif crops considerably to protect the economic interests of farmers.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, the problem demands taking extra care and adequate precautions to protect crops from insects and extending help to farmers to prevent them from incurring huge losses. Thus, both the courses follow."
  },
  {
    id: 17,
    question: "17. Statement: The car dealer found that there was a tremendous response for the new XYZ's car-booking with long queues of people complaining about the duration of business hours and arrangements. Courses of Action: People should make their arrangement of lunch and snacks while going for car XYZ's booking and be ready to spend several hours. Arrangement should be made for more booking desks and increased business hours to serve more people in less time.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Seeing the tremendous response, the dealer must make suitable arrangements and deploy more personnel to take care of customers so that they don't have to wait excessively long for booking. So, only course II follows."
  },
  {
    id: 18,
    question: "18. Statement: The State Government has decided to declare 'Kala Azar' as a notifiable disease under the Epidemics Act. Family members or neighbours of the patient are liable to be punished in case they did not inform the State authorities. Courses of Action: Efforts should be made to effectively implement the Act. The cases of punishment should be propagated through mass media so that more people become aware of the stern actions.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The Act is aimed at eradication of the disease and so it needs to be proclaimed and promoted. So, both the courses follow."
  },
  {
    id: 19,
    question: "19. Statement: The Chairman stressed the need for making education system more flexible and regretted that the curriculum has not been revised in keeping with the pace of the changes taking place. Courses of Action: Curriculum should be reviewed and revised periodically. System of education should be made more flexible.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, the situation demands making the education system more flexible and changing it periodically according to the needs of the time. So, both the courses follow."
  },
  {
    id: 20,
    question: "20. Statement: The Central Bureau of Investigation receives the complaint of an officer taking bribe to do the duty he is supposed to. Courses of Action: CBI should try to catch the officer red-handed and then take a strict action against him. CBI should wait for some more complaints about the officer to be sure about the matter.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, one complaint is enough for a wrong doing. This should be confirmed by catching the guilty red-handed and then strict action taken against him. So, only course I follows."
  },
  {
    id: 21,
    question: "21. Statement: The Indian electronic component industry venturing into the West European markets faces tough competition from the Japanese. Courses of Action: India should search for other international markets for its products. India should improve the quality of the electronic components to compete with the Japanese in capturing these markets.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: An escapist's attitude does not help much. The need is to compete and emerge successful. So, only course II follows."
  },
  {
    id: 22,
    question: "22. Statement: Orissa and Andhra Pradesh have agreed in principle to set up a joint control board for better control, management and productivity of several inter-state multipurpose projects. Courses of Action: Other neighbouring states should set up such control boards. The proposed control board should not be allowed to function as such joint boards are always ineffective.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: The effectiveness of such Control Boards is established by the fact that Orissa and A.P. have agreed to it for better control of its multipurpose projects. So, only course I follows."
  },
  {
    id: 23,
    question: "23. Statement: The Government has decided not to provide financial support to voluntary organisations from next Five Year Plan and has communicated that all such organisations should raise funds to meet their financial needs. Courses of Action: Voluntary organisations should collaborate with foreign agencies. They should explore other sources of financial support.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: The problem arising is shortage of funds. So, alternative sources of financial support need to be worked out first. Thus, only course II follows."
  },
  {
    id: 24,
    question: "24. Statement: The availability of imported fruits has increased in the indigenous market and so the demand for indigenous fruits has been decreased. Courses of Action: To help the indigenous producers of fruits, the Government should impose high import duty on these fruits, even if these are not of good quality. The fruit vendors should stop selling imported fruits. So that the demand for indigenous fruits would be increased.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The ideas suggested in both I and II represent unfair means to cut competition. The correct way would be to devise methods and techniques such that the indigenous producers could produce better quality fruits and make them available in the market at prices comparable with those of the imported ones. Hence, neither I nor II follows."
  },
  {
    id: 25,
    question: "25. Statement: There has been an unprecedented increase in the number of successful candidates in this year's School Leaving Certificate Examination. Courses of Action: The government should make arrangements to increase number of seats of intermediate courses in existing colleges. The government should take active steps to open new colleges to accommodate all these successful candidates.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: The increase may not be a permanent one. So, it's better not to open new colleges but increase seats in the existing colleges. So, only I follow."
  },
  {
    id: 26,
    question: "26. Statement: On an average, about twenty people are run over by trains and die every day while crossing the railway tracks through the level crossing. Courses of Action: The railway authorities should be instructed to close all the level crossings. Those who are found crossing the tracks, when the gates are closed, should be fined heavily",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: The accidents can clearly be prevented by barring people from crossing the tracks when the gates are closed, So, only II follows."
  },
  {
    id: 27,
    question: "27. Statement: Majority of the students in many schools do not pass in the final examination. Courses of Action: These schools should be closed down as these have become unproductive. The teachers of these schools should immediately be retrenched.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Clearly, the situation demands that efforts be made to remove the lackenings in the present system of education and adequate measures be taken to improve the performance of students. Harsh measures as those given in I and II, won't help. So, none of the given courses follows."
  },
  {
    id: 28,
    question: "28. Statement: In spite of the Principal's repeated warnings, a child was caught exploding crackers secretly in the school. Courses of Action: All the crackers should be taken away from the child and he should be threatened not to do it again. The child should be severely punished for his wrong act.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Since the act has been repeated despite various warnings, so course I would only be another warning and would not help. Severe punishment to set example for him and others is inevitable. Thus, course II shall follow."
  },
  {
    id: 29,
    question: "29. Statement: It is necessary to adopt suitable measures to prevent repetition of bad debts by learning from the past experiences of mounting non-performing assets of banks. Courses of Action: Before granting loan to customers their eligibility for loan should be evaluated strictly. To ensure the payment of instalments of loan, the work, for which loan was granted, should be supervised minutely on regular basis.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: To ensure that debts taken are repaid promptly, the customer's requirements and future prospects ought to be studied and their work constantly checked. Thus, both the courses follow."
  },
  {
    id: 30,
    question: "30. Statement: A very large number of students have failed in the final high school examination due to faulty questions in one of the subjects. Courses of Action: All the students who have failed in the subject should be allowed to take supplementary examination. All those who are responsible for the error should be suspended and an enquiry should be initiated to find out the facts.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: There being faulty questions in the examination paper is a blunder on the part of school management and students should not be made to suffer on account of this. Thus, a re-test should be organised for the students and those responsible for the error be penalised to prevent reoccurrence of such mistake in the future. Hence, both the courses follow."
  },
  {
    id: 31,
    question: "31. Statement: A large number of engineering graduates in the country are not in a position to have gainful employment at present and the number of such engineers is likely to grow in the future. Courses of Action: The government should launch attractive employment generation schemes and encourage these graduates to opt for such schemes to use their expertise and knowledge effectively. This happened due to proliferation of engineering colleges in the country and thereby lowered the quality of the engineering graduates. Those colleges which are not equipped to impart quality education should be closed down.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: The emphasis should be not on the Government putting all the engineering graduates to jobs but on the colleges producing not 'degree-holders' but real technical minds which could compete well for gainful employment. So, only course II follows."
  },
  {
    id: 32,
    question: "32. Statement: Every year, at the beginning or at the end of the monsoons, we have some cases of conjunctivitis, but this year, it seems to be a major epidemic, witnessed after nearly four years. Courses of Action: Precautionary measures should be taken after every four years to check this epidemic. People should be advised to drink boiled water during rainy season.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: The disease occurs at the end of monsoons every year. So, precautionary measures every four years shall not help. The second course of action shall be a preventive measure. So, only course II follows."
  },
  {
    id: 33,
    question: "33. Statement: Every year large number of devotees dies due to severe cold on their way to the shrine located at the top of the mountain range. Courses of Action: The devotees should be discouraged to visit the shrine without having proper warm clothes and other amenities. The government should provide warm clothes and shelter to all the devotees visiting the shrine.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, the problem can be solved by warning the devotees of the excessive cold at the shrine. So, only I follow."
  },
  {
    id: 34,
    question: "34. Statement: There has been an unprecedented increase in the number of requests for berths in most of the long distance trains during the current holiday season. Courses of Action: The railway authority should immediately increase the capacity in each of these trains by attaching additional coaches. The people seeking accommodation should be advised to make their travel plan after the holiday.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: People cannot be deprived of going to a certain destination merely for lack of berths. Instead it is the duty of the railway authority to accommodate all the bookings by all means. So, only I follows."
  },
  {
    id: 35,
    question: "35. Statement: The Finance Minister submits his resignation a month before the new budget is to be presented in the Parliament. Courses of Action: The resignation should be accepted and another person should be appointed as the Finance Minister. The resignation should not be accepted.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, an already working Finance Minister shall know better all the plans and resources of the Government and he alone can present a suitable budget. So, course II follows."
  },
  {
    id: 36,
    question: "36. Statement: A large number of people visiting India from country X have been tested positive for carrying viruses of a killer disease. Courses of Action: The government of India should immediately put a complete ban on people coming to India from country X including those Indians who are settled in country X. The government of India should immediately set up detection centres at all its airports and seaports to identify and quarantine those who are tested positive.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, the non-infected persons should not be debarred from visiting India. So, only course II follows."
  },
  {
    id: 37,
    question: "37. Statement: There has been less than forty percent voter turnout in the recent assembly elections. Courses of Action: The election commission should cancel the entire election process as the votes cast are not adequate to represent people. The election commission should take away the voting rights of those who did not exercise their rights.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Re-election would demand repeated expenses and following course II would reduce the voter base permanently. Instead, awareness should be created among the people to use their right to vote effectively. So, neither I nor II follows."
  },
  {
    id: 38,
    question: "38. Statement: Most of the development plans develop in papers only. Courses of Action: The in-charges should be instructed to supervise the field-work regularly. The supply of paper to such departments should be cut short.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, proper supervision alone can see the development in practice. So, only course I follows."
  },
  {
    id: 39,
    question: "39. Statement: The vegetable traders feel that the prices of onion will again go up shortly in the State 'P' Courses of Action: The 'P' State Government should purchase and store sufficient quantity of onion in advance to control prices. The 'F' State Government should make available network of fair price shops for the sale of onions during the period of shortage.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, both the courses of action seem appropriate to prevent black-marketing in case of shortage. Hence, both I and II follow."
  },
  {
    id: 40,
    question: "40. Statement: It is reported that though Vitamin E present in fresh fruits and vegetables is beneficial for human body, capsule Vitamin E does not have the same effect on human body. Courses of Action: The sale of capsule Vitamin E should be banned. People should be encouraged to take fresh fruits and vegetables to meet the body's requirement of Vitamin E.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: The statement implies that capsule Vitamin E does not function so effectively as natural Vitamin E. Since no negative effect of capsule Vitamin E is mentioned, so I does not follow. Hence, only II follows."
  },
  {
    id: 41,
    question: "41. Statement: Youngsters are often found staring at obscene posters. Courses of Action: Children should be punished and penalized if they are found doing so. Any display of such material should be banned.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Bad things attract more and punishment after the act has been committed is no remedy. The act should be prevented. So, only course II follows."
  },
  {
    id: 42,
    question: "42. Statement: One of the problems facing the food processing industry is the irregular supply of raw material. The producers of raw material are not getting a reasonable price. Courses of Action: The government should regulate the supply of raw material to other industries also. The government should announce an attractive package to ensure regular supply of raw material for food processing industry.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, to remedy the problem of food processing industry, a regular supply of raw material should be ensured. So, course II follows."
  },
  {
    id: 43,
    question: "43. Statement: The Committee has criticized the Institute for its failure to implement a dozen of regular programmes despite an increase in the staff strength and not drawing up a firm action plan for studies and research. Courses of Action: The broad objectives of the Institute should be redefined to implement a practical action plan. The Institute should give a report on reasons for not having implemented the planned programmes.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The problem is that despite an increase in staff strength, the Institute has failed in its objective of implementing its plan. So, either there should be reasons for the lackening or the plans are a failure and must be revised for practical implementation. Thus, both the courses follow."
  },
  {
    id: 44,
    question: "44. Statement: India has been continuously experiencing military threats from its neighbouring countries. Courses of Action: India should engage into an all out war to stop the nagging threats. India should get the neighbours into a serious dialogue to reduce the tension at its borders.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, war is the last resort. First, peaceful talks and negotiations should be indulged in, to settle the issues of dispute. So, only course II follows."
  },
  {
    id: 45,
    question: "45. Statement: As many as ten coaches of a passenger train have derailed and blocked both pairs of the railway tracks. Courses of Action: The railway authorities should immediately send men and equipment to the spot to clear the railway tracks. All the trains running in both the directions should be diverted to other routes.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The situation demands first diverting other trains to different routes so as to avert any accident, and then clearing the tracks as soon as possible. Thus, both the courses follow."
  },
  {
    id: 46,
    question: "46. Statement: There has been a significant drop in the water level of all the lakes supplying water to the city. Courses of Action: The water supply authority should impose a partial cut in supply to tackle the situation. The government should appeal to all the residents through mass media for minimal use of water.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The situation can be tackled by periodic cuts in supply, and urging people to conserve water. So both the courses follow."
  },
  {
    id: 47,
    question: "47. Statement: The police department has come under a cloud with recent revelations that at least two senior police officials are suspected to have been involved in the illegal sale of a large quantity of weapons from the state police armoury. Courses of Action: A thorough investigation should be ordered by the State Government to bring out all those who are involved into the illegal sale of arms. State police armoury should be kept under Central Government's control.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, the situation demands finding out the real culprits first. So, only I follow."
  },
  {
    id: 48,
    question: "48. Statement: Financial stringency prevented the State Government from paying salaries to its employees since April this year. Courses of Action: The State Government should immediately curtail the staff strength at least by 30%. The State Government should reduce wasteful expenditure and arrange to pay the salaries of its employees.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, curtailing of the staff strength will only increase the panic and discontent, and the satisfaction of the employees is a must. So, the Government should arrange for payment of wages. Thus, only course II follows."
  },
  {
    id: 49,
    question: "49. Statement: The cinema halls are incurring heavy losses these days as people prefer to watch movies in home on TV than to visit cinema halls. Courses of Action: The cinema halls should be demolished and residential multi-storey buildings should be constructed there. The cinema halls should be converted into shopping malls.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Doing away with cinema halls is no solution. Hence, none of the courses follows. Instead, certain incentives and promotional schemes should be awarded to cinema hall owners so that they could manage to draw in crowds."
  },
  {
    id: 50,
    question: "50. Statement: Duty free technology parks where foreign firms can manufacture electronic hardware components are proposed to be established at various places in the country. Courses of Action: Government should immediately implement the proposal to augment the foreign currency reserve by exporting the products. Government should not implement the proposal as it will hinder indigenous production of hardware components.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: The step discussed in the statement would surely give a boost to hardware industry and help our country to stand apart in this field. Thus, only I follows."
  },
  {
    id: 51,
    question: "51. Statement: The Secretary lamented that the electronic media was losing its credibility and that it should try to regain it by establishing better communications with the listeners and the viewers. He also emphasised the need for training to improve the functioning. Courses of Action: Efforts should be made to get organised feed back on the programme. The critical areas in which the staff requires training should be identified.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, both the courses directly follow from the pre-requisites mentioned in the statement."
  },
  {
    id: 52,
    question: "52. Statement: Courts take too long in deciding important disputes of various departments. Courses of Action: Courts should be ordered to speed up matters. Special powers should be granted to officers to settle disputes concerning their department.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, either the work in the court needs to be speeded up or the system be reorganised so that more number of problems can be resolved at the lower levels itself, to provide speedy justice to the people. So, both the courses follow."
  },
  {
    id: 53,
    question: "53. Statement: Certain mining industries in Gujarat may come to a standstill because of the notification issued by the Department of Environment and Forest banning mining operations and industries alike within 25 kms of National Park, the game sanctuary and reserve forest areas. Courses of Action: The Department should be asked to immediately withdraw the notification. The Government should make effort to shift the parks, sanctuaries and reserve forests to other non-mining areas.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Clearly, none of the courses of action follows because firstly, the notification is issued to protect the natural environment and so cannot be withdrawn and secondly, the sanctuaries etc. cannot be shifted."
  },
  {
    id: 54,
    question: "54. Statement: There have been many instances of derailment of trains due to landslide in the hilly areas which caused loss of many lives. Courses of Action: The railway authority should arrange to deploy pilot engines before the movement of passenger trains in the hilly areas to alert the trains in case of any landslide. The railway authority should strengthen the hill slopes by putting iron meshes so that the loose boulders do not fall on the track.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: Clearly, either something should be done to alert the trains well in advance in case of a landslide or some means should be adopted to prevent blockage of tracks during landslides. Thus, either I or II follows."
  },
  {
    id: 55,
    question: "55. Statement: India today is midstream in its demographic transaction. In the last 60 years there has been an almost continuous decline in mortality; while fertility has declined over the last 20 years. The consequence is that there has been a rapid growth in population over the last 50 years. Courses of Action: India should immediately revitalise its family planning programme. The Government should immediately launch a massive education programme through mass media highlighting the implication of population growth at the present rate.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, to face the problem of the ever-growing population, an effective family planning programme, for the people to have small families, is a must. Education shall further stress the advantages of having lesser number of children and the disasters of the fast growth in population. Thus, both the courses follow."
  },
  {
    id: 56,
    question: "56. Statement: Footpaths of a busy road are crowded with vendors selling cheap items. Courses of Action: The help of police should be sought to drive them away. Some space should be provided to them where they can earn their bread without blocking footpaths.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Crowding on footpaths is a great inconvenience for walkers. So, stern action needs to be taken to remove the vendors. But at the same time these people ought to be provided alternative means of livelihood. So, both the courses follow."
  },
  {
    id: 57,
    question: "57. Statement: Some serious blunders were detected in the Accounts section of a factory. Courses of Action: An efficient team of auditors should be appointed to check the Accounts. A show cause notice should be issued to all the employees involved in the irregularity.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, the situation demands that the faults in Accounts be properly worked out and the persons involved be interrogated about the matter. So, both the courses follow."
  },
  {
    id: 58,
    question: "58. Statement: Researchers are feeling agitated as libraries are not equipped to provide the right information to the right users at the right time in the required format. Even the users are riot aware about the various services available for them. Courses of Action: All the information available to the libraries should be computerised to provide faster services to the users. Library staff should be trained in computer operations.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, the library needs to be provided with the essential facilities and trained personnel for better services. So, both the courses follow."
  },
  {
    id: 59,
    question: "59. Statement: Many medical and engineering graduates are taking up jobs in administrative services and in banks. Courses of Action: All the professionals should be advised to refrain from taking up such jobs. The government should appoint a committee to find out the reasons for these professionals taking up such jobs and to suggest remedial measures.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Following course I would be an infringement of the right to freedom of individuals. However, if the lacking of their respective fields are found out and removed, the professionals would surely give up the idea of opting for other jobs. Hence, only course II follows."
  },
  {
    id: 60,
    question: "60. Statement: Due to substantial reduction in fares by different airline services, large number of passengers so far travelling by upper classes in trains have switched over to airline services. Courses of Action: The railways should immediately reduce the fare structure of the upper classes substantially to retain its passengers. The railways should reduce the capacity of upper classes in all the trains to avoid loss.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Airlines, being convenient and faster means of transport, people would surely prefer it to the railways if there is a marginal difference between the fares. Hence, a considerable gap between the two fares is a must for the railways. So, course I follows. Following course II would reduce the volume of passengers. Hence, II does not follow."
  },
  {
    id: 61,
    question: "61. Statement: The Meteorology Department has forecast that a severe cyclonic storm would hit coastal Andhra Pradesh and Orissa in the next forty-eight hours. Courses of Action: The local administration should advise the fishermen not to go to dangerous area in the sea. The local administration should alert the people of coastal areas of these two states and they should be prepared to shift to safer places.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The forecast of a storm clearly necessitates steps to avert any loss of life. So, both I and II follow."
  },
  {
    id: 62,
    question: "62. Statement: There has been large number of cases of internet hacking in the recent months creating panic among the internet users. Courses of Action: The government machinery should make an all out effort to nab those who are responsible and put them behind bars. The internet users should be advised to stay away from using internet till the culprits are caught.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, internet users should not suffer on account of certain individuals who indulge in internet hacking. However, such wrong-doers ought to be penalised so that there are no hassles in the use of internet. So, only course I follows."
  },
  {
    id: 63,
    question: "63. Statement: The Union Ministry of Tourism and Civil Aviation has fixed an annual target of Rs 10,000 crores by way of tourism earnings towards the end of the current decade. Courses of Action: There is no need of development of further new tourist spots to meet the target. The Ministry should evolve attractive packages to woo the foreign tourists to meet the target.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Such a high target can be achieved only by a drastic increase in the number of tourists. The tourists can be attracted only by developing spots worth seeing and providing attractive packages which seem to be a good value-for-money offer to foreign tourists. So, only II follows."
  },
  {
    id: 64,
    question: "64. Statement: A large number of students have been caught using unfair means during the final-year degree examination. Courses of Action: All these students should be debarred permanently from appearing for any examination conducted by the authority. The guardians of these students should be called by the authority to inform them that any such behaviour in future will not be tolerated.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Merely a warning for the future won't help, and an extremely harsh punishment as debarring students from exams permanently would spoil their future. So, none of the courses follows."
  },
  {
    id: 65,
    question: "65. Statement: The alert villagers caught a group of dreaded dacoits armed with murderous weapons. Courses of Action: The villagers should be provided sophisticated weapons. The villagers should be rewarded for their courage and unity.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, I is not practically viable. However, villagers should be rewarded for their courage, to keep up their spirits in future. Thus, II follows."
  },
  {
    id: 66,
    question: "66. Statement: The employees union of the Municipal Corporation has decided to strike work for indefinite period in protest against the management's refusal to grant bonus. Courses of Action: The government should immediately pay ex-gratia grant to the Municipal Corporation to grant bonus to its employees. The striking employees should be persuaded to defer the strike notice.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Immediately conceding to the employees' demands may entice the employees into black-mailing the management frequently. A better way is to have talks with them and persuade them to end strike. So, only course II follows."
  },
  {
    id: 67,
    question: "67. Statement: The killer entric fever has so far claimed 100 lives in some tribal villages in M.P. during the past three weeks. Courses of Action: The residents of these villages should immediately be shifted to a non-infected area. The Government should immediately send a medical squad to this area to restrict spread of the killer disease.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, I is vague because if infected people are shifted to a non-infected area, the infection will spread there as well The remedy is only to fight the disease and restrict its spread. So, only II follows."
  },
  {
    id: 68,
    question: "68. Statement: There is a substantial increase in the number of accidents causing deaths and severe injuries due to malfunctioning of the traffic signals. Courses of Action: The traffic police should immediately post traffic personnel at the junctions. The signal system should immediately be repaired or replaced.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: Clearly, either the traffic signals should be made to function properly or traffic personnel should be deployed to guide vehicular movement in the right way. So, either I or II follows."
  },
  {
    id: 69,
    question: "69. Statement: India's performance in the recent Olympic Games was very poor. Not even a single medal could be bagged by the players. Government has spent Rs. 5 crores in training and deputing a team of players to participate in the Olympic Games. Courses of Action: India should stop sending players to the future Olympic Games. Government should immediately set up an enquiry commission to find out the reason for India's dismal performance.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, to compete against a challenge, the first step must be to find out where the lacking is. So, only course II follows."
  },
  {
    id: 70,
    question: "70. Statement: Three persons were caught with huge arms and ammunition in the city. Courses of Action: Police should be instructed for night patrolling. The three persons should be set free and their movements should be carefully watched to nab the other criminals.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: The police should at once be made cautious and put on high alert to prevent any untoward incident. Also, once caught, such criminals ought not to be released. They can be interrogated to detect other criminals. So, only I follows."
  },
  {
    id: 71,
    question: "71. Statement: Majority of the students have failed in one paper in the first semester examination. Courses of Action: All those students who failed should be asked to drop out of the course. The faculty teaching the paper should be asked to resign.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The failure of a majority of students hints at there being lackenings on the part of teaching faculty, which need to be pointed out and removed by constant efforts. So, none of the given courses of action follows."
  },
  {
    id: 72,
    question: "72. Statement: Mr. X, an active member of the Union, often insults his superiors in the office with his rude behaviour. Courses of Action: He should be transferred to some other department. The matter should be referred to the Union.",
    options: ["a) Only I follows", "b) Only II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Clearly, the only remedy is to somehow attempt to change the habit. If transferred, the habit will create problem elsewhere. Also, it is no legal complaint to be referred to the Union. So, none of the courses follows."
  },
  {
    id: 73,
    question: "73. Statement: The weather bureau has through a recent bulletin forecast heavy rainfall during the next week which may cause water logging in several parts of the city. Courses of Action: The bulletin should be given wide publicity through the mass media. The civic authority should keep in readiness the pumping system for removal of water from these parts. The people should be advised to stay indoors during the period.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only II follows", "d) Only II and III follow", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only II and III follow",
    solution: "Explanation: The issue is not so big as to be made public extensively. So, I does not follow. Besides, the authorities must be prepared to deal with the problem effectively and persuade the people to stay indoors to avoid inconvenience arising out of water-logging. Thus, both II and III follow."
  },
  {
    id: 74,
    question: "74. Statement: A train derailed near a station while moving over a bridge and fell into a river, resulting in the death of 65 people. Courses of Action: The Railway Authorities should clarify the reason of the accident to the Government. The Government should allocate funds to compensate the destruction caused. The protection walls of the bridge should be made strong enough to avoid such accidents.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only III follows", "d) All follow", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only III follows",
    solution: "Explanation: What is necessary is the preventive measures to protect the passengers, steps to avoid re-occurrence of such events and pay the sufferers adequate compensation. So, only course III follows."
  },
  {
    id: 75,
    question: "75. Statement: Poverty is increasing because the people, who are deciding how to tackle it, know absolutely nothing about the poor. Courses of Action: The decision makers should go to the grass root levels. The decision makers should come from the poorer sections of the society. A new set of decision makers should replace the existing one.",
    options: ["a) Only I follows", "b) Only II follows", "c) Only either I or III follows", "d) All follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: The statement indirectly asserts that the decision makers can work effectively to eliminate poverty, only if they get to know the basic problems afflicting the poor people through interaction with them. So, only I follows."
  },
  {
    id: 76,
    question: "76. Statement: Besides looks and appearances, it is also important to develop oneself from within. Courses of Action: One should not pay attention to fashion. One should pay attention to fashion. Books on self-development should be encouraged.",
    options: ["a) Only I follows", "b) Only II follows", "c) Only III follows", "d) Only I and III follow"],
    correctIndex: 2,
    answerText: "c) Only III follows",
    solution: "Explanation: The statement stresses the need for all-round personality development of an individual. So, only III follows."
  },
  {
    id: 77,
    question: "77. Statement: There is an unprecedented increase in the production of wheat this kharif season in most parts of the country. Courses of Action: The government should immediately lower down the procurement price of wheat. The farmers should be asked to store the excess produces with themselves to be used for future. The government should make its best efforts to export wheat to augment its presence in international market.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Clearly, both steps I and II are not commercially viable for the farmers. So, none of them follows. The only solution lies in the government attempting to export the excess produce of wheat. Thus, only III follows."
  },
  {
    id: 78,
    question: "78. Statement: A large number of students are reported to be dropping out of school in villages as their parents want their children to help them in farms. Courses of Action: The government should immediately launch a programme to create awareness among the farmers about the value of education. The government should offer incentives to those farmers whose children remain in schools. Education should be made compulsory for all children up to the age of 14 and their employment banned.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All follow",
    solution: "Explanation: Literacy at basic level is the utmost need to prepare good future citizens. So, all children need to be educated. This can be achieved by creating awareness, providing incentives, enforcing education and banning employment of children. Thus, all the three courses follow."
  },
  {
    id: 79,
    question: "79. Statement: Without the active cooperation between the proprietor and the employees of the mill, it cannot remain a profitable concern for long. Courses of Action: The mill should be closed down. The workers should be asked to cooperate with the owners. The owners should be asked to cooperate with the employees.",
    options: ["a) None follows", "b) Only I and II follow", "c) All follow", "d) Only II and III follow", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only II and III follow",
    solution: "Explanation: Clearly, both II arid III directly fulfil the essence of the given statement and so, both follow."
  },
  {
    id: 80,
    question: "80. Statement: The air and rail services have been severely disrupted due to thick fog in the northern part of the country. Courses of Action: The rail and air services should be temporarily suspended in the region. People should be advised to make their travel plan keeping in mind the probable disruption resulting in delay or cancellation of services. The government should immediately install modern machines which will enable it to guide the rail and air services even if the thick fog develops.",
    options: ["a) Only II follows", "b) Only III follows", "c) Only II and III follow", "d) All follow", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All follow",
    solution: "Explanation: Keeping in mind the safety and convenience of passengers, both I and II follow. III clearly suggests a remedy to the problem and hence it also follows."
  },
  {
    id: 81,
    question: "81. Statement: There are more than 200 villages in the hill area of Uttar Pradesh which are severely damaged due to cyclone and it causes an extra burden of Rs 200 crore on State Government for relief and rehabilitation work. Courses of Action: People of hill area should be shifted to other safer places. State Government should ask more financial support from Central Government. Government should levy relief tax to the corporate sector to ease the additional burden.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only II and III follow", "d) Only I and III follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Since severe damage has been caused by cyclone, people in affected villages ought to be shifted to safer places. Also, since relief work entails huge amounts, the State Government needs to pool up funds by either of the ways given in II and III. So, I and either II or III follow."
  },
  {
    id: 82,
    question: "82. Statement: Any further increase in the pollution level in the city by way of industrial effluents and automobile exhaustions would pose a severe threat to the inhabitants. Courses of Action: All the factories in the city should immediately be closed down. The automobiles should not be allowed to ply on the road for more than four hours a day. The Government should restrict the issue of fresh licences to factories and automobiles.",
    options: ["a) None follows", "b) Only II follows", "c) Only III follows", "d) All follows", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only III follows",
    solution: "Explanation: The existing industrial units and automobiles ought to be checked for pollution level and fitted with proper equipments to minimise the same. Restricting their operation is no solution. So, neither I nor II follows. Besides, fresh licences ought to be given only to those vehicles or factories which operate at the optimum emission level. So, III follows."
  },
  {
    id: 83,
    question: "83. Statement: Lack of coordination between the University, its colleges and various authorities has resulted in students ousted from one college seeking migration to another. Courses of Action: If a student is ousted from a college, the information should be sent to all the other colleges of the University The admissions to all the colleges of the University should be handled by the University directly. A separate section should be made for taking strict action against students indulging in anti-social activities.",
    options: ["a) Only I follows", "b) Only II follows", "c) Only III follows", "d) Only I and III follow", "e) Only II and III follow"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, the issue is not so big as to allot all powers of admissions to colleges, to the University only. So, II does not follow. The problem can be solved by circulating the information of the ousted students to all the colleges so as to ensure that such students do not get admission elsewhere also. This might prove useful in rectifying such students. So, I follows while III does not."
  },
  {
    id: 84,
    question: "84. Statement: Over 27,000 bonded labourers identified and freed are still awaiting rehabilitation. Courses of Action: More cases of bonded labourers should be identified. Till the proper rehabilitation facilities are available, the bonded labourers should not be freed. The impediments in the way of speedy and proper rehabilitation of bonded labourers should be removed.",
    options: ["a) None follows", "b) Only I follows", "c) Only II follows", "d) Only III follows", "e) Only II and III follow"],
    correctIndex: 3,
    answerText: "d) Only III follows",
    solution: "Explanation: The problem discussed here clearly hints at the need for quick rehabilitation of bonded labourers. So, only III follows."
  },
  {
    id: 85,
    question: "85. Statement: Number of dropouts from the municipal schools has significantly increased after withdrawal of mid-day meal scheme. Courses of Action: The government should reconsider its decision of withdrawal of midday meal scheme. The government should close down some of the municipal schools. The government should carry out a detailed study to find out the reasons for school dropouts.",
    options: ["a) None follows", "b) Only I follows", "c) Only I and III follow", "d) Only II and III follow", "e) All follow"],
    correctIndex: 2,
    answerText: "c) Only I and III follow",
    solution: "Explanation: Clearly, the government ought to find out the reason behind the increase in number of dropouts, and also the extent to which the withdrawal of mid-day meal scheme is responsible for the same. So, both I and III follow. II appears to be vague."
  },
  {
    id: 86,
    question: "86. Statement: There has been unprecedented increase in the prices of essential commodities during the past few days due to the strike call given by the transporters association. Courses of Action: The transporters' association should be ordered by the government to immediately withdraw strike call or else they will face severe consequences. The government should immediately make alternative arrangements to ensure adequate supply of essential commodities in the market. The government should immediately declare the strike illegal and put all those responsible for the strike behind the bars.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I and II follow",
    solution: "Explanation: Clearly, the situation demands that strike be called off, either through warning or negotiations, and till then alternative arrangements be made to retain normalcy in supply of essential commodities. So, both I and II follow. Taking extreme steps (as getting the striking transporters arrested) at the first stage, doesn't seem proper. So, III does not follow."
  },
  {
    id: 87,
    question: "87. Statement: A large number of students studying in municipal schools could not pass the Xth Std. Board examination causing frustration among the students and their parents. Courses of Action: The Municipal authority should immediately review the position and initiate measures to improve the situation. The municipal authority should immediately fill up the teachers' vacancies in the municipal schools. The municipal authority should close down some of their schools and concentrate their attention on remaining schools to improve the conditions.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Such problems can best be dealt with by first detecting the lackenings in the existing system and then taking adequate steps to remove them. So, only I follows."
  },
  {
    id: 88,
    question: "88. Statement: Incessant rain for the past several days has posed the problem of overflowing and flood as the river bed is full of silt and mud. Courses of Action: The people residing near the river should be shifted to a safe place. The people should be made aware about the imminent danger over radio/television. The silt and mud from the river bed should be cleared immediately after the receding of the water level.",
    options: ["a) None follows", "b) Only I and ll follow", "c) Only II and III follow", "d) Only I and III follow", "e) All follow"],
    correctIndex: 4,
    answerText: "e) All follow",
    solution: "Explanation: All the three given steps are ideal to save people's lives from the ensuing danger and hence, all of them follow."
  },
  {
    id: 89,
    question: "89. Statement: Some strains of mosquito have become resistant to chloroquine - the widely used medicine for malaria patients. Courses of Action: Selling of chloroquine should be stopped. Researchers should develop a new medicine for patients affected by such mosquitoes. All the patients suffering from malaria should be checked for identification of causal mosquito.",
    options: ["a) None follows", "b) Only I and III follow", "c) All follow", "d) Only II and III follow", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only II and III follow",
    solution: "Explanation: Clearly, chloroquine can still be used to get rid of the non-resistant varieties, and new medicines developed for the resistant varieties. The patients can then be treated accordingly by performing tests for the causal mosquito. So, only II and III follow."
  },
  {
    id: 90,
    question: "90. Statement: Many private sector banks have reduced interest rate on housing loans in comparison to public sector banks. Courses of Action: The case should be raised before the regulatory authority for investigation by the public sector banks as they cannot follow such reduction. Public sector banks must adopt such policy to remain in competition. The public sector banks should advertise their special feature repeatedly so that they do not lose their future customers.",
    options: ["a) All follow", "b) Only I and II follow", "c) Only I and III follow", "d) Only either II or III follows", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only either II or III follows",
    solution: "Explanation: Clearly, the private sector banks have done so to attract more and more customers of public sector banks. Thus, public sector banks should either reduce the rate of interest to match with that of private sector banks or highlight those features which make them stand apart from private sector banks. So, either II or III follows."
  },
  {
    id: 91,
    question: "91. Statement: The Deputy Mayor of city Z has proposed to install a plant of mineral water and to supply citizen's mineral water bottles at Rs. 6 per litre as against Rs. 10 per litre being sold by local private companies. Courses of Action: The local private companies of city Z will have to close their operation. The Corporation of city Z will have to provide for losses in this project in its budget. The tap water schemes of city Z will have to be stopped.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: The Corporation has planned to install its plant so as to achieve cost-effective production of mineral water. Had there been a loss, it could also acquire water from private companies. So, II does not follow. Besides, the local private companies can survive by cutting costs or by extending their sales network to other cities. Thus, I does not follow. Lastly, the Corporation seeks to provide healthy drinking water to the residents. Water for general use would still be delivered through taps. Hence, III also does not follow."
  },
  {
    id: 92,
    question: "92. Statement: The meteorological department has issued a notification forecasting less rainfall during next year's monsoon. Courses of Action: The government should immediately set up a water authority for proper management of water resources. The water supply authorities should be asked to implement reduction in regular water supply to tackle the situation. The farmers should be advised to cultivate alternate crops which require less water during the coming months.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I and II follow",
    solution: "Explanation: Getting the information well in advance clearly suggests that adequate water be saved for the crisis by proper management and moderate cuts in water supply. Cultivating alternate crops may not prove viable for the farmers. So, only I and II follow."
  },
  {
    id: 93,
    question: "93. Statement: There was a spurt in criminal activities in the city during the recent festival season. Courses of Action: The police should immediately investigate into the causes of this increase. In future the police should take adequate precaution to avoid recurrence of such situation during festival. The known criminals should be arrested before any such season.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only II and III follow", "d) All follows", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only I and II follow",
    solution: "Explanation: The police ought to find out the lackenings in existing security arrangements and make up for these inadequacies to strengthen security and thus prevent criminal activities in the forthcoming festival. So, both I and II follow. Arresting the known criminals does not ensure safety, for a novice can also indulge in crime. So, III does not follow."
  },
  {
    id: 94,
    question: "94. Statement: A large number of students who have passed their XII Std. terminal examination in the country could not get admission to colleges as the number of seats available are grossly inadequate. Courses of Action: The evaluation system of XII Std. terminal examination should be made more tough so that fewer students pass the examination. The Government should encourage the private sector to open new colleges by providing them land at cheaper rate. The rich people should be asked to send their wards to foreign countries for higher studies enabling the needy students to get admission in colleges within the country.",
    options: ["a) Only I follows", "b) Only II follows", "c) Only I and II follow", "d) Only II and III follow", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, reducing the number of aspirants for admission to colleges or sending the students of well-to-do families to foreign countries for higher studies, is no proper solution. So, both I and HI do not follow. The right solution is to increase the number of colleges so as to accommodate the increasing number of admission-seekers. So, only II follows."
  },
  {
    id: 95,
    question: "95. Statement: It has been reported by one of the TV channels that the answer papers of Board examination of one State are evaluated by students studying in the same standard with the help of model answers as instructed by the examiners. Courses of Action: All such examiners should be immediately suspended from their official positions. All such papers evaluated by the students should be immediately confiscated and got evaluated by qualified teachers. The Board should explore possibilities even though they are remote, of getting the answer papers of this examination evaluated by computerised machines.",
    options: ["a) Only I follows", "b) Only II follows", "c) Only III follows", "d) Only I and II follow", "e) All follow"],
    correctIndex: 3,
    answerText: "d) Only I and II follow",
    solution: "Explanation: Students who work hard all the year round to perform well at the Board examination deserve to be evaluated correctly by experts, and not mechanically or by inexperienced people. Besides, examiners who shirk their duty of evaluating answer papers, ought to be punished. So, both I and II follow, while III does not."
  },
  {
    id: 96,
    question: "96. Statement: The condition of all the major roads in the city has deteriorated due to incessant rain during the last two months. Courses of Action: The city civic authority should deploy additional traffic staff to regulate the vehicular movement. The city civic authority should immediately make arrangements for repairs of the damaged roads. Motorists should be alerted at various places by putting up sign boards about the bad patches of the roads to enable them to plan their journey accordingly.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All follow",
    solution: "Explanation: Clearly, all the given courses of action aim at either getting the damaged roads repaired or regulating movement of traffic on, bad roads and making journey easy for all vehicle owners. So, all the courses follow."
  },
  {
    id: 97,
    question: "97. Statement: There have been quite a few incidents of highway robbery on the super expressway between/cities A and B during recent months. Courses of Action: The local administration should immediately set up police tickets along the expressway to prevent robbery. The local administration should immediately close down the expressway till the robbers are apprehended. More and more people should be given training on how to tackle with the robbers.",
    options: ["a) Only I follows", "b) Only I and II follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: Clearly, incidents of robbery can be practically averted only by tightening security arrangements and increasing vigilance by police. So, I follows. Neither II nor III follows as none of them is practically viable."
  },
  {
    id: 98,
    question: "98. Statement: The Institute has fixed for the investors a validity period of one year for transfer forms for some of its listed schemes. Courses of Action: The Institute should consult investors before fixing the duration of validity period. The investors should be duly informed about the validity period. List of schemes covered under this validity period should be communicated.",
    options: ["a) Only I and II follow", "b) Only III follows", "c) Only II and III follow", "d) Only I and III follow", "e) All follow"],
    correctIndex: 2,
    answerText: "c) Only II and III follow",
    solution: "Explanation: Clearly, it becomes essential for the Institute to communicate to the investors the details of any new policy it formulates. So, only II and III follow."
  },
  {
    id: 99,
    question: "99. Statement: The vehicular traffic has increased so much in the recent past that it takes at least two hours to travel between the city and the airport during peak hours. Courses of Action: Non-airport bound vehicles should not be allowed to ply on the road connecting the city and the airport. The load of vehicular traffic should be diverted through various link roads during peak hours. The departure and arrival of flights should be regulated so as to .avoid congestion during peak hours.",
    options: ["a) Only I follows", "b) Only II follows", "c) Only I and II follow", "d) All follow", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II follows",
    solution: "Explanation: Clearly, the schedule of flights cannot be programmed on the basis of the city's traffic conditions. So, III does not follow. The only solution of the problem seems to be to regulate traffic movement and to provide alternative routes to various destinations so as to divert the traffic off the congested roads. Thus, II follows. Besides, the convenience of both the airport and non-airport bound vehicle owners is to be taken care of. So, I does not follow."
  },
  {
    id: 100,
    question: "100. Statement: There is a considerable increase in the number of persons affected by water-borne diseases during monsoon period. Courses of Action: The question should be raised in the Legislative Assembly. The Government should disseminate adequate information regarding the pure drinking water to people. All the hospitals in the city should be equipped properly for the treatment of patients during monsoon period.",
    options: ["a) All follow", "b) Only I and II follow", "c) Only II and III follow", "d) Only I and III follow", "e) None follows"],
    correctIndex: 2,
    answerText: "c) Only II and III follow",
    solution: "Explanation: Any aspect of health has two factors to tackle with - prevention and treatment. Prevention includes creating awareness among people, and treatment includes providing adequate medical facilities. So, both II and III follow."
  },
  {
    id: 101,
    question: "101. Statement: Residents from Model Colony coming under North Ward of City X have complained to the Ward Officer that for last three days the tap water in the ward is contaminated and no action is being initiated by municipal staff. Courses of Action: The Ward Officer of North Ward should initiate action against residents who have lodged complaints against municipal staff. The Ward Officer should ask his junior officer to visit Model Colony to assess the actual condition of water with his staff and to get samples of water tested from laboratories. The Ward Officer should ask Ward Engineer to check water installations and pipelines in the Model Colony area.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) Only either I or III, and II follow", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II and III follow",
    solution: "Explanation: The residents complained to the Ward Officer regarding the negligence of duty of his subordinates. So, I does not follow. Also, it is the moral duty of the Officer to listen to the complaints, ascertain the quality of water in the colony and get all pipelines and connections checked for any damage or leak that could have opened the way for contamination of water. Thus, both II and III follow."
  },
  {
    id: 102,
    question: "102. Statement: People residing in some tribal areas are far from education. Courses of Action: Government should render all help to the NGOs to open schools there. A mass awareness programme must be initiated in these areas. Social workers should be entrusted with the job of educating them.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) Only either I or III, and II follow", "e) All follow"],
    correctIndex: 0,
    answerText: "a) Only I and II follow",
    solution: "Explanation: Clearly, people in tribal areas ought to be made aware of the need of education and persuaded to send children to schools. But at the same time proper facilities to render education must also be available. So, both I and II follow. However, education by social workers shall be a temporary remedy. Thus, III does not follow."
  },
  {
    id: 103,
    question: "103. Statement: The exodus from villages to cities is detrimental to both. Courses of Action: Rural postings must be made mandatory. There should be fewer trains linking cities to smaller places. Employment generation scheme should be launched in rural areas.",
    options: ["a) Only II follows", "b) Only I and II follow", "c) Only III follows", "d) Only II and III follow"],
    correctIndex: 2,
    answerText: "c) Only III follows",
    solution: "Explanation: Clearly, the exodus cannot be stopped by reducing the number of trains. So, II does not follow. The exodus occurs primarily due to better employment opportunities and facilities in the cities. Hence, it can be prevented not by compulsion but by making conditions favourable for those residing in villages. So, I does not follow while III follows."
  },
  {
    id: 104,
    question: "104. Statement: Major part of the rabi crop in the district is damaged due to unseasonal heavy rains during the last few days. Courses of Action: The government should grant relief to the affected farmers to compensate their loss. The government should provide free seed and fertilizer to the farmers for the kharif season. The government should waive all the loans taken for the rabi crop by the affected farmers.",
    options: ["a) Only I and II follow", "b) Only II follows", "c) Only II and III follow", "d) Only III follows", "e) All follow"],
    correctIndex: 4,
    answerText: "e) All follow",
    solution: "Explanation: The crisis clearly demands extending as much relief to farmers as possible. So, all I, II and III follow."
  },
  {
    id: 105,
    question: "105. Statement: Large number of people have become critically ill after consuming spurious liquor from a local shop. Courses of Action: I. The Government should immediately close down all the shops selling liquor till the stocks are tested for presence of toxicity. II. The owner of the liquor shop should be asked to leave the town and open a shop elsewhere. III. The owner of the liquor shop should immediately be arrested and tried for criminal negligence.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only III follows", "d) Only I and III follow", "e) All follow"],
    correctIndex: 3,
    answerText: "d) Only I and III follow",
    solution: "Explanation: Clearly, the owner of the shop should be punished for selling spurious liquor. Further, attempts should be made to unearth other such unscrupulous liquor sellers by conducting raids and testing samples collected from different shops. So, both II and III follow. However, sending the liquor shop owner to another place may create a problem elsewhere also. So, II does not follow."
  },
  {
    id: 106,
    question: "106. Statement: Every year thousands of eligible students do not get admission in colleges both in urban and rural areas after passing their school leaving certificate examination. Courses of Action: More colleges should be set up in both urban and rural areas. The number of schools in both urban and rural areas should be reduced. More schools should offer vocational courses to equip students for taking up their vocation after completing their school education.",
    options: ["a) Only I follows", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only I and III follow",
    solution: "Explanation: The solution to the problem lies in accommodating the increasing number of students passing out from schools. So, only I and III follow."
  },
  {
    id: 107,
    question: "107. Statement: According to the officials, paucity of funds with the organisation has led to the pathetic condition of this brilliant architectural structure. Courses of Action: Anew architectural structure for the building should be designed. The reasons for the poor condition of the structure should be found out. Grant should be given to improve the condition of the structure.",
    options: ["a) Only I follows", "b) Only II follows", "c) Only III follows", "d) Only II and III follow", "e) Only I and III follow"],
    correctIndex: 2,
    answerText: "c) Only III follows",
    solution: "Explanation: The statement asserts that the structure was originally a 'brilliant' one. So, there is no need of a new architectural design, as mentioned in I. Also, it is given that paucity of funds is responsible for the dilapidated condition of the structure. Thus, only III follows while II doesn't."
  },
  {
    id: 108,
    question: "108. Statement: Nuclear power cannot make a country secure. Courses of Action: We must stop further expenses on increasing our nuclear power. We must destroy our nuclear capability. We must concentrate on improving our diplomatic relations.",
    options: ["a) Only I follows", "b) Only II follows", "c) Only III follows", "d) Only I and III follow"],
    correctIndex: 2,
    answerText: "c) Only III follows",
    solution: "Explanation: The statement asserts that increasing defensive power does not ensure the safety of a country. It is equally important to maintain good relations with other countries as well. But this does not imply that the country should stop concentrating on increasing defensive power or destroy the existing power. Thus, only III follows."
  },
  {
    id: 109,
    question: "109. Statement: There has been an unprecedented increase in use of malpractices by the students during various examinations held in the country this year. Courses of Action: All the concerned authorities conducting these examinations should immediately take effective measures to curb this menace. All those students who are detected to have used unfair means should be debarred from appearing in any of these examinations for the next three years. Using unfair means should immediately be made cognizable offence by passing necessary legislations.",
    options: ["a) Only I follows", "b) Only I and II follow", "c) Only II and III follow", "d) Only I and III follow", "e) All follow"],
    correctIndex: 1,
    answerText: "b) Only I and II follow",
    solution: "Explanation: Use of malpractices does away with the basic essence of examinations and hence it ought to be checked. So, I follows. Also, the fear of harsh punishments would prevent students from using unfair means. So, II also follows. But declaring it a crime may spoil the career of students who are caught using unfair means. So, III does not follow."
  },
  {
    id: 110,
    question: "110. Statement: In one of the worst accidents in railway level crossing, fifty people died when a bus carrying them collided on to a running train. Courses of Action: The train driver should immediately be suspended. The driver of the bus should be tried in court for negligence on his part. The railway authority should be asked to man all its level crossings.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only III follows", "d) Only II and III follow", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only III follows",
    solution: "Explanation: The problem discussed in the statement is not regarding the current accident, but to do something to avert such mishaps. Accidents at railway crossings can be averted by deploying men to regulate traffic and installing barriers to check traffic movement when a train passes by. So, only III follows."
  },
  {
    id: 111,
    question: "111. Statement: A mass mortality of shrimps in ponds on entire Andhra coast has recently been reported due to the presence of a virus. Courses of Action: The water of the ponds affected should immediately be treated for identifying the nature of the virus. The catching of shrimps from the ponds should temporarily be stopped. The fishermen should be asked to watch for the onset of such phenomenon in nature.",
    options: ["a) Only I follows", "b) Only I and II follow", "c) All follow", "d) Only II and III follow", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I follows",
    solution: "Explanation: The urgent need is to identify the causative virus and then treat the pond water accordingly to eliminate them. So, only I follows."
  },
  {
    id: 112,
    question: "112. Statement: Drinking water supply to New Bombay has been suspended till further orders from Maharashtra Pollution Control Board following pollution of Patalganga river, caused by discharge of effluents from some chemical industries. Courses of Action: The industries responsible for discharging effluents into the river should be asked to close down immediately. The river water should immediately be treated chemically before resuming supply. The Pollution Control Board should check the nature of effluents being discharged into the river by industries at regular intervals.",
    options: ["a) Only I follows", "b) Only II and III follow", "c) Only III follows", "d) All follow", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II and III follow",
    solution: "Explanation: The situation demands checking the nature of effluents being discharged into the river and treating the water accordingly to make it fit for drinking. So, both II and III follow. Further, the industries discharging effluents into the river should be warned not to do so and asked to install proper waste treatment and disposal systems, rather than be closed down. Thus, I does not follow."
  },
  {
    id: 113,
    question: "113. Statement: The Management of School M has decided to give free breakfast from next academic year to all the students in its primary section through its canteen even though they will not get any government grant. Courses of Action: The school will have to admit many poor students who will seek admission for the next academic year. The canteen facilities and utensils have to be checked and new purchases to be made to equip it properly. Funds will have to be raised to support the scheme for years to come.",
    options: ["a) Only I follows", "b) Only either I or II follows", "c) Only II and III follow", "d) All follow", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only II and III follow",
    solution: "Explanation: Since the school has introduced the scheme without receiving any grant, it needs to pool up the funds and make adequate arrangements to keep the scheme going. So, only II and III follow."
  },
  {
    id: 114,
    question: "114. Statement: The day time temperatures in this summer have been four to five degree Celsius above the normal temperature across the country. Courses of Action: All the district headquarters should be alerted to send prompt reports of death due to heat waves in their jurisdiction. The Government machinery should be put on high alert and provided with necessary equipments to prevent any untoward incident. The Government should make necessary arrangements to provide drinking water in all the areas affected due to extreme heat waves.",
    options: ["a) Only I follows", "b) Only I and II follow", "c) All follow", "d) Only III follows", "e) Only II and III follow"],
    correctIndex: 4,
    answerText: "e) Only II and III follow",
    solution: "Explanation: The situation demands extending as much help and relief as possible, to the common people, thus making it easy for them to cope up with extreme hot weather. So, only II and III follow."
  },
  {
    id: 115,
    question: "115. Statement: The meteorological department has reported that a severe storm is likely to hit the city during the next forty-eight hours. Courses of Action: The administration should advise all the business and educational establishments to close down for two days. The administration should not make the information public as it could create panic among the residents of the city. The administration should activate its disaster management program to tackle any possible emergency situation.",
    options: ["a) Only I and II follow", "b) Only III follows", "c) Only II and III follow", "d) Only I and III follow", "e) All follow"],
    correctIndex: 3,
    answerText: "d) Only I and III follow",
    solution: "Explanation: The administration should strive to prevent the residents of the city from the ensuing danger. This can be done by persuading residents to stay indoors and putting emergency relief operation mechanism to work. Thus, both I and III follow. Further, the storm is likely to play havoc with the lives of general public if it comes as a surprise to them. So, II does not follow."
  },
  {
    id: 116,
    question: "116. Statement: In the city, over 75 percent of the people are living in slums and sub-standard houses which is a reflection on the housing and urban development policies of the Government. Courses of Action: I. There should be a separate department looking after housing and urban development. II. The policies in regard to urban housing should be reviewed. III. The policies regarding rural housing should also be reviewed so that such problems could be avoided in rural areas.",
    options: ["a) Only I follows", "b) Only I and II follow", "c) Only II follows", "d) Either II or III follows", "e) Only II and III follow"],
    correctIndex: 1,
    answerText: "b) Only I and II follow",
    solution: "Explanation: The statement talks of housing conditions in urban areas only. So, III does not follow. Also, to improve the deteriorating housing conditions, the urban housing policies need to be studied and the lackenings removed by a team of efficient personnel deployed for the same. So, both I and II follow."
  },
  {
    id: 117,
    question: "117. Statement: It is estimated that about twenty lakh people will visit the city during the ensuing festival. Courses of Action: The civic authority should monitor the crowd and restrict entry of the people beyond a manageable number. The local police authority should be put on high alert to maintain law and order during the festival. All the hospitals in the city should be put on high alert in case of any eventuality.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II and III follow",
    solution: "Explanation: Clearly, people cannot be deprived of enjoying the festival for lack of arrangements. Also, it becomes necessary to deploy police to regulate big crowds and avert any mishap in public gatherings. Further, it costs nothing but might prove useful to put hospitals on alert to be ready to provide quick medical aid to patients in case of any eventuality. So, both II and III follow."
  },
  {
    id: 118,
    question: "118. Statement: The Company X has rejected first lot of values supplied by Company A and has cancelled its entire huge order quoting use of inferior quality material and poor craftsmanship. Courses of Action: The Company A needs to investigate functioning of its purchase, production and quality control departments. The Company A should inspect all the valves rejected by Company X. The Company A should inform Company X that steps have been taken for improvement and renegotiate schedule of supply.",
    options: ["a) Only I and II follow", "b) Only II follows", "c) II, and either I or III follow", "d) All I, II and III follow", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I and II follow",
    solution: "Explanation: First of all, company A should inspect the rejected valves to ensure if they are really sub-standard. If yes, it should scrutinise its working thoroughly and remove its lackenings, be it in the quality of raw material or craftsmanship. So, both I and II follow. III seems to be a far-off action which can be implemented only after the first two steps are put into practice. Thus, III does not follow,"
  },
];

export const STATEMENT_AND_CONCLUSION_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Statements: In a one day cricket match, the total runs made by a team were 200. Out of these 160 runs were made by spinners. Conclusions: 80% of the team consists of spinners. The opening batsmen were spinners.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: According to the statement, 80% of the total runs were made by spinners. So, I does not follow. Nothing about the opening batsmen is mentioned in the statement. So, II also does not follow."
  },
  {
    id: 2,
    question: "2. Statements: The old order changed yielding place to new. Conclusions: Change is the law of nature. Discard old ideas because they are old.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Clearly, I directly follows from the given statement. Also, it is mentioned that old ideas are replaced by new ones, as thinking changes with the progressing time. So, II does not follow."
  },
  {
    id: 3,
    question: "3. Statements: Government has spoiled many top ranking financial institutions by appointing bureaucrats as Directors of these institutions. Conclusions: Government should appoint Directors of the financial institutes taking into consideration the expertise of the person in the area of finance. The Director of the financial institute should have expertise commensurate with the financial work carried out by the institute.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: According to the statement, Government has spoiled financial institutions by appointing bureaucrats as Directors. This means that only those persons should be appointed as Directors who are experts in finance and are acquainted with the financial work of the institute. So, both I and II follow."
  },
  {
    id: 4,
    question: "4. Statements: Population increase coupled with depleting resources is going to be the scenario of many developing countries in days to come. Conclusions: The population of developing countries will not continue to increase in future. It will be very difficult for the governments of developing countries to provide its people decent quality of life.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The fact given in I is quite contrary to the given statement. So, I does not follow. II mentions the direct implications of the state discussed in the statement. Thus, II follows."
  },
  {
    id: 5,
    question: "5. Statements: Prime age school-going children in urban India have now become avid as well as more regular viewers of television, even in households without a TV. As a result there has been an alarming decline in the extent of readership of newspapers. Conclusions: Method of increasing the readership of newspapers should be devised. A team of experts should be sent to other countries to study the impact of TV. on the readership of newspapers.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The statement concentrates on the increasing viewership of TV. and does not stress either on increasing the readership of newspapers or making studies regarding the same. So, neither I nor II follows."
  },
  {
    id: 6,
    question: "6. Statements: In Japan, the incidence of stomach cancer is very high, while that of bowel cancer is very low. But Japanese immigrate to Hawaii, this is reversed - the rate of bowel cancer increases but the rate of stomach cancer is reduced in the next generation. All this is related to nutrition - the diets of Japanese in Hawaii are different than those in Japan. Conclusions: The same diet as in Hawaii should be propagated in Japan also. Bowel cancer is less severe than stomach cancer.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The statement neither propagates the diet of any of the countries nor compares the two types of cancer. So, neither I nor II follows."
  },
  {
    id: 7,
    question: "7. Statements: The Government run company had asked its employees to declare their income and assets but it has been strongly resisted by employees union and no employee is going to declare his income. Conclusions: The employees of this company do not seem to have any additional undisclosed income besides their salary. The employees union wants all senior officers to declare their income first.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Nothing about the details of the employees' income or the cause of their refusal to declare their income and assets, can be deduced from the given statement. So, neither I nor II follows."
  },
  {
    id: 8,
    question: "8. Statements: Monitoring has become an integral part in the planning of social development programmes. It is recommended that Management Information System be developed for all programmes. This is likely to give a feedback on the performance of the functionaries and the efficacy with which services are being delivered. Conclusions: All the social development programmes should be evaluated. There is a need to monitor the performance of workers.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: According to the statement, monitoring and evaluation of social development programmes - their function, performance and efficiency - is absolutely essential. So, both I and II follow."
  },
  {
    id: 9,
    question: "9. Statements: The T.V. programmes, telecast specially for women are packed with a variety of recipes and household hints. A major portion of magazines for women also contains the items mentioned above. Conclusions: Women are not interested in other things. An average woman's primary interest lies in home and specially in the kitchen.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Clearly, nothing about 'other things' is mentioned in the statement. So, I does not follow, Also, since it is mentioned that programmes and magazines for women are stuffed with kitchen recipes and other household hints, it means that women have special interest in these areas. So, II follows."
  },
  {
    id: 10,
    question: "10. Statements: The distance of 900 km by road between Bombay and Jafra will be reduced to 280 km by sea. This will lead to a saving of Rs. 7.92 crores per annum on fuel. Conclusions: Transportation by sea is cheaper than that by road. Fuel must be saved to the greatest extent",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: According to the statement, sea transport is cheaper than road transport in the case of route from Bombay to Jafra, not in all the cases. So, conclusion I does not follow. The statement stresses on the saving of fuel. So, conclusion II follows."
  },
  {
    id: 11,
    question: "11. Statements: The manager humiliated Sachin in the presence of his colleagues. Conclusions: The manager did not like Sachin. Sachin was not popular with his colleagues.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The manager might have humiliated Sachin not because of his dislike but on account of certain negligence or mistake on his part. So, I does not follow. Also, nothing about Sachin's rapport with his colleagues can be deduced from the statement. So, II also does not follow."
  },
  {
    id: 12,
    question: "12. Statements: Women's organisations in India have welcomed the amendment of the Industrial Employment Rules 1946 to curb sexual harassment at the work place. Conclusions: Sexual harassment of women at work place is more prevalent in India as compared to other developed countries. Many organisations in India will stop recruiting women to avoid such problems.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The fact that a certain rule has been more welcomed in a certain country does not imply that the problem is more prevalent there. So, I does not follow. Also, the amendment seeks to discourage only sexual harassment of women and shall in no way discourage employment of women. So, II also does not follow."
  },
  {
    id: 13,
    question: "13. Statements: Nation X faced growing international opposition for its decision to explode eight nuclear weapons at its test site. Conclusions: The citizens of the nation favoured the decision. Some powerful countries do not want other nations to become as powerful as they are.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Neither the citizens response to the decision nor the reason for opposition by other nations can be deduced from the statement. So, neither I nor II follows."
  },
  {
    id: 14,
    question: "14. Statements: In a highly centralised power structure, in which even senior cabinet ministers are prepared to reduce themselves to pathetic countries or yesmen airing views that are primarily intended to anticipate or reflect the Prime Minister's own performances, there can be no place for any consensus that is quite different from real or contrived unanimity of opinion, expressed through a well orchestrated endorsement of the leader's actions. Conclusions: The Ministers play safe by not giving anti-government views. The Prime Minister does not encourage his colleagues to render their own views.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: According to the statement, even senior cabinet ministers are always ready to conform to the Prime Minister's views. So, I follows. However, II contradicts the given statement and so does not follow."
  },
  {
    id: 15,
    question: "15. Statements: National Aluminium Company has moved India from a position of shortage to self-sufficiency in the metal. Conclusions: Previously, India had to import aluminium. With this speed, it can soon become a foreign exchange earner.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: According to the statement, National Aluminium Company has moved India from a position of shortage in the past to self-sufficiency in the present. This means that previously, India had to import aluminium. So, I follows. Also, it can be deduced that if production increases at the same rate, India can export it in future. So, II also follows."
  },
  {
    id: 16,
    question: "16. Statements: Jade plant has thick leaves and it requires little water. Conclusions: All plants with thick leaves require little water. Jade plants may be grown in places where water is not in abundance.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The statement talks of jade plants only and not 'all plants with thick leaves'. So, I does not follow. Also, since jade plants require little water, so they can be grown in places where water is not in abundance. So, II follows."
  },
  {
    id: 17,
    question: "17. Statements: Use \"Kraft\" colours. They add colour to our life. - An advertisement. Conclusions: Catchy slogans do not attract people. People like dark colours.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The slogan given in the statement is definitely a catchy one which indicates that catchy slogans do attract people. So, I does not follow. Nothing about people's preference for colours can be deduced from the statement. Thus, II also does not follow."
  },
  {
    id: 18,
    question: "18. Statements: All those political prisoners were released on bail who had gone to jail for reasons other than political dharnas. Bail was not granted to persons involved in murders. Conclusions: No political - prisoner had committed murder. Some politicians were not arrested.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: According to the statement, the political prisoners can be divided into two groups - those who were released and those who were put in jail for political dharnas. However, no person involved in murder was released. This means that no political prisoner had committed murder. So, I follows. Clearly, II is not directly related to the statement and does not follow."
  },
  {
    id: 19,
    question: "19. Statements: Modern man influences his destiny by the choice he makes unlike in the past. Conclusions: Earlier there were fewer options available to man. There was no desire in the past to influence the destiny.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Clearly, I directly follows from the statement while II cannot be deduced from it."
  },
  {
    id: 20,
    question: "20. Statements: Water supply in wards A and B of the city will be affected by about 50% on Friday because repairing work of the main lines is to be carried out. Conclusions: The residents in these wards should economise on water on Friday. The residents in these wards should store some water on the previous day.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, the information has been given beforehand so that the residents can collect water on the previous day and use less water on Friday. So, both I and II follow."
  },
  {
    id: 21,
    question: "21. Statements: People who speak too much against dowry are those who had taken it themselves. Conclusions: It is easier said than done. People have double standards.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The statement clearly implies that it is easier to say than to do something and what people say is different from what they do. So, both I and II follow."
  },
  {
    id: 22,
    question: "22. Statements: The national norm is 100 beds per thousand populations but in this state, 150 beds per thousand are available in the hospitals. Conclusions: Our national norm is appropriate. The state's health system is taking adequate care in this regard.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Whether the national norm is appropriate or not cannot be said. So, I does not follow. However, more number of beds per thousand population are available in the state. So, II follows."
  },
  {
    id: 23,
    question: "23. Statements: Our securities investments carry market risk. Consult your investment advisor or agent before investing. Conclusions: One should not invest in securities. The investment advisor calculates the market risk with certainty.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Investment in securities involves risk. This does not mean that one should not invest in securities. So, I does not follow. Since the statement advises one to consult investment advisor before investing, so II follows."
  },
  {
    id: 24,
    question: "24. Statements: Money plays a vital role in politics. Conclusions: The poor can never become politicians. All the rich men take part in politics.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Neither the poor nor the rich, but only the role of money in politics is being talked about in the statement. So, neither I nor II follows."
  },
  {
    id: 25,
    question: "25. Statements: Vegetable prices are soaring in the market. Conclusions: Vegetables are becoming a rare commodity. People cannot eat vegetables.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The availability of vegetables is not mentioned in the given statement. So, I does not follow Also, II is not directly related to the statement and so it also does not follow."
  },
  {
    id: 26,
    question: "26. Statements: The serious accident in which a person was run down by a car yesterday had again focused attention on the most unsatisfactory state of roads. Conclusions: The accident that occurred was fatal. Several accidents have so far taken place because of unsatisfactory state of roads.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Since the accident has caused concern, it must be fatal. So, I follows. The use of the word 'again' in the statement justifies the fact mentioned in II. So, II also follows."
  },
  {
    id: 27,
    question: "27. Statements: In a recent survey report, it has been stated that those who undertake physical exercise for at least half an hour a day are less prone to have any heart ailments. Conclusions: Moderate level of physical exercise is necessary for leading a healthy life. All people who do desk-bound jobs definitely suffer from heart ailments.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: The statement mentions that chances of heart ailments are greatly reduced by a regular half-hour exercise. So, I follows. However, it talks of only reducing the probability which does not mean that persons involved in sedentary jobs shall definitely suffer from heart ailments. So, II does not follow."
  },
  {
    id: 28,
    question: "28. Statements: A bird in hand is worth two in the bush. Conclusions: We should be content with what we have. We should not crave for what is not.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Both the given conclusions clearly bring out the central theme of the proverb given in the statement. So, both I and II follow."
  },
  {
    id: 29,
    question: "29. Statements: This world is neither good nor evil; each man manufactures a world for himself. Conclusions: Some people find this world quite good. Some people find this world quite bad.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The statement mentions that the world for a man is as he makes it himself. So, some people might find it good and some quite bad. Thus, both I and II follow."
  },
  {
    id: 30,
    question: "30. Statements: The eligibility for admission to the course is minimum second class Master's degree. However, the candidates who have appeared for the final year examination of Master's degree can also apply. Conclusions: All candidates who have yet to get their Master's degree will be there in the list of selected candidates. All candidates having obtained second class Master's degree will be there in the list of selected candidates.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The statement mentions that the candidates who have obtained second class Master's degree or have appeared for the final year examination of Master's degree, can apply for admission. This implies that both types of candidates may be selected on certain grounds. Thus, some candidates of each type and not all candidates of any one type, may be selected. So, neither I nor II follows."
  },
  {
    id: 31,
    question: "31. Statements: Any student who does not behave properly while in the school brings bad name to himself and also for the school. Conclusions: Such student should be removed from the school. Stricter discipline does not improve behaviour of the students.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Clearly, I cannot be deduced from the statement. Also, nothing about discipline is mentioned in the statement. So, neither I nor II follows."
  },
  {
    id: 32,
    question: "32. Statements: A Corporate General Manager asked four managers to either submit their resignations by the next day or face termination orders from service. Three of them had submitted their resignations by that evening. Conclusions: The next day, the remaining manager would also resign. The General Manager would terminate his services the next day.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: It is mentioned in the statement that either the managers should resign by the next day or their services would be terminated. So, either I or II follows."
  },
  {
    id: 33,
    question: "33. Statements: Only good singers are invited in the conference. No one without sweet voice is a good singer. Conclusions: All invited singers in the conference have sweet voice. Those singers who do not have sweet voice are not invited in the conference.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The statement asserts that a good singer always has a sweet voice and only good singers are invited in the conference. This implies that all those invited in the conference have sweet voice and those who do not have sweet voice are not invited. So, both I and II follow."
  },
  {
    id: 34,
    question: "34. Statements: To cultivate interest in reading, the school has made it compulsory from June this year for each student to read two books per week and submit a weekly report on the books. Conclusions: Interest in reading can be created by force. Some students will eventually develop interest in reading.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Clearly, the new scheme intends to develop interest in reading by incorporating the habit in their routine. So, only II follows while I does not."
  },
  {
    id: 35,
    question: "35. Statements: Applications of applicants who do no fulfil eligibility criteria and/or who do not submit applications before last date will be summarily rejected and will not be called for the written test. Conclusions: Those who are called for the written test are those who fulfil eligibility criteria and have submitted their applications before last date. Written test will be held only after scrutiny of applications.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The statement clearly mentions that fulfilling the eligibility criteria and submitting the application before the stipulated date are both essential to avoid rejection. So, I follows. Also, since it is given that the candidates whose applications are rejected shall not be called for written test, so II also follows."
  },
  {
    id: 36,
    question: "36. Statements: Recent trends also indicate that the number of child migrants in large cities is increasing. These children leave their families to join the ranks of urban poor doing odd jobs in markets, workshops, hotels or in service sectors. Conclusions: Migration to big cities should be checked. The plight of poor children should be thoroughly studied.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The statement mentions the problem of increased migration of children to cities. But the ways to deal with the problem cannot be deduced from it. So, neither I nor II follows."
  },
  {
    id: 37,
    question: "37. Statements: No country is absolutely self-dependent these days. Conclusions: It is impossible to grow and produce all that a country needs. Countrymen in general have become lazy.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Clearly, only I provides a suitable explanation to the given statement. So, only I follows."
  },
  {
    id: 38,
    question: "38. Statements: The percentage of the national income shared by the top 10 per cent of households in India is 35. Conclusions: When an economy grows fast, concentration of wealth in certain pockets of population takes place. The national income is unevenly distributed in India.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Nothing about the growth of economy is mentioned in the statement. So, I does not follow. Also, it is given that 35 per cent of national income is shared by 10 per cent of households. This indicates unequal distribution. So, II follows."
  },
  {
    id: 39,
    question: "39. Statements: Players who break various records in a fair way get special prizes. Player X broke the world record but was found to be under the influence of a prohibited drug. Conclusions: X will get the special prize. X will not get the special prize.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Clearly, X will not get the special prize because although he broke the world record, he was found to use unfair means. So, II follows while I does not."
  },
  {
    id: 40,
    question: "40. Statements: Company X has marketed the product. Go ahead; purchase it if price and quality are your considerations. Conclusions: The product must be good in quality. The price of the product must be reasonable.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: It is mentioned in the statement that one who considers price and quality before buying a product should buy the product of company X. So, both I and II follow."
  },
  {
    id: 41,
    question: "41. Statements: Quality has a price tag. India is allocating lots of funds to education. Conclusions: Quality of education in India would improve soon. Funding alone can enhance quality of education.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: According to the statement, funding is necessary to improve quality and India is allocating funds to education. This means that quality of education will improve in India. So, I follows. But funding alone is sufficient to enhance quality, is not true. So, II does not follow."
  },
  {
    id: 42,
    question: "42. Statements: Although we have rating agencies like Crisil, ICRA, there is demand to have a separate rating agency for IT companies to protect investors. Conclusions: Assessment of financial worth of IT companies calls for separate set of skills, insight and competencies. Now the investors investing in IT companies will get protection of their investment.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: The need for separate rating agency for IT companies clearly indicates that such assessment requires a separate set of skills. So, I follows. However, the statement indicates only the need or demand and neither the future course of action nor its after-effects can be judged. So, II does not follow."
  },
  {
    id: 43,
    question: "43. Statements: The standard of education in private schools is much better than Municipal and Zila Parishad-run schools. Conclusions: The Municipal and Zila Pariskad should make serious efforts to improve standard of their schools. All Municipal and Zila Parishad schools should be closed immediately.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Clearly, the solution to the problem is not to close down the Municipal and Zila Parishad-run schools but to strive to improve the standard of education of these schools. So, only I follows while II does not."
  },
  {
    id: 44,
    question: "44. Statements: All the organised persons find time for rest. Sunita, in spite of her very busy schedule, finds time for rest. Conclusions: Sunita is an organised person. Sunita is an industrious person.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Sunita has a very busy schedule. This means that she is industrious. But still she finds time for rest. This means that she is an organised person. So, both I and II follow."
  },
  {
    id: 45,
    question: "45. Statements: Domestic demand has been increasing faster than the production of indigenous crude oil. Conclusions: Crude oil must be imported. Domestic demand should be reduced.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: The statement mentions that demand for oil is increasing faster than the production. So, either the demand must be reduced or oil must be imported to cope with the increasing demand. Thus, either I or II follows."
  },
  {
    id: 46,
    question: "46. Statements: He stressed the need to stop the present examination system and its replacement by other methods which would measure the real merit of the students. Conclusions: Examinations should be abolished. The present examination system does not measure the real merit of the students.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The statement stresses the need to adopt a new method of examination. So, I does not follow. However, II directly follows from the given statement."
  },
  {
    id: 47,
    question: "47. Statements: Fashion is a form of ugliness so intolerable that we have to alter it every six months. Conclusions: Fashion designers do not understand the public mind very well. The public by and large is highly susceptible to novelty.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The statement asserts that people cannot stand any particular trend for long and seek change quite often. So, only II follows."
  },
  {
    id: 48,
    question: "48. Statements: Until our country achieves economic equality, political freedom and democracy would be meaningless. Conclusions: Political freedom and democracy go hand in hand. Economic equality leads to real political freedom and democracy.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Nothing about the relation between political freedom and democracy is mentioned in the statement. So, I does not follow. But II directly follows from the given statement."
  },
  {
    id: 49,
    question: "49. Soldiers serve their country.",
    options: ["a) Men generally serve their country.", "b) Those who serve their country are soldiers.", "c) Some men who are soldiers serve their country.", "d) Women do not serve their country because they are not soldiers."],
    correctIndex: 2,
    answerText: "c) Some men who are soldiers serve their country.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 50,
    question: "50. A factory worker has five children. No one else in the factory has five children.",
    options: ["a) All workers in the factory have five children each.", "b) Everybody in the factory has children.", "c) Some of the factory workers have more than five children.", "d) Only one worker in the factory has exactly five children."],
    correctIndex: 3,
    answerText: "d) Only one worker in the factory has exactly five children.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 51,
    question: "51. Television convinces viewers that the likelihood of their becoming the victim of a violent crime is extremely high; at the same time by its very nature, TV persuades viewers to passively accept whatever happens to them.",
    options: ["a) TV viewing promotes criminal behaviour.", "b) TV viewers are most likely to be victimized than others.", "c) People should not watch TV.", "d) TV promotes a feeling of helpless vulnerability in viewers."],
    correctIndex: 3,
    answerText: "d) TV promotes a feeling of helpless vulnerability in viewers.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 52,
    question: "52. A forest has as many sandal trees as it has Ashoka trees. Three-fourth of the trees are old ones and half of the trees are at the flowering stage.",
    options: ["a) All Ashoka trees are at the flowering stage.", "b) All sandal trees are at the flowering stage.", "c) At least one-half of the Ashoka trees are old.", "d) One-half of the sandal trees are at the flowering stage.", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 53,
    question: "53. The government is soon going to introduce a bill which would permit the instituting of private universities under very strict directions.",
    options: ["a) We have some private universities in our country even now.", "b) The demand for more universities is being stepped up.", "c) Such directions can also be issued without informing the Parliament.", "d) The government gives directions to establish anything in private sector.", "e) Unless and until the directions are given, the private universities can charge exorbitant fees."],
    correctIndex: 1,
    answerText: "b) The demand for more universities is being stepped up.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 54,
    question: "54. All that glitters is not gold.",
    options: ["a) Non-metals also glitter.", "b) Only gold glitters.", "c) Not all metals glitter.", "d) Glittering things may be deceptive."],
    correctIndex: 3,
    answerText: "d) Glittering things may be deceptive.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 55,
    question: "55. Most dresses in that shop are expensive.",
    options: ["a) There are no cheap dresses available in that shop.", "b) Handloom dresses in that shop are cheap.", "c) There are cheap dresses also in that shop.", "d) Some dresses in that shop are expensive."],
    correctIndex: 2,
    answerText: "c) There are cheap dresses also in that shop.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 56,
    question: "56. Many business offices are located in buildings having two to eight floors. If a building has more than three floors, it has a lift.",
    options: ["a) All floors may be reached by lifts.", "b) Only floors above the third floor have lifts.", "c) Seventh floors have lifts.", "d) Second floors do not have lifts."],
    correctIndex: 2,
    answerText: "c) Seventh floors have lifts.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 57,
    question: "57. Every library has books.",
    options: ["a) Books are only in library.", "b) Libraries are meant for books only.", "c) No library is without books.", "d) Some libraries do not have readers."],
    correctIndex: 2,
    answerText: "c) No library is without books.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 58,
    question: "58. In a class, three-fourth of the boys play football, one-half play cricket, one-fourth of those who play cricket do not play football.",
    options: ["a) Two-third of the boys play only football.", "b) One-fourth of the boys play neither cricket nor football.", "c) One-third of the boys play neither cricket nor football.", "d) One-eighth of the boys play neither cricket nor football.", "e) Two-fifth of the boys play only football."],
    correctIndex: 3,
    answerText: "d) One-eighth of the boys play neither cricket nor football.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 59,
    question: "59. Every man should have his identity card with him. That card should mention his blood group, complete address and telephone number for contact, in case, some serious accident takes place.",
    options: ["a) Blood cannot be transfused until its group is mentioned in the card.", "b) The police needs this information especially when the accident is fatal.", "c) In case of emergency, he may forget his address and may need the card to contact his house.", "d) None is supposed to forget his phone number under any circumstances.", "e) When the seriously injured person is helpless to tell his blood group, this information would suffice to indicate the required blood group."],
    correctIndex: 3,
    answerText: "d) None is supposed to forget his phone number under any circumstances.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 60,
    question: "60. In this company, 60 per cent of the employees are males, 40 per cent are females, 80 per cent of the employees are sincere and 40 per cent of the employees are from this city - Rawalpura.",
    options: ["a) All male employees are from out station.", "b) All male employees are sincere.", "c) 20 per cent of female employees are not sincere.", "d) All female employees are from Rawalpura.", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 61,
    question: "61. All beggars are poor.",
    options: ["a) If A is a beggar, then A is not rich.", "b) If A is not rich, then A is not a beggar.", "c) All those who are poor are beggars.", "d) If A is rich, then A is not a beggar."],
    correctIndex: 3,
    answerText: "d) If A is rich, then A is not a beggar.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 62,
    question: "62. This book can help because all good books help.",
    options: ["a) This is not a good book.", "b) This is a good book.", "c) No good book helps.", "d) Some good books help."],
    correctIndex: 1,
    answerText: "b) This is a good book.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 63,
    question: "63. Hitesh told Mohit a ghost lived by the peepal tree on the outskirts of the village.",
    options: ["a) Peepal trees grow on the outskirts of the village.", "b) Ghosts live on peepal trees.", "c) Hitesh perhaps believed in the stories of ghosts.", "d) Mohit must be afraid of ghosts."],
    correctIndex: 3,
    answerText: "d) Mohit must be afraid of ghosts.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 64,
    question: "64. To pass the examination, one must work hard.",
    options: ["a) Examination is related with hard work.", "b) All those who work hard, pass.", "c) Examination causes some anxiety and those who work hard overcome it.", "d) Without hard work, one does not pass.", "e) Hard-working person is a satisfied person."],
    correctIndex: 3,
    answerText: "d) Without hard work, one does not pass.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 65,
    question: "65. The data given by the U.S. Labour Ministry indicate that till the year 2000, there will be a shortage of 1,00,000 programmers. A spokesman from the industry said, \"We should understand this thoroughly America needs Indian programmers. This is not only the question of investment but also of the talent with which the Indian programmers are equipped\".",
    options: ["a) In other sectors also, there will be shortage of the talented labour till the year 2000.", "b) Indian programmers are the most talented in the world.", "c) Indian programmers are available on comparatively less salary in comparison to the programmers from other countries.", "d) In spite of entering with huge capital in the Software Training, U.S. could not be able to meet its own needs fully.", "e) The Indian software market is well equipped to send programmes to other countries."],
    correctIndex: 3,
    answerText: "d) In spite of entering with huge capital in the Software Training, U.S. could not be able to meet its own needs fully.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 66,
    question: "66. All the books, written by Prabhakar, are textbooks. Some of his books are published by ABC Publishing Company.",
    options: ["a) ABC Publishing Company publishes textbooks only.", "b) Some textbooks written by Prabhakar are published by publishers other than ABC Publishing Company.", "c) ABC Publishing Company publishes some critical essays written by Prabhakar.", "d) All the books published by ABC Publishing Company have been written by Prabhakar."],
    correctIndex: 1,
    answerText: "b) Some textbooks written by Prabhakar are published by publishers other than ABC Publishing Company.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 67,
    question: "67. All students in my class are bright. Manish is not bright.",
    options: ["a) Some students are not bright.", "b) Manish must work hard.", "c) Non-bright ones are not students.", "d) Manish is not a student of my class."],
    correctIndex: 3,
    answerText: "d) Manish is not a student of my class.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 68,
    question: "68. During the Puja days', people visit those houses where 'puja' is performed. They make it a point to go even if they are not invited. Manmohan visited the house of Keshav, his office colleague, during 'puja days'.",
    options: ["a) Keshav had invited Manmohan for some other function.", "b) Manmohan, being a religious man, went to Keshav's house uninvited.", "c) In Keshav's house, 'puja' was performed.", "d) Manmohan was invited by Keshav."],
    correctIndex: 3,
    answerText: "d) Manmohan was invited by Keshav.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 69,
    question: "69. All guilty politicians were arrested. Kishan and Chander were among those arrested.",
    options: ["a) All politicians are guilty.", "b) All arrested people are politicians.", "c) Kishan and Chander were not politicians.", "d) Kishan and Chander were guilty."],
    correctIndex: 3,
    answerText: "d) Kishan and Chander were guilty.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 70,
    question: "70. In the university examination, most of the candidates write in Hindi medium.",
    options: ["a) Some candidates of this examination write in Hindi.", "b) Mostly candidates with Hindi medium appear in this examination.", "c) In this examination no candidate writes answers in medium other than Hindi,", "d) All the candidates who appear in this examination write answers in Hindi."],
    correctIndex: 1,
    answerText: "b) Mostly candidates with Hindi medium appear in this examination.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 71,
    question: "71. Statements: The best evidence of India's glorious past is the growing popularity of Ayurvedic medicines in the West. Conclusions: Ayurvedic medicines are not popular in India. Allopathic medicines are more popular in India.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The popularity of Ayurvedic or allopathic medicines in India is not being talked about in the statement. So, neither I nor II follows."
  },
  {
    id: 72,
    question: "72. Statements: Death keeps no calendar. Conclusions: Man must die one day. Death can come at any time.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Both I and II directly follow from the statement."
  },
  {
    id: 73,
    question: "73. Statements: Wind is an inexhaustible source of energy and an aerogenerator can convert it into electricity. Though not much has been done in this field, the survey shows that there is vast potential for developing wind as alternative source of energy. Conclusions: Energy by wind is comparatively newly emerging field. The energy crisis can be dealt by exploring more in the field of aero-generation.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The phrase 'not much has been done in this field' indicates that wind energy is a comparatively newly emerging field. So, I follows. The expression 'there is vast potential for developing wind as alternative source of energy' proves II to be true."
  },
  {
    id: 74,
    question: "74. Statements: The average number of persons per household is 5 in urban areas whereas it is 7 in rural areas. The national average is 6. Conclusions: The population per unit area in the rural areas is higher than in the urban areas. More persons live in the same household in the rural areas as compared to those in the urban areas.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The population per household and not the population per unit area is being talked about in the statement. So, only II follows while I does not."
  },
  {
    id: 75,
    question: "75. Statements: The best way to escape from a problem is to solve it. Conclusions: Your life will be dull if you don't face a problem. To escape from problems, you should always have some solutions with you.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Clearly, both I and II do not follow from the given statement."
  },
  {
    id: 76,
    question: "76. Statements: Parents are prepared to pay any price for an elite education to their children. Conclusions: All parents these days are very well off. Parents have an obsessive passion for a perfect development of their children through good schooling.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The statement implies that people are inclined towards giving their children good education. So, only II follows while I does not."
  },
  {
    id: 77,
    question: "77. Statements: From the next academic year, students will have the option of dropping Mathematics and Science for their school leaving certificate examination. Conclusions: Students who are weak in Science and Mathematics will be admitted. Earlier students did not have the choice of continuing their education without taking these subjects.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Since the new system gives the students the option of dropping Science and Mathematics, so students weak in these subjects can also be admitted. So, I follows. Also, it is mentioned that the new system will come into effect from the next academic year. This means that it did not exist previously. So, II also follows."
  },
  {
    id: 78,
    question: "78. Statements: It is almost impossible to survive and prosper in this world without sacrificing ethics and morality. Conclusions: World appreciates some concepts but may not uphold it. Concept of ethics and morality are not practicable in life.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Clearly, I is vague and so does not follow. However, II directly follows from the given statement."
  },
  {
    id: 79,
    question: "79. Statements: The use of non-conventional sources of energy will eliminate the energy crisis in the world. Conclusions: Modern technology is gradually replacing the conventional sources of energy. The excessive exploitation of environment has led to depletion of conventional sources of energy.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Both I and II directly follow from the given statement."
  },
  {
    id: 80,
    question: "80. Statements: My first and foremost task is to beautify this city - if city X and Y can do it - why can't we do it. - Statement of Municipal Commissioner of city Z after taking over charge. Conclusions: The people of city Z are not aware about the present state of ugliness of their city. The present Commissioner has worked in city X and Y and has good experience of beautifying cities.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The Commissioner only cites examples of cities X and Y and undertakes to beautify city Z. This does not imply that he has worked in cities X and Y. So, I do not follow. Also, nothing about people's response to the state of the city can be deduced from the statement. Thus, II also does not follow."
  },
  {
    id: 81,
    question: "81. Statements: A man must be wise to be a good wrangler. Good wranglers are talkative and boring. Conclusions: All the wise persons are boring. All the wise persons are good wranglers.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: According to the statement, good wranglers are wise men. But it doesn't mean that all wise men are good wranglers. So, neither I nor II follows."
  },
  {
    id: 82,
    question: "82. Statements: \"The Government will review the present policy of the diesel price in view of further spurt in the international oil prices\". - A spokesman of the Government. Conclusions: The Government will increase the price of the diesel after the imminent spurt in the international oil prices. The Government will not increase the price of the diesel even after the imminent spurt in the international oil prices.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: The Government seeks to review the policy so as to determine whether the diesel price needs to be increased or it can be kept stable by adjusting certain other factors. So, either decision may be taken. Thus, either I or II follows."
  },
  {
    id: 83,
    question: "83. Statements: The Government of country X has recently announced several concessions and offered attractive package tours for foreign visitors. Conclusions: Now, more number of foreign tourists will visit the country. The Government of country X seems to be serious in attracting tourists.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, the government has taken the step to attract more tourists. So, both I and II follow."
  },
  {
    id: 84,
    question: "84. Statements: After this amendment to the Constitution, no child below the age of 14 years will be employed to work in any factory or mine or engaged in any other hazardous employment. Conclusions: Before this amendment, children below 14 years were employed to work in factory or mine. The employers must now abide by this amendment to the Constitution.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The statement mentions that after the amendment, no child below 14 years will be engaged in hazardous employment. This means that before the amendment, the practice of employing children below 14 years was in vogue. This in turn means that employers will have to abide by the amendment. So, both I and II follow."
  },
  {
    id: 85,
    question: "85. Statements: It has been decided by the Government to withdraw 33% of the subsidy on cooking gas from the beginning of next month. - A spokesman of the Government. Conclusions: People now no more desire or need such subsidy from Government as they can afford increased price of the cooking gas. The price of the cooking gas will increase at least by 33% from the next month.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The decision to withdraw subsidy has clearly been taken to compensate for the loss and not because people can now afford to pay more for cooking gas. So, I does not follow. Also, the statement talks of withdrawing 33% of the prevailing subsidy and not of reducing 33% of the actual price. So, II also does not follow."
  },
  {
    id: 86,
    question: "86. Statements: A large majority of the work force in India is unorganised. Most of them earn either the minimum or uncertain wages while others are engaged in sundry jobs. Conclusions: The workers in the organised sector get better facilities and stay longer in their jobs. Some workers in the unorganised sector of the work force have a regular and fixed income.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The workers in the organised sector are not being talked about in the statement. So, I does not follow. It is mentioned that some workers in the unorganised sector are engaged in sundry jobs. This means that they have fixed income. So, II follows."
  },
  {
    id: 87,
    question: "87. Statements: Industrial Revolution which first of all started in Europe has brought about modern age. Conclusions: Disparity between rich and poor results in revolution. Revolution overhauls society.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The cause of revolution cannot be deduced from the given statement. So, I does not follow. However, the statement mentions that Industrial Revolution brought about modern age. This means that revolution overhauls society. So, II follows."
  },
  {
    id: 88,
    question: "88. Statements: The T.V. staff deserves an applaud for showing booth capture. Conclusions: T.V. aims at showing things in their true perspective. People involved in booth capturing have been recognised and are being tried by law.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Clearly, I directly follows from the statement. However, II is not directly related to the given statement and so does not follow."
  },
  {
    id: 89,
    question: "89. Statements: America's defence secretary reiterated that they would continue to supply arms to Pakistan. Conclusions: Pakistan is incapable of manufacturing arms. It would ensure peace in the region.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Pakistan's ability to manufacture arms is not being talked about in the statement. So, I does not follow. The fact in II cannot be deduced from the given statement. So, II also does not follow."
  },
  {
    id: 90,
    question: "90. Statements: Fortune favours the brave. Conclusions: Risks are necessary for success. Cowards die many times before their death.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: According to the statement, only those who tackle situations bravely achieve success. So, I follows. However, II is vague with regard to the given statement and so does not follow."
  },
  {
    id: 91,
    question: "91. Statements: Irregularity is a cause for failure in exams. Some regular students fail in the examinations. Conclusions: All failed students are regular. All successful students are not regular.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The given statement clearly implies that all irregular and some regular students fail in the examinations. This, in turn, means that all successful students are regular but not all regular students are successful. So, neither I nor II follows."
  },
  {
    id: 92,
    question: "92. Statements: In case of outstanding candidates, the condition of previous experience of social work may be waived by the admission committee for M.A. (Social work). Conclusions: Some of the students for M.A. (Social work) will have previous experience of social work. Some of the students for M.A. (Social work) will not have previous experience of social work.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: According to the statement, previous experience is an essential condition for candidates but in case of outstanding candidates, this condition shall be waived. This means that some candidates will have previous experience while some will not. So, both I and II follow."
  },
  {
    id: 93,
    question: "93. Statements: Today out of the world population of several thousand million, the majority of men have to live under governments which refuse them personal liberty and the right to dissent. Conclusions: People are indifferent to personal liberty and the right to dissent. People desire personal liberty and the right to dissent.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: It is mentioned in the statement that most people are forced to live under Governments which refuse them personal liberty and the right to dissent. This means that they are not indifferent to these rights but have a desire for them. So, only II follows."
  },
  {
    id: 94,
    question: "94. Statements: Double your money in five months - An advertisement. Conclusions: The assurance is not genuine. People want their money to grow.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The authenticity of the given statement cannot be deduced. So, I does not follow. Since, the advertisement talks of quick returns, it implies that people want their money to grow, as an advertisement always imbibes comments and features that attract the attention of the people immediately. So, II follows."
  },
  {
    id: 95,
    question: "95. Statements: The XYZ Medical College has started a cell which will conduct counselling workshops in the field of stress management to patients and general public. Conclusions: The hospital has needed resources to start such activity. Patients and general public feel a need to have such cell in the hospital.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Since the hospital has started the activity, it must have been well-equipped for the same. So, I follows. Also, any new activity is started keeping in mind the need for it. So, II also follows."
  },
  {
    id: 96,
    question: "96. Statements: The Prime Minister emphatically stated that his government will make every possible effort for the upliftment of poor farmers and farmhands. Conclusions: Except poor farmers and farmhands, all others have got benefits of fruits of development. No serious efforts have been made in the past for upliftment of any section of the society.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: No other section of society except farmers has been talked about in the statement. So, neither I nor II follows."
  },
  {
    id: 97,
    question: "97. Statements: A neurotic is a non-stupid person who behaves stupidly. Conclusions: Neuroticism and stupidity go hand in hand. Normal persons behave intelligently.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: It is mentioned in the statement that a neurotic is a person who behaves stupidly. So, I follows. The behaviour of normal persons cannot be deduced from the given statement. So, II does not follow."
  },
  {
    id: 98,
    question: "98. Statements: We should inform all our officers not to read newspapers during office hours - Chief Manager tells. Chief Administrator. Conclusions: Reading newspapers during office hours is desirable. Office efficiency will not increase by stopping this.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since the given statement talks of an order not to let the officers read newspapers during office hours, it implies that reading newspapers during office hours is undesirable. So, I does not follow. Also, the order has been issued with an intention to prevent harm to office work due to officers' other indulgences. Thus, II also does not follow."
  },
  {
    id: 99,
    question: "99. Statements: The Cabinet of State X took certain steps to tackle the milk glut in the state as the cooperatives and government dairies failed to use the available milk. - A news report. Conclusions: The milk production of State X is more than its need. The Government and co-operative dairies in State X are not equipped in terms of resources and technology to handle such excess milk.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: The use of the term 'milk glut' makes I implicit. Also, the fact that the cooperatives and Government dairies failed to use the available milk indicates that they lack the proper infrastructure to handle such quantities of milk. So, II also follows."
  },
  {
    id: 100,
    question: "100. Statements: Video libraries are flourishing very much these days. Conclusions: People in general have got a video craze. It is much cheaper to see as many movies as one likes on videos rather than going to the cinema hall.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Since both I and II provide suitable explanations to the given statement, so both follow."
  },
  {
    id: 101,
    question: "101. Statements: Although the education system has progressed from the point of view of the number of schools, most of them are ill-equipped and have not achieved excellence in imparting education. Conclusions: In future, we should provide good teachers and equipment to these schools. We need not open any more schools in the future.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Clearly, the statement stresses the need to provide good teachers and equipment to schools. So, I follows. However, the fact that education system in India is progressing with regard to schools does not imply that no more schools should be opened. So, II does not follow."
  },
  {
    id: 102,
    question: "102. Statements: This book 'Z' is the only book which focuses its attention to the problem of poverty in India between 1950 and 1980. Conclusions: There was no question of poverty before 1950. No other book deals with poverty in India during 1950 to 1980.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The phrase 'only book' in the statement makes II implicit. However, nothing about the state of poverty before 1950 can be deduced from the statement. So, I does not follow."
  },
  {
    id: 103,
    question: "103. Statements: For over three decades Company X has been totally involved in energy conservation, its efficient use and management. Conclusions: The Company has yet to learn and acquire basic things in this area. It is dedication that is more important than knowledge and expertise.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since the company has been working in this area for three decades, it must have the necessary expertise and infrastructure required in this field. So, I does not follow. However, the qualities that have made the Company X successful in this field have not been mentioned. So, II also does not follow."
  },
  {
    id: 104,
    question: "104. Statements: About 50 per cent of the animal by-products - hair, skin, horns etc. is edible protein. American chemists have developed a method of isolating 45 per cent of this protein. They used an enzyme developed in Japan to break down soya protein. Conclusions: Americans have not been able to develop enzymes. Animal by-products protein has the same composition as soya protein.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: That the American chemists used an enzyme developed in Japan, does not mean that Americans have not been able to develop enzymes. So, I does not follow. Also, nothing about the compositions of animal by products protein and soya protein is mentioned in the statement. So, II also does not follow."
  },
  {
    id: 105,
    question: "105. Statements: The commissioner of police has appealed people not to put up banners which obstruct pedestrian or motor traffic. Conclusions: Some of the people may respond and will not put up such banners. Policemen will have to keep a watchful eye on the new banners which are being put up on the roads.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Clearly, the appeal has been made keeping in mind the fact that it would create awareness and have some effect. So, - I follows. However, the statement talks of a general appeal and not stringent directions. So, II does not follow."
  },
  {
    id: 106,
    question: "106. Statements: The Minister questioned the utility of the space research programme and suggested its replacement by other areas of felt national needs. Conclusions: Exploring the space does not contribute to critical national needs. Research should be oriented to national needs.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, the statement stresses on the fact that heeding to national needs is much more important than space research programmes, which stray the concerned authorities from the former. So, both I and II follow."
  },
  {
    id: 107,
    question: "107. Statements: The secret of success is constancy of purpose. Conclusions: Constant dripping wears the stone. Single-minded devotion is necessary for achieving success.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Both I and II directly follow from the given statement."
  },
  {
    id: 108,
    question: "108. Statements: Leaders, who raise much hue and cry about the use of Hindi, generally send their children to English medium schools. Conclusions: India lacks good Hindi medium schools. There is a world of difference between preaching and practising.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: Clearly, either I or II could be the reason for the situation expressed in the statement."
  },
  {
    id: 109,
    question: "109. Statements: Any young man, who makes dowry as a condition for marriage, discredits himself and dishonours womanhood. Conclusions: Those who take dowry in marriage should be condemned by society. Those who do not take dowry in marriage respect womanhood.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, the statement declares dowry as an evil practice and reflects its demerits. Thus, conclusion I follows. Also, it is given that those who take dowry dishonour womanhood. This implies that those who do not take dowry respect womanhood. So, II also follows."
  },
  {
    id: 110,
    question: "110. Statements: The 'Official Secrets Act' (OSA) enacted by the ABC government during the war seems to be one of the major source of corruption in the country X. Conclusions: The OSA has to be abolished immediately to put an end to the corruption in the country X. The ABC government had an intention of encouraging corruption in the government offices.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: The statement declares enactment of OSA as the direct cause of increase in corruption. So, I follows. However, enactment of an act by a government is undertaken for betterment and not with the intention of encouraging corruption though whatever may be the outcome later on. So, II does not follow."
  },
  {
    id: 111,
    question: "111. Statements: In India, more emphasis should be placed on areas such as agriculture, engineering and technology instead of basic and pure sciences. Conclusions: India has achieved sufficient progress in basic and pure sciences. In the past, the productivity factor in our economy was neglected.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: That more emphasis should be laid on productivity areas instead of sciences does not mean that the country has achieved sufficient progress in sciences. But it implies that productivity factor was previously being neglected. So, II follows while I does not."
  },
  {
    id: 112,
    question: "112. Statements: If all players play to their full potential, we will win the match. We have won the match. Conclusions: All players played to their full potential. Some players did not play to their full potential.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: The statement asserts that match can be won only if all the players play to their full potential. So, only I follows while II does not."
  },
  {
    id: 113,
    question: "113. Statements: The Bank of England's move to auction 25 metric tons of gold drew plenty of bidders looking for a bargain, but was criticised by major gold producers worldwide. Conclusions: The Bank of England should not auction gold which it possesses to keep steady international prices of gold. Bidders should quote higher gold prices to retain present value of gold in the international markets.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The statement does not talk against the auction but only speaks of the response it received from the bidders and gold producers. So, I does not follow. The phrase 'plenty of bidders looking for a bargain' is quite contrary to II. So, II also does not follow."
  },
  {
    id: 114,
    question: "114. Statements: Good voice is a natural gift but one has to keep practising to improve and excel well in the field of music. Conclusions: Natural gifts need nurturing and care. Even though your voice is not good, one can keep practising.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Clearly, I follows directly from the given statement. However, II is not related to the given statement and so does not follow."
  },
  {
    id: 115,
    question: "115. Statements: Adversity makes a man wise. Conclusions: The poor are wise. Man learns from bitter experience.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The statement talks of 'adversity' in general and not lack of money'. So, I does not follow. II correctly explains the statement and hence it follows."
  },
  {
    id: 116,
    question: "116. Statements: The interview panel may select a candidate who neither possesses the desired qualifications nor the values and attributes. Conclusions: The inclusion of specialists on the interview panel does not guarantee that the selection will be proper. The interview test has certain limitations in the matter of selection of candidates.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Clearly, both I and II correctly explain the given statement. So, both follow."
  },
  {
    id: 117,
    question: "117. Statements: The President of XYZ Party indicated that 25 independent Members of Legislative Assembly (MLA) are seriously considering various options of joining some political party. But in any case all of them collectively will join one party only. Conclusions: The 25 independent MLAs will join XYZ party in a short period of time. The 25 independent MLAs will join some other political party in a short period of time.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: The statement asserts that 25 independent M.L.A.s shall join one party only. Thus, they may join XYZ or any other party. So, either I or II follows."
  },
  {
    id: 118,
    question: "118. Statements: I know nothing except the fact of my ignorance. Conclusions: Writer's knowledge is very poor. The world of knowledge is too vast to be explored by a single person.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: The statement is a symbolic one and only II correctly explains it."
  },
  {
    id: 119,
    question: "119. Statements: Company X has a record of manufacturing cameras of quality and the latest design so that you do not spoil even a single shot irrespective of the weather conditions. Conclusions: No other company except X is reputed in the camera industry. Anyone can take an acceptable shot with camera X.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Clearly, the statement talks of Company X only and no other company. So, I does not follow. Also, it is mentioned that one can take a good shot even in bad weather conditions with a camera of Company X. So, II follows."
  },
  {
    id: 120,
    question: "120. Statements: India's economy is depending mainly on forests. Conclusions: Trees should be preserved to improve Indian economy. India wants only maintenance of forests to improve economic conditions.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: It is mentioned in the statement that India's economy depends mainly on forests. This means that forests should be preserved. So, I follows. But, that only preservation of forests can improve the economy, cannot be said. So, II does not follow."
  },
];

export const THEME_DETECTION_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. The attainment of individual and organisational goals is mutually interdependent and linked by a common denominator - employee work motivation. Organisational members are motivated to satisfy their personal goals, and they contribute their efforts to the attainment of organisational objectives as means of achieving these personal goals. The passage best supports the statement that motivation -",
    options: ["a) encourages an individual to give priority to personal goals over organisational goals.", "b) is crucial for the survival of an individual and organisation.", "c) is the product of an individual's physical and mental energy.", "d) is the external force which induces an individual to contribute his efforts.", "e) makes organisation and society inseparable."],
    correctIndex: 0,
    answerText: "a) encourages an individual to give priority to personal goals over organisational goals.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 2,
    question: "2. Due to enormous profits involved in smuggling, hundreds of persons have been attracted towards this anti-national activity. Some of them became millionaires overnight. India has a vast coastline both on the Eastern and Western Coast. It has been a heaven for smugglers who have been carrying on their activities with great impunity. There is no doubt, that from time to time certain seizures were made by the enforcement authorities, during raids and ambush but even allowing these losses the smugglers made huge profits. The passage best supports the statement that",
    options: ["a) smuggling hampers the economic development of a nation.", "b) smuggling ought to be curbed.", "c) authorities are taking strict measures to curb smuggling.", "d) smuggling is fast increasing in our country owing to the quick profit it entails."],
    correctIndex: 3,
    answerText: "d) smuggling is fast increasing in our country owing to the quick profit it entails.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 3,
    question: "3. Though the waste of time or the expenditure on fashions is very large, yet fashions have come to stay. They will not go, come what may. However, what is now required is that strong efforts should be made to displace the excessive craze for fashion from the minds of these youngsters. The passage best supports the statement that:",
    options: ["a) fashion is the need of the day.", "b) the excessive craze for fashion is detrimental to one's personality.", "c) the hoard for fashion should be done away with so as not to let down the constructive development.", "d) work and other activities should be valued more than the outward appearance."],
    correctIndex: 2,
    answerText: "c) the hoard for fashion should be done away with so as not to let down the constructive development.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 4,
    question: "4. One of the important humanitarian by-products of technology is the greater dignity and value that it imparts to human labour. In a highly industrialized society, there is no essential difference between Brahmin and Dalit, Muslim and Hindu; they are equally useful and hence equally valuable for in the industrial society individual productivity fixes the size of the pay cheque and this fixes social status. The passage best supports the statement that:",
    options: ["a) technology decides individual's social status.", "b) castes and religions are man-made.", "c) human labour has dignity and value.", "d) all individuals, irrespective of caste and creed, are born equal.", "e) industrial society is a great leveller of men."],
    correctIndex: 2,
    answerText: "c) human labour has dignity and value.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 5,
    question: "5. The future of women in India is quite bright and let us hope that they will justify their abilities by rising to the occasion. Napoleon was right when he declared that by educating the women we can educate the whole nation. Because a country can never rise without the contribution of 50% of their population. The passage best supports the statement that:",
    options: ["a) India is striving hard for the emancipation of women.", "b) all women should be well educated.", "c) a nation can progress only when women are given equal rights and opportunities as men.", "d) women ought to be imparted full freedom to prove their worth and contribute to the progress of the nation."],
    correctIndex: 3,
    answerText: "d) women ought to be imparted full freedom to prove their worth and contribute to the progress of the nation.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 6,
    question: "6. The prevention of accidents makes it necessary not only that safety devices be used to guard exposed machinery but also that mechanics be instructed in safety rules which they must follow for their own protection, and that lighting in the plant be adequate. The passage best supports the statement that industrial accidents -",
    options: ["a) are always avoidable;", "b) may be due to ignorance.", "c) cannot be entirely overcome.", "d) can be eliminated with the help of safety rules.", "e) usually result from inadequate machinery."],
    correctIndex: 3,
    answerText: "d) can be eliminated with the help of safety rules.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 7,
    question: "7. To forgive an injury is often considered to be a sign of weakness; it is really a sign of strength. It is easy to allow oneself to be carried away by resentment and hate into an act of vengeance; but it takes a strong character to restrain those natural passions. The man who forgives an injury proves himself to be the superior of the man who wronged himself and puts the wrong-doer to shame. The passage best supports' the statement that:",
    options: ["a) the sufferer alone knows the intensity of his sufferings.", "b) people tend to forgive the things happened in the past.", "c) natural passions are difficult to suppress.", "d) mercy is the noblest form of revenge.", "e) a person with calm and composed nature has depth of thought and vision."],
    correctIndex: 3,
    answerText: "d) mercy is the noblest form of revenge.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 8,
    question: "8. Industrial exhibitions play a major role in a country's economy. Such exhibitions, now regularly held in Delhi, enable us to measure the extent of our own less advanced industrial progress and the mighty industrial power and progress of countries like the U.K., U.S.A. and Russia whose pavilions are the centres of the greatest attention and attractions. The passage best supports the statement that industrial exhibitions -",
    options: ["a) greatly tax the poor economies.", "b) are more useful for the developed countries like U.S.A. whose products stand out superior to those of the developing countries.", "c) are not of much use to the countries who are industrially backward.", "d) boost up production qualitatively and quantitatively by analytical comparison of a country's products with those of the developed countries."],
    correctIndex: 3,
    answerText: "d) boost up production qualitatively and quantitatively by analytical comparison of a country's products with those of the developed countries.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 9,
    question: "9. The school has always been the most important means of transferring the wealth of tradition form one generation to the next. This applies today in an even higher degree than in former times for, through the modern development of economy, the family as bearer of tradition and education has become weakened. This passage best supports the statement that for transferring the wealth of tradition from one generation to the next -",
    options: ["a) there are means other than the school.", "b) several different sources must be tried.", "c) economic development plays a crucial role", "d) modern technology must be put to use.", "e) family, as ever, is the most potent means."],
    correctIndex: 2,
    answerText: "c) economic development plays a crucial role",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 10,
    question: "10. Emerson said that the poet was landlord, Sealord, airlord. The flight of imagination made the poet master of land, sea and air. But a poet's dream of yesterday becomes today an actual achievement and a reality for all men. Even those who invented, improved and perfected the aeroplane could hardly have dreamt of the possibility of flight into outer space. The passage best supports the statement that:",
    options: ["a) seemingly impossible imaginations make one a good poet,", "b) all imaginations become a reality some day.", "c) what man imagined has never been impossible; he has always turned it a reality through his conception of ideas and sheer hard labour.", "d) man has reached the climax of technological development with his exploration into outer space."],
    correctIndex: 2,
    answerText: "c) what man imagined has never been impossible; he has always turned it a reality through his conception of ideas and sheer hard labour.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 11,
    question: "11. It is up to our government and planners to devise ways and means for the mobilisation of about ten crore workers whose families total up about forty crore men, women and children. Our agriculture is over-manned. A lesser number of agriculturists would mean more purchasing or spending power to every agriculturist. This will result in the shortage of man-power for many commodities to be produced for which there will be a new demand from a prosperous agrarian class. This shortage will be removed by surplus man-power released from agriculture as suggested above. The passage best supports the statement that:",
    options: ["a) employment in production is more fruitful than employment in agriculture.", "b) Indian economy is in a poor shape basically due to improper mobilisation of man-power.", "c) a shift of labour from agricultural sector to the industrial sector would uplift the living standard.", "d) the industrial sector is labour-deficient while the agricultural sector is over-manned in our country."],
    correctIndex: 1,
    answerText: "b) Indian economy is in a poor shape basically due to improper mobilisation of man-power.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 12,
    question: "12. Exports and imports, a swelling favourable balance of trade, investments and bank-balances, are not an index or a balance sheet of national prosperity. Till the beginning of the Second World War, English exports were noticeably greater than what they are today. And yet England has greater national prosperity today than it ever had. Because the income of average Englishmen, working as field and factory labourers, clerks, policemen, petty shopkeepers and shop assistants, domestic workers and other low-paid workers, has gone up. The passage best supports the statement that:",
    options: ["a) a country's economic standard can be best adjudged by per capital income.", "b) a country's balance of trade is the main criteria of determining its economic prosperity.", "c) a nation's economy strengthens with the increase in exports.", "d) English trade has continually increased since the Second World War."],
    correctIndex: 0,
    answerText: "a) a country's economic standard can be best adjudged by per capital income.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 13,
    question: "13. Satisfaction with co-workers, promotion opportunities, the nature of work, and pay goes with high performance among those with strong growth needs. Among those with weak growth needs, no such relationship is present - and, in fact, satisfaction with promotion opportunities goes with low performance. This passage best supports the statement that:",
    options: ["a) satisfaction is an inevitable organisational variable.", "b) job satisfaction and performance are directly and closely related.", "c) relationship between job satisfaction and performance is moderated by growth need.", "d) every organisation has few employees having weak growth need.", "e) high performance is essential for organisational effectiveness."],
    correctIndex: 2,
    answerText: "c) relationship between job satisfaction and performance is moderated by growth need.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 14,
    question: "14. The only true education comes through the stimulation of the child's powers by the demands of the social situations in which he finds himself. Through these demands he is stimulated to act as a member of a unity, to emerge from his original narrowness of action and feeling, and to conceive himself from the standpoint of the welfare of the group to which he belongs. The passage best supports the statement that real education -",
    options: ["a) will take place if the children imbibe action and feeling.", "b) will take place if the children are physically strong.", "c) is not provided in our schools today.", "d) comes through the interaction with social situations.", "e) comes from the self-centred approach of the students."],
    correctIndex: 3,
    answerText: "d) comes through the interaction with social situations.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 15,
    question: "15. The press should not be afraid of upholding and supporting a just and righteous cause. It should not be afraid of criticising the government in a healthy manner. The press has to be eternally vigilant to protect the rights of the workers, backward and suppressed sections of the society. It should also give a balanced view of the things so that people can be helped in the formation of a healthy public opinion. The passage best supports the statement that",
    options: ["a) press has a great role to play in a democracy.", "b) the press is the only means to project to the masses the policies of the government.", "c) the freedom of press is essential for the proper functioning of democracy.", "d) the press can be used by the governments as an effective media for the upliftment of the backward sections of society.", "e) all the information given by the press should be well-articulated so as to gain a good opinion towards the ruling party."],
    correctIndex: 2,
    answerText: "c) the freedom of press is essential for the proper functioning of democracy.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 16,
    question: "16. Throughout the ages the businessman has helped build civilisation's great cities, provided people with luxuries and artists with patronage, and lift his fellow citizens to understand the standard of living. In the last few centuries the businessman has seeded the Industrial Revolution around the world. The passage best supports the statement that the businessman -",
    options: ["a) is accountable to the society.", "b) lives luxurious and comfortable life.", "c) is the beneficiary of the Industrial Revolution.", "d) is capable of raising his standard of living.", "e) has contributed to the growth of civilisation."],
    correctIndex: 4,
    answerText: "e) has contributed to the growth of civilisation.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 17,
    question: "17. There is a shift in our economy from a manufacturing to a service orientation. The increase in service-sector will require the managers to work more with people rather than with objects and things from the assembly line. This passage best supports the statement that:",
    options: ["a) managers should have a balanced mind.", "b) assembly line will exist in service organisations.", "c) interpersonal skills will become more important in the future work place.", "d) manufacturing organisations ignore importance of people.", "e) service organisations will not deal with objects and things."],
    correctIndex: 2,
    answerText: "c) interpersonal skills will become more important in the future work place.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
  {
    id: 18,
    question: "18. The virtue of art does not allow the work to be interfered with or immediately ruled by anything other than itself. It insists that it alone shall touch the work in order to bring it into being. Art requires that nothing shall attain the work except through art itself. This passage best supports the statement that:",
    options: ["a) art is governed by external rules and conditions.", "b) art is for the sake of art and life.", "c) art is for the sake of art alone.", "d) artist realises his dreams through his artistic creation.", "e) artist should use his art for the sake of society."],
    correctIndex: 2,
    answerText: "c) art is for the sake of art alone.",
    solution: "Explanation: No answer description is available. Let's discuss."
  },
];

export const CAUSE_AND_EFFECT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Statements: The prices of petrol and diesel in the domestic market have remained unchanged for the past few months. The crude oil prices in the international market have gone up substantially in the last few months.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 3,
    answerText: "d) Both the statements I and II are effects of independent causes",
    solution: "Explanation: The prices of petrol and diesel being stagnant in the domestic market and the increase in the same in the international market must be backed by independent causes."
  },
  {
    id: 2,
    question: "2. Statements: The government has recently fixed the fees for professional courses offered by the unaided institutions which are much lower than the fees charged last year. The parents of the aspiring students launched a severe agitation last year protesting against the high fees charged by the unaided institutions.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: The parents' protest against high fees being charged by the institutions led the government to interfere and fix the fees at a more affordable level."
  },
  {
    id: 3,
    question: "3. Statements: The Reserve Bank of India has recently put restrictions on few small banks in the country. The small banks in the private and co-operative sector in India are not in a position to withstand the competitions of the bigger in the public sector.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: The inability of the small banks to compete with the bigger ones shall not ensure security and good service to the customers, which is an essential concomitant that has to be looked into by the Reserve Bank. I seems to be a remedial step for the same."
  },
  {
    id: 4,
    question: "4. Statements: All the schools in the area had to be kept closed for most part of the week. Many parents have withdrawn their children from the local schools.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 3,
    answerText: "d) Both the statements I and II are effects of independent causes",
    solution: "Explanation: Closing the schools for a week and the parents withdrawing their wards from the local schools are independent issues, which must have been triggered by different individual causes."
  },
  {
    id: 5,
    question: "5. Statements: India has surpassed the value of tea exports this year over all the earlier years due to an increase in demand for quality tea in the European market. There is an increase in demand of coffee in the domestic market during the last two years.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 2,
    answerText: "c) Both the statements I and II are independent causes",
    solution: "Explanation: The two statements discuss two separate statistical and generalised results."
  },
  {
    id: 6,
    question: "6. Statements: There is unprecedented increase in the number of young unemployed in comparison to the previous year. A large number of candidates submitted applications against an advertisement for the post of manager issued by a bank.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 0,
    answerText: "a) Statement I is the cause and statement II is its effect",
    solution: "Explanation: An increase in the number of unemployed youth is bound to draw in huge crowds for a single vacancy."
  },
  {
    id: 7,
    question: "7. Statements: The police authority has recently caught a group of house breakers. The citizens group in the locality have started night vigil in the area.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 4,
    answerText: "e) Both the statements I and II are effects of some common cause",
    solution: "Explanation: Both the statements are clearly backed by a common cause, which is clearly an increase in the number of thefts in the locality."
  },
  {
    id: 8,
    question: "8. Statements: Majority of the students in the college expressed their opinion against the college authority's decision to break away from the university and become autonomous. The university authorities have expressed their inability to provide grants to its constituent colleges.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: Clearly, the university's decision to refuse grant to the colleges must have triggered the college authority to become autonomous."
  },
  {
    id: 9,
    question: "9. Statements: The literacy rate in the district has been increasing for the last four years. The district administration has conducted extensive training programme for the workers involved in the literacy drive.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: Clearly, the increase in the literacy rate may be attributed directly to the stringent efforts of the district administration in this direction."
  },
  {
    id: 10,
    question: "10. Statements: The school authority has asked the X Std. students to attend special classes to be conducted on Sundays. The parents of the X Std. students have withdrawn their wards from attending private tuitions conducted on Sundays.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 0,
    answerText: "a) Statement I is the cause and statement II is its effect",
    solution: "Explanation: It seems quite evident that the parents have instructed their wards to abstain from private tuitions on Sundays and attend special classes organised by the school."
  },
  {
    id: 11,
    question: "11. Statements: The Government has imported large quantities of sugar as per trade agreement with other countries. The prices of sugar in the domestic market have fallen sharply in the recent months.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 0,
    answerText: "a) Statement I is the cause and statement II is its effect",
    solution: "Explanation: The increase in supply always triggers a reduction in the prices."
  },
  {
    id: 12,
    question: "12. Statements: There is sharp decline in the production of oil seeds this year. The Government has decided to increase the import quantum of edible oil.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 0,
    answerText: "a) Statement I is the cause and statement II is its effect",
    solution: "Explanation: A sharp decline in oilseed production is bound to reduce oil supply and import of oil is the only means to restore the essential supply."
  },
  {
    id: 13,
    question: "13. Statements: The private medical colleges have increased the tuition fees in the current year by 200 per cent over the last year's fees to meet the expenses. The Government medical colleges have not increased their fees in spite of price escalation.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 2,
    answerText: "c) Both the statements I and II are independent causes",
    solution: "Explanation: The increase in the fees of the private colleges and there being no increase in the same in Government colleges seem to be policy matters undertaken by the individual decisive boards at the two levels."
  },
  {
    id: 14,
    question: "14. Statements: Large number of people living in the low-lying areas has been evacuated during the last few days to safer places. The Government has rushed in relief supplies to the people living in the affected areas.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 4,
    answerText: "e) Both the statements I and II are effects of some common cause",
    solution: "Explanation: Evacuating low-lying areas and rushing in relief to the affected areas clearly indicates that floods have occurred in the area."
  },
  {
    id: 15,
    question: "15. Statements: It is the aim of the city's civic authority to get the air pollution reduced by 20% in the next two months. The number of asthma cases in the city is constantly increasing.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: The increase in number of asthma cases must have alerted the authorities to take action to control air pollution that triggers the disease."
  },
  {
    id: 16,
    question: "16. Statements: The local co-operative credit society has decided to stop giving loans to farmers with immediate effect. A large number of credit society members have withdrawn major part of their deposits from the credit society.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: Clearly, withdrawal of funds by society members is bound to reduce the lending power of the society."
  },
  {
    id: 17,
    question: "17. Statements: The employees of the biggest bank in the country have given an indefinite strike call starting from third of the next month. The employees of the Central Government have withdrawn their week long demonstrations.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 3,
    answerText: "d) Both the statements I and II are effects of independent causes",
    solution: "Explanation: The employees of a bank going on strike and the government employees calling off their protest seem to be two independent events that might have been triggered by individual causes."
  },
  {
    id: 18,
    question: "18. Statements: Police resorted to lathi-charge to disperse the unlawful gathering of large number of people. The citizens' forum called a general strike in protest against the police atrocities.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: Clearly, the people's mass protest against the police might have instigated the latter to indulge in lathi-charge to disperse the mob."
  },
  {
    id: 19,
    question: "19. Statements: Majority of the citizens in the locality belongs to higher income group. The sales in the local super market are comparatively much higher than in other localities.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 0,
    answerText: "a) Statement I is the cause and statement II is its effect",
    solution: "Explanation: The comparatively higher sales in a particular locality are indicative of the high paying capacity of the residents of that locality."
  },
  {
    id: 20,
    question: "20. Statements: The life today is too fast, demanding and full of variety in all aspects which at times leads to stressful situations. Number of suicide cases among teenagers is on increase.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 0,
    answerText: "a) Statement I is the cause and statement II is its effect",
    solution: "Explanation: Stress in everyday life is a major cause of frustration among the youth and is bound to lead them to take harsh steps as suicide."
  },
  {
    id: 21,
    question: "21. Statements: The government has decided to make all the information related to primary education available to the general public. In the past, the general public did not have access to all these information related to primary education.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: The government must have seen the unawareness of the people as a strong factor in the primary education programme being not successful. The step indicated in I must, thus, have been sought for as a remedy for the same."
  },
  {
    id: 22,
    question: "22. Statements: The farmers have decided against selling their kharif crops to the Government agencies. The Government has reduced the procurement price of kharif crops starting from last month to the next six months.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: The reduction in procurement price of crops must have instigated the farmers not to sell their produce to Government agencies."
  },
  {
    id: 23,
    question: "23. Statements: The performance of most of the students in final exam of class X in the schools run by the Government was excellent. Many teachers of the Government schools left the school and joined private schools.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 3,
    answerText: "d) Both the statements I and II are effects of independent causes",
    solution: "Explanation: The students of government schools performing well in the examinations and the teachers of government schools leaving their jobs to join private schools are two separate situations that must have been triggered by independent causes."
  },
  {
    id: 24,
    question: "24. Statements: There is considerable reduction in the number of people affected by water-borne diseases in City A during this rainy season. The government has opened four new civil hospitals in City A in the beginning of the year.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 2,
    answerText: "c) Both the statements I and II are independent causes",
    solution: "Explanation: The given statements are self-sufficient and depict independent events."
  },
  {
    id: 25,
    question: "25. Statements: The prices of vegetables have been increased considerably during this summer. There is tremendous increase in the temperature during this summer thereby damaging crops greatly.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: Clearly, damage to crops due to high temperature may have resulted in a short supply of vegetables and hence an increase in their prices."
  },
  {
    id: 26,
    question: "26. Statements: There has been a high increase in the incidents of atrocities against women in the city during the past few months. The police authority has been unable to nab the culprits who are committing crime against women.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 2,
    answerText: "c) Both the statements I and II are independent causes",
    solution: "Explanation: An increase in the cases of atrocities on women and the police being unable to nab the culprits involved in the same are independent happenings in themselves."
  },
  {
    id: 27,
    question: "27. Statements: Rural and semi-urban areas in the country have been suffering due to load shedding for quite some time. If the Government is not able to overcome the power crisis, load shedding will be extended even to the urban areas.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 4,
    answerText: "e) Both the statements I and II are effects of some common cause",
    solution: "Explanation: The facts given in both the statements are clearly the result of acute power shortage."
  },
  {
    id: 28,
    question: "28. Statements: The university authority has instructed all the colleges under its jurisdiction to ban use of all phones inside the college premises. Majority of the teachers of the colleges signed a joint petition to the university complaining the disturbances caused by cell phone ring-tones inside the classrooms.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: Clearly, the university's decision came as a sequel to the complaint received by it from the college teachers against use of mobile phones in the college premises."
  },
  {
    id: 29,
    question: "29. Statements: Most of the steel producing companies in the country have made considerable profit during the last financial year. Many Asian countries have been importing huge quantities of steel from India.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 1,
    answerText: "b) Statement II is the cause and statement I is its effect",
    solution: "Explanation: The increase in demand of steel from other countries is bound to enhance business and hence profitability of steel companies in India."
  },
  {
    id: 30,
    question: "30. Statements: There is increase in water level of all the water tanks supplying drinking water to the city during the last fortnight. Most of the trains were cancelled last week due to water-logging on the tracks.",
    options: ["a) Statement I is the cause and statement II is its effect", "b) Statement II is the cause and statement I is its effect", "c) Both the statements I and II are independent causes", "d) Both the statements I and II are effects of independent causes", "e) Both the statements I and II are effects of some common cause"],
    correctIndex: 4,
    answerText: "e) Both the statements I and II are effects of some common cause",
    solution: "Explanation: The problems discussed in both the statements are clearly the result of heavy downpour in the area."
  },
];

export const STATEMENT_AND_ARGUMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Statement: Should India encourage exports, when most things are insufficient for internal use itself? Arguments: Yes. We have to earn foreign exchange to pay for our imports. No. Even selective encouragement would lead to shortages.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, India can export only the surplus and that which can be saved after fulfilling its own needs, to pay for its imports. Encouragement to export cannot lead to shortages as it shall provide the resources for imports. So, only argument I holds."
  },
  {
    id: 2,
    question: "2. Statement: Should all the drugs patented and manufactured in Western countries be first tried out on sample basis before giving licence for sale to general public in India? Arguments: Yes. Many such drugs require different doses and duration for Indian population and hence it is necessary. No. This is just not feasible and hence cannot be implemented.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, health of the citizens is an issue of major concern for the Government. So, a product like drugs, must be first studied and tested in the Indian context before giving licence for its sale. So, only argument I holds strong."
  },
  {
    id: 3,
    question: "3. Statement: Should India make efforts to harness solar energy to fulfil its energy requirements? Arguments: Yes, Most of the energy sources used at present is exhaustible. No. Harnessing solar energy requires a lot of capital, which India lacks in.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, harnessing solar energy will be helpful as it is an inexhaustible resource unlike other resources. So, argument I holds. But argument II is vague as solar energy is the cheapest form of energy."
  },
  {
    id: 4,
    question: "4. Statement: Should there be students union in college/university? Arguments: No. This will create a political atmosphere in the campus. Yes, it is very necessary Students are future political leaders.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: The students union formation shall be a step towards giving to students the basic education in the field of politics. However, it shall create the same political atmosphere in the campus. Thus, both the arguments hold strong."
  },
  {
    id: 5,
    question: "5. Statement: Should India give away Kashmir to Pakistan? Arguments: No. Kashmir is a beautiful state. It earns a lot of foreign exchange for India. Yes. This would help settle conflicts.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, India cannot part with a state that is a major foreign exchange earner to it. So, argument I holds strong. Further, giving away a piece of land unconditionally and unreasonably is no solution to settle disputes. So, argument II is vague."
  },
  {
    id: 6,
    question: "6. Statement: Should cottage industries be encouraged in rural areas? Arguments: Yes. Rural people are creative. Yes. This would help to solve the problem of unemployment to some extent.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, cottage industries need to be promoted to create more job opportunities for rural people in the villages themselves. The reason that rural people are creative is vague. So, only argument II holds."
  },
  {
    id: 7,
    question: "7. Statement: Should young entrepreneurs be encouraged? Arguments: Yes. They will help in industrial development of the country. Yes. They will reduce the burden on employment market.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Clearly, encouraging the young entrepreneurs will open up the field for the establishment of new industries. Thus, it shall help in industrial development and not only employ the entrepreneurs but create more job opportunities for others as well. So, both the arguments hold strong."
  },
  {
    id: 8,
    question: "8. Statement: Should all the annual examinations up to Std. V be abolished? Arguments: Yes. The young students should not be burdened with such examinations which hampers their natural growth. No. The students will not study seriously as they will get automatic promotion to the next class and this will affect them in future.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Clearly, neither the students can be burdened with studies at such a tender age, nor can they be left free to take studies casually, as this shall weaken their basic foundation. So, both the arguments follow."
  },
  {
    id: 9,
    question: "9. Statement: Should Indian scientists working abroad be called back to India? Arguments: Yes. They must serve the motherland first and forget about discoveries, honours, facilities and all. No. We have enough talent; let them stay where they want.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Clearly, every person must be free to work wherever he wants and no compulsion should be made to confine one to one's own country. So, argument I is vague. However, talented scientists can be of great benefit to the nation and some alternatives as special incentives or better prospects may be made available to them to retain them within their motherland. So, argument II also does not hold."
  },
  {
    id: 10,
    question: "10. Statement: Should we scrap the system of formal education beyond graduation? Arguments: Yes. It will mean taking employment at an early date. No. It will mean lack of depth of knowledge.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, argument I is vague because at present too, many fields are open to all after graduation. However, eliminating the post-graduate courses would abolish higher and specialized studies which lead to understanding things better and deeply. So, argument II is valid."
  },
  {
    id: 11,
    question: "11. Statement: Should there be an upper age limit of 65 years for contesting Parliamentary/ Legislative Assembly elections? Arguments: Yes. Generally, people above the age of 65 lose their dynamism and will power. No. The life span is so increased that people remain physically and mentally active even up to the age of 80.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: The age of a person is no criterion for judging his mental capabilities and administrative qualities. So, none of the arguments holds strong."
  },
  {
    id: 12,
    question: "12. Statement: Should new big industries be started in Mumbai? Arguments: Yes. It will create job opportunities. No. It will further add to the pollution of the city.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 2,
    answerText: "c) Either I or II is strong",
    solution: "Explanation: Opening up of new industries is advantageous in opening more employment avenues, and disadvantageous in that it adds to the pollution. So, either of the arguments holds strong."
  },
  {
    id: 13,
    question: "13. Statement: Should high chimneys be installed in industries? Arguments: Yes. It reduces pollution at ground level. No. It increases pollution in upper atmosphere.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Pollution at ground level is the most hazardous in the way of being injurious to human and animal life. So, argument I alone holds."
  },
  {
    id: 14,
    question: "14. Statement: Does India need so many plans for development? Arguments: Yes. Nothing can be achieved without proper planning. No. Too much time, money and energy is wasted on planning.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Before indulging in new development programme it is much necessary to plan the exact target, policies and their implementation and the allocation of funds which shows the right direction to work. So, argument I holds strong. Also, planning ensures full utilization of available resources and funds and stepwise approach towards the target. So, spending a part of money on it is no wastage. Thus, argument II is not valid."
  },
  {
    id: 15,
    question: "15. Statement: Should articles of only deserving authors be allowed to be published? Arguments: Yes. It will save a lot of paper which is in short supply. No. It is not possible to draw a line between the deserving and the undeserving.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, I does not provide a strong reason in support of the statement. Also, it is not possible to analyze the really deserving and not deserving. So/argument II holds strong."
  },
  {
    id: 16,
    question: "16. Statement: Should colleges be given the status of a university in India? Arguments: Yes. Colleges are in a better position to assess the student's performance and therefore the degrees will be more valid. No. It is Utopian to think that there will not be nepotism and corruption in awarding degrees by colleges.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Clearly, at the college level, all the students are assessed according to their performance in the University Exams and not on the basis of any criteria of a more intimate dealings with the students. So, argument I is vague. Also, at this level the awarding of degrees is impartial and simply based on his performance. So, argument II also does not hold."
  },
  {
    id: 17,
    question: "17. Statement: Should the prestigious people who have committed crime unknowingly, be met with special treatment? Arguments: Yes. The prestigious people do not commit crime intentionally. No. It is our policy that everybody is equal before the law.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: The Constitution of India has laid down the doctrine of 'equality before the law'. So, argument II holds strong. Also, we cannot judge the intentions of a person behind committing a crime, So, argument I is vague."
  },
  {
    id: 18,
    question: "18. Statement: Can pollution be controlled? Arguments: Yes. If everyone realizes the hazards it may create and cooperates to get rid of it, pollution may be controlled. No. The crowded highways, factories and industries and an ever-growing population eager to acquire more and more land for constructing houses are beyond control.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 2,
    answerText: "c) Either I or II is strong",
    solution: "Explanation: The control of pollution, on one hand, seems to be impossible because of the ever-growing needs and the disconcern of the people but, on the other hand, the control is possible by a joint effort. So, either of the arguments will hold strong."
  },
  {
    id: 19,
    question: "19. Statement: Should the railways in India be privatized in a phased manner like other public sector enterprises? Arguments: Yes. This is the only way to bring in competitiveness and provide better services to the public. No. This will pose a threat to the national security of our country as multinationals will enter into the fray.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Privatization would no doubt lead to better services. But saying that this is the 'only way' is wrong. So, argument I does not hold. Argument II also seems to be vague."
  },
  {
    id: 20,
    question: "20. Statement: Should internal assessment in colleges be abolished? Arguments: Yes. This will help in reducing the possibility of favouritism. No, teaching faculty will lose control over students.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Abolishing the internal assessment would surely reduce favouritism on personal grounds because the teachers would not be involved in examination system so that they cannot extend personal benefits to anyone. So, argument I holds strong. But it will not affect the control of teaching faculty on students because still the teachers would be teaching them. So, argument II is vague."
  },
  {
    id: 21,
    question: "21. Statement: Should all the unauthorized structures in the city be demolished? Arguments: No. Where will the people residing in such houses live? Yes. This will give a clear message to general public and they will refrain from constructing unauthorized buildings.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: The demolition of unauthorized buildings would teach a lesson to the unscrupulous builders and also serve as a warning for the citizens not to indulge in such activities in the future. This is essential, as unauthorized constructions impose undue burden on the city's infrastructure. So, only argument II holds strong."
  },
  {
    id: 22,
    question: "22. Statement: Should there be a maximum limit for the number of ministers in the Central Government? Arguments: No. The political party in power should have the freedom to decide the number of ministers to be appointed. Yes. The number of ministers should be restricted to a certain percentage of the total number of seats in the parliament to avoid unnecessary expenditure.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, there should be some norms regarding the number of ministers in the Government, as more number of ministers would unnecessarily add to the Government expenditure. So, argument II holds strong; Also, giving liberty to the party in power could promote extension of unreasonable favour to some people at the cost of government funds. So, argument I does not hold."
  },
  {
    id: 23,
    question: "23. Statement: Should foreign films be banned in India? Arguments: Yes. They depict an alien culture which adversely affects our values. No. Foreign films are of a high artistic standard.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Clearly, foreign films depict the alien culture but this only helps in learning more. So, argument I does not hold. Also, the reason stated in argument II is not strong enough in contradicting the ban. So, it also does not hold."
  },
  {
    id: 24,
    question: "24. Statement: Is buying things on instalments profitable to the customer? Arguments: Yes. He has to pay less. No, paying instalments upsets the family budget.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: In buying things on instalments, a customer has to pay more as the interest is also included. So, argument I does not hold. Moreover, one who buys an item on instalments maintains his future budget accordingly as he is well acquainted with when and how much he has to pay, beforehand. So, argument II is also not valid."
  },
  {
    id: 25,
    question: "25. Statement: Should Doordarshan be given autonomous status? Arguments: Yes. It will help Doordarshan to have fair and impartial coverage of all important events. No. The coverage of events will be decided by a few who may not have healthy outlook.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, the autonomous status of the Doordarshan will be a step towards giving it independence for an impartial coverage. Autonomous status does not mean that the coverage will be decided by a few. So, only argument I holds."
  },
  {
    id: 26,
    question: "26. Statement: Should adult education programme be given priority over compulsory education programme? Arguments: No. It will also help in success of compulsory education programme. Yes. It will help to eliminate the adult illiteracy.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, argument I gives a reason in support of the statement and so it does not hold strong against it. The adult education programme needs to be given priority because it shall eliminate adult illiteracy and thus help in further spread of education. So, only argument II is strong enough."
  },
  {
    id: 27,
    question: "27. Statement: Should new universities be established in India? Arguments: No. We have still not achieved the target for literacy. No. We will have to face the problem of unemployed but highly qualified people.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Clearly, instead of improving upon higher education, increasing the literacy rate should be heeded first. So, argument I holds. Also, more number of universities will produce more degree holders with the number of jobs remaining the same, thus increasing unemployment. So, argument II also holds strong."
  },
  {
    id: 28,
    question: "28. Statement: Should non-vegetarian food be totally banned in our country? Arguments: Yes. It is expensive and therefore it is beyond the means of most people in our country. No. Nothing should be banned in a democratic country like ours.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, restriction on the diet of people will be denying them their basic human right. So, only argument II holds."
  },
  {
    id: 29,
    question: "29. Statement: Should a total ban be put on trapping wild animals? Arguments: Yes. Trappers are making a lot of money; No. Bans on hunting and trapping are not effective.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Clearly, ban is necessary to protect our natural environment. So, none of the arguments is strong enough."
  },
  {
    id: 30,
    question: "30. Statement: Should Government close down loss-making public sector enterprises? Arguments: No. All employees will lose their jobs, security and earning, what would they do? Yes. In a competitive world the rule is 'survival of the fittest'.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Closing down public-sector enterprises will definitely throw the engaged persons out of employment. So, argument I holds. Also, closing down is no solution for a loss-making enterprise. Rather, its causes of failure should be studied, analyzed and the essential reforms implemented. Even if this does not work out, the enterprise may be privatized. So, argument II is vague,"
  },
  {
    id: 31,
    question: "31. Statement: Should government jobs in rural areas have more incentives? Arguments: Yes. Incentives are essential for attracting government servants there. No. Rural areas are already cheaper, healthier and less complex than big cities. So ? Why offer extra incentives!",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, government jobs in rural areas are underlined with several difficulties. In lieu of these, extra incentives are needed. So, only argument I holds strong."
  },
  {
    id: 32,
    question: "32. Statement: Should there be a cap on maximum number of contestants for parliamentary elections in any constituency? Arguments: Yes. This will make the parliamentary elections more meaningful as the voters can make a considered judgement for casting their vote. No. In a democracy any person fulfilling the eligibility criteria can contest parliamentary elections and there should be no restrictions.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Clearly, if there were less candidates, the voters would find it easy to make a choice. So, argument I holds. Also, every person satisfying the conditions laid down by the Constitution must be given an opportunity and should not be denied the same just to cut down the number of candidates. So, argument II also holds strong."
  },
  {
    id: 33,
    question: "33. Statement: Should so much money be spent on advertisements? Arguments: Yes. It is an essential concomitant in a capitalist economy. No. It leads to wastage of resources.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, the advertisements are/the means to introduce people with the product and its advantages. So, argument I holds strong. But argument II is vague because advertisements are an investment for better gain and not a, wastage."
  },
  {
    id: 34,
    question: "34. Statement: Should all the legislators be forced to resign from their profession? Arguments: Yes. They will be able to devote more time for the country. No, nobody will contest election.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: The legislators should surely not be engaged in any other profession because only then will they be able to work with devotion. So, argument I holds. Also, if such a law is enforced, only those people will contest elections who are really prepared to work for the country. So, argument II is vague."
  },
  {
    id: 35,
    question: "35. Statement: Should 'computer knowledge' be made a compulsory subject for all the students at secondary school level? Arguments: No, our need is 'bread' for everyone, we cannot follow western models. Yes. We cannot compete in the international market without equipping our children with computers.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Nowadays, computers have entered all walks of life and children need to be prepared for the same. So, argument II is strong. Argument I holds no relevance."
  },
  {
    id: 36,
    question: "36. Statement: Should there be uniforms for students in the colleges in India as in the schools? Arguments: Yes, this will improve the ambience of the colleges as all the students will be decently dressed. No. The college students should not be regimented and they should be left to choose their clothes for coming to the college.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, after being in strict discipline and following a formal dress code of the school for so many years, the students must be granted some liberty in college life, as they have to take on the responsibilities of life, next. Besides, schools adopt uniforms to take care of the security of the child - an aspect which doesn't matter much in the colleges. So, argument II holds strong. Also, the environment of the college depends on the students' dedication and etiquettes and not on their uniforms. So, argument I is vague."
  },
  {
    id: 37,
    question: "37. Statement: Should India engage into a dialogue with neighbouring countries to stop cross border tension? Arguments: Yes. This is the only way to reduce the cross border terrorism and stop loss of innocent lives. No. Neighbouring countries cannot be relied upon in such matters, they may still engage in subversive activities.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, peaceful settlement through mutual agreement is the best option, whatever be the issue. So, argument I holds strong. Moreover, the problem indicated in II can be curbed by constant check and vigilance. So, II seems to be vague."
  },
  {
    id: 38,
    question: "38. Statement: Should there be a world government? Arguments: Yes. It will help in eliminating tensions among the nations. No. Then, only the developed countries will dominate in the government.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, a world government cannot eliminate tensions among nations because it will also have the ruling group and the opposition group. Further, the more powerful and diplomatic shall rule the world to their interests. So, only argument II holds."
  },
  {
    id: 39,
    question: "39. Statement: Should the practice of transfers of clerical cadre employees from government offices of one city to those of another be stopped? Arguments: No. Transfer of employees is a routine administrative matter and we must continue it. Yes. It involves lot of governmental expenditure and inconvenience too many compared to the benefits it yields.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: It is not necessary that any practice which has been in vogue for a long time is right and it must be continued. So, argument I is not strong. Also, a practice must be continued or discontinued in view of its merits/demerits and not on grounds of the expenditure or procedures it entails. The policy of transfer is generally practised to do away with corruption, which is absolutely essential. So, argument II also does not hold."
  },
  {
    id: 40,
    question: "40. Statement: Is paying ransom or agreeing to the conditions of kidnappers of political figures, a proper course of action? Arguments: Yes. The victims must be saved at all cost. No. It encourages the kidnappers to continue their sinister activities.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Both the arguments are strong enough. The conditions have to be agreed to, in order to save the life of the victims, though actually they ought not to be agreed to, as they encourage the sinister activities of the kidnappers."
  },
  {
    id: 41,
    question: "41. Statement: Should religion be banned? Arguments: Yes. It develops fanaticism in people. No, Religion binds people together.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 2,
    answerText: "c) Either I or II is strong",
    solution: "Explanation: Religion binds people together through the name of God and human values. But at the same time it may create differences and ill-will among people. So, either of the arguments holds strong."
  },
  {
    id: 42,
    question: "42. Statement: Should India become a permanent member of UN's Security Council? Arguments: Yes. India has emerged as a country which loves peace and amity. No. Let us first solve problems of our own people like poverty, malnutrition.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: A peace-loving nation like India can well join an international forum which seeks to bring different nations on friendly terms with each other. So, argument I holds strong. Argument II highlights a different aspect. The internal problems of a nation should not debar it from strengthening international ties. So, argument II is vague."
  },
  {
    id: 43,
    question: "43. Statement: Should fashionable dresses be banned? Arguments: Yes. Fashions keep changing and hence consumption of cloth increases. No. Fashionable clothes are a person's self expression and therefore his/her fundamental right.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, imposing ban on fashionable dresses will be a restriction on the personal choice and hence the right to freedom of an individual. So, only argument II is strong."
  },
  {
    id: 44,
    question: "44. Statement: Should an organization like UNO be dissolved? Arguments: Yes. With cold war coming to an end, such organizations have no role to play No, In the absence of such organizations there may be a world war.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: An organization like UNO is meant to maintain peace all over and will always serve to prevent conflicts between countries. So, its role never ends. So, argument I does not hold. Also, lack of such an organization may in future lead to increased mutual conflicts and international wars, on account of lack of a common platform for mutual discussions. So, argument II holds."
  },
  {
    id: 45,
    question: "45. Statement: Should there be no place of interview in selection? Arguments: Yes, it is very subjective in assessment. No. It is the only instrument to judge candidates' motives and personality.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, besides interview, there can be other modes of written examination to judge candidates' motives. So argument II is not strong enough. However, the interview is a subjective assessment without doubt. So, argument I holds."
  },
  {
    id: 46,
    question: "46. Statement: Should family planning be made compulsory in India? Arguments: Yes. Looking to the miserable conditions in India, there is no other go. No. In India there are people of various religions and family planning is against the tenets of some of the religions.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Family planning is an essential step to curb population growth. So, argument I holds strong. Also, family planning being against the tenets of some of the Indian religions, it is not necessary to make it compulsory. Instead, it can be enforced by creating public awareness of the benefits of family planning. So, argument II also holds."
  },
  {
    id: 47,
    question: "47. Statement: Should income tax be abolished in India? Arguments: Yes. It is an unnecessary burden on the wage earners. No. It is a good source of revenue.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Income -tax is levied so that every citizen can contribute a share of his earning towards the infrastructural development of the nation. So, argument I seems to be vague. However, income-tax is no doubt a good source of revenue for the government. Hence, argument II holds strong."
  },
  {
    id: 48,
    question: "48. Statement: Should there be a ceiling on the salary of top executives of multinationals in our country? Arguments: Yes. Otherwise it would lead to unhealthy competition and our own industry would not be able to withstand that. No. With the accent on liberalization of economy, any such move would be counter-productive. Once the economy picks up, this disparity will be reduced.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: In the absence of such a ceiling, the companies would be involved in a mutual competition of salaries, in a bid to attract the most competent professionals. So, argument I holds. Also, the prospects of increase in salary would encourage the officials to perform better in the interest of the company they serve, which would otherwise not be so if a ceiling is imposed. So, argument II also holds strong."
  },
  {
    id: 49,
    question: "49. Statement: Should school education be made free in India? Arguments: Yes. This is the only way to improve the level of literacy. No. It would add to the already heavy burden on the exchequer.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Making education free for all is not the only means to ensure literacy. An awareness needs to be aroused for this. So, argument I is vague. Also, such a step would require immense funds and lead to financial drain. So, argument II holds."
  },
  {
    id: 50,
    question: "50. Statement: Should import duty on all the electronic goods be dispensed with? Arguments: No. This will considerably reduce the income of the government and will adversely affect the developmental activities. No. The local manufacturers will not be able to compete with the foreign manufacturers who are technologically far superior.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Abolishing the import duty on electronic goods shall reduce the costs of imported goods and adversely affect the sale of the domestic products, thus giving a setback to the Indian electronics industry. So, argument II holds strong. Argument I does not provide a convincing reason."
  },
  {
    id: 51,
    question: "51. Statement: Should children be legally made responsible to take care of their parents during their old age? Arguments: Yes. Such matter can only be solved by legal means. Yes. Only this will bring some relief to poor parents.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Taking care of the parents is a moral duty of the children and cannot be thrust upon them legally, nor such a compulsion can ensure good care of the old people. So, none of the arguments holds strong."
  },
  {
    id: 52,
    question: "52. Statement: Should there be reservation in Government jobs for candidates from single child family? Arguments: No. This is not advisable as the jobs should be offered to only deserving candidates without any reservation for a particular group. Yes. This will help reduce the growing population in India as the parents will be encouraged to adopt single child norm.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: The Government has already made provisions for reservation of jobs for the economically backward sections, which is a must. So, abolishing the practice of reservation altogether has no meaning. Thus, argument I is vague. Also, more reservations would lead to non-recruitment of many more deserving candidates. Besides, such a reservation, if implemented, will cater to the job requirements of only a small section of population and not a major part of it. So, argument II also does not hold strong."
  },
  {
    id: 53,
    question: "53. Statement: Should higher education be completely stopped for some time? Arguments: No. It will hamper the country's future progress. Yes. It will reduce the educated unemployment.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, higher education is not the cause of unemployment. In fact, it has created greater job opportunities. So, argument II is vague. Also, higher education promotes the country's development. So, argument I holds."
  },
  {
    id: 54,
    question: "54. Statement: Should we scrap the 'Public Distribution System' in India? Arguments: Yes, Protectionism is over, everyone must get the bread on his/her own. Yes. The poor do not get any benefit because of corruption.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: The Public Distribution System is indeed necessary to provide basic amenities to the economically backward sections of population. So, argument I is vague. Also, if the Objectives of a system are not fulfilled because of corruption, then getting rid of the system is no solution. Instead, efforts should be made to end corruption and extend its benefits to the people for whom it is meant. So, argument II also does not hold,"
  },
  {
    id: 55,
    question: "55. Statement: Should India have no military force at all? Arguments: No. Other countries in the world do not believe in non-violence. Yes. Many Indians believe in non-violence.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Clearly, India needs to have military force to defend itself against the threat of other military powers in the world. So, none of the arguments holds strong."
  },
  {
    id: 56,
    question: "56. Statement: Are nuclear families better than joint families? Arguments: No. Joint families ensure security and also reduce the burden of work. Yes. Nuclear families ensure greater freedom.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Clearly, with so many people around in a joint family, there is more security. Also, work is shared. So, argument I holds. In nuclear families, there are lesser number of people and so lesser responsibilities and more freedom. Thus, II also holds."
  },
  {
    id: 57,
    question: "57. Statement: Should government stop spending huge amounts of money on international sports? Arguments: Yes. This money can be utilized for upliftment of the poor. No. Sports persons will be frustrated and will not get international exposure.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, spending money on sports cannot be avoided merely because it can be spent on socio-economic problems. So, argument I does not hold. Also, if the expenses on sports are curtailed, the sports persons would face lack of facilities and training and our country will lag behind in the international sports competitions. So, II holds."
  },
  {
    id: 58,
    question: "58. Statement: Should the railways immediately stop issuing free passes to all its employees? Arguments: No. The employees have the right to travel free. Yes. This will help railways to provide better facility.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: The free passes given to railway employees is a privilege for them, not their right. So, argument I does not hold. Argument II seems to be vague."
  },
  {
    id: 59,
    question: "59. Statement: Should there be compulsory medical examination of both the man and the woman before they marry each other? Arguments: No. This is an intrusion to the privacy of an individual and hence cannot be tolerated. Yes. This will substantially reduce the risk of giving birth to children with serious ailments.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, such a step would help to prevent the growth of diseases like AIDS. So, only argument II is strong."
  },
  {
    id: 60,
    question: "60. Statement: Should there be a ban on product advertising? Arguments: No. It is an age of advertising. Unless your advertisement is better than your other competitors, the product will not be sold. Yes. The money spent on advertising is very huge and it inflates the cost of the product.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Clearly, it is the advertisement which makes the customer aware of the qualities of the product and leads him to buy it. So, argument I is valid. But at the same time, advertising nowadays has become a costly affair and the expenses on it add to the price of the product. So, argument II also holds strong."
  },
  {
    id: 61,
    question: "61. Statement: Should luxury hotels be banned in India? Arguments: Yes. They are places from where international criminals operate. No. Affluent foreign tourists will have no place to stay.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, the luxury hotels are a mark of country's standard and a place for staying for the affluent foreign tourists. So, argument II holds. Argument I is not a strong reason because ban on hotels is not a way to do away with the activities of international criminals."
  },
  {
    id: 62,
    question: "62. Statement: Should shifting agriculture be practised? Arguments: No. It is a wasteful practice. Yes. Modern methods of farming are too expensive.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, shifting agriculture is a practice in which a certain crop is grown on a land and when it becomes infertile it is left bare and another piece of land is chosen. Clearly, it is a wasteful practice. So, only argument I holds."
  },
  {
    id: 63,
    question: "63. Statement: Should our country extend generous behaviour and goodwill to our erring and nagging neighbours? Arguments: Yes. Goodwill always pays dividend. No. Our generous behaviour and goodwill will be considered as our weakness.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Clearly, a good behaviour may at some point of time lead to mutual discussions and peaceful settlement of issues in the long run. So, argument I holds strong. However, such behaviour may be mistaken for our weakness and it would be difficult to continue with it if the other country doesn't stop its sinister activities. Hence, II also holds."
  },
  {
    id: 64,
    question: "64. Statement: Is pen mightier than a sword? Arguments: Yes. Writers influence the thinking of the people. No. With the help of physical force one can conquer all.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Physical force can accomplish a task by compulsion, while the influential writings can mould the thinking of an individual and change his discretion into accomplishing the task wilfully. So, only argument I holds strong."
  },
  {
    id: 65,
    question: "65. Statement: Should the sex determination test during pregnancy be completely banned? Arguments: Yes. This leads to indiscriminate female foeticide and eventually will lead to social imbalance. No. People have a right to know about their unborn child.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Parents indulging in sex determination of their unborn child generally do so as they want to only a boy child and do away with a girl child. So, argument I holds. Also, people have a right to know only about the health, development and general well-being of the child before its birth, and not the sex. So, argument II does not hold strong."
  },
  {
    id: 66,
    question: "66. Statement: Should persons convicted of criminal offences in the past be allowed to contest elections in India? Arguments: No. Such persons cannot serve the cause of the people and country. Yes. It is democracy - let people decide whom to vote.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, persons with criminal background cannot stand to serve as the representatives of the common people. So, they should not be allowed to contest elections. Thus, only argument I holds, while II does not."
  },
  {
    id: 67,
    question: "67. Statement: Should officers accepting bribe be punished? Arguments: No. Certain circumstances may have compelled them to take bribe. Yes. They should do the job they are entrusted with, honestly.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, officers are paid duly for the jobs they do. So, they must do it honestly. Thus, argument II alone holds."
  },
  {
    id: 68,
    question: "68. Statement: Should there be a complete ban on use of all types of chemical pesticides in India? Arguments: No. The pests will destroy all the crops and the farmers will have nothing to harvest. Yes. The chemical pesticides used in agriculture pollute the water underground and this has become a serious health hazard.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Clearly, pesticides are meant to prevent the crops from harmful pests. But at the same time, they get washed away with water and contaminate the groundwater. Thus, both the arguments hold strong."
  },
  {
    id: 69,
    question: "69. Statement: Should cutting of trees be banned altogether? Arguments: Yes. It is very much necessary to do so to restore ecological balance. No. A total ban would harm timber based industries.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Clearly, trees play a vital role in maintaining ecological balance and so must be preserved. So, argument I holds. Also, trees form the basic source of timber and a complete ban on cutting of trees would harm timber based industries. So, only a controlled cutting of trees should be allowed and the loss replenished by planting more trees. So, argument II is also valid."
  },
  {
    id: 70,
    question: "70. Statement: Should there be a restriction on the migration of people from one state to another state in India? Arguments: No. Any Indian citizen has a basic right to stay at any place of his/her choice and hence they cannot be stopped. Yes. This is the way to effect an equitable distribution of resources across the states in India.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, argument I holds strong, while argument II is vague."
  },
  {
    id: 71,
    question: "71. Statement: Should all refugees, who make unauthorized entry into a country, be forced to go back to their homeland? Arguments: Yes. They make their colonies and occupy a lot of land. No. They leave their homes because of hunger or some terror and on human grounds, should not be forced to go back.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, refugees are people forced out of their homeland by some misery and need shelter desperately. So, argument II holds. Argument I against the statement is vague."
  },
  {
    id: 72,
    question: "72. Statement: Should India create a huge oil reserve like some Western countries to face difficult situations in future? Arguments: No. There is no need to block huge amount of foreign exchange and keep the money idle. Yes. This will help India withstand shocks of sudden rise in oil prices due to unforeseen circumstances.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Oil, being an essential commodity, our country must keep it in reserve. So, argument I is vague, while argument II holds as it provides a substantial reason for the same."
  },
  {
    id: 73,
    question: "73. Statement: Should there be more than one High Court in each state in India? Arguments: No. This will be a sheer wastage of taxpayers' money. Yes. This will help reduce the backlog of cases pending for a very long time.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, an increase in the number of High Courts will surely speed up the work and help to do away with the pending cases. So, argument II holds strong. In light of this, the expenditure incurred would be 'utilization', not 'wastage' of money. So, argument I does not hold."
  },
  {
    id: 74,
    question: "74. Statement: Should judiciary be independent of the executive? Arguments: Yes. This would help curb the unlawful activities of the executive. No. The executive would not be able to take bold measures.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, independent judiciary is necessary for impartial judgement so that the Executive does not take wrong measures. So, only argument I holds."
  },
  {
    id: 75,
    question: "75. Statement: Should all the practising doctors be brought under Government control so that they get salary from the Government and treat patients free of cost? Arguments: No. How can any country do such an undemocratic thing? Yes. Despite many problems, it will certainly help minimize, if not eradicate, unethical medical practices.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: A doctor treating a patient individually can mislead the patient into wrong and unnecessary treatment for his personal gain. So, argument II holds strong. Also, a policy beneficial to common people cannot be termed 'undemocratic'. So, I is vague."
  },
  {
    id: 76,
    question: "76. Statement: Should students take part in politics? Arguments: Yes. It inculcates in them qualities of leadership. No. They should study and build up their career.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 2,
    answerText: "c) Either I or II is strong",
    solution: "Explanation: Clearly, indulgement in politics trains the students for future leadership but It sways them from the studies. So, either of the arguments I or II can hold."
  },
  {
    id: 77,
    question: "77. Statement: Should the opinion polls predicting outcome of elections before the elections be banned in India? Arguments: Yes. This may affect the voters mind and may affect the outcome. No. Such polls are conducted all over the world.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: The opinion polls may influence the thinking of an individual and thus divert his mind from his original choice. So, argument I holds strong. Further, blindly imitating a policy followed by other countries holds no relevance. So, argument II is vague."
  },
  {
    id: 78,
    question: "78. Statement: Should the political parties be banned? Arguments: Yes. It is necessary to teach a lesson to the politicians. No. It will lead to an end of democracy.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Clearly, with the ban on political parties, candidates can independently contest elections. So, it will not end democracy. Thus, argument II does not hold. Argument I does not give a strong reason."
  },
  {
    id: 79,
    question: "79. Statement: Should system of offering jobs only to the wards of government employees be introduced in all government offices in India? Arguments: No. It denies opportunity to many deserving individuals and government may stand to lose in the long run. No. It is against the principle of equality, does not government owe its responsibility to all its citizens?",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Merit, fair selection and equal opportunities for all - these three factors, if taken care of, can help government recruit competent officials and also fulfil the objectives of the Constitution. Thus, both the arguments hold strong."
  },
  {
    id: 80,
    question: "80. Statement: Should the vehicles older than 15 years be rejected in metros in India? Arguments: Yes. This is a significant step to lower down the pollution level in metros. No. It will be very difficult for vehicle owners to shift to other parts in country because they will not get suitable job for their very existence.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, 15 year old vehicles are not Euro-compliant and hence cause much more pollution than the recent ones. So, argument I holds. Argument II is vague since owners of these vehicles need not shift themselves. They might sell off their vehicles and buy new ones - a small price which every citizen can afford for a healthy environment."
  },
  {
    id: 81,
    question: "81. Statement: Should the tuition fees in all post-graduate courses be hiked considerably? Arguments: Yes. This will bring in some sense of seriousness among the students and will improve the quality. No. This will force the meritorious poor students to stay away from post-graduate courses.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: A hike in fees is no means to make the students more serious in studies. So, argument I is vague. However, with the increase in fees, poor meritorious students would not be able to afford post-graduate studies. So, argument II holds."
  },
  {
    id: 82,
    question: "82. Statement: Should the persons below the age of 18 years be allowed to join armed forces? Arguments: No. Persons below the age of 18 do not attain both physical and mental maturity to shoulder such burden. Yes. This will help the country develop its armed forces which will serve the country for a longer time.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: The armed forces must consist of physically strong and mentally mature individuals to take care of defence properly. So, argument I holds strong. Clearly, argument II holds no relevance."
  },
  {
    id: 83,
    question: "83. Statement: Should all the infrastructural development projects in India be handed over to the private sector? Arguments: No. The private sector entities are hot equipped to handle such projects. Yes. Such projects are handled by private sector in the developed countries.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Clearly, such projects if handed over to the private sector shall be given to a competent authority. So, argument I is vague. Also, imitating a policy on the basis that it worked out successfully in other countries holds no relevance. Thus, argument II also does not hold strong."
  },
  {
    id: 84,
    question: "84. Statement: Should all the colleges in India be allowed to devise their own curriculum and syllabus for the vocational courses promoting self-employment? Arguments: Yes. This is an important step to generate employment opportunities. No. This will affect the quality of education due to lack of uniformity in syllabus.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, colleges, if given a free hand, would through individual efforts come up with fresh, competent courses to draw in more students. This would open up new avenues for employment. So, argument I holds strong. In the light of this, argument II appears to be vague."
  },
  {
    id: 85,
    question: "85. Statement: Should agriculture in rural India be mechanized? Arguments: Yes. It would lead to higher production. No. Many villagers would be left unemployed.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, mechanization would speed up the work and increase the production. So, argument I is strong enough. Argument II is vague because mechanization will only eliminate wasteful employment, not create unemployment."
  },
  {
    id: 86,
    question: "86. Statement: Should there be concentration of foreign investment in only few states? Arguments: No. It is against the policy of overall development of the country. Yes. A large number of states lack infrastructure to attract foreign investment.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: An equitable distribution of foreign investment is a must for uniform development all over the country. So, argument I holds. Also, no backward state ought to be neglected, rather such states should be prepared and shaped up to attract. Foreign investment as well. So, II does not hold."
  },
  {
    id: 87,
    question: "87. Statement: Should the oil companies be allowed to fix the price of petroleum products depending on market conditions? Arguments: Yes. This is the only way to make the oil companies commercially viable. No. This will put additional burden on the retail prices of essential commodities and will cause a lot of hardships to the masses.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, oil is an essential commodity and its prices govern the prices of other essential commodities. As such, the interest of the common people must be taken care of, rather than the profitability of some oil companies. So, only argument II holds strong."
  },
  {
    id: 88,
    question: "88. Statement: Should the education at all levels be offered only in vernacular medium? Arguments: Yes. This is the only way to enhance performance of the students. No. This will severely affect acquiring knowledge for want of good text books in vernacular medium.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Teaching in vernacular medium would surely make it easy for students to grasp. But the use of 'only' in argument I makes if invalid. Also, teaching in international language would open up more avenues for students - in procuring books and study material, in going abroad for studies as well as taking up jobs which require interaction with people of different nationalities. So, argument II holds strong,"
  },
  {
    id: 89,
    question: "89. Statement: Should there be only one rate of interest for term deposits of varying durations in banks? Arguments: No. People will refrain from keeping money for longer duration resulting into reduction of liquidity level of banks. Yes. This will be much simple for the common people and they may be encouraged to keep more money in banks.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, the proposed scheme would discourage people from keeping deposits for longer durations (the rate of interest being the same for short durations) and not draw in more funds. So, only argument I holds."
  },
  {
    id: 90,
    question: "90. Statement: Should all news be controlled by Government in a democracy? Arguments: Yes. Variety of news only confuses people. No. Controlled news loses credibility.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, the variety of news helps people to develop their own views. So, argument I is vague. Also, controlled news shall be a partial produce. So, it loses credibility Thus, argument II holds."
  },
  {
    id: 91,
    question: "91. Statement: Should taxes on colour television be further increased? Arguments: Yes, Colour television is a luxury item and only rich people buy them. No, Televisions are bought by the poor too.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Clearly, taxes on an item cannot be increased or decreased on the basis of the financial position of the people who buy it. So, both arguments I and II do not hold strong."
  },
  {
    id: 92,
    question: "92. Statement: Should the educated unemployed youth be paid \"unemployment allowance\" by the Government? Arguments: Yes. It will provide them some monetary help to either seek employment or to kick-start some 'self-employment' venture. No. It will dampen their urge to do something to earn their livelihood and thus promote idleness among the unemployed youth.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: Young people, who do not get employment due to the large number of applicants in all fields, must surely be given allowance so that they can support themselves. So, argument I is valid. However, such allowances would mar the spirit to work, in them and make them idle. So, argument II also holds."
  },
  {
    id: 93,
    question: "93. Statement: Should higher education be restricted to only those who can bear the expenditure? Arguments: Yes. Higher education is very costly; hence it should not be given free. No. There are a large number of brilliant students who cannot afford to pay and they should be given higher education.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: For the all-round progress of the nation, all the students, especially the talented and intelligent ones, must avail of higher education, even if the government has to pay for it. So, only argument II holds."
  },
  {
    id: 94,
    question: "94. Statement: Should those who receive dowry, despite the law prohibiting it, be punished? Arguments: Yes. Those who violate the law must be punished. No. Dowry system is firmly rooted in the society since time immemorial.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, laws are made to ensure that no person pursues the practice. So, persons who violate the laws need to be punished. Thus, argument I holds. A wrong practice, no matter how firmly rooted, needs to be ended. So, argument II is vague."
  },
  {
    id: 95,
    question: "95. Statement: Is the Government justified in spending so much on defence? Arguments: Yes. Safety of the country is of prime importance. No. During peace, this money could be used for the development of the country.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, defence is necessary for the safety of the country, which is of prime importance. So, argument I holds. Also, a country can concentrate on internal progress and development only when it is safe from external aggressions. So, argument II does not hold."
  },
  {
    id: 96,
    question: "96. Statement: Should girls learn arts like judo and karate? Arguments: Yes. It will enable them to defend themselves from rogues and ruffians. No. They will lose their feminine grace.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Learning martial arts is necessary for girls for self-defence. So, argument I holds. However, argument II is vague since a training in these arts has nothing to do with their feminine grace."
  },
  {
    id: 97,
    question: "97. Statement: Should India develop a national water grid by connecting all the rivers in the country? Arguments: No. This is not just possible as we do not have the technical knowhow. Yes, this will greatly help the entire country by effectively channelizing the excess water to the areas having shortage.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: A single network of all the rivers in the country would surely enable a good distribution of water to all areas, So, argument II holds strong. Also, a policy beneficial to the nation cannot be hindered owing to lack of knowhow. Ways can be devised to build up such a network. So, argument I is vague."
  },
  {
    id: 98,
    question: "98. Statement: Should individuals/institutes having treasures of national significance like Nobel Prizes, hand them over to the Central Government for their safe custody? Arguments: Yes. The individuals or institutions do not have enough resources to protect them. No. These are the property of the individuals/institutions who win them and should be in their custody.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, the awards are given for individual excellence and perfection. So, only argument II holds strong."
  },
  {
    id: 99,
    question: "99. Statement: Should there be reservation of seats and posts on communal basis? Arguments: Yes. It will check most of the inter-communal biases. No, ours is a secular state.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 1,
    answerText: "b) Only argument II is strong",
    solution: "Explanation: Clearly, reservations on communal basis will increase inter-communal biases. So, argument I is vague. Also it will be against the secular policy, according to which no communal group is given preference over the others. So, only argument II holds."
  },
  {
    id: 100,
    question: "100. Statement: Should octroi be abolished? Arguments: Yes. It will eliminate an important source of corruption. No. It will adversely affect government revenues.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 4,
    answerText: "e) Both I and II are strong",
    solution: "Explanation: 'Octroi' is a custom duty. If octroi is abolished, the practice of bringing in things from foreign countries illegally will be abolished. So, argument I holds strong. Also, if octroi is abolished, the income to the government in the way of the duty paid shall be diminished. So, argument II also holds strong."
  },
  {
    id: 101,
    question: "101. Statement: Should public holidays be declared on demise of important national leaders? Arguments: No. Such unscheduled holidays hamper national progress. Yes. People would like to pay their homage to the departed soul.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, unscheduled and untimely holidays would naturally cause the work to suffer. So, argument I holds strong. Also, a holiday is not necessary to pay homage to someone. So, argument II is vague."
  },
  {
    id: 102,
    question: "102. Statement: Should India support all the international policies of United States of America? Arguments: No. Many other powerful countries do not support the same. Yes. This is the only way to gain access to USA developmental funds.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Our country cannot support USA's policies blindly without analysis, just to gain monetary help. Also, we should not withdraw our support without considering the policies, just because some other nations have done so. So, none of the arguments holds strong."
  },
  {
    id: 103,
    question: "103. Statement: Should words like 'Smoking is injurious to health essentially appear on cigarette packs? Arguments: Yes. It is a sort of brainwash to make the smokers realize that they are inhaling poisonous stuff. No. It hampers the enjoyment of smoking.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 0,
    answerText: "a) Only argument I is strong",
    solution: "Explanation: Clearly, such words on cigarette packs would warn the smokers beforehand of its adverse effects. So, argument I holds strong. However, smoking is a bad habit with long-term health hazards and is no means of enjoyment. So, argument II is vague."
  },
  {
    id: 104,
    question: "104. Statement: Should the council of ministers once appointed be kept the same for the entire period intervening two elections? Arguments: No. Shuffling of ministers and portfolios is a healthy democratic process. Yes. The ministers do not get a hold on their portfolio unless they are kept for a longer duration.",
    options: ["a) Only argument I is strong", "b) Only argument II is strong", "c) Either I or II is strong", "d) Neither I nor II is strong", "e) Both I and II are strong"],
    correctIndex: 3,
    answerText: "d) Neither I nor II is strong",
    solution: "Explanation: Shuffling of Cabinet ministers is just not a regular process, but a step to ensure proper working and implementation of schemes and avoid corruption. So, none of the arguments holds strong."
  },
  {
    id: 105,
    question: "105. Statement: Should people with educational qualification higher than the optimum requirements be debarred from seeking jobs? Arguments: No. It will further aggravate the problem of educated unemployment. Yes. It creates complexes among employees and affects the work adversely. No. This goes against the basic rights of the individuals.Yes. This will increase productivity.",
    options: ["a) Only I and III are strong", "b) All are strong", "c) Only II and IV are strong", "d) Only III is strong", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only III is strong",
    solution: "Explanation: The issue discussed in the statement is nowhere related to increase in unemployment, as the number of vacancies filled in will remain the same. Also, in a working place, it is the performance of the individual that matters and that makes him more or less wanted, and not his educational qualifications. So, neither I nor II holds strong. Besides, the needs of a job are laid down in the desired qualifications for the job. So, recruitment of more qualified people cannot augment productivity. Thus, IV also does not hold strong. However, it is the right of an individual to get the post for which he fulfils the eligibility criteria, whatever be his extra merits. Hence, argument III holds strong."
  },
  {
    id: 106,
    question: "106. Statement: Should India go in for computerization in all possible sectors? Arguments: Yes. It will bring efficiency and accuracy in the work. No. It will be an injustice to the monumental human resources which are at present underutilized. No. Computerization demands a lot of money. We should not waste money on it.Yes. When advanced countries are introducing computers in every field, how can India afford to lag behind?",
    options: ["a) Only I is strong", "b) Only I and II are strong", "c) Only I and III are strong", "d) Only II and III are strong", "e) All are strong"],
    correctIndex: 0,
    answerText: "a) Only I is strong",
    solution: "Explanation: Clearly, the need of today is to put to better use the underutilized human resources. Computers with better and speedy efficiency can accomplish this. So, argument I holds, while II does not. Computerization is a much beneficial project and investment in it is not at all a waste. So, III is not strong. Further, development in a new field is not a matter of merely following up other countries. So, IV also does not hold strong."
  },
  {
    id: 107,
    question: "107. Statement: Should all the school teachers be debarred from giving private tuitions? Arguments: No. The needy students will be deprived of the expertise of these teachers. Yes. This is an injustice to the unemployed educated people who can earn their living by giving tuitions. Yes. Only then the quality of teaching in schools will improve.Yes. Now salary of these teachers is reasonable.",
    options: ["a) Only I and III are strong", "b) Only I, II and III are strong", "c) Only III and IV are strong", "d) Only II, III and IV are strong", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Only III is strong. The lure of earning private tuitions reduces the efforts and devotion of the teachers towards the students in schools. So, if tuitions are banned, students can benefit from their teachers' knowledge in the school itself. So, argument III holds strong while I does not. However, a person cannot be barred from earning more just because he already has a good salary. So, argument IV is vague. Further, the unemployed people thriving on tuitions can survive with the school teachers holding tuitions too, if they are capable enough to guide the students well. So, argument II also does not hold strong."
  },
  {
    id: 108,
    question: "108. Statement: Should education be made compulsory for all children up to the age of 14? Arguments: Yes. This will help to eradicate the system of forced employment of these children. Yes. This is an effective way to make the entire population educated. No. We do not have adequate infrastructure to educate the entire population.Yes. This would increase the standard of living.",
    options: ["a) All are strong", "b) Only I, II and III are strong", "c) Only I, II and IV are strong", "d) Only II is strong", "e) Only II and III are strong"],
    correctIndex: 3,
    answerText: "d) Only II is strong",
    solution: "Explanation: Clearly, today's children are to make up future citizens of the country and so it is absolutely essential to make them learned, more responsible, more innovative and self-dependent by imparting them education. So, argument II holds strong while I and IV do not. Besides, the goal of literacy cannot be denied for want of infrastructure. So, argument III also does not hold."
  },
  {
    id: 109,
    question: "109. Statement: Should trade unions be banned completely? Arguments: Yes. Workers can concentrate on production. No. This is the only way through which employees can put their demands before the management. Yes. Employees get their illegal demands fulfilled through these unions.No. Trade unions are not banned in other economically advanced countries.",
    options: ["a) Only I is strong", "b) Only II is strong", "c) Only I and II are strong", "d) Only I, II and III are strong", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II is strong",
    solution: "Explanation: Clearly, trade unions provide a common platform for the workers to voice their demands and protests and thus ensure that they are not subdued or exploited. So, argument II holds strong, while I and III do not. Besides, the idea of imitation of other countries in the implementation of a certain policy holds no relevance. So, argument IV also does not hold strong."
  },
  {
    id: 110,
    question: "110. Statement: Should the public sector undertakings be kilo wed to adopt hire and fire policy? Arguments: Yes. This will help the public sector undertakings to get rid of non-performing employees and reward the performing employees. No. This will give an unjust handle to the management and they may use it indiscriminately. Yes. This will help increase the level of efficiency of these organizations and these will become profitable establishments.",
    options: ["a) None is strong", "b) Only I and II are strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) All are strong"],
    correctIndex: 3,
    answerText: "d) Only I and III are strong",
    solution: "Explanation: 'Hire and fire policy' implies 'taking up the performing employees and discarding the non-performing ones'. Clearly, such a policy would stand out to encourage employees to work hard and devotedly to retain their jobs and thus enhance productivity and profitability of the organizations. So, both arguments I and III hold strong. Argument II seems to be vague in the light of this."
  },
  {
    id: 111,
    question: "111. Statement: Is caste-based reservation policy in professional colleges justified? Arguments: Yes. The step is a must to bring the underprivileged at par with the privileged ones. No. It obstructs the establishment of a classless society. Yes. This will help the backward castes and classes of people to come out of the oppression of upper caste people.",
    options: ["a) Only I and II are strong", "b) Only II is strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) All are strong"],
    correctIndex: 1,
    answerText: "b) Only II is strong",
    solution: "Explanation: Clearly, capability is an essential criteria for a profession and reservation cannot ensure capable workers. So, neither I nor III holds strong. However, making one caste more privileged than the other through reservations would hinder the objectives of a classless society. So, argument II holds strong."
  },
  {
    id: 112,
    question: "112. Statement: Should there be a complete ban on genetically modified imported seeds? Arguments: Yes. This will boost the demand of domestically developed seeds. No. This is the only way to increase production substantially. Yes. Genetically modified products will adversely affect the health of those who consume these products.",
    options: ["a) Only I and II are strong", "b) Only II is strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) All are strong"],
    correctIndex: 1,
    answerText: "b) Only II is strong",
    solution: "Explanation: Genetically modified imported seeds have been specially formulated to increase the yield and quality of produce. So, argument II is strong. Besides, increase in production holds much more significance than the sale of domestically produced seeds. Thus, argument I does not hold. Also, the genetically modified seeds result in a producer of finer quality which is no way harmful to the consumer. So, III also does not hold strong."
  },
  {
    id: 113,
    question: "113. Statement: Should the income generated out of agricultural activities be taxed? Arguments: No. Farmers are otherwise suffering from natural calamities and low yield coupled with low procurement price and their income should not be taxed. Yes. Majority of the population is dependent on agriculture and hence their income should be taxed to augment the resources. Yes. Many big farmers earn much more than the majority of the service earners and they should be taxed to remove the disparity.",
    options: ["a) Only I is strong", "b) Only I and II are strong", "c) Only II and III are strong", "d) All are strong", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only II and III are strong",
    solution: "Explanation: Clearly, if the income of farmers is not adequate, they cannot be brought under the net of taxation as per rules governing the Income Tax Act. So, I is not strong. Besides, a major part of the population is dependent on agriculture and such a large section, if taxed even with certain concessions, would draw in huge funds, into the government coffers. Also, many big landlords with substantially high incomes from agriculture are taking undue advantage of this benefit. So, both arguments II and III hold strong."
  },
  {
    id: 114,
    question: "114. Statement: Should all the management institutes in the country be brought under government control? Arguments: No. The government does not have adequate resources to run such institutes effectively. No. Each institute should be given freedom to function on its own. Yes. This will enable to have standardized education for all the students.Yes. Only then the quality of education would be improved.",
    options: ["a) None is strong", "b) Only I, II and III are strong", "c) Only I and III are strong", "d) All are strong", "e) Only III is strong"],
    correctIndex: 0,
    answerText: "a) None is strong",
    solution: "Explanation: Clearly, the government can pool up resources to run such institutes, if that can benefit the citizens. So, I does not hold strong. II does not provide any convincing reason. Also, it is not obligatory that government control over the institutes would ensure better education than that at present. So, both III and IV also do not hold."
  },
  {
    id: 115,
    question: "115. Statement: Should the system of Lok Adalats and mobile courts be encouraged in India? Arguments: Yes. It helps to grant speedy justice to the masses. Yes. The dispensing of minor cases at this level would reduce the burden on the higher courts. No. These courts are usually partial in justice.",
    options: ["a) Only I and II are strong", "b) Only II and III are strong", "c) Only I and III are strong", "d) All are strong", "e) Only I is strong"],
    correctIndex: 0,
    answerText: "a) Only I and II are strong",
    solution: "Explanation: Courts are meant to judge impartially. So, argument III is vague. The system of local courts shall speed up justice by providing easy approach and simplified procedures, and thus ease the burden of the higher courts. So, I as well as II holds strong."
  },
  {
    id: 116,
    question: "116. Statement: Should India acquire/manufacture the latest nuclear weapons? Arguments: Yes. The enemies of India are improving their weapons continuously and it becomes imperative to protect the sovereignty and integrity of the country. No. Instead the money should be diverted to development activities. No. The international community will isolate Indians and this will bring a setback to Indian economy.No. It will be against our policy of maintaining world peace.",
    options: ["a) Only I is strong", "b) Only I and IV are strong", "c) Only I, II and IV are strong", "d) All are strong", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only I is strong",
    solution: "Explanation: Clearly, in the blind race for attaining nuclear powers, acquiring nuclear weapons is an inevitability to protect the country from the threat of nuclear powers. So, argument I holds strong. Also, defence of the country is as important as internal development. So, II does not hold. Argument III seems to be vague. Also, India intends to acquire nuclear weapons for self-defence and not aggression. So, argument IV also does not hold."
  },
  {
    id: 117,
    question: "117. Statement: Should there be a complete ban on manufacture and use of firecrackers? Arguments: No. This will render thousands of workers jobless. Yes. The firecracker manufacturers use child labour to a large extent. Yes. This will be a concrete step to reduce noise and air pollution.No. Use of firecrackers makes certain special occasions more lively and joyful.",
    options: ["a) Only I and II are strong", "b) Only I and III are strong", "c) Only III and IV are strong", "d) Only I, II and III are strong", "e) Only I, III and IV are strong"],
    correctIndex: 1,
    answerText: "b) Only I and III are strong",
    solution: "Explanation: Clearly, banning a product would surely render jobless the large number of workers involved in manufacturing it. Besides, firecrackers on burning produce explosive sounds and immense poisonous fumes, which cause both air and noise pollution. So, both arguments I and HI hold. However, to stop child labour, it is not necessary to close down the industry but strict laws against child abuse should be enforced and legal actions taken. Similarly, there are many other ways to make parties boisterous and special events enjoyable. Hence, II as well as IV does not hold strong."
  },
  {
    id: 118,
    question: "118. Statement: Should \"literacy\" be the minimum criterion for becoming a voter in India? Arguments: No. Mere literacy is no guarantee of political maturity of an individual. Yes. Illiterate people are less likely to make politically wiser decisions of voting for a right candidate or party. No. Voting is the constitutional right of every citizen.",
    options: ["a) None is strong", "b) Only I and II are strong", "c) Only III is strong", "d) Only II and III are strong", "e) All are strong"],
    correctIndex: 4,
    answerText: "e) All are strong",
    solution: "Explanation: Clearly, illiterate people lack will power and maturity in thoughts. They may easily be misled into false convictions or lured into temptations to vote for a particular group. So, argument II holds. However, a person is literate does not mean that he is conscious of all political movements, which requires practical awareness of everyday events. Thus, I also holds strong. Besides, Constitution has extended the right to vote equally to all its citizens. Hence, III also holds."
  },
  {
    id: 119,
    question: "119. Statement: Should there be only few banks in place of numerous smaller banks in India? Arguments: Yes. This will help secure the investor's money as these big banks will be able to withstand intermittent market related shocks. No. A large number of people will lose their jobs as after the merger many employees will be redundant. Yes. This will help consolidate the entire banking industry and will lead to healthy competition.",
    options: ["a) None is strong", "b) Only I and II are strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) All are strong"],
    correctIndex: 0,
    answerText: "a) None is strong",
    solution: "Explanation: The security of the investor's money is not related to the size of the bank. Besides even after consolidation, the number of investors, their amounts and hence the duties shall remain the same and so no employees will be redundant. Reducing the number of smaller banks will also not affect the mutual competition among the banks. Thus, none of the arguments holds strong."
  },
  {
    id: 120,
    question: "120. Statement: Should religion be taught in our schools? Arguments: No. Ours is a secular state. Yes. Teaching religion helps inculcate moral values among children. No. How can one dream of such a step when we want the young generation to fulfil its role in the 21st century.",
    options: ["a) All are strong", "b) None is strong", "c) Only I is strong", "d) Only II is strong", "e) Only I and III are strong"],
    correctIndex: 3,
    answerText: "d) Only II is strong",
    solution: "Explanation: Ours is a secular state does not mean that religion and religious values should be eradicated. In fact, these inculcate moral values. So, argument I is vague while argument II is strong. Also, teaching religion can in no way hinder the student's capability to face the challenges of the 21st century."
  },
  {
    id: 121,
    question: "121. Statement: Should the parliamentary elections in India be held every three years as against five years at present? Arguments: No. This will enhance wastage of money and resources. Yes. This will help the voters to change non-performing representatives without much delay. No. The elected representatives will not have enough time to settle and concentrate on developmental activities.",
    options: ["a) None is strong", "b) Only I and II are strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) All are strong"],
    correctIndex: 3,
    answerText: "d) Only I and III are strong",
    solution: "Explanation: The election process entails exorbitant expenditure. So, holding elections very often will surely lead to wastage of money and resources. Thus, I holds strong. Also, the elected representatives need a considerable period of time to implement their policies and also convince the voters of their working. So, III holds strong while II does not."
  },
  {
    id: 122,
    question: "122. Statement: Should the number of holidays of government employees be reduced? Arguments: Yes. Our government employees are having the maximum number of holidays among the countries of the world. Yes. It is a sign of British legacy, why should we carry it further? Yes. It will speed up work and all the pending jobs can be completed well in time.No. Employees must be given ample spare time to spend with their family.",
    options: ["a) Only I and III are strong", "b) Only III is strong", "c) Only I, III and IV are strong", "d) None is strong", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only III is strong",
    solution: "Explanation: Reducing the number of holidays just because no other country gives so many holidays or it is a feature of a certain system which we have renounced, does not seem convincing. So, neither I nor II holds strong. However, this step would surely help to reduce the backlog of pending cases and dispense with the new cases much more quickly than before. So, III holds strong. Even if the holidays are reduced, only the avoidable or seemingly unnecessary ones shall be cut short and the national holidays shall still remain to enjoy. So, IV also does not hold."
  },
  {
    id: 123,
    question: "123. Statement: Should class IV children have Board examination? Arguments: Yes. This will motivate the children to study and get higher marks, and thus more knowledge can be imbibed at a younger age. No. The children will be forced to study and won't enjoy the process. Yes. In today's competitive world the children need to be prepared right from the beginning to face such difficult examinations.No. This will add pressure on tender aged children and leave very little time for them to play.",
    options: ["a) All are strong", "b) Only I, II and IV are strong", "c) Only II, III and IV are strong", "d) Only I and III are strong", "e) Only I and IV are strong"],
    correctIndex: 2,
    answerText: "c) Only II, III and IV are strong",
    solution: "Explanation: Young children of class IV ought to be taught the basic fundamentals of subjects in a gradual process via practical examples and practice in a playful manner. They need not be made to study through compulsion and their age is not such as to bear the tension and burden of examinations. So, both II and IV hold strong. However, facing examinations at this stage shall prepare them to tackle the competitions in later life. So, III also holds. However, holding examinations cannot motivate such young and immature students, neither is it a way to make them learn more. So, I does not hold strong."
  },
  {
    id: 124,
    question: "124. Statement: Should the rule of wearing helmet for both driver and pillion rider while driving a motor bike be enforced strictly? Arguments: Yes. It is a rule and rules should be followed strictly by all. No. Each individual knows how to protect his own life and it should be left to his discretion. No. It does not ensure safety as only the head is protected and rest of the body is not.Yes. It is a necessity as head, being the most sensitive organ, is protected by the helmet.",
    options: ["a) None is strong", "b) Only I and III are strong", "c) Only I and IV are strong", "d) Only II and IV are strong", "e) All are strong"],
    correctIndex: 2,
    answerText: "c) Only I and IV are strong",
    solution: "Explanation: Clearly, the rule has been devised for the safety of two-wheeler riders, as majority of two wheeler accidents result in direct fall of the rider, leading to head injury and finally death. And the objective of a rule cannot be fulfilled until it is followed by all and this requires strict enforcement. Thus, both I and IV hold strong, while III does not. Besides, it is the basic duty of the Government to look after the safety of the citizens and it ought not leave it to the discretion of the individuals. So, argument II does not hold strong."
  },
  {
    id: 125,
    question: "125. Statement: Should all the students graduating in any discipline desirous of pursuing post-graduation of the subjects of their choice be allowed to enrol in the post-graduate courses? Arguments: Yes. The students are the best judge of their capabilities and there should not be restrictions for joining post-graduate courses. No. The students need to study relevant subjects in graduate courses to enrol in post-graduate courses and the students must fulfil such conditions. No. There are not enough institutes offering post-graduate courses which can accommodate all the graduates desirous of seeking post-graduate education of their own choice.",
    options: ["a) None is strong", "b) Only I and II are strong", "c) All are strong", "d) Only I and III are strong", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Only argument II is strong. The students cannot be enrolled in the courses just on the basis of their interests, but their compatibility with the same also matters. So, I does not hold. Besides, lack of institutes is no criteria to deny post-graduate courses to students. So, argument III also does not hold. II provides a genuine reason and thus holds strong."
  },
  {
    id: 126,
    question: "126. Statement: Should we impart sex education in schools? Arguments: Yes. All the progressive nations do so. No. We cannot impart it in co-educational schools. Yes. It would certainly help in eradicating the existing misunderstanding and make the younger generation physically and mentally healthier.It will destroy the moral fibre and the highly esteemed value system which we have inherited from our forefathers.",
    options: ["a) None is strong", "b) Only I, III and IV are strong", "c) Only II, III and IV are strong", "d) Only II and IV are strong", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Only II and III are strong. Clearly, the pursuance of a policy in India cannot be based on the pretext that it is followed in other countries because every country has its own environment and situations. So, argument I is vague. Also, imparting sex education in co-educational schools where boys and girls study together, could spoil the atmosphere there and hinder the studies. So, argument II is strong. However, sex education in schools can help students remove their misconceptions and doubts at a stage, when they would otherwise hesitate to discuss the same with others. Also, sex forms an integral part of the future life of the students and knowledge regarding the same, is nothing degenerative and shameful. So, argument III holds strong, while IV does not."
  },
  {
    id: 127,
    question: "127. Statement: Should coal engines be replaced by electric engines in trains? Arguments: Yes. Coal engines cause a lot of pollution. Yes. Electric engines are good on performance, easy to operate and low on maintenance. No. India does not produce enough electricity to fulfil its domestic needs also.",
    options: ["a) All are strong", "b) Only I and II are strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) Only I is strong"],
    correctIndex: 1,
    answerText: "b) Only I and II are strong",
    solution: "Explanation: Clearly, electric engines shall be smoke-free and thus not cause pollution as the coal engines. They also run at higher speeds and perform better. Thus, both I and II hold strong. Argument III does not provide a convincing reason and hence does not hold strong."
  },
  {
    id: 128,
    question: "128. Statement: Should all those who are convicted for heinous crimes like murder or rape, beyond all reasonable doubts be given capital punishment or death penalty? Arguments: No. The death penalty should be given only in very rare and exceptional cases. Yes. This is the only way to punish such people who take others' lives or indulge in inhuman activities. Yes. Such severe punishments only will make people refrain from such heinous acts and the society will be safer.No. Those who are repentant for the crime they committed should be given a chance to improve and lead a normal life.",
    options: ["a) Only II and IV are strong", "b) All are strong", "c) Only III is strong", "d) Only II and III are strong", "e) Only I, II and III are strong"],
    correctIndex: 2,
    answerText: "c) Only III is strong",
    solution: "Explanation: Clearly, a person committing a heinous crime like murder or rape should be so punished as to set an example for others not to attempt such acts in future. So, argument III holds strong. Argument I is vague while the use of the word 'only' in argument II makes it weak. Also, it cannot be assured whether a criminal is really repentant of his acts or not, he may also exhibit so just to get rid of punishment. So, argument IV also does not hold."
  },
  {
    id: 129,
    question: "129. Statement: Should all the profit making public sector units be sold to private companies? Arguments: Yes. This will help the government to augment its resources for implementing the development programmes. No. The private companies will not be able to run these units effectively. Yes. There will be a significant improvement in the quality of services.No. There would not be job security for the employees at all the levels.",
    options: ["a) Only II and III are strong", "b) All are strong", "c) Only III and IV are strong", "d) Only I, II and III are strong", "e) Only II, III and IV are strong"],
    correctIndex: 2,
    answerText: "c) Only III and IV are strong",
    solution: "Explanation: The government cannot sell off public sector units just to pool up funds for development. Besides, if it does so, these units shall be handed over to private companies which are fully equipped to run these units effectively. So, neither I nor II holds strong. Privatization shall surely ensure better services, but private companies adopt hire and fire policy and they are free to terminate the services of any employee as and when they wish to. Thus, both III and IV hold strong."
  },
  {
    id: 130,
    question: "130. Statement: Should all the youngsters below 21 years of age be disallowed from going to a beer bar? Arguments: No. It is not correct to prevent matured youngsters above 18 years of age who can vote, from having fun. Yes. The entry fee to such pubs should also be hiked. No. There is no such curb in western countries.Yes. This will help in preventing youngsters from getting into bad company and imbibing bad habits.",
    options: ["a) Only I is strong", "b) Only I and III are strong", "c) Only III and IV are strong", "d) Only I and IV are strong", "e) None is strong"],
    correctIndex: 3,
    answerText: "d) Only I and IV are strong",
    solution: "Explanation: Clearly, our Constitution considers youngsters above 18 years of age, mature enough to exercise their decisive power in Government by voting. This implies that such individuals can also judge what is good or bad for them. Thus, argument I holds strong. However, at such places, youngsters may be lead astray by certain indecent guys and swayed from the right path into bad indulgences. So, IV also holds strong. Hiking the entry fees is no way to disallow them, and also the idea of imitating the western countries holds no relevance. So, neither II nor III holds strong."
  },
  {
    id: 131,
    question: "131. Statement: Should the government ban all forms of protests including strikes and processions? Arguments: Yes. This is the only way to teach discipline to the employees. No. Government cannot deprive its citizens of their basic rights. Yes. This is the only way to ensure maximum productivity without disruption of work.",
    options: ["a) None is strong", "b) Only I and II are strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) All are strong"],
    correctIndex: 2,
    answerText: "c) Only II and III are strong",
    solution: "Explanation: Clearly, strike is not a means of indiscipline but only a practice in which the workers exercise their fundamental right to voice their protest against the atrocities of the management. So, argument I is vague while II holds. Also, the option of resorting to strikes often aggravates petty issues and disrupts work for long periods, thus affecting productivity. So, III also holds strong."
  },
  {
    id: 132,
    question: "132. Statement: Should children be prevented completely from watching television? Arguments: No. We get vital information regarding education through television. Yes. It hampers the study of children. Yes. Young children are misguided by certain programmes featuring sex and violence.No. This is the only way to educate the masses.",
    options: ["a) Only I, II and III are strong", "b) Only I is strong", "c) Only I, II and IV are strong", "d) Only I and II are strong", "e) Only I, III and IV are strong"],
    correctIndex: 1,
    answerText: "b) Only I is strong",
    solution: "Explanation: Clearly, television offers various educational programmes which are of great practical value to the students. So, it serves as a means (but it is not the 'only' means) to educate the masses. Thus, I holds strong while IV does not. Besides, the demerits of watching television, mentioned in II and III, may be done away with by allowing children to watch selected programmes on television, according to a set schedule. So, neither II nor III holds strong."
  },
  {
    id: 133,
    question: "133. Statement: Should mercy death be legalized, i.e., all those who are suffering from terminal diseases be allowed to end their lives if they so desire? Arguments: No. Nobody should be allowed to end his/her life at his/her will as this goes against the basic tenets of humanity. Yes. Patients undergoing terrible suffering and having absolutely no chance of recovery should be liberated from suffering through mercy death. No. Even mercy death is a sort of killing and killing can never be legalized.",
    options: ["a) None is strong", "b) Only I and II are strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) All are strong"],
    correctIndex: 4,
    answerText: "e) All are strong",
    solution: "Explanation: Clearly, mercy death will serve as a liberation to those to whom living is more difficult and painful. But then, it is an inhuman act and does not appeal. So, both arguments II and III hold strong. Besides, it becomes our moral duty to encourage such people to live their lives to the fullest and support them through the crisis/and not demoralize them by allowing them to die if they wish to. Hence, argument I also holds strong."
  },
  {
    id: 134,
    question: "134. Statement: Should seniority be the only criterion for the promotion? Arguments: No. It would be an injustice to those juniors who are more deserving and suitable for higher positions than their senior counterparts. Yes. Otherwise senior employees do feel humiliated. Yes. Senior employees are more experienced and must be rewarded for the same.",
    options: ["a) None is strong", "b) Only I is strong", "c) Only I and III are strong", "d) Only I and II are strong", "e) All are strong"],
    correctIndex: 1,
    answerText: "b) Only I is strong",
    solution: "Explanation: In an organization, what matters most is productivity and to ensure productivity, the organization needs to have effective managers and innovative, devoted and hard-working employees. Thus, the capability of the individual should be the only criterion for promotion. So, only argument I holds strong, while II and III do not."
  },
  {
    id: 135,
    question: "135. Statement: Should admission to all professional courses be made on the basis of past academic performance rather than through entrance tests? Arguments: Yes. It will be beneficial for those candidates who are unable to bear the expenses of entrance tests. Yes. Many deserving candidates securing high marks in their qualifying academic examinations do not perform well on such entrance tests. No. The standard of examinations and assessment conducted by different Boards and universities are not comparable and hence there is a need to conduct entrance tests to calibrate them on a common yardstick.",
    options: ["a) Only I and II are strong", "b) Only II and III are strong", "c) Only I and III are strong", "d) Only III is strong", "e) All are strong"],
    correctIndex: 3,
    answerText: "d) Only III is strong",
    solution: "Explanation: Clearly, a policy to select deserving candidates cannot be abolished just because of the expenditure it entails. So, argument I does not hold. Also, students who are intelligent enough to secure good marks in academic exams have no reason not to perform well in entrance tests. So, II also does not hold. Further, the students passed out from different universities are assessed on different patterns and hence a common entrance test would put the candidates to uniform test and assessment. So, only III holds strong."
  },
  {
    id: 136,
    question: "136. Statement: Should there be reservation of jobs in the organizations in the private sector also as in the public sector undertakings in India? Arguments: Yes. This would give more opportunities of development to the weaker sections of the society and thus help reduce the gap between the affluent and the downtrodden in India. No. The private sector does not get any government assistance and therefore they should not be saddled with such policies. No. Nowhere else in the world such a practice is being followed.No. The management of the private sector undertaking would not agree to such compulsions.",
    options: ["a) Only I is strong", "b) Only I and II are strong", "c) Only I, II and IV are strong", "d) Only I and IV are strong", "e) All are strong"],
    correctIndex: 0,
    answerText: "a) Only I is strong",
    solution: "Explanation: The reservation of jobs in the private sector too would surely increase opportunities for weaker sections to improve their economic plight. Thus, argument I is strong enough. Also, private sector companies work on a good profit margin and they can and will have to accommodate such a policy if implemented. So, neither II nor IV holds strong. Further, just imitating other countries holds no relevance. So, argument III also does not hold."
  },
  {
    id: 137,
    question: "137. Statement: Should workers/employees be allowed to participate in the management of factories in India? Arguments: Yes. It is the present management theory. No. Many workers are illiterate and so their contributions will not be of any value. Yes. Employees-owned companies generally have higher productivity.No. Employee-union ownership drives up salaries and wages.",
    options: ["a) Only I and II are strong", "b) None is strong", "c) Only II and III are strong", "d) All are strong", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only II and III are strong",
    solution: "Explanation: Argument I in support does not provide a valid reason for the pursuance of the policy. So, it is vague. Argument II provides a valid reason, as literacy is an essential criteria to take proper decisions on policy matters regarding management of factories. Besides, workers, if involved in management, would surely be motivated to work more devotedly, thus enhancing productivity. So, both II and III follow. IV provides a reason too feeble in the light of facts given in II and III. So, IV also does not hold strong."
  },
  {
    id: 138,
    question: "138. Statement: Should women be given equal opportunity in the matter of employment in every field? Arguments: Yes. They are equally capable. No. They have to shoulder household responsibilities. Yes. They should also go into the outside world.",
    options: ["a) Only I is strong", "b) Only I and II are strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) All are strong"],
    correctIndex: 3,
    answerText: "d) Only I and III are strong",
    solution: "Explanation: In present times, women are being imparted education at par with the men and are capable of competing with them in all professions and fields. So, argument I holds. Also, women cannot be confined to the household and kept away from the challenges of the outside world against their will. They too have the right to be self-dependent. Besides, present-day women are well looking to outside jobs together with the household jobs. So, argument III holds while II does not."
  },
  {
    id: 139,
    question: "139. Statement: Should government established higher level Institutes of Technology (IIT's) be privatized? Arguments: Yes. Privatization will make these institutes financially healthy, competitive and quality conscious. Yes. Privatization is the key of the new era - can we survive without it? No. Standard of education of these institutes will fall.",
    options: ["a) None is strong", "b) All are strong", "c) Only I is strong", "d) Only I and III are strong", "e) Only II and III are strong"],
    correctIndex: 2,
    answerText: "c) Only I is strong",
    solution: "Explanation: Clearly, privatization leads to betterment in a bid to win over the others in the field and earn both good reputation and money. So, argument I holds strong. Besides, privatization cannot be opted for just because it is the present trend. Also, privatization would, in no way, deteriorate the educational standards. So, neither II nor III holds."
  },
  {
    id: 140,
    question: "140. Statement: Should there be only one university throughout India? Arguments: Yes. This is the only way to bring about uniformity in the educational standards. No. This is administratively impossible. Yes. This will make the degrees procured by students, comparable for offering jobs.",
    options: ["a) None is strong", "b) Only I and II are strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) All are strong"],
    correctIndex: 2,
    answerText: "c) Only II and III are strong",
    solution: "Explanation: The use of the word 'only' in argument I makes it weak. To bring uniformity in educational standards, we can have many universities all following same curricular and policies under one Board. Also, having one university will make the management of education throughout the country almost impossible. So, argument II holds. Besides, it is the variation in the syllabi and assessment of different universities that makes their degrees incomparable, when the students from these universities come together to compete for a job on a common platform. This problem can be eradicated by implementing this scheme. So, argument III also holds strong."
  },
  {
    id: 141,
    question: "141. Statement: Should India immediately stop digging coal from its mines? Arguments: Yes. The present stock of coal will not last long if we continue mining at the present rate. No. We do not have alternate energy source of sufficient quantity. No. This will put millions of people at a disadvantage and their lives will get adversely affected and also the industry.",
    options: ["a) Only I and II are strong", "b) Only II and III are strong", "c) Only I and III are strong", "d) All are strong", "e) None is strong"],
    correctIndex: 1,
    answerText: "b) Only II and III are strong",
    solution: "Explanation: Though the reserves of coal are limited, yet stopping its use till alternate sources of energy have been discovered, is no solution to conserve it. So, I is not strong. It is true that we haven't till date found a renewable source of energy which is available in plenty and can substitute coal. So, II holds strong. Further, stopping coal mining would surely throw the engaged workers out of employment. So, III also holds strong."
  },
  {
    id: 142,
    question: "142. Statement: Should all the indirect taxes in India be combined into a single tax on all commodities? Arguments: Yes. This will considerably simplify the tax collection mechanism and the cost of collecting tax will also reduce. Yes. The manufacturers and traders will be benefited by this which in turn will boost tax collection. No. No other country has adopted such system.",
    options: ["a) None is strong", "b) Only I and III are strong", "c) Only II is strong", "d) Only II and III are strong", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Only I and II are strong. Clearly, both I and II hold strong, as they provide very convincing reasons, for a single tax system would help get rid of multifarious taxes on a product. Besides, the idea of imitation of other countries in the implementation of a certain policy holds no relevance. So, argument III does not hold strong."
  },
  {
    id: 143,
    question: "143. Statement: Should there be complete ban on Indian professionals seeking jobs elsewhere after getting their education in India? Arguments: Yes. This is the only way to sustain present rate of technological development in India. No. The Indians settled abroad send huge amount of foreign exchange and this constitutes a significant part of foreign exchange reserve. No. The practical knowledge gained by Indians by working in other countries help India develop its economy.",
    options: ["a) None is strong", "b) All are strong", "c) Only I and II are strong", "d) Only III is strong", "e) Only II and III are strong"],
    correctIndex: 0,
    answerText: "a) None is strong",
    solution: "Explanation: Clearly, none of the arguments provides a substantial reason either for or against the given statements. So, none of the arguments holds strong."
  },
  {
    id: 144,
    question: "144. Statement: Should there be a total ban on tobacco products and smoking in India? Arguments: Yes. It is wrong to smoke away millions of money. No. It will throw thousands of workers in the tobacco industry out of employment. No. The government will lose huge amount of money as it will not earn by way of taxes on these products.",
    options: ["a) None is strong", "b) Only I and II are strong", "c) Only II is strong", "d) Only II and III are strong", "e) All are strong"],
    correctIndex: 3,
    answerText: "d) Only II and III are strong",
    solution: "Explanation: Clearly, smoking needs to be abolished because it is injurious to health and not only to save money. So, argument I is vague. Banning a product would surely render jobless the large number of workers involved in manufacturing it. So, argument II holds strong. Also, tobacco products are a source of big revenue for the government. So, argument III also holds."
  },
  {
    id: 145,
    question: "145. Statement: Should administrative officers be transferred after one or two years? Arguments: Yes. They get friendly with local people and are manipulated by them. No. By the time their policies and schemes start taking shape, they have to leave. No. This will create a lot of administrative hassles and cause a lot of inconvenience to the officers.",
    options: ["a) Only II is strong", "b) Only I and II are strong", "c) Only II and III are strong", "d) Only I and III are strong", "e) All are strong"],
    correctIndex: 2,
    answerText: "c) Only II and III are strong",
    solution: "Explanation: Clearly, the acquaintance of administrative officers with the local people poses no harm. So, argument I is vague. However, both II and III hold strong, because making transfers too often would neither give them enough time to settle down comfortably in a new place, nor enable them to formulate and implement their policies in toto. This would also be administratively impossible."
  },
  {
    id: 146,
    question: "146. Statement: Should the consumption of aerated drinks be banned in India? Arguments: Yes. This is the only way to reduce the risk of exposing people to some diseases. No. Each individual should have right to choose what he wants. No. There is no confirmed evidence that such products have adverse effects on human body.Yes. It is banned in many other countries also.",
    options: ["a) Only I is strong", "b) Only I and II are strong", "c) Only III is strong", "d) Only I and IV are strong", "e) All are strong"],
    correctIndex: 2,
    answerText: "c) Only III is strong",
    solution: "Explanation: The use of 'only' in I makes it invalid. Also, it is the duty of the government to save its citizens from intake of any harmful products, even if they like them. So, II does not hold strong. Besides, a product must not be banned unless its harmful effects have been proved. So, III holds strong. Lastly, we cannot blindly follow the decisions taken by other countries. So, IV also does not hold."
  },
];

export const LOGICAL_DEDUCTION_QUESTIONS: PlacementQuestion[] = [
  {
    id: 1,
    question: "1. Statements: No women teacher can play. Some women teachers are athletes. Conclusions: Male athletes can play. Some athletes can play.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since one premise is negative, the conclusion must be negative. So, neither conclusion follows. Read: Important Rules and Formulas for Logical Deduction."
  },
  {
    id: 2,
    question: "2. Statements: All bags are cakes. All lamps are cakes. Conclusions: Some lamps are bags. No lamp is bag.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: Since the middle term 'cakes' is not distributed even once in the premises, no definite conclusion follows. However, I and II involve only the extreme terms and form a complementary pair. So, either I or II follows."
  },
  {
    id: 3,
    question: "3. Statements: All mangoes are golden in colour. No golden-coloured things are cheap. Conclusions: All mangoes are cheap. Golden-coloured mangoes are not cheap.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Clearly, the conclusion must be universal negative and should not contain the middle term. So, it follows that 'No mango is cheap'. Since all mangoes are golden in colour, we may substitute 'mangoes' with 'golden-coloured mangoes'. Thus, II follows."
  },
  {
    id: 4,
    question: "4. Statements: Some kings are queens. All queens are beautiful. Conclusions: All kings are beautiful. All queens are kings.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since one premise is particular, the conclusion must be particular. So, neither I nor II follows."
  },
  {
    id: 5,
    question: "5. Statements: Some doctors are fools. Some fools are rich. Conclusions: Some doctors are rich Some rich are doctors.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since both the premises are particular, no definite conclusion follows."
  },
  {
    id: 6,
    question: "6. Statements: All roads are waters. Some waters are boats. Conclusions: Some boats are roads. All waters are boats.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The first premise is A type and distributes the subject. So, the middle term 'waters' which forms its predicate, is not distributed. The second premise is I type and does not distribute either subject or predicate. So, the middle term 'waters' forming its subject is not distributed. Since the middle term is not distributed even once in the premises, no definite conclusion follows."
  },
  {
    id: 7,
    question: "7. Statements: No bat is ball. No ball is wicket. Conclusions: No bat is wicket. All wickets are bats.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since both the premises are negative, no definite conclusion follows."
  },
  {
    id: 8,
    question: "8. Statements: All flowers are trees. No fruit is tree. Conclusions: No fruit is flower. Some trees are flowers.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: As discussed above, the conclusion must be universal negative and should not contain the middle term. So, it follows that 'No flower is fruit'. I is the converse of this conclusion and thus it follows. II is the converse of the first premise and so it also holds."
  },
  {
    id: 9,
    question: "9. Statements: Every minister is a student. Every student is inexperienced. Conclusions: Every minister is inexperienced. Some inexperienced are students.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: 'Every' is equivalent to 'All'. Thus, since both the premises are universal and affirmative, the conclusion must be universal affirmative and should not contain the middle term. So, I follows. II is the converse of the second premise and thus it also holds."
  },
  {
    id: 10,
    question: "10. Statements: All roads are poles. No pole is a house. Conclusions: Some roads are houses. Some houses are poles.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since both the premises are universal and one premise is negative, the conclusion must be universal negative. So, neither I nor II follows."
  },
  {
    id: 11,
    question: "11. Statements: All fish are tortoise. No tortoise is a crocodile. Conclusions: No crocodile is a fish. No fish is a crocodile.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Since both the premises are universal and one premise is negative, the conclusion must be universal negative. Also, the conclusion should not contain the middle term. So, II follows; I is the converse of II and thus it also holds."
  },
  {
    id: 12,
    question: "12. Statements: Some dedicated souls are angels. All social workers are angels. Conclusions: Some dedicated souls are social workers. Some social workers are dedicated souls.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The first premise is an I type proposition. So, the middle term 'angels' forming the predicate is not distributed. The second premise is an A type proposition. So, the middle term 'angels' forming the predicate is not distributed. Since the middle term is not distributed even once in the premises, no definite conclusion follows."
  },
  {
    id: 13,
    question: "13. Statements: No gentleman is poor. All gentlemen are rich. Conclusions: No poor man is rich. No rich man is poor.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The first premise is an E-type proposition, So, the middle term 'gentleman' forming the subject is distributed. The second premise is an A-type proposition. So, the middle term 'gentlemen' forming the subject is distributed. Since the middle term is distributed twice, the conclusion cannot be universal. Since one premise is negative, the conclusion must be negative. Thus, it follows that 'Some rich men are not poor'. Thus, neither I nor II follows."
  },
  {
    id: 14,
    question: "14. Statements: Some swords are sharp. All swords are rusty Conclusions: Some rusty things are sharp. Some rusty things are not sharp.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, I follows. Since both the premises are affirmative, the conclusion cannot be negative. Thus, II does not follow."
  },
  {
    id: 15,
    question: "15. Statements: All fishes are grey in colour. Some fishes are heavy. Conclusions: All heavy fishes are grey in colour. All light fishes are not grey in colour.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some heavy things are grey in colour'. I is a cumulative result of this conclusion and the first premise. Thus, only I holds."
  },
  {
    id: 16,
    question: "16. Statements: All good athletes win. All good athletes eat well. Conclusions: All those who eat well are good athletes. All those who win eat well.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since the middle term 'good athletes' is distributed twice in the premises, the conclusion must be particular and should not contain the middle term. So it follows that 'Some of those who win, eat well'."
  },
  {
    id: 17,
    question: "17. Statements: All film stars are playback singers. All film directors are film stars. Conclusions: All film directors are playback singers. Some film stars are film directors.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Since both the premises are universal and affirmative, the conclusion must be universal affirmative and should not contain the middle term. So, I follows. II is the converse of the second premise and so it also holds."
  },
  {
    id: 18,
    question: "18. Statements: All hill stations have a sun-set point. X is a hill station. Conclusions: X has a sun-set point. Places other than hill stations do not have sun-set points.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since both the premises are universal and affirmative, the conclusion must be universal affirmative and should not contain the middle term. So, only I follows."
  },
  {
    id: 19,
    question: "19. Statements: Some dreams are nights. Some nights are days. Conclusions: All days are either nights or dreams. Some days are nights.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Since both the premises are particular, no definite conclusion follows. However, II is the converse of the second premise and thus it holds."
  },
  {
    id: 20,
    question: "20. Statements: All jungles are tigers. Some tigers are horses. Conclusions: Some horses are jungles. No horse is jungle.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: Since the middle term 'tigers' is not distributed even once in the premises, no definite conclusion follows. However, I and II involve only the extreme terms and form a complementary pair. So, either I or II follows."
  },
  {
    id: 21,
    question: "21. Statements: All poles are guns. Some boats are not poles. Conclusions: All guns are boats. Some boats are not guns.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Clearly, the term 'guns' is distributed in both the conclusions without being distributed in any of the premises. So, neither conclusion follows."
  },
  {
    id: 22,
    question: "22. Statements: Many scooters are trucks. All trucks are trains. Conclusions: Some scooters are trains. No truck is a scooter.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since the first premise is particular, the conclusion must be particular and should not contain the middle term. Thus, only I follows."
  },
  {
    id: 23,
    question: "23. Statements: Some papers are pens. Angle is a paper. Conclusions: Angle is not a pen. Angle is a pen.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: Since the middle term 'papers' is not distributed even once in the premises, no definite conclusion follows. However, I and II involve only the extreme terms and form a complementary pair. Thus, either I or II follows."
  },
  {
    id: 24,
    question: "24. Statements: All birds are tall. Some tall are hens. Conclusions: Some birds are hens. Some hens are tall.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Since the middle term 'tall' is not distributed even once in the premises, no definite conclusion follows. However, II is the converse of the second premise and so it holds."
  },
  {
    id: 25,
    question: "25. Statements: Some papers are pens. Some pencils are pens. Conclusions: Some pens are pencils. Some pens are papers.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Since both premises are particular, no definite conclusion follows. However, I is the converse of second premise, while II is the converse of the first premise. So, both of them hold."
  },
  {
    id: 26,
    question: "26. Statements: Some men are educated. Educated persons prefer small families. Conclusions: All small families are educated. Some men prefer small families.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Since one premise is particular, the conclusion must be particular and should not contain the middle term. Thus, only II follows."
  },
  {
    id: 27,
    question: "27. Statements: All educated people read newspapers. Rahul does not read newspaper. Conclusions: Rahul is not educated. Reading newspaper is not essential to be educated.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since both the premises are universal and one premise is negative, the conclusion must be universal negative and should not contain the middle term. So, only I follows."
  },
  {
    id: 28,
    question: "28. Statements: All pens are chalks. All chairs are chalks. Conclusions: Some pens are chairs. Some chalks are pens.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Since the middle term 'chalks' is not distributed even once in the premises, no definite conclusion follows. However, II is the converse of the first premise and so it holds."
  },
  {
    id: 29,
    question: "29. Statements: Bureaucrats marry only intelligent girls. Tanya is very intelligent. Conclusions: Tanya will marry a bureaucrat. Tanya will not marry a bureaucrat.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: The data does not mention whether all intelligent girls are married to bureaucrats. So, either I or II may follow."
  },
  {
    id: 30,
    question: "30. Statements: Some engineers are fools. Anand is an engineer. Conclusions: Some fools are engineers. Anand is a fool.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since the middle term 'engineer' is not distributed even once in the premises, no definite conclusion follows. However, I is the converse of the first premise and thus it holds."
  },
  {
    id: 31,
    question: "31. Statements: All windows are doors. No door is wall. Conclusions: No window is wall. No wall is door.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Since both the premises are universal and one premise is negative, the conclusion must be universal negative. Also, the conclusion should not contain the middle term. So, I follows. However, II is the converse of the second premise and thus it also holds,"
  },
  {
    id: 32,
    question: "32. Statements: Most teachers are boys. Some boys are students. Conclusions: Some students are boys. Some teachers are students.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since both the premises are particular, no definite conclusion follows. However, I is the converse of the second premise and thus it holds."
  },
  {
    id: 33,
    question: "33. Statements: No man is a donkey. Rahul is a man. Conclusions: Rahul is not a donkey. All men are not Rahul.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since on premise is negative, the conclusion must be negative. Conclusion II cannot follow as it contains the middle term. So, only I follows."
  },
  {
    id: 34,
    question: "34. Statements: Some books are pens. No pen is pencil. Conclusions: Some books are pencils. No book is pencil.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: As discussed above, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some books are not pencils'. However, I and II involve only the extreme terms and form a complementary pair. Thus, either I or II follows."
  },
  {
    id: 35,
    question: "35. Statements: All men are married. Some men are educated. Conclusions: Some married are educated. Some educated are married.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, I follows. II is the converse of I and thus it also holds."
  },
  {
    id: 36,
    question: "36. Statements: All tubes are handles. All cups are handles. Conclusions: All cups are tubes. Some handles are not cups.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Both the premises are A type propositions. So, in either, the middle term 'handles' forming the predicate is not distributed. Since the middle term is not distributed even once in the premises, no definite conclusion follows"
  },
  {
    id: 37,
    question: "37. Statements: No magazine is cap. All caps are cameras. Conclusions: No camera is magazine. Some cameras are magazines.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: As discussed above, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some cameras are not magazines'. However, I and II involve only the extreme terms and form a complementary pair. Thus, either I or II follows."
  },
  {
    id: 38,
    question: "38. Statements: All huts are mansions. All mansions are temples. Conclusions: Some temples are huts. Some temples are mansions.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: As discussed above, it follows that 'All huts are temples'. I is the converse of this conclusion and so it holds. II is the converse of the second premise and so it also holds."
  },
  {
    id: 39,
    question: "39. Statements: Some books are tables. Some tables are mirrors. Conclusions: Some mirrors are books. No book is mirror.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 2,
    answerText: "c) Either I or II follows",
    solution: "Explanation: Since both the premises are particular no definite conclusion follows. However, I and II involve only the extreme terms and form a complementary pair. Thus, either I or II follows."
  },
  {
    id: 40,
    question: "40. Statements: All trucks fly. Some scooters fly. Conclusions: All trucks are scooters. Some scooters do not fly.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since the middle term 'fly' is not distributed even once in the premises, no definite conclusion follows."
  },
  {
    id: 41,
    question: "41. Statements: Raman is always successful. No fool is always successful. Conclusions: Raman is a fool. Raman is not a fool.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Since both the premises are universal and one premise is negative, the conclusion must be universal negative and should not contain the middle term. So, only II follows."
  },
  {
    id: 42,
    question: "42. Statements: Some desks are caps. No cap is red. Conclusions: Some caps are desks. No desk is red.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since one premise is particular and the other premise is negative, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some desks are not red'. However, I is the converse of the first premise and thus it holds."
  },
  {
    id: 43,
    question: "43. Statements: Some hens are cows. All cows are horses. Conclusions: Some horses are hens. Some hens are horses.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 4,
    answerText: "e) Both I and II follow",
    solution: "Explanation: Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, II follows. I is the converse of II and so it also holds."
  },
  {
    id: 44,
    question: "44. Statements: All water is divine. All temples are divine. Conclusions: All water is temple. All temples are water.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since the middle term 'divine' is not distributed even once in the premises, no definite conclusion can be drawn."
  },
  {
    id: 45,
    question: "45. Statements: All men are dogs. All dogs are cats. Conclusions: All men are cats. All cats are men.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since both the premises are universal and affirmative, the conclusion must be universal affirmative. However, conclusion II, being an A-type proposition, distributes the term 'cats'. Since the term 'cats' is distributed in II without being distributed in any of the premises, so conclusion II cannot follow. Thus, only I follows."
  },
  {
    id: 46,
    question: "46. Statements: All young scientists are open-minded. No open-minded men are superstitious. Conclusions: No scientist is superstitious. No young people are superstitious.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: The subject in both the conclusions is vague. The true conclusion is 'No young scientist is superstitious'. Thus, neither I nor II follows,"
  },
  {
    id: 47,
    question: "47. Statements: Some pastries are toffees. All toffees are chocolates. Conclusions: Some chocolates are toffees. Some toffees are not pastries.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 0,
    answerText: "a) Only conclusion I follows",
    solution: "Explanation: Since one premise is particular, the conclusion must be particular and should not contain the middle term. Thus, it follows that 'Some pastries are chocolates', I is the converse of the second premise and so it holds. Since both the premises are affirmative, the conclusion cannot be negative. Thus, II does not follow."
  },
  {
    id: 48,
    question: "48. Statements: All boys are honest. Sachin is honest. Conclusions: Sachin is a boy. All honest persons are boys.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Both the premises are A type propositions. So, the middle term 'honest' forming the predicate in each is not distributed in either. Since the middle term is not distributed even once, no definite conclusion follows."
  },
  {
    id: 49,
    question: "49. Statements: All pens are roads. All roads are houses. Conclusions: All houses are pens. Some houses are pens.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 1,
    answerText: "b) Only conclusion II follows",
    solution: "Explanation: Since both the premises are universal and affirmative, the conclusion must be universal affirmative and should not contain the middle term. So, it follows that 'All pens are houses'. II is the converse of this conclusion and so it holds. Since the term 'houses' is distributed in I without being distributed in any of the premises, so I does not follow."
  },
  {
    id: 50,
    question: "50. Statements: All artists are smokers. Some smokers are drunkards. Conclusions: All smokers are artists. Some drunkards are not smokers.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since the middle term 'smokers' is not distributed even once in the premises, no definite conclusion follows."
  },
  {
    id: 51,
    question: "51. Statements: All cars are cats. All fans are cats. Conclusions: All cars are fans Some fans are cars.",
    options: ["a) Only conclusion I follows", "b) Only conclusion II follows", "c) Either I or II follows", "d) Neither I nor II follows", "e) Both I and II follow"],
    correctIndex: 3,
    answerText: "d) Neither I nor II follows",
    solution: "Explanation: Since the middle term 'cats' is not distributed even once in the premises, no definite conclusion follows."
  },
  {
    id: 52,
    question: "52. Statements: All branches are flowers. All flowers are leaves. Conclusions: All branches are leaves. All leaves are branches. All flowers are branches. Some leaves are branches.",
    options: ["a) None follows", "b) Only I and IV follow", "c) Only II and III follow", "d) All follow"],
    correctIndex: 1,
    answerText: "b) Only I and IV follow",
    solution: "Explanation: Since both the premises are universal and affirmative, the conclusion must be universal affirmative and should not contain the middle term. So, it follows that 'All branches are leaves'. Thus, I follows. IV is the converse of this conclusion and so it also holds."
  },
  {
    id: 53,
    question: "53. Statements: Some bags are pockets. No pocket is a pouch. Conclusions: No bag is a pouch. Some bags are not pouches. Some pockets are bags. No pocket is a bag,",
    options: ["a) None follows", "b) Only I and III follow", "c) Only II and III follow", "d) Only either I or IV follows", "e) All follow"],
    correctIndex: 2,
    answerText: "c) Only II and III follow",
    solution: "Explanation: Since one premise is particular and the other negative, the conclusion must be particular negative and should not contain the middle term. So, II follows. III is the converse of the first premise and thus it also holds."
  },
  {
    id: 54,
    question: "54. Statements: All aeroplanes are trains. Some trains are chairs. Conclusions: Some aeroplanes are chairs. Some chairs are aeroplanes. Some chairs are trains. Some trains are aeroplanes.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only II and III follow", "d) Only III and IV follow"],
    correctIndex: 3,
    answerText: "d) Only III and IV follow",
    solution: "Explanation: Since the middle term 'trains' is not distributed even once in the/premises, no definite conclusion follows. However, III is the converse of the second premise while IV is the converse of the first premise. So, both of them hold."
  },
  {
    id: 55,
    question: "55. Statements: All politicians are honest. All honest are fair. Conclusions: Some honest are politicians. No honest is politician. Some fair are politicians. All fair are politicians.",
    options: ["a) None follows.", "b) Only I follows.", "c) Only I and II follow.", "d) Only I and III follow"],
    correctIndex: 3,
    answerText: "d) Only I and III follow",
    solution: "Explanation: Clearly, it follows that 'All politicians are fair'. I is the converse of the first premise, while III is the converse of the above conclusion. So, both I and III hold."
  },
  {
    id: 56,
    question: "56. Statements: Some clothes are marbles. Some marbles are bags. Conclusions: No cloth is a bag. All marbles are bags. Some bags are clothes. No marble is a cloth.",
    options: ["a) Only either I or IV follows", "b) Only either I or II follows", "c) None follows", "d) Only either I or III follows"],
    correctIndex: 3,
    answerText: "d) Only either I or III follows",
    solution: "Explanation: Since both the premises are particular, no definite conclusion follows. However, I and III involve only the extreme terms and form a complementary pair. Thus, either I or III follows."
  },
  {
    id: 57,
    question: "57. Statements: Some tables are TVs. Some TVs are radios. Conclusions: Some tables are radios. Some radios are tables. All radios are TVs. All TVs are tables.",
    options: ["a) None follows", "b) All follow", "c) Only I and III follow", "d) Only II and IV follow"],
    correctIndex: 0,
    answerText: "a) None follows",
    solution: "Explanation: Since both the premises are particular, no definite conclusion follows."
  },
  {
    id: 58,
    question: "58. Statements: All terrorists are guilty. All terrorists are criminals. Conclusions: Either all criminals are guilty or all guilty are criminals. Some guilty persons are criminals. Generally criminals are guilty. Crime and guilt go together.",
    options: ["a) Only I follows", "b) Only I and III follow", "c) Only II follows", "d) Only II and IV follow"],
    correctIndex: 2,
    answerText: "c) Only II follows",
    solution: "Explanation: Since the middle term 'terrorists' is distributed twice in the premises, the conclusion cannot be universal. So, it follows that 'Some guilty persons are criminals'. Thus, II holds."
  },
  {
    id: 59,
    question: "59. Statements: Some books are pens. No pen is pencil. Conclusions: Some pens are books. Some pencils are books. Some books are not pencils. All pencils are books.",
    options: ["a) Only I follows", "b) Only II and III follow", "c) Only I and III follow", "d) Only I and II follow"],
    correctIndex: 2,
    answerText: "c) Only I and III follow",
    solution: "Explanation: Since one premise is particular and the other negative, the conclusion must be particular negative and should not contain the middle term. Thus, III follows. I is the converse of the first premise and so it also holds."
  },
  {
    id: 60,
    question: "60. Statements: Some bottles are drinks. All drinks are cups. Conclusions: Some bottles are cups. Some cups are drinks. All drinks are bottles. All cups are drinks.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only II and IV follow", "d) Only III and IV follow", "e) Only I and IV follow"],
    correctIndex: 0,
    answerText: "a) Only I and II follow",
    solution: "Explanation: Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some bottles are cups'. Thus, I follows. II is the converse of the second premise and so it also holds."
  },
  {
    id: 61,
    question: "61. Statements: Some houses are offices. Some offices are schools. Conclusions: Some schools are houses. Some offices are houses. No house is school. Some schools are offices.",
    options: ["a) Only II and III follow", "b) Only I and IV follow", "c) Only either III or IV, and I follow", "d) Only II and IV and either I or III follow."],
    correctIndex: 3,
    answerText: "d) Only II and IV and either I or III follow.",
    solution: "Explanation: Since both the premises are particular, no definite conclusion follows. However, I and III involve only the extreme terms and form a complementary pair. So, either I or III follows. II is the converse of the first premise while IV is the converse of the second premise. Thus, both of them hold."
  },
  {
    id: 62,
    question: "62. Statements: Some taxis have horns. Some taxis have lights. Conclusions: Every taxi has either horn or light. Some taxis have neither light nor horn. Some taxis have horns as well as lights. No taxi has horn as well as light.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only II and IV follow", "d) Either III or IV follows", "e) All follow"],
    correctIndex: 3,
    answerText: "d) Either III or IV follows",
    solution: "Explanation: Since both the premises are particular, no definite conclusion follows. However, III and IV form a complementary pair. Thus, either III or IV follows."
  },
  {
    id: 63,
    question: "63. Statements: All fruits are vegetables. All pens are vegetables. All vegetables are rains. Conclusions: All fruits are rains. All pens are rains. Some rains are vegetables.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only II and III follow", "d) Only I and III follow", "e) All follow"],
    correctIndex: 4,
    answerText: "e) All follow",
    solution: "Explanation: III is the converse of the third premise and so it holds.All fruits are vegetables. All vegetables are rains.The conclusion must be universal affirmative and should not contain the middle term.So, it follows that 'All fruits are rains'. Thus, I follows.All pens are vegetables. All vegetables are rains.Clearly, it follows that 'All pens are rains'. Thus, II follows."
  },
  {
    id: 64,
    question: "64. Statements: Some towels are brushes. No brush is soap. All soaps are rats. Conclusions: Some rats are brushes. No rat is brush. Some towels are soaps.",
    options: ["a) None follows", "b) Only either I or II follows", "c) Only II follows", "d) Only I and III follow", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only either I or II follows",
    solution: "Explanation: Some towels are brushes. No brush is soap.Since one premise is particular and the other negative, the conclusion must be particular negative (O-type) and should not contain the middle term. So, it follows that 'Some towels are not soaps'. No brush is soap. All soaps are rats.Since the middle term is distributed twice, the conclusion must be particular. Since one premise is negative, the conclusion must be negative. So, it follows that 'Some brushes are not rats'. Since I and II involve the same terms and form a complementary pair, so either I or II follows."
  },
  {
    id: 65,
    question: "65. Statements: Some pictures are frames. Some frames are idols. All idols are curtains. Conclusions: Some curtains are pictures. Some curtains are frames. Some idols are frames.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only II and III follow",
    solution: "Explanation: III is the converse of the second premise and so it holds.Some pictures are frames. Some frames are idols.Since both the premises are particular, no definite conclusion follows.Some frames are idols. All idols are curtains.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some frames are curtains'. III is the converse of this conclusion and so it holds.Some pictures are frames. Some frames are curtains.Since both the premises are particular, no definite conclusion can be drawn."
  },
  {
    id: 66,
    question: "66. Statements: Some hills are rivers. Some rivers are deserts. All deserts are roads. Conclusions: Some roads are rivers. Some roads are hills. Some deserts are hills.",
    options: ["a) None follows", "b) Only I follows", "c) Only I and II follow", "d) Only II and III follow", "e) All follow"],
    correctIndex: 1,
    answerText: "b) Only I follows",
    solution: "Explanation: Some hills are rivers. Some rivers are deserts.Since both the premises are particular, no definite conclusion follows.Some rivers are deserts. All deserts are roads.Since one premise is particular, the conclusion must be particular and shouldn't contain the middle term. So, it follows that 'Some rivers are roads'. I is the converse of this conclusion and so it holds.Some hills are rivers. Some rivers are roads.Again, since both the premises are particular, no definite conclusion follows."
  },
  {
    id: 67,
    question: "67. Statements: Some saints are balls. All balls are bats. Some tigers are balls. Conclusions: Some bats are tigers. Some saints are bats. All bats are balls.",
    options: ["a) Only I and II follow", "b) Only II follows", "c) Only I and III follow", "d) Only III follows", "e) None of these."],
    correctIndex: 0,
    answerText: "a) Only I and II follow",
    solution: "Explanation: Some saints are balls. All balls are bats.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some saints are bats'. Thus, II follows. Some tigers are balls. All balls are bats.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some tigers are bats'. I is the converse of this conclusion and so it holds."
  },
  {
    id: 68,
    question: "68. Statements: Some pens are books. All schools are books. Some colleges are schools. Conclusions: Some colleges are pens. Some pens are schools. Some colleges are books.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: Some pens are books. All schools are books.Since the middle term 'books' is not distributed even once in the premises, so no definite conclusion follows.Some colleges are schools. All schools are books.Since one premise is particular, the conclusion must be particular and should not contain the middle term.So, it follows that 'Some colleges are books'. Thus, III follows.Some pens are books. Some colleges are books.Since both the premises are particular, no definite conclusion can be drawn.Hence, only III follows."
  },
  {
    id: 69,
    question: "69. Statements: All trains are buses. No room is bus. All boats are rooms. Conclusions: No boat is train. No bus is boat. No train is room.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only II and III follow", "d) Only I and III follow", "e) All follow"],
    correctIndex: 4,
    answerText: "e) All follow",
    solution: "Explanation: All trains are buses. No room is bus.Since both the premises are universal and one premise is negative, the conclusion must be universal negative (E-type) and should not contain the middle term. So, it follows that 'No train is room'. Thus, III follows.All boats are rooms. No room is bus.As discussed above, it follows that 'No boat is bus'.II is the converse of this conclusion and so it holds. All trains are buses. No boat is bus.Again, it follows that 'No train is boat'. I is the converse of this conclusion and so it holds."
  },
  {
    id: 70,
    question: "70. Statements: Some mountains are hillocks. Some mountains are rivers. Some mountains are valleys. Conclusions: All mountains are either hillocks or rivers or valleys. No valley is river. Some river are valleys.",
    options: ["a) None follows", "b) Only I follows", "c) Only either II or III follows", "d) Only III follows", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only either II or III follows",
    solution: "Explanation: Since each combination of premises shall contain two particular premises, no definite conclusion can be drawn. However, II and III are statements involving the extreme terms of the last two premises and form a complementary pair. Thus, either II or III follows."
  },
  {
    id: 71,
    question: "71. Statements: Some blades are hammers. Some hammers are knives. Some knives are axes. Conclusions: Some axes are hammers. Some knives are blades. Some axes are blades.",
    options: ["a) None follows", "b) Only I follows", "c) Only II follows", "d) Only III follows", "e) None of these"],
    correctIndex: 0,
    answerText: "a) None follows",
    solution: "Explanation: Since each combination of premises has two particular premises, so no definite conclusion follows."
  },
  {
    id: 72,
    question: "72. Statements: Some boxes are hammers. Some hammers are beads. All beads are rings. Conclusions: Some rings are hammers. Some hammers are boxes. Some rings are boxes.",
    options: ["a) None follows", "b) Only I follows", "c) Only I and II follow", "d) Only II and III follow", "e) All follow"],
    correctIndex: 2,
    answerText: "c) Only I and II follow",
    solution: "Explanation: II is the converse of first premise and so it holds.Some boxes are hammers. Some hammers are beads.Since both the premises are particular, no definite conclusion can be drawn.Some hammers are beads. All beads are rings.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some hammers are rings'. I is the converse of this conclusion and so it holds.Some boxes are hammers. Some hammers are rings.Since both the premises are particular, no definite conclusion can be drawn."
  },
  {
    id: 73,
    question: "73. Statements: Some blankets are beds. Some pillows are blankets. All beds are pillows. Conclusions: Some blankets are pillows. Some pillows are beds. Some beds are blankets.",
    options: ["a) Only either I or II follows", "b) Only I and either II or III follow", "c) Only III and either I or II follow", "d) All I, II and III follow", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All I, II and III follow",
    solution: "Explanation: I is the converse of the second premise, II is the converse of the third premise and III is the converse of the first premise and as such, all three of them follow."
  },
  {
    id: 74,
    question: "74. Statements: All dolls are windows. All bottles are windows. All cars are bottles. Conclusions: All cars are windows. Some cars are dolls. Some windows are cars.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I and III follow", "d) All follow", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only I and III follow",
    solution: "Explanation: All cars are bottles. All bottles are windows.Since both the premises are universal, the conclusion must be universal and shouldn't contain the middle term, So, it follows that 'All cars are windows'. Thus, I follows.Also, III is the converse of this conclusion and so it holds.All dolls are windows. All bottles are windows.Since the middle term 'windows' is not distributed even once in the premises, no definite conclusion follows.All cars are windows. All bottles are windows.Again, the middle term 'windows' is not distributed even once in the premises.So, no definite conclusion follows."
  },
  {
    id: 75,
    question: "75. Statements: All tigers are lions. No cow is lion. Some camels are cows. Conclusions: Some lions are camels. No camel- is tiger. Some tigers are cows.",
    options: ["a) None follows", "b) Only I follows", "c) Only II follows", "d) Only III follows", "e) Either I or II follows"],
    correctIndex: 0,
    answerText: "a) None follows",
    solution: "Explanation: All tigers are lions. No cow is lion.Since both the premises are universal and one premise is negative, the conclusion must be universal negative (E-type) and shouldn't contain the middle term. So, it follows that 'No tiger is cow'.Some camels are cows. No cow is lion.Since one premise is particular and the other negative, the conclusion must be particular negative (O-type) and should not contain the middle term. So, it follows that 'Some camels are not lions'. Some camels are cows. No tiger is cow.Since one premise is particular and the other negative, the conclusion must be particular negative (O-type) and should not contain the middle term. So, it follows that 'Some camels are not tigers'."
  },
  {
    id: 76,
    question: "76. Statements: All flowers are toys. Some toys are trees. Some angels are trees. Conclusions: Some angels are toys. Some trees are flowers. Some flowers are angels.",
    options: ["a) None follows", "b) Only I follows", "c) Only II follows", "d) Only III follows", "e) Only I and III follow"],
    correctIndex: 0,
    answerText: "a) None follows",
    solution: "Explanation: All flowers are toys. Some toys are trees.Since the middle term 'toys' is not distributed even once in the premises, no definite conclusion follows.Some toys are trees. Some angels are trees.Since both the premises are particular, no definite conclusion can be drawn."
  },
  {
    id: 77,
    question: "77. Statements: Some rats are cats. Some cats are dogs. No dog is cow. Conclusions: No cow is cat. No dog is rat. Some cats are rats.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only II and III follow", "d) Only III follows", "e) All I, II and III follow"],
    correctIndex: 3,
    answerText: "d) Only III follows",
    solution: "Explanation: III is the converse of the first premise and so it holds.Some rats are cats. Some cats are dogs.Since both the premises are particular, no definite conclusion follows.Some cats are dogs. No dog is cow.Since one premise is particular and the other negative, the conclusion must be particular negative (O-type) and should not contain the middle term. So, it follows that 'Some cats are not cows'."
  },
  {
    id: 78,
    question: "78. Statements: All tigers are jungles. No jungle is bird. Some birds are rains. Conclusions: No rain is jungle. Some rains are jungles. No bird is tiger.",
    options: ["a) Only I and II follow", "b) Only III follows", "c) Only either I or II, and III follow", "d) All follow", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only either I or II, and III follow",
    solution: "Explanation: All tigers are jungles. No jungle is bird.Since both the premises are universal and one premise is negative, the conclusion must be universal negative (E-type) and should not contain the middle term.So, it follows that 'No tiger is bird'. III is the converse of this conclusion and so it holds.No jungle is bird. Some birds are rains.Since one premise is particular and the other negative, the conclusion must be particular negative (O-type) and should not contain the middle term. So, it follows that 'Some jungles are not rains'.Since I and II also involve the same terms and form a complementary pair, so either I or II follows."
  },
  {
    id: 79,
    question: "79. Statements: All snakes are trees. Some trees are roads. All roads are mountains. Conclusions: Some mountains are snakes. Some roads are snakes. Some mountains are trees.",
    options: ["a) Only I follows", "b) Only II follows", "c) Only III follows", "d) Both I and II follow", "e) None follows"],
    correctIndex: 2,
    answerText: "c) Only III follows",
    solution: "Explanation: All snakes are trees. Some trees are roads.Since the middle term is not distributed even once in the premises, so no definite conclusion follows.Some trees are roads. All roads are mountains.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some trees are mountains'. III is the converse of this conclusion and so it holds.All snakes are trees. Some trees are mountains.Since the middle term is not distributed even once in the premises, so no definite conclusion follows."
  },
  {
    id: 80,
    question: "80. Statements: All trees are flowers. No flower is fruit. All branches are fruits. Conclusions: Some branches are trees. No fruit is tree. No tree is branch.",
    options: ["a) None follows", "b) Only either I or III follows", "c) Only II follows", "d) Only either I or III, and II follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: All trees are flowers. No flower is fruit.Since both the premises are universal and one premise is negative, the conclusion must be universal negative (E-type) and should not contain the middle term. So, it follows that 'No tree is fruit'. II is the converse of this conclusion and so it follows.All branches are fruits. No flower is fruit.Since both the premises are universal and one premise is negative, the conclusion must be universal negative (E-type) and should not contain the middle term. So, it follows that 'No branch is flower'.All trees are flowers. No branch is tree.As discussed above, it follows that 'No tree is branch'. So, III follows.Hence, both II and III follow."
  },
  {
    id: 81,
    question: "81. Statements: Some uniforms are covers. All covers are papers. All papers are bags. Conclusions: All covers are bags. Some bags are covers, papers and uniforms. Some uniforms are not papers.",
    options: ["a) Only I follows", "b) Only I and II follow", "c) Only III follows", "d) All I, II and III follow", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only I and II follow",
    solution: "Explanation: Some uniforms are covers. All covers are papers.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some uniforms are papers'. All covers are papers. All papers are bags.Since both the premises are universal and affirmative, the conclusion must be universal affirmative (A-type) and should not contain the middle term. So, it follows that 'All covers are bags'. Thus, I follows. The converse of this conclusion i.e. 'Some bags are covers' also holds.Some uniforms are covers. All covers are bags.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some uniforms are bags', The converse of this conclusion i.e. 'Some bags are uniforms' also holds.Further, the converse of the third premise i.e. 'Some bags are papers' holds.Now, II is the cumulative result of the conclusions 'Some bags are covers', 'Some bags are papers' and 'Some bags are uniforms'. Thus, II follows."
  },
  {
    id: 82,
    question: "82. Statements: No rabbit is lion. Some horses are lions. All rabbits are tables. Conclusions: Some tables are lions. Some horses are rabbits. No lion is table.",
    options: ["a) None follows", "b) Only either I or III follows", "c) Only II and III follow", "d) Only III follows", "e) None of these"],
    correctIndex: 1,
    answerText: "b) Only either I or III follows",
    solution: "Explanation: Some horses are lions. No rabbit is lion.Since one premise is particular and the other negative, the conclusion must be particular negative (O-type) and should not contain the middle term.So, it follows that 'Some horses are not rabbits'.All rabbits are tables. No rabbit is lion.Since the middle term 'rabbits' is distributed twice, the conclusion must be particular.Since one premise is negative, the conclusion must be negative. So, it follows that 'Some tables are not lions'. Since I and III involve the same terms and form a complementary pair, so either I or III follows."
  },
  {
    id: 83,
    question: "83. Statements: All benches are desks. Some desks are roads. All roads are pillars. Conclusions: Some pillars are benches. Some pillars are desks. Some roads are benches. No pillar is bench.",
    options: ["a) None follows", "b) Only either I or IV, and III follow", "c) Only either I or IV follows", "d) Only either I or IV, and II follow", "e) All follow"],
    correctIndex: 3,
    answerText: "d) Only either I or IV, and II follow",
    solution: "Explanation: All benches are desks. Some desks are roads.Since the middle term 'desks' is not distributed even once in the premises, no definite conclusion follows.Some desks are roads. All roads are pillars.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some desks are pillars'. II is the converse of this conclusion and so it holds.All benches are desks. Some desks are pillars.Since the middle term 'desks' is not distributed even once in the premises, no definite conclusion follows. However, I and IV involve the extreme terms and form a complementary pair. So, either I or IV follows."
  },
  {
    id: 84,
    question: "84. Statements: Some dogs are rats. All rats are trees. Some trees are not dogs. Conclusions: Some trees are dogs. All dogs are trees. All rats are dogs. No tree is dog.",
    options: ["a) None follows", "b) Only I follows", "c) Only I and II follow", "d) Only II and III follow", "e) All follow"],
    correctIndex: 1,
    answerText: "b) Only I follows",
    solution: "Explanation: Some dogs are rats. All rats are trees.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some dogs are trees'. I is the converse of this conclusion and so it holds.All rats are trees. Some trees are not dogs.Since the middle term 'trees' is not distributed even once in the premises, no definite conclusion follows."
  },
  {
    id: 85,
    question: "85. Statements: Some bricks are trees. All trees are pens. All pens are boats. Conclusions: Some boats are bricks. Some pens are bricks. Some trees are bricks. Some bricks are boats.",
    options: ["a) Only I and II follow", "b) Only III and IV follow", "c) None follows", "d) All follow", "e) None of these"],
    correctIndex: 3,
    answerText: "d) All follow",
    solution: "Explanation: III is the converse of the first premise and so it holds.Some bricks are trees. All trees are pens.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some bricks are pens'. II is the converse of this conclusion and so it holds.All trees are pens. All pens are boats.Since both the premises are universal and affirmative, the conclusion must be universal affirmative and should not contain the middle term. So, it follows that 'All trees are boats'.Some bricks are trees. All trees are boats.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some bricks are boats'. Thus, IV follows. I is the converse of this conclusion and so it also holds."
  },
  {
    id: 86,
    question: "86. Statements: All cups are glasses. Some glasses are bowls. No bowl is a plate. Conclusions: No cup is a plate. No glass is a plate. Some plates are bowls. Some cups are not glasses.",
    options: ["a) None follows", "b) Only either I or III follows", "c) Only II and III follow", "d) Only III and IV follow", "e) None of these"],
    correctIndex: 0,
    answerText: "a) None follows",
    solution: "Explanation: All cups are glasses. Some glasses are bowls.Since the middle term 'glasses' is not distributed even once in the premises, no definite conclusion follows.Some glasses are bowls. No bowl is a plate.Since one premise is particular and the other negative, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some glasses are not plates'."
  },
  {
    id: 87,
    question: "87. Statements: Some trains are roads. No road is jungle. All flowers are jungles. Conclusions: Some trains are flowers. Some trains are jungles. Some flowers are trains. No road is flower.",
    options: ["a) None follows", "b) Only II follows", "c) Only III follows", "d) Only IV follows", "e) All follow"],
    correctIndex: 3,
    answerText: "d) Only IV follows",
    solution: "Explanation: Some trains are roads. No road is jungle.Since one premise is particular and the other negative, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some trains are not jungles'.No road is jungle. All flowers are jungles.Since both the premises are universal and one premise is negative, the conclusion must be universal negative and should not contain the middle term. So, it follows that 'No flower is road'. IV is the converse of this conclusion and so it holds.Some trains are roads, No flower is road.As discussed above, it follows that 'Some trains are not flowers'."
  },
  {
    id: 88,
    question: "88. Statements: All doors are buses. All buses are leaves. No leaf is a flower. Conclusions: No flower is a door. No flower is a bus. Some leaves are doors. Some leaves are buses.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only II and III follow", "d) Only II, III and IV follow", "e) All follow"],
    correctIndex: 4,
    answerText: "e) All follow",
    solution: "Explanation: IV is the converse of the second premise and so it holds.All doors are buses. All buses are leaves.Since both the premises are universal and affirmative, the conclusion must be universal affirmative and should not contain the middle term. So, it follows that 'All doors are leaves'. III is the converse of this conclusion and so it holds.All buses are leaves. No leaf is a flower.Since both the premises are universal and one premise is negative, the conclusion must be universal negative and should not contain the middle term. So, it follows that 'No bus is flower'. II is the converse of this conclusion and so it holds.All doors are buses. No bus is flower.As discussed above, it follows that 'No door is flower'. I is the converse of this conclusion and so it also holds."
  },
  {
    id: 89,
    question: "89. Statements: All oceans are rivers. Some springs are rivers. All wells are springs. Conclusions: Some springs are oceans. Some wells are rivers. Some rivers are oceans. No well is river.",
    options: ["a) None follows", "b) Only either I or III, and IV follow", "c) Only either II or IV, and III follow", "d) All follow", "e) Only either II or IV, and I follow"],
    correctIndex: 2,
    answerText: "c) Only either II or IV, and III follow",
    solution: "Explanation: III is the converse of the first premise and so it holds.All oceans are rivers. Some springs are rivers.Since the middle term 'rivers' is not distributed even once in the premises, no definite conclusion follows.All wells are springs. Some springs are rivers.Since the middle term 'springs' is not distributed even once in the premises, no definite conclusion follows. However, II and IV involve the extreme terms and form a complementary pair. Thus, either II or IV follows."
  },
  {
    id: 90,
    question: "90. Statements: Some tigers are lions. Some lions are rabbits. Some rabbits are horses. Conclusions: Some tigers are horses. Some rabbits are tigers. Some horses are lions. All horses are rabbits.",
    options: ["a) All follow", "b) None follows", "c) Only I and II follow", "d) Only II and IV follow", "e) Only IV follows"],
    correctIndex: 1,
    answerText: "b) None follows",
    solution: "Explanation: Since each combination of premises shall contain two particular premises, no definite conclusion can be drawn."
  },
  {
    id: 91,
    question: "91. Statements: Some spoons are bowls. All bowls are knives. All knives are forks. Conclusions: All spoons are forks. All bowls are forks. Some knives are bowls. Some forks are spoons.",
    options: ["a) Only II and III follow", "b) Only II and IV follow", "c) Only III and IV follow", "d) All follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: III is the converse of the second premise and so it holds.Some spoons are bowls. All bowls are knives.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some spoons are knives'.All bowls are knives. All knives are forks.Since both the premises are universal and affirmative, the conclusion must be universal affirmative and should not contain the middle term. So, it follows that.'All bowls are forks'. Thus, II follows.Some spoons are knives. All knives are forks.Since one premise is particular, the conclusion must be particular and should not contain the middle term.So, it follows that 'Some spoons are forks'. IV is the converse of this conclusion and so it follows.Hence, II, III and IV follow."
  },
  {
    id: 92,
    question: "92. Statements: All pencils are birds. All birds are skies. All skies are hills. Conclusions: All pencils are hills. All hills are birds All skies are pencils. All birds are hills.",
    options: ["a) Only I and II follow", "b) Only I and III follow", "c) Only III and IV follow", "d) All follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: All pencils are birds. All birds are skies.Since both the premises are universal and affirmative, the conclusion must be universal affirmative (A-type) and should not contain the middle term. So, it follows that 'All pencils are skies'.All birds are skies. All skies are hills.As discussed above, it follows that 'All birds are hills'. Thus, IV follows.All pencils are skies. All skies are hills.Clearly, it follows that 'All pencils are hills'. Thus, I follows.Hence, I and IV follow."
  },
  {
    id: 93,
    question: "93. Statements: No tree is fruit. All fruits are stones. All stones are rains. Conclusions: No stone is tree. No rain is tree. Some rains are fruits. Some rains are trees.",
    options: ["a) Only either II or III, and I follow", "b) None follows", "c) Only either II or IV, and III follow", "d) All follow", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only either II or IV, and III follow",
    solution: "Explanation: No tree is fruit. All fruits are stones.Since the middle term 'fruits' is distributed twice, the conclusion must be particular.Since one premise is negative, the conclusion must be negative. So, it follows that'Some stones are not trees'.All fruits are stones. All stones are rains.Clearly, it follows that 'All fruits are rains'. III is the converse of this conclusion and so it holds.No tree is fruit, All fruits are rains.As discussed above, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some rains are not trees'. However, II and IV involve only the extreme terms and form a complementary pair. Thus, either II or IV follows."
  },
  {
    id: 94,
    question: "94. Statements: All players are spectators. Some spectators are theatres. Some theatres are dramas. Conclusions: Some dramas are spectators. Some players are dramas. Some theatres are players. All spectators are players.",
    options: ["a) None follows", "b) Only I and III follow", "c) Only II follows", "d) Only II and IV follow", "e) All follow"],
    correctIndex: 0,
    answerText: "a) None follows",
    solution: "Explanation: All players are spectators. Some spectators are theatres.Since the middle term 'spectators' is not distributed even once in the premises, no definite conclusion follows.Some spectators are theatres. Some theatres are dramas.Since both the premises are particular, no definite conclusion follows."
  },
  {
    id: 95,
    question: "95. Statements: All doors are roads. No road is fruit. Some flowers are doors. Conclusions: Some fruits are doors. Some fruits are flowers. Some roads are flowers. No fruit is flower.",
    options: ["a) Only either II or III, and IV follow", "b) Only either II or IV, and III follow", "c) Only either II or IV, and I follow", "d) Only either II or IV follows", "e) All follow"],
    correctIndex: 1,
    answerText: "b) Only either II or IV, and III follow",
    solution: "Explanation: All doors are roads. No road is fruit.Since both the premises are universal and one premise is negative, the conclusion must be universal negative and should not contain the middle term. So, it follows that 'No door is fruit.'Some flowers are doors. All doors are roads.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some flowers are roads'. Ill is the converse of this conclusion and so it holds.Some flowers are roads. No road is fruit.Since one premise is particular and the other negative, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some flowers are not fruits'. II and IV involve the extreme terms and form a complementary pair. Thus, either II or IV follows."
  },
  {
    id: 96,
    question: "96. Statements: All needles are threads. All threads are boxes. All trees are boxes. Conclusions: No needle is tree. Some trees are threads. Some boxes are needles. Some trees are needles.",
    options: ["a) None follows", "b) Only either I or IV follows", "c) Only either I or IV, and II follow", "d) Only III follows", "e) Only either I or IV, and III follow"],
    correctIndex: 4,
    answerText: "e) Only either I or IV, and III follow",
    solution: "Explanation: All needles are threads. All threads are boxes.Since both the premises are universal and affirmative, the conclusion must be universal affirmative (A-type) and should not contain the middle term. So, it follows that 'All needles are boxes'. III is the converse of this conclusion and so it holds.All threads are boxes. All trees are boxes.Since the middle term 'boxes' is not distributed even once in the premises, no definite conclusion follows.All needles are boxes. All trees are boxes.Again, since the middle term 'boxes' is not distributed even once in the premises, no definite conclusion can be drawn. However, I and IV involve the extreme terms of these two statements and form a complementary pair. Thus, either I or IV follows."
  },
  {
    id: 97,
    question: "97. Statements: No house is school. All colleges are schools. All schools are teachers. Conclusions: No house is teacher. All colleges are teachers. Some teachers are not houses. No college is house.",
    options: ["a) None follows", "b) Only either I or IV follows", "c) Only II, III and IV follow", "d) All follow", "e) Only either I or IV, and III follow"],
    correctIndex: 2,
    answerText: "c) Only II, III and IV follow",
    solution: "Explanation: All colleges are schools. No house is school.Since both the premises are universal and one premise is negative, the conclusion must be universal negative and should not contain the middle term. So, it follows that 'No college is house'. Thus, IV follows.All colleges are schools. All schools are teachers.Clearly, it follows that 'All colleges are teachers'. Thus, II follows.No house is school. All schools are teachers.Since the middle term 'schools' is distributed twice, the conclusion must be particular.Since one premise is negative, the conclusion must be negative. So, it follows that 'Some teachers are not houses'."
  },
  {
    id: 98,
    question: "98. Statements: Some pearls are stones. Some stones are diamonds. No diamond is a gem. Conclusions: Some gems are pearls. Some gems are diamonds. No gem is a diamond. No gem is a pearl.",
    options: ["a) Only I and II follow", "b) Only III and IV follow", "c) Only either I or IV and either II or III follow", "d) Only III and either I or IV follow", "e) None of these"],
    correctIndex: 3,
    answerText: "d) Only III and either I or IV follow",
    solution: "Explanation: III is the converse of the third premise and so it holds.Some pearls are stones. Some stones are diamonds.Since both the premises are particular, no definite conclusion follows.Some stones are diamonds. No diamond is a gem.Since one premise is particular and the other negative, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some stones are not gems'.However, I and IV involve the extreme terms of the three premises and form a complementary pair, Thus, either I or IV follows."
  },
  {
    id: 99,
    question: "99. Statements: All rods are bricks. Some bricks are ropes. All ropes are doors. Conclusions: Some rods are doors. Some doors are bricks. Some rods are not doors. All doors are ropes.",
    options: ["a) Only I and II follow", "b) Only I, II and III follow", "c) Only either I or III, and II follow", "d) Only either I or III, and IV follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: All rods are bricks. Some bricks are ropes.Since the middle term 'bricks' is not distributed even once in the premises, no definite conclusion follows.Some bricks are ropes. All ropes are doors.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some bricks are doors'. II is the converse of this conclusion and so it holds.All rods are bricks. Some bricks are doors.Since the middle term 'bricks' is not distributed even once in the premises, no definite conclusion follows.However, I and III involve the extreme terms. But, since they are not contradictory, they do not form a complementary pair.Hence, only II follows."
  },
  {
    id: 100,
    question: "100. Statements: All myths are fictions. No fiction is novel. All novels are stories. Conclusions: No myth is novel. Some fictions are novels. Some fictions are myths. Some myths are novels.",
    options: ["a) Only either I or II and both III and IV follow", "b) Only either I or IV and II follow", "c) Only either I or IV and both II and III follow", "d) All follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: III is the converse of first premise and so it holds.All myths are fictions. No fiction is novel.Since both the premises are universal and one premise is negative, the conclusion must be universal negative and should not contain the middle term. So, it follows that 'No myth is novel'. Thus, I follows.No fiction is novel. All novels are stories.Since the middle term 'novels' is distributed twice in the premises, the conclusion must be particular. Since one premise is negative, the conclusion must be negative.So, it follows that 'Some stories are not fictions'.Hence, only I and III follow."
  },
  {
    id: 101,
    question: "101. Statements: No paper is pen. No pen is pencil. All erasers are papers. Conclusions: Some papers are erasers. No pencil is eraser. No pen is eraser. All papers are erasers.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only I, II and III follow", "d) All follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: I is the converse of the third premise and so it holds.No paper is pen. No pen is pencil.Since both the premises are negative, no definite conclusion follows.All erasers are papers. No paper is pen.Since both the premises are universal and one premise is negative, the conclusion must be universal negative and should not contain the middle term. So, it follows that 'No eraser is pen'. III is the converse of this conclusion and so it holds.Hence, only I and III follow."
  },
  {
    id: 102,
    question: "102. Statements: No man is sky. No sky is road. Some men are roads. Conclusions: No road is man. No road is sky. Some skies are men. All roads are men.",
    options: ["a) None follows", "b) Only I follows", "c) Only II and III follow", "d) Only I and III follow", "e) None of these"],
    correctIndex: 4,
    answerText: "e) None of these",
    solution: "Explanation: II is the converse of the second premise and so it holds.No man is sky. No sky is road.Since both the premises are negative, no definite conclusion follows.No man is sky. Some men are roads.Since one premise is particular and the other negative, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some roads are not skies'.No sky is road. Some men are roads.As discussed above, it follows that 'Some men are not skies'.Hence, only II follows."
  },
  {
    id: 103,
    question: "103. Statements: All buildings are windows. No toys is building. Some tigers are toys. Conclusions: Some tigers are buildings. Some windows are tigers. All toys are tigers. Some windows are toys.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only III and IV follow", "d) Only I and III follow", "e) All follow"],
    correctIndex: 0,
    answerText: "a) None follows",
    solution: "Explanation: No toy is building. All buildings are windows.Since the middle term 'buildings' is distributed twice and one premise is negative, the conclusion must be particular negative and should not contain the middle term.So, it follows that 'Some windows are not toys'.Some tigers are toys. No toy is building.Since one premise is particular and the other premise is negative, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some tigers are not buildings'."
  },
  {
    id: 104,
    question: "104. Statements: Some papers are cats. All cats are bats. No bat is horse. Conclusions: Some papers are horses. No horse is cat. Some bats are papers. All papers are bats.",
    options: ["a) Only I and II follow", "b) Only II and III follow", "c) Only III and IV follow", "d) Only I and IV follow", "e) All follow"],
    correctIndex: 1,
    answerText: "b) Only II and III follow",
    solution: "Explanation: Some papers are cats. All cats are bats.Since one premise is particular, the conclusion must be particular and should not contain the middle term. So, it follows that 'Some papers are bats'. III is the converse of this conclusion and so it holds.All cats are bats. No bat is horse.Since both the premises are universal and one premise is negative, the conclusion must be universal negative and should not contain the middle term. So, it follows that 'No cat is horse'. II is the converse of this conclusion and so it holds.Some papers are bats. No bat is horse.Since one premise is particular and the other negative, the conclusion must be particular negative and should not contain the middle term. So, it follows that 'Some papers are not horses'."
  },
  {
    id: 105,
    question: "105. Statements: Some tapes are discs. Some discs are cassettes. Some cassettes are songs. Conclusions: Some songs are discs. Some cassettes are tapes. Some songs are tapes. No song is a disc.",
    options: ["a) Only either I or IV follows", "b) Only either II or IV follows", "c) Only III and IV follow", "d) Only III and either II or IV follows", "e) None of these"],
    correctIndex: 0,
    answerText: "a) Only either I or IV follows",
    solution: "Explanation: Since each combination of premises shall contain two particular premises, no definite conclusion can be drawn. However, I and IV involve the extreme terms of the second and third premises and form a complementary pair. Thus, either I or IV follows."
  },
  {
    id: 106,
    question: "106. Statements: No table is fruit. No fruit is window. All windows are chairs. Conclusions: No window is table. No chair is fruit. No chair is table. All chairs are windows.",
    options: ["a) None follows", "b) Only I and II follow", "c) Only III and IV follow", "d) All follow", "e) None of these"],
    correctIndex: 0,
    answerText: "a) None follows",
    solution: "Explanation: No table is fruit. No fruit is window.Since both the premises are negative, no definite conclusion follows.No fruit is window. All windows are chairs.Since the middle term 'windows' is distributed twice and one premise is negative, the conclusion must be particular negative. So, it follows that 'Some chairs are not fruits'."
  },
  {
    id: 107,
    question: "107. Statements: All jungles are buses. All books are buses. All fruits are books. Conclusions: Some fruits are jungles. Some buses are books. Some buses are jungles. All fruits are buses.",
    options: ["a) Only I, II and III follow", "b) Only I, II and IV follow", "c) Only II, III and IV follow", "d) All follow", "e) None of these"],
    correctIndex: 2,
    answerText: "c) Only II, III and IV follow",
    solution: "Explanation: III is the converse of the first premise and II is the converse of the second premise.So, both of them hold.All fruits are books. All books are buses.Since both the premises are universal and affirmative, the conclusion must be universal affirmative and should not contain the middle term. So, it follows that 'All fruits are buses'. Thus, IV follows.All jungles are buses. All books are buses.Since the middle term 'buses' is not distributed ever once in the premises, no definite conclusion follows.All fruits are buses. All books are buses.As discussed above, no definite conclusion can be drawn.All jungles are buses. All fruits are buses.Again, no definite conclusion follows."
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
  "Verbal Reasoning": VERBAL_REASONING_QUESTIONS,
  "Logical Problems": LOGICAL_PROBLEMS_QUESTIONS,
  "Logical Games": LOGICAL_GAMES_QUESTIONS,
  "Analyzing Arguments": ANALYZING_ARGUMENTS_QUESTIONS,
  "Statement and Assumption": STATEMENT_AND_ASSUMPTION_QUESTIONS,
  "Course of Action": COURSE_OF_ACTION_QUESTIONS,
  "Statement and Conclusion": STATEMENT_AND_CONCLUSION_QUESTIONS,
  "Theme Detection": THEME_DETECTION_QUESTIONS,
  "Cause and Effect": CAUSE_AND_EFFECT_QUESTIONS,
  "Statement and Argument": STATEMENT_AND_ARGUMENT_QUESTIONS,
  "Logical Deduction": LOGICAL_DEDUCTION_QUESTIONS,
};
