STDIN.binmode
input = STDIN.read
from = ARGV[0]
to = ARGV[1]
STDOUT.binmode
STDOUT.write(input.gsub(from, to))
