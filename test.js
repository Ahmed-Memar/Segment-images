if (!algorithmValue) {
  console.log('NO ALGORITHM =>', policyName);

  errors.push({
    line: policyLine,
    column: policyColumn,
    message: `VerifyJWT policy "${policyName}" must define <Algorithm>.`
  });

  console.log('AFTER PUSH =>', policyName);
}
else {
   ...
}