stages:
  - test

test_pipeline:
  stage: test
  image: node:20
  script:
    - echo "Pipeline is running"
    - node --version
    - npm --version