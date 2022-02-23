import jsonwebtoken from "jsonwebtoken";

export default (userId: number) => {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000)
  }
  const signedToken = jsonwebtoken.sign(payload, process.env.JWT_PRIVATE!, {
    expiresIn: "7d",
  });

  return {
    token: signedToken,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
  };
};
