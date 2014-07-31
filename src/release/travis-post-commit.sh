# Clone the repo
git clone http://cpettitt:${GH_AUTH}@github.com/cpettitt/dagre-d3-bower.git

# Clean it up
rm dagre-d3-bower/bower.json
rm -rf dagre-d3-bower/js

# Initialize content directories
mkdir dagre-d3-bower/js

# Copy files
cp dist/bower.json dagre-d3-bower
cp dist/dagre-d3*.js dagre-d3-bower/js

# Push to git!
cd dagre-d3-bower
git add -A
git commit -m "Saving dist from dagre-d3"
git push -f origin master
echo "Published dagre-d3 to dagre-d3-bower"
