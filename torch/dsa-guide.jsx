import { useState, useEffect, useRef } from "react";

/* ───────────────────── DATA ───────────────────── */
const ALGOS = [
  {
    id: "two-pointers",
    cat: "Arrays & Strings",
    name: "Two Pointers",
    icon: "⇄",
    tc: "O(n)",
    sc: "O(1)",
    tldr: "Two indices walking through an array — either toward each other or in the same direction — to find pairs or compress data in one pass.",
    intuition: `Imagine you have a sorted row of numbered cards on a table. You need to find two cards that add up to 10. The brute-force way is: for each card, check every other card. That's O(n²).

But because the cards are sorted, you can be smarter. Put one finger on the leftmost card (smallest) and one on the rightmost card (largest). Check their sum:
• Too small? Move the left finger right — you need a bigger number.
• Too big? Move the right finger left — you need a smaller number.
• Just right? You found your pair.

Each finger only moves forward (or backward), never revisiting a card, so the whole thing is O(n). That's the magic: the sorted order gives you a decision rule at every step, eliminating half the remaining search space.

This generalizes beyond sorted arrays. The "same-direction" variant uses a slow and fast pointer — think of removing duplicates in place, where the slow pointer marks "the last confirmed unique element" and the fast pointer scans ahead.`,
    when: [
      "The array is sorted, or you're told sorting is acceptable",
      "You need to find a pair or triplet with a target sum/difference",
      "Remove duplicates or zeroes in-place (slow/fast variant)",
      "Palindrome validation — compare from both ends toward the middle",
      "Container/trapping water — height arrays where you shrink from both sides",
    ],
    keyInsight: "Sorted order + two pointers = a decision at every step. If the current pair is too small, the only way to increase the sum is to move the left pointer right. This is why sorting is often the first step.",
    gotchas: [
      "Don't forget to handle duplicate skipping in problems like 3Sum — after finding a valid triplet, advance both pointers past identical values",
      "For 'remove duplicates', the return value is usually the new length, not a new array",
      "Two pointers doesn't always mean opposite ends — same-direction (fast/slow) is equally common",
    ],
    problems: [
      { name: "Two Sum II (Sorted)", num: 167, diff: "Med", why: "Classic opposite-end two pointers on sorted array" },
      { name: "3Sum", num: 15, diff: "Med", why: "Fix one element, then two-pointer the rest — teaches the 'reduce to subproblem' pattern" },
      { name: "Container With Most Water", num: 11, diff: "Med", why: "Greedy + two pointers: always move the shorter wall inward" },
      { name: "Remove Duplicates from Sorted Array", num: 26, diff: "Easy", why: "Same-direction variant: slow pointer = write position, fast pointer = read position" },
      { name: "Trapping Rain Water", num: 42, diff: "Hard", why: "Two pointers from both ends, tracking left_max and right_max — the lower side determines water level" },
    ],
    code: `# ── Two Sum II (Sorted Input) ──
def two_sum(numbers, target):
    left, right = 0, len(numbers) - 1
    
    while left < right:
        current_sum = numbers[left] + numbers[right]
        
        if current_sum == target:
            return [left + 1, right + 1]   # 1-indexed
        elif current_sum < target:
            left += 1     # need bigger sum → move left up
        else:
            right -= 1    # need smaller sum → move right down
    
    return []  # no solution (shouldn't happen per problem constraints)


# ── 3Sum ──
# Reduce to Two Sum II: fix nums[i], then two-pointer on nums[i+1:]
def three_sum(nums):
    nums.sort()
    result = []
    
    for i in range(len(nums) - 2):
        # Skip duplicate values for the first element
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        
        left, right = i + 1, len(nums) - 1
        
        while left < right:
            total = nums[i] + nums[left] + nums[right]
            
            if total < 0:
                left += 1
            elif total > 0:
                right -= 1
            else:
                result.append([nums[i], nums[left], nums[right]])
                # Skip duplicates for both pointers
                while left < right and nums[left] == nums[left + 1]:
                    left += 1
                while left < right and nums[right] == nums[right - 1]:
                    right -= 1
                left += 1
                right -= 1
    
    return result


# ── Trapping Rain Water ──
# At each position, water = min(left_max, right_max) - height[i]
# Two pointers let us compute this without pre-building left_max/right_max arrays
def trap(height):
    left, right = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    
    while left < right:
        if height[left] < height[right]:
            # Water at 'left' is bounded by left_max (right side is taller)
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    
    return water`,
    visual: `Array:  [1, 3, 5, 7, 9, 11]    Target sum = 12

Step 1:  L→1              11←R    sum=12 ✓ Found!

Array:  [1, 2, 3, 5, 8, 11]    Target sum = 10

Step 1:  L→1              11←R    sum=12 > 10 → move R left
Step 2:  L→1           8←R        sum=9  < 10 → move L right
Step 3:     L→2        8←R        sum=10 ✓ Found!`
  },
  {
    id: "sliding-window",
    cat: "Arrays & Strings",
    name: "Sliding Window",
    icon: "⊞",
    tc: "O(n)",
    sc: "O(k)",
    tldr: "Maintain a 'window' [left..right] over a sequence. Expand right to include, shrink left to exclude. Converts O(n²) substring/subarray scans into O(n).",
    intuition: `Picture a magnifying glass sliding over a sentence. You're looking for the shortest chunk of text that contains all the letters A, B, and C.

Brute force: check every possible substring — that's O(n²) substrings, each needing O(n) to validate. Way too slow.

Sliding window: start with both edges at the beginning. Expand the right edge one character at a time. Once your window contains all required characters, try shrinking the left edge — the window is bigger than it needs to be. Keep shrinking until you lose a required character, then expand right again.

Why this works: the left edge never moves backward. The right edge never moves backward. Each pointer traverses the string at most once, so total work is O(n) + O(n) = O(n). You're reusing the work from the previous window position instead of recomputing from scratch.

The pattern comes in two flavors:
• Fixed-size window: "max sum of k consecutive elements" — just slide a window of size k.
• Variable-size window: "shortest/longest substring with property X" — expand right until valid, shrink left while still valid, track the best answer.`,
    when: [
      "Find min/max/count of a subarray or substring of size k (fixed window)",
      "Longest substring without repeating characters (variable window + set)",
      "Minimum window substring containing all target characters",
      "String permutation / anagram detection within a larger string",
      "Any problem asking for 'contiguous subarray/substring' with a constraint",
    ],
    keyInsight: "Both pointers only move right. This means every element is added to the window at most once and removed at most once. That O(2n) = O(n) guarantee is why sliding window is so powerful — you never redo work.",
    gotchas: [
      "Off-by-one errors are the #1 bug — be crystal clear whether your window is [left, right] inclusive or [left, right) exclusive",
      "For 'minimum window' problems, remember to try shrinking AFTER you find a valid window, not before",
      "Use a Counter/dict for character frequency tracking — don't try to maintain a sorted structure",
      "The 'number of valid characters satisfied' counter avoids comparing entire frequency maps every step",
    ],
    problems: [
      { name: "Best Time to Buy and Sell Stock", num: 121, diff: "Easy", why: "Simplest sliding window — track min price seen so far (left edge) as you scan right" },
      { name: "Longest Substring Without Repeating Characters", num: 3, diff: "Med", why: "Variable window + hashset. Shrink left when a duplicate enters the window" },
      { name: "Permutation in String", num: 567, diff: "Med", why: "Fixed-size window of len(s1) sliding over s2 — compare character frequency maps" },
      { name: "Minimum Window Substring", num: 76, diff: "Hard", why: "The canonical variable sliding window. Expand right until all chars covered, shrink left to minimize" },
      { name: "Sliding Window Maximum", num: 239, diff: "Hard", why: "Window + monotonic deque — combines two patterns" },
    ],
    code: `# ── Longest Substring Without Repeating Characters ──
def length_of_longest_substring(s):
    seen = set()
    left = 0
    max_len = 0
    
    for right in range(len(s)):
        # If s[right] is already in our window, shrink from the left
        while s[right] in seen:
            seen.remove(s[left])
            left += 1
        
        seen.add(s[right])
        max_len = max(max_len, right - left + 1)
    
    return max_len


# ── Minimum Window Substring ──
# Find the shortest substring of s that contains all characters of t
from collections import Counter

def min_window(s, t):
    if not t or not s:
        return ""
    
    # Count characters we need
    need = Counter(t)
    missing = len(t)        # total characters still needed
    
    left = 0
    best_start, best_end = 0, 0  # 0,0 means "no answer found yet"
    
    for right in range(len(s)):
        # ── Expand: include s[right] in window ──
        if need[s[right]] > 0:
            missing -= 1       # this character was actually needed
        need[s[right]] -= 1    # even if not needed, decrement (goes negative)
        
        # ── Shrink: while window is valid, try to minimize ──
        while missing == 0:
            window_size = right - left + 1
            if best_end == 0 or window_size < best_end - best_start:
                best_start, best_end = left, right + 1
            
            # Remove s[left] from window
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1   # we just lost a needed character
            left += 1
    
    return s[best_start:best_end]


# ── Fixed Window: Max Sum of K Consecutive Elements ──
def max_sum_subarray(nums, k):
    # Initialize window sum with first k elements
    window_sum = sum(nums[:k])
    max_sum = window_sum
    
    # Slide: add one from right, remove one from left
    for i in range(k, len(nums)):
        window_sum += nums[i] - nums[i - k]
        max_sum = max(max_sum, window_sum)
    
    return max_sum`,
    visual: `s = "ADOBECODEBANC"   t = "ABC"

→ Expand right until window contains A, B, C:
  [ADOBEC]ODEBANC     ✓ has A,B,C → length 6
  
→ Shrink left while still valid:
   [DOBEC]ODEBANC     ✗ lost A → stop, expand right again
   
→ Keep going...
  ADOBECODE[BANC]     ✓ has A,B,C → length 4 ← BEST
  
Answer: "BANC"`
  },
  {
    id: "binary-search",
    cat: "Arrays & Strings",
    name: "Binary Search",
    icon: "◎",
    tc: "O(log n)",
    sc: "O(1)",
    tldr: "Halve the search space each step. Works on sorted arrays and any yes/no boundary — including 'binary search on the answer'.",
    intuition: `You're playing a guessing game: "I'm thinking of a number between 1 and 100." You guess 50. "Too high." Now you know it's 1-49. Guess 25. "Too low." Now it's 26-49. Each guess eliminates half the remaining numbers. After ~7 guesses (log₂ 100 ≈ 7), you've found it.

That's binary search on a sorted array. But the FAANG-level insight is: binary search works on ANY monotonic predicate — any yes/no function where all the "no"s come before all the "yes"s (or vice versa).

"Binary search on the answer" is the killer pattern:
  - The question asks: "What is the minimum speed to finish eating bananas in H hours?"
  - You know the answer is between 1 and max(piles).
  - For any speed X, you can check in O(n): "can Koko finish in H hours at speed X?"
  - If speed 5 works, speed 6 definitely works too. Monotonic!
  - Binary search on speed to find the smallest X where can_finish(X) = True.

This transforms an optimization problem into a decision problem, then binary searches the boundary.`,
    when: [
      "Sorted array: find element, find insertion point, find first/last occurrence",
      "'Minimum X such that condition is satisfied' → binary search on the answer",
      "Rotated sorted array — one half is always sorted, use that to decide which half to search",
      "Kth smallest in sorted matrix, median of two sorted arrays",
      "Any problem where you can define f(x) = True/False with a clean boundary",
    ],
    keyInsight: "Stop thinking of binary search as 'find element in sorted array.' Think of it as 'find the boundary where a predicate flips from False to True.' This broader view unlocks a huge class of problems.",
    gotchas: [
      "lo < hi vs lo <= hi: use lo < hi when searching for a boundary (hi = mid), use lo <= hi when searching for an exact value (return mid)",
      "mid = (lo + hi) // 2 can overflow in some languages (not Python, but good habit: mid = lo + (hi - lo) // 2)",
      "Infinite loops: if lo = mid is possible (when hi - lo = 1 and you set lo = mid), use mid = lo + (hi - lo + 1) // 2 to round up",
      "In rotated array problems, compare nums[mid] with nums[lo] or nums[hi] — not with target — to determine which half is sorted",
    ],
    problems: [
      { name: "Binary Search", num: 704, diff: "Easy", why: "Pure template — master this first" },
      { name: "Search in Rotated Sorted Array", num: 33, diff: "Med", why: "One half is always sorted; determine which, then decide if target is in it" },
      { name: "Koko Eating Bananas", num: 875, diff: "Med", why: "Classic 'binary search on the answer' — build the can_finish(speed) predicate" },
      { name: "Find Minimum in Rotated Sorted Array", num: 153, diff: "Med", why: "Binary search to find the rotation pivot — compare mid with rightmost element" },
      { name: "Median of Two Sorted Arrays", num: 4, diff: "Hard", why: "Binary search on the partition point of the smaller array — one of the hardest problems to get right" },
    ],
    code: `# ── Standard Binary Search ──
def binary_search(nums, target):
    lo, hi = 0, len(nums) - 1
    
    while lo <= hi:
        mid = (lo + hi) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            lo = mid + 1    # target is in the right half
        else:
            hi = mid - 1    # target is in the left half
    
    return -1  # not found


# ── Binary Search on the Answer: Koko Eating Bananas ──
# Koko eats bananas at speed k. Each hour she picks a pile
# and eats k bananas (or finishes the pile). Find minimum k
# to eat all piles within h hours.
import math

def min_eating_speed(piles, h):
    
    def can_finish(speed):
        """Can Koko finish all piles in ≤ h hours at this speed?"""
        hours_needed = sum(math.ceil(p / speed) for p in piles)
        return hours_needed <= h
    
    lo, hi = 1, max(piles)  # speed is between 1 and max pile size
    
    while lo < hi:          # note: lo < hi (boundary search)
        mid = (lo + hi) // 2
        if can_finish(mid):
            hi = mid        # mid works → try even slower
        else:
            lo = mid + 1    # mid too slow → need faster
    
    return lo               # lo == hi == minimum valid speed


# ── Search in Rotated Sorted Array ──
def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    
    while lo <= hi:
        mid = (lo + hi) // 2
        
        if nums[mid] == target:
            return mid
        
        # Determine which half is sorted
        if nums[lo] <= nums[mid]:
            # Left half [lo..mid] is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1   # target is in sorted left half
            else:
                lo = mid + 1   # target is in right half
        else:
            # Right half [mid..hi] is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1   # target is in sorted right half
            else:
                hi = mid - 1   # target is in left half
    
    return -1`,
    visual: `Binary search on answer (Koko Bananas):
piles = [3, 6, 7, 11]    h = 8 hours

Speed range: [1 ............... 11]

mid=6: hours = ⌈3/6⌉+⌈6/6⌉+⌈7/6⌉+⌈11/6⌉ = 1+1+2+2 = 6 ≤ 8 ✓
  → try slower:  [1 ...... 6]

mid=3: hours = 1+2+3+4 = 10 > 8 ✗
  → need faster: [4 ... 6]

mid=5: hours = 1+2+2+3 = 8 ≤ 8 ✓
  → try slower:  [4 .. 5]

mid=4: hours = 1+2+2+3 = 8 ≤ 8 ✓
  → try slower:  [4]

Answer: speed = 4`
  },
  {
    id: "hashmap",
    cat: "Arrays & Strings",
    name: "HashMap / HashSet",
    icon: "⊕",
    tc: "O(1) lookup",
    sc: "O(n)",
    tldr: "Trade memory for speed. Store values, frequencies, or indices for instant O(1) 'have I seen this?' checks.",
    intuition: `A hashmap is like a giant filing cabinet with labeled drawers. Need to check if you've seen the number 42? Open drawer "42" — either something's there or it's not. O(1) instead of scanning through everything.

The classic example is Two Sum. Given [2, 7, 11, 15] and target 9, for each number you compute its complement (9 - 2 = 7) and check: "Is 7 already in my filing cabinet?" If yes, you've found your pair. If no, file the current number (2) and move on.

The deeper insight is that hashmaps let you convert "search" problems into "lookup" problems. Instead of "find if any previous element equals X" (which is O(n) per check, O(n²) total), you store all previous elements and check in O(1).

Frequency counting with Counter is the other workhorse: group anagrams (same sorted characters), find majority element (count > n/2), check permutations (same frequency map).

The prefix sum + hashmap combo is especially powerful: to find subarrays summing to k, store prefix sums in a hashmap. If current prefix sum minus k equals a previously seen prefix sum, you've found a valid subarray.`,
    when: [
      "Two Sum (unsorted) — need O(1) complement lookup",
      "Frequency counting: anagrams, duplicates, majority element",
      "Prefix sum + hashmap: subarray sum equals k",
      "Index tracking: first/last occurrence, closest occurrence",
      "Design problems: LRU cache, random pick, insert/delete/getRandom in O(1)",
    ],
    keyInsight: "If you're doing nested loops where the inner loop searches for something, a hashmap can almost always eliminate that inner loop. Think: 'What am I repeatedly searching for? Can I precompute and store it?'",
    gotchas: [
      "In Two Sum, check if the complement exists BEFORE adding current number — otherwise x + x = target gives false positives",
      "defaultdict(list) or defaultdict(int) avoids KeyError and simplifies code — use it",
      "Hash collisions are O(n) worst case but O(1) amortized — interviewers won't ask you to handle collisions unless it's a design question",
      "Mutable types (lists, dicts) can't be dict keys — use tuples instead (sorted tuple of chars for anagram grouping)",
    ],
    problems: [
      { name: "Two Sum", num: 1, diff: "Easy", why: "THE hashmap problem — complement lookup pattern" },
      { name: "Group Anagrams", num: 49, diff: "Med", why: "Key = sorted characters (or char frequency tuple), value = list of words" },
      { name: "Subarray Sum Equals K", num: 560, diff: "Med", why: "Prefix sum + hashmap — counts how many prefix sums equal (current_prefix - k)" },
      { name: "LRU Cache", num: 146, diff: "Med", why: "HashMap + OrderedDict (or doubly linked list) for O(1) get/put with eviction" },
      { name: "Longest Consecutive Sequence", num: 128, diff: "Med", why: "Put all nums in a set, only start counting from sequence starts (num-1 not in set)" },
    ],
    code: `# ── Two Sum ──
def two_sum(nums, target):
    seen = {}  # value → index
    
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i   # store AFTER checking (avoid using same element twice)
    
    return []


# ── Group Anagrams ──
from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    
    for word in strs:
        # Anagrams have the same sorted characters
        key = tuple(sorted(word))   # tuple because lists aren't hashable
        groups[key].append(word)
    
    return list(groups.values())


# ── Subarray Sum Equals K ──
# Key idea: if prefix[j] - prefix[i] == k, then subarray [i+1..j] sums to k
def subarray_sum(nums, k):
    count = 0
    current_prefix = 0
    prefix_counts = {0: 1}   # prefix sum → how many times we've seen it
    
    for num in nums:
        current_prefix += num
        
        # How many previous prefix sums equal (current_prefix - k)?
        # Each one gives us a valid subarray ending here
        count += prefix_counts.get(current_prefix - k, 0)
        
        prefix_counts[current_prefix] = prefix_counts.get(current_prefix, 0) + 1
    
    return count


# ── LRU Cache ──
from collections import OrderedDict

class LRUCache:
    def __init__(self, capacity: int):
        self.cache = OrderedDict()
        self.cap = capacity
    
    def get(self, key: int) -> int:
        if key not in self.cache:
            return -1
        self.cache.move_to_end(key)    # mark as recently used
        return self.cache[key]
    
    def put(self, key: int, value: int) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.cap:
            self.cache.popitem(last=False)  # evict least recently used`,
    visual: `Two Sum: nums = [2, 7, 11, 15]  target = 9

i=0: num=2  complement=7  seen={}        → not found, store {2:0}
i=1: num=7  complement=2  seen={2:0}     → FOUND at index 0!
Answer: [0, 1]

Subarray Sum = K:  nums = [1, 2, 3]  k = 3

prefix:  0  →  1  →  3  →  6
               ↑      ↑
         prefix_counts = {0:1}
         i=0: prefix=1, need 1-3=-2, not in map
         i=1: prefix=3, need 3-3=0,  0 IS in map → count=1  (subarray [1,2])
         i=2: prefix=6, need 6-3=3,  3 IS in map → count=2  (subarray [3])`
  },
  {
    id: "prefix-sum",
    cat: "Arrays & Strings",
    name: "Prefix Sum",
    icon: "Σ",
    tc: "O(n) build, O(1) query",
    sc: "O(n)",
    tldr: "Precompute running totals so any subarray sum is just one subtraction: prefix[right] - prefix[left].",
    intuition: `You have a row of boxes with coins: [3, 1, 4, 1, 5]. Someone keeps asking "how many coins are in boxes 2 through 4?"

Brute force: add up boxes 2, 3, and 4 each time. If they ask 1000 questions, that's 1000 × O(n) work.

Prefix sum: precompute cumulative totals once:
  prefix = [0, 3, 4, 8, 9, 14]
  
Now sum(boxes 2..4) = prefix[5] - prefix[1] = 14 - 3 = 11. One subtraction. O(1) per query, O(n) setup.

Why does this work? prefix[i] = sum of all elements from index 0 to i-1. So prefix[right+1] - prefix[left] cancels out everything before 'left', leaving exactly the subarray sum.

The pattern extends to 2D: prefix rectangles let you compute any sub-rectangle sum in O(1) using inclusion-exclusion. And combined with a hashmap, prefix sums solve "subarray sum equals k" — because if prefix[j] - prefix[i] = k, you've found a valid subarray.

Product variants work the same way: prefix product and suffix product arrays let you compute "product of array except self" without division.`,
    when: [
      "Repeated range sum queries on a static array",
      "Subarray sum equals k (prefix sum + hashmap — see HashMap section)",
      "Product of array except self (prefix and suffix products)",
      "2D matrix region sum queries",
      "Subarray sum divisible by k (prefix sum mod k)",
    ],
    keyInsight: "Prefix sums turn subarray sums from O(n) to O(1). The trick is recognizing when a problem is secretly asking for subarray sums — 'contiguous elements', 'range queries', 'running total' are all signals.",
    gotchas: [
      "Prefix array is length n+1 with prefix[0] = 0 — this avoids edge cases when the subarray starts at index 0",
      "For 'product except self', don't use division — handle zeros correctly by building prefix and suffix product arrays separately",
      "In 2D prefix sums, the formula uses inclusion-exclusion: add two rectangles, subtract the overlap, add back the corner",
    ],
    problems: [
      { name: "Range Sum Query - Immutable", num: 303, diff: "Easy", why: "Pure prefix sum template — build once, query O(1)" },
      { name: "Product of Array Except Self", num: 238, diff: "Med", why: "Forward pass (prefix products) + backward pass (suffix products)" },
      { name: "Subarray Sums Divisible by K", num: 974, diff: "Med", why: "Prefix sum mod k + hashmap — if two prefixes have same mod, the subarray between them is divisible by k" },
      { name: "Range Sum Query 2D", num: 304, diff: "Med", why: "2D prefix sums with inclusion-exclusion for rectangle queries" },
    ],
    code: `# ── Range Sum Query (Immutable) ──
class NumArray:
    def __init__(self, nums):
        # prefix[i] = sum of nums[0..i-1]
        self.prefix = [0] * (len(nums) + 1)
        for i in range(len(nums)):
            self.prefix[i + 1] = self.prefix[i] + nums[i]
    
    def sum_range(self, left, right):
        # Sum of nums[left..right] inclusive
        return self.prefix[right + 1] - self.prefix[left]


# ── Product of Array Except Self ──
# answer[i] = product of everything EXCEPT nums[i]
# = (product of everything to the left) × (product of everything to the right)
def product_except_self(nums):
    n = len(nums)
    answer = [1] * n
    
    # Forward pass: answer[i] = product of nums[0..i-1]
    prefix_product = 1
    for i in range(n):
        answer[i] = prefix_product
        prefix_product *= nums[i]
    
    # Backward pass: multiply by product of nums[i+1..n-1]
    suffix_product = 1
    for i in range(n - 1, -1, -1):
        answer[i] *= suffix_product
        suffix_product *= nums[i]
    
    return answer
    # Example: nums = [1, 2, 3, 4]
    # After forward:  [1, 1, 2, 6]     (prefix products)
    # After backward: [24, 12, 8, 6]   (multiply by suffix products)`,
    visual: `nums = [3, 1, 4, 1, 5]

Build prefix:
  prefix[0] = 0
  prefix[1] = 0 + 3 = 3
  prefix[2] = 3 + 1 = 4
  prefix[3] = 4 + 4 = 8
  prefix[4] = 8 + 1 = 9
  prefix[5] = 9 + 5 = 14

  prefix = [0, 3, 4, 8, 9, 14]

Query sum(index 1 to 3):
  prefix[4] - prefix[1] = 9 - 3 = 6
  Check: nums[1]+nums[2]+nums[3] = 1+4+1 = 6 ✓`
  },
  {
    id: "monotonic-stack",
    cat: "Arrays & Strings",
    name: "Monotonic Stack",
    icon: "▥",
    tc: "O(n)",
    sc: "O(n)",
    tldr: "A stack that stays sorted (increasing or decreasing). When a new element breaks the order, pop — and each popped element just found its 'answer'.",
    intuition: `Imagine you're standing in a line of people of different heights, all facing right. Each person wants to know: "Who is the first person taller than me to my right?"

Brute force: each person looks at every person to their right. O(n²).

Monotonic decreasing stack: process people left to right. Maintain a stack of people who haven't found their answer yet. When a new person arrives who is taller than the person on top of the stack, that stack person just found their answer — pop them. Keep popping until the stack top is taller than the new person (or stack is empty), then push the new person.

Why O(n)? Each person is pushed once and popped once. Total operations: 2n = O(n).

The key insight is what the pop means. When element X gets popped because element Y arrived:
- Y is the Next Greater Element for X (in a decreasing stack)
- Y is the Next Smaller Element for X (in an increasing stack)

This pattern solves Largest Rectangle in Histogram — one of the most famous hard problems — because each bar needs to find the first shorter bar to its left and right.`,
    when: [
      "Next Greater Element / Next Smaller Element to the right (or left)",
      "Daily Temperatures ('how many days until warmer?')",
      "Largest Rectangle in Histogram",
      "Stock Span (how many consecutive days was the price ≤ today?)",
      "Remove K Digits to make smallest number",
    ],
    keyInsight: "A monotonic stack is a clever way to find, for each element, the nearest element that is larger (or smaller) than it. The stack holds 'candidates' waiting for their answer.",
    gotchas: [
      "Store indices on the stack, not values — you almost always need the index to compute distances or boundaries",
      "After processing all elements, anything left on the stack has no next greater/smaller — handle these (often default to 0 or n)",
      "Decreasing stack → finds next GREATER; Increasing stack → finds next SMALLER (this is counterintuitive — think about what causes a pop)",
      "For circular arrays (like Next Greater Element II), process the array twice (indices 0 to 2n-1, using i % n)",
    ],
    problems: [
      { name: "Next Greater Element I", num: 496, diff: "Easy", why: "Direct template application — build next-greater map for one array" },
      { name: "Daily Temperatures", num: 739, diff: "Med", why: "Classic monotonic decreasing stack — pop when a warmer day arrives" },
      { name: "Largest Rectangle in Histogram", num: 84, diff: "Hard", why: "Each bar finds its left and right boundaries (first shorter bar) via monotonic increasing stack" },
      { name: "Remove K Digits", num: 402, diff: "Med", why: "Monotonic increasing stack — remove larger digits that appear before smaller ones" },
    ],
    code: `# ── Daily Temperatures ──
# For each day, how many days until a warmer temperature?
def daily_temperatures(temperatures):
    n = len(temperatures)
    answer = [0] * n
    stack = []  # stores indices; temps at these indices are monotonically decreasing
    
    for i in range(n):
        # Pop all days that are cooler than today — today is their answer
        while stack and temperatures[stack[-1]] < temperatures[i]:
            prev_day = stack.pop()
            answer[prev_day] = i - prev_day
        stack.append(i)
    
    # Anything left on stack has no warmer day → answer stays 0
    return answer


# ── Largest Rectangle in Histogram ──
# For each bar, find how far it can extend left and right
# (until hitting a shorter bar). Width × height = area.
def largest_rectangle_area(heights):
    stack = []    # (index, height) — monotonically increasing heights
    max_area = 0
    
    for i, h in enumerate(heights):
        start = i  # how far left can this bar extend?
        
        while stack and stack[-1][1] > h:
            # Bar on stack is taller than current → it can't extend right past i
            idx, height = stack.pop()
            max_area = max(max_area, height * (i - idx))
            start = idx   # current bar can extend left to where popped bar started
        
        stack.append((start, h))
    
    # Remaining bars extend all the way to the right edge
    for idx, height in stack:
        max_area = max(max_area, height * (len(heights) - idx))
    
    return max_area`,
    visual: `Daily Temperatures: [73, 74, 75, 71, 69, 72, 76, 73]

Process each day (stack holds indices with decreasing temps):

i=0: push 0       stack=[0(73)]
i=1: 74>73 → pop 0, ans[0]=1-0=1.  push 1    stack=[1(74)]
i=2: 75>74 → pop 1, ans[1]=2-1=1.  push 2    stack=[2(75)]
i=3: 71<75 → push 3                stack=[2(75), 3(71)]
i=4: 69<71 → push 4                stack=[2(75), 3(71), 4(69)]
i=5: 72>69 → pop 4, ans[4]=5-4=1
     72>71 → pop 3, ans[3]=5-3=2.  push 5    stack=[2(75), 5(72)]
i=6: 76>72 → pop 5, ans[5]=6-5=1
     76>75 → pop 2, ans[2]=6-2=4.  push 6    stack=[6(76)]
i=7: 73<76 → push 7                stack=[6(76), 7(73)]

answer = [1, 1, 4, 2, 1, 1, 0, 0]`
  },
  {
    id: "bfs",
    cat: "Graphs & Trees",
    name: "BFS",
    icon: "◉",
    tc: "O(V + E)",
    sc: "O(V)",
    tldr: "Explore level by level using a queue. Guarantees shortest path in unweighted graphs. Multi-source BFS starts from all sources at once.",
    intuition: `Drop a stone in a pond. Ripples spread outward in concentric circles — every point at distance 1 is reached before any point at distance 2. That's BFS.

You use a queue (FIFO). Start by adding the source node. Then repeat: take the next node from the front of the queue, visit all its unvisited neighbors, add them to the back of the queue. Because of FIFO ordering, you finish all distance-1 nodes before starting distance-2 nodes.

This is why BFS finds shortest paths in unweighted graphs: the first time you reach any node, you reached it via the shortest path. DFS can't guarantee this — it might find a long winding path first.

The "level-by-level" structure is explicit: at the start of each iteration, everything in the queue is at the same distance. Process all of them (for _ in range(len(queue))), and everything you add is at distance+1.

Multi-source BFS is a powerful extension: instead of starting from one source, add ALL sources to the queue initially. They all expand simultaneously, like multiple stones dropped in the pond at once. This solves problems like "distance from every cell to the nearest X."`,
    when: [
      "Shortest path in an unweighted graph or grid",
      "Level-order traversal of a tree",
      "Minimum number of steps/moves/transformations",
      "Multi-source problems: rotting oranges, walls & gates, 01-matrix",
      "'Nearest X from every cell' in a grid",
    ],
    keyInsight: "BFS = shortest path in unweighted graphs. If edges have weights, you need Dijkstra. If you just need to visit everything (not shortest path), either BFS or DFS works.",
    gotchas: [
      "Always mark nodes as visited WHEN ADDING to the queue, not when processing — otherwise you'll add duplicates",
      "For grids, visited can be done in-place (set grid[r][c] to a special value) to save memory",
      "The 'level count' trick: process len(queue) elements per iteration, incrementing distance after each level",
      "Multi-source BFS: add ALL initial sources before starting the loop — don't BFS from each one separately (that's n × BFS, not one BFS)",
    ],
    problems: [
      { name: "Binary Tree Level Order Traversal", num: 102, diff: "Med", why: "Template BFS on a tree — process one level at a time" },
      { name: "Rotting Oranges", num: 994, diff: "Med", why: "Multi-source BFS — all rotten oranges start spreading simultaneously" },
      { name: "Word Ladder", num: 127, diff: "Hard", why: "BFS where neighbors are words differing by one letter — shortest transformation sequence" },
      { name: "01 Matrix", num: 542, diff: "Med", why: "Multi-source BFS from all 0-cells — find distance to nearest 0 for each cell" },
    ],
    code: `# ── Rotting Oranges (Multi-source BFS) ──
from collections import deque

def oranges_rotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = deque()
    fresh_count = 0
    
    # Step 1: Find all initial rotten oranges (sources) and count fresh ones
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh_count += 1
    
    if fresh_count == 0:
        return 0  # nothing to rot
    
    minutes = 0
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    
    # Step 2: BFS — process one "minute" (level) at a time
    while queue and fresh_count > 0:
        minutes += 1
        
        for _ in range(len(queue)):   # process entire current level
            r, c = queue.popleft()
            
            for dr, dc in directions:
                nr, nc = r + dr, c + dc
                
                if (0 <= nr < rows and 0 <= nc < cols 
                    and grid[nr][nc] == 1):        # fresh orange
                    grid[nr][nc] = 2               # mark rotten (= visited)
                    fresh_count -= 1
                    queue.append((nr, nc))
    
    return minutes if fresh_count == 0 else -1


# ── Word Ladder ──
def ladder_length(begin_word, end_word, word_list):
    word_set = set(word_list)
    if end_word not in word_set:
        return 0
    
    queue = deque([(begin_word, 1)])   # (word, steps)
    visited = {begin_word}
    
    while queue:
        word, steps = queue.popleft()
        
        # Try changing each character to a-z
        for i in range(len(word)):
            for c in 'abcdefghijklmnopqrstuvwxyz':
                next_word = word[:i] + c + word[i+1:]
                
                if next_word == end_word:
                    return steps + 1
                
                if next_word in word_set and next_word not in visited:
                    visited.add(next_word)
                    queue.append((next_word, steps + 1))
    
    return 0  # no path`,
    visual: `Rotting Oranges — Multi-source BFS:

Grid:        Min 0:      Min 1:      Min 2:      Min 3:      Min 4:
2 1 1        2 1 1       2 2 1       2 2 2       2 2 2       2 2 2
1 1 0   →    1 1 0  →    2 1 0  →    2 2 0  →    2 2 0  →    2 2 0
0 1 1        0 1 1       0 1 1       0 2 1       0 2 2       0 2 2

Start: queue = [(0,0)]
       fresh = 5
       
Each minute, all rotten oranges infect adjacent fresh ones simultaneously.
Answer: 4 minutes`
  },
  {
    id: "dfs",
    cat: "Graphs & Trees",
    name: "DFS",
    icon: "⤋",
    tc: "O(V + E)",
    sc: "O(V)",
    tldr: "Go as deep as possible, then backtrack. Recursive or iterative (explicit stack). Use for connectivity, cycles, paths, and topological ordering.",
    intuition: `You're exploring a maze. At every fork, you always go left first. You keep going left until you hit a dead end. Then you backtrack to the last fork and try the next direction. Eventually, you explore the entire maze.

That's DFS. It naturally maps to recursion — the call stack IS the backtracking mechanism. But you can also use an explicit stack for the same effect (and to avoid Python's recursion limit).

DFS is versatile:
• Connected components: run DFS from each unvisited node — each DFS call discovers one component.
• Cycle detection: in a directed graph, if you reach a node that's currently on your recursion stack (in-progress), you've found a cycle. Use a 3-state coloring: white (unvisited), gray (in-progress), black (done).
• Topological sort: DFS post-order reversal gives a valid ordering.
• All paths: DFS with backtracking explores every possible path.

BFS vs DFS: BFS guarantees shortest paths but uses more memory (entire frontier). DFS uses less memory (just the current path) but doesn't find shortest paths. For "visit everything" problems, both work — pick whichever is simpler.`,
    when: [
      "Number of islands / connected components in a grid or graph",
      "Detect cycle in directed graph (gray/black coloring) or undirected (parent tracking)",
      "Path finding: 'does a path exist?', 'find all paths'",
      "Topological sorting (DFS post-order)",
      "Clone graph, flood fill, maze solving",
    ],
    keyInsight: "DFS and recursion are the same thing. If you can define a problem as 'solve for neighbors, then combine', DFS is your tool. The call stack handles backtracking automatically.",
    gotchas: [
      "Python recursion limit is ~1000 — for large graphs/grids, use iterative DFS with an explicit stack or sys.setrecursionlimit()",
      "For cycle detection in directed graphs, you need 3 states (not just visited/unvisited) — a node can be visited but NOT on the current path",
      "In grids, mark cells as visited BEFORE recursing (not after) to avoid infinite loops",
      "Iterative DFS processes nodes in the opposite order of recursive DFS for the same graph — this matters when order is important (topological sort)",
    ],
    problems: [
      { name: "Number of Islands", num: 200, diff: "Med", why: "For each unvisited '1', DFS to mark the entire island — count DFS calls" },
      { name: "Course Schedule", num: 207, diff: "Med", why: "Cycle detection in directed graph — if cycle exists, can't finish all courses" },
      { name: "Clone Graph", num: 133, diff: "Med", why: "DFS + hashmap (old node → new node) to avoid cloning the same node twice" },
      { name: "Pacific Atlantic Water Flow", num: 417, diff: "Med", why: "DFS from ocean borders inward — water flows downhill, so search uphill from the ocean" },
      { name: "All Paths From Source to Target", num: 797, diff: "Med", why: "DFS with backtracking — collect all paths in a DAG" },
    ],
    code: `# ── Number of Islands ──
def num_islands(grid):
    if not grid:
        return 0
    
    rows, cols = len(grid), len(grid[0])
    count = 0
    
    def dfs(r, c):
        # Base case: out of bounds or water
        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':
            return
        
        grid[r][c] = '0'  # mark visited (sink the land)
        
        # Explore all 4 directions
        dfs(r + 1, c)
        dfs(r - 1, c)
        dfs(r, c + 1)
        dfs(r, c - 1)
    
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == '1':
                count += 1   # found a new island
                dfs(r, c)    # sink the entire island
    
    return count


# ── Course Schedule (Cycle Detection) ──
# Can you finish all courses? Only if there's no cycle in the prerequisite graph.
def can_finish(num_courses, prerequisites):
    graph = [[] for _ in range(num_courses)]
    for course, prereq in prerequisites:
        graph[prereq].append(course)
    
    # 0 = unvisited, 1 = in current DFS path (gray), 2 = fully processed (black)
    state = [0] * num_courses
    
    def has_cycle(node):
        if state[node] == 1:   # back edge → cycle!
            return True
        if state[node] == 2:   # already fully explored, no cycle here
            return False
        
        state[node] = 1        # mark as "exploring"
        
        for neighbor in graph[node]:
            if has_cycle(neighbor):
                return True
        
        state[node] = 2        # mark as "done"
        return False
    
    # Check every node (graph might be disconnected)
    for i in range(num_courses):
        if has_cycle(i):
            return False
    
    return True`,
    visual: `Number of Islands:
Grid:              After DFS from (0,0):    After DFS from (0,3):
1 1 0 1            0 0 0 1                  0 0 0 0
1 0 0 1     →      0 0 0 1         →        0 0 0 0
0 0 1 0            0 0 1 0                  0 0 1 0
                   island #1                 island #2
                   
After DFS from (2,2):    
0 0 0 0              
0 0 0 0              Answer: 3 islands
0 0 0 0              
island #3`
  },
  {
    id: "topological-sort",
    cat: "Graphs & Trees",
    name: "Topological Sort",
    icon: "⟶",
    tc: "O(V + E)",
    sc: "O(V)",
    tldr: "Order nodes in a DAG so every edge points forward. Two methods: Kahn's (BFS + in-degree) or DFS post-order reversal.",
    intuition: `You're getting dressed. Socks must come before shoes. Underwear before pants. Shirt before jacket. There are many valid orders (shirt first or socks first doesn't matter), but some constraints are fixed.

Topological sort finds ANY valid ordering where all constraints are satisfied. It only works on DAGs (Directed Acyclic Graphs) — if there's a cycle (A before B, B before C, C before A), no valid ordering exists.

Kahn's algorithm (BFS-based, more intuitive):
1. Count in-degrees (how many prerequisites each node has).
2. Add all nodes with in-degree 0 to a queue (no prerequisites).
3. Process the queue: take a node, add it to the result, and decrement in-degrees of its neighbors. If any neighbor's in-degree drops to 0, add it to the queue.
4. If result has fewer nodes than the graph, there's a cycle.

Why it works: you always process nodes that have all their prerequisites satisfied. Like taking courses — you can only take a course when you've completed all its prerequisites.

DFS post-order reversal is the other approach: do a full DFS, and when a node finishes (all descendants processed), add it to a list. Reverse the list for topological order.`,
    when: [
      "Course scheduling with prerequisites",
      "Build system: compile files in dependency order",
      "Task scheduling: which tasks can run in parallel? (nodes with in-degree 0 at the same time)",
      "Alien Dictionary: derive letter ordering from sorted word list",
      "Any DAG where you need a valid ordering",
    ],
    keyInsight: "Kahn's algorithm naturally detects cycles (if output length < V, cycle exists) and can tell you which tasks are parallelizable (all nodes in the queue at the same time can run in parallel).",
    gotchas: [
      "Topological sort is only defined for DAGs — undirected graphs or graphs with cycles don't have one",
      "There can be MULTIPLE valid topological orderings — don't assume uniqueness",
      "Kahn's algorithm: forgetting to build the in-degree array correctly is a common bug — make sure you process ALL edges",
      "For 'Alien Dictionary': edges come from comparing adjacent words — if word A is a prefix of word B but A comes after B, that's invalid input",
    ],
    problems: [
      { name: "Course Schedule II", num: 210, diff: "Med", why: "Direct application of Kahn's — return the ordering or empty if cycle" },
      { name: "Alien Dictionary", num: 269, diff: "Hard", why: "Build a graph from word comparisons, then topological sort the characters" },
      { name: "Parallel Courses", num: 1136, diff: "Med", why: "Kahn's with level tracking — answer is the number of BFS levels (longest path in DAG)" },
    ],
    code: `# ── Course Schedule II (Kahn's Algorithm) ──
from collections import deque

def find_order(num_courses, prerequisites):
    # Step 1: Build adjacency list and in-degree array
    graph = [[] for _ in range(num_courses)]
    in_degree = [0] * num_courses
    
    for course, prereq in prerequisites:
        graph[prereq].append(course)
        in_degree[course] += 1
    
    # Step 2: Start with all courses that have no prerequisites
    queue = deque()
    for i in range(num_courses):
        if in_degree[i] == 0:
            queue.append(i)
    
    order = []
    
    # Step 3: Process the queue
    while queue:
        node = queue.popleft()
        order.append(node)
        
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:  # all prereqs satisfied
                queue.append(neighbor)
    
    # Step 4: Check for cycles
    if len(order) == num_courses:
        return order
    else:
        return []  # cycle exists — impossible to finish all courses


# ── Parallel Courses (minimum semesters) ──
# Same as Kahn's but track BFS levels — answer is number of levels
def minimum_semesters(n, relations):
    graph = [[] for _ in range(n + 1)]
    in_degree = [0] * (n + 1)
    
    for prev_course, next_course in relations:
        graph[prev_course].append(next_course)
        in_degree[next_course] += 1
    
    queue = deque(i for i in range(1, n + 1) if in_degree[i] == 0)
    semesters = 0
    courses_taken = 0
    
    while queue:
        semesters += 1
        # All courses in the queue RIGHT NOW can be taken in parallel
        for _ in range(len(queue)):
            course = queue.popleft()
            courses_taken += 1
            for next_course in graph[course]:
                in_degree[next_course] -= 1
                if in_degree[next_course] == 0:
                    queue.append(next_course)
    
    return semesters if courses_taken == n else -1`,
    visual: `Prerequisites: [[1,0], [2,0], [3,1], [3,2]]

     0 → 1 → 3        in-degrees: 0→0  1→1  2→1  3→2
       ↘ 2 ↗

Kahn's BFS:
  Queue: [0]             → process 0, decrement neighbors 1,2
  Queue: [1, 2]          → process 1, decrement 3. Process 2, decrement 3.
  Queue: [3]             → process 3
  
  Result: [0, 1, 2, 3]  ✓ valid order (length = 4 = num_courses)`
  },
  {
    id: "dijkstra",
    cat: "Graphs & Trees",
    name: "Dijkstra's Algorithm",
    icon: "◇",
    tc: "O(E log V)",
    sc: "O(V)",
    tldr: "Shortest path from one source in a weighted graph with non-negative edges. Uses a min-heap to always process the closest unvisited node.",
    intuition: `Imagine you're planning a road trip and every road has a distance. You want the shortest route from city A to every other city.

BFS won't work because roads have different lengths — a path with fewer hops might be longer in miles. Dijkstra's insight: always process the closest unvisited city first.

Use a min-heap (priority queue). Start with (distance=0, source). Pop the closest city, and for each neighbor, check: "Is the path through me shorter than their current best?" If yes, update their distance and push them onto the heap.

Why it works: when you pop a node from the heap, you've found its shortest path — guaranteed. Proof by contradiction: if there were a shorter path, it would have to go through some other unprocessed node. But that node has a longer distance in the heap (because we always pop the smallest), so the path through it can't be shorter (since all edge weights are non-negative).

This is why Dijkstra doesn't work with negative edges — a detour through a negative-weight edge could produce a shorter path than the direct route, violating the "pop = finalized" guarantee.`,
    when: [
      "Shortest path in a graph with non-negative edge weights",
      "Network delay time: how long until ALL nodes receive a signal?",
      "Cheapest flights (modified: allow at most k intermediate stops)",
      "Path with minimum effort in a grid (edge weight = height difference)",
      "Any 'minimize cost to get from A to B' with varying edge costs",
    ],
    keyInsight: "Once a node is popped from the min-heap, its shortest distance is finalized. This 'lazy deletion' approach (skip a node if we've already found a shorter path) is simpler than decrease-key operations.",
    gotchas: [
      "DOES NOT work with negative edge weights — use Bellman-Ford instead",
      "The 'if d > dist[u]: continue' check is critical — it skips outdated heap entries and keeps the algorithm efficient",
      "Initialize distances to infinity, source to 0",
      "For 'cheapest flights with k stops', you can't use the standard 'skip if distance is larger' optimization — you might need to revisit a node via a path with fewer stops",
    ],
    problems: [
      { name: "Network Delay Time", num: 743, diff: "Med", why: "Textbook Dijkstra — find shortest path from source to all nodes, answer is the max" },
      { name: "Path With Minimum Effort", num: 1631, diff: "Med", why: "Dijkstra on a grid where edge weight = abs height difference. Minimize the maximum edge on the path" },
      { name: "Cheapest Flights Within K Stops", num: 787, diff: "Med", why: "Modified Dijkstra with a stops constraint — BFS/Bellman-Ford variant might be cleaner" },
      { name: "Swim in Rising Water", num: 778, diff: "Hard", why: "Dijkstra where cost = max elevation along the path" },
    ],
    code: `# ── Network Delay Time ──
import heapq

def network_delay_time(times, n, k):
    # Build adjacency list
    graph = [[] for _ in range(n + 1)]
    for u, v, w in times:
        graph[u].append((v, w))
    
    # Distance array: shortest known distance from source k
    dist = [float('inf')] * (n + 1)
    dist[k] = 0
    
    # Min-heap: (distance, node)
    heap = [(0, k)]
    
    while heap:
        d, u = heapq.heappop(heap)
        
        # Skip if we already found a shorter path to u
        if d > dist[u]:
            continue
        
        # Relax all neighbors
        for v, weight in graph[u]:
            new_dist = dist[u] + weight
            if new_dist < dist[v]:
                dist[v] = new_dist
                heapq.heappush(heap, (new_dist, v))
    
    # Answer: time for signal to reach the farthest node
    result = max(dist[1:])  # skip index 0 (nodes are 1-indexed)
    return result if result < float('inf') else -1


# ── Path With Minimum Effort ──
# Grid where cost = max absolute height difference along the path
def minimum_effort_path(heights):
    rows, cols = len(heights), len(heights[0])
    dist = [[float('inf')] * cols for _ in range(rows)]
    dist[0][0] = 0
    
    heap = [(0, 0, 0)]  # (effort, row, col)
    
    while heap:
        effort, r, c = heapq.heappop(heap)
        
        if r == rows - 1 and c == cols - 1:
            return effort  # reached destination
        
        if effort > dist[r][c]:
            continue
        
        for dr, dc in [(0,1),(0,-1),(1,0),(-1,0)]:
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                # Edge weight = height difference
                new_effort = max(effort, abs(heights[nr][nc] - heights[r][c]))
                if new_effort < dist[nr][nc]:
                    dist[nr][nc] = new_effort
                    heapq.heappush(heap, (new_effort, nr, nc))
    
    return 0`,
    visual: `Network: 1→2 (cost 1), 1→3 (cost 4), 2→3 (cost 2)
Source: node 1

Initial:  dist = [_, 0, ∞, ∞]    heap = [(0, 1)]

Pop (0,1):  relax 1→2: dist[2]=1  relax 1→3: dist[3]=4
            heap = [(1, 2), (4, 3)]

Pop (1,2):  relax 2→3: 1+2=3 < 4  dist[3]=3
            heap = [(3, 3), (4, 3)]

Pop (3,3):  3 is destination. 
Pop (4,3):  4 > dist[3]=3, skip.

Answer: max(dist[1:]) = max(0, 1, 3) = 3`
  },
  {
    id: "union-find",
    cat: "Graphs & Trees",
    name: "Union-Find (DSU)",
    icon: "⊔",
    tc: "O(α(n)) ≈ O(1)",
    sc: "O(n)",
    tldr: "Track groups of connected elements. Union merges two groups. Find checks which group an element belongs to. Both are near-O(1) with path compression and union by rank.",
    intuition: `Imagine a room full of people. Initially, everyone is their own group. When you learn "Alice and Bob are friends," you merge their groups. Later, "Are Alice and Charlie in the same group?" is answered instantly.

Each group is a tree. Every person points to a "parent," and the root of the tree is the group representative. Find(x) walks up the parent pointers to the root. Union(x, y) makes one root point to the other.

Two optimizations make it blazing fast:
• Path compression: when you call Find(x), make every node along the path point directly to the root. Next time, it's O(1).
• Union by rank: always attach the shorter tree under the taller one. Keeps trees flat.

Together, these give O(α(n)) per operation, where α is the inverse Ackermann function — effectively O(1) for any practical input (α(n) ≤ 4 for n < 10^80).

Union-Find is the backbone of Kruskal's MST algorithm and excels at dynamic connectivity — when edges are added one by one and you need to answer "are these connected?" at each step.`,
    when: [
      "Dynamic connectivity: edges added over time, need to check 'connected?'",
      "Number of connected components (count how many roots remain)",
      "Redundant connection: find the edge that creates a cycle",
      "Accounts merge: group all emails belonging to the same person",
      "Kruskal's MST: sort edges by weight, union endpoints, skip if already connected",
    ],
    keyInsight: "Union-Find answers 'are X and Y in the same group?' in near-O(1), which is faster than BFS/DFS when you're processing edges one at a time. It can't find shortest paths though — it only knows about connectivity.",
    gotchas: [
      "Always implement BOTH path compression (in find) AND union by rank — without both, worst case is O(n)",
      "Union returns True/False for 'did we actually merge two different groups?' — useful for cycle detection",
      "Don't forget: components start at n and decrease by 1 with each successful union",
      "For problems like 'Accounts Merge', union email→email, then group by root at the end",
    ],
    problems: [
      { name: "Redundant Connection", num: 684, diff: "Med", why: "Process edges one by one. The first edge where union() returns False (already connected) is redundant" },
      { name: "Number of Connected Components", num: 323, diff: "Med", why: "Union all edges, answer is the remaining component count" },
      { name: "Accounts Merge", num: 721, diff: "Med", why: "Union emails belonging to the same account, then group by root representative" },
      { name: "Longest Consecutive Sequence", num: 128, diff: "Med", why: "Union consecutive numbers (if n exists, union n with n+1 if present). Track group sizes" },
    ],
    code: `# ── Union-Find Template ──
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))  # each node is its own parent
        self.rank = [0] * n           # tree height upper bound
        self.components = n
    
    def find(self, x):
        """Find root of x with path compression."""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # compress path
        return self.parent[x]
    
    def union(self, x, y):
        """Merge groups of x and y. Returns True if they were separate."""
        root_x, root_y = self.find(x), self.find(y)
        
        if root_x == root_y:
            return False  # already in the same group
        
        # Attach smaller tree under larger tree
        if self.rank[root_x] < self.rank[root_y]:
            root_x, root_y = root_y, root_x
        self.parent[root_y] = root_x
        
        if self.rank[root_x] == self.rank[root_y]:
            self.rank[root_x] += 1
        
        self.components -= 1
        return True


# ── Redundant Connection ──
# Tree has n nodes and n-1 edges. We're given n edges (one extra).
# Find the edge that, if removed, makes it a valid tree.
def find_redundant_connection(edges):
    uf = UnionFind(len(edges) + 1)  # 1-indexed nodes
    
    for u, v in edges:
        if not uf.union(u, v):
            return [u, v]  # this edge connects already-connected nodes
    
    return []`,
    visual: `Union-Find operations on 5 nodes: {0} {1} {2} {3} {4}

union(0, 1):  {0,1} {2} {3} {4}     components = 4
union(2, 3):  {0,1} {2,3} {4}       components = 3
union(1, 3):  {0,1,2,3} {4}         components = 2

find(0) == find(3)?  YES (same root)
find(0) == find(4)?  NO  (different roots)

Path compression after find(3):
Before: 3→2→0    After: 3→0, 2→0   (flat tree, next find is O(1))`
  },
  {
    id: "tree-dfs",
    cat: "Graphs & Trees",
    name: "Tree DFS Patterns",
    icon: "🌲",
    tc: "O(n)",
    sc: "O(h)",
    tldr: "Most tree problems are solved by recursion: solve left, solve right, combine. Three key patterns: return info up, pass info down, track global state.",
    intuition: `Trees are recursive by nature — every subtree is itself a tree. This means most tree problems have a beautiful recursive structure.

There are three fundamental patterns:

PATTERN 1 — Return info upward (bottom-up):
"What is the height of this tree?"
height(node) = 1 + max(height(left), height(right))
The answer flows UP from leaves to root. Each node computes its answer from its children's answers.

PATTERN 2 — Pass info downward (top-down):
"Does a root-to-leaf path sum to target?"
has_path(node, remaining) → has_path(left, remaining - node.val)
The context flows DOWN from root to leaves. Each node passes updated info to its children.

PATTERN 3 — Global state:
"What is the diameter (longest path between any two nodes)?"
At each node, the diameter THROUGH that node = left_height + right_height. The global maximum might not pass through the root. Use a nonlocal variable to track the best answer seen anywhere in the tree.

Master these three patterns and you can solve ~90% of tree problems. The trick is recognizing which pattern fits — what information flows where?`,
    when: [
      "Height, depth, balanced check (bottom-up return)",
      "Path sum from root to leaf (top-down passing)",
      "Diameter, maximum path sum (global state)",
      "Lowest Common Ancestor (bottom-up with null checks)",
      "BST validation, kth smallest, serialize/deserialize",
    ],
    keyInsight: "Before coding, ask: 'What does each node need from its children? What does each node need from its parent? What global info do I need to track?' This determines which pattern to use.",
    gotchas: [
      "Base case is almost always: if not node: return 0 (or None, or True, depending on the problem)",
      "Diameter is NOT necessarily through the root — it's the max over ALL nodes, hence the global variable",
      "For BST problems, in-order traversal gives sorted order — this unlocks kth smallest, validation, and more",
      "Serialize/deserialize: preorder + null markers is the simplest approach",
    ],
    problems: [
      { name: "Maximum Depth of Binary Tree", num: 104, diff: "Easy", why: "Pure bottom-up: height = 1 + max(left, right)" },
      { name: "Diameter of Binary Tree", num: 543, diff: "Easy", why: "Global state pattern: track max(left_h + right_h) across all nodes" },
      { name: "Lowest Common Ancestor", num: 236, diff: "Med", why: "Bottom-up: if left and right both return non-null, current node is the LCA" },
      { name: "Binary Tree Maximum Path Sum", num: 124, diff: "Hard", why: "Like diameter but with sums. At each node: max path through me = val + max(0,left) + max(0,right)" },
      { name: "Serialize and Deserialize Binary Tree", num: 297, diff: "Hard", why: "Preorder traversal with null markers. Deserialize by consuming tokens from a queue" },
    ],
    code: `# ── Pattern 1: Bottom-Up (Max Depth) ──
def max_depth(root):
    if not root:
        return 0
    return 1 + max(max_depth(root.left), max_depth(root.right))


# ── Pattern 2: Top-Down (Path Sum) ──
def has_path_sum(root, target_sum):
    if not root:
        return False
    
    # Leaf node: check if remaining sum equals this node's value
    if not root.left and not root.right:
        return target_sum == root.val
    
    # Pass reduced target down to children
    remaining = target_sum - root.val
    return (has_path_sum(root.left, remaining) or
            has_path_sum(root.right, remaining))


# ── Pattern 3: Global State (Diameter) ──
def diameter_of_binary_tree(root):
    max_diameter = 0
    
    def height(node):
        nonlocal max_diameter
        if not node:
            return 0
        
        left_h = height(node.left)
        right_h = height(node.right)
        
        # The path through this node has length left_h + right_h
        max_diameter = max(max_diameter, left_h + right_h)
        
        # Return height to parent
        return 1 + max(left_h, right_h)
    
    height(root)
    return max_diameter


# ── Lowest Common Ancestor ──
def lowest_common_ancestor(root, p, q):
    # Base case: null node, or we found p or q
    if not root or root == p or root == q:
        return root
    
    left = lowest_common_ancestor(root.left, p, q)
    right = lowest_common_ancestor(root.right, p, q)
    
    # If both sides returned non-null, p and q are in different subtrees
    # → current node is the LCA
    if left and right:
        return root
    
    # Otherwise, LCA is whichever side returned non-null
    return left or right`,
    visual: `Diameter of Binary Tree:

        1
       / \\
      2   3      height(4)=0, height(5)=0
     / \\         height(2)=1+max(0,0)=1, diameter through 2 = 0+0 = 0
    4   5        height(3)=0
                  height(1)=1+max(1,0)=2, diameter through 1 = 1+0 = 1
                  
Wait — what about:
        1
       / \\
      2   3      height(4)=1, height(5)=1
     / \\         height(2)=1+max(1,1)=2, diameter through 2 = 1+1 = 2  ← MAX
    4   5        Diameter is 2, going 4→2→5 (doesn't pass through root!)
   /     \\
  6       7`
  },
  {
    id: "trie",
    cat: "Graphs & Trees",
    name: "Trie (Prefix Tree)",
    icon: "⊤",
    tc: "O(L) per op",
    sc: "O(Σ * L * n)",
    tldr: "A tree where each node is a character. Words sharing a prefix share nodes. O(L) insert/search/prefix where L is word length.",
    intuition: `Think of a phone book organized as a tree. The root has up to 26 children (a-z). Each child has up to 26 children, and so on. The word "cat" follows the path root → c → a → t.

Now here's the power: "car" shares the path root → c → a with "cat". If you have 10,000 words starting with "pre", the prefix "pre" is stored only once — not 10,000 times.

This is why autocomplete is fast: type "pre" and the trie instantly narrows to just the subtree under the "e" node at depth 3. No scanning required.

Each node stores:
• children: a dict (or array of size 26) mapping characters to child nodes
• is_end: boolean flag — "does a word end here?" Without this, you couldn't distinguish between "the" being a word vs. just a prefix of "them."

Insert: walk down the tree character by character, creating nodes as needed. Mark the last node as is_end = True.
Search: walk down the tree. If you reach the end and is_end is True, the word exists.
Starts_with: walk down the tree. If you reach the end of the prefix (regardless of is_end), the prefix exists.`,
    when: [
      "Autocomplete / prefix-based search",
      "Word Search II in a grid (backtracking + trie to prune branches)",
      "Spell checker / dictionary with wildcard search",
      "Maximum XOR of two numbers (binary trie on bit representations)",
      "Counting words with a given prefix",
    ],
    keyInsight: "A trie trades space for time in prefix-heavy problems. If you're doing many prefix lookups, a hashset of words won't help — you'd need to check all words for each prefix. A trie makes prefix checking O(L).",
    gotchas: [
      "Don't forget the is_end flag — a trie with 'apple' in it should return False for search('app') unless 'app' was also inserted",
      "For Word Search II, attach the word itself to the end node to avoid reconstructing it from the path",
      "Memory: worst case is O(alphabet_size * max_length * num_words), but shared prefixes compress this heavily in practice",
      "For wildcard search (e.g., 'a.c'), use DFS/BFS at the wildcard character to explore all children",
    ],
    problems: [
      { name: "Implement Trie", num: 208, diff: "Med", why: "The template — implement insert, search, startsWith" },
      { name: "Word Search II", num: 212, diff: "Hard", why: "Build trie from word list, DFS from every grid cell, prune when trie path doesn't exist" },
      { name: "Design Add and Search Words", num: 211, diff: "Med", why: "Trie + DFS for wildcard '.' matching" },
    ],
    code: `# ── Trie Implementation ──
class TrieNode:
    def __init__(self):
        self.children = {}    # char → TrieNode
        self.is_end = False   # does a word end here?

class Trie:
    def __init__(self):
        self.root = TrieNode()
    
    def insert(self, word: str) -> None:
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True
    
    def search(self, word: str) -> bool:
        node = self._find_node(word)
        return node is not None and node.is_end
    
    def starts_with(self, prefix: str) -> bool:
        return self._find_node(prefix) is not None
    
    def _find_node(self, prefix: str):
        """Walk down the trie following the prefix. Return final node or None."""
        node = self.root
        for char in prefix:
            if char not in node.children:
                return None
            node = node.children[char]
        return node


# ── Wildcard Search (Design Add and Search Words) ──
class WordDictionary:
    def __init__(self):
        self.root = TrieNode()
    
    def add_word(self, word):
        node = self.root
        for char in word:
            if char not in node.children:
                node.children[char] = TrieNode()
            node = node.children[char]
        node.is_end = True
    
    def search(self, word):
        def dfs(node, i):
            if i == len(word):
                return node.is_end
            
            if word[i] == '.':
                # Wildcard: try ALL children
                for child in node.children.values():
                    if dfs(child, i + 1):
                        return True
                return False
            else:
                if word[i] not in node.children:
                    return False
                return dfs(node.children[word[i]], i + 1)
        
        return dfs(self.root, 0)`,
    visual: `Insert: "apple", "app", "apt", "bat"

         root
        /    \\
       a      b
       |      |
       p      a
      / \\     |
     p   t*   t*
     |
     l
     |
     e*

* = is_end (a word ends here)

search("app")  → walk r→a→p→p → is_end=True  ✓
search("ap")   → walk r→a→p   → is_end=False  ✗
startsWith("ap") → walk r→a→p → node exists   ✓`
  },
  {
    id: "backtracking",
    cat: "Recursion & DP",
    name: "Backtracking",
    icon: "↩",
    tc: "O(k^n) / O(n!)",
    sc: "O(n)",
    tldr: "Systematically try all candidates. Choose → explore → un-choose. Prune branches early when they can't lead to valid solutions.",
    intuition: `You're solving a maze by hand. At each fork, you pick a direction, mark your path, and keep going. If you hit a dead end, you erase your last step and try a different direction. That's backtracking.

The template is always the same:
  def backtrack(state):
      if state is a complete solution:
          record it
          return
      for each possible choice:
          if choice is valid (pruning):
              make the choice
              backtrack(updated state)
              undo the choice         ← this is the "backtrack"

The "undo the choice" step is what separates backtracking from regular DFS. You're exploring all possible paths in a decision tree, and you need to restore the state so that the next branch starts fresh.

Key insight: PRUNING makes backtracking practical. Without pruning, you're exploring every possible combination (exponential). With smart pruning, you skip entire branches of the decision tree. In N-Queens, for example, if you place a queen in row 1 column 1 and row 2 column 2, you can immediately skip all placements for rows 3-8 that use column 1, column 2, or the diagonals — you don't need to actually try them.

Common decision trees:
• Subsets: for each element, include or exclude → 2^n leaves
• Permutations: for each position, choose from remaining → n! leaves
• Combinations: choose k from n, maintaining order → C(n,k) leaves`,
    when: [
      "Generate all permutations, combinations, or subsets",
      "Sudoku solver, N-Queens, crossword puzzles",
      "Word search in a grid",
      "Palindrome partitioning, IP address restoration",
      "Any problem that says 'find ALL valid configurations'",
    ],
    keyInsight: "Backtracking = DFS on a decision tree. The 'undo' step is what lets you explore all branches using a single mutable state variable instead of creating copies.",
    gotchas: [
      "path.append() + path.pop() is the pattern — DON'T do result.append(path) without copying (use path[:] or list(path))",
      "For subsets/combinations, use a 'start' index to avoid duplicates by only considering elements after the current one",
      "For permutations, use a 'used' boolean array or swap elements",
      "To handle duplicates in the input, sort first and skip if nums[i] == nums[i-1] and i-1 wasn't used",
    ],
    problems: [
      { name: "Subsets", num: 78, diff: "Med", why: "Template: at each element, branch into include/exclude" },
      { name: "Permutations", num: 46, diff: "Med", why: "Template: for each position, try all unused elements" },
      { name: "Combination Sum", num: 39, diff: "Med", why: "Variable-length combinations with reuse allowed — pass i (not i+1) to allow reuse" },
      { name: "N-Queens", num: 51, diff: "Hard", why: "Place queens row by row, prune using column/diagonal tracking sets" },
      { name: "Palindrome Partitioning", num: 131, diff: "Med", why: "At each index, try every possible palindrome substring starting there" },
    ],
    code: `# ── Subsets ──
def subsets(nums):
    result = []
    
    def backtrack(start, path):
        # Every state is a valid subset — add it
        result.append(path[:])    # COPY the path!
        
        for i in range(start, len(nums)):
            path.append(nums[i])        # choose
            backtrack(i + 1, path)       # explore (i+1: no reuse)
            path.pop()                   # un-choose
    
    backtrack(0, [])
    return result


# ── Permutations ──
def permute(nums):
    result = []
    
    def backtrack(path, remaining):
        if not remaining:
            result.append(path[:])
            return
        
        for i in range(len(remaining)):
            path.append(remaining[i])
            # remaining without element i
            backtrack(path, remaining[:i] + remaining[i+1:])
            path.pop()
    
    backtrack([], nums)
    return result


# ── Combination Sum (reuse allowed) ──
def combination_sum(candidates, target):
    result = []
    
    def backtrack(start, path, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        if remaining < 0:
            return  # prune: overshot
        
        for i in range(start, len(candidates)):
            path.append(candidates[i])
            backtrack(i, path, remaining - candidates[i])  # i, not i+1: reuse OK
            path.pop()
    
    backtrack(0, [], target)
    return result


# ── N-Queens ──
def solve_n_queens(n):
    result = []
    cols = set()        # columns with queens
    diag1 = set()       # r-c diagonals with queens
    diag2 = set()       # r+c anti-diagonals with queens
    
    def backtrack(row, board):
        if row == n:
            result.append(["".join(r) for r in board])
            return
        
        for col in range(n):
            if col in cols or (row-col) in diag1 or (row+col) in diag2:
                continue  # prune: conflict
            
            # Place queen
            board[row][col] = 'Q'
            cols.add(col); diag1.add(row-col); diag2.add(row+col)
            
            backtrack(row + 1, board)
            
            # Remove queen (backtrack)
            board[row][col] = '.'
            cols.remove(col); diag1.remove(row-col); diag2.remove(row+col)
    
    board = [['.' for _ in range(n)] for _ in range(n)]
    backtrack(0, board)
    return result`,
    visual: `Subsets of [1, 2, 3] — Decision Tree:

                    []
              /     |      \\
           [1]    [2]     [3]
          /   \\    |
       [1,2] [1,3] [2,3]
        |
      [1,2,3]

Result: [], [1], [2], [3], [1,2], [1,3], [2,3], [1,2,3]

Combination Sum: candidates=[2,3,6,7], target=7

                      7
                /    |    \\    \\
            -2(5)  -3(4) -6(1) -7(0)✓ → [7]
           /  |      |
        -2(3) -3(2) -3(1)
        /  |    |
     -2(1) -3(0)✓ → [2,2,3]
       |
     -2(-1)✗ prune`
  },
  {
    id: "dp-1d",
    cat: "Recursion & DP",
    name: "1D Dynamic Programming",
    icon: "▶",
    tc: "O(n) – O(n²)",
    sc: "O(n) or O(1)",
    tldr: "Store subproblem answers to avoid recomputation. dp[i] = answer for the problem up to index i. Find the recurrence, build the table.",
    intuition: `Think of climbing stairs. You can take 1 or 2 steps at a time. How many ways to reach step n?

To reach step n, you either came from step n-1 (one step) or step n-2 (two steps). So:
  ways(n) = ways(n-1) + ways(n-2)

That's just Fibonacci! But if you compute it recursively without storing results, you recompute the same subproblems exponentially many times. ways(5) needs ways(4) and ways(3). ways(4) needs ways(3) again. And ways(3) gets computed 3 more times deeper in the tree.

DP says: compute each subproblem ONCE and store it.

There are two equivalent approaches:
• Top-down (memoization): write the recursive solution, add @lru_cache to store results. Easiest to code.
• Bottom-up (tabulation): fill a table dp[] from the base case up. Often more efficient (no recursion overhead).

The art of DP is defining the state and finding the recurrence:
1. State: What does dp[i] represent? "Min coins to make amount i" or "Number of ways to reach step i" or "Length of LIS ending at index i"
2. Recurrence: How does dp[i] relate to previous dp values?
3. Base case: What are dp[0], dp[1], etc.?
4. Answer: Which dp value is the final answer?

Space optimization: if dp[i] only depends on dp[i-1] and dp[i-2], you don't need the whole array — just two variables.`,
    when: [
      "Fibonacci-like: each answer depends on a fixed number of previous answers",
      "Min/max cost to reach the end (house robber, climbing stairs, coin change)",
      "Counting paths/ways (decode ways, unique paths in 1D)",
      "Longest Increasing Subsequence",
      "Word Break: can this string be segmented into dictionary words?",
    ],
    keyInsight: "If you can write a recursive solution and see overlapping subproblems (same function called with same args multiple times), that's DP. Start with recursion, then optimize with memoization or convert to bottom-up.",
    gotchas: [
      "Off-by-one in dp array size: dp of length amount+1 means dp[amount] is your answer",
      "Initialize dp correctly: dp[0] = 0 for min-cost problems, dp[0] = 1 for counting problems",
      "Coin change: infinity initialization is important — if dp[i] stays infinity, amount i is unreachable",
      "LIS O(n log n) solution uses patience sorting (binary search on tails array) — interviewers may ask for this",
    ],
    problems: [
      { name: "Climbing Stairs", num: 70, diff: "Easy", why: "Pure Fibonacci — dp[i] = dp[i-1] + dp[i-2]" },
      { name: "House Robber", num: 198, diff: "Med", why: "dp[i] = max(dp[i-1], dp[i-2] + nums[i]) — skip adjacent houses" },
      { name: "Coin Change", num: 322, diff: "Med", why: "Unbounded knapsack: dp[amount] = min(dp[amount - coin] + 1) for each coin" },
      { name: "Longest Increasing Subsequence", num: 300, diff: "Med", why: "O(n²): dp[i] = max(dp[j]+1) for j<i where nums[j]<nums[i]. O(n log n): patience sorting" },
      { name: "Word Break", num: 139, diff: "Med", why: "dp[i] = True if s[:i] can be segmented. Check all j<i: dp[j] and s[j:i] in wordDict" },
    ],
    code: `# ── Climbing Stairs (Fibonacci pattern) ──
def climb_stairs(n):
    if n <= 2:
        return n
    
    # Only need two previous values
    prev2, prev1 = 1, 2
    
    for i in range(3, n + 1):
        current = prev1 + prev2
        prev2, prev1 = prev1, current
    
    return prev1


# ── House Robber ──
# Can't rob adjacent houses. Maximize total loot.
def rob(nums):
    if len(nums) <= 2:
        return max(nums)
    
    # dp[i] = max loot considering houses 0..i
    # Either skip house i (dp[i-1]) or rob it (dp[i-2] + nums[i])
    prev2, prev1 = nums[0], max(nums[0], nums[1])
    
    for i in range(2, len(nums)):
        current = max(prev1, prev2 + nums[i])
        prev2, prev1 = prev1, current
    
    return prev1


# ── Coin Change ──
# Minimum coins to make 'amount'. Coins can be reused.
def coin_change(coins, amount):
    # dp[i] = minimum coins needed to make amount i
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0  # base case: 0 coins for amount 0
    
    for a in range(1, amount + 1):
        for coin in coins:
            if coin <= a and dp[a - coin] != float('inf'):
                dp[a] = min(dp[a], dp[a - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1


# ── Longest Increasing Subsequence (O(n log n)) ──
import bisect

def length_of_lis(nums):
    # tails[i] = smallest possible tail element for an IS of length i+1
    tails = []
    
    for num in nums:
        pos = bisect.bisect_left(tails, num)
        if pos == len(tails):
            tails.append(num)    # extends the longest IS
        else:
            tails[pos] = num     # found a smaller tail for this length
    
    return len(tails)
    # Example: nums = [10, 9, 2, 5, 3, 7, 101, 18]
    # tails evolves: [10] → [9] → [2] → [2,5] → [2,3] → [2,3,7] → [2,3,7,101] → [2,3,7,18]
    # Length = 4 (one valid LIS: [2, 3, 7, 101])`,
    visual: `Coin Change: coins = [1, 3, 4], amount = 6

dp[0] = 0
dp[1] = min(dp[1-1]+1) = min(dp[0]+1) = 1          → use coin 1
dp[2] = min(dp[2-1]+1) = min(dp[1]+1) = 2          → use coin 1
dp[3] = min(dp[3-1]+1, dp[3-3]+1) = min(3, 1) = 1  → use coin 3
dp[4] = min(dp[3]+1, dp[1]+1, dp[0]+1) = min(2, 2, 1) = 1  → coin 4
dp[5] = min(dp[4]+1, dp[2]+1, dp[1]+1) = min(2, 3, 2) = 2  → coins 4+1
dp[6] = min(dp[5]+1, dp[3]+1, dp[2]+1) = min(3, 2, 3) = 2  → coins 3+3

Answer: dp[6] = 2`
  },
  {
    id: "dp-2d",
    cat: "Recursion & DP",
    name: "2D Dynamic Programming",
    icon: "▦",
    tc: "O(n*m)",
    sc: "O(n*m)",
    tldr: "State depends on two variables: dp[i][j]. Common setups: two strings, grid paths, knapsack (item × capacity), intervals.",
    intuition: `1D DP says dp[i] depends on earlier dp values. 2D DP says dp[i][j] depends on adjacent cells in a 2D table.

The most common pattern: TWO STRINGS. Given strings "horse" and "ros", edit distance dp[i][j] = "minimum edits to convert first i chars of word1 into first j chars of word2."

The recurrence is:
  if word1[i-1] == word2[j-1]:
      dp[i][j] = dp[i-1][j-1]          # chars match, no edit needed
  else:
      dp[i][j] = 1 + min(
          dp[i-1][j],      # delete from word1
          dp[i][j-1],      # insert into word1
          dp[i-1][j-1]     # replace
      )

The base cases fill the first row and column: dp[i][0] = i (delete all), dp[0][j] = j (insert all).

Other 2D patterns:
• Grid paths: dp[i][j] = ways to reach cell (i,j). dp[i][j] = dp[i-1][j] + dp[i][j-1].
• 0/1 Knapsack: dp[i][w] = max value using first i items with capacity w.
• Stock buy/sell: dp[i][state] = max profit on day i in state (holding/not holding/cooldown).

Space optimization: if dp[i][j] only depends on row i-1 and row i, you can use two 1D arrays instead of a 2D grid.`,
    when: [
      "Two strings: edit distance, LCS, regex matching, wildcard matching",
      "Grid traversal: unique paths, minimum path sum",
      "0/1 Knapsack: partition equal subset sum, target sum",
      "Stock problems with states (hold/not_hold/cooldown × day)",
      "Interval DP: burst balloons, matrix chain multiplication",
    ],
    keyInsight: "For two-string problems, always draw the 2D table on paper. Fill in the base cases (first row, first column), then fill cell by cell. The pattern becomes obvious.",
    gotchas: [
      "dp array is (m+1) × (n+1) — the +1 accounts for empty string/zero items base cases",
      "Edit distance: the three operations (insert, delete, replace) map to three adjacent cells — make sure you get the direction right",
      "For LCS, if chars match you go diagonal (dp[i-1][j-1] + 1), if not you take max of left and top",
      "Knapsack: process items in the outer loop, capacity in the inner loop. For 0/1 knapsack, iterate capacity in REVERSE to avoid using an item twice",
    ],
    problems: [
      { name: "Longest Common Subsequence", num: 1143, diff: "Med", why: "Classic two-string DP. Match → diagonal+1, no match → max(left, top)" },
      { name: "Edit Distance", num: 72, diff: "Med", why: "Three operations map to three cells. The canonical 2D string DP problem" },
      { name: "Unique Paths", num: 62, diff: "Med", why: "Grid DP: dp[i][j] = dp[i-1][j] + dp[i][j-1]. Can only move right or down" },
      { name: "Best Time to Buy and Sell Stock with Cooldown", num: 309, diff: "Med", why: "State machine DP: each day you're in state hold/sold/rest, transitions between states" },
      { name: "Target Sum", num: 494, diff: "Med", why: "0/1 knapsack variant: dp[i][sum] = ways to reach sum using first i numbers" },
    ],
    code: `# ── Longest Common Subsequence ──
def longest_common_subsequence(text1, text2):
    m, n = len(text1), len(text2)
    
    # dp[i][j] = LCS length of text1[:i] and text2[:j]
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i-1] == text2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1    # match → diagonal + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])  # no match → best of skip either
    
    return dp[m][n]


# ── Edit Distance (Levenshtein Distance) ──
def min_distance(word1, word2):
    m, n = len(word1), len(word2)
    
    # dp[i][j] = min edits to convert word1[:i] to word2[:j]
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # Base cases
    for i in range(m + 1): dp[i][0] = i   # delete all chars from word1
    for j in range(n + 1): dp[0][j] = j   # insert all chars of word2
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]            # chars match, free
            else:
                dp[i][j] = 1 + min(
                    dp[i-1][j],       # delete word1[i-1]
                    dp[i][j-1],       # insert word2[j-1]
                    dp[i-1][j-1]      # replace word1[i-1] with word2[j-1]
                )
    
    return dp[m][n]


# ── Stock Buy/Sell with Cooldown (State Machine DP) ──
# States: hold (have stock), sold (just sold, must cooldown), rest (no stock, can buy)
def max_profit(prices):
    if len(prices) < 2:
        return 0
    
    hold = -prices[0]   # bought on day 0
    sold = 0            # impossible to have sold on day 0
    rest = 0            # doing nothing
    
    for price in prices[1:]:
        new_hold = max(hold, rest - price)    # keep holding, or buy from rest
        new_sold = hold + price                # sell what we're holding
        new_rest = max(rest, sold)             # keep resting, or cooldown after selling
        
        hold, sold, rest = new_hold, new_sold, new_rest
    
    return max(sold, rest)  # can't end in 'hold' state`,
    visual: `Edit Distance: word1 = "horse", word2 = "ros"

       ""  r  o  s
  ""  [ 0  1  2  3 ]
  h   [ 1  1  2  3 ]
  o   [ 2  2  1  2 ]
  r   [ 3  2  2  2 ]
  s   [ 4  3  3  2 ]
  e   [ 5  4  4  3 ]  ← answer: 3

Reading the operations (trace back from dp[5][3]):
  horse → rorse (replace h→r)
  rorse → rose  (delete r)
  rose  → ros   (delete e)`
  },
  {
    id: "heap",
    cat: "Advanced",
    name: "Heap / Priority Queue",
    icon: "△",
    tc: "O(log n)",
    sc: "O(n)",
    tldr: "Efficiently access the min (or max) element. O(1) peek, O(log n) push/pop. Python's heapq is a min-heap — negate for max-heap.",
    intuition: `A heap is like a hospital triage system. Patients arrive at random times with random severities. You always treat the most severe patient next.

A sorted array could do this, but insertion takes O(n) (shifting elements). A heap gives you O(log n) insertion and O(log n) removal of the top element, while always keeping the min (or max) on top.

Under the hood, a heap is a complete binary tree stored as an array. The parent at index i has children at 2i+1 and 2i+2. The "heap property" says every parent is ≤ its children (min-heap). This means the root is always the minimum.

In Python, heapq gives you a MIN-heap. For a max-heap, negate your values: push -5 instead of 5, and negate when you pop.

The two-heap pattern is elegant: maintain a max-heap for the smaller half and a min-heap for the larger half. The median is either the top of the max-heap (odd count) or the average of both tops (even count). Balance the heaps so they differ in size by at most 1.

Heaps also power the "k-th largest" pattern: maintain a min-heap of size k. Everything in the heap is among the k largest elements. The top of the heap (the smallest of the k largest) is the k-th largest element.`,
    when: [
      "K-th largest/smallest element (keep a heap of size k)",
      "Merge k sorted lists (min-heap of k current heads)",
      "Find median from data stream (two-heap: max-heap + min-heap)",
      "Top K frequent elements (Counter + heap)",
      "Task Scheduler, Meeting Rooms II (process by deadline/end time)",
    ],
    keyInsight: "If you repeatedly need 'the smallest (or largest) element so far', that's a heap. Lists give O(n) for this; heaps give O(log n).",
    gotchas: [
      "Python heapq is min-heap only — push (-value, item) for max-heap behavior",
      "heapq.heappush and heapq.heappop — don't use list.sort() or sorted() as a replacement (that's O(n log n) every time)",
      "For merge k sorted lists, push (value, list_index, node) — the list_index is needed as a tiebreaker since ListNodes aren't comparable",
      "heapq.nlargest(k, iterable) and heapq.nsmallest(k, iterable) exist but are O(n log k) — fine for one-off queries",
    ],
    problems: [
      { name: "Kth Largest Element in Array", num: 215, diff: "Med", why: "Min-heap of size k — the top is always the k-th largest" },
      { name: "Top K Frequent Elements", num: 347, diff: "Med", why: "Counter + min-heap of size k by frequency, or bucket sort for O(n)" },
      { name: "Merge k Sorted Lists", num: 23, diff: "Hard", why: "Min-heap of k current heads. Pop smallest, push its .next if it exists" },
      { name: "Find Median from Data Stream", num: 295, diff: "Hard", why: "Two-heap pattern: max-heap (small half) + min-heap (large half)" },
      { name: "Task Scheduler", num: 621, diff: "Med", why: "Max-heap of task frequencies + cooldown queue" },
    ],
    code: `# ── Kth Largest Element ──
import heapq

def find_kth_largest(nums, k):
    # Min-heap of size k: the top is the k-th largest
    heap = []
    
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)  # remove smallest; keep only k largest
    
    return heap[0]  # smallest of the k largest = k-th largest


# ── Find Median from Data Stream (Two Heaps) ──
class MedianFinder:
    def __init__(self):
        self.lo = []  # max-heap (store negated values) — smaller half
        self.hi = []  # min-heap — larger half
        # Invariant: len(lo) == len(hi) or len(lo) == len(hi) + 1
    
    def add_num(self, num):
        # Step 1: Push to max-heap (negate for max behavior)
        heapq.heappush(self.lo, -num)
        
        # Step 2: Ensure max of lo ≤ min of hi
        heapq.heappush(self.hi, -heapq.heappop(self.lo))
        
        # Step 3: Balance sizes (lo can be 1 larger)
        if len(self.hi) > len(self.lo):
            heapq.heappush(self.lo, -heapq.heappop(self.hi))
    
    def find_median(self):
        if len(self.lo) > len(self.hi):
            return -self.lo[0]                            # odd count
        return (-self.lo[0] + self.hi[0]) / 2.0          # even count


# ── Merge K Sorted Lists ──
def merge_k_lists(lists):
    heap = []
    
    # Push the head of each list onto the heap
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst.val, i, lst))  # i = tiebreaker
    
    dummy = current = ListNode(0)
    
    while heap:
        val, i, node = heapq.heappop(heap)
        current.next = node
        current = current.next
        
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    
    return dummy.next`,
    visual: `Find Median — Two Heaps:

Add 5:  lo=[-5]  hi=[]       median = 5
Add 2:  lo=[-2]  hi=[5]      median = (2+5)/2 = 3.5
Add 8:  lo=[-5,-2] hi=[8]    median = 5
Add 1:  lo=[-2,-1] hi=[5,8]  median = (2+5)/2 = 3.5

lo (max-heap): top = largest of small half
hi (min-heap): top = smallest of large half

     lo                hi
  [-5, -2]          [5, 8]
  (stores 5,2)
  
  max(lo) = 2 ≤ min(hi) = 5  ✓
  median = average of tops when sizes equal`
  },
  {
    id: "intervals",
    cat: "Advanced",
    name: "Interval Problems",
    icon: "⟷",
    tc: "O(n log n)",
    sc: "O(n)",
    tldr: "Sort intervals by start (or end) time, then sweep through. Overlap = current start ≤ previous end.",
    intuition: `Interval problems are about events that have a start and end time. Meetings, flights, paint strokes on a number line — anything with a range.

The universal first step is SORT. Usually by start time, sometimes by end time (for greedy selection problems). Sorting puts intervals in order so you only need to compare adjacent/recent intervals.

Merging: after sorting by start time, intervals overlap if and only if the next interval's start ≤ the current merged interval's end. When they overlap, extend the current interval: end = max(end, next.end). When they don't, start a new merged interval.

Meeting rooms: "How many rooms do we need?" = "What is the maximum number of overlapping intervals at any point?" Sort by start time, use a min-heap of end times. For each meeting: if it starts after the earliest ending meeting (heap top), reuse that room (pop + push new end). Otherwise, need a new room (just push new end). Answer = heap size.

Greedy selection (non-overlapping): sort by END time. Always pick the interval that ends earliest — this leaves the most room for future intervals.`,
    when: [
      "Merge overlapping intervals",
      "Insert a new interval into a sorted non-overlapping list",
      "Meeting rooms: can attend all? / minimum rooms needed?",
      "Non-overlapping intervals: minimum removals to eliminate all overlaps",
      "Anything with [start, end] pairs and overlap detection",
    ],
    keyInsight: "Sort, then sweep. After sorting, you only need to look at the previous interval to check for overlap. This reduces a 2D problem (start × end) to a 1D sweep.",
    gotchas: [
      "Merge: don't forget to add the last merged interval to the result (common off-by-one)",
      "Meeting rooms II: sort by start time AND use a min-heap — sorting by end time alone doesn't work here",
      "Non-overlapping intervals: sort by end time (greedy), not start time",
      "Edge case: intervals that touch at endpoints — check if the problem considers [1,2] and [2,3] as overlapping or not",
    ],
    problems: [
      { name: "Merge Intervals", num: 56, diff: "Med", why: "The template: sort by start, merge if overlapping" },
      { name: "Insert Interval", num: 57, diff: "Med", why: "Binary search or linear scan for insertion point, then merge overlapping neighbors" },
      { name: "Meeting Rooms II", num: 253, diff: "Med", why: "Min-heap of end times to track concurrent meetings" },
      { name: "Non-overlapping Intervals", num: 435, diff: "Med", why: "Greedy: sort by end time, always keep the interval that ends earliest" },
    ],
    code: `# ── Merge Intervals ──
def merge(intervals):
    intervals.sort(key=lambda x: x[0])
    merged = [intervals[0]]
    
    for start, end in intervals[1:]:
        if start <= merged[-1][1]:
            # Overlapping: extend the current interval
            merged[-1][1] = max(merged[-1][1], end)
        else:
            # No overlap: start a new interval
            merged.append([start, end])
    
    return merged


# ── Meeting Rooms II (Minimum Rooms) ──
import heapq

def min_meeting_rooms(intervals):
    if not intervals:
        return 0
    
    intervals.sort(key=lambda x: x[0])
    end_times = []  # min-heap of end times of ongoing meetings
    
    for start, end in intervals:
        # If earliest-ending meeting is done before this one starts, reuse room
        if end_times and end_times[0] <= start:
            heapq.heappop(end_times)
        
        heapq.heappush(end_times, end)
    
    return len(end_times)  # heap size = rooms in use


# ── Non-overlapping Intervals (Min Removals) ──
def erase_overlap_intervals(intervals):
    # Sort by END time — greedy: keep the one that ends earliest
    intervals.sort(key=lambda x: x[1])
    
    removals = 0
    prev_end = float('-inf')
    
    for start, end in intervals:
        if start >= prev_end:
            prev_end = end     # no overlap → keep this interval
        else:
            removals += 1      # overlap → remove this one (it ends later)
    
    return removals`,
    visual: `Merge Intervals: [[1,3], [2,6], [8,10], [15,18]]

Sorted:  [1,3] [2,6] [8,10] [15,18]

Step 1: merged = [[1,3]]
Step 2: [2,6] — start 2 ≤ end 3 → overlap! merged = [[1,6]]
Step 3: [8,10] — start 8 > end 6 → no overlap. merged = [[1,6],[8,10]]
Step 4: [15,18] — start 15 > end 10 → no overlap. merged = [[1,6],[8,10],[15,18]]

Meeting Rooms II: [[0,30],[5,10],[15,20]]

Sort by start: [0,30] [5,10] [15,20]

[0,30]:  heap = [30]     → 1 room
[5,10]:  5 < 30 → overlap, need new room. heap = [10,30] → 2 rooms
[15,20]: 15 ≥ 10 → reuse room. heap = [20,30] → still 2 rooms

Answer: 2`
  },
  {
    id: "bit-manipulation",
    cat: "Advanced",
    name: "Bit Manipulation",
    icon: "⊻",
    tc: "O(1) – O(n)",
    sc: "O(1)",
    tldr: "Operate on binary representations. XOR cancels duplicates (x^x=0). x&(x-1) drops the lowest set bit. Bitmasks encode subsets.",
    intuition: `Every integer is already stored as bits. Bit manipulation operates directly on this representation — no conversion needed.

The star operator is XOR (^):
• x ^ x = 0    (anything XOR itself is zero)
• x ^ 0 = x    (anything XOR zero is itself)
• XOR is associative and commutative

This is why "Single Number" works: XOR all elements. Duplicates cancel each other out (x^x=0), leaving only the unique element. [4, 1, 2, 1, 2] → 4^1^2^1^2 = 4^(1^1)^(2^2) = 4^0^0 = 4.

Useful bit tricks:
• x & (x-1) — drops the lowest set bit. Use in a loop to count set bits in O(number of set bits) instead of O(32).
• x & (-x) — isolates the lowest set bit. Useful for Binary Indexed Trees.
• (1 << n) - 1 — creates a mask of n 1-bits (like 0b1111 for n=4).
• x >> k & 1 — checks if bit k is set.

Bitmask DP: represent subsets as integers. If you have n items, a bitmask from 0 to 2^n-1 represents every possible subset. Check if item i is included: mask & (1 << i). Add item i: mask | (1 << i). This is how you solve TSP in O(n² × 2^n).`,
    when: [
      "Single Number variants (find element appearing once when others appear k times)",
      "Counting bits, power of two checks",
      "Enumerate subsets via bitmasks",
      "XOR tricks: missing number, find two unique numbers",
      "Bitmask DP: TSP, matching problems, subset enumeration",
    ],
    keyInsight: "x ^ x = 0 is the most important bit identity. It cancels duplicates, finds missing numbers, and detects unique elements. n & (n-1) == 0 checks if n is a power of 2 (exactly one bit set).",
    gotchas: [
      "Python integers have arbitrary precision — no overflow issues, but also no fixed-width behavior",
      "Negative numbers: Python uses arbitrary-width two's complement, so bit operations on negatives can be surprising",
      "XOR for 'two unique numbers': XOR all elements, then use any set bit to partition into two groups, XOR each group separately",
      "Bitmask DP: make sure n ≤ 20ish, since 2^n grows fast (2^20 ≈ 1 million, 2^25 ≈ 33 million)",
    ],
    problems: [
      { name: "Single Number", num: 136, diff: "Easy", why: "XOR all elements — duplicates cancel, unique remains" },
      { name: "Number of 1 Bits", num: 191, diff: "Easy", why: "Loop n &= n-1 and count — each iteration drops one set bit" },
      { name: "Missing Number", num: 268, diff: "Easy", why: "XOR all indices (0..n) with all elements — the missing number survives" },
      { name: "Counting Bits", num: 338, diff: "Easy", why: "dp[i] = dp[i & (i-1)] + 1 — dropping lowest bit gives you a subproblem you already solved" },
    ],
    code: `# ── Single Number ──
# Every element appears twice except one. Find it.
def single_number(nums):
    result = 0
    for num in nums:
        result ^= num  # duplicates cancel: x ^ x = 0
    return result


# ── Count Set Bits (Brian Kernighan's Algorithm) ──
def hamming_weight(n):
    count = 0
    while n:
        n &= n - 1   # drop the lowest set bit
        count += 1
    return count
    # Example: n = 13 = 1101
    # 1101 & 1100 = 1100 (dropped bit 0)  count=1
    # 1100 & 1011 = 1000 (dropped bit 2)  count=2
    # 1000 & 0111 = 0000 (dropped bit 3)  count=3


# ── Missing Number ──
# Array has n numbers from 0..n with one missing.
def missing_number(nums):
    result = len(nums)  # start with n (the largest index)
    for i, num in enumerate(nums):
        result ^= i ^ num
    return result
    # Why: XOR of [0,1,...,n] ^ XOR of nums = missing number


# ── Generate All Subsets via Bitmask ──
def subsets_bitmask(nums):
    n = len(nums)
    result = []
    
    for mask in range(1 << n):        # 0 to 2^n - 1
        subset = []
        for i in range(n):
            if mask & (1 << i):       # is bit i set?
                subset.append(nums[i])
        result.append(subset)
    
    return result
    # mask=0 (000): []
    # mask=1 (001): [nums[0]]
    # mask=2 (010): [nums[1]]
    # mask=3 (011): [nums[0], nums[1]]
    # ... etc.`,
    visual: `XOR cancellation:
  4 ^ 1 ^ 2 ^ 1 ^ 2
= 4 ^ (1 ^ 1) ^ (2 ^ 2)
= 4 ^    0    ^    0
= 4

Brian Kernighan (count bits of 13 = 1101):
  1101 & 1100 = 1100   count=1
  1100 & 1011 = 1000   count=2
  1000 & 0111 = 0000   count=3  → 13 has 3 set bits

Bitmask subsets of [a, b, c]:
  000 → []        100 → [c]
  001 → [a]       101 → [a,c]
  010 → [b]       110 → [b,c]
  011 → [a,b]     111 → [a,b,c]`
  },
  {
    id: "greedy",
    cat: "Advanced",
    name: "Greedy Algorithms",
    icon: "✦",
    tc: "Varies",
    sc: "Varies",
    tldr: "Make the locally optimal choice at each step, trusting it leads to the global optimum. Unlike DP, greedy never reconsiders past choices.",
    intuition: `DP explores ALL options and picks the best. Greedy picks what looks best RIGHT NOW and never looks back. It's faster, but only works when the "greedy choice property" holds — the locally optimal choice is always globally safe.

A classic example: coin change with denominations [25, 10, 5, 1]. To make 41 cents, greedily take the largest coin that fits: 25 + 10 + 5 + 1 = 4 coins. This works for US coins because of their specific denominations. But for coins [1, 3, 4] and target 6, greedy gives 4+1+1 = 3 coins, while optimal is 3+3 = 2 coins. Greedy fails here — you need DP.

How to recognize greedy problems:
1. Sorting + one pass usually yields the answer.
2. There's an obvious "local rule" that feels right (take the biggest, remove the smallest, schedule the earliest deadline).
3. The problem has "optimal substructure" — making one good choice still leaves a good subproblem.

How to prove greedy works (exchange argument): assume some optimal solution doesn't follow the greedy rule at some step. Show you can "exchange" that step for the greedy choice without worsening the solution. Therefore the greedy solution is optimal.

Jump Game is a great example: at each position, track the farthest you can reach. If your current position ever exceeds the farthest reachable, you're stuck. This works because reaching position i means you've already established you can reach everything before i.`,
    when: [
      "Activity selection / interval scheduling (sort by end time, always pick earliest)",
      "Jump Game: can you reach the end? what's the minimum jumps?",
      "Gas station: find the starting point for a circular route",
      "Partition labels: divide string so each letter appears in at most one partition",
      "Task assignment, scheduling problems, resource allocation",
    ],
    keyInsight: "If you can't prove greedy works, use DP. Many problems look greedy but aren't — coin change with arbitrary denominations, longest path, etc. When in doubt, try a counterexample.",
    gotchas: [
      "Not all 'optimization' problems are greedy — coin change with arbitrary denominations needs DP",
      "Greedy problems usually have a key insight that makes the greedy choice safe — find it and state it clearly",
      "Many greedy solutions start with sorting — this is a signal",
      "Jump Game: track the farthest reachable, don't actually simulate jumps",
    ],
    problems: [
      { name: "Jump Game", num: 55, diff: "Med", why: "Track farthest reachable position as you scan left to right" },
      { name: "Jump Game II", num: 45, diff: "Med", why: "BFS-like: track the current reachable range, increment jumps when you hit the boundary" },
      { name: "Gas Station", num: 134, diff: "Med", why: "If total gas ≥ total cost, solution exists. Start from where cumulative surplus is most negative" },
      { name: "Partition Labels", num: 763, diff: "Med", why: "Track last occurrence of each char. Extend current partition's end to include all last occurrences" },
      { name: "Task Scheduler", num: 621, diff: "Med", why: "Greedy: the most frequent task determines the frame. Fill in the gaps with other tasks" },
    ],
    code: `# ── Jump Game (Can you reach the end?) ──
def can_jump(nums):
    farthest = 0
    
    for i in range(len(nums)):
        if i > farthest:
            return False     # can't reach position i
        farthest = max(farthest, i + nums[i])
    
    return True


# ── Jump Game II (Minimum jumps) ──
# Think of it as BFS levels: each "jump" is a BFS level
def jump(nums):
    jumps = 0
    current_end = 0    # farthest we can reach with 'jumps' jumps
    farthest = 0       # farthest we can reach with 'jumps + 1' jumps
    
    for i in range(len(nums) - 1):  # don't need to jump FROM the last index
        farthest = max(farthest, i + nums[i])
        
        if i == current_end:   # we've explored everything in this "level"
            jumps += 1
            current_end = farthest
    
    return jumps


# ── Partition Labels ──
def partition_labels(s):
    # Step 1: last occurrence of each character
    last = {c: i for i, c in enumerate(s)}
    
    partitions = []
    start = 0
    end = 0
    
    # Step 2: extend partition end to include all last occurrences
    for i, c in enumerate(s):
        end = max(end, last[c])
        
        if i == end:  # all characters in this partition are contained
            partitions.append(end - start + 1)
            start = end + 1
    
    return partitions


# ── Gas Station ──
def can_complete_circuit(gas, cost):
    # If total gas < total cost, impossible
    if sum(gas) < sum(cost):
        return -1
    
    # Otherwise, find the starting station
    start = 0
    tank = 0
    
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1   # can't start from anywhere up to i
            tank = 0
    
    return start`,
    visual: `Jump Game II: nums = [2, 3, 1, 1, 4]

Position:  0  1  2  3  4
Value:     2  3  1  1  4

Jump 1 (from pos 0): can reach pos 1 or 2
  → farthest from {1,2} = max(1+3, 2+1) = 4

Jump 2: farthest reaches pos 4 (end!)

Answer: 2 jumps

Partition Labels: "ababcbacadefegdehijhklij"
  last: a→8, b→5, c→7, d→14, e→15, f→11, ...
  
  Scan: a(last=8) b(5) a(8) b(5) c(7) b(5) a(8) c(7) a(8)→i==end
        Partition 1: "ababcbaca" length=9
  
  Continue: d(14) e(15) f(11) e(15) g(13) d(14) e(15)→i==end
            Partition 2: "defegde" length=7
  
  Continue: h(19) i(22) j(23) h(19) k(20) l(21) i(22) j(23)→i==end
            Partition 3: "hijhklij" length=8
  
  Result: [9, 7, 8]`
  },
];

