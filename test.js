const classifyJwtAlgorithm = (algorithm) => {
  const value = (algorithm || '').trim().toUpperCase();

  const approvedRegex = /^(HS|PS|ES)(256|384|512)$/;
  const legacyRegex = /^RS(256|384|512)$/;

  if (approvedRegex.test(value)) {
    return { status: 'approved', family: value.slice(0, 2), value };
  }

  if (legacyRegex.test(value)) {
    return { status: 'legacy', family: 'RS', value };
  }

  if (value === 'NONE') {
    return { status: 'forbidden', family: null, value };
  }

  return { status: 'unsupported', family: null, value };
};