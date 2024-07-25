// utils/responseFormatter.js
const formatResponse = (status, code, data, message = null) => {
    return { status, code, data, message };
};

module.exports = formatResponse;
