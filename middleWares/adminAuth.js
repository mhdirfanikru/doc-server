import jwt from "jsonwebtoken";
const secret ="Admin"
export const adminVerification = (req, res, next) => {
  try {
    let adminAuthHeader = req.header("Authorization");

    if (!adminAuthHeader)
      return res.status(403).json({ error: "Access Denied" });

    const adminToken = adminAuthHeader.split(" ").pop();
    jwt.verify(adminToken, secret, (err, decoded) => {
      if (err) {
        console.log(err)
        return res.status(500).json({ error: "Authentication failed" });
      }
      req.decoded = decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
