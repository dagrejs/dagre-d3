# Fail on error
set -e
[ -n "$DEBUG"] && set -x

bail() {
    echo $1 >&2
    exit 1
}

# Initial config
PROJECT=dagre-d3
PROJECT_ROOT=`pwd`
BOWER_DIR=bower
DOC_DIR=doc
DIST_DIR=dist

# Check version. Is this a release? If not, finish immediately.
VERSION=$(node src/release/check-version.js || true)
[ -z "$VERSION" ] && echo "Not a release, skipping release process" && exit 0

echo Attemping to publish version: $VERSION

# Preflight checks
[ -z "`git tag -l v$VERSION`"] || (echo "Version already published. Skipping publish." && exit 0)
[ -n "`grep v$VERSION CHANGELOG.md`" ] || bail "ERROR: No entry for v$VERSION in CHANGELOG.md"
[ "`git rev-parse HEAD`" = "`git rev-parse master`" ] || bail "ERROR: You must release from the master branch"
[ -z "`git status --porcelain`" ] || bail "ERROR: Dirty index on working tree. Use git status to check"

# Set up git
git config --global user.email "cpettitt@gmail.com"
git config --global user.name "Chris Pettitt"
git remote rm origin
git remote add origin http://cpettitt:${GH_AUTH}@github.com/cpettitt/dagre-d3.git
git clone http://cpettitt:${GH_AUTH}@github.com/cpettitt/cpettitt.github.com.git $DOC_DIR
git clone http://cpettitt:${GH_AUTH}@github.com/cpettitt/dagre-d3-bower.git $BOWER_DIR

# Publish docs
echo Preparing to publish docs
cd $DOC_DIR
mkdir -p project/$PROJECT
TARGET=project/$PROJECT/latest
git rm -r $TARGET || true
cp -r $PROJECT_ROOT/$DIST_DIR $TARGET
git add $TARGET

TARGET=project/$PROJECT/v$VERSION
cp -r $PROJECT_ROOT/$DIST_DIR $TARGET
git add $TARGET

git ci -m "Publish docs for $PROJECT v$VERSION"
git push origin

cd $PROJECT_ROOT
echo Done with docs

# Publish bower
rm dagre-d3-bower/bower.json
rm -rf dagre-d3-bower/js

mkdir dagre-d3-bower/js

cp $DIST_DIR/bower.json dagre-d3-bower
cp $DIST_DIR/dagre-d3*.js dagre-d3-bower/js

cd dagre-d3-bower
git add -A
git commit -m "Publishing bower for $PROJECT v$VERSION"
git push -f origin master
git tag v$VERSION
git push origin v$VERSION
echo "Published dagre-d3 to dagre-d3-bower"
cd $PROJECT_ROOT

# Publish tag
git tag v$VERSION
git push origin
git push origin v$VERSION
echo Published dagre-d3 v$VERSION

# Publish to npm
npm publish
echo Published to npm

# Update patch level version + commit
node src/release/bump-version.js
make lib/version.js
git ci package.json lib/version.js -m "Bump version and set as pre-release"
git push origin
echo Updated patch version

echo Release complete!
