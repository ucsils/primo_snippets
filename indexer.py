import os
import re


CAMPUS_DIRS = ['ucb', 'ucd', 'uci', 'ucla', 'ucm', 'ucr', 'ucsb', 'ucsc', 'ucsd', 'ucsf']
PATTERN = re.compile('## Keywords\s+(.*)\s*\n# \w+\n', re.MULTILINE)
INDEX_FILE = 'KEYWORD_INDEX.md'


def extract_keywords(path, pattern):
    with open(path, 'r') as file:
        text = file.read()
    result = pattern.search(text)
    if result is None or len(result.groups()) < 1:
        raise Exception('Keywords section not found')
    terms = [t.strip(' \'"') for t in result.group(1).split(',')]
    return [f'{t[0].upper()}{t[1:]}' for t in terms]


def get_snippet_filepaths(dirs):
    paths = []
    for directory in dirs:
        for file in os.listdir(directory):
            if not file.endswith('.md'):
                continue
            path = os.path.join(directory, file)
            paths.append(path)
    return paths


def build_index(paths, pattern):
    index = {}
    errors = []
    for path in paths:
        try:
            keywords = extract_keywords(path, pattern)
            for term in keywords:
                if term not in index.keys():
                    index[term] = []
                index[term].append(path)
        except Exception as e:
            errors.append((path, e))
    return index, errors


def draft_index_content(index):
    terms = sorted(index.keys())
    text = '# Keyword Index\n'
    letter = 'A'
    while letter <= 'Z':
        text += f'\n## --- {letter} ---\n'
        while terms and terms[0][0] == letter:
            term = terms.pop(0)
            text += f'**{term}:**\n'
            for path in index[term]:
                text += f'- [{path}]({path})\n'
            else:
                text += '\n'
        letter = chr(ord(letter)+1)
    return text


def main():
    paths = get_snippet_filepaths(CAMPUS_DIRS)
    index, errors = build_index(paths, PATTERN)
    text = draft_index_content(index)
    with open(INDEX_FILE, 'w') as index_file:
        index_file.write(text)
    print('\nIndexing complete!')
    if len(errors) > 0:
        print(f'\nThe following files could not be indexed:')
        for error in errors:
            print(f' - {error[0]}: {error[1]}')
    print()


if __name__ == "__main__":
    main()
