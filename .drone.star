def main(ctx):
    return checkStarlark() + build() + deploy()

def checkStarlark():
    return [{
        "kind": "pipeline",
        "type": "docker",
        "name": "check-starlark",
        "steps": [
            {
                "name": "format-check-starlark",
                "image": "owncloudci/bazel-buildifier:latest",
                "commands": [
                    "buildifier --mode=check .drone.star",
                ],
            },
            {
                "name": "show-diff",
                "image": "owncloudci/bazel-buildifier:latest",
                "commands": [
                    "buildifier --mode=fix .drone.star",
                    "git diff",
                ],
                "when": {
                    "status": [
                        "failure",
                    ],
                },
            },
        ],
        "depends_on": [],
        "trigger": {
            "ref": [
                "refs/pull/**",
            ],
        },
    }]

def build():
    return [{
        "kind": "pipeline",
        "name": "build",
        "steps": [
            {
                "name": "install",
                "image": "owncloudci/nodejs:16",
                "pull": "always",
                "commands": ["yarn install --frozen-lockfile"],
            },
            {
                "name": "lint",
                "image": "owncloudci/nodejs:16",
                "pull": "always",
                "commands": [
                    "yarn run lint",
                ],
            },
            {
                "name": "build",
                "image": "owncloudci/nodejs:16",
                "pull": "always",
                "commands": ["yarn run build"],
            },
            {
                "name": "docker-dryrun",
                "image": "plugins/docker",
                "pull": "always",
                "settings": {
                    "dry_run": True,
                    "dockerfile": "docker/Dockerfile",
                    "registry": "registry.owncloud.com",
                    "repo": "registry.owncloud.com/internal/web-app-gpx-viewer",
                    "tags": "latest",
                },
                "when": {
                    "ref": [
                        "refs/pull/**",
                    ],
                },
            },
            {
                "name": "docker",
                "image": "plugins/docker",
                "pull": "always",
                "settings": {
                    "dockerfile": "docker/Dockerfile",
                    "registry": "registry.owncloud.com",
                    "repo": "registry.owncloud.com/internal/web-app-gpx-viewer",
                    "auto_tag": True,
                    "username": from_secret("registry_username"),
                    "password": from_secret("registry_password"),
                },
                "when": {
                    "ref": [
                        "refs/heads/main",
                        "refs/tags/*",
                    ],
                },
            },
        ],
        "depends_on": ["check-starlark"],
        "trigger": {
            "ref": ["refs/pull/**", "refs/heads/main", "refs/tags/**"],
        },
    }]

def deploy():
    return []

def from_secret(name):
    return {
        "from_secret": name,
    }
