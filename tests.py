import os
import shutil
import unittest

import indexer


TEST_SNIPPET = 'test_snippet.md'
TEST_DIR = 'test'

SAMPLE_TEXT_PART1 = '''# Overview

TODO: Write a brief description of the problem being solved by this code.  Or what new functionality does this provide?

## Examples
- URL(s) to see this working in your site

'''

SAMPLE_TEXT_PART2 = '''# Solution

TODO: Write a brief description of the solution.  This could include:
- How does it work?
- Prerequisites or dependencies?
- URL(s) to see source code in context in your repository

## Installation instructions

TODO: Write steps for users to follow to implement this.  Skip the standard download/modify/zip/upload Primo view instructions.
'''

SAMPLE_INDEX_CONTENT = '''# Keyword Index

## --- A ---

## --- B ---
**Bugs:**
- [ucla/boolean_search.md](ucla/boolean_search.md)
- [uci/boolean_search.md](uci/boolean_search.md)


## --- C ---

## --- D ---

## --- E ---

## --- F ---

## --- G ---

## --- H ---
**HathiTrust:**
- [ucla/hathitrust.md](ucla/hathitrust.md)
- [ucsb/hathitrust2.md](ucsb/hathitrust2.md)


## --- I ---

## --- J ---

## --- K ---

## --- L ---

## --- M ---

## --- N ---

## --- O ---

## --- P ---

## --- Q ---

## --- R ---

## --- S ---
**Something:**
- [ucla/something.md](ucla/something.md)

**Something else:**
- [ucla/something_else.md](ucla/something_else.md)


## --- T ---

## --- U ---

## --- V ---

## --- W ---

## --- X ---

## --- Y ---

## --- Z ---
'''


class TestIndexer(unittest.TestCase):

	def create_one_test_file(self, keywords='', path=None):
		text = f'{SAMPLE_TEXT_PART1}{keywords}{SAMPLE_TEXT_PART2}'
		path = TEST_SNIPPET if path is None else path
		with open(path, 'w') as file:
			file.write(text)

	def create_test_dirs(self):
		dirs = []
		os.mkdir(TEST_DIR)
		for campus in indexer.CAMPUS_DIRS:
			dir = (os.path.join(TEST_DIR, campus))
			os.mkdir(dir)
			dirs.append(dir)
		return dirs

	def create_multiple_test_files(self, dirs):
		paths = []
		for dir in dirs:
			path = os.path.join(dir, TEST_SNIPPET)
			paths.append(path)
			keywords = f'## Keywords\n\n{os.path.split(dir)[1]}\n\n'
			self.create_one_test_file(keywords=keywords, path=path)
		return paths

	def tearDown(self):
		if os.path.exists(TEST_SNIPPET):
			os.remove(TEST_SNIPPET)
		if os.path.exists(TEST_DIR):
			shutil.rmtree(TEST_DIR)

	def test_extract_keywords_normal(self):
		text = '## Keywords\n\nranking, HathiTrust, ILL, "welcome screen", \'nav bar\', "advanced search" \n\n'
		self.create_one_test_file(text)
		result = indexer.extract_keywords(TEST_SNIPPET, indexer.PATTERN)
		expected = ['Ranking', 'HathiTrust', 'ILL', 'Welcome screen', 'Nav bar', 'Advanced search']
		self.assertEqual(result, expected)

	def test_extract_keywords_empty(self):
		self.create_one_test_file('')
		with self.assertRaises(Exception):
			indexer.extract_keywords(TEST_SNIPPET, indexer.PATTERN)

	def test_get_snippet_filepaths(self):
		dirs = self.create_test_dirs()
		paths = self.create_multiple_test_files(dirs)
		result = indexer.get_snippet_filepaths(dirs)
		self.assertEqual(result, paths)

	def test_build_index(self):
		dirs = self.create_test_dirs()
		paths = self.create_multiple_test_files(dirs)
		result, errors = indexer.build_index(paths, indexer.PATTERN)
		expected = {
			'Ucb': ['test/ucb/test_snippet.md'],
			'Ucd': ['test/ucd/test_snippet.md'],
			'Uci': ['test/uci/test_snippet.md'],
			'Ucla': ['test/ucla/test_snippet.md'],
			'Ucm': ['test/ucm/test_snippet.md'],
			'Ucr': ['test/ucr/test_snippet.md'],
			'Ucsb': ['test/ucsb/test_snippet.md'],
			'Ucsc': ['test/ucsc/test_snippet.md'],
			'Ucsd': ['test/ucsd/test_snippet.md'],
			'Ucsf': ['test/ucsf/test_snippet.md']
		}
		self.assertEqual(result, expected)

	def test_draft_index_content(self):
		index = {
			'Bugs': ['ucla/boolean_search.md', 'uci/boolean_search.md'],
			'HathiTrust': ['ucla/hathitrust.md', 'ucsb/hathitrust2.md'],
			'Something': ['ucla/something.md'],
			'Something else': ['ucla/something_else.md']
		}
		result = indexer.draft_index_content(index)
		self.assertEqual(result, SAMPLE_INDEX_CONTENT)
