Why the editor shows "Context access might be invalid" in GitHub Actions workflow files

The YAML language server used by some IDEs validates workflow files and may not be able to statically prove that certain runtime contexts (for example `secrets` or `github.event.inputs`) exist. This can cause warnings such as:

  Context access might be invalid: PG_CONNECTION_STRING

These warnings are editor/linter hints only. They do not indicate a runtime problem in GitHub Actions itself. The workflows in `.github/workflows/*` are valid and will run on GitHub where `secrets` and `github.event.inputs` are available.

What we changed

- Added a workspace `.vscode/settings.json` that maps `.github/workflows/*` to the official GitHub Actions JSON schema (https://json.schemastore.org/github-workflow.json). This reduces many false-positive YAML diagnostics in editors that respect workspace settings.

Recommended actions for contributors

- If you still see the warnings locally, you can:
  - Update your editor's YAML extension (some older versions produce more false positives).
  - Accept the warnings as harmless for these workflow files.
  - If you prefer not to commit workspace settings, revert the `.vscode/settings.json` commit and keep the mapping locally.

If you'd like, I can open a follow-up PR that disables the YAML context warnings specifically (via editor settings), but that is a local/IDE-level workaround and may hide real YAML errors.
