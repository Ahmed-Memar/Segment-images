const classifyJwtAlgorithm = algorithm => {
  const value = (algorithm || '').trim().toUpperCase();

  const approved = [
    'HS256', 'HS384', 'HS512',
    'PS256', 'PS384', 'PS512',
    'ES256', 'ES384', 'ES512'
  ];

  const legacy = [
    'RS256', 'RS384', 'RS512'
  ];

  if (approved.includes(value)) {
    return { status: 'approved', family: value.slice(0, 2), value };
  }

  if (legacy.includes(value)) {
    return { status: 'legacy', family: value.slice(0, 2), value };
  }

  if (value === 'NONE') {
    return { status: 'forbidden', family: null, value };
  }

  return { status: 'unsupported', family: null, value };
};