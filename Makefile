
.PHONY: dev release

git_branch := $(shell git rev-parse --abbrev-ref HEAD)

ifeq ($(wildcard ./.env),./.env)
include .env
export $(shell sed 's/=.*//' .env)
endif

ifndef NPM_VERSION
  export NPM_VERSION=patch
endif

node_modules:
	npm install

dev: node_modules
	node example/server.js

npm.publish:
	git pull origin $(git_branch) --tags
	npm version ${NPM_VERSION}
	git push origin $(git_branch) --tags
	npm publish --access public

github.release: export REPOSITORY=aplazame/node-sdk
github.release: export PKG_VERSION=$(shell node -e "console.log('v'+require('./package.json').version);")
github.release: export RELEASE_URL=$(shell curl -s -X POST -H "Content-Type: application/json" -H "Authorization: Bearer ${GITHUB_TOKEN}" \
	-d '{"tag_name": "${PKG_VERSION}", "target_commitish": "$(git_branch)", "name": "${PKG_VERSION}", "body": "", "draft": false, "prerelease": false}' \
	-w '%{url_effective}' "https://api.github.com/repos/${REPOSITORY}/releases" )
github.release:
	@echo "\nhttps://github.com/${REPOSITORY}/releases/tag/${PKG_VERSION}\n"

release: npm.publish github.release