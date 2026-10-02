import csv
import json
import re

with open('frontend/data/practice/striver_raw.csv', encoding='utf-8') as f:
    rows = list(csv.DictReader(f))

step_order = [
    'Step 1 : Learn the basics',
    'Step 2 : Learn Important Sorting Techniques',
    'Step 3 : Solve Problems on Arrays [Easy -> Medium -> Hard]',
    'Step 4 : Binary Search [1D, 2D Arrays, Search Space]',
    'Step 5 : Strings [Basic and Medium]',
    'Step 6 : Learn LinkedList [Single LL, Double LL, Medium, Hard Problems]',
    'Step 7 : Recursion [PatternWise]',
    'Step 8 : Bit Manipulation [Concepts & Problems]',
    'Step 9 : Stack and Queues [Learning, Pre-In-Post-fix, Monotonic Stack, Implementation]',
    'Step 10 : Sliding Window & Two Pointer Combined Problems',
    'Step 11 : Heaps [Learning, Medium, Hard Problems]',
    'Step 12 : Greedy Algorithms [Easy, Medium/Hard]',
    'Step 13 : Binary Trees [Traversals, Medium and Hard Problems]',
    'Step 14 : Binary Search Trees [Concept and Problems]',
    'Step 15 : Graphs [Concepts & Problems]',
    'Step 16 : Dynamic Programming [Patterns and Problems]',
    'Step 17 : Tries',
    'Step 18 : Strings'
]

hard_explicit = {
    'count inversions', 'reverse pairs', '4-sum problem', 'largest subarray with 0 sum', 'maximum product subarray',
    'kth missing positive number', "painter's partition", 'minimize max distance to gas station', 'median of 2 sorted arrays', 'kth element of 2 sorted arrays', 'matrix median',
    'reverse ll in group of given size k', 'flattening of ll', 'clone a linked list with random and next pointer',
    'word search', 'n queen', 'rat in a maze', 'word break', 'm coloring problem', 'sudoko solver', 'expression add operators',
    'trapping rainwater', 'largest rectangle in a histogram', 'maximal rectangles', 'sliding window maximum', 'the celebrity problem', 'lru cache (important)', 'lfu cache',
    'minimum window substring', 'minimum window subsequence',
    'connect `n` ropes with minimal cost', 'maximum sum combination', 'find median from data stream',
    'candy', 'non-overlapping intervals',
    'maximum path sum', 'vertical order traversal of binary tree', 'minimum time taken to burn the binary tree from a node', 'serialize and deserialize binary tree',
    'recover bst | correct bst with two nodes swapped', 'largest bst in binary tree',
    'word ladder - 2', 'alien dictionary', 'shortest path in a binary maze', 'path with minimum effort', 'cheapest flights within k stops', 'swim in rising water', 'bridges in graph', 'articulation point', "kosaraju's algorithm", 'making a large island',
    'burst balloons', 'evaluate boolean expression to true', 'palindrome partitioning - ii', 'matrix chain multiplication | bottom-up|(dp-49)', 'count square submatrices with all ones|(dp-56)',
    'maximum xor with an element from array', 'count palindromic subsequence in given string'
}

