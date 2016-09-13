const parseWeirdAPIGatewayFormat = input => {
  const sanitisedInput = input.replace(/[\{\}]/g, '');
  const output = {};
  sanitisedInput.split(/,/).forEach(parameterPairString => {
    const parameterPairArray = parameterPairString.trim().split(/=/);
    output[parameterPairArray[0]] = parameterPairArray.slice(1).join('=');
  });

  return output;
};

const parseQueryParams = input => {
  let result = input;
  if (typeof input !== 'object') {
    try {
      result = JSON.parse(input);
    } catch (e) {
      result = parseWeirdAPIGatewayFormat(input);
    }
  }

  return result;
};

export default parseQueryParams;
export { parseQueryParams };
