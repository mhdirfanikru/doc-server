import jwt from "jsonwebtoken";


const secret = "QuickDoc"
export const verifyToken = async (req, res, next) => {
  try {
    console.log("first")
    const authHeader = req.header("Authorization");

    if (!authHeader) {
      return res.status(403).json({ error: "Access Denied" });
    }

    const token = authHeader.split(" ").pop();

    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return res.status(200).json({ message: "Authentication failed" });
      }
      req.decoded = decoded;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
};