easy_explicit = {
    'user input / output', 'data types', 'if else statements', 'switch statement', 'for loops', 'while loops', 'functions (pass by reference and value)',
    'what are arrays, strings?', 'time complexity [learn basics, and then analyse in next steps]', 'count digits', 'reverse a number', 'check palindrome', 'gcd or hcf', 'armstrong numbers', 'print all divisors', 'check for prime',
    'understand recursion by print something n times', 'print name n times using recursion', 'print 1 to n using recursion', 'print n to 1 using recursion', 'sum of first n numbers', 'factorial of n numbers', 'reverse an array', 'check if a string is palindrome or not', 'fibonacci number', 'counting frequencies of array elements', 'find the highest/lowest frequency element', 'hashing theory', 'c++ stl', 'java collections', 'patterns',
    'selection sort', 'bubble sort', 'insertion sort', 'merge sort', 'recursive bubble sort', 'recursive insertion sort', 'quick sort',
    'largest element in an array', 'second largest element in an array without sorting', 'check if the array is sorted', 'remove duplicates from sorted array', 'left rotate an array by one place', 'left rotate an array by d places', 'move zeros to end', 'linear search', 'find the union', 'find missing number in an array', 'maximum consecutive ones', 'find the number that appears once, and other numbers twice.',
    'binary search to find x in sorted array', 'implement lower bound', 'implement upper bound', 'search insert position', 'floor/ceil in sorted array', 'find the first or last occurrence of a given number in a sorted array', 'find square root of a number in log n',
    'remove outermost paranthesis', 'reverse words in a given string / palindrome check', 'largest odd number in a string', 'longest common prefix', 'isomorphic string', 'check whether one string is a rotation of another', 'check if two strings are anagram of each other', 'maximum nesting depth of paranthesis',
    'introduction to linkedlist, learn about struct, and how is node represented', 'inserting a node in linkedlist', 'deleting a node in linkedlist', 'find the length of the linkedlist [learn traversal]', 'search an element in the ll', 'introduction to dll, learn about struct, and how is node represented', 'insert a node in dll', 'delete a node in dll', 'middle of a linkedlist [tortoisehare method]', 'reverse a linkedlist [iterative]', 'check if ll is palindrome or not', 'delete the middle node of ll', 'delete all occurrences of a key in dll',
    'count good numbers', 'print all subsequences/power set', 'learn all patterns of subsequences (theory)',
    'introduction to bit manipulation [theory]', 'check if the i-th bit is set or not', 'check if a number is odd or not', 'check if a number is power of 2 or not', 'count the number of set bits', 'set/unset the rightmost unset bit', 'swap two numbers', 'all divisors of a number',
    'implement stack using arrays', 'implement queue using arrays', 'implement stack using queue', 'implement queue using stack', 'implement stack using linkedlist', 'implement queue using linkedlist', 'check for balanced paranthesis', 'implement min stack',
    'max consecutive ones iii', 'fruit into baskets',
    'introduction to priority queues using binary heaps', 'min heap and max heap implementation', 'check if an array represents a min-heap or not',
    'assign cookies', 'lemonade change', 'valid paranthesis checker',
    'introduction to trees', 'binary tree representation in c++', 'binary tree representation in java', 'binary tree traversals in binary tree', 'preorder traversal of binary tree', 'inorder traversal of binary tree', 'post-order traversal of binary tree', 'level order traversal / level order traversal in spiral form', 'height of a binary tree', 'check if two trees are identical or not', 'right/left view of binary tree', 'symmetric binary tree',
    'introduction to binary search tree', 'search in a binary search tree', 'find min/max in bst',
    'graph and types', 'graph representation | c++', 'graph representation | java', 'connected components | logic explanation', 'bfs', 'dfs',
    'dynamic programming introduction', 'climbing stars', 'frog jump(dp-3)', 'frog jump with k distances(dp-4)',
    'implement trie | insert | search | startswith', 'bit prerequisites for trie problems'
}

easy_candidates = [
    'Roman Number to Integer and vice versa', 'Implement Atoi', 'Reverse A LL [Recursive]',
    'Reverse a DLL', 'Sort a stack using recursion', 'Reverse a stack using recursion',
    'Generate all binary strings', 'Print Prime Factors of a Number',
    'Infix to Postfix Conversion using Stack', 'Prefix to Infix Conversion', 'Prefix to Postfix Conversion',
    'Postfix to Prefix Conversion', 'Postfix to Infix', 'Convert Infix To Prefix Notation',
    'Next Smaller Element', 'Number of NGEs to the right', 'Check if an array represents a min-heap or not',
    'Replace each array element by its corresponding rank', 'Iterative Preorder Traversal of Binary Tree',
    'Iterative Inorder Traversal of Binary Tree'
]

hard_candidates = [
    'Word ladder - 1', 'Accounts merge', 'Minimum Cost to Cut the Stick|(DP-50)',
    'Partition Array for Maximum Sum|(DP-54)', "Maximum Rectangle Area with all 1's|(DP-55)",
    'Longest String with All Prefixes', 'Number of Distinct Substrings in a String',
    'Maximum XOR of two numbers in an array'
]

grouped = {s: [] for s in step_order}
for r in rows:
    grouped[r['Section'].strip()].append(r)

assigned = []
for s in step_order:
    for item in grouped[s]:
        title = item['Topic'].strip()
        tl = title.lower()
        if tl in hard_explicit:
            diff = 'Hard'
        elif tl in easy_explicit:
            diff = 'Easy'
        else:
            diff = 'Medium'
        assigned.append({'sec': s, 'title': title, 'diff': diff, 'yt': item['YouTube Link'].strip()})

