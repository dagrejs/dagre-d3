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
DOC_DIR=/tmp/dagre-d3-doc
DIST_DIR=dist

# Check version. Is this a release? If not abort
VERSION=$(node src/release/check-version.js)

echo Attemping to publish version: $VERSION

# Preflight checks
[ -z "`git tag -l v$VERSION`"] || bail "Version already published. Skipping publish."
[ "`git rev-parse HEAD`" = "`git rev-parse master`" ] || bail "ERROR: You must release from the master branch"
[ -z "`git status --porcelain`" ] || bail "ERROR: Dirty index on working tree. Use git status to check"

# Pull remote repos
rm -rf $DOC_DIR
git clone git@github.com:cpettitt/cpettitt.github.com.git $DOC_DIR

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

git commit -m "Publish docs for $PROJECT v$VERSION"
git push origin

cd $PROJECT_ROOT
echo Done with docs

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
git commit package.json lib/version.js -m "Bump version and set as pre-release"
git push origin
echo Updated patch version

echo Release complete!
