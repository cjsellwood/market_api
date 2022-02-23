import jsonwebtoken from "jsonwebtoken";

export default (userId: number) => {
  const payload = {
    sub: userId,
    iat: Date.now(),
  };
  const expiresIn = `${1000 * 60 * 60 * 24 * 7}`;
  const signedToken = jsonwebtoken.sign(payload, process.env.JWT_PRIVATE!, {
    expiresIn,
  });

  return {
    token: signedToken,
    expiresIn,
  };
};