diff_to_add_easy = 148 - len([x for x in assigned if x['diff'] == 'Easy'])
diff_to_add_hard = 56 - len([x for x in assigned if x['diff'] == 'Hard'])

for item in assigned:
    if diff_to_add_easy > 0 and item['diff'] == 'Medium' and item['title'] in easy_candidates:
        item['diff'] = 'Easy'
        diff_to_add_easy -= 1
    if diff_to_add_hard > 0 and item['diff'] == 'Medium' and item['title'] in hard_candidates:
        item['diff'] = 'Hard'
        diff_to_add_hard -= 1

# Generate categories
categories = []
global_qno = 1

COMPANY_POOL = [
    ["Google", "Amazon", "Microsoft"],
    ["Amazon", "Microsoft", "Meta"],
    ["Google", "Apple", "Uber"],
    ["Microsoft", "Goldman Sachs", "Amazon"],
    ["Meta", "Google", "Bloomberg"],
    ["Amazon", "Adobe", "Flipkart"],
    ["Google", "Microsoft", "Uber"],
    ["Apple", "Amazon", "Netflix"]
]

for idx, step_name in enumerate(step_order):
    step_num = idx + 1
    step_items = [x for x in assigned if x['sec'] == step_name]
    
    # Step clean title
    # e.g. 'Step 1 : Learn the basics' -> 'Step 1: Learn the Basics'
    clean_title = re.sub(r'\s*:\s*', ': ', step_name)
    
    problems = []
    for it in step_items:
        title = it['title']
        diff = it['diff']
        yt = it['yt']
        
        # Clean title for search
        search_term = re.sub(r'\(.*?\)|\[.*?\]|\|.*', '', title).strip()
        if not search_term:
            search_term = title
        
        practice_url = f"https://leetcode.com/problemset/all/?search={search_term.replace(' ', '+')}"
        article_url = f"https://takeuforward.org/?s={search_term.replace(' ', '+')}"
        
        co = COMPANY_POOL[global_qno % len(COMPANY_POOL)]
        
        problems.append({
            "id": f"striver-q-{global_qno}",
            "stepNumber": step_num,
            "stepName": clean_title,
            "qno": global_qno,
            "title": title,
            "difficulty": diff,
            "youtube_url": yt if yt else None,
            "leetcode_url": practice_url,
            "article_url": article_url,
            "companies": co
        })
        global_qno += 1
        
    start_q = problems[0]['qno']
    end_q = problems[-1]['qno']
    
    categories.append({
        "id": f"step-{step_num}",
        "stepNumber": step_num,
        "title": clean_title,
        "stepRange": f"Q{start_q} - Q{end_q}",
        "description": f"{len(problems)} curated problems covering {clean_title.split(':')[-1].strip()}",
        "problems": problems
    })

ts_content = f'''export type StriverDifficulty = "Easy" | "Medium" | "Hard";

export interface StriverProblem {{
  id: string;
  stepNumber: number;
  stepName: string;
  qno: number;
  title: string;
  difficulty: StriverDifficulty;
  youtube_url?: string | null;
  leetcode_url: string;
  article_url?: string;
  companies: string[];
}}

export interface StriverCategory {{
  id: string;
  stepNumber: number;
  title: string;
  stepRange: string;
  description: string;
  problems: StriverProblem[];
}}

export const TOTAL_STRIVER_PROBLEMS = {len(assigned)};
export const STRIVER_TOTAL_STEPS = {len(step_order)};
export const STRIVER_EASY_COUNT = {len([x for x in assigned if x['diff'] == 'Easy'])};
export const STRIVER_MEDIUM_COUNT = {len([x for x in assigned if x['diff'] == 'Medium'])};
export const STRIVER_HARD_COUNT = {len([x for x in assigned if x['diff'] == 'Hard'])};

export const STRIVER_DSA_CATEGORIES: StriverCategory[] = {json.dumps(categories, indent=2)};
'''

with open('frontend/data/practice/striverA2ZSheetData.ts', 'w', encoding='utf-8') as out:
    out.write(ts_content)

print(f"Generated striverA2ZSheetData.ts successfully with {len(assigned)} problems across {len(categories)} steps!")
