# !/bin/bash

(
  cd ./dist &&
  mkdir temp-css &&
  cd ./css &&
  find * -name '*.css' |
  xargs -I {} -n1 sh -c "sed -e 's/url(\/assets\//url(\/Vue-Player\/dist\/assets\//g' {} > ../temp-css/{} && mv ../temp-css/{} ./{}" &&
  rm -rf ../temp-css ||
  rm -rf ../temp-css
)

cp -f ./dist/index.html ./