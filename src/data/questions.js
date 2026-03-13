export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];

export const TOPICS = [
  'Arrays', 'Linked Lists', 'Stacks', 'Queues',
  'Trees', 'Graphs', 'Sorting', 'Dynamic Programming',
  'Recursion', 'Hashing',
];

export const QUESTIONS = [
  // Arrays
  { id: 1, title: 'Two Sum', topic: 'Arrays', difficulty: 'Easy', description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', hint: 'Use a hash map to store complements as you iterate.',
    testCases: [ { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]' }, { input: 'nums = [3,2,4], target = 6', output: '[1,2]' }, { input: 'nums = [3,3], target = 6', output: '[0,1]' } ] },
  { id: 2, title: 'Maximum Subarray (Kadane\'s)', topic: 'Arrays', difficulty: 'Medium', description: 'Find the contiguous subarray with the largest sum and return the sum.', hint: 'Track current sum and max sum. Reset current sum if it goes negative.',
    testCases: [ { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6' }, { input: 'nums = [1]', output: '1' }, { input: 'nums = [5,4,-1,7,8]', output: '23' } ] },
  { id: 3, title: 'Merge Sorted Arrays', topic: 'Arrays', difficulty: 'Easy', description: 'Given two sorted arrays nums1 (size m+n) and nums2 (size n), merge nums2 into nums1 in sorted order in-place.', hint: 'Start merging from the end of both arrays using three pointers.',
    testCases: [ { input: 'nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3', output: '[1,2,2,3,5,6]' }, { input: 'nums1 = [1], m = 1, nums2 = [], n = 0', output: '[1]' }, { input: 'nums1 = [0], m = 0, nums2 = [1], n = 1', output: '[1]' } ] },
  { id: 4, title: 'Trapping Rain Water', topic: 'Arrays', difficulty: 'Hard', description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap.', hint: 'Use two pointers or precompute left-max and right-max arrays.',
    testCases: [ { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }, { input: 'height = [4,2,0,3,2,5]', output: '9' }, { input: 'height = [1,0,1]', output: '1' } ] },
  { id: 5, title: 'Rotate Array', topic: 'Arrays', difficulty: 'Medium', description: 'Given an integer array nums, rotate the array to the right by k steps.', hint: 'Reverse the entire array, then reverse first k and remaining elements separately.',
    testCases: [ { input: 'nums = [1,2,3,4,5,6,7], k = 3', output: '[5,6,7,1,2,3,4]' }, { input: 'nums = [-1,-100,3,99], k = 2', output: '[3,99,-1,-100]' }, { input: 'nums = [1,2], k = 1', output: '[2,1]' } ] },
  // Linked Lists
  { id: 6, title: 'Reverse a Linked List', topic: 'Linked Lists', difficulty: 'Easy', description: 'Given the head of a singly linked list, reverse the list and return the reversed list.', hint: 'Use three pointers: prev, curr, next. Update links one by one.',
    testCases: [ { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' }, { input: 'head = [1,2]', output: '[2,1]' }, { input: 'head = []', output: '[]' } ] },
  { id: 7, title: 'Detect Cycle in Linked List', topic: 'Linked Lists', difficulty: 'Medium', description: 'Given head of a linked list, determine if the list has a cycle in it.', hint: 'Use Floyd\'s Tortoise and Hare — slow pointer moves 1 step, fast moves 2.',
    testCases: [ { input: 'head = [3,2,0,-4], pos = 1', output: 'true' }, { input: 'head = [1,2], pos = 0', output: 'true' }, { input: 'head = [1], pos = -1', output: 'false' } ] },
  { id: 8, title: 'Merge Two Sorted Lists', topic: 'Linked Lists', difficulty: 'Easy', description: 'Merge two sorted linked lists and return it as a sorted list.', hint: 'Use a dummy head and compare nodes from both lists one by one.',
    testCases: [ { input: 'l1 = [1,2,4], l2 = [1,3,4]', output: '[1,1,2,3,4,4]' }, { input: 'l1 = [], l2 = []', output: '[]' }, { input: 'l1 = [], l2 = [0]', output: '[0]' } ] },
  { id: 9, title: 'Remove Nth Node From End', topic: 'Linked Lists', difficulty: 'Medium', description: 'Given the head of a linked list, remove the nth node from the end and return its head.', hint: 'Use two pointers with a gap of n between them.',
    testCases: [ { input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]' }, { input: 'head = [1], n = 1', output: '[]' }, { input: 'head = [1,2], n = 1', output: '[1]' } ] },
  { id: 10, title: 'LRU Cache', topic: 'Linked Lists', difficulty: 'Hard', description: 'Design a data structure for Least Recently Used (LRU) cache with get and put operations in O(1).', hint: 'Combine a doubly linked list with a hash map for O(1) operations.',
    testCases: [ { input: 'LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)', output: 'get(1)=1, get(2)=-1' }, { input: 'LRUCache(1), put(1,1), put(2,2), get(1)', output: 'get(1)=-1' }, { input: 'LRUCache(2), put(1,1), get(1), put(2,2), put(3,3), get(1)', output: 'get(1)=1, get(1)=-1' } ] },
  // Stacks
  { id: 11, title: 'Valid Parentheses', topic: 'Stacks', difficulty: 'Easy', description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.', hint: 'Push opening brackets. Pop and match when you see a closing bracket.',
    testCases: [ { input: 's = "()"', output: 'true' }, { input: 's = "()[]{}"', output: 'true' }, { input: 's = "(]"', output: 'false' } ] },
  { id: 12, title: 'Min Stack', topic: 'Stacks', difficulty: 'Medium', description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time.', hint: 'Use an auxiliary stack to track minimums at each level.',
    testCases: [ { input: 'push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()', output: '-3, 0, -2' }, { input: 'push(1), push(2), top(), getMin()', output: '2, 1' }, { input: 'push(0), push(1), push(0), getMin(), pop(), getMin()', output: '0, 0' } ] },
  { id: 13, title: 'Next Greater Element', topic: 'Stacks', difficulty: 'Medium', description: 'For each element in the array, find the next element that is greater. Output -1 if none exists.', hint: 'Use a monotonic decreasing stack. Process from right to left.',
    testCases: [ { input: 'nums = [4,5,2,25]', output: '[5,25,25,-1]' }, { input: 'nums = [13,7,6,12]', output: '[-1,12,12,-1]' }, { input: 'nums = [1,2,3,4]', output: '[2,3,4,-1]' } ] },
  { id: 14, title: 'Largest Rectangle in Histogram', topic: 'Stacks', difficulty: 'Hard', description: 'Given an array of integers heights representing the histogram, find the area of the largest rectangle.', hint: 'Use a stack of indices. Pop when current bar is shorter than stack top.',
    testCases: [ { input: 'heights = [2,1,5,6,2,3]', output: '10' }, { input: 'heights = [2,4]', output: '4' }, { input: 'heights = [1]', output: '1' } ] },
  // Queues
  { id: 15, title: 'Implement Queue using Stacks', topic: 'Queues', difficulty: 'Easy', description: 'Implement a first in first out (FIFO) queue using only two stacks.', hint: 'Use one stack for enqueue, transfer to second stack for dequeue.',
    testCases: [ { input: 'push(1), push(2), peek(), pop(), empty()', output: '1, 1, false' }, { input: 'push(1), pop(), push(2), peek()', output: '1, 2' }, { input: 'push(1), push(2), pop(), push(3), peek()', output: '1, 2' } ] },
  { id: 16, title: 'Sliding Window Maximum', topic: 'Queues', difficulty: 'Hard', description: 'Given array nums and sliding window size k, return the max value in each window.', hint: 'Use a deque to maintain indices of potential maximums in decreasing order.',
    testCases: [ { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]' }, { input: 'nums = [1], k = 1', output: '[1]' }, { input: 'nums = [7,2,4], k = 2', output: '[7,4]' } ] },
  // Trees
  { id: 17, title: 'Inorder Traversal', topic: 'Trees', difficulty: 'Easy', description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.', hint: 'Use a stack. Go left as far as possible, then process node, then go right.',
    testCases: [ { input: 'root = [1,null,2,3]', output: '[1,3,2]' }, { input: 'root = []', output: '[]' }, { input: 'root = [1]', output: '[1]' } ] },
  { id: 18, title: 'Maximum Depth of Binary Tree', topic: 'Trees', difficulty: 'Easy', description: 'Given the root of a binary tree, return its maximum depth.', hint: 'Recursion: max(left depth, right depth) + 1.',
    testCases: [ { input: 'root = [3,9,20,null,null,15,7]', output: '3' }, { input: 'root = [1,null,2]', output: '2' }, { input: 'root = []', output: '0' } ] },
  { id: 19, title: 'Validate BST', topic: 'Trees', difficulty: 'Medium', description: 'Given the root of a binary tree, determine if it is a valid binary search tree (BST).', hint: 'Use inorder traversal — values must be strictly increasing.',
    testCases: [ { input: 'root = [2,1,3]', output: 'true' }, { input: 'root = [5,1,4,null,null,3,6]', output: 'false' }, { input: 'root = [1]', output: 'true' } ] },
  { id: 20, title: 'Lowest Common Ancestor', topic: 'Trees', difficulty: 'Medium', description: 'Given a BST and two nodes p and q, find the lowest common ancestor (LCA).', hint: 'If both targets are in left subtree, go left. If both in right, go right. Else current node is LCA.',
    testCases: [ { input: 'root = [6,2,8,0,4,7,9], p = 2, q = 8', output: '6' }, { input: 'root = [6,2,8,0,4,7,9], p = 2, q = 4', output: '2' }, { input: 'root = [2,1], p = 2, q = 1', output: '2' } ] },
  { id: 21, title: 'Serialize and Deserialize Binary Tree', topic: 'Trees', difficulty: 'Hard', description: 'Design an algorithm to serialize a binary tree to a string and deserialize it back to the original structure.', hint: 'Use preorder traversal with null markers. Reconstruct using a queue.',
    testCases: [ { input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]' }, { input: 'root = []', output: '[]' }, { input: 'root = [1]', output: '[1]' } ] },
  // Graphs
  { id: 22, title: 'BFS / Level Order Traversal', topic: 'Graphs', difficulty: 'Medium', description: 'Given the root of a binary tree, return the level order traversal (values grouped by level).', hint: 'Use a queue. Process all nodes at current level before moving to next.',
    testCases: [ { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }, { input: 'root = [1]', output: '[[1]]' }, { input: 'root = []', output: '[]' } ] },
  { id: 23, title: 'Number of Islands', topic: 'Graphs', difficulty: 'Medium', description: 'Given an m x n 2D grid of \'1\'s (land) and \'0\'s (water), return the number of islands.', hint: 'DFS/BFS from each unvisited land cell. Each search finds one island.',
    testCases: [ { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3' }, { input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', output: '1' }, { input: 'grid = [["0","0"],["0","0"]]', output: '0' } ] },
  { id: 24, title: 'Course Schedule (Topological Sort)', topic: 'Graphs', difficulty: 'Medium', description: 'There are numCourses courses with prerequisites. Determine if you can finish all courses.', hint: 'Use topological sort (Kahn\'s algorithm with BFS) or detect cycle with DFS.',
    testCases: [ { input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true' }, { input: 'numCourses = 2, prerequisites = [[1,0],[0,1]]', output: 'false' }, { input: 'numCourses = 3, prerequisites = [[1,0],[2,1]]', output: 'true' } ] },
  { id: 25, title: 'Dijkstra\'s Shortest Path', topic: 'Graphs', difficulty: 'Hard', description: 'Given a weighted directed graph, find the shortest distance from a source node to all other nodes.', hint: 'Use a min-heap/priority queue. Relax edges greedily.',
    testCases: [ { input: 'n = 4, edges = [[0,1,1],[0,2,4],[1,2,2],[2,3,1]], src = 0', output: '[0,1,3,4]' }, { input: 'n = 3, edges = [[0,1,5],[1,2,3]], src = 0', output: '[0,5,8]' }, { input: 'n = 2, edges = [[0,1,10]], src = 0', output: '[0,10]' } ] },
  // Sorting
  { id: 26, title: 'Sort an Array (Merge Sort)', topic: 'Sorting', difficulty: 'Medium', description: 'Given an array of integers nums, sort the array in ascending order using merge sort.', hint: 'Divide array in half, sort each half, merge sorted halves.',
    testCases: [ { input: 'nums = [5,2,3,1]', output: '[1,2,3,5]' }, { input: 'nums = [5,1,1,2,0,0]', output: '[0,0,1,1,2,5]' }, { input: 'nums = [1]', output: '[1]' } ] },
  { id: 27, title: 'Kth Largest Element', topic: 'Sorting', difficulty: 'Medium', description: 'Given an integer array nums and an integer k, return the kth largest element.', hint: 'Use quickselect (partition-based) for average O(n) or a min-heap of size k.',
    testCases: [ { input: 'nums = [3,2,1,5,6,4], k = 2', output: '5' }, { input: 'nums = [3,2,3,1,2,4,5,5,6], k = 4', output: '4' }, { input: 'nums = [1], k = 1', output: '1' } ] },
  { id: 28, title: 'Sort Colors (Dutch Flag)', topic: 'Sorting', difficulty: 'Medium', description: 'Given an array nums with values 0, 1, and 2, sort the array in-place in one pass.', hint: 'Three pointers: low, mid, high. Swap 0s to low, 2s to high.',
    testCases: [ { input: 'nums = [2,0,2,1,1,0]', output: '[0,0,1,1,2,2]' }, { input: 'nums = [2,0,1]', output: '[0,1,2]' }, { input: 'nums = [0]', output: '[0]' } ] },
  // Dynamic Programming
  { id: 29, title: 'Climbing Stairs', topic: 'Dynamic Programming', difficulty: 'Easy', description: 'You are climbing a staircase with n steps. Each time you can climb 1 or 2 steps. How many distinct ways can you reach the top?', hint: 'dp[i] = dp[i-1] + dp[i-2]. It\'s the Fibonacci sequence.',
    testCases: [ { input: 'n = 2', output: '2' }, { input: 'n = 3', output: '3' }, { input: 'n = 5', output: '8' } ] },
  { id: 30, title: 'Longest Common Subsequence', topic: 'Dynamic Programming', difficulty: 'Medium', description: 'Given two strings text1 and text2, return the length of their longest common subsequence.', hint: 'Use a 2D DP table. If chars match, dp[i][j] = dp[i-1][j-1]+1, else max of top/left.',
    testCases: [ { input: 'text1 = "abcde", text2 = "ace"', output: '3' }, { input: 'text1 = "abc", text2 = "abc"', output: '3' }, { input: 'text1 = "abc", text2 = "def"', output: '0' } ] },
  { id: 31, title: '0/1 Knapsack', topic: 'Dynamic Programming', difficulty: 'Hard', description: 'Given weights and values of n items, find the maximum value that can fit in a knapsack of capacity W.', hint: 'dp[i][w] = max(not take, take if fits). Optimize to 1D by iterating w backwards.',
    testCases: [ { input: 'W = 50, weights = [10,20,30], values = [60,100,120]', output: '220' }, { input: 'W = 10, weights = [5,4,6,3], values = [10,40,30,50]', output: '90' }, { input: 'W = 0, weights = [1], values = [1]', output: '0' } ] },
  // Recursion
  { id: 32, title: 'Generate Parentheses', topic: 'Recursion', difficulty: 'Medium', description: 'Given n pairs of parentheses, generate all combinations of well-formed parentheses.', hint: 'Backtrack: add "(" if open < n, add ")" if close < open.',
    testCases: [ { input: 'n = 3', output: '["((()))","(()())","(())()","()(())","()()()"]' }, { input: 'n = 1', output: '["()"]' }, { input: 'n = 2', output: '["(())","()()"]' } ] },
  { id: 33, title: 'Subsets', topic: 'Recursion', difficulty: 'Medium', description: 'Given an integer array nums of unique elements, return all possible subsets (the power set).', hint: 'For each element, either include it or don\'t. Recurse on both choices.',
    testCases: [ { input: 'nums = [1,2,3]', output: '[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]' }, { input: 'nums = [0]', output: '[[],[0]]' }, { input: 'nums = [1,2]', output: '[[],[1],[2],[1,2]]' } ] },
  { id: 34, title: 'N-Queens', topic: 'Recursion', difficulty: 'Hard', description: 'Place n queens on an n x n chessboard such that no two queens attack each other. Return the number of solutions.', hint: 'Place queens row by row. Check column, left-diagonal, and right-diagonal conflicts.',
    testCases: [ { input: 'n = 4', output: '2' }, { input: 'n = 1', output: '1' }, { input: 'n = 8', output: '92' } ] },
  // Hashing
  { id: 35, title: 'Group Anagrams', topic: 'Hashing', difficulty: 'Medium', description: 'Given an array of strings strs, group the anagrams together. Return the answer in any order.', hint: 'Sort each string (or count chars) as the hash key. Group by key.',
    testCases: [ { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' }, { input: 'strs = [""]', output: '[[""]]' }, { input: 'strs = ["a"]', output: '[["a"]]' } ] },
  { id: 36, title: 'Longest Substring Without Repeating Characters', topic: 'Hashing', difficulty: 'Medium', description: 'Given a string s, find the length of the longest substring without repeating characters.', hint: 'Sliding window with a hash set. Move left pointer when duplicate found.',
    testCases: [ { input: 's = "abcabcbb"', output: '3' }, { input: 's = "bbbbb"', output: '1' }, { input: 's = "pwwkew"', output: '3' } ] },
  // More Arrays
  { id: 37, title: 'Best Time to Buy and Sell Stock', topic: 'Arrays', difficulty: 'Easy', description: 'Given an array prices where prices[i] is the stock price on day i, find the maximum profit from one transaction.', hint: 'Track minimum price so far and maximum profit at each step.',
    testCases: [ { input: 'prices = [7,1,5,3,6,4]', output: '5' }, { input: 'prices = [7,6,4,3,1]', output: '0' }, { input: 'prices = [2,4,1]', output: '2' } ] },
  { id: 38, title: 'Product of Array Except Self', topic: 'Arrays', difficulty: 'Medium', description: 'Given an integer array nums, return an array where each element is the product of all other elements without using division.', hint: 'Two passes: left-to-right prefix products, then right-to-left suffix products.',
    testCases: [ { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' }, { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' }, { input: 'nums = [2,3]', output: '[3,2]' } ] },
  // More Trees
  { id: 39, title: 'Binary Tree Level Order Traversal', topic: 'Trees', difficulty: 'Medium', description: 'Given the root of a binary tree, return the level order traversal as a list of lists.', hint: 'BFS with a queue. Track level boundaries by queue size.',
    testCases: [ { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }, { input: 'root = [1]', output: '[[1]]' }, { input: 'root = []', output: '[]' } ] },
  { id: 40, title: 'Diameter of Binary Tree', topic: 'Trees', difficulty: 'Easy', description: 'Given the root of a binary tree, return the length of the diameter (longest path between any two nodes).', hint: 'At each node, diameter = left height + right height. Track global max.',
    testCases: [ { input: 'root = [1,2,3,4,5]', output: '3' }, { input: 'root = [1,2]', output: '1' }, { input: 'root = [1]', output: '0' } ] },
  // More DP
  { id: 41, title: 'Coin Change', topic: 'Dynamic Programming', difficulty: 'Medium', description: 'Given coin denominations and a total amount, return the fewest number of coins needed. Return -1 if impossible.', hint: 'dp[i] = min coins to make amount i. Try each coin denomination.',
    testCases: [ { input: 'coins = [1,5,11], amount = 11', output: '1' }, { input: 'coins = [2], amount = 3', output: '-1' }, { input: 'coins = [1,2,5], amount = 11', output: '3' } ] },
  { id: 42, title: 'House Robber', topic: 'Dynamic Programming', difficulty: 'Medium', description: 'Rob houses along a street — you cannot rob two adjacent houses. Return the maximum amount you can rob.', hint: 'dp[i] = max(dp[i-1], dp[i-2] + nums[i]).',
    testCases: [ { input: 'nums = [1,2,3,1]', output: '4' }, { input: 'nums = [2,7,9,3,1]', output: '12' }, { input: 'nums = [2,1,1,2]', output: '4' } ] },
  // More Graphs
  { id: 43, title: 'Clone Graph', topic: 'Graphs', difficulty: 'Medium', description: 'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.', hint: 'Use BFS/DFS with a hash map from original node to cloned node.',
    testCases: [ { input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]' }, { input: 'adjList = [[]]', output: '[[]]' }, { input: 'adjList = []', output: '[]' } ] },
  // More Stacks
  { id: 44, title: 'Daily Temperatures', topic: 'Stacks', difficulty: 'Medium', description: 'Given an array of daily temperatures, return array where answer[i] is the number of days you have to wait for a warmer temperature.', hint: 'Use a monotonic decreasing stack of indices.',
    testCases: [ { input: 'temps = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]' }, { input: 'temps = [30,40,50,60]', output: '[1,1,1,0]' }, { input: 'temps = [30,20,10]', output: '[0,0,0]' } ] },
  // More Recursion
  { id: 45, title: 'Permutations', topic: 'Recursion', difficulty: 'Medium', description: 'Given an array nums of distinct integers, return all possible permutations in any order.', hint: 'Swap each element to the front and recurse on the remaining.',
    testCases: [ { input: 'nums = [1,2,3]', output: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' }, { input: 'nums = [0,1]', output: '[[0,1],[1,0]]' }, { input: 'nums = [1]', output: '[[1]]' } ] },
  // More Hashing
  { id: 46, title: 'Top K Frequent Elements', topic: 'Hashing', difficulty: 'Medium', description: 'Given an integer array nums and an integer k, return the k most frequent elements in any order.', hint: 'Count frequencies with a hash map, then use a min-heap of size k or bucket sort.',
    testCases: [ { input: 'nums = [1,1,1,2,2,3], k = 2', output: '[1,2]' }, { input: 'nums = [1], k = 1', output: '[1]' }, { input: 'nums = [4,4,4,2,2,1], k = 1', output: '[4]' } ] },
  // Additional harder problems
  { id: 47, title: 'Median of Two Sorted Arrays', topic: 'Arrays', difficulty: 'Hard', description: 'Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays in O(log(m+n)).', hint: 'Binary search on the smaller array to find the correct partition.',
    testCases: [ { input: 'nums1 = [1,3], nums2 = [2]', output: '2.0' }, { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.5' }, { input: 'nums1 = [0,0], nums2 = [0,0]', output: '0.0' } ] },
  { id: 48, title: 'Word Search II', topic: 'Recursion', difficulty: 'Hard', description: 'Given a 2D board and a list of words from a dictionary, find all words that can be formed by sequentially adjacent cells.', hint: 'Build a Trie from the word list, then DFS from each cell in the board.',
    testCases: [ { input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["eat","oath"]' }, { input: 'board = [["a","b"],["c","d"]], words = ["abcb"]', output: '[]' }, { input: 'board = [["a"]], words = ["a"]', output: '["a"]' } ] },
  { id: 49, title: 'Minimum Spanning Tree (Kruskal\'s)', topic: 'Graphs', difficulty: 'Hard', description: 'Given a weighted undirected graph, find the total weight of the minimum spanning tree.', hint: 'Sort edges by weight. Add edge if it doesn\'t form a cycle (Union-Find).',
    testCases: [ { input: 'n = 4, edges = [[0,1,10],[0,2,6],[0,3,5],[1,3,15],[2,3,4]]', output: '15' }, { input: 'n = 3, edges = [[0,1,1],[1,2,2],[0,2,3]]', output: '3' }, { input: 'n = 2, edges = [[0,1,5]]', output: '5' } ] },
  { id: 50, title: 'Edit Distance', topic: 'Dynamic Programming', difficulty: 'Hard', description: 'Given two strings word1 and word2, return the minimum number of operations (insert, delete, replace) to convert word1 to word2.', hint: 'dp[i][j] = operations to convert first i chars to first j chars. Consider all 3 ops.',
    testCases: [ { input: 'word1 = "horse", word2 = "ros"', output: '3' }, { input: 'word1 = "intention", word2 = "execution"', output: '5' }, { input: 'word1 = "", word2 = "abc"', output: '3' } ] },
];
