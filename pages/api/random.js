// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
    // Next.js API route support: https://nextjs.org/docs/api-routes/introduction
    let number = ("000000" + Math.floor(Math.random() * 1000000)).slice(-6);
    res.status(200).json({ value: number })
}
  