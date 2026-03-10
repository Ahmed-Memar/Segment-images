if (condition) {
  const bodyMethods = ["POST", "PUT", "PATCH"];

  bodyMethods.forEach(method => {
    if (condition.includes(`request.verb = "${method}"`)) {
      hasBodyMethod = true;
    }
  });
}