/* ───────────────────── STYLES ───────────────────── */
const CATS = ["Arrays & Strings", "Graphs & Trees", "Recursion & DP", "Advanced"];
const C = {
  "Arrays & Strings": { accent: "#60a5fa", dim: "#1e3a5f", glow: "rgba(96,165,250,0.08)" },
  "Graphs & Trees": { accent: "#34d399", dim: "#164e3a", glow: "rgba(52,211,153,0.08)" },
  "Recursion & DP": { accent: "#fbbf24", dim: "#5c4813", glow: "rgba(251,191,36,0.08)" },
  Advanced: { accent: "#f87171", dim: "#5c2020", glow: "rgba(248,113,113,0.08)" },
};
const DIFF = { Easy: "#4ade80", Med: "#fbbf24", Hard: "#f87171" };

export default function App() {
  const [page, setPage] = useState("index");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [page]);

  const algo = ALGOS.find((a) => a.id === page);

  const navItems = CATS.map((cat) => ({
    cat,
    items: ALGOS.filter((a) => a.cat === cat),
  }));

  return (
    <div style={{ display: "flex", height: "100vh", background: "#050b18", color: "#c9d1d9", fontFamily: "'IBM Plex Mono', 'Menlo', monospace", overflow: "hidden" }}>
      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "fixed", top: 12, left: 12, zIndex: 100,
          background: "#0d1b2a", border: "1px solid #1e293b", borderRadius: 8,
          color: "#94a3b8", padding: "8px 12px", cursor: "pointer", fontSize: 18,
          display: "none",
        }}
        className="mobile-menu-btn"
      >
        ☰
      </button>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=Crimson+Pro:wght@400;600;700&display=swap');
        @media (max-width: 768px) {
          .mobile-menu-btn { display: block !important; }
          .sidebar { position: fixed !important; z-index: 99; transform: ${sidebarOpen ? "translateX(0)" : "translateX(-100%)"}; transition: transform 0.2s; }
          .content-area { margin-left: 0 !important; }
        }
        .nav-item:hover { background: rgba(148,163,184,0.06) !important; }
        .problem-pill:hover { border-color: rgba(148,163,184,0.3) !important; }
        code { font-family: 'IBM Plex Mono', monospace !important; }
        pre::-webkit-scrollbar { height: 6px; }
        pre::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        .content-area::-webkit-scrollbar { width: 6px; }
        .content-area::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
      `}</style>

      {/* ── SIDEBAR ── */}
      <nav className="sidebar" style={{ width: 260, minWidth: 260, background: "#080f1e", borderRight: "1px solid #111a2e", overflowY: "auto", padding: "20px 0", flexShrink: 0 }}>
        <div
          onClick={() => { setPage("index"); setSidebarOpen(false); }}
          style={{ padding: "8px 20px 20px", cursor: "pointer", borderBottom: "1px solid #111a2e", marginBottom: 8 }}
        >
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", fontFamily: "'Crimson Pro', serif", letterSpacing: "0.5px" }}>
            DSA <span style={{ color: "#60a5fa" }}>Patterns</span>
          </div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{ALGOS.length} algorithms · Python</div>
        </div>

        {navItems.map(({ cat, items }) => (
          <div key={cat} style={{ marginBottom: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C[cat].accent, padding: "10px 20px 4px", letterSpacing: "1.5px", textTransform: "uppercase" }}>
              {cat}
            </div>
            {items.map((a) => (
              <div
                key={a.id}
                className="nav-item"
                onClick={() => { setPage(a.id); setSidebarOpen(false); }}
                style={{
                  padding: "7px 20px 7px 28px",
                  cursor: "pointer",
                  fontSize: 13,
                  color: page === a.id ? "#f1f5f9" : "#64748b",
                  background: page === a.id ? C[a.cat].glow : "transparent",
                  borderLeft: page === a.id ? `2px solid ${C[a.cat].accent}` : "2px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ marginRight: 8, fontSize: 14 }}>{a.icon}</span>
                {a.name}
              </div>
            ))}
          </div>
        ))}
      </nav>

      {/* ── CONTENT ── */}
      <main ref={contentRef} className="content-area" style={{ flex: 1, overflowY: "auto", padding: "32px 40px 80px" }}>
        {page === "index" ? (
          <IndexPage setPage={setPage} />
        ) : algo ? (
          <AlgoPage algo={algo} setPage={setPage} />
        ) : null}
      </main>
    </div>
  );
}

/* ── INDEX PAGE ── */
function IndexPage({ setPage }) {
  return (
    <div style={{ maxWidth: 780 }}>
      <h1 style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Crimson Pro', serif", color: "#f1f5f9", marginBottom: 4 }}>
        Data Structures & Algorithms
      </h1>
      <p style={{ color: "#64748b", fontSize: 14, marginTop: 0, marginBottom: 32 }}>
        {ALGOS.length} core patterns for FAANG / top-tier interviews — explained from first principles with Python implementations.
      </p>

      {CATS.map((cat) => (
        <div key={cat} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: C[cat].accent, letterSpacing: "1.5px", textTransform: "uppercase", margin: "0 0 10px" }}>
            {cat}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {ALGOS.filter((a) => a.cat === cat).map((a) => (
              <div
                key={a.id}
                onClick={() => setPage(a.id)}
                style={{
                  padding: "14px 16px",
                  background: "#0a1222",
                  border: "1px solid #141e30",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = C[cat].accent + "66")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#141e30")}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <span style={{ fontSize: 10, color: C[cat].accent, opacity: 0.7 }}>{a.tc}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginTop: 8 }}>{a.name}</div>
                <div style={{ fontSize: 11, color: "#475569", marginTop: 4, lineHeight: 1.4 }}>{a.tldr}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── ALGORITHM PAGE ── */
function AlgoPage({ algo, setPage }) {
  const col = C[algo.cat];
  const algoIdx = ALGOS.findIndex((a) => a.id === algo.id);
  const prev = algoIdx > 0 ? ALGOS[algoIdx - 1] : null;
  const next = algoIdx < ALGOS.length - 1 ? ALGOS[algoIdx + 1] : null;

  return (
    <div style={{ maxWidth: 760 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 11, color: col.accent, fontWeight: 600, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8 }}>{algo.cat}</div>
        <h1 style={{ fontSize: 32, fontWeight: 700, fontFamily: "'Crimson Pro', serif", color: "#f1f5f9", margin: 0, lineHeight: 1.2 }}>
          <span style={{ marginRight: 12 }}>{algo.icon}</span>
          {algo.name}
        </h1>
        <div style={{ display: "flex", gap: 16, marginTop: 10, fontSize: 12, color: "#64748b" }}>
          <span>Time: <span style={{ color: col.accent }}>{algo.tc}</span></span>
          <span>Space: <span style={{ color: col.accent }}>{algo.sc}</span></span>
        </div>
      </div>

      {/* TLDR */}
      <div style={{ padding: "14px 18px", background: col.glow, border: `1px solid ${col.accent}22`, borderRadius: 8, marginBottom: 28, fontSize: 14, lineHeight: 1.6, color: "#94a3b8" }}>
        {algo.tldr}
      </div>

      {/* Intuition */}
      <Section title="Intuition (from scratch)" color={col.accent}>
        <div style={{ whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.75, color: "#94a3b8" }}>
          {algo.intuition}
        </div>
      </Section>

      {/* Key Insight */}
      <Section title="Key Insight" color={col.accent}>
        <div style={{ padding: "12px 16px", borderLeft: `3px solid ${col.accent}`, background: `${col.accent}08`, fontSize: 14, lineHeight: 1.6, color: "#cbd5e1" }}>
          {algo.keyInsight}
        </div>
      </Section>

      {/* Visual */}
      {algo.visual && (
        <Section title="Visual Walkthrough" color={col.accent}>
          <pre style={{ background: "#0a0f1c", border: "1px solid #151f32", borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.6, color: "#7dd3fc", overflowX: "auto", margin: 0 }}>
            {algo.visual}
          </pre>
        </Section>
      )}

      {/* How to Spot */}
      <Section title="How to Spot This Pattern" color={col.accent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {algo.when.map((w, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
              <span style={{ color: col.accent, flexShrink: 0 }}>→</span>
              <span>{w}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Gotchas */}
      <Section title="Common Gotchas" color={col.accent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {algo.gotchas.map((g, i) => (
            <div key={i} style={{ display: "flex", gap: 10, fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}>
              <span style={{ color: "#f87171", flexShrink: 0 }}>⚠</span>
              <span>{g}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Key Problems */}
      <Section title="Key LeetCode Problems" color={col.accent}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {algo.problems.map((p, i) => (
            <div
              key={i}
              className="problem-pill"
              style={{
                padding: "10px 14px",
                background: "#0a1222",
                border: "1px solid #151f32",
                borderRadius: 8,
                transition: "border-color 0.2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
                  <span style={{ color: "#475569", marginRight: 6 }}>#{p.num}</span>
                  {p.name}
                </span>
                <span style={{ fontSize: 11, color: DIFF[p.diff], fontWeight: 600 }}>{p.diff}</span>
              </div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>{p.why}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Code */}
      <Section title="Python Implementation" color={col.accent}>
        <pre style={{ background: "#060d1b", border: "1px solid #111a2e", borderRadius: 8, padding: 20, fontSize: 13, lineHeight: 1.65, color: "#a5f3fc", overflowX: "auto", margin: 0 }}>
          <code>{algo.code}</code>
        </pre>
      </Section>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40, paddingTop: 20, borderTop: "1px solid #111a2e" }}>
        {prev ? (
          <button onClick={() => setPage(prev.id)} style={{ background: "none", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 16px", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            ← {prev.name}
          </button>
        ) : <div />}
        {next ? (
          <button onClick={() => setPage(next.id)} style={{ background: "none", border: "1px solid #1e293b", borderRadius: 8, padding: "8px 16px", color: "#94a3b8", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            {next.name} →
          </button>
        ) : <div />}
      </div>
    </div>
  );
}

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 12, fontWeight: 700, color, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  );
}
