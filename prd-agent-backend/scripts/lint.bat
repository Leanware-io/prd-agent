autoflake --in-place --remove-all-unused-imports --remove-unused-variables --recursive --exclude env,venv,migrations,__init__.py .
isort . --skip venv --skip migrations --profile black
black . --exclude "venv|migrations|__init__.py"
pylint --recursive y api --ignore=venv,migrations --disable=missing-docstring
pylint --recursive y prd_agent --ignore=venv,migrations --disable=missing-docstring