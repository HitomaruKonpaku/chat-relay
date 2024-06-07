file=./dist/apps/$1/main.js

shift

if [ -f $file ]; then
  node $file $@
else
  echo "Command not found"
fi
