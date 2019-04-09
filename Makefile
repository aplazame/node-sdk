
.PHONY: release

git_branch := $(shell git rev-parse --abbrev-ref HEAD)

ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

npm.publish:
	git pull --tags
	npm version ${NPM_VERSION}
	git push origin $(git_branch)
	git push --tags
	npm publish --access public

github.release: export REPOSITORY=aplazame/node-sdk
github.release: export PKG_VERSION=$(shell node -e "console.log('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/${REPOSITORY}/releases" )

release: npm.publish github.release
	# @echo ${RELEASE_URL}
	@echo "\nhttps://github.com/${REPOSITORY}/releases/tag/${PKG_VERSION}\n"