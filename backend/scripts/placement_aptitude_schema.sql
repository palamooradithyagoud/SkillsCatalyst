-- ====================================================================
-- SKILLSCATALYST - QUANTITATIVE APTITUDE & PLACEMENT PREP SQL SCHEMA
-- ====================================================================
-- Production-ready PostgreSQL / Supabase Schema for Placement Preparation
-- Supports: Categories, Topics, Questions, Options, Timer, Solutions & User Scores
-- Covers All Quantitative Aptitude Topics:
-- 1. Percentages (topic_id = 1)
-- 2. Profit & Loss (topic_id = 2)
-- 3. Time & Work (topic_id = 3)
-- 4. Time, Speed & Distance (topic_id = 4)
-- 5. Probability (topic_id = 5)
-- 6. Permutations & Combinations (topic_id = 6)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CATEGORIES TABLE (Quantitative Aptitude, Logical Reasoning, Verbal)
CREATE TABLE IF NOT EXISTS public.aptitude_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Calculator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TOPICS TABLE (Percentages, Profit & Loss, Time & Work, etc.)
CREATE TABLE IF NOT EXISTS public.aptitude_topics (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES public.aptitude_categories(id) ON DELETE CASCADE,
    topic_name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    total_questions INTEGER DEFAULT 0,
    default_timer_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUESTIONS TABLE (Stores Question, Options Array, Correct Index, & Solutions)
CREATE TABLE IF NOT EXISTS public.aptitude_questions (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER NOT NULL REFERENCES public.aptitude_topics(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- e.g. ["a) 180", "b) 210", "c) 230", "d) 240"]
    correct_index INTEGER NOT NULL, -- 0-indexed (0=a, 1=b, 2=c, 3=d)
    answer_text VARCHAR(100) NOT NULL, -- e.g. "d) 240"
    solution_text TEXT NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'Medium',
    per_question_timer INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_topic_question_number UNIQUE (topic_id, question_number)
);

-- 4. USER ATTEMPTS TABLE (Tracks per-question user choices & timing)
CREATE TABLE IF NOT EXISTS public.user_aptitude_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES public.aptitude_topics(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES public.aptitude_questions(id) ON DELETE CASCADE,
    selected_option_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_taken_seconds INTEGER DEFAULT 0,
    attempted_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_question_attempt UNIQUE (user_id, question_id)
);

-- 5. USER QUIZ RESULTS TABLE (Stores completed topic test scores & accuracy)
CREATE TABLE IF NOT EXISTS public.user_quiz_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    topic_id INTEGER NOT NULL REFERENCES public.aptitude_topics(id) ON DELETE CASCADE,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    timer_mode_seconds INTEGER DEFAULT 60,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR FAST QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.aptitude_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_topic ON public.user_aptitude_attempts(user_id, topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user ON public.user_quiz_results(user_id);

-- ====================================================================
-- ROW-LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ====================================================================
ALTER TABLE public.aptitude_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_aptitude_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_results ENABLE ROW LEVEL SECURITY;

-- Public read-only access for categories, topics, and questions
DROP POLICY IF EXISTS "Public read aptitude categories" ON public.aptitude_categories;
CREATE POLICY "Public read aptitude categories" ON public.aptitude_categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read aptitude topics" ON public.aptitude_topics;
CREATE POLICY "Public read aptitude topics" ON public.aptitude_topics FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read aptitude questions" ON public.aptitude_questions;
CREATE POLICY "Public read aptitude questions" ON public.aptitude_questions FOR SELECT USING (true);

-- User-isolated access for attempts & quiz results
DROP POLICY IF EXISTS "Users view own attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Users view own attempts" ON public.user_aptitude_attempts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Users insert own attempts" ON public.user_aptitude_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own attempts" ON public.user_aptitude_attempts;
CREATE POLICY "Users update own attempts" ON public.user_aptitude_attempts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own quiz results" ON public.user_quiz_results;
CREATE POLICY "Users view own quiz results" ON public.user_quiz_results FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own quiz results" ON public.user_quiz_results;
CREATE POLICY "Users insert own quiz results" ON public.user_quiz_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ====================================================================
-- SEED DATA INSERTIONS: QUANTITATIVE APTITUDE CATEGORY & TOPICS
-- ====================================================================
INSERT INTO public.aptitude_categories (id, category_name, slug, description, icon_name)
VALUES (1, 'Quantitative Aptitude', 'quantitative-aptitude', 'Mathematics, percentages, arithmetic & numerical reasoning', 'Calculator')
ON CONFLICT (id) DO UPDATE SET category_name = EXCLUDED.category_name;

INSERT INTO public.aptitude_topics (id, category_id, topic_name, slug, total_questions, default_timer_seconds)
VALUES 
    (1, 1, 'Percentages', 'percentages', 41, 60),
    (2, 1, 'Profit & Loss', 'profit-loss', 38, 60),
    (3, 1, 'Time & Work', 'time-work', 42, 60),
    (4, 1, 'Time, Speed & Distance', 'time-speed-distance', 50, 60),
    (5, 1, 'Probability', 'probability', 30, 60),
    (6, 1, 'Permutations & Combinations', 'permutations-combinations', 35, 60)
ON CONFLICT (id) DO UPDATE SET total_questions = EXCLUDED.total_questions;

-- Reset sequence for categories & topics
SELECT setval(pg_get_serial_sequence('public.aptitude_categories', 'id'), (SELECT MAX(id) FROM public.aptitude_categories));
SELECT setval(pg_get_serial_sequence('public.aptitude_topics', 'id'), (SELECT MAX(id) FROM public.aptitude_topics));

-- ====================================================================
-- SEED DATA 1: PERCENTAGES (topic_id = 1)
-- ====================================================================
INSERT INTO public.aptitude_questions (topic_id, question_number, question_text, options, correct_index, answer_text, solution_text) VALUES
(1, 1, '1. If 60% of 75% of a number is 270, its 40% is:', '["a) 180", "b) 210", "c) 230", "d) 240"]'::jsonb, 3, 'd) 240', '(60% × 75% = 45%). So 45% of number = 270 ⇒ Number = (270 / 0.45 = 600). 40% of 600 = 240.'),
(1, 2, '2. If 70% of a number is subtracted from itself, it reduces to 81. What is two-fifth of that number?', '["a) 108", "b) 54", "c) 210", "d) None of these"]'::jsonb, 0, 'a) 108', 'Number − 70% = 30% = 81 ⇒ Number = (81 / 0.3 = 270). Two-fifths = (2/5 × 270 = 108). Correct answer is a) 108.'),
(1, 3, '3. If a person’s salary increases from 200 per day to 234 per day, then the percentage increase in the person’s salary is:', '["a) 15%", "b) 17%", "c) 14%", "d) 16%"]'::jsonb, 1, 'b) 17%', 'Increase = 234 − 200 = 34. Percentage Increase = (34 / 200 × 100 = 17%).'),
(1, 4, '4. A''s salary is 25% higher than that of B''s. By how much percent is B''s salary lower than that of A’s?', '["a) 33.33%", "b) 25%", "c) 35%", "d) 20%"]'::jsonb, 3, 'd) 20%', 'Let B = 100 ⇒ A = 125. B is lower than A by (25 / 125 × 100 = 20%).'),
(1, 5, '5. Two numbers are 15% and 20% less than a third number. What percentage is the first number as a percentage of second number?', '["a) 105%", "b) 106.25%", "c) 107.5%", "d) 116.5%"]'::jsonb, 1, 'b) 106.25%', 'Let third number = 100. First = 85, Second = 80. Percentage = (85 / 80 × 100 = 106.25%).'),
(1, 6, '6. In a physics exam, a student scored 40% in the first paper, out of 150 marks. How much should he score in the second paper, out of 200 marks, if he has to get 60% marks in the two papers together?', '["a) 70%", "b) 50%", "c) 75%", "d) 60%"]'::jsonb, 2, 'c) 75%', 'First paper = 40% of 150 = 60. Total required = 60% of 350 = 210. Need in second paper = 210 − 60 = 150. (150 / 200 × 100 = 75%).'),
(1, 7, '7. In an examination Sai scored 22% of the maximum marks and failed the exam by 52 marks, whereas Raja scored 45% of the maximum marks and got 40 marks more than the pass mark. Then find the maximum marks for the exam.', '["(a) 300", "(b) 200", "(c) 400", "(d) 500"]'::jsonb, 2, '(c) 400', 'Difference in scores = 45% − 22% = 23%. Difference in marks = 52 + 40 = 92. So 23% = 92 ⇒ Total Maximum = (92 / 0.23 = 400).'),
(1, 8, '8. 10% of the voters did not cast their vote in an election between two candidates. 10% of the votes polled were found invalid. The successful candidate got 54% of the valid votes and won by a majority of 1620 votes. The number of votes enrolled on the voters list was:', '["(a) 25000", "(b) 33000", "(c) 35000", "(d) 40000"]'::jsonb, 0, '(a) 25000', 'Valid votes = 90% × 90% = 81% of total. Winner''s margin = 54% − 46% = 8% of valid votes = 1620. Valid votes = 1620 / 0.08 = 20,250. Total voters = 20,250 / 0.81 = 25,000.'),
(1, 9, '9. In an election between two candidates, one got 55% of the total valid votes, 20% of the votes were invalid. If the total number of votes was 7500, the number of valid votes that the other candidate got, was:', '["a) 2700", "b) 2900", "c) 3000", "d) 3100"]'::jsonb, 0, 'a) 2700', 'Valid votes = 80% of 7500 = 6000. Other candidate''s share = 100% − 55% = 45%. Valid votes for other candidate = 45% of 6000 = 2700.'),
(1, 10, '10. During one year the population of a town increased by 10% and in the next year decreased by 10%. If the population at the end of the second year was 20295, what was it at the beginning of 1st year?', '["a) 19800", "b) 19900", "c) 20500", "d) 21500"]'::jsonb, 2, 'c) 20500', 'Net factor = 1.1 × 0.9 = 0.99. Initial Population = 20295 / 0.99 = 20,500.')
ON CONFLICT (topic_id, question_number) DO UPDATE SET 
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_index = EXCLUDED.correct_index,
    answer_text = EXCLUDED.answer_text,
    solution_text = EXCLUDED.solution_text;

-- ====================================================================
-- SEED DATA 2: PROFIT & LOSS (topic_id = 2)
-- ====================================================================
INSERT INTO public.aptitude_questions (topic_id, question_number, question_text, options, correct_index, answer_text, solution_text) VALUES
(2, 1, '1. An article is purchased for Rs. 500 and sold for Rs. 600. What is the gain percentage?', '["a) 20%", "b) 25%", "c) 15%", "d) 10%"]'::jsonb, 0, 'a) 20%', 'Profit = 600 − 500 = Rs. 100. Profit Percentage = (100 / 500) × 100 = 20%.'),
(2, 2, '2. If the cost price of 12 articles is equal to the selling price of 10 articles, what is the profit percentage?', '["a) 15%", "b) 20%", "c) 25%", "d) 30%"]'::jsonb, 1, 'b) 20%', 'Let CP of 1 article = Re 1. CP of 10 articles = Rs 10. SP of 10 articles = CP of 12 articles = Rs 12. Profit % = (2 / 10) × 100 = 20%.'),
(2, 3, '3. A man sells two wristwatches at Rs. 990 each. On one he gains 10% and on the other he loses 10%. What is his net gain or loss percentage?', '["a) 1% gain", "b) No gain no loss", "c) 1% loss", "d) 2% loss"]'::jsonb, 2, 'c) 1% loss', 'When two items are sold at the same price, one at x% profit and one at x% loss, net loss = (x^2 / 100)% = (10^2 / 100)% = 1% loss.'),
(2, 4, '4. The marked price of a shirt is Rs. 800. If a discount of 15% is offered on it, what is the selling price?', '["a) Rs. 680", "b) Rs. 720", "c) Rs. 650", "d) Rs. 700"]'::jsonb, 0, 'a) Rs. 680', 'Discount = 15% of 800 = Rs. 120. Selling Price = 800 − 120 = Rs. 680.'),
(2, 5, '5. What is the single equivalent discount for two successive discounts of 20% and 10%?', '["a) 30%", "b) 25%", "c) 26%", "d) 28%"]'::jsonb, 3, 'd) 28%', 'Net multiplier = (1 − 0.20) × (1 − 0.10) = 0.80 × 0.90 = 0.72. Single discount = (1 − 0.72) × 100 = 28%.'),
(2, 6, '6. A dishonest trader sells goods at cost price but uses a weight of 900 grams for a 1 kg weight. What is his profit percentage?', '["a) 10%", "b) 11 1/9%", "c) 12%", "d) 9 1/11%"]'::jsonb, 1, 'b) 11 1/9%', 'Profit % = [ (True Weight − False Weight) / False Weight ] × 100 = (100 / 900) × 100 = 100 / 9 % = 11 1/9 %.'),
(2, 7, '7. A sells a watch to B at 20% profit, and B sells it to C at 10% profit. If C pays Rs. 660 for it, how much did A pay for it?', '["a) Rs. 500", "b) Rs. 550", "c) Rs. 480", "d) Rs. 520"]'::jsonb, 0, 'a) Rs. 500', 'Let A''s cost = x. x × 1.20 × 1.10 = 660 ⇒ x × 1.32 = 660 ⇒ x = 660 / 1.32 = Rs. 500.'),
(2, 8, '8. By selling an item for Rs. 450, a shopkeeper incurs a loss of 10%. At what price should he sell it to gain 20%?', '["a) Rs. 550", "b) Rs. 580", "c) Rs. 600", "d) Rs. 640"]'::jsonb, 2, 'c) Rs. 600', 'CP = 450 / (1 − 0.10) = 450 / 0.90 = Rs. 500. Required SP = 500 × 1.20 = Rs. 600.'),
(2, 9, '9. By selling 33 meters of cloth, a merchant gains the selling price of 11 meters. What is his gain percentage?', '["a) 33.33%", "b) 50%", "c) 25%", "d) 40%"]'::jsonb, 1, 'b) 50%', 'Profit = SP of 11m. Profit = SP of 33m − CP of 33m ⇒ CP of 33m = SP of 22m. Gain % = (11 / 22) × 100 = 50%.'),
(2, 10, '10. The profit earned when an article is sold for Rs. 780 is twice the loss incurred when it is sold for Rs. 600. Find the cost price.', '["a) Rs. 660", "b) Rs. 680", "c) Rs. 640", "d) Rs. 700"]'::jsonb, 0, 'a) Rs. 660', '780 − CP = 2 × (CP − 600) ⇒ 780 − CP = 2CP − 1200 ⇒ 3CP = 1980 ⇒ CP = Rs. 660.')
ON CONFLICT (topic_id, question_number) DO UPDATE SET 
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_index = EXCLUDED.correct_index,
    answer_text = EXCLUDED.answer_text,
    solution_text = EXCLUDED.solution_text;

-- ====================================================================
-- SEED DATA 3: TIME & WORK (topic_id = 3)
-- ====================================================================
INSERT INTO public.aptitude_questions (topic_id, question_number, question_text, options, correct_index, answer_text, solution_text) VALUES
(3, 1, '1. A can complete a piece of work in 10 days and B can complete it in 15 days. In how many days can both complete it working together?', '["a) 6 days", "b) 8 days", "c) 5 days", "d) 7.5 days"]'::jsonb, 0, 'a) 6 days', 'Combined 1-day work = 1/10 + 1/15 = (3+2)/30 = 5/30 = 1/6. Total days = 6 days.'),
(3, 2, '2. A and B together can do a job in 12 days. A alone can do it in 20 days. How many days will B alone take to complete the job?', '["a) 25 days", "b) 30 days", "c) 24 days", "d) 36 days"]'::jsonb, 1, 'b) 30 days', 'B''s 1-day work = 1/12 − 1/20 = (5−3)/60 = 2/60 = 1/30. B alone takes 30 days.'),
(3, 3, '3. A is twice as efficient as B. Working together, they complete a work in 14 days. In how many days can A alone complete the work?', '["a) 28 days", "b) 42 days", "c) 21 days", "d) 35 days"]'::jsonb, 2, 'c) 21 days', 'Efficiency ratio A:B = 2:1. Total efficiency = 3 units/day. Total work = 3 × 14 = 42 units. A alone takes 42 / 2 = 21 days.'),
(3, 4, '4. 12 men can complete a work in 8 days. How many men are required to complete the same work in 6 days?', '["a) 14 men", "b) 15 men", "c) 18 men", "d) 16 men"]'::jsonb, 3, 'd) 16 men', 'M1 × D1 = M2 × D2 ⇒ 12 × 8 = M2 × 6 ⇒ 96 = 6 × M2 ⇒ M2 = 16 men.'),
(3, 5, '5. Pipe A can fill a tank in 4 hours while Pipe B can fill it in 6 hours. If both pipes are opened together, how long will it take to fill the tank?', '["a) 2.4 hours", "b) 3 hours", "c) 2.5 hours", "d) 3.2 hours"]'::jsonb, 0, 'a) 2.4 hours', 'Net fill per hour = 1/4 + 1/6 = 5/12. Time taken = 12 / 5 = 2.4 hours (2 hours 24 minutes).'),
(3, 6, '6. Pipe A can fill a cistern in 10 hours and Pipe B can empty the full cistern in 15 hours. If both are opened together, in how many hours will the cistern be full?', '["a) 25 hours", "b) 30 hours", "c) 20 hours", "d) 15 hours"]'::jsonb, 1, 'b) 30 hours', 'Net fill per hour = 1/10 − 1/15 = (3−2)/30 = 1/30. Time to fill = 30 hours.'),
(3, 7, '7. A can finish a work in 20 days. He worked at it for 5 days and then B finished the remaining work in 15 days. How long will B take to complete the whole work alone?', '["a) 20 days", "b) 25 days", "c) 18 days", "d) 24 days"]'::jsonb, 0, 'a) 20 days', 'A''s 5 days work = 5/20 = 1/4. Remaining work = 3/4. B takes 15 days for 3/4 work ⇒ B''s full time = 15 × (4/3) = 20 days.'),
(3, 8, '8. A and B can do a work in 12 days and 18 days respectively. They start working together, but A leaves after 3 days. In how many more days will B finish the remaining work?', '["a) 10.5 days", "b) 12 days", "c) 13.5 days", "d) 15 days"]'::jsonb, 2, 'c) 13.5 days', 'In 3 days, (A+B) work = 3 × (1/12 + 1/18) = 3 × (5/36) = 15/36 = 5/12. Remaining work = 7/12. B takes = (7/12) / (1/18) = (7/12) × 18 = 10.5 days. (Total time from start = 13.5 days).')
ON CONFLICT (topic_id, question_number) DO UPDATE SET 
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_index = EXCLUDED.correct_index,
    answer_text = EXCLUDED.answer_text,
    solution_text = EXCLUDED.solution_text;

-- ====================================================================
-- SEED DATA 4: TIME, SPEED & DISTANCE (topic_id = 4)
-- ====================================================================
INSERT INTO public.aptitude_questions (topic_id, question_number, question_text, options, correct_index, answer_text, solution_text) VALUES
(4, 1, '1. Convert a speed of 72 km/h into meters per second (m/s).', '["a) 20 m/s", "b) 25 m/s", "c) 18 m/s", "d) 15 m/s"]'::jsonb, 0, 'a) 20 m/s', '72 km/h = 72 × (5/18) m/s = 4 × 5 = 20 m/s.'),
(4, 2, '2. A car travels a distance at 60 km/h and returns the same distance at 40 km/h. What is the average speed of the car for the entire journey?', '["a) 50 km/h", "b) 48 km/h", "c) 45 km/h", "d) 52 km/h"]'::jsonb, 1, 'b) 48 km/h', 'Average Speed = (2 × s1 × s2) / (s1 + s2) = (2 × 60 × 40) / (60 + 40) = 4800 / 100 = 48 km/h.'),
(4, 3, '3. A train 200 meters long passes a telegraph pole in 10 seconds. Find the speed of the train in km/h.', '["a) 60 km/h", "b) 64 km/h", "c) 72 km/h", "d) 80 km/h"]'::jsonb, 2, 'c) 72 km/h', 'Speed = Distance / Time = 200m / 10s = 20 m/s. In km/h = 20 × (18/5) = 72 km/h.'),
(4, 4, '4. A train 150 meters long crosses a platform 250 meters long in 20 seconds. What is the speed of the train in m/s?', '["a) 20 m/s", "b) 25 m/s", "c) 15 m/s", "d) 18 m/s"]'::jsonb, 0, 'a) 20 m/s', 'Total Distance = Length of Train + Length of Platform = 150 + 250 = 400 meters. Speed = 400 / 20 = 20 m/s.'),
(4, 5, '5. Two trains of lengths 100m and 120m are running in opposite directions at speeds of 40 km/h and 32 km/h respectively. In how much time will they completely pass each other?', '["a) 8 seconds", "b) 10 seconds", "c) 12 seconds", "d) 11 seconds"]'::jsonb, 3, 'd) 11 seconds', 'Total Distance = 100 + 120 = 220m. Relative Speed = 40 + 32 = 72 km/h = 72 × (5/18) = 20 m/s. Time = 220 / 20 = 11 seconds.'),
(4, 6, '6. The speed of a boat in still water is 10 km/h and the speed of the stream is 2 km/h. How long will it take to travel 24 km downstream?', '["a) 3 hours", "b) 2 hours", "c) 2.4 hours", "d) 1.8 hours"]'::jsonb, 1, 'b) 2 hours', 'Downstream Speed = Boat Speed + Stream Speed = 10 + 2 = 12 km/h. Time = Distance / Speed = 24 / 12 = 2 hours.'),
(4, 7, '7. A person covers a certain distance in 4 hours traveling at a speed of 15 km/h. If he increases his speed to 20 km/h, how long will he take to cover the same distance?', '["a) 3 hours", "b) 2.5 hours", "c) 3.5 hours", "d) 2 hours"]'::jsonb, 0, 'a) 3 hours', 'Distance = Speed × Time = 15 × 4 = 60 km. New Time = 60 / 20 = 3 hours.')
ON CONFLICT (topic_id, question_number) DO UPDATE SET 
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_index = EXCLUDED.correct_index,
    answer_text = EXCLUDED.answer_text,
    solution_text = EXCLUDED.solution_text;

-- ====================================================================
-- SEED DATA 5: PROBABILITY (topic_id = 5)
-- ====================================================================
INSERT INTO public.aptitude_questions (topic_id, question_number, question_text, options, correct_index, answer_text, solution_text) VALUES
(5, 1, '1. A fair coin is tossed once. What is the probability of getting a Head?', '["a) 1/2", "b) 1/4", "c) 3/4", "d) 1/3"]'::jsonb, 0, 'a) 1/2', 'Sample space = {H, T}. Favorable outcomes = {H}. Probability = 1/2.'),
(5, 2, '2. Two fair dice are rolled simultaneously. What is the probability that the sum of the numbers appearing on both dice is 7?', '["a) 1/12", "b) 1/6", "c) 5/36", "d) 1/4"]'::jsonb, 1, 'b) 1/6', 'Total outcomes = 6 × 6 = 36. Favorable outcomes for sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6. Probability = 6/36 = 1/6.'),
(5, 3, '3. A card is drawn at random from a well-shuffled deck of 52 playing cards. What is the probability that the card drawn is a King?', '["a) 1/52", "b) 1/26", "c) 1/13", "d) 4/13"]'::jsonb, 2, 'c) 1/13', 'Number of Kings = 4. Total cards = 52. Probability = 4 / 52 = 1/13.'),
(5, 4, '4. A bag contains 4 red balls and 6 black balls. If one ball is drawn at random, what is the probability that it is a red ball?', '["a) 2/5", "b) 3/5", "c) 1/2", "d) 4/5"]'::jsonb, 0, 'a) 2/5', 'Total balls = 4 + 6 = 10. Red balls = 4. Probability = 4 / 10 = 2/5.'),
(5, 5, '5. Two fair coins are tossed. What is the probability of getting at least one Head?', '["a) 1/4", "b) 1/2", "c) 2/3", "d) 3/4"]'::jsonb, 3, 'd) 3/4', 'Sample space = {HH, HT, TH, TT}. Favorable outcomes (at least 1 head) = {HH, HT, TH} = 3. Probability = 3/4.'),
(5, 6, '6. What is the probability of drawing a Spade or an Ace from a standard pack of 52 cards?', '["a) 15/52", "b) 4/13", "c) 17/52", "d) 5/13"]'::jsonb, 1, 'b) 4/13', 'Spades = 13, Aces = 4. Ace of Spades is common. Favorable cards = 13 + 4 − 1 = 16. Probability = 16 / 52 = 4/13.')
ON CONFLICT (topic_id, question_number) DO UPDATE SET 
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_index = EXCLUDED.correct_index,
    answer_text = EXCLUDED.answer_text,
    solution_text = EXCLUDED.solution_text;

-- ====================================================================
-- SEED DATA 6: PERMUTATIONS & COMBINATIONS (topic_id = 6)
-- ====================================================================
INSERT INTO public.aptitude_questions (topic_id, question_number, question_text, options, correct_index, answer_text, solution_text) VALUES
(6, 1, '1. In how many different ways can the letters of the word ''LEADER'' be arranged?', '["a) 360", "b) 720", "c) 180", "d) 240"]'::jsonb, 0, 'a) 360', 'Word has 6 letters: L, E, A, D, E, R. Letter E repeats twice. Number of arrangements = 6! / 2! = 720 / 2 = 360.'),
(6, 2, '2. In how many ways can a committee of 3 persons be chosen from a group of 5 persons?', '["a) 15", "b) 10", "c) 20", "d) 12"]'::jsonb, 1, 'b) 10', 'Number of ways = 5C3 = 5! / (3! × 2!) = (5 × 4) / 2 = 10.'),
(6, 3, '3. How many 3-digit numbers can be formed using the digits 1, 2, 3, 4, 5 without repetition?', '["a) 120", "b) 24", "c) 60", "d) 48"]'::jsonb, 2, 'c) 60', 'Number of ways = 5P3 = 5 × 4 × 3 = 60.'),
(6, 4, '4. Out of 7 consonants and 4 vowels, how many 5-letter words can be formed consisting of 3 consonants and 2 vowels?', '["a) 210", "b) 2100", "c) 5040", "d) 25200"]'::jsonb, 3, 'd) 25200', 'Ways to select consonants = 7C3 = 35. Ways to select vowels = 4C2 = 6. Selected 5 letters can be arranged in 5! = 120 ways. Total words = 35 × 6 × 120 = 25,200.'),
(6, 5, '5. How many handshakes take place at a party of 10 people where each person shakes hands with every other person exactly once?', '["a) 45", "b) 90", "c) 50", "d) 100"]'::jsonb, 0, 'a) 45', 'Handshakes = 10C2 = (10 × 9) / 2 = 45.'),
(6, 6, '6. In how many ways can 5 people sit around a circular table?', '["a) 120", "b) 24", "c) 60", "d) 48"]'::jsonb, 1, 'b) 24', 'Circular permutation formula = (n − 1)! = (5 − 1)! = 4! = 24.')
ON CONFLICT (topic_id, question_number) DO UPDATE SET 
    question_text = EXCLUDED.question_text,
    options = EXCLUDED.options,
    correct_index = EXCLUDED.correct_index,
    answer_text = EXCLUDED.answer_text,
    solution_text = EXCLUDED.solution_text;

-- Update final sequence counters
SELECT setval(pg_get_serial_sequence('public.aptitude_questions', 'id'), (SELECT MAX(id) FROM public.aptitude_questions));


-- ====================================================================
-- USER ATTEMPTS & TIME-TAKEN STORED PROCEDURES & ANALYTICS VIEWS
-- ====================================================================

-- Stored Procedure: Record/Update question attempt (Stores selected option, correctness & time taken in seconds)
CREATE OR REPLACE FUNCTION public.upsert_user_aptitude_attempt(
    p_user_id UUID,
    p_topic_id INTEGER,
    p_question_id INTEGER,
    p_selected_option_index INTEGER,
    p_is_correct BOOLEAN,
    p_time_taken_seconds INTEGER
) RETURNS public.user_aptitude_attempts AS $$
DECLARE
    v_result public.user_aptitude_attempts;
BEGIN
    INSERT INTO public.user_aptitude_attempts (
        user_id, topic_id, question_id, selected_option_index, is_correct, time_taken_seconds, attempted_at
    ) VALUES (
        p_user_id, p_topic_id, p_question_id, p_selected_option_index, p_is_correct, p_time_taken_seconds, NOW()
    )
    ON CONFLICT (user_id, question_id) DO UPDATE SET
        selected_option_index = EXCLUDED.selected_option_index,
        is_correct = EXCLUDED.is_correct,
        time_taken_seconds = EXCLUDED.time_taken_seconds,
        attempted_at = NOW()
    RETURNING * INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Analytics View: Summarizes Correct & Wrong Answers, Accuracy, and Average Time Spent per Category (Security Invoker enabled for RLS compliance)
CREATE OR REPLACE VIEW public.user_aptitude_question_analytics 
WITH (security_invoker = true) 
AS
SELECT 
    a.user_id,
    a.topic_id,
    t.topic_name,
    COUNT(a.id) AS total_questions_attempted,
    COUNT(CASE WHEN a.is_correct = TRUE THEN 1 END) AS correct_answers_count,
    COUNT(CASE WHEN a.is_correct = FALSE THEN 1 END) AS wrong_answers_count,
    ROUND(
        (COUNT(CASE WHEN a.is_correct = TRUE THEN 1 END)::NUMERIC / NULLIF(COUNT(a.id), 0)::NUMERIC) * 100.0, 2
    ) AS accuracy_percent,
    ROUND(
        AVG(CASE WHEN a.is_correct = TRUE THEN a.time_taken_seconds END)::NUMERIC, 2
    ) AS avg_time_correct_sec,
    ROUND(
        AVG(CASE WHEN a.is_correct = FALSE THEN a.time_taken_seconds END)::NUMERIC, 2
    ) AS avg_time_wrong_sec,
    SUM(a.time_taken_seconds) AS total_practice_time_sec,
    MAX(a.attempted_at) AS last_practiced_at
FROM public.user_aptitude_attempts a
JOIN public.aptitude_topics t ON t.id = a.topic_id
GROUP BY a.user_id, a.topic_id, t.topic_name;

ALTER VIEW public.user_aptitude_question_analytics SET (security_invoker = true);

