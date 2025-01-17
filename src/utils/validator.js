const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

const validateAlias = (alias) => {
  const aliasRegex = /^[a-zA-Z0-9-_]+$/;
  return aliasRegex.test(alias);
};

module.exports = {
  validateUrl,
  validateAlias
};