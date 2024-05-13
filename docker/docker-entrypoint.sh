file=./dist/apps/$1/main.js

if [ -f $file ]; then
  node $file
else
  echo "Command not found"
fi
